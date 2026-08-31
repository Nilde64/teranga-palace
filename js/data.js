/* ============================= DATA LAYER (LocalStorage + IndexedDB + Supabase) ============================= */
const DB_VERSION = "tp-v1";
const LS_KEY = "teranga_palace_db";

function loadDB() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) { const parsed = JSON.parse(raw); if (parsed.version === DB_VERSION) return parsed; }
  } catch (e) { console.warn("Lecture LocalStorage impossible, réinitialisation.", e); }
  const fresh = seedDB();
  persist(fresh);
  return fresh;
}
/* Écrit uniquement le cache local (LocalStorage), sans toucher à Supabase.
   Les photos "lourdes" en base64 ne sont jamais incluses ici (elles vivent
   dans IndexedDB) ; un chemin statique léger (ex: assets/images/xxx.svg)
   reste stocké normalement. */
function cacheLocally(db) {
  const light = {
    ...db,
    chambres: db.chambres.map(c => {
      if (c.photo && typeof c.photo === "string" && c.photo.startsWith("data:image")) {
        const { photo, ...rest } = c;
        return rest;
      }
      return c;
    })
  };
  localStorage.setItem(LS_KEY, JSON.stringify(light));
}
/* Sauvegarde locale (toujours) + réplication vers Supabase en tâche de fond si configuré
   (js/supabase-config.js). Si Supabase échoue (hors-ligne, pas encore configuré...), les
   données restent quand même en sécurité localement — comportement inchangé par rapport à avant. */
function persist(db) {
  try {
    cacheLocally(db);
    if (window.sb) { pushDBToSupabase(db).catch(e => console.error("Synchronisation Supabase (écriture) échouée", e)); }
    return true;
  } catch (e) {
    console.error("Erreur de sauvegarde", e);
    if (typeof toast === "function") {
      toast("Stockage saturé", "Impossible d'enregistrer : l'espace de stockage du navigateur est plein.", true);
    } else {
      alert("Stockage saturé : impossible d'enregistrer les données.");
    }
    return false;
  }
}
function save() { return persist(DB); }

/* ---- Réplication Supabase (base partagée entre tous les navigateurs/appareils) ---- */
/* Association clé JS (tableau dans DB) -> [table Postgres, clé primaire] */
const SB_TABLES = {
  clients: ["clients", "idClient"],
  chambres: ["chambres", "numeroChambre"],
  users: ["users", "email"],
  reservations: ["reservations", "id"],
  sejours: ["sejours", "idSejour"],
  paiements: ["paiements", "idPaiement"],
  factures: ["factures", "numeroFacture"]
};

/* Compte, par ligne (table+clé primaire), le nombre d'échecs consécutifs d'envoi
   vers Supabase. Sert à distinguer un simple aléa réseau (on continue de réessayer,
   c'est le rôle normal de la synchro) d'une ligne durablement invalide côté serveur
   (contrainte violée à chaque tentative : ID corrompu, doublon, référence orpheline...).
   Sans ce compteur, une telle ligne reste "en attente" indéfiniment : elle échoue à
   chaque persist()/sync (toutes les 30s + à chaque sauvegarde), pollue la console
   pour toujours, et — via le filet de sécurité "localOnly" de syncFromSupabase — n'est
   jamais nettoyée puisqu'elle ne réussit jamais à disparaître du côté serveur.
   Conservé en LocalStorage (pas seulement en mémoire) : sinon un simple rechargement
   de page remet le compteur d'échecs à zéro et une ligne invalide peut ne jamais
   atteindre le seuil si l'utilisateur recharge la page entre deux tentatives. */
const SB_FAILURES_KEY = "teranga_palace_sb_failures";
function loadPushFailures() { try { return JSON.parse(localStorage.getItem(SB_FAILURES_KEY) || "{}"); } catch (e) { return {}; } }
function savePushFailures(f) { try { localStorage.setItem(SB_FAILURES_KEY, JSON.stringify(f)); } catch (e) { } }
const SB_PUSH_FAILURES = loadPushFailures();
const SB_MAX_PUSH_ATTEMPTS = 3;

/* Retire définitivement une ligne durablement invalide de la base locale (elle n'a
   jamais pu être acceptée par Supabase, qui reste la source de vérité) : on log un
   avertissement clair une seule fois, on met à jour le cache local, et on rafraîchit
   l'affichage si besoin — plutôt que de laisser l'erreur se répéter à l'infini. */
function quarantineRow(db, jsKey, pk, badValue, error) {
  const before = (db[jsKey] || []).length;
  db[jsKey] = (db[jsKey] || []).filter(r => r[pk] !== badValue);
  if (db[jsKey].length !== before) {
    console.warn(`Ligne abandonnée après ${SB_MAX_PUSH_ATTEMPTS} échecs de synchronisation (donnée invalide côté serveur) — table "${jsKey}", ${pk}=${badValue}.`, error);
    cacheLocally(db);
    if (typeof render === "function") render();
  }
}

/* Pousse l'état local vers Supabase : upsert de chaque ligne, puis suppression côté
   distant de tout ce qui n'existe plus localement (miroir complet, simple et fiable). */
async function pushDBToSupabase(db) {
  if (!window.sb) return;
  for (const [jsKey, [table, pk]] of Object.entries(SB_TABLES)) {
    const rows = db[jsKey] || [];
    try {
      if (rows.length) {
        const clean = rows.map(r => {
          const sane = sanitizeForSupabase(r, jsKey);
          return jsKey === "chambres" ? (({ photo, ...rest }) => rest)(sane) : sane;
        });
        // Envoi ligne par ligne plutôt qu'en un seul lot groupé : si une ligne est
        // refusée par une contrainte côté serveur (ex: le trigger anti-chevauchement
        // qui détecte un conflit sur une donnée ancienne), SEULE cette ligne échoue —
        // au lieu de bloquer la synchronisation de toutes les autres lignes, valides,
        // de la table à chaque cycle, indéfiniment.
        for (const row of clean) {
          const failKey = table + ":" + row[pk];
          const { error } = await window.sb.from(table).upsert(row, { onConflict: pk });
          if (error) {
            console.error("Supabase upsert", table, row[pk], error);
            SB_PUSH_FAILURES[failKey] = (SB_PUSH_FAILURES[failKey] || 0) + 1;
            savePushFailures(SB_PUSH_FAILURES);
            if (SB_PUSH_FAILURES[failKey] >= SB_MAX_PUSH_ATTEMPTS) {
              delete SB_PUSH_FAILURES[failKey];
              savePushFailures(SB_PUSH_FAILURES);
              quarantineRow(db, jsKey, pk, row[pk], error);
            }
          } else if (SB_PUSH_FAILURES[failKey]) {
            delete SB_PUSH_FAILURES[failKey];
            savePushFailures(SB_PUSH_FAILURES);
          }
        }
      }
      const { data: remoteRows, error: selErr } = await window.sb.from(table).select(pk);
      if (!selErr && remoteRows) {
        const localIds = new Set((db[jsKey] || []).map(r => r[pk]));
        const toDelete = remoteRows.map(r => r[pk]).filter(id => !localIds.has(id));
        if (toDelete.length) {
          const { error: delErr } = await window.sb.from(table).delete().in(pk, toDelete);
          if (delErr) console.error("Supabase delete", table, delErr);
        }
      }
    } catch (e) { console.error("Supabase sync (écriture) — table", table, e); }
  }
}

/* Recalcule les compteurs locaux (numérotation des réservations/séjours/paiements/factures)
   à partir du maximum réellement présent côté Supabase, pour limiter le risque de collision
   d'identifiants entre deux navigateurs différents créant des entrées en parallèle. */
// Aucun compteur ne devrait raisonnablement dépasser ce seuil dans ce projet (examen /
// usage pédagogique) : sert à repérer, sans ambiguïté, un ID corrompu par l'ancien bug
// de concaténation (ex: "TP-2026-20262026202600110") plutôt qu'un vrai numéro de séquence.
// Un tel ID a beau respecter le format attendu (préfixe + chiffres), le nombre qu'il
// contient est absurde et ne doit JAMAIS entrer dans le calcul du "vrai maximum" —
// sinon le compteur repart corrompu à chaque recalcul, indéfiniment.
const MAX_PLAUSIBLE_SEQ = 999999;
function recomputeCounters() {
  // Ne prend que les chiffres en fin d'identifiant (le vrai numéro de séquence),
  // jamais tous les chiffres du texte : un ID comme "TP-2026-00111" contient déjà
  // "2026" dans son préfixe, donc un simple retrait de tout ce qui n'est pas un
  // chiffre fusionnerait "2026" et "00111" en un grand nombre absurde (202600111),
  // qui grossirait ensuite indéfiniment à chaque resynchronisation.
  const seq = (row, idField) => {
    const match = String(row[idField] || "").match(/(\d+)$/);
    const n = match ? parseInt(match[1], 10) : NaN;
    return (!isNaN(n) && n <= MAX_PLAUSIBLE_SEQ) ? n : NaN;
  };
  // Retire immédiatement (avant même le calcul du maximum) toute ligne dont le numéro
  // de séquence est implausible : un tel ID est corrompu à coup sûr, ça ne sert à rien
  // d'attendre 3 échecs Supabase pour le constater (voir SB_MAX_PUSH_ATTEMPTS) — et le
  // laisser en place fausserait le calcul du "vrai maximum" ci-dessous à chaque appel.
  const purgeImplausible = (rows, idField, jsKey) => (rows || []).filter(r => {
    const match = String(r[idField] || "").match(/(\d+)$/);
    const n = match ? parseInt(match[1], 10) : NaN;
    const bad = !isNaN(n) && n > MAX_PLAUSIBLE_SEQ;
    if (bad) console.warn(`Ligne corrompue retirée localement (numéro de séquence implausible) — table "${jsKey}", ${idField}=${r[idField]}.`);
    return !bad;
  });
  DB.clients = purgeImplausible(DB.clients, "idClient", "clients");
  DB.reservations = purgeImplausible(DB.reservations, "id", "reservations");
  DB.sejours = purgeImplausible(DB.sejours, "idSejour", "sejours");
  DB.paiements = purgeImplausible(DB.paiements, "idPaiement", "paiements");
  DB.factures = purgeImplausible(DB.factures, "numeroFacture", "factures");
  const maxNum = (rows, idField) => rows.reduce((m, r) => {
    const n = seq(r, idField);
    return isNaN(n) ? m : Math.max(m, n);
  }, 0);
  // Filet de sécurité anti-corruption additionnel : si un compteur local est resté
  // absurde malgré ce qui précède, on ne lui fait plus jamais confiance — on repart du
  // vrai maximum observé dans les données (déjà purgées ci-dessus). Le simple Math.max()
  // d'origine ne pouvait qu'aggraver un compteur déjà corrompu, jamais le réparer.
  const sanitizeCounter = (current, maxN) => {
    const base = maxN + 1;
    if (!Number.isFinite(current) || current > base + 100000) return base;
    return Math.max(current || 1, base);
  };
  DB.counters.client = sanitizeCounter(DB.counters.client, maxNum(DB.clients, "idClient"));
  DB.counters.reservation = sanitizeCounter(DB.counters.reservation, maxNum(DB.reservations, "id"));
  DB.counters.sejour = sanitizeCounter(DB.counters.sejour, maxNum(DB.sejours, "idSejour"));
  DB.counters.paiement = sanitizeCounter(DB.counters.paiement, maxNum(DB.paiements, "idPaiement"));
  DB.counters.facture = sanitizeCounter(DB.counters.facture, maxNum(DB.factures, "numeroFacture"));
}

/* Empreinte légère des tables partagées (sans les photos, jamais synchronisées ici),
   utilisée pour détecter si une synchronisation a réellement changé quelque chose. */
function sbSnapshot() {
  const snap = {};
  for (const jsKey of Object.keys(SB_TABLES)) {
    snap[jsKey] = jsKey === "chambres"
      ? (DB.chambres || []).map(({ photo, ...rest }) => rest)
      : DB[jsKey];
  }
  return JSON.stringify(snap);
}

/* Filet de sécurité : si un jour le schéma SQL est recréé avec des noms de colonnes
   qui ne respectent pas exactement la casse attendue (ex: "numerochambre" au lieu de
   "numeroChambre", parce qu'une requête SQL a été écrite sans guillemets — Postgres
   met alors tout en minuscules), on retombe quand même sur nos pattes ici au lieu
   d'afficher silencieusement "undefined"/"NaN" partout dans l'interface. */
const SB_EXPECTED_KEYS = {
  clients: ["idClient", "nom", "prenom", "telephone", "email", "adresse"],
  chambres: ["numeroChambre", "type", "prixParNuit", "capacite", "statut", "description", "photo", "hasPhoto"],
  users: ["email", "password", "role", "idClient"],
  reservations: ["id", "idClient", "numeroChambre", "dateArrivee", "dateDepart", "nbPersonnes", "montant", "statut", "dateCreation"],
  sejours: ["idSejour", "idReservation", "idClient", "numeroChambre", "dateArriveeReelle", "dateDepartReelle", "montantTotal", "statut", "presenceSignalee", "dateSignalement"],
  paiements: ["idPaiement", "idSejour", "datePaiement", "montant", "modePaiement"],
  factures: ["numeroFacture", "idSejour", "dateFacture", "montantTotal", "statut"]
};
function normalizeRow(row, jsKey) {
  const expected = SB_EXPECTED_KEYS[jsKey];
  if (!expected) return row;
  const lower = {};
  Object.keys(row).forEach(k => { lower[k.toLowerCase()] = row[k]; });
  const out = { ...row };
  expected.forEach(k => {
    if (out[k] === undefined && lower[k.toLowerCase()] !== undefined) out[k] = lower[k.toLowerCase()];
  });
  // Ne jamais laisser traîner la variante en minuscules une fois l'alias posé :
  // sinon l'objet repart avec les deux clés (ex: "idclient" ET "idClient"), ce qui
  // fait échouer (erreur 400) la prochaine écriture vers Supabase, dont le schéma
  // actuel utilise des colonnes entre guillemets ("idClient", "numeroChambre"...).
  expected.forEach(k => {
    const lowerKey = k.toLowerCase();
    if (lowerKey !== k && lowerKey in out) delete out[lowerKey];
  });
  return out;
}

/* Ne garde que les colonnes réellement attendues par le schéma Supabase actuel avant
   tout envoi. Sert de filet de sécurité définitif contre la pollution de clés (ex:
   une ancienne copie de DB.clients en LocalStorage qui contiendrait encore à la fois
   "idclient" et "idClient") : même dans ce cas, seule la bonne colonne est envoyée. */
// Valeurs de repli pour les colonnes qui doivent toujours être présentes avec une
// vraie valeur (jamais absentes) : un envoi Supabase mélange souvent, dans le même
// lot, des lignes qui ont explicitement ce champ et d'autres qui ne l'ont jamais eu
// (ex: un ancien séjour créé avant l'ajout d'une colonne) — dans ce cas, les lignes
// sans la clé reçoivent NULL pour cette colonne plutôt que sa valeur par défaut SQL,
// ce qui casse tout envoi groupé si la colonne est "not null".
const SB_DEFAULTS = {
  sejours: { presenceSignalee: false },
};

/* Ne garde que les colonnes réellement attendues par le schéma Supabase actuel avant
   tout envoi. Sert de filet de sécurité définitif contre la pollution de clés (ex:
   une ancienne copie de DB.clients en LocalStorage qui contiendrait encore à la fois
   "idclient" et "idClient") : même dans ce cas, seule la bonne colonne est envoyée. */
function sanitizeForSupabase(row, jsKey) {
  const expected = SB_EXPECTED_KEYS[jsKey];
  if (!expected) return row;
  const out = {};
  const defaults = SB_DEFAULTS[jsKey] || {};
  expected.forEach(k => {
    if (row[k] !== undefined) out[k] = row[k];
    else if (k in defaults) out[k] = defaults[k];
  });
  return out;
}

/* Récupère l'état complet depuis Supabase et remplace les données locales — c'est ce qui
   permet à la réception de voir une réservation faite depuis un autre navigateur.
   L'événement tp-data-synced (qui déclenche un re-rendu complet de la page) n'est émis
   que si quelque chose a réellement changé : sinon, avec le Realtime qui peut renvoyer
   l'écho de nos propres écritures quasi instantanément, la page se reconstruirait en
   boucle pour rien (effet de "bégaiement" à l'écran, y compris pendant la saisie). */
let SB_SYNCING = false;
async function syncFromSupabase() {
  if (!window.sb || SB_SYNCING) return;
  SB_SYNCING = true;
  try {
    const before = sbSnapshot();
    const entries = Object.entries(SB_TABLES);
    const results = await Promise.all(entries.map(([, [table]]) => window.sb.from(table).select("*")));
    const photosByRoom = {};
    DB.chambres.forEach(c => { if (c.photo) photosByRoom[c.numeroChambre] = c.photo; });
    entries.forEach(([jsKey, [, pk]], i) => {
      const { data, error } = results[i];
      if (error) { console.error("Supabase sync (lecture) — table", jsKey, error); return; }
      if (!data) return;
      // Garde-fou : si Supabase renvoie une table vide alors qu'on a déjà des données
      // locales, on ne les efface pas (évite un écrasement total si la base distante
      // n'est pas encore initialisée ou a été réinitialisée par erreur).
      if (data.length === 0 && (DB[jsKey] || []).length > 0) return;
      const normalized = data.map(r => normalizeRow(r, jsKey));
      // Garde-fou : une ligne tout juste créée localement (ex: nouveau client lors
      // d'une inscription, réservation qui vient d'être confirmée) peut ne pas encore
      // être remontée par Supabase au moment précis de cette lecture — la propagation
      // de l'écriture précédente n'a pas forcément eu le temps de se terminer. On la
      // garde le temps qu'elle apparaisse côté serveur, au lieu de la faire disparaître
      // de la mémoire locale (ce qui viderait par exemple les infos du client en cours
      // de réservation).
      const remoteIds = new Set(normalized.map(r => r[pk]));
      const localOnly = (DB[jsKey] || []).filter(r => !remoteIds.has(r[pk]));
      const merged = normalized.concat(localOnly);
      DB[jsKey] = jsKey === "chambres"
        ? merged.map(c => ({ ...c, photo: photosByRoom[c.numeroChambre] || c.photo || null }))
        : merged;
    });
    recomputeCounters();
    const expired = autoExpireNoShows(); // peut faire passer certaines réservations en No-show (voir plus haut)
    if (!expired) cacheLocally(DB); // sinon autoExpireNoShows() s'en est déjà chargé (cache + réplication Supabase)
    if (sbSnapshot() !== before) {
      window.dispatchEvent(new Event("tp-data-synced"));
    }
  } catch (e) {
    console.error("Synchronisation Supabase (lecture) échouée", e);
  } finally {
    SB_SYNCING = false;
  }
}

/* ---- Photos de chambre : stockées dans IndexedDB (quota bien plus grand que LocalStorage) ---- */
let PHOTOS_IDB = null;
function openPhotosDB() {
  return new Promise((resolve, reject) => {
    if (PHOTOS_IDB) return resolve(PHOTOS_IDB);
    if (!window.indexedDB) { reject(new Error("indexeddb-unavailable")); return; }
    const req = indexedDB.open("teranga_palace_photos", 1);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("photos")) db.createObjectStore("photos");
    };
    req.onsuccess = () => { PHOTOS_IDB = req.result; resolve(PHOTOS_IDB); };
    req.onerror = () => reject(req.error);
  });
}
function idbSetPhoto(numero, dataUrl) {
  return openPhotosDB().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction("photos", "readwrite");
    tx.objectStore("photos").put(dataUrl, numero);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  }));
}
function idbGetPhoto(numero) {
  return openPhotosDB().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction("photos", "readonly");
    const req = tx.objectStore("photos").get(numero);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  }));
}
function idbDeletePhoto(numero) {
  return openPhotosDB().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction("photos", "readwrite");
    tx.objectStore("photos").delete(numero);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  }));
}

/* Au démarrage : migre les anciennes photos encore en base64 dans LocalStorage vers IndexedDB,
   puis recharge en mémoire (DB.chambres[].photo) les photos déjà migrées, pour un affichage inchangé
   dans le reste du code (roomRows, roomCard, etc. continuent de lire c.photo normalement). */
let PHOTOS_HYDRATED = false;
async function hydratePhotos() {
  let migratedFromLocalStorage = false;
  for (const c of DB.chambres) {
    if (c.photo && typeof c.photo === "string" && c.photo.startsWith("data:image")) {
      try {
        await idbSetPhoto(c.numeroChambre, c.photo);
        c.hasPhoto = true;
        migratedFromLocalStorage = true;
      } catch (e) { console.error("Migration photo échouée pour", c.numeroChambre, e); }
    } else if (c.hasPhoto && !c.photo) {
      try {
        const data = await idbGetPhoto(c.numeroChambre);
        if (data) c.photo = data;
      } catch (e) { console.error("Chargement photo échoué pour", c.numeroChambre, e); }
    }
  }
  PHOTOS_HYDRATED = true;
  if (migratedFromLocalStorage) persist(DB); // écrit désormais la version allégée (sans base64) en LocalStorage
  window.dispatchEvent(new Event("tp-photos-hydrated")); // signale aux pages (SPA publique/admin, dashboard) de se rafraîchir
}

function compressImage(file, maxDim, quality) {
  maxDim = maxDim || 800;
  quality = quality || 0.72;
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read-failed"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("decode-failed"));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width >= height) { height = Math.round(height * (maxDim / width)); width = maxDim; }
          else { width = Math.round(width * (maxDim / height)); height = maxDim; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

/* Fichier illustration générique par type de chambre (toujours présent, garantit un visuel) */
function roomTypeIllustration(type) {
  const slug = type === "Suite" ? "suite" : type === "Double" ? "double" : "simple";
  return "assets/images/chambre-" + slug + ".svg";
}
/* Balise <img> avec cascade : vraie photo en mémoire (uploadée dans CE navigateur) →
   fichier réel exporté par le manager et commité dans le repo (assets/images/chambre-<numero>.jpg,
   .jpeg ou .png) → illustration générique par type (filet de sécurité, toujours disponible). */
function roomImageTag(c, styleAttr) {
  const fallbackType = roomTypeIllustration(c.type);
  if (c.photo) {
    return `<img src="${c.photo}" style="${styleAttr}" onerror="this.onerror=null;this.src='${fallbackType}';">`;
  }
  const staticJpg = "assets/images/chambre-" + c.numeroChambre + ".jpg";
  return `<img src="${staticJpg}" style="${styleAttr}" onerror="this.onerror=null;this.src='${fallbackType}';">`;
}

/* Exporte les vraies photos ajoutées par le gestionnaire (dans CE navigateur) sous forme de
   fichiers téléchargés "chambre-<numero>.jpg" — à déposer ensuite dans assets/images/ du projet
   puis committer/pousser, pour qu'elles deviennent visibles par tous les visiteurs du site déployé. */
async function exportRealRoomPhotos() {
  let count = 0;
  for (const c of DB.chambres) {
    let dataUrl = null;
    if (c.photo && typeof c.photo === "string" && c.photo.startsWith("data:image")) {
      dataUrl = c.photo;
    } else if (c.hasPhoto) {
      try { dataUrl = await idbGetPhoto(c.numeroChambre); } catch (e) { /* photo introuvable, on l'ignore */ }
    }
    if (dataUrl) {
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "chambre-" + c.numeroChambre + ".jpg";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      count++;
      await new Promise(r => setTimeout(r, 250)); // espace les téléchargements pour éviter un blocage navigateur
    }
  }
  return count;
}

function pad(n, l) { return String(n).padStart(l, "0"); }
function todayStr() { return new Date().toISOString().slice(0, 10); }
function nightsBetween(a, b) { const d = (new Date(b) - new Date(a)) / 86400000; return Math.max(0, Math.round(d)); }
function fmtMoney(n) { return Math.round(n).toLocaleString("fr-FR") + " FCFA"; }
function fmtDate(s) { if (!s) return "—"; const d = new Date(s); return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }); }
function monthKey(s) { return s.slice(0, 7); }
function monthLabel(key) { const [y, m] = key.split("-"); const noms = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"]; return noms[parseInt(m, 10) - 1] + " " + y.slice(2); }

function seedDB() {
  const clients = [
    { idClient: "CL-001", nom: "Diallo", prenom: "Sophie", telephone: "+221 77 123 45 67", email: "sophie.diallo@example.com", adresse: "Mermoz, Dakar" },
    { idClient: "CL-002", nom: "Ndiaye", prenom: "Moussa", telephone: "+221 76 234 56 78", email: "moussa.ndiaye@example.com", adresse: "Almadies, Dakar" },
    { idClient: "CL-003", nom: "Faye", prenom: "Aïda", telephone: "+221 78 345 67 89", email: "aida.faye@example.com", adresse: "Point E, Dakar" },
    { idClient: "CL-004", nom: "Martin", prenom: "Julien", telephone: "+33 6 12 34 56 78", email: "julien.martin@example.com", adresse: "Lyon, France" },
    { idClient: "CL-005", nom: "Sow", prenom: "Fatou", telephone: "+221 70 456 78 90", email: "fatou.sow@example.com", adresse: "Yoff, Dakar" },
    { idClient: "CL-006", nom: "Camara", prenom: "Ibrahima", telephone: "+221 77 567 89 01", email: "ibrahima.camara@example.com", adresse: "Ouakam, Dakar" },
  ];
  const chambres = [
    { numeroChambre: "101", type: "Simple", prixParNuit: 35000, capacite: 1, statut: "Disponible", description: "Chambre lumineuse avec vue jardin, idéale pour un séjour d'affaires.", photo: null },
    { numeroChambre: "102", type: "Simple", prixParNuit: 35000, capacite: 1, statut: "Disponible", description: "Chambre épurée, bureau de travail et literie premium.", photo: null },
    { numeroChambre: "103", type: "Simple", prixParNuit: 38000, capacite: 1, statut: "Maintenance", description: "Chambre en cours de rénovation de la salle de bain.", photo: null },
    { numeroChambre: "201", type: "Double", prixParNuit: 55000, capacite: 2, statut: "Disponible", description: "Chambre spacieuse avec balcon donnant sur la piscine.", photo: null },
    { numeroChambre: "202", type: "Double", prixParNuit: 58000, capacite: 2, statut: "Disponible", description: "Ambiance chaleureuse, décoration inspirée de l'artisanat sénégalais.", photo: null },
    { numeroChambre: "203", type: "Double", prixParNuit: 55000, capacite: 2, statut: "Disponible", description: "Chambre calme côté cour intérieure, idéale pour couples.", photo: null },
    { numeroChambre: "301", type: "Suite", prixParNuit: 95000, capacite: 4, statut: "Disponible", description: "Suite avec salon privé et vue panoramique sur la baie de Dakar.", photo: null },
    { numeroChambre: "302", type: "Suite", prixParNuit: 110000, capacite: 4, statut: "Disponible", description: "Suite Présidentielle, terrasse privative et jacuzzi.", photo: null },
    { numeroChambre: "104", type: "Simple", prixParNuit: 35000, capacite: 1, statut: "Disponible", description: "Chambre cosy avec douche à l'italienne et coin lecture.", photo: null },
    { numeroChambre: "105", type: "Simple", prixParNuit: 36000, capacite: 1, statut: "Disponible", description: "Chambre climatisée, vue sur la cour intérieure arborée.", photo: null },
    { numeroChambre: "106", type: "Simple", prixParNuit: 35000, capacite: 1, statut: "Disponible", description: "Chambre moderne avec Wi-Fi haut débit et coffre-fort.", photo: null },
    { numeroChambre: "107", type: "Simple", prixParNuit: 37000, capacite: 1, statut: "Disponible", description: "Chambre chaleureuse, décoration en bois clair et tissus locaux.", photo: null },
    { numeroChambre: "108", type: "Simple", prixParNuit: 35000, capacite: 1, statut: "Disponible", description: "Chambre pratique proche de l'ascenseur, idéale courts séjours.", photo: null },
    { numeroChambre: "109", type: "Simple", prixParNuit: 38000, capacite: 1, statut: "Disponible", description: "Chambre calme côté rue piétonne, double vitrage.", photo: null },
    { numeroChambre: "110", type: "Simple", prixParNuit: 36000, capacite: 1, statut: "Disponible", description: "Chambre avec petit balcon donnant sur les jardins.", photo: null },
    { numeroChambre: "111", type: "Simple", prixParNuit: 35000, capacite: 1, statut: "Disponible", description: "Chambre confortable, literie premium et bureau ergonomique.", photo: null },
    { numeroChambre: "112", type: "Simple", prixParNuit: 37000, capacite: 1, statut: "Disponible", description: "Chambre claire avec dressing et coin bureau.", photo: null },
    { numeroChambre: "113", type: "Simple", prixParNuit: 36000, capacite: 1, statut: "Disponible", description: "Chambre rénovée, salle de bain moderne et douche à jets.", photo: null },
    { numeroChambre: "114", type: "Simple", prixParNuit: 35000, capacite: 1, statut: "Disponible", description: "Chambre discrète côté jardin, idéale pour un séjour au calme.", photo: null },
    { numeroChambre: "115", type: "Simple", prixParNuit: 38000, capacite: 1, statut: "Disponible", description: "Chambre fonctionnelle avec vue sur la piscine.", photo: null },
    { numeroChambre: "116", type: "Simple", prixParNuit: 36000, capacite: 1, statut: "Disponible", description: "Chambre chaleureuse aux tons sable et bois exotique.", photo: null },
    { numeroChambre: "117", type: "Simple", prixParNuit: 35000, capacite: 1, statut: "Disponible", description: "Chambre spacieuse avec grand bureau et fauteuil de lecture.", photo: null },
    { numeroChambre: "118", type: "Simple", prixParNuit: 37000, capacite: 1, statut: "Disponible", description: "Chambre lumineuse avec double fenêtre côté cour.", photo: null },
    { numeroChambre: "119", type: "Simple", prixParNuit: 36000, capacite: 1, statut: "Disponible", description: "Chambre récemment rafraîchie, literie haut de gamme.", photo: null },
    { numeroChambre: "120", type: "Simple", prixParNuit: 35000, capacite: 1, statut: "Disponible", description: "Chambre pratique avec kitchenette pour longs séjours.", photo: null },
    { numeroChambre: "204", type: "Double", prixParNuit: 55000, capacite: 2, statut: "Disponible", description: "Chambre lumineuse avec grand lit king size et coin salon.", photo: null },
    { numeroChambre: "205", type: "Double", prixParNuit: 58000, capacite: 2, statut: "Disponible", description: "Chambre vue mer partielle, terrasse privative.", photo: null },
    { numeroChambre: "206", type: "Double", prixParNuit: 56000, capacite: 2, statut: "Disponible", description: "Chambre familiale avec canapé-lit d'appoint disponible.", photo: null },
    { numeroChambre: "207", type: "Double", prixParNuit: 60000, capacite: 2, statut: "Disponible", description: "Chambre rénovée, douche à l'italienne et dressing.", photo: null },
    { numeroChambre: "208", type: "Double", prixParNuit: 55000, capacite: 2, statut: "Disponible", description: "Chambre avec vue sur le jardin tropical de l'hôtel.", photo: null },
    { numeroChambre: "209", type: "Double", prixParNuit: 57000, capacite: 2, statut: "Disponible", description: "Chambre élégante, tons ocre et mobilier en bois massif.", photo: null },
    { numeroChambre: "210", type: "Double", prixParNuit: 62000, capacite: 2, statut: "Disponible", description: "Chambre spacieuse proche du spa et de la piscine.", photo: null },
    { numeroChambre: "211", type: "Double", prixParNuit: 55000, capacite: 2, statut: "Disponible", description: "Chambre avec coin salon et vue sur la baie.", photo: null },
    { numeroChambre: "212", type: "Double", prixParNuit: 58000, capacite: 2, statut: "Disponible", description: "Chambre confortable, deux lits jumeaux modulables.", photo: null },
    { numeroChambre: "213", type: "Double", prixParNuit: 56000, capacite: 2, statut: "Disponible", description: "Chambre baignée de lumière, balcon filant côté jardin.", photo: null },
    { numeroChambre: "214", type: "Double", prixParNuit: 55000, capacite: 2, statut: "Disponible", description: "Chambre au design contemporain, douche à l'italienne.", photo: null },
    { numeroChambre: "215", type: "Double", prixParNuit: 60000, capacite: 2, statut: "Disponible", description: "Chambre calme en fond de cour, idéale longs séjours.", photo: null },
    { numeroChambre: "216", type: "Double", prixParNuit: 57000, capacite: 2, statut: "Disponible", description: "Chambre avec vue piscine et accès direct à la terrasse commune.", photo: null },
    { numeroChambre: "217", type: "Double", prixParNuit: 55000, capacite: 2, statut: "Disponible", description: "Chambre chaleureuse, textiles wax et bois local.", photo: null },
    { numeroChambre: "218", type: "Double", prixParNuit: 58000, capacite: 2, statut: "Disponible", description: "Chambre spacieuse avec espace bureau dédié.", photo: null },
    { numeroChambre: "219", type: "Double", prixParNuit: 56000, capacite: 2, statut: "Disponible", description: "Chambre rénovée avec literie premium et coffre-fort.", photo: null },
    { numeroChambre: "220", type: "Double", prixParNuit: 55000, capacite: 2, statut: "Disponible", description: "Chambre lumineuse côté est, idéale lever de soleil sur la baie.", photo: null },
    { numeroChambre: "303", type: "Suite", prixParNuit: 98000, capacite: 4, statut: "Disponible", description: "Suite Junior avec coin bureau et dressing spacieux.", photo: null },
    { numeroChambre: "304", type: "Suite", prixParNuit: 105000, capacite: 4, statut: "Disponible", description: "Suite Duplex sur deux niveaux, vue mer imprenable.", photo: null },
    { numeroChambre: "305", type: "Suite", prixParNuit: 120000, capacite: 5, statut: "Disponible", description: "Suite Prestige avec salle à manger privée.", photo: null },
    { numeroChambre: "306", type: "Suite", prixParNuit: 100000, capacite: 4, statut: "Disponible", description: "Suite d'angle, double exposition et balcon filant.", photo: null },
    { numeroChambre: "307", type: "Suite", prixParNuit: 115000, capacite: 4, statut: "Disponible", description: "Suite Familiale, deux chambres communicantes.", photo: null },
    { numeroChambre: "308", type: "Suite", prixParNuit: 130000, capacite: 6, statut: "Disponible", description: "Suite Diplomate avec salon de réception et bar privatif.", photo: null },
  ];
  const users = [
    { email: "sophie.diallo@example.com", password: "client123", role: "Client", idClient: "CL-001" },
    { email: "moussa.ndiaye@example.com", password: "client123", role: "Client", idClient: "CL-002" },
    { email: "reception@terangapalace.sn", password: "reception123", role: "Réceptionniste" },
    { email: "manager@terangapalace.sn", password: "manager123", role: "Gestionnaire" },
  ];

  const db = { version: DB_VERSION, counters: { client: clients.length + 1, reservation: 100, sejour: 40, paiement: 60, facture: 40 }, clients, chambres, users, reservations: [], sejours: [], paiements: [], factures: [] };

  // -------- réservations / séjours / paiements / factures de démonstration --------
  function addReservation(idClient, numeroChambre, arr, dep, nb, statut) {
    const chambre = chambres.find(c => c.numeroChambre === numeroChambre);
    const nuits = nightsBetween(arr, dep);
    const id = "TP-2026-" + pad(db.counters.reservation++, 5);
    const r = { id, idClient, numeroChambre, dateArrivee: arr, dateDepart: dep, nbPersonnes: nb, montant: nuits * chambre.prixParNuit, statut, dateCreation: arr };
    db.reservations.push(r);
    return r;
  }
  function addSejour(reservation, statut, depReelle) {
    const chambre = chambres.find(c => c.numeroChambre === reservation.numeroChambre);
    const idSejour = "SJ-" + pad(db.counters.sejour++, 4);
    const s = {
      idSejour, idReservation: reservation.id, idClient: reservation.idClient, numeroChambre: reservation.numeroChambre,
      dateArriveeReelle: reservation.dateArrivee, dateDepartReelle: depReelle || reservation.dateDepart, montantTotal: reservation.montant, statut
    };
    db.sejours.push(s);
    return s;
  }
  function addPaiement(idSejour, montant, mode, date) {
    const idPaiement = "PM-" + pad(db.counters.paiement++, 4);
    db.paiements.push({ idPaiement, idSejour, datePaiement: date, montant, modePaiement: mode });
  }
  function addFacture(sejour) {
    const paye = db.paiements.filter(p => p.idSejour === sejour.idSejour).reduce((s, p) => s + p.montant, 0);
    let statut = "Non payée";
    if (paye >= sejour.montantTotal) statut = "Payée"; else if (paye > 0) statut = "Partiellement payée";
    const numeroFacture = "FA-2026-" + pad(db.counters.facture++, 4);
    db.factures.push({ numeroFacture, idSejour: sejour.idSejour, dateFacture: sejour.dateDepartReelle, montantTotal: sejour.montantTotal, statut });
  }

  // Réservation confirmée à venir (client connecté peut la voir)
  addReservation("CL-001", "201", "2026-08-22", "2026-08-25", 2, "Confirmée");
  addReservation("CL-002", "301", "2026-08-20", "2026-08-23", 3, "Confirmée");
  addReservation("CL-003", "101", "2026-08-24", "2026-08-26", 1, "Confirmée");
  addReservation("CL-005", "203", "2026-09-02", "2026-09-05", 2, "Confirmée");
  const rAnnulee = addReservation("CL-004", "202", "2026-08-18", "2026-08-20", 2, "Confirmée"); rAnnulee.statut = "Annulée";

  // Séjour en cours (client déjà arrivé) -> chambre 202 occupée
  chambres.find(c => c.numeroChambre === "202").statut = "Occupée";
  const resEnCours = addReservation("CL-006", "202", "2026-08-14", "2026-08-18", 2, "Confirmée");
  addSejour(resEnCours, "En cours");
  addPaiement(db.sejours[0].idSejour, 50000, "Mobile Money", "2026-08-14");

  // Séjours terminés + paiements + factures (historique)
  const past1 = addReservation("CL-001", "101", "2026-07-10", "2026-07-13", 1, "Terminée");
  const sj1 = addSejour(past1, "Terminé", "2026-07-13");
  addPaiement(sj1.idSejour, sj1.montantTotal, "Carte bancaire", "2026-07-13");
  addFacture(sj1);

  const past2 = addReservation("CL-003", "301", "2026-07-02", "2026-07-06", 3, "Terminée");
  const sj2 = addSejour(past2, "Terminé", "2026-07-06");
  addPaiement(sj2.idSejour, 200000, "Espèces", "2026-07-06");
  addFacture(sj2);

  const past3 = addReservation("CL-005", "201", "2026-06-20", "2026-06-24", 2, "Terminée");
  const sj3 = addSejour(past3, "Terminé", "2026-06-24");
  addPaiement(sj3.idSejour, sj3.montantTotal, "Mobile Money", "2026-06-24");
  addFacture(sj3);

  const past4 = addReservation("CL-002", "302", "2026-06-05", "2026-06-09", 4, "Terminée");
  const sj4 = addSejour(past4, "Terminé", "2026-06-09");
  addPaiement(sj4.idSejour, sj4.montantTotal * 0.6, "Carte bancaire", "2026-06-09");
  addFacture(sj4);

  const past5 = addReservation("CL-004", "203", "2026-05-15", "2026-05-17", 2, "Terminée");
  const sj5 = addSejour(past5, "Terminé", "2026-05-17");
  addPaiement(sj5.idSejour, sj5.montantTotal, "Espèces", "2026-05-17");
  addFacture(sj5);

  return db;
}

// Règle automatique de No-show : toute réservation encore "Confirmée" dont la date
// de Check-in est strictement dans le passé, et pour laquelle aucun check-in n'a
// réellement été enregistré (pas de séjour ouvert lié), est automatiquement
// considérée comme un No-show — la chambre redevient donc immédiatement
// disponible pour d'autres clients, sans aucune action manuelle du réceptionniste.
// Important : une réservation dont le check-in A été effectué (un séjour existe)
// n'est jamais concernée, quelle que soit la date de départ prévue.
function autoExpireNoShows() {
  const today = todayStr();
  let changed = false;
  DB.reservations.forEach(r => {
    if (r.statut === "Confirmée" && r.dateArrivee < today && !DB.sejours.some(s => s.idReservation === r.id)) {
      r.statut = "No-show";
      changed = true;
    }
  });
  if (changed) persist(DB); // sauvegarde locale + réplication Supabase, seulement si un changement a réellement eu lieu
  return changed;
}

let DB = loadDB();
autoExpireNoShows(); // applique la règle tout de suite au chargement (ex: navigateur resté fermé plusieurs jours)
function reloadDB() { DB = loadDB(); autoExpireNoShows(); PHOTOS_HYDRATED = false; hydratePhotos(); }
hydratePhotos(); // charge/migre les photos depuis IndexedDB en tâche de fond, puis rafraîchit l'affichage

/* Débounce : quand plusieurs changements arrivent d'un coup (ex: réservation +
   séjour + facture créés en rafale), on ne relance qu'une seule synchronisation
   au lieu d'une par table touchée. */
let SB_REALTIME_DEBOUNCE = null;
function scheduleSyncFromSupabase() {
  clearTimeout(SB_REALTIME_DEBOUNCE);
  SB_REALTIME_DEBOUNCE = setTimeout(syncFromSupabase, 150);
}

/* Écoute en temps réel (WebSocket) les changements sur les tables partagées :
   dès qu'un client confirme une réservation sur un autre appareil/navigateur,
   Supabase pousse l'événement ici et la réception voit la mise à jour
   quasi instantanément (au lieu d'attendre le prochain polling). */
function subscribeRealtime() {
  if (!window.sb) return;
  const channel = window.sb.channel("tp-realtime-sync");
  Object.values(SB_TABLES).forEach(([table]) => {
    channel.on("postgres_changes", { event: "*", schema: "public", table }, scheduleSyncFromSupabase);
  });
  channel.subscribe((status) => {
    if (status === "SUBSCRIBED") console.info("Realtime Supabase actif : synchronisation instantanée.");
    else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") console.warn("Realtime Supabase indisponible, le polling de secours prend le relais.", status);
  });
}

if (window.sb) {
  syncFromSupabase().then(() => persist(DB)); // récupère l'état partagé au démarrage (réservations faites par d'autres, etc.),
  // puis relance immédiatement un envoi : permet à une éventuelle ligne locale
  // durablement invalide (voir SB_MAX_PUSH_ATTEMPTS) d'être nettoyée dès l'ouverture
  // de la page, sans attendre qu'une action de sauvegarde soit faite manuellement.
  subscribeRealtime(); // synchronisation instantanée dès qu'une donnée change côté serveur
  setInterval(syncFromSupabase, 30000); // filet de secours si le Realtime se déconnecte (WiFi coupé, etc.)
}

// Filet de sécurité local, indépendant de Supabase : si l'application reste ouverte
// à cheval sur un changement de jour (ex: laissée ouverte toute la nuit à la
// réception), on re-vérifie régulièrement les No-show plutôt que d'attendre un
// prochain rechargement de page. Si un changement a lieu, l'affichage courant se
// met à jour comme pour toute autre synchronisation.
setInterval(() => {
  if (autoExpireNoShows() && typeof render === "function" && (typeof shouldSkipBackgroundRerender !== "function" || !shouldSkipBackgroundRerender())) render();
}, 60000);

/* ============================= SESSION ============================= */
function getSession() { try { return JSON.parse(sessionStorage.getItem("tp_session") || "null"); } catch (e) { return null; } }
function setSession(s) { sessionStorage.setItem("tp_session", JSON.stringify(s)); }
function clearSession() { sessionStorage.removeItem("tp_session"); }

/* ============================= AVAILABILITY / BUSINESS LOGIC ============================= */
function overlap(aStart, aEnd, bStart, bEnd) { return aStart < bEnd && bStart < aEnd; }

function isRoomAvailable(numeroChambre, dateArrivee, dateDepart, excludeReservationId) {
  const chambre = DB.chambres.find(c => c.numeroChambre === numeroChambre);
  // Une chambre en Maintenance ou physiquement Occupée (client actuellement en
  // séjour, après check-in) ne peut recevoir aucune nouvelle réservation, quelles
  // que soient les dates demandées : on ne connaît pas avec certitude la date de
  // départ réelle du client présent (elle peut différer de la date initialement
  // prévue), donc on bloque par précaution jusqu'au check-out effectif (qui remet
  // la chambre à "Disponible").
  if (!chambre || chambre.statut === "Maintenance" || chambre.statut === "Occupée") return false;
  const a1 = new Date(dateArrivee), a2 = new Date(dateDepart);
  const clash = DB.reservations.some(r => {
    if (r.numeroChambre !== numeroChambre) return false;
    if (r.statut !== "Confirmée") return false;
    if (excludeReservationId && r.id === excludeReservationId) return false;
    return overlap(a1, a2, new Date(r.dateArrivee), new Date(r.dateDepart));
  });
  return !clash;
}

function searchAvailableRooms(dateArrivee, dateDepart, nbPersonnes, type) {
  return DB.chambres.filter(c => {
    if (type && c.type !== type) return false;
    if (c.capacite < nbPersonnes) return false;
    return isRoomAvailable(c.numeroChambre, dateArrivee, dateDepart);
  });
}

function findOrCreateClient({ nom, prenom, email, telephone, adresse }) {
  let c = DB.clients.find(x => x.email.toLowerCase() === email.toLowerCase());
  if (c) { c.nom = nom; c.prenom = prenom; c.telephone = telephone; if (adresse) c.adresse = adresse; return c; }
  // Utilise un compteur partagé (recalculé depuis Supabase à chaque sync, voir
  // recomputeCounters) plutôt que DB.clients.length+1 : deux navigateurs différents
  // créant un compte au même moment auraient pu obtenir le même idClient, ce qui
  // écrasait silencieusement les coordonnées (nom/email/téléphone) de l'un des deux
  // clients dans la table partagée dès la synchronisation suivante.
  if (!DB.counters.client) DB.counters.client = DB.clients.length + 1;
  const idClient = "CL-" + pad(DB.counters.client++, 3);
  c = { idClient, nom, prenom, telephone, email, adresse: adresse || "" };
  DB.clients.push(c);
  return c;
}

async function createReservation({ idClient, numeroChambre, dateArrivee, dateDepart, nbPersonnes }) {
  // 1) Vérification rapide sur la copie locale (retour immédiat si déjà visiblement indisponible).
  if (!isRoomAvailable(numeroChambre, dateArrivee, dateDepart)) {
    return { ok: false, error: "Cette chambre vient d'être réservée. Veuillez sélectionner une autre chambre." };
  }
  const chambre = DB.chambres.find(c => c.numeroChambre === numeroChambre);
  const nuits = nightsBetween(dateArrivee, dateDepart);
  const id = "TP-2026-" + pad(DB.counters.reservation++, 5);
  const r = { id, idClient, numeroChambre, dateArrivee, dateDepart, nbPersonnes, montant: nuits * chambre.prixParNuit, statut: "Confirmée", dateCreation: todayStr() };

  // 2) Vérification DÉFINITIVE côté serveur partagé (Supabase), avant d'annoncer un
  //    succès à l'utilisateur. La copie locale du navigateur peut être légèrement en
  //    retard : si une autre personne, sur un autre appareil, vient de réserver la
  //    même chambre pour des dates qui se chevauchent, ce n'est parfois visible dans
  //    notre copie locale qu'après la prochaine synchronisation. On insère donc
  //    directement dans Supabase et on laisse le trigger SQL "trg_no_overlap_fn"
  //    (voir database/supabase_schema.sql) arbitrer en cas de conflit réel : s'il
  //    rejette l'insertion, on ne confirme PAS la réservation côté client.
  if (window.sb) {
    try {
      const { error } = await window.sb.from("reservations").insert(sanitizeForSupabase(r, "reservations"));
      if (error) {
        DB.counters.reservation--; // l'identifiant réservé n'a pas été utilisé, on le rend au compteur
        console.error("Réservation refusée par le serveur (conflit de disponibilité)", error);
        return { ok: false, error: "Cette chambre vient d'être réservée par une autre personne à l'instant. Veuillez choisir une autre chambre ou d'autres dates." };
      }
    } catch (e) {
      // Pas de connexion à la base partagée (hors-ligne, Supabase non joignable) : on
      // continue en mode dégradé, avec uniquement la protection locale ci-dessus.
      console.error("Impossible de vérifier la réservation auprès du serveur partagé, poursuite en mode local.", e);
    }
  }
  DB.reservations.push(r);
  save();
  return { ok: true, reservation: r };
}

// Réservations dont l'arrivée est prévue aujourd'hui, encore "Confirmée" et pas
// encore enregistrées en check-in (pas de séjour ouvert) : sert à l'alerte Réception.
function todaysArrivals() {
  const today = todayStr();
  return DB.reservations.filter(r =>
    r.statut === "Confirmée" &&
    r.dateArrivee === today &&
    !DB.sejours.some(s => s.idReservation === r.id)
  );
}

// Séjours dont le départ était prévu aujourd'hui (date de la réservation d'origine),
// toujours "En cours" (pas encore réellement check-outés) : sert à l'alerte Réception.
// On s'appuie sur la date de départ PRÉVUE (celle de la réservation), pas seulement
// sur la date de check-in réelle, car un séjour peut durer plusieurs nuits.
function todaysCheckouts() {
  const today = todayStr();
  return DB.sejours.filter(s => {
    if (s.statut !== "En cours" || s.dateDepartReelle) return false;
    const r = DB.reservations.find(x => x.id === s.idReservation);
    return r && r.dateDepart === today;
  });
}

// Le réceptionniste signale que le client n'a pas encore libéré la chambre malgré la
// date de départ prévue aujourd'hui : on garde une trace (sans rien changer d'autre)
// pour qu'il puisse suivre la situation, sans forcer un check-out qui n'a pas eu lieu.
function signalerDepartRetarde(idSejour) {
  const s = DB.sejours.find(x => x.idSejour === idSejour);
  if (!s) return { ok: false, error: "Séjour introuvable." };
  s.presenceSignalee = true;
  s.dateSignalement = todayStr();
  save();
  return { ok: true, sejour: s };
}

// Client attendu qui ne s'est pas présenté : la réservation passe à "No-show" et la
// chambre redevient immédiatement disponible (comme une annulation), sans créer de
// séjour ni de facture.
function markNoShow(id) {
  const r = DB.reservations.find(x => x.id === id);
  if (!r) return { ok: false, error: "Réservation introuvable." };
  if (r.statut !== "Confirmée") return { ok: false, error: "Cette réservation n'est pas confirmée (statut : " + r.statut + ")." };
  r.statut = "No-show";
  save();
  return { ok: true, reservation: r };
}

function cancelReservation(id) {
  const r = DB.reservations.find(x => x.id === id);
  if (!r) return;
  r.statut = "Annulée"; // la chambre redevient disponible automatiquement (filtrage par statut)
  save();
}

function checkinReservation(reservationId) {
  const r = DB.reservations.find(x => x.id === reservationId);
  if (!r) return { ok: false, error: "Aucune réservation trouvée avec cet identifiant." };
  if (r.statut !== "Confirmée") return { ok: false, error: "Cette réservation n'est pas confirmée (statut : " + r.statut + ")." };
  if (DB.sejours.some(s => s.idReservation === r.id)) return { ok: false, error: "Un séjour existe déjà pour cette réservation." };
  const idSejour = "SJ-" + pad(DB.counters.sejour++, 4);
  const s = { idSejour, idReservation: r.id, idClient: r.idClient, numeroChambre: r.numeroChambre, dateArriveeReelle: todayStr(), dateDepartReelle: null, montantTotal: r.montant, statut: "En cours", presenceSignalee: false, dateSignalement: null };
  DB.sejours.push(s);
  const chambre = DB.chambres.find(c => c.numeroChambre === r.numeroChambre);
  chambre.statut = "Occupée";
  save();
  return { ok: true, sejour: s };
}

function checkoutSejour(idSejour) {
  const s = DB.sejours.find(x => x.idSejour === idSejour);
  if (!s) return { ok: false, error: "Séjour introuvable." };
  s.dateDepartReelle = todayStr();
  s.statut = "Terminé";
  const chambre = DB.chambres.find(c => c.numeroChambre === s.numeroChambre);
  chambre.statut = "Disponible";
  const r = DB.reservations.find(x => x.id === s.idReservation);
  if (r) r.statut = "Terminée";
  // Génère la facture si elle n'existe pas déjà
  if (!DB.factures.some(f => f.idSejour === s.idSejour)) {
    const paye = DB.paiements.filter(p => p.idSejour === s.idSejour).reduce((sum, p) => sum + p.montant, 0);
    let statut = "Non payée";
    if (paye >= s.montantTotal) statut = "Payée"; else if (paye > 0) statut = "Partiellement payée";
    const numeroFacture = "FA-2026-" + pad(DB.counters.facture++, 4);
    DB.factures.push({ numeroFacture, idSejour: s.idSejour, dateFacture: s.dateDepartReelle, montantTotal: s.montantTotal, statut });
  }
  save();
  return { ok: true, sejour: s };
}

function addPaiement(idSejour, montant, modePaiement) {
  const idPaiement = "PM-" + pad(DB.counters.paiement++, 4);
  DB.paiements.push({ idPaiement, idSejour, datePaiement: todayStr(), montant, modePaiement });
  // met à jour le statut de la facture si elle existe déjà
  const f = DB.factures.find(x => x.idSejour === idSejour);
  if (f) {
    const s = DB.sejours.find(x => x.idSejour === idSejour);
    const paye = DB.paiements.filter(p => p.idSejour === idSejour).reduce((sum, p) => sum + p.montant, 0);
    f.statut = paye >= s.montantTotal ? "Payée" : (paye > 0 ? "Partiellement payée" : "Non payée");
  }
  save();
}

/* ============================= VALIDATION HELPERS ============================= */
function isEmailValid(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
function isPhoneValid(v) { return /^[+0-9 ()-]{7,20}$/.test(v); }
function markField(el, ok, msg) {
  const field = el.closest(".field");
  if (!field) return ok;
  field.classList.toggle("invalid", !ok);
  const err = field.querySelector(".err");
  if (err && msg) err.textContent = msg;
  return ok;
}