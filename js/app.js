/* ==========================================================================
   TERANGA PALACE — point d'entrée de l'application
   Démarre le routeur une fois le DOM chargé et écoute les changements de route.
   ========================================================================== */
window.addEventListener("hashchange", render);
window.addEventListener("DOMContentLoaded", render);
window.addEventListener("DOMContentLoaded", initGlobalMotion);

/* ==========================================================================
   MOUVEMENTS GLOBAUX (ajout)
   Effets purement visuels, valables sur toutes les pages, initialisés une
   seule fois : ombre de la barre de navigation au scroll, bouton "retour en
   haut", et effet d'ondulation au clic sur les boutons dorés/sombres.
   N'ajoute ni ne modifie aucune donnée ni aucune logique métier.
   ========================================================================== */
function initGlobalMotion(){
  const backToTop = document.getElementById("back-to-top");
  window.addEventListener("scroll", ()=>{
    const y = window.scrollY || document.documentElement.scrollTop;
    document.querySelectorAll(".topbar").forEach(tb=>tb.classList.toggle("is-scrolled", y > 12));
    if(backToTop) backToTop.classList.toggle("show", y > 480);
  }, {passive:true});
  if(backToTop){
    backToTop.onclick = ()=>window.scrollTo({top:0, behavior:"smooth"});
  }

  /* Groupe de bulles de contact flottantes : ouverture/fermeture au clic. */
  const fabGroup = document.getElementById("fab-group");
  const fabToggle = document.getElementById("fab-toggle");
  if(fabGroup && fabToggle){
    fabToggle.onclick = ()=>{
      const open = fabGroup.classList.toggle("open");
      fabToggle.setAttribute("aria-expanded", open ? "true" : "false");
    };
    document.addEventListener("click", (e)=>{
      if(fabGroup.classList.contains("open") && !fabGroup.contains(e.target)) fabGroup.classList.remove("open");
    });
  }

  document.addEventListener("click", (e)=>{
    const btn = e.target.closest(".btn");
    if(!btn) return;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const ripple = document.createElement("span");
    ripple.className = "ripple";
    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = (e.clientX - rect.left - size/2) + "px";
    ripple.style.top = (e.clientY - rect.top - size/2) + "px";
    btn.appendChild(ripple);
    setTimeout(()=>ripple.remove(), 650);
  });
}

/* Sur la page "Réserver", un re-rendu complet déclenché par une synchronisation
   Supabase en arrière-plan (temps réel ou polling 30s) reconstruit toute la page
   et réinitialise l'assistant de réservation (étape en cours, dates saisies,
   chambre choisie, voire l'écran de confirmation juste après avoir réservé) —
   y compris quand c'est la propre réservation du client qui vient de déclencher
   cette synchronisation. Les données (DB) continuent d'être mises à jour comme
   avant ; on évite seulement de re-rendre la page pendant que l'utilisateur est
   en train de réserver. */
function shouldSkipBackgroundRerender(){
  return currentRoute() === "reserver";
}
window.addEventListener("tp-photos-hydrated", ()=>{ if(!shouldSkipBackgroundRerender()) render(); });
window.addEventListener("tp-data-synced", ()=>{ if(!shouldSkipBackgroundRerender()) render(); });
