-- ============================================================================
-- TERANGA PALACE — Schéma PostgreSQL / Supabase
-- Adapté de database/schema.sql (SQLite) pour un vrai backend partagé,
-- afin que les réservations soient visibles par tous (client, réception,
-- gestionnaire), quel que soit le navigateur/appareil utilisé.
--
-- À exécuter dans Supabase → SQL Editor (colle tout ce fichier, clique "Run").
-- ============================================================================

-- ----------------------------------------------------------------------------
-- CLIENT
-- ----------------------------------------------------------------------------
drop table if exists clients cascade;
create table clients (
    "idClient"  text primary key,
    nom         text not null,
    prenom      text not null,
    telephone   text not null,
    email       text not null unique,
    adresse     text
);

-- ----------------------------------------------------------------------------
-- CHAMBRE
-- ----------------------------------------------------------------------------
drop table if exists chambres cascade;
create table chambres (
    "numeroChambre" text primary key,
    type            text not null check (type in ('Simple','Double','Suite')),
    "prixParNuit"   real not null check ("prixParNuit" > 0),
    capacite        integer not null check (capacite > 0),
    statut          text not null default 'Disponible'
                    check (statut in ('Disponible','Occupée','Maintenance')),
    description     text,
    photo           text,
    "hasPhoto"      boolean not null default false
);

-- ----------------------------------------------------------------------------
-- UTILISATEUR (authentification / rôles)
-- ----------------------------------------------------------------------------
drop table if exists users cascade;
create table users (
    email     text primary key,
    password  text not null,
    role      text not null check (role in ('Client','Réceptionniste','Gestionnaire')),
    "idClient" text references clients("idClient") on delete cascade,
    check ( (role = 'Client' and "idClient" is not null) or (role <> 'Client') )
);

-- ----------------------------------------------------------------------------
-- RÉSERVATION
-- ----------------------------------------------------------------------------
drop table if exists reservations cascade;
create table reservations (
    id              text primary key,
    "idClient"      text not null references clients("idClient") on delete restrict,
    "numeroChambre" text not null references chambres("numeroChambre") on delete restrict,
    "dateArrivee"   text not null,
    "dateDepart"    text not null,
    "nbPersonnes"   integer not null check ("nbPersonnes" > 0),
    montant         real not null check (montant >= 0),
    statut          text not null default 'Confirmée'
                    check (statut in ('Confirmée','Annulée','Terminée')),
    "dateCreation"  text not null,
    check ("dateDepart" > "dateArrivee")
);
create index idx_reservations_client  on reservations("idClient");
create index idx_reservations_chambre on reservations("numeroChambre");
create index idx_reservations_statut  on reservations(statut);

-- Empêche toute double réservation d'une même chambre sur des dates qui se
-- chevauchent (équivalent Postgres des triggers SQLite RAISE(ABORT, ...)).
create or replace function trg_no_overlap_fn() returns trigger as $$
begin
  if NEW.statut = 'Confirmée' and exists (
    select 1 from reservations
    where "numeroChambre" = NEW."numeroChambre"
      and statut = 'Confirmée'
      and id <> coalesce(NEW.id, '')
      and NEW."dateArrivee" < "dateDepart"
      and "dateArrivee" < NEW."dateDepart"
  ) then
    raise exception 'Chambre déjà réservée sur cette période';
  end if;
  return NEW;
end;
$$ language plpgsql;

drop trigger if exists trg_no_overlap_insert on reservations;
create trigger trg_no_overlap_insert
before insert on reservations
for each row execute function trg_no_overlap_fn();

drop trigger if exists trg_no_overlap_update on reservations;
create trigger trg_no_overlap_update
before update of "dateArrivee", "dateDepart", "numeroChambre", statut on reservations
for each row execute function trg_no_overlap_fn();

-- ----------------------------------------------------------------------------
-- SÉJOUR
-- ----------------------------------------------------------------------------
drop table if exists sejours cascade;
create table sejours (
    "idSejour"          text primary key,
    "idReservation"     text not null unique references reservations(id) on delete restrict,
    "idClient"          text not null references clients("idClient"),
    "numeroChambre"     text not null references chambres("numeroChambre"),
    "dateArriveeReelle" text not null,
    "dateDepartReelle"  text,
    "montantTotal"      real not null check ("montantTotal" >= 0),
    statut              text not null default 'En cours'
                        check (statut in ('En cours','Terminé'))
);
create index idx_sejours_client  on sejours("idClient");
create index idx_sejours_chambre on sejours("numeroChambre");

-- ----------------------------------------------------------------------------
-- PAIEMENT
-- ----------------------------------------------------------------------------
drop table if exists paiements cascade;
create table paiements (
    "idPaiement"   text primary key,
    "idSejour"     text not null references sejours("idSejour") on delete cascade,
    "datePaiement" text not null,
    montant        real not null check (montant > 0),
    "modePaiement" text not null check ("modePaiement" in ('Espèces','Carte bancaire','Mobile Money'))
);
create index idx_paiements_sejour on paiements("idSejour");

-- ----------------------------------------------------------------------------
-- FACTURE
-- ----------------------------------------------------------------------------
drop table if exists factures cascade;
create table factures (
    "numeroFacture" text primary key,
    "idSejour"      text not null unique references sejours("idSejour") on delete restrict,
    "dateFacture"   text not null,
    "montantTotal"  real not null check ("montantTotal" >= 0),
    statut          text not null default 'Non payée'
                    check (statut in ('Payée','Non payée','Partiellement payée'))
);

-- ----------------------------------------------------------------------------
-- SÉCURITÉ (RLS) — désactivée pour ce projet académique de démonstration.
-- ⚠️ Ceci rend les tables lisibles ET modifiables par n'importe qui connaissant
-- l'URL + clé publique du projet (normal pour un exercice scolaire, mais à ne
-- jamais faire pour un vrai projet en production sans politiques RLS dédiées).
-- ----------------------------------------------------------------------------
alter table clients        disable row level security;
alter table chambres       disable row level security;
alter table users   disable row level security;
alter table reservations   disable row level security;
alter table sejours        disable row level security;
alter table paiements      disable row level security;
alter table factures       disable row level security;
