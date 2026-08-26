# Base de données — Teranga Palace

> ⚠️ **Pour Supabase, utilise UNIQUEMENT ces 3 fichiers, dans cet ordre :**
> 1. `supabase_schema.sql` — crée les tables (colonnes entre guillemets, casse respectée)
> 2. `seed_supabase.sql` — données de démonstration compatibles avec ce schéma
> 3. `enable_realtime.sql` — active la synchronisation instantanée
>
> Ne PAS utiliser `schema-postgresql.OBSOLETE.sql.bak` ni `seed.sql` avec Supabase :
> ce sont d'anciens fichiers écrits pour une autre variante de schéma (colonnes non
> protégées par des guillemets → PostgreSQL les met en minuscules, ce qui casse
> l'affichage des prix/numéros de chambre côté application).

Base de données relationnelle fidèle au diagramme de classes UML fourni.

## Fichiers

| Fichier               | Rôle |
|------------------------|------|
| `schema.sql`            | Structure de la base (tables, contraintes, index, vues, triggers) |
| `seed.sql`               | Données de démonstration (identiques à celles de l'application) — **variante SQLite, pas Supabase** |
| `teranga_palace.db`       | Base SQLite déjà construite et prête à l'emploi |
| `supabase_schema.sql`    | Structure de la base pour **Supabase/PostgreSQL** (à utiliser en priorité) |
| `seed_supabase.sql`      | Données de démonstration pour **Supabase/PostgreSQL** |
| `enable_realtime.sql`    | Active la synchronisation instantanée (Realtime) sur Supabase |

## Relations (conformes au document UML)

```
Client 1 -------- 0..* Réservation
Chambre 1 -------- 0..* Réservation
Réservation 1 -------- 0..1 Séjour
Séjour 1 -------- 1..* Paiement
Séjour 1 -------- 1 Facture
```

Une table `utilisateurs` complète le modèle métier pour gérer
l'authentification par rôle (Client / Réceptionniste / Gestionnaire),
demandée en section 17 du cahier des charges.

## Règles métier appliquées au niveau de la base

- **Anti-double réservation** : un trigger (`trg_no_overlap_insert` /
  `trg_no_overlap_update`) refuse toute réservation confirmée qui chevauche,
  pour la même chambre, une réservation déjà confirmée.
- **Cohérence des dates** : contrainte `CHECK` garantissant que la date de
  départ est postérieure à la date d'arrivée.
- **Valeurs autorisées** : `type`, `statut` (chambre, réservation, séjour,
  facture) et `modePaiement` sont contraints par des `CHECK` correspondant
  exactement aux valeurs prévues dans le cahier des charges.
- **Intégrité référentielle** : toutes les clés étrangères (client, chambre,
  réservation, séjour) sont vérifiées (`PRAGMA foreign_keys = ON`).
- **Vues prêtes à l'emploi** pour le dashboard : `v_disponibilite_chambres`,
  `v_revenus_par_mois`, `v_chambres_plus_reservees`, `v_solde_factures`.

Ces règles ont été testées (double réservation, dates incohérentes, clé
étrangère invalide, statut invalide, montant négatif) : chaque cas est
correctement rejeté par la base, et une réservation valide sur une chambre
libre est correctement acceptée.

## (Re)construire la base

```bash
python3 -c "
import sqlite3
conn = sqlite3.connect('teranga_palace.db')
conn.executescript(open('schema.sql', encoding='utf-8').read())
conn.executescript(open('seed.sql', encoding='utf-8').read())
conn.commit()
"
```

Ou avec le client `sqlite3` si disponible sur votre machine :

```bash
sqlite3 teranga_palace.db < schema.sql
sqlite3 teranga_palace.db < seed.sql
```

## Explorer la base

```bash
sqlite3 teranga_palace.db
sqlite> .tables
sqlite> SELECT * FROM v_disponibilite_chambres;
sqlite> SELECT * FROM reservations WHERE statut = 'Confirmée';
```

## Lien avec l'application (LocalStorage/IndexedDB → base de données)

L'application livrée (`index.html` + `css/` + `js/`) fonctionne aujourd'hui
en mode autonome : les données métier sont en LocalStorage et les photos de
chambre en IndexedDB (voir section 26 du cahier des charges : « pour une
démonstration front-end autonome »). Cette base SQL correspond au même
modèle de données et au même jeu de démonstration : elle permet de passer à
une architecture avec un vrai backend (API REST en Node/Express, Django,
Laravel...) qui remplacerait `js/data.js` par des appels HTTP vers cette
base, sans changer le reste de l'application (`ui.js`, `pages-public.js`,
`pages-admin.js` consomment déjà des fonctions comme `isRoomAvailable()`,
`createReservation()`, etc. qu'il suffirait de faire pointer vers l'API au
lieu du LocalStorage/IndexedDB).
