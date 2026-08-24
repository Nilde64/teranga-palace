/* ==========================================================================
   TERANGA PALACE — point d'entrée de l'application
   Démarre le routeur une fois le DOM chargé et écoute les changements de route.
   ========================================================================== */
window.addEventListener("hashchange", render);
window.addEventListener("DOMContentLoaded", render);
window.addEventListener("tp-photos-hydrated", render);
window.addEventListener("tp-data-synced", render);
