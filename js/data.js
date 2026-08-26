/* ============================= DATA LAYER (LocalStorage + IndexedDB + Supabase) ============================= */
const DB_VERSION = "tp-v1";
const LS_KEY = "teranga_palace_db";

function loadDB(){
  try{
    const raw = localStorage.getItem(LS_KEY);
    if(raw){ const parsed = JSON.parse(raw); if(parsed.version===DB_VERSION) return parsed; }
  }catch(e){ console.warn("Lecture LocalStorage impossible, réinitialisation.", e); }
  const fresh = seedDB();
  persist(fresh);
  return fresh;
}
/* Écrit uniquement le cache local (LocalStorage), sans toucher à Supabase.
   Les photos "lourdes" en base64 ne sont jamais incluses ici (elles vivent
   dans IndexedDB) ; un chemin statique léger (ex: assets/images/xxx.svg)
   reste stocké normalement. */
function cacheLocally(db){
  const light = {
    ...db,
    chambres: db.chambres.map(c=>{
      if(c.photo && typeof c.photo === "string" && c.photo.startsWith("data:image")){
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
function persist(db){
  try{
    cacheLocally(db);
    if(window.sb){ pushDBToSupabase(db).catch(e=>console.error("Synchronisation Supabase (écriture) échouée", e)); }
    return true;
  }catch(e){
    console.error("Erreur de sauvegarde", e);
    if(typeof toast === "function"){
      toast("Stockage saturé", "Impossible d'enregistrer : l'espace de stockage du navigateur est plein.", true);
    }else{
      alert("Stockage saturé : impossible d'enregistrer les données.");
    }
    return false;
  }
}
function save(){ return persist(DB); }

/* ---- Réplication Supabase (base partagée entre tous les navigateurs/appareils) ---- */
/* Association clé JS (tableau dans DB) -> [table Postgres, clé primaire] */
const SB_TABLES = {
  clients:      ["clients", "idClient"],
  chambres:     ["chambres", "numeroChambre"],
  users:        ["users", "email"],
  reservations: ["reservations", "id"],
  sejours:      ["sejours", "idSejour"],
  paiements:    ["paiements", "idPaiement"],
  factures:     ["factures", "numeroFacture"]
};

/* Pousse l'état local vers Supabase : upsert de chaque ligne, puis suppression côté
   distant de tout ce qui n'existe plus localement (miroir complet, simple et fiable). */
async function pushDBToSupabase(db){
  if(!window.sb) return;
  for(const [jsKey, [table, pk]] of Object.entries(SB_TABLES)){
    const rows = db[jsKey] || [];
    try{
      if(rows.length){
        const clean = jsKey==="chambres" ? rows.map(({photo, ...rest})=>rest) : rows;
        const { error } = await window.sb.from(table).upsert(clean, { onConflict: pk });
        if(error) console.error("Supabase upsert", table, error);
      }
      const { data: remoteRows, error: selErr } = await window.sb.from(table).select(pk);
      if(!selErr && remoteRows){
        const localIds = new Set(rows.map(r=>r[pk]));
        const toDelete = remoteRows.map(r=>r[pk]).filter(id=>!localIds.has(id));
        if(toDelete.length){
          const { error: delErr } = await window.sb.from(table).delete().in(pk, toDelete);
          if(delErr) console.error("Supabase delete", table, delErr);
        }
      }
    }catch(e){ console.error("Supabase sync (écriture) — table", table, e); }
  }
}

/* Recalcule les compteurs locaux (numérotation des réservations/séjours/paiements/factures)
   à partir du maximum réellement présent côté Supabase, pour limiter le risque de collision
   d'identifiants entre deux navigateurs différents créant des entrées en parallèle. */
function recomputeCounters(){
  const maxNum = (rows, idField) => rows.reduce((m,r)=>{
    const n = parseInt(String(r[idField]||"").replace(/[^0-9]/g,""),10);
    return isNaN(n) ? m : Math.max(m, n);
  }, 0);
  DB.counters.reservation = Math.max(DB.counters.reservation, maxNum(DB.reservations,"id")+1);
  DB.counters.sejour      = Math.max(DB.counters.sejour, maxNum(DB.sejours,"idSejour")+1);
  DB.counters.paiement    = Math.max(DB.counters.paiement, maxNum(DB.paiements,"idPaiement")+1);
  DB.counters.facture     = Math.max(DB.counters.facture, maxNum(DB.factures,"numeroFacture")+1);
}

/* Récupère l'état complet depuis Supabase et remplace les données locales — c'est ce qui
   permet à la réception de voir une réservation faite depuis un autre navigateur. */
let SB_SYNCING = false;
async function syncFromSupabase(){
  if(!window.sb || SB_SYNCING) return;
  SB_SYNCING = true;
  try{
    const entries = Object.entries(SB_TABLES);
    const results = await Promise.all(entries.map(([, [table]]) => window.sb.from(table).select("*")));
    const photosByRoom = {};
    DB.chambres.forEach(c=>{ if(c.photo) photosByRoom[c.numeroChambre] = c.photo; });
    entries.forEach(([jsKey], i)=>{
      const { data, error } = results[i];
      if(error){ console.error("Supabase sync (lecture) — table", jsKey, error); return; }
      if(!data) return;
      DB[jsKey] = jsKey==="chambres"
        ? data.map(c=>({ ...c, photo: photosByRoom[c.numeroChambre] || c.photo || null }))
        : data;
    });
    recomputeCounters();
    cacheLocally(DB);
    window.dispatchEvent(new Event("tp-data-synced"));
  }catch(e){
    console.error("Synchronisation Supabase (lecture) échouée", e);
  }finally{
    SB_SYNCING = false;
  }
}

/* ---- Photos de chambre : stockées dans IndexedDB (quota bien plus grand que LocalStorage) ---- */
let PHOTOS_IDB = null;
function openPhotosDB(){
  return new Promise((resolve, reject)=>{
    if(PHOTOS_IDB) return resolve(PHOTOS_IDB);
    if(!window.indexedDB){ reject(new Error("indexeddb-unavailable")); return; }
    const req = indexedDB.open("teranga_palace_photos", 1);
    req.onupgradeneeded = (e)=>{
      const db = e.target.result;
      if(!db.objectStoreNames.contains("photos")) db.createObjectStore("photos");
    };
    req.onsuccess = ()=>{ PHOTOS_IDB = req.result; resolve(PHOTOS_IDB); };
    req.onerror = ()=>reject(req.error);
  });
}
function idbSetPhoto(numero, dataUrl){
  return openPhotosDB().then(db=>new Promise((resolve, reject)=>{
    const tx = db.transaction("photos","readwrite");
    tx.objectStore("photos").put(dataUrl, numero);
    tx.oncomplete = ()=>resolve(true);
    tx.onerror = ()=>reject(tx.error);
  }));
}
function idbGetPhoto(numero){
  return openPhotosDB().then(db=>new Promise((resolve, reject)=>{
    const tx = db.transaction("photos","readonly");
    const req = tx.objectStore("photos").get(numero);
    req.onsuccess = ()=>resolve(req.result || null);
    req.onerror = ()=>reject(req.error);
  }));
}
function idbDeletePhoto(numero){
  return openPhotosDB().then(db=>new Promise((resolve, reject)=>{
    const tx = db.transaction("photos","readwrite");
    tx.objectStore("photos").delete(numero);
    tx.oncomplete = ()=>resolve(true);
    tx.onerror = ()=>reject(tx.error);
  }));
}

/* Au démarrage : migre les anciennes photos encore en base64 dans LocalStorage vers IndexedDB,
   puis recharge en mémoire (DB.chambres[].photo) les photos déjà migrées, pour un affichage inchangé
   dans le reste du code (roomRows, roomCard, etc. continuent de lire c.photo normalement). */
let PHOTOS_HYDRATED = false;
async function hydratePhotos(){
  let migratedFromLocalStorage = false;
  for(const c of DB.chambres){
    if(c.photo && typeof c.photo === "string" && c.photo.startsWith("data:image")){
      try{
        await idbSetPhoto(c.numeroChambre, c.photo);
        c.hasPhoto = true;
        migratedFromLocalStorage = true;
      }catch(e){ console.error("Migration photo échouée pour", c.numeroChambre, e); }
    }else if(c.hasPhoto && !c.photo){
      try{
        const data = await idbGetPhoto(c.numeroChambre);
        if(data) c.photo = data;
      }catch(e){ console.error("Chargement photo échoué pour", c.numeroChambre, e); }
    }
  }
  PHOTOS_HYDRATED = true;
  if(migratedFromLocalStorage) persist(DB); // écrit désormais la version allégée (sans base64) en LocalStorage
  window.dispatchEvent(new Event("tp-photos-hydrated")); // signale aux pages (SPA publique/admin, dashboard) de se rafraîchir
}

function compressImage(file, maxDim, quality){
  maxDim = maxDim || 800;
  quality = quality || 0.72;
  return new Promise((resolve, reject)=>{
    const reader = new FileReader();
    reader.onerror = ()=>reject(new Error("read-failed"));
    reader.onload = ()=>{
      const img = new Image();
      img.onerror = ()=>reject(new Error("decode-failed"));
      img.onload = ()=>{
        let { width, height } = img;
        if(width > maxDim || height > maxDim){
          if(width >= height){ height = Math.round(height * (maxDim/width)); width = maxDim; }
          else{ width = Math.round(width * (maxDim/height)); height = maxDim; }
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
function roomTypeIllustration(type){
  const slug = type==="Suite" ? "suite" : type==="Double" ? "double" : "simple";
  return "assets/images/chambre-"+slug+".svg";
}
/* Balise <img> avec cascade : vraie photo en mémoire (uploadée dans CE navigateur) →
   fichier réel exporté par le manager et commité dans le repo (assets/images/chambre-<numero>.jpg,
   .jpeg ou .png) → illustration générique par type (filet de sécurité, toujours disponible). */
function roomImageTag(c, styleAttr){
  const fallbackType = roomTypeIllustration(c.type);
  if(c.photo){
    return `<img src="${c.photo}" style="${styleAttr}" onerror="this.onerror=null;this.src='${fallbackType}';">`;
  }
  const staticJpg = "assets/images/chambre-"+c.numeroChambre+".jpg";
  return `<img src="${staticJpg}" style="${styleAttr}" onerror="this.onerror=null;this.src='${fallbackType}';">`;
}

/* Exporte les vraies photos ajoutées par le gestionnaire (dans CE navigateur) sous forme de
   fichiers téléchargés "chambre-<numero>.jpg" — à déposer ensuite dans assets/images/ du projet
   puis committer/pousser, pour qu'elles deviennent visibles par tous les visiteurs du site déployé. */
async function exportRealRoomPhotos(){
  let count = 0;
  for(const c of DB.chambres){
    let dataUrl = null;
    if(c.photo && typeof c.photo === "string" && c.photo.startsWith("data:image")){
      dataUrl = c.photo;
    }else if(c.hasPhoto){
      try{ dataUrl = await idbGetPhoto(c.numeroChambre); }catch(e){ /* photo introuvable, on l'ignore */ }
    }
    if(dataUrl){
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "chambre-"+c.numeroChambre+".jpg";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      count++;
      await new Promise(r=>setTimeout(r, 250)); // espace les téléchargements pour éviter un blocage navigateur
    }
  }
  return count;
}

function pad(n,l){ return String(n).padStart(l,"0"); }
function todayStr(){ return new Date().toISOString().slice(0,10); }
function nightsBetween(a,b){ const d=(new Date(b)-new Date(a))/86400000; return Math.max(0,Math.round(d)); }
function fmtMoney(n){ return Math.round(n).toLocaleString("fr-FR")+" FCFA"; }
function fmtDate(s){ if(!s) return "—"; const d=new Date(s); return d.toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"}); }
function monthKey(s){ return s.slice(0,7); }
function monthLabel(key){ const [y,m]=key.split("-"); const noms=["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"]; return noms[parseInt(m,10)-1]+" "+y.slice(2); }

function seedDB(){
  const clients = [
    {idClient:"CL-001", nom:"Diallo", prenom:"Sophie", telephone:"+221 77 123 45 67", email:"sophie.diallo@example.com", adresse:"Mermoz, Dakar"},
    {idClient:"CL-002", nom:"Ndiaye", prenom:"Moussa", telephone:"+221 76 234 56 78", email:"moussa.ndiaye@example.com", adresse:"Almadies, Dakar"},
    {idClient:"CL-003", nom:"Faye", prenom:"Aïda", telephone:"+221 78 345 67 89", email:"aida.faye@example.com", adresse:"Point E, Dakar"},
    {idClient:"CL-004", nom:"Martin", prenom:"Julien", telephone:"+33 6 12 34 56 78", email:"julien.martin@example.com", adresse:"Lyon, France"},
    {idClient:"CL-005", nom:"Sow", prenom:"Fatou", telephone:"+221 70 456 78 90", email:"fatou.sow@example.com", adresse:"Yoff, Dakar"},
    {idClient:"CL-006", nom:"Camara", prenom:"Ibrahima", telephone:"+221 77 567 89 01", email:"ibrahima.camara@example.com", adresse:"Ouakam, Dakar"},
  ];
  const chambres = [
    {numeroChambre:"101", type:"Simple", prixParNuit:35000, capacite:1, statut:"Disponible", description:"Chambre lumineuse avec vue jardin, idéale pour un séjour d'affaires.", photo:null},
    {numeroChambre:"102", type:"Simple", prixParNuit:35000, capacite:1, statut:"Disponible", description:"Chambre épurée, bureau de travail et literie premium.", photo:null},
    {numeroChambre:"103", type:"Simple", prixParNuit:38000, capacite:1, statut:"Maintenance", description:"Chambre en cours de rénovation de la salle de bain.", photo:null},
    {numeroChambre:"201", type:"Double", prixParNuit:55000, capacite:2, statut:"Disponible", description:"Chambre spacieuse avec balcon donnant sur la piscine.", photo:null},
    {numeroChambre:"202", type:"Double", prixParNuit:58000, capacite:2, statut:"Disponible", description:"Ambiance chaleureuse, décoration inspirée de l'artisanat sénégalais.", photo:null},
    {numeroChambre:"203", type:"Double", prixParNuit:55000, capacite:2, statut:"Disponible", description:"Chambre calme côté cour intérieure, idéale pour couples.", photo:null},
    {numeroChambre:"301", type:"Suite", prixParNuit:95000, capacite:4, statut:"Disponible", description:"Suite avec salon privé et vue panoramique sur la baie de Dakar.", photo:null},
    {numeroChambre:"302", type:"Suite", prixParNuit:110000, capacite:4, statut:"Disponible", description:"Suite Présidentielle, terrasse privative et jacuzzi.", photo:null},
    {numeroChambre:"104", type:"Simple", prixParNuit:35000, capacite:1, statut:"Disponible", description:"Chambre cosy avec douche à l'italienne et coin lecture.", photo:null},
    {numeroChambre:"105", type:"Simple", prixParNuit:36000, capacite:1, statut:"Disponible", description:"Chambre climatisée, vue sur la cour intérieure arborée.", photo:null},
    {numeroChambre:"106", type:"Simple", prixParNuit:35000, capacite:1, statut:"Disponible", description:"Chambre moderne avec Wi-Fi haut débit et coffre-fort.", photo:null},
    {numeroChambre:"107", type:"Simple", prixParNuit:37000, capacite:1, statut:"Disponible", description:"Chambre chaleureuse, décoration en bois clair et tissus locaux.", photo:null},
    {numeroChambre:"108", type:"Simple", prixParNuit:35000, capacite:1, statut:"Disponible", description:"Chambre pratique proche de l'ascenseur, idéale courts séjours.", photo:null},
    {numeroChambre:"109", type:"Simple", prixParNuit:38000, capacite:1, statut:"Disponible", description:"Chambre calme côté rue piétonne, double vitrage.", photo:null},
    {numeroChambre:"110", type:"Simple", prixParNuit:36000, capacite:1, statut:"Disponible", description:"Chambre avec petit balcon donnant sur les jardins.", photo:null},
    {numeroChambre:"111", type:"Simple", prixParNuit:35000, capacite:1, statut:"Disponible", description:"Chambre confortable, literie premium et bureau ergonomique.", photo:null},
    {numeroChambre:"112", type:"Simple", prixParNuit:37000, capacite:1, statut:"Disponible", description:"Chambre claire avec dressing et coin bureau.", photo:null},
    {numeroChambre:"113", type:"Simple", prixParNuit:36000, capacite:1, statut:"Disponible", description:"Chambre rénovée, salle de bain moderne et douche à jets.", photo:null},
    {numeroChambre:"114", type:"Simple", prixParNuit:35000, capacite:1, statut:"Disponible", description:"Chambre discrète côté jardin, idéale pour un séjour au calme.", photo:null},
    {numeroChambre:"115", type:"Simple", prixParNuit:38000, capacite:1, statut:"Disponible", description:"Chambre fonctionnelle avec vue sur la piscine.", photo:null},
    {numeroChambre:"116", type:"Simple", prixParNuit:36000, capacite:1, statut:"Disponible", description:"Chambre chaleureuse aux tons sable et bois exotique.", photo:null},
    {numeroChambre:"117", type:"Simple", prixParNuit:35000, capacite:1, statut:"Disponible", description:"Chambre spacieuse avec grand bureau et fauteuil de lecture.", photo:null},
    {numeroChambre:"118", type:"Simple", prixParNuit:37000, capacite:1, statut:"Disponible", description:"Chambre lumineuse avec double fenêtre côté cour.", photo:null},
    {numeroChambre:"119", type:"Simple", prixParNuit:36000, capacite:1, statut:"Disponible", description:"Chambre récemment rafraîchie, literie haut de gamme.", photo:null},
    {numeroChambre:"120", type:"Simple", prixParNuit:35000, capacite:1, statut:"Disponible", description:"Chambre pratique avec kitchenette pour longs séjours.", photo:null},
    {numeroChambre:"204", type:"Double", prixParNuit:55000, capacite:2, statut:"Disponible", description:"Chambre lumineuse avec grand lit king size et coin salon.", photo:null},
    {numeroChambre:"205", type:"Double", prixParNuit:58000, capacite:2, statut:"Disponible", description:"Chambre vue mer partielle, terrasse privative.", photo:null},
    {numeroChambre:"206", type:"Double", prixParNuit:56000, capacite:2, statut:"Disponible", description:"Chambre familiale avec canapé-lit d'appoint disponible.", photo:null},
    {numeroChambre:"207", type:"Double", prixParNuit:60000, capacite:2, statut:"Disponible", description:"Chambre rénovée, douche à l'italienne et dressing.", photo:null},
    {numeroChambre:"208", type:"Double", prixParNuit:55000, capacite:2, statut:"Disponible", description:"Chambre avec vue sur le jardin tropical de l'hôtel.", photo:null},
    {numeroChambre:"209", type:"Double", prixParNuit:57000, capacite:2, statut:"Disponible", description:"Chambre élégante, tons ocre et mobilier en bois massif.", photo:null},
    {numeroChambre:"210", type:"Double", prixParNuit:62000, capacite:2, statut:"Disponible", description:"Chambre spacieuse proche du spa et de la piscine.", photo:null},
    {numeroChambre:"211", type:"Double", prixParNuit:55000, capacite:2, statut:"Disponible", description:"Chambre avec coin salon et vue sur la baie.", photo:null},
    {numeroChambre:"212", type:"Double", prixParNuit:58000, capacite:2, statut:"Disponible", description:"Chambre confortable, deux lits jumeaux modulables.", photo:null},
    {numeroChambre:"213", type:"Double", prixParNuit:56000, capacite:2, statut:"Disponible", description:"Chambre baignée de lumière, balcon filant côté jardin.", photo:null},
    {numeroChambre:"214", type:"Double", prixParNuit:55000, capacite:2, statut:"Disponible", description:"Chambre au design contemporain, douche à l'italienne.", photo:null},
    {numeroChambre:"215", type:"Double", prixParNuit:60000, capacite:2, statut:"Disponible", description:"Chambre calme en fond de cour, idéale longs séjours.", photo:null},
    {numeroChambre:"216", type:"Double", prixParNuit:57000, capacite:2, statut:"Disponible", description:"Chambre avec vue piscine et accès direct à la terrasse commune.", photo:null},
    {numeroChambre:"217", type:"Double", prixParNuit:55000, capacite:2, statut:"Disponible", description:"Chambre chaleureuse, textiles wax et bois local.", photo:null},
    {numeroChambre:"218", type:"Double", prixParNuit:58000, capacite:2, statut:"Disponible", description:"Chambre spacieuse avec espace bureau dédié.", photo:null},
    {numeroChambre:"219", type:"Double", prixParNuit:56000, capacite:2, statut:"Disponible", description:"Chambre rénovée avec literie premium et coffre-fort.", photo:null},
    {numeroChambre:"220", type:"Double", prixParNuit:55000, capacite:2, statut:"Disponible", description:"Chambre lumineuse côté est, idéale lever de soleil sur la baie.", photo:null},
    {numeroChambre:"303", type:"Suite", prixParNuit:98000, capacite:4, statut:"Disponible", description:"Suite Junior avec coin bureau et dressing spacieux.", photo:null},
    {numeroChambre:"304", type:"Suite", prixParNuit:105000, capacite:4, statut:"Disponible", description:"Suite Duplex sur deux niveaux, vue mer imprenable.", photo:null},
    {numeroChambre:"305", type:"Suite", prixParNuit:120000, capacite:5, statut:"Disponible", description:"Suite Prestige avec salle à manger privée.", photo:null},
    {numeroChambre:"306", type:"Suite", prixParNuit:100000, capacite:4, statut:"Disponible", description:"Suite d'angle, double exposition et balcon filant.", photo:null},
    {numeroChambre:"307", type:"Suite", prixParNuit:115000, capacite:4, statut:"Disponible", description:"Suite Familiale, deux chambres communicantes.", photo:null},
    {numeroChambre:"308", type:"Suite", prixParNuit:130000, capacite:6, statut:"Disponible", description:"Suite Diplomate avec salon de réception et bar privatif.", photo:null},
  ];
  const users = [
    {email:"sophie.diallo@example.com", password:"client123", role:"Client", idClient:"CL-001"},
    {email:"moussa.ndiaye@example.com", password:"client123", role:"Client", idClient:"CL-002"},
    {email:"reception@terangapalace.sn", password:"reception123", role:"Réceptionniste"},
    {email:"manager@terangapalace.sn", password:"manager123", role:"Gestionnaire"},
  ];

  const db = {version:DB_VERSION, counters:{reservation:100,sejour:40,paiement:60,facture:40}, clients, chambres, users, reservations:[], sejours:[], paiements:[], factures:[]};

  // -------- réservations / séjours / paiements / factures de démonstration --------
  function addReservation(idClient, numeroChambre, arr, dep, nb, statut){
    const chambre = chambres.find(c=>c.numeroChambre===numeroChambre);
    const nuits = nightsBetween(arr,dep);
    const id = "TP-2026-"+pad(db.counters.reservation++,5);
    const r = {id, idClient, numeroChambre, dateArrivee:arr, dateDepart:dep, nbPersonnes:nb, montant:nuits*chambre.prixParNuit, statut, dateCreation:arr};
    db.reservations.push(r);
    return r;
  }
  function addSejour(reservation, statut, depReelle){
    const chambre = chambres.find(c=>c.numeroChambre===reservation.numeroChambre);
    const idSejour = "SJ-"+pad(db.counters.sejour++,4);
    const s = {idSejour, idReservation:reservation.id, idClient:reservation.idClient, numeroChambre:reservation.numeroChambre,
      dateArriveeReelle:reservation.dateArrivee, dateDepartReelle: depReelle||reservation.dateDepart, montantTotal:reservation.montant, statut};
    db.sejours.push(s);
    return s;
  }
  function addPaiement(idSejour, montant, mode, date){
    const idPaiement = "PM-"+pad(db.counters.paiement++,4);
    db.paiements.push({idPaiement, idSejour, datePaiement:date, montant, modePaiement:mode});
  }
  function addFacture(sejour){
    const paye = db.paiements.filter(p=>p.idSejour===sejour.idSejour).reduce((s,p)=>s+p.montant,0);
    let statut = "Non payée";
    if(paye>=sejour.montantTotal) statut="Payée"; else if(paye>0) statut="Partiellement payée";
    const numeroFacture = "FA-2026-"+pad(db.counters.facture++,4);
    db.factures.push({numeroFacture, idSejour:sejour.idSejour, dateFacture:sejour.dateDepartReelle, montantTotal:sejour.montantTotal, statut});
  }

  // Réservation confirmée à venir (client connecté peut la voir)
  addReservation("CL-001","201","2026-08-22","2026-08-25",2,"Confirmée");
  addReservation("CL-002","301","2026-08-20","2026-08-23",3,"Confirmée");
  addReservation("CL-003","101","2026-08-24","2026-08-26",1,"Confirmée");
  addReservation("CL-005","203","2026-09-02","2026-09-05",2,"Confirmée");
  const rAnnulee = addReservation("CL-004","202","2026-08-18","2026-08-20",2,"Confirmée"); rAnnulee.statut="Annulée";

  // Séjour en cours (client déjà arrivé) -> chambre 202 occupée
  chambres.find(c=>c.numeroChambre==="202").statut="Occupée";
  const resEnCours = addReservation("CL-006","202","2026-08-14","2026-08-18",2,"Confirmée");
  addSejour(resEnCours,"En cours");
  addPaiement(db.sejours[0].idSejour, 50000, "Mobile Money", "2026-08-14");

  // Séjours terminés + paiements + factures (historique)
  const past1 = addReservation("CL-001","101","2026-07-10","2026-07-13",1,"Terminée");
  const sj1 = addSejour(past1,"Terminé","2026-07-13");
  addPaiement(sj1.idSejour, sj1.montantTotal, "Carte bancaire", "2026-07-13");
  addFacture(sj1);

  const past2 = addReservation("CL-003","301","2026-07-02","2026-07-06",3,"Terminée");
  const sj2 = addSejour(past2,"Terminé","2026-07-06");
  addPaiement(sj2.idSejour, 200000, "Espèces", "2026-07-06");
  addFacture(sj2);

  const past3 = addReservation("CL-005","201","2026-06-20","2026-06-24",2,"Terminée");
  const sj3 = addSejour(past3,"Terminé","2026-06-24");
  addPaiement(sj3.idSejour, sj3.montantTotal, "Mobile Money", "2026-06-24");
  addFacture(sj3);

  const past4 = addReservation("CL-002","302","2026-06-05","2026-06-09",4,"Terminée");
  const sj4 = addSejour(past4,"Terminé","2026-06-09");
  addPaiement(sj4.idSejour, sj4.montantTotal*0.6, "Carte bancaire", "2026-06-09");
  addFacture(sj4);

  const past5 = addReservation("CL-004","203","2026-05-15","2026-05-17",2,"Terminée");
  const sj5 = addSejour(past5,"Terminé","2026-05-17");
  addPaiement(sj5.idSejour, sj5.montantTotal, "Espèces", "2026-05-17");
  addFacture(sj5);

  return db;
}

let DB = loadDB();
function reloadDB(){ DB = loadDB(); PHOTOS_HYDRATED = false; hydratePhotos(); }
hydratePhotos(); // charge/migre les photos depuis IndexedDB en tâche de fond, puis rafraîchit l'affichage

/* Débounce : quand plusieurs changements arrivent d'un coup (ex: réservation +
   séjour + facture créés en rafale), on ne relance qu'une seule synchronisation
   au lieu d'une par table touchée. */
let SB_REALTIME_DEBOUNCE = null;
function scheduleSyncFromSupabase(){
  clearTimeout(SB_REALTIME_DEBOUNCE);
  SB_REALTIME_DEBOUNCE = setTimeout(syncFromSupabase, 150);
}

/* Écoute en temps réel (WebSocket) les changements sur les tables partagées :
   dès qu'un client confirme une réservation sur un autre appareil/navigateur,
   Supabase pousse l'événement ici et la réception voit la mise à jour
   quasi instantanément (au lieu d'attendre le prochain polling). */
function subscribeRealtime(){
  if(!window.sb) return;
  const channel = window.sb.channel("tp-realtime-sync");
  Object.values(SB_TABLES).forEach(([table])=>{
    channel.on("postgres_changes", { event: "*", schema: "public", table }, scheduleSyncFromSupabase);
  });
  channel.subscribe((status)=>{
    if(status === "SUBSCRIBED") console.info("Realtime Supabase actif : synchronisation instantanée.");
    else if(status === "CHANNEL_ERROR" || status === "TIMED_OUT") console.warn("Realtime Supabase indisponible, le polling de secours prend le relais.", status);
  });
}

if(window.sb){
  syncFromSupabase(); // récupère l'état partagé au démarrage (réservations faites par d'autres, etc.)
  subscribeRealtime(); // synchronisation instantanée dès qu'une donnée change côté serveur
  setInterval(syncFromSupabase, 30000); // filet de secours si le Realtime se déconnecte (WiFi coupé, etc.)
}

/* ============================= SESSION ============================= */
function getSession(){ try{ return JSON.parse(sessionStorage.getItem("tp_session")||"null"); }catch(e){ return null; } }
function setSession(s){ sessionStorage.setItem("tp_session", JSON.stringify(s)); }
function clearSession(){ sessionStorage.removeItem("tp_session"); }

/* ============================= AVAILABILITY / BUSINESS LOGIC ============================= */
function overlap(aStart,aEnd,bStart,bEnd){ return aStart < bEnd && bStart < aEnd; }

function isRoomAvailable(numeroChambre, dateArrivee, dateDepart, excludeReservationId){
  const chambre = DB.chambres.find(c=>c.numeroChambre===numeroChambre);
  if(!chambre || chambre.statut==="Maintenance") return false;
  const a1 = new Date(dateArrivee), a2 = new Date(dateDepart);
  const clash = DB.reservations.some(r=>{
    if(r.numeroChambre!==numeroChambre) return false;
    if(r.statut!=="Confirmée") return false;
    if(excludeReservationId && r.id===excludeReservationId) return false;
    return overlap(a1,a2,new Date(r.dateArrivee),new Date(r.dateDepart));
  });
  return !clash;
}

function searchAvailableRooms(dateArrivee, dateDepart, nbPersonnes, type){
  return DB.chambres.filter(c=>{
    if(type && c.type!==type) return false;
    if(c.capacite < nbPersonnes) return false;
    return isRoomAvailable(c.numeroChambre, dateArrivee, dateDepart);
  });
}

function findOrCreateClient({nom,prenom,email,telephone,adresse}){
  let c = DB.clients.find(x=>x.email.toLowerCase()===email.toLowerCase());
  if(c){ c.nom=nom; c.prenom=prenom; c.telephone=telephone; if(adresse) c.adresse=adresse; return c; }
  const idClient = "CL-"+pad(DB.clients.length+1,3);
  c = {idClient, nom, prenom, telephone, email, adresse:adresse||""};
  DB.clients.push(c);
  return c;
}

function createReservation({idClient, numeroChambre, dateArrivee, dateDepart, nbPersonnes}){
  // Sécurité : re-vérification finale avant confirmation (empêche la double réservation)
  if(!isRoomAvailable(numeroChambre, dateArrivee, dateDepart)){
    return {ok:false, error:"Cette chambre vient d'être réservée. Veuillez sélectionner une autre chambre."};
  }
  const chambre = DB.chambres.find(c=>c.numeroChambre===numeroChambre);
  const nuits = nightsBetween(dateArrivee, dateDepart);
  const id = "TP-2026-"+pad(DB.counters.reservation++,5);
  const r = {id, idClient, numeroChambre, dateArrivee, dateDepart, nbPersonnes, montant:nuits*chambre.prixParNuit, statut:"Confirmée", dateCreation: todayStr()};
  DB.reservations.push(r);
  save();
  return {ok:true, reservation:r};
}

function cancelReservation(id){
  const r = DB.reservations.find(x=>x.id===id);
  if(!r) return;
  r.statut = "Annulée"; // la chambre redevient disponible automatiquement (filtrage par statut)
  save();
}

function checkinReservation(reservationId){
  const r = DB.reservations.find(x=>x.id===reservationId);
  if(!r) return {ok:false, error:"Aucune réservation trouvée avec cet identifiant."};
  if(r.statut!=="Confirmée") return {ok:false, error:"Cette réservation n'est pas confirmée (statut : "+r.statut+")."};
  if(DB.sejours.some(s=>s.idReservation===r.id)) return {ok:false, error:"Un séjour existe déjà pour cette réservation."};
  const idSejour = "SJ-"+pad(DB.counters.sejour++,4);
  const s = {idSejour, idReservation:r.id, idClient:r.idClient, numeroChambre:r.numeroChambre, dateArriveeReelle: todayStr(), dateDepartReelle:null, montantTotal:r.montant, statut:"En cours"};
  DB.sejours.push(s);
  const chambre = DB.chambres.find(c=>c.numeroChambre===r.numeroChambre);
  chambre.statut = "Occupée";
  save();
  return {ok:true, sejour:s};
}

function checkoutSejour(idSejour){
  const s = DB.sejours.find(x=>x.idSejour===idSejour);
  if(!s) return {ok:false,error:"Séjour introuvable."};
  s.dateDepartReelle = todayStr();
  s.statut = "Terminé";
  const chambre = DB.chambres.find(c=>c.numeroChambre===s.numeroChambre);
  chambre.statut = "Disponible";
  const r = DB.reservations.find(x=>x.id===s.idReservation);
  if(r) r.statut = "Terminée";
  // Génère la facture si elle n'existe pas déjà
  if(!DB.factures.some(f=>f.idSejour===s.idSejour)){
    const paye = DB.paiements.filter(p=>p.idSejour===s.idSejour).reduce((sum,p)=>sum+p.montant,0);
    let statut = "Non payée";
    if(paye>=s.montantTotal) statut="Payée"; else if(paye>0) statut="Partiellement payée";
    const numeroFacture = "FA-2026-"+pad(DB.counters.facture++,4);
    DB.factures.push({numeroFacture, idSejour:s.idSejour, dateFacture:s.dateDepartReelle, montantTotal:s.montantTotal, statut});
  }
  save();
  return {ok:true, sejour:s};
}

function addPaiement(idSejour, montant, modePaiement){
  const idPaiement = "PM-"+pad(DB.counters.paiement++,4);
  DB.paiements.push({idPaiement, idSejour, datePaiement: todayStr(), montant, modePaiement});
  // met à jour le statut de la facture si elle existe déjà
  const f = DB.factures.find(x=>x.idSejour===idSejour);
  if(f){
    const s = DB.sejours.find(x=>x.idSejour===idSejour);
    const paye = DB.paiements.filter(p=>p.idSejour===idSejour).reduce((sum,p)=>sum+p.montant,0);
    f.statut = paye>=s.montantTotal ? "Payée" : (paye>0 ? "Partiellement payée" : "Non payée");
  }
  save();
}

/* ============================= VALIDATION HELPERS ============================= */
function isEmailValid(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
function isPhoneValid(v){ return /^[+0-9 ()-]{7,20}$/.test(v); }
function markField(el, ok, msg){
  const field = el.closest(".field");
  if(!field) return ok;
  field.classList.toggle("invalid", !ok);
  const err = field.querySelector(".err");
  if(err && msg) err.textContent = msg;
  return ok;
}

