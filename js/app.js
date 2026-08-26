/* ==========================================================================
   TERANGA PALACE — point d'entrée de l'application
   Démarre le routeur une fois le DOM chargé et écoute les changements de route.
   ========================================================================== */
window.addEventListener("hashchange", render);
window.addEventListener("DOMContentLoaded", render);

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
