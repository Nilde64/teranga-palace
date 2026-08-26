-- ============================================================================
-- TERANGA PALACE — Schéma de base de données
-- Dialecte : PostgreSQL (converti depuis la version SQLite de schema.sql)
--
-- Ce schéma respecte strictement le diagramme de classes UML fourni :
--
--   Client 1 -------- 0..* Réservation
--   Chambre 1 -------- 0..* Réservation
--   Réservation 1 -------- 0..1 Séjour
--   Séjour 1 -------- 1..* Paiement
--   Séjour 1 -------- 1 Facture
--
-- Table complémentaire utilisateurs pour l'authentification par rôle
-- (Client / Réceptionniste / Gestionnaire), non présente dans le diagramme
-- de classes métier mais nécessaire à l'espace sécurisé (section 17).
--
-- Différences par rapport à la version SQLite :
--   - PRAGMA foreign_keys supprimé (les clés étrangères sont toujours
--     appliquées par défaut en PostgreSQL).
--   - REAL remplacé par NUMERIC(12,2) pour les montants (précision exacte).
--   - Les triggers SQLite "BEGIN ... RAISE(ABORT, ...) ... END" sont
--     réécrits en fonctions PL/pgSQL + CREATE TRIGGER ... EXECUTE FUNCTION.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- CLIENT
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS clients CASCADE;
CREATE TABLE clients (
    idClient  TEXT PRIMARY KEY,
    nom         TEXT NOT NULL,
    prenom      TEXT NOT NULL,
    telephone   TEXT NOT NULL,
    email       TEXT NOT NULL UNIQUE,
    adresse     TEXT
);

-- ----------------------------------------------------------------------------
-- CHAMBRE
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS chambres CASCADE;
CREATE TABLE chambres (
    numeroChambre TEXT PRIMARY KEY,
    type            TEXT NOT NULL CHECK (type IN ('Simple','Double','Suite')),
    prixParNuit   NUMERIC(12,2) NOT NULL CHECK (prixParNuit > 0),
    capacite        INTEGER NOT NULL CHECK (capacite > 0),
    statut          TEXT NOT NULL DEFAULT 'Disponible'
                    CHECK (statut IN ('Disponible','Occupée','Maintenance')),
    description     TEXT,
    photo           TEXT  -- URL/chemin de l'image (ou data URL base64 côté démo front-end)
);

-- ----------------------------------------------------------------------------
-- UTILISATEUR (authentification / rôles — Client, Réceptionniste, Gestionnaire)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS utilisateurs CASCADE;
CREATE TABLE utilisateurs (
    email      TEXT PRIMARY KEY,
    password   TEXT NOT NULL,
    role       TEXT NOT NULL CHECK (role IN ('Client','Réceptionniste','Gestionnaire')),
    idClient TEXT REFERENCES clients(idClient) ON DELETE CASCADE,
    -- un compte Client doit être lié à un client ; les comptes du personnel n'en ont pas besoin
    CHECK ( (role = 'Client' AND idClient IS NOT NULL) OR (role <> 'Client') )
);

-- ----------------------------------------------------------------------------
-- RÉSERVATION  (Client 1--0..*  /  Chambre 1--0..*)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS reservations CASCADE;
CREATE TABLE reservations (
    id                TEXT PRIMARY KEY,               -- ex : TP-2026-00125
    idClient        TEXT NOT NULL REFERENCES clients(idClient)   ON DELETE RESTRICT,
    numeroChambre   TEXT NOT NULL REFERENCES chambres(numeroChambre) ON DELETE RESTRICT,
    dateArrivee     DATE NOT NULL,
    dateDepart      DATE NOT NULL,
    nbPersonnes     INTEGER NOT NULL CHECK (nbPersonnes > 0),
    montant           NUMERIC(12,2) NOT NULL CHECK (montant >= 0),   -- calculé : nuits * prixParNuit
    statut            TEXT NOT NULL DEFAULT 'Confirmée'
                      CHECK (statut IN ('Confirmée','Annulée','Terminée')),
    dateCreation    TIMESTAMP NOT NULL DEFAULT now(),
    CHECK (dateDepart > dateArrivee)
);
CREATE INDEX idx_reservations_client  ON reservations(idClient);
CREATE INDEX idx_reservations_chambre ON reservations(numeroChambre);
CREATE INDEX idx_reservations_statut  ON reservations(statut);

-- Empêche toute double réservation d'une même chambre sur des dates qui se
-- chevauchent (règle métier obligatoire — section 9 et 25 du cahier des charges).
-- En PostgreSQL, un trigger doit appeler une FONCTION (contrairement à SQLite
-- où le corps du trigger peut être écrit directement).
CREATE OR REPLACE FUNCTION fn_no_overlap_reservations()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.statut = 'Confirmée' AND EXISTS (
        SELECT 1 FROM reservations
        WHERE numeroChambre = NEW.numeroChambre
          AND statut = 'Confirmée'
          AND id <> COALESCE(OLD.id, '')
          AND NEW.dateArrivee < dateDepart
          AND dateArrivee < NEW.dateDepart
    ) THEN
        RAISE EXCEPTION 'Chambre déjà réservée sur cette période';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_no_overlap_insert ON reservations;
CREATE TRIGGER trg_no_overlap_insert
BEFORE INSERT ON reservations
FOR EACH ROW
EXECUTE FUNCTION fn_no_overlap_reservations();

DROP TRIGGER IF EXISTS trg_no_overlap_update ON reservations;
CREATE TRIGGER trg_no_overlap_update
BEFORE UPDATE OF dateArrivee, dateDepart, numeroChambre, statut ON reservations
FOR EACH ROW
EXECUTE FUNCTION fn_no_overlap_reservations();

-- ----------------------------------------------------------------------------
-- SÉJOUR  (Réservation 1--0..1)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS sejours CASCADE;
CREATE TABLE sejours (
    idSejour           TEXT PRIMARY KEY,             -- ex : SJ-0041
    idReservation      TEXT NOT NULL UNIQUE REFERENCES reservations(id) ON DELETE RESTRICT,
    idClient           TEXT NOT NULL REFERENCES clients(idClient),
    numeroChambre      TEXT NOT NULL REFERENCES chambres(numeroChambre),
    dateArriveeReelle  DATE NOT NULL,
    dateDepartReelle   DATE,                         -- NULL tant que le séjour est en cours
    montantTotal       NUMERIC(12,2) NOT NULL CHECK (montantTotal >= 0),
    statut               TEXT NOT NULL DEFAULT 'En cours'
                         CHECK (statut IN ('En cours','Terminé'))
);
CREATE INDEX idx_sejours_client  ON sejours(idClient);
CREATE INDEX idx_sejours_chambre ON sejours(numeroChambre);

-- ----------------------------------------------------------------------------
-- PAIEMENT  (Séjour 1--1..*)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS paiements CASCADE;
CREATE TABLE paiements (
    idPaiement    TEXT PRIMARY KEY,                  -- ex : PM-0061
    idSejour      TEXT NOT NULL REFERENCES sejours(idSejour) ON DELETE CASCADE,
    datePaiement  DATE NOT NULL,
    montant         NUMERIC(12,2) NOT NULL CHECK (montant > 0),
    modePaiement  TEXT NOT NULL CHECK (modePaiement IN ('Espèces','Carte bancaire','Mobile Money'))
);
CREATE INDEX idx_paiements_sejour ON paiements(idSejour);

-- ----------------------------------------------------------------------------
-- FACTURE  (Séjour 1--1)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS factures CASCADE;
CREATE TABLE factures (
    numeroFacture TEXT PRIMARY KEY,                  -- ex : FA-2026-0040
    idSejour      TEXT NOT NULL UNIQUE REFERENCES sejours(idSejour) ON DELETE RESTRICT,
    dateFacture   DATE NOT NULL,
    montantTotal  NUMERIC(12,2) NOT NULL CHECK (montantTotal >= 0),
    statut          TEXT NOT NULL DEFAULT 'Non payée'
                    CHECK (statut IN ('Payée','Non payée','Partiellement payée'))
);

-- ----------------------------------------------------------------------------
-- VUES UTILES (retrouvent les statistiques du tableau de bord admin)
-- ----------------------------------------------------------------------------

-- Disponibilité courante des chambres (vue d'ensemble rapide)
DROP VIEW IF EXISTS v_disponibilite_chambres;
CREATE VIEW v_disponibilite_chambres AS
SELECT statut, COUNT(*) AS total
FROM chambres
GROUP BY statut;

-- Revenus encaissés, agrégés par mois (paiements)
DROP VIEW IF EXISTS v_revenus_par_mois;
CREATE VIEW v_revenus_par_mois AS
SELECT to_char(datePaiement, 'YYYY-MM') AS mois, SUM(montant) AS revenus
FROM paiements
GROUP BY mois
ORDER BY mois;

-- Chambres les plus réservées (hors réservations annulées)
DROP VIEW IF EXISTS v_chambres_plus_reservees;
CREATE VIEW v_chambres_plus_reservees AS
SELECT numeroChambre, COUNT(*) AS nb_reservations
FROM reservations
WHERE statut <> 'Annulée'
GROUP BY numeroChambre
ORDER BY nb_reservations DESC;

-- Solde restant dû par facture (montant total - somme des paiements du séjour)
DROP VIEW IF EXISTS v_solde_factures;
CREATE VIEW v_solde_factures AS
SELECT f.numeroFacture, f.idSejour, f.montantTotal,
       COALESCE(SUM(p.montant), 0) AS montantPaye,
       f.montantTotal - COALESCE(SUM(p.montant), 0) AS solde,
       f.statut
FROM factures f
LEFT JOIN paiements p ON p.idSejour = f.idSejour
GROUP BY f.numeroFacture, f.idSejour, f.montantTotal, f.statut;
