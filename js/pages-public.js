/* ==========================================================================
   PUBLIC PAGES
   ========================================================================== */
function pageAccueil(session){
  const chambresVedettes = DB.chambres.slice(0,3);
  return `
  <section class="hero-video-section" style="position:relative;color:var(--ivoire);overflow:hidden;background:radial-gradient(ellipse at 20% 0%, #16304d 0%, var(--bleu-nuit) 60%);">
    <div class="hero-video-bg" style="position:absolute;inset:0;">
      <div class="hero-video-overlay" style="position:absolute;inset:0;background:linear-gradient(90deg, rgba(10,20,35,0.92) 0%, rgba(10,20,35,0.75) 35%, rgba(10,20,35,0.35) 65%, rgba(10,20,35,0.15) 100%);"></div>
    </div>

    <div style="position:absolute;top:0;right:0;width:50%;height:100%;overflow:hidden;z-index:1;">
      <video autoplay muted loop playsinline
             style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;background:#0a1423;"
             onerror="this.style.display='none';">
        <source src="assets/video/hero.mp4" type="video/mp4">
      </video>
      <svg viewBox="0 0 420 460" style="position:absolute;inset:0;width:100%;height:100%;">
        <defs>
          <linearGradient id="archGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#e6cd93"/><stop offset="100%" stop-color="#c9a15a"/>
          </linearGradient>
        </defs>
        <path d="M40 440 V220 C40 110 120 40 210 40 C300 40 380 110 380 220 V440" fill="none" stroke="url(#archGrad)" stroke-width="3"/>
        <path d="M80 440 V235 C80 145 138 90 210 90 C282 90 340 145 340 235 V440" fill="none" stroke="rgba(230,205,147,.45)" stroke-width="1.4"/>
        <path d="M120 440 V245 C120 178 158 138 210 138 C262 138 300 178 300 245 V440" fill="none" stroke="rgba(230,205,147,.28)" stroke-width="1"/>
        <circle cx="210" cy="245" r="3" fill="#c9a15a"/>
        <line x1="10" y1="440" x2="410" y2="440" stroke="#c9a15a" stroke-width="2"/>
        <text x="210" y="405" text-anchor="middle" fill="#faf6ec" font-family="Cormorant Garamond, serif" font-size="15" letter-spacing="4" opacity="0.85">TERANGA</text>
      </svg>
    </div>

    <div style="position:relative;z-index:2;width:100%;max-width:1240px;margin:0 auto;padding:150px 28px 90px;display:flex;align-items:center;justify-content:flex-start;gap:40px;flex-wrap:wrap;">
      <div style="max-width:640px;flex:1 1 460px;">
        <div class="eyebrow">Hôtel 5 étoiles · Dakar, Sénégal</div>
        <h1 style="font-size:60px;line-height:1.05;margin-top:18px;">Teranga Palace</h1>
        <p style="font-size:19px;font-family:var(--serif);font-style:italic;color:var(--or-clair);margin-top:14px;">L'élégance sénégalaise au cœur de Dakar</p>
        <p style="margin-top:22px;color:rgba(250,246,236,.8);font-size:15.5px;line-height:1.8;max-width:460px;">Entre océan Atlantique et art de vivre sénégalais, Teranga Palace vous accueille dans un cadre où chaque détail — de la chambre à la table — est pensé pour la sérénité de votre séjour.</p>
        <div style="display:flex;gap:14px;margin-top:34px;flex-wrap:wrap;">
          <a href="#/reserver" class="btn btn-gold">Réserver une chambre</a>
          <a href="#/chambres" class="btn btn-outline-light">Découvrir nos chambres</a>
        </div>
      </div>
    </div>
</section>

  <section class="section">
    <div class="section-head">
      <div class="eyebrow">L'établissement</div>
      <h2>Une hospitalité pensée dans les moindres détails</h2>
      <p>Teranga signifie « hospitalité » en wolof — c'est la promesse que nous tenons depuis notre porte d'entrée jusqu'à votre chambre. 48 chambres et suites, un restaurant gastronomique, une piscine à débordement face à l'océan et une équipe attentive à chaque étape de votre séjour.</p>
    </div>
    <div class="grid-4" style="display:grid;gap:26px;">
      ${[
        ["Emplacement","Corniche Ouest, à deux pas du centre d'affaires et des plages de Dakar."],
        ["Restauration","Cuisine sénégalaise et internationale, produits locaux et de saison."],
        ["Bien-être","Piscine à débordement, spa et salle de sport ouverts toute la journée."],
        ["Service","Réception ouverte 24h/24, conciergerie et transferts aéroport."]
      ].map(([t,d])=>`<div><h4 style="font-size:19px;margin-bottom:8px;">${t}</h4><p style="font-size:13.5px;color:var(--text-soft);line-height:1.7;">${d}</p></div>`).join("")}
    </div>
  </section>

  <section class="section section-tight" style="background:var(--sable);">
    <div class="section-head" style="margin-bottom:34px;">
      <div class="eyebrow">Nos chambres</div>
      <h2>Un cadre pour chaque séjour</h2>
    </div>
    <div class="room-grid">${chambresVedettes.map(roomCard).join("")}</div>
    <div style="text-align:center;margin-top:34px;"><a href="#/chambres" class="btn btn-dark">Voir toutes les chambres</a></div>
  </section>

  <section class="section section-dark">
    <div class="section-head"><div class="eyebrow">L'expérience client</div><h2>Réservez en toute confiance</h2>
    <p>Disponibilités vérifiées en temps réel, confirmation immédiate et gestion simple de vos réservations en ligne.</p></div>
    <div class="grid-4" style="display:grid;gap:1px;background:rgba(250,246,236,.12);">
      ${[["01","Choisissez vos dates","Arrivée, départ et nombre de personnes."],
         ["02","Sélectionnez une chambre","Parmi les chambres réellement disponibles."],
         ["03","Confirmez","Le prix est calculé automatiquement."],
         ["04","Recevez votre confirmation","Un identifiant unique vous est attribué."]]
        .map(([n,t,d])=>`<div style="background:var(--bleu-nuit);padding:26px 22px;">
          <div style="color:var(--or);font-family:var(--serif);font-size:26px;">${n}</div>
          <div style="font-weight:600;margin:10px 0 6px;">${t}</div>
          <div style="font-size:12.5px;color:rgba(250,246,236,.6);line-height:1.6;">${d}</div></div>`).join("")}
    </div>
  </section>

  <!-- ===== LOCALISATION ===== -->
    <section id="localisation" class="location">
<div class="location-text">
<p class="eyebrow">Emplacement</p>
<h2>Au cœur de Dakar</h2>
<p>Teranga Palace se situe à proximité de la Corniche Ouest, à quelques minutes des
                principaux quartiers d'affaires et des sites emblématiques de la capitale sénégalaise.</p>
<ul class="contact-list">
<li><strong>Adresse</strong> — Corniche Ouest, Dakar, Sénégal</li>
<li><strong>Téléphone</strong> — +221 33 800 00 00</li>
<li><strong>Email</strong> — reservations@terangapalace.sn</li>
</ul>
</div>
<div class="location-map">
<iframe title="Carte de Dakar" src="https://www.google.com/maps?q=Dakar,Senegal&output=embed"
loading="lazy">
</iframe>
</div>
</section>`;
}

function roomCard(c){
  const statusBadge = c.statut==="Disponible" ? '<span class="badge badge-solid badge-green">Disponible</span>'
    : c.statut==="Occupée" ? '<span class="badge badge-solid badge-red">Occupée</span>'
    : '<span class="badge badge-solid badge-gray">Maintenance</span>';
  const visual = roomImageTag(c, "width:100%;height:100%;object-fit:cover;");
  return `<div class="room-card">
    <div class="room-visual" style="background:var(--bleu-nuit);">
      ${visual}
      <div style="position:absolute;top:12px;left:12px;">${statusBadge}</div>
    </div>
    <div class="room-body">
      <div class="type">Chambre ${c.type}</div>
      <div class="room-meta">
        <span>${ic('users')} ${c.capacite} pers.</span>
        <span>N° ${c.numeroChambre}</span>
      </div>
      <p style="font-size:12.5px;color:var(--text-soft);line-height:1.6;min-height:38px;">${c.description}</p>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-top:14px;">
        <div class="room-price">${fmtMoney(c.prixParNuit)} <span>/ nuit</span></div>
        <a href="#/reserver?chambre=${c.numeroChambre}" class="btn btn-outline btn-sm">Réserver</a>
      </div>
    </div>
  </div>`;
}

function pageChambres(){
  const types = ["Tous","Simple","Double","Suite"];
  return `
  <section class="section-tight" style="background:var(--bleu-nuit);color:var(--ivoire);">
    <div class="section" style="padding:60px 28px 0;">
      <div class="eyebrow">Hébergement</div>
      <h2 style="font-size:38px;margin-top:10px;">Nos chambres &amp; suites</h2>
      <p style="color:rgba(250,246,236,.65);margin-top:12px;max-width:600px;">De la chambre Simple à la Suite Présidentielle, chaque espace conjugue confort moderne et raffinement sénégalais.</p>
    </div>
  </section>
  <section class="section">
    <div style="display:flex;gap:10px;margin-bottom:30px;flex-wrap:wrap;">
      ${types.map(t=>`<button class="btn btn-sm ${t==='Tous'?'btn-dark':'btn-outline'}" data-filter-type="${t}">${t}</button>`).join("")}
    </div>
    <div class="room-grid" id="rooms-grid">${DB.chambres.map(roomCard).join("")}</div>
  </section>`;
}
function wireChambres(){
  document.querySelectorAll("[data-filter-type]").forEach(btn=>{
    btn.onclick = ()=>{
      document.querySelectorAll("[data-filter-type]").forEach(b=>{ b.classList.remove("btn-dark"); b.classList.add("btn-outline"); });
      btn.classList.add("btn-dark"); btn.classList.remove("btn-outline");
      const t = btn.dataset.filterType;
      const filtered = t==="Tous" ? DB.chambres : DB.chambres.filter(c=>c.type===t);
      document.getElementById("rooms-grid").innerHTML = filtered.length ? filtered.map(roomCard).join("") : emptyState("Aucune chambre dans cette catégorie.");
    };
  });
}

function emptyState(msg){
  return `<div class="empty-state" style="grid-column:1/-1;">${ic('empty')}<h4>Rien à afficher</h4><p>${msg}</p></div>`;
}

/* ---------------------------- PAGE RÉSERVER ---------------------------- */
/* Si la session dit "Client" mais que le compte correspondant n'existe plus
   dans DB.clients (ex: base réinitialisée entre-temps côté Supabase), on
   traite la session comme invalide plutôt que de sauter à l'étape 2 avec un
   champ email vide, en lecture seule et obligatoire : ça bloquait totalement
   la réservation, sans aucun moyen de corriger depuis l'interface. */
function resolveClientSession(session){
  if(session && session.role === "Client" && !DB.clients.find(c=>c.idClient===session.idClient)){
    return null;
  }
  return session;
}

function pageReserver(rawSession){
  const session = resolveClientSession(rawSession);
  const preselect = routeQuery().chambre || "";
  const prefill = session && session.role==="Client" ? DB.clients.find(c=>c.idClient===session.idClient) : null;
  return `
  <section class="section" style="padding-top:56px;">
    <div class="section-head"><div class="eyebrow">Réservation</div><h2>Réserver une chambre</h2>
      <p>${session ? "Indiquez vos dates et le nombre de personnes : nous vérifions la disponibilité en temps réel avant toute confirmation." : "Connectez-vous ou créez votre compte pour commencer, puis indiquez vos dates : nous vérifions la disponibilité en temps réel avant toute confirmation."}</p></div>

    <div class="stepper" id="stepper">
      <div class="step ${session?'done':'active'}" data-step="1"><span class="num">1</span> Identification</div><div class="step-sep"></div>
      <div class="step ${session?'active':''}" data-step="2"><span class="num">2</span> Dates</div><div class="step-sep"></div>
      <div class="step" data-step="3"><span class="num">3</span> Chambre</div><div class="step-sep"></div>
      <div class="step" data-step="4"><span class="num">4</span> Vos informations</div><div class="step-sep"></div>
      <div class="step" data-step="5"><span class="num">5</span> Confirmation</div>
    </div>

    <div class="panel" style="max-width:900px;">
      <!-- ÉTAPE 1 : identification (connexion ou création de compte) -->
      <div id="res-step-1" class="${session?'hidden':''}">
        <p style="font-size:13px;color:var(--text-soft);margin-bottom:18px;">Pour réserver, connectez-vous à votre compte ou créez-en un. C'est nécessaire avant de pouvoir choisir vos dates et votre chambre.</p>
        <div style="display:flex;gap:10px;margin-bottom:22px;">
          <button class="btn btn-sm btn-dark" id="auth-tab-login" data-auth-tab="login">J'ai déjà un compte</button>
          <button class="btn btn-sm btn-outline" id="auth-tab-signup" data-auth-tab="signup">Créer un compte</button>
        </div>

        <div id="auth-login-panel">
          <div class="field"><label>Email</label><input type="email" id="auth-lg-email"><span class="err">Veuillez saisir un email valide.</span></div>
          <div class="field"><label>Mot de passe</label><input type="password" id="auth-lg-pass"><span class="err">Veuillez renseigner votre mot de passe.</span></div>
          <p id="auth-login-error" style="color:var(--rouge);font-size:12.5px;margin-bottom:10px;"></p>
          <button class="btn btn-gold" id="btn-auth-login">Se connecter et continuer</button>
        </div>

        <div id="auth-signup-panel" class="hidden">
          <div class="form-grid">
            <div class="field"><label>Nom</label><input type="text" id="auth-su-nom"><span class="err">Le nom est obligatoire.</span></div>
            <div class="field"><label>Prénom</label><input type="text" id="auth-su-prenom"><span class="err">Le prénom est obligatoire.</span></div>
            <div class="field"><label>Email</label><input type="email" id="auth-su-email"><span class="err">Veuillez saisir un email valide.</span></div>
            <div class="field"><label>Téléphone</label><input type="tel" id="auth-su-tel"><span class="err">Veuillez saisir un téléphone valide.</span></div>
            <div class="field"><label>Mot de passe</label><input type="password" id="auth-su-pass"><span class="err">Le mot de passe doit contenir au moins 6 caractères.</span></div>
            <div class="field"><label>Confirmer le mot de passe</label><input type="password" id="auth-su-pass2"><span class="err">Les mots de passe ne correspondent pas.</span></div>
          </div>
          <p id="auth-signup-error" style="color:var(--rouge);font-size:12.5px;margin-bottom:10px;"></p>
          <button class="btn btn-gold" id="btn-auth-signup">Créer mon compte et continuer</button>
        </div>
      </div>

      <!-- ÉTAPE 2 : dates -->
      <div id="res-step-2" class="hidden">
        <div class="form-grid">
          <div class="field"><label>Date d'arrivée</label><input type="date" id="r-arrivee" min="${todayStr()}"><span class="err">Veuillez indiquer une date d'arrivée.</span></div>
          <div class="field"><label>Date de départ</label><input type="date" id="r-depart"><span class="err">La date de départ doit être postérieure à la date d'arrivée.</span></div>
          <div class="field"><label>Nombre de personnes</label><input type="number" id="r-personnes" min="1" max="6" value="2"><span class="err">Veuillez indiquer un nombre de personnes valide.</span></div>
          <div class="field"><label>Type de chambre (optionnel)</label>
            <select id="r-type"><option value="">Tous types</option><option value="Simple">Simple</option><option value="Double">Double</option><option value="Suite">Suite</option></select>
          </div>
        </div>
        <button class="btn btn-gold" id="btn-search-rooms">${ic('search')} Vérifier la disponibilité</button>
      </div>

      <!-- ÉTAPE 3 : sélection chambre -->
      <div id="res-step-3" class="hidden">
        <div id="rooms-results"></div>
        <button class="btn btn-outline btn-sm" id="btn-back-2" style="margin-top:16px;">← Modifier les dates</button>
      </div>

      <!-- ÉTAPE 4 : infos client -->
      <div id="res-step-4" class="hidden">
        <div id="price-summary" style="background:var(--ivoire);padding:18px 20px;margin-bottom:22px;border-left:3px solid var(--or);"></div>
        <div class="form-grid">
          <div class="field"><label>Nom</label><input type="text" id="c-nom" value="${prefill?prefill.nom:''}"><span class="err">Le nom est obligatoire.</span></div>
          <div class="field"><label>Prénom</label><input type="text" id="c-prenom" value="${prefill?prefill.prenom:''}"><span class="err">Le prénom est obligatoire.</span></div>
          <div class="field"><label>Email (compte)</label><input type="email" id="c-email" value="${prefill?prefill.email:''}" readonly style="background:var(--sable);cursor:not-allowed;"><span class="err">Veuillez saisir un email valide.</span></div>
          <div class="field"><label>Téléphone</label><input type="tel" id="c-tel" value="${prefill?prefill.telephone:''}"><span class="err">Veuillez saisir un téléphone valide.</span></div>
        </div>
        <div style="display:flex;gap:10px;">
          <button class="btn btn-outline btn-sm" id="btn-back-3">← Changer de chambre</button>
          <button class="btn btn-gold" id="btn-confirm-res">Confirmer la réservation</button>
        </div>
      </div>

      <!-- ÉTAPE 5 : confirmation -->
      <div id="res-step-5" class="hidden"></div>
    </div>
  </section>`;
}

let RES_STATE = {};
function wireReserver(rawSession){
  RES_STATE = {};
  let currentSession = resolveClientSession(rawSession); // devient actif une fois la connexion / création de compte faite à l'étape 1
  const q = routeQuery();
  const goStep = (n)=>{
    [1,2,3,4,5].forEach(i=>document.getElementById("res-step-"+i).classList.toggle("hidden", i!==n));
    document.querySelectorAll("#stepper .step").forEach(s=>{
      const sn = parseInt(s.dataset.step,10);
      s.classList.toggle("active", sn===n);
      s.classList.toggle("done", sn<n);
    });
  };

  // Pré-remplit et verrouille les infos de contact à partir du compte identifié
  const fillInfoFromSession = ()=>{
    const client = currentSession && currentSession.idClient ? DB.clients.find(c=>c.idClient===currentSession.idClient) : null;
    if(!client) return;
    document.getElementById("c-nom").value = client.nom;
    document.getElementById("c-prenom").value = client.prenom;
    document.getElementById("c-email").value = client.email;
    document.getElementById("c-tel").value = client.telephone;
  };

  /* ---------------- Étape 1 : identification (connexion / création de compte) ---------------- */
  const authTabLogin = document.getElementById("auth-tab-login");
  const authTabSignup = document.getElementById("auth-tab-signup");
  const loginPanel = document.getElementById("auth-login-panel");
  const signupPanel = document.getElementById("auth-signup-panel");
  wirePasswordToggle("auth-lg-pass");
  wirePasswordToggle("auth-su-pass");
  wirePasswordToggle("auth-su-pass2");
  authTabLogin.onclick = ()=>{
    authTabLogin.classList.add("btn-dark"); authTabLogin.classList.remove("btn-outline");
    authTabSignup.classList.add("btn-outline"); authTabSignup.classList.remove("btn-dark");
    loginPanel.classList.remove("hidden"); signupPanel.classList.add("hidden");
  };
  authTabSignup.onclick = ()=>{
    authTabSignup.classList.add("btn-dark"); authTabSignup.classList.remove("btn-outline");
    authTabLogin.classList.add("btn-outline"); authTabLogin.classList.remove("btn-dark");
    signupPanel.classList.remove("hidden"); loginPanel.classList.add("hidden");
  };

  document.getElementById("btn-auth-login").onclick = ()=>{
    const email = document.getElementById("auth-lg-email"), pass = document.getElementById("auth-lg-pass");
    let valid = true;
    valid = markField(email, isEmailValid(email.value), "Veuillez saisir un email valide.") && valid;
    valid = markField(pass, !!pass.value) && valid;
    if(!valid) return;
    const user = DB.users.find(u=>u.email.toLowerCase()===email.value.toLowerCase() && u.password===pass.value);
    if(!user){ document.getElementById("auth-login-error").textContent = "Email ou mot de passe incorrect."; return; }
    if(user.role!=="Client"){ document.getElementById("auth-login-error").textContent = "Ce compte n'est pas un compte client."; return; }
    document.getElementById("auth-login-error").textContent = "";
    const client = DB.clients.find(c=>c.idClient===user.idClient);
    currentSession = {email:user.email, role:user.role, idClient:user.idClient, prenom: client?client.prenom:user.role};
    setSession(currentSession);
    toast("Connexion réussie","Bienvenue "+(client?client.prenom:user.role)+".");
    afterIdentification();
  };

  document.getElementById("btn-auth-signup").onclick = ()=>{
    const nom = document.getElementById("auth-su-nom"), prenom = document.getElementById("auth-su-prenom"),
          email = document.getElementById("auth-su-email"), tel = document.getElementById("auth-su-tel"),
          pass = document.getElementById("auth-su-pass"), pass2 = document.getElementById("auth-su-pass2");
    let valid = true;
    valid = markField(nom, !!nom.value.trim()) && valid;
    valid = markField(prenom, !!prenom.value.trim()) && valid;
    valid = markField(email, isEmailValid(email.value), "Veuillez saisir un email valide.") && valid;
    valid = markField(tel, isPhoneValid(tel.value), "Veuillez saisir un téléphone valide.") && valid;
    valid = markField(pass, pass.value.length>=6, "Le mot de passe doit contenir au moins 6 caractères.") && valid;
    valid = markField(pass2, pass2.value===pass.value && pass.value.length>=6, "Les mots de passe ne correspondent pas.") && valid;
    if(!valid){ toast("Formulaire incomplet","Veuillez corriger les champs indiqués.", true); return; }
    const errEl = document.getElementById("auth-signup-error");
    if(DB.users.some(u=>u.email.toLowerCase()===email.value.trim().toLowerCase())){
      errEl.textContent = "Un compte existe déjà avec cet email. Veuillez vous connecter.";
      return;
    }
    errEl.textContent = "";
    const client = findOrCreateClient({nom:nom.value.trim(), prenom:prenom.value.trim(), email:email.value.trim(), telephone:tel.value.trim()});
    DB.users.push({email:client.email, password:pass.value, role:"Client", idClient:client.idClient});
    save();
    currentSession = {email:client.email, role:"Client", idClient:client.idClient, prenom:client.prenom};
    setSession(currentSession);
    toast("Compte créé","Bienvenue "+client.prenom+", votre compte a été enregistré.");
    afterIdentification();
  };

  // Une fois identifié : on passe aux dates, et si une chambre était présélectionnée on relance la recherche
  const afterIdentification = ()=>{
    goStep(2);
    if(preselect){
      document.getElementById("r-arrivee").value = todayStr();
      const d = new Date(); d.setDate(d.getDate()+3);
      document.getElementById("r-depart").value = d.toISOString().slice(0,10);
      setTimeout(()=>{ document.getElementById("btn-search-rooms").click(); }, 0);
    }
  };

  /* ---------------- Étape 2 : dates ---------------- */
  document.getElementById("btn-search-rooms").onclick = ()=>{
    if(!currentSession || !currentSession.idClient){
      toast("Identification requise","Veuillez vous connecter ou créer un compte avant de réserver.", true);
      goStep(1);
      return;
    }
    const arrivee = document.getElementById("r-arrivee");
    const depart = document.getElementById("r-depart");
    const personnes = document.getElementById("r-personnes");
    let valid = true;
    valid = markField(arrivee, !!arrivee.value) && valid;
    valid = markField(depart, !!depart.value && depart.value > arrivee.value, "La date de départ doit être postérieure à la date d'arrivée.") && valid;
    valid = markField(personnes, personnes.value>=1) && valid;
    if(!valid){ toast("Champs manquants","Veuillez renseigner tous les champs.", true); return; }

    const type = document.getElementById("r-type").value;
    const nb = parseInt(personnes.value,10);
    RES_STATE = {dateArrivee:arrivee.value, dateDepart:depart.value, nbPersonnes:nb};
    const rooms = searchAvailableRooms(arrivee.value, depart.value, nb, type||null);
    const resultsEl = document.getElementById("rooms-results");
    if(!rooms.length){
      resultsEl.innerHTML = `<div class="empty-state">${ic('empty')}<h4>Aucune chambre disponible</h4><p>Aucune chambre disponible pour ces dates. Essayez d'autres dates ou un autre type de chambre.</p></div>`;
    } else {
      const nuits = nightsBetween(arrivee.value, depart.value);
      resultsEl.innerHTML = `<p style="font-size:13px;color:var(--text-soft);margin-bottom:16px;">${rooms.length} chambre(s) disponible(s) pour ${nuits} nuit(s), du ${fmtDate(arrivee.value)} au ${fmtDate(depart.value)}.</p>
        <div class="room-grid">` + rooms.map(c=>`
          <div class="room-card" style="cursor:pointer;" data-pick-room="${c.numeroChambre}">
            <div class="room-visual" style="background:linear-gradient(135deg,#122a44,#c9a15a22);">
              ${roomImageTag(c, "width:100%;height:100%;object-fit:cover;")}
            </div>
            <div class="room-body">
              <div class="type">Chambre ${c.type}</div>
              <div class="room-meta"><span>${ic('users')} ${c.capacite} pers.</span><span>N° ${c.numeroChambre}</span></div>
              <div class="room-price">${fmtMoney(c.prixParNuit)} <span>/ nuit</span></div>
              <div style="font-size:12px;color:var(--vert);margin-top:6px;">Total séjour : ${fmtMoney(c.prixParNuit*nuits)}</div>
              <button class="btn btn-gold btn-sm btn-block" style="margin-top:12px;">Choisir cette chambre</button>
            </div>
          </div>`).join("") + `</div>`;
      resultsEl.querySelectorAll("[data-pick-room]").forEach(card=>{
        card.onclick = ()=>{
          const numero = card.dataset.pickRoom;
          const chambre = DB.chambres.find(c=>c.numeroChambre===numero);
          RES_STATE.numeroChambre = numero;
          const nuits2 = nightsBetween(RES_STATE.dateArrivee, RES_STATE.dateDepart);
          document.getElementById("price-summary").innerHTML = `
            <div style="display:flex;justify-content:space-between;font-size:13.5px;margin-bottom:6px;"><span>Chambre ${chambre.type} N° ${chambre.numeroChambre}</span><span>${fmtMoney(chambre.prixParNuit)} / nuit</span></div>
            <div style="display:flex;justify-content:space-between;font-size:13.5px;margin-bottom:6px;color:var(--text-soft);"><span>${fmtDate(RES_STATE.dateArrivee)} → ${fmtDate(RES_STATE.dateDepart)}</span><span>${nuits2} nuit(s)</span></div>
            <div style="display:flex;justify-content:space-between;font-family:var(--serif);font-size:20px;margin-top:10px;padding-top:10px;border-top:1px solid rgba(11,27,46,.1);"><span>Montant total</span><span>${fmtMoney(chambre.prixParNuit*nuits2)}</span></div>`;
          fillInfoFromSession();
          goStep(4);
        };
      });
    }
    goStep(3);
  };

  document.getElementById("btn-back-2").onclick = ()=>goStep(2);
  document.getElementById("btn-back-3").onclick = ()=>goStep(3);

  const wireConfirm = ()=>{
    const btn = document.getElementById("btn-confirm-res");
    if(!btn) return;
    btn.onclick = ()=>{
      if(!currentSession || !currentSession.idClient){
        // Sécurité : la réservation exige une identification préalable (étape 1)
        toast("Identification requise","Veuillez vous connecter ou créer un compte avant de réserver.", true);
        goStep(1);
        return;
      }
      const nom = document.getElementById("c-nom"), prenom = document.getElementById("c-prenom"),
            email = document.getElementById("c-email"), tel = document.getElementById("c-tel");
      let valid = true;
      valid = markField(nom, !!nom.value.trim()) && valid;
      valid = markField(prenom, !!prenom.value.trim()) && valid;
      valid = markField(email, isEmailValid(email.value), "Veuillez saisir un email valide.") && valid;
      valid = markField(tel, isPhoneValid(tel.value), "Veuillez saisir un téléphone valide.") && valid;
      if(!valid){ toast("Formulaire incomplet","Veuillez renseigner tous les champs.", true); return; }

      btn.innerHTML = `<span class="loader"></span> Traitement...`; btn.disabled = true;
      setTimeout(()=>{
        // Met à jour les coordonnées du compte du client déjà identifié (pas de nouveau compte anonyme)
        const client = DB.clients.find(c=>c.idClient===currentSession.idClient);
        client.nom = nom.value.trim(); client.prenom = prenom.value.trim(); client.telephone = tel.value.trim();
        save();
        const result = createReservation({idClient:client.idClient, numeroChambre:RES_STATE.numeroChambre, dateArrivee:RES_STATE.dateArrivee, dateDepart:RES_STATE.dateDepart, nbPersonnes:RES_STATE.nbPersonnes});
        if(!result.ok){
          toast("Réservation impossible", result.error, true);
          btn.innerHTML = "Confirmer la réservation"; btn.disabled = false;
          goStep(3);
          return;
        }
        document.getElementById("res-step-5").innerHTML = `
          <div style="text-align:center;padding:20px 0;">
            <div style="color:var(--vert);">${ic('check')}</div>
            <h3 style="margin-top:14px;">Réservation confirmée</h3>
            <p style="color:var(--text-soft);margin:6px 0 20px;">ID : <b>${result.reservation.id}</b></p>
            <div class="panel" style="text-align:left;max-width:420px;margin:0 auto;">
              <div style="display:flex;justify-content:space-between;font-size:13.5px;padding:6px 0;"><span>Client</span><b>${client.prenom} ${client.nom}</b></div>
              <div style="display:flex;justify-content:space-between;font-size:13.5px;padding:6px 0;"><span>Chambre</span><b>N° ${RES_STATE.numeroChambre}</b></div>
              <div style="display:flex;justify-content:space-between;font-size:13.5px;padding:6px 0;"><span>Séjour</span><b>${fmtDate(RES_STATE.dateArrivee)} → ${fmtDate(RES_STATE.dateDepart)}</b></div>
              <div style="display:flex;justify-content:space-between;font-size:13.5px;padding:6px 0;"><span>Montant</span><b>${fmtMoney(result.reservation.montant)}</b></div>
            </div>
            <div style="display:flex;gap:10px;justify-content:center;margin-top:26px;">
              <a href="#/mes-reservations" class="btn btn-gold">Voir mes réservations</a>
              <a href="#/accueil" class="btn btn-outline">Retour à l'accueil</a>
            </div>
          </div>`;
        goStep(5);
        toast("Réservation confirmée", "ID : "+result.reservation.id);
      }, 500);
    };
  };
  wireConfirm();
  // re-wire confirm button whenever step 4 content changes
  const obs = new MutationObserver(wireConfirm);
  obs.observe(document.getElementById("res-step-4"), {childList:true, subtree:true});

  // Si déjà connecté à l'arrivée sur la page, on saute directement l'identification
  if(currentSession && currentSession.idClient){
    goStep(2);
    if(preselect){
      document.getElementById("r-arrivee").value = todayStr();
      const d = new Date(); d.setDate(d.getDate()+3);
      document.getElementById("r-depart").value = d.toISOString().slice(0,10);
      setTimeout(()=>{ document.getElementById("btn-search-rooms").click(); }, 0);
    }
  } else {
    goStep(1);
  }
}

/* ---------------------------- MES RÉSERVATIONS ---------------------------- */
function pageMesReservations(session){
  return `
  <section class="section" style="padding-top:56px;">
    <div class="section-head"><div class="eyebrow">Espace client</div><h2>Mes réservations</h2>
      <p>Consultez, modifiez ou annulez vos réservations à tout moment.</p></div>
    ${session && session.role==="Client" ? `<div id="my-res-list"></div>` : `
    <div class="panel" style="max-width:520px;">
      <p style="font-size:13.5px;color:var(--text-soft);margin-bottom:16px;">Connectez-vous à votre espace client, ou retrouvez une réservation avec son identifiant et votre email.</p>
      <div class="field"><label>Identifiant de réservation</label><input type="text" id="lookup-id" placeholder="TP-2026-00101"></div>
      <div class="field"><label>Email utilisé lors de la réservation</label><input type="email" id="lookup-email"></div>
      <button class="btn btn-gold btn-block" id="btn-lookup">Rechercher ma réservation</button>
      <div id="lookup-result" style="margin-top:20px;"></div>
      <p style="font-size:12.5px;text-align:center;margin-top:18px;">— ou — <a href="#/connexion" style="color:var(--or);text-decoration:underline;">connectez-vous</a></p>
    </div>`}
  </section>`;
}
function reservationRow(r, session, editable){
  const client = DB.clients.find(c=>c.idClient===r.idClient);
  const chambre = DB.chambres.find(c=>c.numeroChambre===r.numeroChambre);
  const badge = r.statut==="Confirmée" ? '<span class="badge badge-green">Confirmée</span>'
    : r.statut==="Annulée" ? '<span class="badge badge-red">Annulée</span>' : '<span class="badge badge-blue">Terminée</span>';
  return `<div class="panel" style="margin-bottom:16px;">
    <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px;align-items:flex-start;">
      <div>
        <div style="font-family:var(--serif);font-size:19px;">${r.id}</div>
        <div style="font-size:12.5px;color:var(--text-soft);margin-top:4px;">Chambre ${chambre?chambre.type:''} N° ${r.numeroChambre} · ${client?client.prenom+' '+client.nom:''}</div>
      </div>
      ${badge}
    </div>
    <div style="display:flex;gap:26px;margin-top:14px;flex-wrap:wrap;font-size:13px;">
      <div><span style="color:var(--text-soft);">Arrivée</span><br><b>${fmtDate(r.dateArrivee)}</b></div>
      <div><span style="color:var(--text-soft);">Départ</span><br><b>${fmtDate(r.dateDepart)}</b></div>
      <div><span style="color:var(--text-soft);">Personnes</span><br><b>${r.nbPersonnes}</b></div>
      <div><span style="color:var(--text-soft);">Montant</span><br><b>${fmtMoney(r.montant)}</b></div>
    </div>
    ${editable && r.statut==="Confirmée" ? `<div class="row-actions" style="margin-top:16px;">
      <button class="btn btn-outline btn-sm" data-modify="${r.id}">Modifier</button>
      <button class="btn btn-danger btn-sm" data-cancel="${r.id}">Annuler</button>
    </div>` : ""}
  </div>`;
}
function wireMesReservations(session){
  if(session && session.role==="Client"){
    const list = DB.reservations.filter(r=>r.idClient===session.idClient).sort((a,b)=>b.dateCreation.localeCompare(a.dateCreation));
    const el = document.getElementById("my-res-list");
    el.innerHTML = list.length ? list.map(r=>reservationRow(r,session,true)).join("") : emptyState("Vous n'avez pas encore de réservation. <a href='#/reserver'>Réserver maintenant</a>");
    wireReservationActions(el, ()=>wireMesReservations(session));
    return;
  }
  const btn = document.getElementById("btn-lookup");
  if(!btn) return;
  btn.onclick = ()=>{
    const id = document.getElementById("lookup-id").value.trim();
    const email = document.getElementById("lookup-email").value.trim().toLowerCase();
    const r = DB.reservations.find(x=>x.id.toLowerCase()===id.toLowerCase());
    const c = r ? DB.clients.find(cl=>cl.idClient===r.idClient) : null;
    const resultEl = document.getElementById("lookup-result");
    if(!r || !c || c.email.toLowerCase()!==email){
      resultEl.innerHTML = `<p style="color:var(--rouge);font-size:13px;">Aucune réservation trouvée avec ces informations.</p>`;
      return;
    }
    resultEl.innerHTML = reservationRow(r, null, true);
    wireReservationActions(resultEl, ()=>btn.click());
  };
}
function wireReservationActions(container, refresh){
  container.querySelectorAll("[data-cancel]").forEach(b=>{
    b.onclick = ()=>{
      openModal(`<h3>Annuler la réservation</h3><p style="font-size:13.5px;color:var(--text-soft);">Confirmez-vous l'annulation de la réservation <b>${b.dataset.cancel}</b> ? La chambre sera libérée pour ces dates.</p>
      <div class="modal-actions"><button class="btn btn-outline btn-sm" id="modal-cancel-no">Retour</button><button class="btn btn-danger btn-sm" id="modal-cancel-yes">Confirmer l'annulation</button></div>`);
      document.getElementById("modal-cancel-no").onclick = closeModal;
      document.getElementById("modal-cancel-yes").onclick = ()=>{ cancelReservation(b.dataset.cancel); closeModal(); toast("Réservation annulée","La chambre est de nouveau disponible."); refresh(); };
    };
  });
  container.querySelectorAll("[data-modify]").forEach(b=>{
    b.onclick = ()=>{
      const r = DB.reservations.find(x=>x.id===b.dataset.modify);
      openModal(`<h3>Modifier la réservation</h3>
        <div class="field"><label>Date d'arrivée</label><input type="date" id="mod-arrivee" value="${r.dateArrivee}"></div>
        <div class="field"><label>Date de départ</label><input type="date" id="mod-depart" value="${r.dateDepart}"></div>
        <div class="field"><label>Nombre de personnes</label><input type="number" min="1" id="mod-nb" value="${r.nbPersonnes}"></div>
        <p id="mod-error" style="color:var(--rouge);font-size:12.5px;"></p>
        <div class="modal-actions"><button class="btn btn-outline btn-sm" id="modal-mod-no">Annuler</button><button class="btn btn-gold btn-sm" id="modal-mod-yes">Enregistrer</button></div>`);
      document.getElementById("modal-mod-no").onclick = closeModal;
      document.getElementById("modal-mod-yes").onclick = ()=>{
        const arr = document.getElementById("mod-arrivee").value, dep = document.getElementById("mod-depart").value, nb = parseInt(document.getElementById("mod-nb").value,10);
        if(!arr || !dep || dep<=arr){ document.getElementById("mod-error").textContent = "La date de départ doit être postérieure à la date d'arrivée."; return; }
        const chambre = DB.chambres.find(c=>c.numeroChambre===r.numeroChambre);
        if(nb > chambre.capacite){ document.getElementById("mod-error").textContent = "Le nombre de personnes dépasse la capacité de la chambre."; return; }
        if(!isRoomAvailable(r.numeroChambre, arr, dep, r.id)){ document.getElementById("mod-error").textContent = "Aucune chambre disponible pour ces dates."; return; }
        r.dateArrivee = arr; r.dateDepart = dep; r.nbPersonnes = nb;
        r.montant = nightsBetween(arr,dep) * chambre.prixParNuit;
        save(); closeModal(); toast("Réservation modifiée","Les nouvelles dates ont été enregistrées."); refresh();
      };
    };
  });
}

function pageApropos(){
  return `
  <section class="section" style="padding-top:60px;">
    <div class="section-head"><div class="eyebrow">Notre histoire</div><h2>À propos de Teranga Palace</h2>
      <p>Depuis la Corniche Ouest de Dakar, Teranga Palace réunit l'art de recevoir sénégalais et les standards internationaux de l'hôtellerie de luxe.</p></div>
    <div class="grid-2" style="display:grid;gap:60px;">
      <div>
        <h4 style="font-size:22px;margin-bottom:12px;">Une adresse pensée pour vous</h4>
        <p style="font-size:14px;color:var(--text-soft);line-height:1.8;">Face à l'océan Atlantique, l'hôtel propose 48 chambres et suites, un restaurant panoramique, une piscine à débordement et des espaces de bien-être. Chaque chambre a été conçue avec des matériaux locaux — bois, raphia, tissus wax — pour une ambiance à la fois luxueuse et chaleureuse.</p>
        <h4 style="font-size:22px;margin:26px 0 12px;">La Teranga, notre valeur cardinale</h4>
        <p style="font-size:14px;color:var(--text-soft);line-height:1.8;">« Teranga » désigne l'hospitalité, une valeur fondamentale de la culture sénégalaise. Chaque membre de notre équipe s'engage à faire de votre séjour une expérience mémorable, du premier contact jusqu'à votre retour.</p>
      </div>
      <div style="display:flex;flex-direction:column;gap:16px;">
        ${[["48","Chambres et suites"],["24/7","Réception et conciergerie"],["4.8/5","Satisfaction client moyenne"]].map(([n,l])=>`
        <div class="panel" style="display:flex;align-items:center;gap:18px;">
          <div style="font-family:var(--serif);font-size:34px;color:var(--or);">${n}</div>
          <div style="font-size:13.5px;color:var(--text-soft);">${l}</div>
        </div>`).join("")}
      </div>
    </div>
  </section>`;
}

function pageContact(){
  return `
  <section class="section" style="padding-top:60px;">
    <div class="section-head"><div class="eyebrow">Contact</div><h2>Nous contacter</h2><p>Une question sur votre réservation ou votre séjour ? Notre équipe vous répond rapidement.</p></div>
    <div class="grid-2" style="display:grid;gap:50px;">
      <div class="panel">
        <div class="field"><label>Nom complet</label><input type="text" id="ct-nom"><span class="err">Veuillez renseigner votre nom.</span></div>
        <div class="field"><label>Email</label><input type="email" id="ct-email"><span class="err">Veuillez saisir un email valide.</span></div>
        <div class="field"><label>Message</label><textarea id="ct-msg" rows="5"></textarea><span class="err">Veuillez renseigner tous les champs.</span></div>
        <button class="btn btn-gold btn-block" id="btn-send-contact">Envoyer le message</button>
      </div>
      <div>
        <h4 style="font-size:19px;margin-bottom:10px;">Coordonnées</h4>
        <p style="font-size:13.5px;color:var(--text-soft);line-height:2;">Corniche Ouest, Dakar, Sénégal<br>+221 33 820 00 00<br>contact@terangapalace.sn</p>
        <h4 style="font-size:19px;margin:24px 0 10px;">Horaires de réception</h4>
        <p style="font-size:13.5px;color:var(--text-soft);">Ouverte 24h/24, 7j/7</p>
      </div>
    </div>
  </section>`;
}
function wireContact(){
  document.getElementById("btn-send-contact").onclick = ()=>{
    const nom = document.getElementById("ct-nom"), email = document.getElementById("ct-email"), msg = document.getElementById("ct-msg");
    let valid = true;
    valid = markField(nom, !!nom.value.trim()) && valid;
    valid = markField(email, isEmailValid(email.value), "Veuillez saisir un email valide.") && valid;
    valid = markField(msg, !!msg.value.trim()) && valid;
    if(!valid){ toast("Formulaire incomplet","Veuillez renseigner tous les champs.", true); return; }
    toast("Message envoyé","Notre équipe vous répondra sous peu.");
    nom.value=""; email.value=""; msg.value="";
  };
}

/* ---------------------------- CONNEXION ---------------------------- */
function pageConnexion(session){
  if(session) return `<section class="section" style="padding-top:60px;text-align:center;"><p>Vous êtes déjà connecté en tant que ${session.email}.</p></section>`;
  return `
  <section class="section" style="padding-top:60px;max-width:460px;">
    <div class="section-head"><div class="eyebrow">Espace sécurisé</div><h2>Connexion</h2><p>Accédez à votre espace selon votre rôle.</p></div>
    <div class="panel">
      <div class="field"><label>Email</label><input type="email" id="lg-email"><span class="err">Veuillez saisir un email valide.</span></div>
      <div class="field"><label>Mot de passe</label><input type="password" id="lg-pass"><span class="err">Veuillez renseigner votre mot de passe.</span></div>
      <p id="login-error" style="color:var(--rouge);font-size:12.5px;margin-bottom:10px;"></p>
      <button class="btn btn-gold btn-block" id="btn-login">Se connecter</button>
      <p style="font-size:12px;color:var(--text-soft);margin-top:16px;text-align:center;">Pas encore de compte ? <a href="#/reserver" style="color:var(--or);text-decoration:underline;">Commencez une réservation</a> : la création de compte vous sera proposée avant la confirmation.</p>
    </div>
  </section>`;
}
function wireConnexion(){
  const btn = document.getElementById("btn-login");
  if(!btn) return;
  wirePasswordToggle("lg-pass");
  btn.onclick = ()=>{
    const email = document.getElementById("lg-email"), pass = document.getElementById("lg-pass");
    let valid = true;
    valid = markField(email, isEmailValid(email.value), "Veuillez saisir un email valide.") && valid;
    valid = markField(pass, !!pass.value) && valid;
    if(!valid) return;
    const user = DB.users.find(u=>u.email.toLowerCase()===email.value.toLowerCase() && u.password===pass.value);
    if(!user){ document.getElementById("login-error").textContent = "Email ou mot de passe incorrect."; return; }
    const client = user.idClient ? DB.clients.find(c=>c.idClient===user.idClient) : null;
    setSession({email:user.email, role:user.role, idClient:user.idClient||null, prenom: client?client.prenom:user.role});
    toast("Connexion réussie","Bienvenue "+ (client?client.prenom:user.role) +".");
    goto(user.role==="Client" ? "#/mes-reservations" : "#/admin/dashboard");
  };
}

