-- ============================================================================
-- TERANGA PALACE — Active le Realtime Supabase sur les tables partagées
-- (permet à la réception de recevoir les nouvelles réservations INSTANTANÉMENT,
-- sans attendre le prochain rafraîchissement automatique).
--
-- À exécuter dans Supabase → SQL Editor (colle tout, clique "Run").
-- Sans risque à relancer plusieurs fois.
-- ============================================================================

alter publication supabase_realtime add table reservations;
alter publication supabase_realtime add table sejours;
alter publication supabase_realtime add table paiements;
alter publication supabase_realtime add table factures;
alter publication supabase_realtime add table chambres;
alter publication supabase_realtime add table clients;
