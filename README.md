# Teranga Palace — Application de gestion hôtelière

Démonstration front-end autonome (HTML + CSS + JavaScript), basée sur le
document UML fourni. Aucun serveur ni framework requis : les données sont
générées et persistées directement dans le navigateur (LocalStorage +
IndexedDB).

## Structure du projet

```
teranga-palace/
├── index.html            Site public (SPA, routage par ancre #/...) : accueil,
│                          chambres, réservation, mes réservations, à propos,
│                          contact, connexion
├── login.html             Page de connexion dédiée au personnel
│                          (Réceptionniste / Gestionnaire)
├── dashboard.html          Espace Administration autonome (réutilise les
│                            mêmes pages/composants que index.html)
├── css/
│   └── style.css            Toute la feuille de style (design tokens, layout, composants)
├── js/
│   ├── icons.js              Icônes SVG inline + helper ic()
│   ├── data.js                 Couche de données (LocalStorage + IndexedDB),
│   │                            logique métier (disponibilité, réservation,
│   │                            check-in/out, paiements), validation des formulaires
│   ├── ui.js                    Toasts, modales, routeur, gabarits (shell) public/admin
│   ├── pages-public.js           Pages de l'espace public
│   ├── pages-admin.js             Pages de l'espace administration (dashboard, clients,
│   │                               chambres, réservations, check-in, séjours, check-out,
│   │                               paiements, factures, statistiques, rapports)
│   └── app.js                       Point d'entrée : démarre le routeur
├── database/
│   ├── schema.sql              Structure de la base (tables, contraintes, vues, triggers)
│   ├── seed.sql                 Données de démonstration (identiques à l'application)
│   ├── teranga_palace.db         Base SQLite déjà construite, prête à l'emploi
│   └── README.md                  Détails du modèle relationnel
└── assets/
    ├── images/
    ├── icons/
    └── video/                   Vidéo de fond de la page d'accueil (optionnelle)
```

## Stockage des données

L'application est entièrement autonome côté navigateur, sans backend :

- **LocalStorage** — toutes les données métier (chambres, clients,
  réservations, séjours, paiements, factures, comptes utilisateurs). Clé :
  `teranga_palace_db`.
- **IndexedDB** — les photos de chambre (base `teranga_palace_photos`,
  magasin `photos`, indexé par numéro de chambre). Ce stockage a été choisi
  car son quota est bien plus grand que celui du LocalStorage (typiquement
  quelques centaines de Mo, selon l'espace disque disponible, contre
  ~5-10 Mo pour le LocalStorage), ce qui évite de saturer l'espace
  disponible lorsque plusieurs chambres ont une photo.

### Photos des chambres

Depuis l'espace Administration → Chambres, le gestionnaire peut ajouter ou
modifier une chambre et y joindre une photo (bouton « Choisir un fichier »).
L'image est automatiquement redimensionnée et compressée (canvas, JPEG
qualité ~72 %) avant d'être enregistrée dans IndexedDB.

⚠️ **Important : ces photos ne sont visibles que dans le navigateur qui les a
ajoutées.** IndexedDB (comme LocalStorage) est propre à chaque
navigateur/appareil — une photo ajoutée par le gestionnaire n'apparaît donc
**pas** automatiquement pour les autres visiteurs du site déployé sur GitHub
Pages (le site est 100 % statique, sans serveur ni base partagée).

**Pour qu'une vraie photo soit visible par tout le monde**, il faut
l'exporter en fichier et la committer dans le projet :

1. Dans Administration → Chambres, cliquer sur **« Exporter les photos »**.
   Cela télécharge un fichier `chambre-<numero>.jpg` pour chaque chambre qui
   a une photo dans ce navigateur (ex. `chambre-101.jpg`).
2. Déplacer ces fichiers téléchargés dans le dossier `assets/images/` du
   projet.
3. Committer et pousser :
   ```bash
   git add assets/images/
   git commit -m "Ajout des photos réelles des chambres"
   git push
   ```

Chaque chambre affiche automatiquement, dans cet ordre de priorité :
1. la vraie photo ajoutée dans le navigateur courant (si présente) ;
2. sinon le fichier statique `assets/images/chambre-<numero>.jpg` (si vous
   l'avez exporté et commité comme ci-dessus) ;
3. sinon une illustration générique par type de chambre
   (`assets/images/chambre-simple.svg` / `chambre-double.svg` /
   `chambre-suite.svg`), qui garantit qu'un visuel s'affiche toujours.

Si l'écriture dans IndexedDB échoue (navigateur en mode privé restrictif,
IndexedDB indisponible), un message d'erreur explicite s'affiche au lieu
d'un échec silencieux.

### Vidéo de fond sur la page d'accueil

La section d'en-tête (`hero`) de la page d'accueil est prête à afficher une
vidéo en fond, avec un dégradé sombre par-dessus pour garder le texte
lisible. Il suffit de déposer votre fichier ici :

```
assets/video/hero.mp4
```

(optionnel : une image `assets/images/hero-poster.jpg` s'affiche pendant le
chargement de la vidéo). Choisissez un extrait court (10–20 s en boucle),
sans son — la vidéo est automatiquement en lecture muette, en boucle, et se
lance sans interaction (`autoplay muted loop playsinline`), ce qui est requis
par les navigateurs. Si aucun fichier n'est présent, le dégradé bleu nuit
d'origine s'affiche automatiquement en remplacement (aucune erreur visible).

### Base de données relationnelle (`database/`)

Le dossier `database/` fournit le même modèle de données sous forme d'une
vraie base relationnelle (SQLite), avec les règles métier (anti-double
réservation, cohérence des dates, etc.) appliquées directement au niveau de
la base — utile pour brancher un futur backend (API REST) sans changer la
logique de l'application. Voir `database/README.md` pour le détail.

## Lancer le projet

Ouvrez simplement `index.html` dans un navigateur (double-clic ou glisser-déposer).
Aucune installation n'est nécessaire : les données sont générées automatiquement
au premier chargement et sauvegardées dans le navigateur.

Pour un rendu identique à un vrai serveur (recommandé, notamment pour
IndexedDB qui se comporte mieux hors `file://`), vous pouvez aussi servir le
dossier avec un petit serveur local, par exemple :

```bash
python3 -m http.server 8000
```

puis ouvrir `http://localhost:8000/`.

- `index.html` → site public + espace client
- `login.html` → connexion du personnel (Réceptionniste / Gestionnaire)
- `dashboard.html` → espace Administration une fois connecté

## Comptes de démonstration

| Rôle            | Email                          | Mot de passe   |
|-----------------|---------------------------------|----------------|
| Client          | sophie.diallo@example.com       | client123      |
| Réceptionniste  | reception@terangapalace.sn      | reception123   |
| Gestionnaire    | manager@terangapalace.sn        | manager123     |

## Réinitialiser les données de démonstration

Dans la console du navigateur (sur la page du site) :

```js
localStorage.removeItem('teranga_palace_db');
indexedDB.deleteDatabase('teranga_palace_photos');
```

puis rechargez la page.
