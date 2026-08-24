/* ============================= TOASTS ============================= */
function toast(title, msg, isError){
  const stack = document.getElementById("toast-stack");
  const el = document.createElement("div");
  el.className = "toast"+(isError?" error":"");
  el.innerHTML = `<b>${title}</b>${msg||""}`;
  stack.appendChild(el);
  setTimeout(()=>{ el.style.transition="opacity .3s"; el.style.opacity="0"; setTimeout(()=>el.remove(),300); }, 3600);
}

/* ============================= MODAL ============================= */
function openModal(html){
  const root = document.getElementById("modal-root");
  root.innerHTML = `<div class="modal-overlay" id="modal-overlay"><div class="modal-box">${html}</div></div>`;
  document.getElementById("modal-overlay").addEventListener("click",(e)=>{ if(e.target.id==="modal-overlay") closeModal(); });
}
function closeModal(){ document.getElementById("modal-root").innerHTML=""; }

/* ============================= PASSWORD VISIBILITY TOGGLE ============================= */
// Transforme un <input type="password" id="..."> en champ avec icône œil pour afficher/masquer.
// Idempotent : peut être appelé plusieurs fois sans dupliquer le bouton (utile après un re-render).
function wirePasswordToggle(inputId){
  const input = document.getElementById(inputId);
  if(!input) return;
  let wrap = input.parentElement;
  if(!wrap.classList.contains("field-pass-wrap")){
    wrap = document.createElement("div");
    wrap.className = "field-pass-wrap";
    input.parentNode.insertBefore(wrap, input);
    wrap.appendChild(input);
  }
  let btn = wrap.querySelector(".pass-toggle");
  if(!btn){
    btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pass-toggle";
    btn.setAttribute("aria-label","Afficher le mot de passe");
    btn.tabIndex = -1;
    wrap.appendChild(btn);
  }
  btn.innerHTML = ic('eye');
  btn.onclick = ()=>{
    const showing = input.type === "text";
    input.type = showing ? "password" : "text";
    btn.innerHTML = showing ? ic('eye') : ic('eyeOff');
    btn.setAttribute("aria-label", showing ? "Afficher le mot de passe" : "Masquer le mot de passe");
  };
}


/* ============================= ROUTER (helpers) ============================= */
function goto(hash){ location.hash = hash; }

function currentRoute(){
  const h = location.hash.replace(/^#\/?/,"") || "accueil";
  return h.split("?")[0];
}
function routeQuery(){
  const q = location.hash.split("?")[1];
  const params = {};
  if(q) q.split("&").forEach(pair=>{ const [k,v]=pair.split("="); params[decodeURIComponent(k)]=decodeURIComponent(v||""); });
  return params;
}

/* ==========================================================================
   RENDER : SHELL (nav + routing)
   ========================================================================== */
const PUBLIC_ROUTES = ["accueil","chambres","reserver","mes-reservations","apropos","contact","connexion"];
const ADMIN_ROUTES = {
  "admin/dashboard":{label:"Dashboard", icon:"gauge", roles:["Réceptionniste","Gestionnaire"]},
  "admin/clients":{label:"Clients", icon:"users", roles:["Réceptionniste"]},
  "admin/chambres":{label:"Chambres", icon:"bed", roles:["Gestionnaire"]},
  "admin/reservations":{label:"Réservations", icon:"calendar", roles:["Réceptionniste"]},
  "admin/checkin":{label:"Arrivée (Check-in)", icon:"arrowIn", roles:["Réceptionniste"]},
  "admin/sejours":{label:"Séjours", icon:"bed", roles:["Réceptionniste"]},
  "admin/checkout":{label:"Départ (Check-out)", icon:"arrowOut", roles:["Réceptionniste"]},
  "admin/paiements":{label:"Paiements", icon:"cash", roles:["Réceptionniste"]},
  "admin/factures":{label:"Factures", icon:"file", roles:["Réceptionniste"]},
  "admin/statistiques":{label:"Statistiques", icon:"chart", roles:["Gestionnaire"]},
  "admin/rapports":{label:"Rapports", icon:"file", roles:["Gestionnaire"]},
  "admin/parametres":{label:"Paramètres", icon:"settings", roles:["Gestionnaire","Réceptionniste"]},
};

function render(){
  const route = currentRoute();
  const session = getSession();
  const app = document.getElementById("app");

  if(route.startsWith("admin/")){
    renderAdminShell(route, session);
  } else {
    renderPublicShell(route, session);
  }
  window.scrollTo(0,0);
}

/* ---------------------------- PUBLIC SHELL ---------------------------- */
function renderPublicShell(route, session){
  const app = document.getElementById("app");
  const navLinks = [
    ["accueil","Accueil"],["chambres","Chambres"],["reserver","Réserver"],
    ["mes-reservations","Mes réservations"],["apropos","À propos"],["contact","Contact"]
  ];
  let navHtml = navLinks.map(([r,l])=>`<a href="#/${r}" class="${route===r?'active':''}">${l}</a>`).join("");
  let rightHtml = "";
  if(session){
    rightHtml = `
      <div class="userchip">
        <span>${session.prenom||session.email}</span>
        <span class="role-tag">${session.role}</span>
      </div>
      ${session.role!=="Client" ? `<a href="#/admin/dashboard" class="nav-btn">Espace admin</a>` : ""}
      <button class="nav-btn" id="btn-logout">${ic('logout')} Déconnexion</button>`;
  } else {
    navHtml += `<a href="#/connexion" class="nav-cta ${route==='connexion'?'active':''}">Connexion</a>`;
  }

  app.innerHTML = `
    <div class="topbar">
      <div class="topbar-inner">
        <a href="#/accueil" class="brand">
          <span class="brand-mark">${ic('logo')}</span>
          <span class="brand-text"><b>Teranga Palace</b><span>Dakar · Sénégal</span></span>
        </a>
        <nav class="main-nav" id="main-nav">${navHtml}</nav>
        <div style="display:flex;align-items:center;gap:10px;">
          ${rightHtml}
          <button class="burger" id="burger">☰</button>
        </div>
      </div>
    </div>
    <main id="main-content"></main>
    <footer class="footer">
      <div class="footer-inner">
        <div>
          <div class="brand" style="margin-bottom:14px;"><span class="brand-mark">${ic('logo')}</span><span class="brand-text"><b>Teranga Palace</b><span>Dakar · Sénégal</span></span></div>
          <p style="font-size:13px;line-height:1.7;max-width:280px;">Un hôtel 5 étoiles au cœur de Dakar, où l'hospitalité sénégalaise (teranga) rencontre le raffinement contemporain.</p>
        </div>
        <div><h5>Explorer</h5>
          <a href="#/chambres">Nos chambres</a><a href="#/reserver">Réserver</a><a href="#/apropos">À propos</a><a href="#/contact">Contact</a>
        </div>
        <div><h5>Contact</h5>
          <a href="tel:+221338200000">+221 33 820 00 00</a><a href="mailto:contact@terangapalace.sn">contact@terangapalace.sn</a><a href="#">Corniche Ouest, Dakar, Sénégal</a>
        </div>
        <div><h5>Accès</h5>
          <a href="#/connexion">Connexion</a><a href="#/mes-reservations">Mes réservations</a>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© 2026 Teranga Palace — Projet académique SUPINFO Dakar (L2 Informatique)</span>
        <span>Application de démonstration — données fictives</span>
      </div>
    </footer>
  `;
  document.getElementById("burger").onclick = ()=>document.getElementById("main-nav").classList.toggle("open");
  const lo = document.getElementById("btn-logout");
  if(lo) lo.onclick = ()=>{ clearSession(); toast("Déconnexion","Vous avez été déconnecté."); goto("#/accueil"); };

  const slot = document.getElementById("main-content");
  const pageMap = {
    "accueil": pageAccueil, "chambres": pageChambres, "reserver": pageReserver,
    "mes-reservations": pageMesReservations, "apropos": pageApropos, "contact": pageContact, "connexion": pageConnexion
  };
  const fn = pageMap[route] || pageAccueil;
  slot.innerHTML = fn(session);
  afterRenderHook(route, session);
}

/* ---------------------------- ADMIN SHELL ---------------------------- */
function renderAdminShell(route, session){
  const app = document.getElementById("app");
  if(!session || session.role==="Client"){
    app.innerHTML = accessDeniedShell();
    return;
  }
  const meta = ADMIN_ROUTES[route];
  if(meta && !meta.roles.includes(session.role)){
    app.innerHTML = accessDeniedShell(session);
    return;
  }

  const grouped = [
    {label:"Vue d'ensemble", items:["admin/dashboard"]},
    {label:"Opérations", items:["admin/clients","admin/reservations","admin/checkin","admin/sejours","admin/checkout"]},
    {label:"Facturation", items:["admin/paiements","admin/factures"]},
    {label:"Établissement", items:["admin/chambres","admin/statistiques","admin/rapports"]},
  ];
  let sideHtml = "";
  grouped.forEach(g=>{
    const visible = g.items.filter(i=>ADMIN_ROUTES[i].roles.includes(session.role));
    if(!visible.length) return;
    sideHtml += `<div class="side-label">${g.label}</div>`;
    visible.forEach(i=>{
      sideHtml += `<a href="#/${i}" class="${route===i?'active':''}">${ic(ADMIN_ROUTES[i].icon)} ${ADMIN_ROUTES[i].label}</a>`;
    });
  });

  app.innerHTML = `
    <div class="topbar">
      <div class="topbar-inner">
        <a href="#/accueil" class="brand"><span class="brand-mark">${ic('logo')}</span><span class="brand-text"><b>Teranga Palace</b><span>Espace Administration</span></span></a>
        <div class="userchip">
          <span>${session.prenom||session.email}</span><span class="role-tag">${session.role}</span>
        </div>
        <div style="display:flex;gap:10px;align-items:center;">
          <a href="#/accueil" class="nav-btn">Voir le site</a>
          <button class="nav-btn" id="btn-logout">${ic('logout')} Déconnexion</button>
          <button class="burger" id="burger" data-admin>☰</button>
        </div>
      </div>
    </div>
    <div class="admin-shell">
      <div class="admin-sidebar-backdrop" id="admin-sidebar-backdrop"></div>
      <aside class="admin-sidebar" id="admin-sidebar">${sideHtml}</aside>
      <div class="admin-main" id="admin-content"></div>
    </div>
  `;
  document.getElementById("btn-logout").onclick = ()=>{ clearSession(); toast("Déconnexion","Vous avez été déconnecté."); goto("#/accueil"); };
  const sidebarEl = document.getElementById("admin-sidebar");
  const backdropEl = document.getElementById("admin-sidebar-backdrop");
  const closeSidebar = ()=>{ sidebarEl.classList.remove("open"); backdropEl.classList.remove("open"); };
  document.getElementById("burger").onclick = ()=>{ sidebarEl.classList.toggle("open"); backdropEl.classList.toggle("open"); };
  backdropEl.onclick = closeSidebar;
  sidebarEl.querySelectorAll("a").forEach(a=>a.addEventListener("click", closeSidebar));

  const pageMap = {
    "admin/dashboard": pageDashboard, "admin/clients": pageAdminClients, "admin/chambres": pageAdminChambres,
    "admin/reservations": pageAdminReservations, "admin/checkin": pageAdminCheckin, "admin/sejours": pageAdminSejours,
    "admin/checkout": pageAdminCheckout, "admin/paiements": pageAdminPaiements, "admin/factures": pageAdminFactures,
    "admin/statistiques": pageAdminStatistiques, "admin/rapports": pageAdminRapports, "admin/parametres": pageAdminParametres,
  };
  const fn = pageMap[route] || pageDashboard;
  document.getElementById("admin-content").innerHTML = fn(session);
  afterRenderHook(route, session);
}

function accessDeniedShell(session){
  return `
    <div class="topbar"><div class="topbar-inner">
      <a href="#/accueil" class="brand"><span class="brand-mark">${ic('logo')}</span><span class="brand-text"><b>Teranga Palace</b><span>Dakar · Sénégal</span></span></a>
      <a href="#/connexion" class="nav-btn">Connexion</a>
    </div></div>
    <main class="section" style="text-align:center;">
      <div class="empty-state">
        <div style="color:var(--rouge);">${ic('key')}</div>
        <h4>Vous n'avez pas l'autorisation d'accéder à cette page.</h4>
        <p>${session ? "Votre rôle ("+session.role+") ne permet pas d'accéder à cet espace." : "Veuillez vous connecter avec un compte autorisé pour continuer."}</p>
        <a href="#/connexion" class="btn btn-gold" style="margin-top:14px;">Se connecter</a>
      </div>
    </main>`;
}

/* ============================= AFTER-RENDER HOOK (wires up forms/buttons per page) ============================= */
function afterRenderHook(route, session){
  const hooks = {
    "chambres": wireChambres, "reserver": wireReserver, "mes-reservations": wireMesReservations, "contact": wireContact,
    "connexion": wireConnexion,
    "admin/dashboard": wireDashboard, "admin/clients": wireAdminClients, "admin/chambres": wireAdminChambres,
    "admin/reservations": wireAdminReservations, "admin/checkin": wireAdminCheckin, "admin/sejours": wireAdminSejours,
    "admin/checkout": wireAdminCheckout, "admin/paiements": wireAdminPaiements, "admin/factures": wireAdminFactures,
    "admin/statistiques": wireAdminStatistiques, "admin/rapports": wireAdminRapports,
  };
  const fn = hooks[route];
  if(fn) fn(session);
}

