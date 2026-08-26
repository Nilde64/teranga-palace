/* ============================================================================
   Configuration Supabase
   ----------------------------------------------------------------------------
   Remplis les deux valeurs ci-dessous avec celles de TON projet Supabase :
   Supabase → ton projet → Settings (⚙️) → API
     - "Project URL"        → SUPABASE_URL
     - "anon public" key    → SUPABASE_ANON_KEY   (jamais la clé "service_role" !)

   Tant que ces deux valeurs sont vides, l'application continue de fonctionner
   normalement en mode 100% local (comme avant), simplement sans partage des
   données entre navigateurs/appareils.
   ============================================================================ */
const SUPABASE_URL = "https://gjunwivlmqiagoveztqk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqdW53aXZsbXFpYWdvdmV6dHFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2MTA5NjMsImV4cCI6MjEwMzE4Njk2M30.ucgzkCvlGkNeoVJVvmal_T2WCppLKjbu0WkMild9S9g";

if(SUPABASE_URL && SUPABASE_ANON_KEY && window.supabase){
  window.sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}else{
  window.sb = null;
  if(!SUPABASE_URL || !SUPABASE_ANON_KEY){
    console.warn("Supabase non configuré (js/supabase-config.js) — mode 100% local actif.");
  }
}
