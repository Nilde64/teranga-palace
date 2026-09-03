/* ==========================================================================
   PUBLIC PAGES
   ========================================================================== */
function pageAccueil(session){
  const chambresVedettes = DB.chambres.slice(0,3);
  return `
  <section class="hero-full" id="hero">
    <div class="hero-media">
      <video autoplay muted loop playsinline
             class="hero-video"
             onerror="this.parentElement.classList.add('video-fallback');">
        <source src="assets/video/hero.mp4" type="video/mp4">
      </video>
      <div class="hero-overlay"></div>
    </div>
    <div class="hero-content">
      <p class="hero-eyebrow hero-anim hero-anim-1">Hôtel 5 étoiles · Dakar, Sénégal</p>
      <h1 class="hero-title hero-anim hero-anim-2">Teranga Palace</h1>
      <p class="hero-tagline hero-anim hero-anim-3">L'élégance sénégalaise, autrement.</p>
      <p class="hero-sub hero-anim hero-anim-4">Une expérience unique au cœur de Dakar, entre océan Atlantique et art de vivre sénégalais.</p>
      <div class="hero-actions hero-anim hero-anim-5">
        <a href="#/reserver" class="btn btn-gold">Réserver votre séjour</a>
        <a href="#/chambres" class="btn btn-outline-light">Découvrir nos chambres</a>
      </div>
    </div>
    <div class="hero-scroll-cue hero-anim hero-anim-6" aria-hidden="true"><span></span><em>Faites défiler</em></div>
  </section>

  <section class="section">
    <div class="section-head reveal">
      <div class="eyebrow">L'établissement</div>
      <h2>Une hospitalité pensée dans les moindres détails</h2>
      <p>Teranga signifie « hospitalité » en wolof — c'est la promesse que nous tenons depuis notre porte d'entrée jusqu'à votre chambre. 48 chambres et suites, un restaurant gastronomique, une piscine à débordement face à l'océan et une équipe attentive à chaque étape de votre séjour.</p>
    </div>
    <div class="grid-4" data-reveal-group style="display:grid;gap:26px;">
      ${[
        ["Emplacement","Corniche Ouest, à deux pas du centre d'affaires et des plages de Dakar."],
        ["Restauration","Cuisine sénégalaise et internationale, produits locaux et de saison."],
        ["Bien-être","Piscine à débordement, spa et salle de sport ouverts toute la journée."],
        ["Service","Réception ouverte 24h/24, conciergerie et transferts aéroport."]
      ].map(([t,d])=>`<div class="reveal"><h4 style="font-size:19px;margin-bottom:8px;">${t}</h4><p style="font-size:13.5px;color:var(--text-soft);line-height:1.7;">${d}</p></div>`).join("")}
    </div>
  </section>

  <section class="section-tight" style="padding-top:0;padding-bottom:0;">
    <div class="grid-4" data-reveal-group style="display:grid;gap:26px;text-align:center;padding:0 0 46px;">
      ${[["48","Chambres et suites"],["4.8/5","Satisfaction client"],["24/7","Réception ouverte"],["12","Nationalités accueillies chaque mois"]]
        .map(([n,l])=>`<div class="reveal">
          <div class="stat-counter" data-counter="${n}">0</div>
          <div style="font-size:12.5px;letter-spacing:.04em;color:var(--text-soft);margin-top:6px;">${l}</div>
        </div>`).join("")}
    </div>
  </section>

  <section class="section section-tight" style="background:var(--sable);">
    <div class="section-head reveal" style="margin-bottom:34px;">
      <div class="eyebrow">Nos chambres</div>
      <h2>Un cadre pour chaque séjour</h2>
    </div>
    <div class="room-grid" data-reveal-group>${chambresVedettes.map(roomCard).join("")}</div>
    <div style="text-align:center;margin-top:34px;"><a href="#/chambres" class="btn btn-dark">Voir toutes les chambres</a></div>
  </section>

  <!-- ===== RESTAURANT ===== -->
  <section class="section editorial-split" id="restaurant">
    <div class="editorial-visual reveal">
      <img src="assets/images/offres/petit-dejeuner.jpg" alt="Restaurant panoramique Teranga Palace" loading="lazy">
    </div>
    <div class="editorial-text reveal">
      <div class="eyebrow">Gastronomie</div>
      <h2>L'art de la gastronomie</h2>
      <p>Face à l'océan Atlantique, notre restaurant panoramique marie les saveurs sénégalaises aux techniques internationales. Une carte courte, des produits locaux et de saison, et une salle pensée comme un salon plus que comme une salle de restaurant.</p>
      <p class="editorial-note">Petit-déjeuner, déjeuner et dîner — service en salle, en terrasse ou en chambre.</p>
      <a href="#/reserver" class="btn btn-outline">Découvrir notre restaurant</a>
    </div>
  </section>

  <!-- ===== EXPÉRIENCES TERANGA ===== -->
  <section class="section section-tight experiences-section" id="experiences" style="background:var(--bleu-nuit);">
    <div class="section-head reveal" style="margin-bottom:40px;">
      <div class="eyebrow">L'esprit Teranga</div>
      <h2>Une expérience, pas seulement un séjour</h2>
      <p>Teranga — l'hospitalité en wolof. Une philosophie qui infuse chaque instant de votre passage à Dakar.</p>
    </div>
    <div class="experience-grid" data-reveal-group>
      ${[
        ["assets/images/offres/spa.jpg","Bien-être","Piscine à débordement, spa et soins signature face à l'océan."],
        ["assets/images/offres/romantique.jpg","Évasion & Océan","Corniche Ouest, sable fin et couchers de soleil sur l'Atlantique."],
        ["assets/images/facade-hotel.jpg","Dakar & Découverte","Les quartiers, marchés et sites emblématiques de la capitale."],
        ["assets/images/offres/affaires.jpg","Hospitalité sénégalaise","Un accueil chaleureux, dans la pure tradition de la teranga."]
      ].map(([photo,t,d])=>`
      <div class="experience-tile reveal">
        <img src="${photo}" alt="${t}" loading="lazy">
        <div class="experience-tile-caption">
          <h4>${t}</h4>
          <p>${d}</p>
        </div>
      </div>`).join("")}
    </div>
  </section>

  <!-- ===== NOS OFFRES ===== -->
  <section class="section">
    <div class="section-head reveal" style="margin-bottom:34px;">
      <div class="eyebrow">Nos formules</div>
      <h2>Nos offres</h2>
      <p>Des formules pensées pour chaque type de séjour, à réserver directement en ligne.</p>
    </div>
    <div class="offers-grid" data-reveal-group>
      ${[
        ["assets/images/offres/petit-dejeuner.jpg","coffee","Petit-déjeuner inclus",null,"Un copieux buffet sénégalais et continental servi chaque matin au restaurant panoramique, pour bien commencer la journée."],
        ["assets/images/offres/romantique.jpg","heart","Escapade Romantique","Sur demande","Décoration florale, bouteille de bienvenue et surclassement selon disponibilité, pour un séjour à deux inoubliable."],
        ["assets/images/offres/spa.jpg","leaf","Bien-être & Spa",null,"Accès libre à la piscine à débordement, au spa et à la salle de sport, avec un soin découverte offert dès 2 nuits."],
        ["assets/images/offres/affaires.jpg","briefcase","Séjour Affaires",null,"Wi-Fi haut débit, espace bureau en chambre et tarifs préférentiels pour les séjours prolongés en semaine."],
        ["assets/images/offres/transfert-aeroport.jpg","users","Transfert Aéroport Offert","Dès 3 nuits","Un chauffeur vous accueille à l'aéroport et vous conduit à l'hôtel, sans frais supplémentaires."],
        ["assets/images/offres/reservation-anticipee.jpg","sparkle","Réservation Anticipée","-15%","Réservez au moins 21 jours à l'avance et bénéficiez d'une réduction sur le tarif de votre chambre."]
      ].map(([photo,icon,t,tag,d])=>`
      <div class="offer-card reveal">
        ${tag ? `<span class="offer-tag badge badge-gold">${tag}</span>` : ""}
        <div class="offer-visual"><img src="${photo}" alt="${t}" loading="lazy"></div>
        <div class="offer-body">
          <div class="offer-icon">${ic(icon)}</div>
          <h4>${t}</h4>
          <p>${d}</p>
          <a href="#/reserver" class="btn btn-outline btn-sm">Réserver cette offre</a>
        </div>
      </div>`).join("")}
    </div>
  </section>

  <section class="section section-dark">
    <div class="section-head reveal"><div class="eyebrow">L'expérience client</div><h2>Réservez en toute confiance</h2>
    <p>Disponibilités vérifiées en temps réel, confirmation immédiate et gestion simple de vos réservations en ligne.</p></div>
    <div class="grid-4" data-reveal-group style="display:grid;gap:1px;background:rgba(250,248,243,.12);">
      ${[["01","Choisissez vos dates","Arrivée, départ et nombre de personnes."],
         ["02","Sélectionnez une chambre","Parmi les chambres réellement disponibles."],
         ["03","Confirmez","Le prix est calculé automatiquement."],
         ["04","Recevez votre confirmation","Un identifiant unique vous est attribué."]]
        .map(([n,t,d])=>`<div class="reveal" style="background:var(--bleu-nuit);padding:26px 22px;">
          <div style="color:var(--or);font-family:var(--serif);font-size:26px;">${n}</div>
          <div style="font-weight:600;margin:10px 0 6px;">${t}</div>
          <div style="font-size:12.5px;color:rgba(250,248,243,.6);line-height:1.6;">${d}</div></div>`).join("")}
    </div>
  </section>

  <!-- ===== LOCALISATION ===== -->
    <section id="localisation" class="location" data-reveal-group>
<div class="location-text reveal">
<p class="eyebrow">Emplacement</p>
<h2>Au cœur de Dakar</h2>
<p>Teranga Palace se situe à proximité de la Corniche Ouest, à quelques minutes des
                principaux quartiers d'affaires et des sites emblématiques de la capitale sénégalaise.</p>
<ul class="contact-list">
<li><strong>Adresse</strong> — Corniche Ouest, Dakar, Sénégal</li>
<li><strong>Téléphone</strong> — +221 33 800 00 00</li>
<li><strong>Email</strong> — reservations@terangapalace.sn</li>
</ul>
</div>
<div class="location-map reveal">
<iframe title="Carte de Dakar" src="https://www.google.com/maps?q=Dakar,Senegal&output=embed"
loading="lazy">
</iframe>
</div>
</section>

  <!-- ===== AVIS CLIENTS ===== -->
  <section class="section reveal">
    <div class="section-head"><div class="eyebrow">Ils sont venus</div><h2>Ce que disent nos clients</h2></div>
    ${testimonialsMarkup()}
  </section>

  <!-- ===== FAQ ===== -->
  <section class="section section-tight" style="background:var(--sable);">
    <div class="section-head reveal" style="margin-bottom:20px;"><div class="eyebrow">Questions fréquentes</div><h2>Tout savoir avant de réserver</h2></div>
    <div class="faq-list reveal">
      ${[
        ["À quelle heure sont l'arrivée et le départ ?","L'arrivée (check-in) se fait à partir de 14h00 et le départ (check-out) avant 12h00. Un départ tardif peut être demandé à la réception selon disponibilité."],
        ["Puis-je annuler ou modifier ma réservation ?","Oui, vous pouvez consulter et gérer vos réservations depuis l'espace « Mes réservations » une fois connecté à votre compte."],
        ["Le petit-déjeuner est-il inclus ?","Selon la formule choisie lors de la réservation. Le restaurant panoramique propose également une carte sénégalaise et internationale à la carte."],
        ["L'hôtel propose-t-il un transfert depuis l'aéroport ?","Oui, notre conciergerie organise des transferts aéroport sur demande, disponibles 24h/24."],
        ["Les animaux sont-ils acceptés ?","Les animaux de compagnie de petite taille sont acceptés dans certaines chambres, sur demande préalable auprès de la réception."]
      ].map(([q,a],i)=>`
      <div class="faq-item${i===0?" open":""}">
        <button type="button" class="faq-question" data-faq-toggle>
          <span>${q}</span><span class="faq-plus">+</span>
        </button>
        <div class="faq-answer"><div class="faq-answer-inner">${a}</div></div>
      </div>`).join("")}
    </div>
  </section>

  <!-- ===== NEWSLETTER ===== -->
  <section class="newsletter-band reveal">
    <div class="newsletter-inner">
      <div class="newsletter-icon">${ic('mail')}</div>
      <div class="eyebrow" style="color:var(--or-fonce);">Restons en contact</div>
      <h2 style="color:var(--bleu-nuit);margin-top:10px;">Recevez nos offres exclusives</h2>
      <p style="color:var(--text-soft);font-size:13.5px;margin-top:10px;">Promotions, événements et nouveautés de Teranga Palace, directement dans votre boîte mail — sans spam, désinscription en un clic.</p>

      <div class="newsletter-perks">
        <span>${ic('sparkle')} Offres exclusives</span>
        <span>${ic('calendar')} Avant-premières</span>
        <span>${ic('heart')} Invitations événements</span>
      </div>

      <form class="newsletter-form" id="newsletter-form">
        <div class="newsletter-input-wrap">
          ${ic('mail')}
          <input type="email" id="nl-email" placeholder="Votre adresse email" required>
        </div>
        <button type="submit" class="btn btn-gold">S'inscrire</button>
      </form>
      <p style="color:var(--text-soft);opacity:.8;font-size:11px;margin-top:14px;">En vous inscrivant, vous acceptez de recevoir nos communications. Vous pourrez vous désinscrire à tout moment.</p>

      <div class="newsletter-success" id="newsletter-success">
        <div class="newsletter-success-icon">${ic('check')}</div>
        <h4>Merci pour votre inscription !</h4>
        <p>Vous recevrez bientôt nos offres exclusives par email.</p>
      </div>
    </div>
  </section>`;
}

/* ---------------------------- AVIS CLIENTS (témoignages) ---------------------------- */
const TESTIMONIALS = [
  {texte:"Un séjour absolument mémorable. Le service allie la chaleur sénégalaise à une rigueur toute internationale.", auteur:"Aïssatou D. — Dakar", note:5},
  {texte:"Chambre magnifique avec vue sur l'océan, personnel aux petits soins du premier au dernier jour.", auteur:"Marc L. — Paris", note:5},
  {texte:"La réservation en ligne était simple et la confirmation immédiate. Exactement ce qui était promis.", auteur:"Fatou S. — Abidjan", note:4},
  {texte:"Le restaurant panoramique à lui seul justifie le séjour. Une adresse à recommander sans hésiter.", auteur:"Thomas K. — Bruxelles", note:5},
];
function testimonialsMarkup(){
  return `
  <div class="testimonials-track">
    <div class="testimonials-slides" id="testimonials-slides">
      ${TESTIMONIALS.map(t=>`
      <div class="testimonial-slide">
        <div class="testimonial-card">
          <div class="testimonial-stars">${"★".repeat(t.note)}${"☆".repeat(5-t.note)}</div>
          <p class="testimonial-quote">« ${t.texte} »</p>
          <div class="testimonial-author">${t.auteur}</div>
        </div>
      </div>`).join("")}
    </div>
  </div>
  <div class="testimonial-dots" id="testimonial-dots">
    ${TESTIMONIALS.map((_,i)=>`<button type="button" class="testimonial-dot${i===0?" active":""}" data-dot="${i}" aria-label="Avis ${i+1}"></button>`).join("")}
  </div>`;
}

/* Équipements affichés en petits badges sur les cards (purement visuel — la fiche
   chambre en base ne stocke pas d'équipements, donc on en déduit un jeu cohérent
   par type de chambre). N'affecte ni les données ni le filtrage/la réservation. */
function roomAmenities(c){
  const base = ["Wi-Fi", "Climatisation"];
  const parType = {
    "Simple": ["Bureau"],
    "Double": ["Balcon"],
    "Suite": ["Jacuzzi", "Terrasse privée"]
  };
  return base.concat(parType[c.type] || []);
}

function roomCard(c){
  const statusBadge = c.statut==="Disponible" ? '<span class="badge badge-solid badge-green">Disponible</span>'
    : c.statut==="Occupée" ? '<span class="badge badge-solid badge-red">Occupée</span>'
    : '<span class="badge badge-solid badge-gray">Maintenance</span>';
  const visual = roomImageTag(c, "width:100%;height:100%;object-fit:cover;");
  return `<div class="room-card reveal">
    <div class="room-visual" style="background:var(--bleu-nuit);">
      ${visual}
      <div style="position:absolute;top:14px;left:14px;">${statusBadge}</div>
      <div class="room-price-badge">${fmtMoney(c.prixParNuit)}<span>/ nuit</span></div>
    </div>
    <div class="room-body">
      <div class="type">Chambre ${c.type}</div>
      <div class="room-meta">
        <span>${ic('users')} ${c.capacite} pers.</span>
        <span>N° ${c.numeroChambre}</span>
      </div>
      <p style="font-size:12.5px;color:var(--text-soft);line-height:1.6;min-height:38px;">${c.description}</p>
      <div class="room-amenities">${roomAmenities(c).map(a=>`<span class="amenity-chip">${a}</span>`).join("")}</div>
      <div class="room-footer">
        <a href="#/reserver?chambre=${c.numeroChambre}" class="btn btn-outline btn-sm btn-block">Réserver cette chambre</a>
      </div>
    </div>
  </div>`;
}

function pageChambres(){
  const types = ["Tous","Simple","Double","Suite"];
  return `
  <section class="section-tight" style="background:var(--bleu-nuit);color:var(--ivoire);">
    <div class="section" style="padding:60px 28px 0;">
      <div class="eyebrow">Hébergement</div>
      <h2 style="font-size:38px;margin-top:10px;">Nos chambres &amp; suites</h2>
      <p style="color:rgba(250,248,243,.65);margin-top:12px;max-width:600px;">De la chambre Simple à la Suite Présidentielle, chaque espace conjugue confort moderne et raffinement sénégalais.</p>
    </div>
  </section>
  <section class="section">
    <div style="display:flex;gap:10px;margin-bottom:30px;flex-wrap:wrap;">
      ${types.map(t=>`<button class="btn btn-sm ${t==='Tous'?'btn-dark':'btn-outline'}" data-filter-type="${t}">${t}</button>`).join("")}
    </div>
    <div class="room-grid" id="rooms-grid">${DB.chambres.map(roomCard).join("")}</div>
  </section>`;
}
function wireChambres(){
  document.querySelectorAll("[data-filter-type]").forEach(btn=>{
    btn.onclick = ()=>{
      document.querySelectorAll("[data-filter-type]").forEach(b=>{ b.classList.remove("btn-dark"); b.classList.add("btn-outline"); });
      btn.classList.add("btn-dark"); btn.classList.remove("btn-outline");
      const t = btn.dataset.filterType;
      const filtered = t==="Tous" ? DB.chambres : DB.chambres.filter(c=>c.type===t);
      document.getElementById("rooms-grid").innerHTML = filtered.length ? filtered.map(roomCard).join("") : emptyState("Aucune chambre dans cette catégorie.");
    };
  });
}

function emptyState(msg){
  return `<div class="empty-state" style="grid-column:1/-1;">${ic('empty')}<h4>Rien à afficher</h4><p>${msg}</p></div>`;
}

/* ---------------------------- PAGE GALERIE ----------------------------
   Galerie photo immersive des chambres — remplace l'ancienne page "Vue 3D".
   Réutilise les vraies données/images des chambres (roomImageTag) : chaque
   vignette ouvre une visionneuse plein écran avec navigation clavier/flèches
   et un accès direct à la réservation de la chambre affichée. */
function galleryTile(c, index){
  const visual = roomImageTag(c, "width:100%;height:100%;object-fit:cover;");
  return `<button type="button" class="gallery-tile reveal" data-gallery-index="${index}" aria-label="Agrandir la photo de la chambre ${c.numeroChambre}">
    <div class="gallery-tile-img">${visual}</div>
    <div class="gallery-tile-overlay">
      <span class="gallery-tile-zoom">${ic('search')}</span>
      <div class="gallery-tile-info">
        <span class="gallery-tile-type">Chambre ${c.type}</span>
        <span class="gallery-tile-num">N° ${c.numeroChambre} · ${fmtMoney(c.prixParNuit)}/nuit</span>
      </div>
    </div>
  </button>`;
}

function pageGalerie(){
  const types = ["Toutes","Simple","Double","Suite"];
  return `
  <section class="section-dark viz-gallery-hero">
    <div class="gallery-intro-card reveal">
      <div class="eyebrow">${ic('camera')} Galerie photo</div>
      <h2>Découvrez Teranga Palace en images</h2>
      <p style="margin-top:14px;color:rgba(250,248,243,.68);font-size:14.5px;line-height:1.8;">Parcourez nos chambres et suites en photo, cliquez sur une vignette pour l'agrandir, et réservez directement l'espace qui vous plaît.</p>
    </div>
  </section>
  <section class="section viz-gallery-section reveal">
    <div style="display:flex;gap:10px;margin-bottom:28px;flex-wrap:wrap;" id="gallery-filters">
      ${types.map(t=>`<button class="btn btn-sm ${t==='Toutes'?'btn-dark':'btn-outline'}" data-gallery-filter="${t}">${t}</button>`).join("")}
    </div>
    <div class="gallery-grid" id="gallery-grid" data-reveal-group>${DB.chambres.map(galleryTile).join("")}</div>
  </section>

  <div class="gallery-lightbox" id="gallery-lightbox">
    <div class="gallery-lightbox-backdrop" id="gallery-lightbox-backdrop"></div>
    <div class="gallery-lightbox-inner">
      <button type="button" class="gallery-lightbox-close" id="gallery-lightbox-close" aria-label="Fermer">✕</button>
      <button type="button" class="gallery-lightbox-nav gallery-lightbox-prev" id="gallery-lightbox-prev" aria-label="Photo précédente">‹</button>
      <div class="gallery-lightbox-media" id="gallery-lightbox-media"></div>
      <button type="button" class="gallery-lightbox-nav gallery-lightbox-next" id="gallery-lightbox-next" aria-label="Photo suivante">›</button>
      <div class="gallery-lightbox-caption" id="gallery-lightbox-caption"></div>
    </div>
  </div>`;
}

function wireGalerie(){
  let currentList = DB.chambres.slice();
  let currentIndex = 0;
  let currentFilterLabel = "Toutes";

  const grid = document.getElementById("gallery-grid");
  const lightbox = document.getElementById("gallery-lightbox");
  const media = document.getElementById("gallery-lightbox-media");
  const caption = document.getElementById("gallery-lightbox-caption");

  function renderGrid(list){
    const msg = currentFilterLabel === "Toutes" ? "Chargement des chambres…" : "Aucune chambre dans cette catégorie.";
    grid.innerHTML = list.length ? list.map(galleryTile).join("") : emptyState(msg);
    wireTiles(list);
    initScrollReveal();
  }

  function wireTiles(list){
    grid.querySelectorAll("[data-gallery-index]").forEach(btn=>{
      btn.onclick = ()=> openLightbox(list, parseInt(btn.dataset.galleryIndex, 10));
    });
  }

  function openLightbox(list, index){
    currentList = list;
    currentIndex = index;
    renderLightboxContent();
    lightbox.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox(){
    lightbox.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  function step(delta){
    currentIndex = (currentIndex + delta + currentList.length) % currentList.length;
    renderLightboxContent();
  }

  function renderLightboxContent(){
    const c = currentList[currentIndex];
    if(!c) return;
    media.innerHTML = roomImageTag(c, "width:100%;height:100%;object-fit:cover;");
    caption.innerHTML = `
      <div class="gallery-caption-text">
        <span class="gallery-caption-type">Chambre ${c.type} · N° ${c.numeroChambre}</span>
        <span class="gallery-caption-desc">${c.description || ""}</span>
      </div>
      <div class="gallery-caption-side">
        <span class="gallery-caption-price">${fmtMoney(c.prixParNuit)}<small>/nuit</small></span>
        <a href="#/reserver?chambre=${c.numeroChambre}" class="btn btn-gold btn-sm">Réserver</a>
      </div>`;
  }

  renderGrid(currentList);
  // Filet de sécurité : si DB.chambres n'est pas encore disponible au moment
  // exact du premier rendu (ex. hydratation en cours), on retente une fois
  // peu après sans qu'aucune action de l'utilisateur ne soit nécessaire.
  if(!currentList.length){
    setTimeout(()=>{
      if(document.getElementById("gallery-grid") === grid){
        currentList = DB.chambres.slice();
        renderGrid(currentList);
      }
    }, 400);
  }

  document.querySelectorAll("[data-gallery-filter]").forEach(btn=>{
    btn.onclick = ()=>{
      document.querySelectorAll("[data-gallery-filter]").forEach(b=>{ b.classList.remove("btn-dark"); b.classList.add("btn-outline"); });
      btn.classList.add("btn-dark"); btn.classList.remove("btn-outline");
      const t = btn.dataset.galleryFilter;
      currentFilterLabel = t;
      renderGrid(t==="Toutes" ? DB.chambres.slice() : DB.chambres.filter(c=>c.type===t));
    };
  });

  document.getElementById("gallery-lightbox-close").onclick = closeLightbox;
  document.getElementById("gallery-lightbox-backdrop").onclick = closeLightbox;
  document.getElementById("gallery-lightbox-prev").onclick = ()=>step(-1);
  document.getElementById("gallery-lightbox-next").onclick = ()=>step(1);

  const onKey = (e)=>{
    if(!lightbox.classList.contains("is-open")) return;
    if(e.key==="Escape") closeLightbox();
    if(e.key==="ArrowLeft") step(-1);
    if(e.key==="ArrowRight") step(1);
  };
  document.addEventListener("keydown", onKey);
}

/* ---------------------------- PAGE RÉSERVER ---------------------------- */
/* Si la session dit "Client" mais que le compte correspondant n'existe plus
   dans DB.clients (ex: base réinitialisée entre-temps côté Supabase), on
   traite la session comme invalide plutôt que de sauter à l'étape 2 avec un
   champ email vide, en lecture seule et obligatoire : ça bloquait totalement
   la réservation, sans aucun moyen de corriger depuis l'interface. */
function resolveClientSession(session){
  if(session && session.role === "Client" && !DB.clients.find(c=>c.idClient===session.idClient)){
    return null;
  }
  return session;
}

function pageReserver(rawSession){
  const session = resolveClientSession(rawSession);
  const preselect = routeQuery().chambre || "";
  const prefill = session && session.role==="Client" ? DB.clients.find(c=>c.idClient===session.idClient) : null;
  return `
  <section class="section">
    <div class="section-head"><div class="eyebrow">Réservation</div><h2>Réserver une chambre</h2>
      <p>${session ? "Indiquez vos dates et le nombre de personnes : nous vérifions la disponibilité en temps réel avant toute confirmation." : "Connectez-vous ou créez votre compte pour commencer, puis indiquez vos dates : nous vérifions la disponibilité en temps réel avant toute confirmation."}</p></div>

    <div class="stepper" id="stepper">
      <div class="step ${session?'done':'active'}" data-step="1"><span class="num">1</span> Identification</div><div class="step-sep"></div>
      <div class="step ${session?'active':''}" data-step="2"><span class="num">2</span> Dates</div><div class="step-sep"></div>
      <div class="step" data-step="3"><span class="num">3</span> Chambre</div><div class="step-sep"></div>
      <div class="step" data-step="4"><span class="num">4</span> Vos informations</div><div class="step-sep"></div>
      <div class="step" data-step="5"><span class="num">5</span> Confirmation</div>
    </div>

    <div class="panel" style="max-width:900px;">
      <!-- ÉTAPE 1 : identification (connexion ou création de compte) -->
      <div id="res-step-1" class="${session?'hidden':''}">
        <p style="font-size:13px;color:var(--text-soft);margin-bottom:18px;">Pour réserver, connectez-vous à votre compte ou créez-en un. C'est nécessaire avant de pouvoir choisir vos dates et votre chambre.</p>
        <div style="display:flex;gap:10px;margin-bottom:22px;">
          <button class="btn btn-sm btn-dark" id="auth-tab-login" data-auth-tab="login">J'ai déjà un compte</button>
          <button class="btn btn-sm btn-outline" id="auth-tab-signup" data-auth-tab="signup">Créer un compte</button>
        </div>

        <div id="auth-login-panel">
          <div class="field"><label>Email</label><input type="email" id="auth-lg-email"><span class="err">Veuillez saisir un email valide.</span></div>
          <div class="field"><label>Mot de passe</label><input type="password" id="auth-lg-pass"><span class="err">Veuillez renseigner votre mot de passe.</span></div>
          <p id="auth-login-error" style="color:var(--rouge);font-size:12.5px;margin-bottom:10px;"></p>
          <button class="btn btn-gold" id="btn-auth-login">Se connecter et continuer</button>
        </div>

        <div id="auth-signup-panel" class="hidden">
          <div class="form-grid">
            <div class="field"><label>Nom</label><input type="text" id="auth-su-nom"><span class="err">Le nom est obligatoire.</span></div>
            <div class="field"><label>Prénom</label><input type="text" id="auth-su-prenom"><span class="err">Le prénom est obligatoire.</span></div>
            <div class="field"><label>Email</label><input type="email" id="auth-su-email"><span class="err">Veuillez saisir un email valide.</span></div>
            <div class="field"><label>Téléphone</label><input type="tel" id="auth-su-tel"><span class="err">Veuillez saisir un téléphone valide.</span></div>
            <div class="field"><label>Mot de passe</label><input type="password" id="auth-su-pass"><span class="err">Le mot de passe doit contenir au moins 6 caractères.</span></div>
            <div class="field"><label>Confirmer le mot de passe</label><input type="password" id="auth-su-pass2"><span class="err">Les mots de passe ne correspondent pas.</span></div>
          </div>
          <p id="auth-signup-error" style="color:var(--rouge);font-size:12.5px;margin-bottom:10px;"></p>
          <button class="btn btn-gold" id="btn-auth-signup">Créer mon compte et continuer</button>
        </div>
      </div>

      <!-- ÉTAPE 2 : dates -->
      <div id="res-step-2" class="hidden">
        <div class="form-grid">
          <div class="field"><label>Date d'arrivée</label><input type="date" id="r-arrivee" min="${todayStr()}"><span class="err">Veuillez indiquer une date d'arrivée.</span></div>
          <div class="field"><label>Date de départ</label><input type="date" id="r-depart"><span class="err">La date de départ doit être postérieure à la date d'arrivée.</span></div>
          <div class="field"><label>Nombre de personnes</label><input type="number" id="r-personnes" min="1" max="6" value="2"><span class="err">Veuillez indiquer un nombre de personnes valide.</span></div>
          <div class="field"><label>Type de chambre (optionnel)</label>
            <select id="r-type"><option value="">Tous types</option><option value="Simple">Simple</option><option value="Double">Double</option><option value="Suite">Suite</option></select>
          </div>
        </div>
        <button class="btn btn-gold" id="btn-search-rooms">${ic('search')} Vérifier la disponibilité</button>
      </div>

      <!-- ÉTAPE 3 : sélection chambre -->
      <div id="res-step-3" class="hidden">
        <div id="rooms-results"></div>
        <button class="btn btn-outline btn-sm" id="btn-back-2" style="margin-top:16px;">← Modifier les dates</button>
      </div>

      <!-- ÉTAPE 4 : infos client -->
      <div id="res-step-4" class="hidden">
        <div id="price-summary" style="background:var(--ivoire);padding:18px 20px;margin-bottom:22px;border-left:3px solid var(--or);"></div>
        <div class="form-grid">
          <div class="field"><label>Nom</label><input type="text" id="c-nom" value="${prefill?prefill.nom:''}"><span class="err">Le nom est obligatoire.</span></div>
          <div class="field"><label>Prénom</label><input type="text" id="c-prenom" value="${prefill?prefill.prenom:''}"><span class="err">Le prénom est obligatoire.</span></div>
          <div class="field"><label>Email (compte)</label><input type="email" id="c-email" value="${prefill?prefill.email:''}" readonly style="background:var(--sable);cursor:not-allowed;"><span class="err">Veuillez saisir un email valide.</span></div>
          <div class="field"><label>Téléphone</label><input type="tel" id="c-tel" value="${prefill?prefill.telephone:''}"><span class="err">Veuillez saisir un téléphone valide.</span></div>
        </div>
        <div style="display:flex;gap:10px;">
          <button class="btn btn-outline btn-sm" id="btn-back-3">← Changer de chambre</button>
          <button class="btn btn-gold" id="btn-confirm-res">Confirmer la réservation</button>
        </div>
      </div>

      <!-- ÉTAPE 5 : confirmation -->
      <div id="res-step-5" class="hidden"></div>
    </div>
  </section>`;
}

let RES_STATE = {};
function wireReserver(rawSession){
  RES_STATE = {};
  let currentSession = resolveClientSession(rawSession); // devient actif une fois la connexion / création de compte faite à l'étape 1
  const q = routeQuery();
  const preselect = q.chambre || "";
  const goStep = (n)=>{
    [1,2,3,4,5].forEach(i=>document.getElementById("res-step-"+i).classList.toggle("hidden", i!==n));
    document.querySelectorAll("#stepper .step").forEach(s=>{
      const sn = parseInt(s.dataset.step,10);
      s.classList.toggle("active", sn===n);
      s.classList.toggle("done", sn<n);
    });
  };

  // Pré-remplit et verrouille les infos de contact à partir du compte identifié.
  // Filet de sécurité : si la fiche n'est pas (encore) retrouvée par idClient
  // (ex: juste après une création de compte), on retente par email avant d'abandonner.
  const fillInfoFromSession = ()=>{
    if(!currentSession) return;
    const client = (currentSession.idClient && DB.clients.find(c=>c.idClient===currentSession.idClient))
      || (currentSession.email && DB.clients.find(c=>c.email.toLowerCase()===currentSession.email.toLowerCase()))
      || null;
    if(!client) return;
    document.getElementById("c-nom").value = client.nom;
    document.getElementById("c-prenom").value = client.prenom;
    document.getElementById("c-email").value = client.email;
    document.getElementById("c-tel").value = client.telephone;
  };

  /* ---------------- Étape 1 : identification (connexion / création de compte) ---------------- */
  const authTabLogin = document.getElementById("auth-tab-login");
  const authTabSignup = document.getElementById("auth-tab-signup");
  const loginPanel = document.getElementById("auth-login-panel");
  const signupPanel = document.getElementById("auth-signup-panel");
  wirePasswordToggle("auth-lg-pass");
  wirePasswordToggle("auth-su-pass");
  wirePasswordToggle("auth-su-pass2");
  authTabLogin.onclick = ()=>{
    authTabLogin.classList.add("btn-dark"); authTabLogin.classList.remove("btn-outline");
    authTabSignup.classList.add("btn-outline"); authTabSignup.classList.remove("btn-dark");
    loginPanel.classList.remove("hidden"); signupPanel.classList.add("hidden");
  };
  authTabSignup.onclick = ()=>{
    authTabSignup.classList.add("btn-dark"); authTabSignup.classList.remove("btn-outline");
    authTabLogin.classList.add("btn-outline"); authTabLogin.classList.remove("btn-dark");
    signupPanel.classList.remove("hidden"); loginPanel.classList.add("hidden");
  };

  document.getElementById("btn-auth-login").onclick = ()=>{
    const email = document.getElementById("auth-lg-email"), pass = document.getElementById("auth-lg-pass");
    let valid = true;
    valid = markField(email, isEmailValid(email.value), "Veuillez saisir un email valide.") && valid;
    valid = markField(pass, !!pass.value) && valid;
    if(!valid) return;
    const user = DB.users.find(u=>u.email.toLowerCase()===email.value.toLowerCase() && u.password===pass.value);
    if(!user){ document.getElementById("auth-login-error").textContent = "Email ou mot de passe incorrect."; return; }
    if(user.role!=="Client"){ document.getElementById("auth-login-error").textContent = "Ce compte n'est pas un compte client."; return; }
    document.getElementById("auth-login-error").textContent = "";
    const client = DB.clients.find(c=>c.idClient===user.idClient);
    currentSession = {email:user.email, role:user.role, idClient:user.idClient, prenom: client?client.prenom:user.role};
    setSession(currentSession);
    toast("Connexion réussie","Bienvenue "+(client?client.prenom:user.role)+".");
    afterIdentification();
  };

  document.getElementById("btn-auth-signup").onclick = ()=>{
    const nom = document.getElementById("auth-su-nom"), prenom = document.getElementById("auth-su-prenom"),
          email = document.getElementById("auth-su-email"), tel = document.getElementById("auth-su-tel"),
          pass = document.getElementById("auth-su-pass"), pass2 = document.getElementById("auth-su-pass2");
    let valid = true;
    valid = markField(nom, !!nom.value.trim()) && valid;
    valid = markField(prenom, !!prenom.value.trim()) && valid;
    valid = markField(email, isEmailValid(email.value), "Veuillez saisir un email valide.") && valid;
    valid = markField(tel, isPhoneValid(tel.value), "Veuillez saisir un téléphone valide.") && valid;
    valid = markField(pass, pass.value.length>=6, "Le mot de passe doit contenir au moins 6 caractères.") && valid;
    valid = markField(pass2, pass2.value===pass.value && pass.value.length>=6, "Les mots de passe ne correspondent pas.") && valid;
    if(!valid){ toast("Formulaire incomplet","Veuillez corriger les champs indiqués.", true); return; }
    const errEl = document.getElementById("auth-signup-error");
    if(DB.users.some(u=>u.email.toLowerCase()===email.value.trim().toLowerCase())){
      errEl.textContent = "Un compte existe déjà avec cet email. Veuillez vous connecter.";
      return;
    }
    errEl.textContent = "";
    const client = findOrCreateClient({nom:nom.value.trim(), prenom:prenom.value.trim(), email:email.value.trim(), telephone:tel.value.trim()});
    DB.users.push({email:client.email, password:pass.value, role:"Client", idClient:client.idClient});
    save();
    currentSession = {email:client.email, role:"Client", idClient:client.idClient, prenom:client.prenom};
    setSession(currentSession);
    toast("Compte créé","Bienvenue "+client.prenom+", votre compte a été enregistré.");
    afterIdentification();
  };

  // Une fois identifié : on passe aux dates, et si une chambre était présélectionnée on relance la recherche
  const afterIdentification = ()=>{
    goStep(2);
    if(preselect){
      document.getElementById("r-arrivee").value = todayStr();
      const d = new Date(); d.setDate(d.getDate()+3);
      document.getElementById("r-depart").value = d.toISOString().slice(0,10);
      setTimeout(()=>{ document.getElementById("btn-search-rooms").click(); }, 0);
    }
  };

  /* ---------------- Étape 2 : dates ---------------- */
  document.getElementById("btn-search-rooms").onclick = ()=>{
    if(!currentSession || !currentSession.idClient){
      toast("Identification requise","Veuillez vous connecter ou créer un compte avant de réserver.", true);
      goStep(1);
      return;
    }
    const arrivee = document.getElementById("r-arrivee");
    const depart = document.getElementById("r-depart");
    const personnes = document.getElementById("r-personnes");
    let valid = true;
    valid = markField(arrivee, !!arrivee.value) && valid;
    valid = markField(depart, !!depart.value && depart.value > arrivee.value, "La date de départ doit être postérieure à la date d'arrivée.") && valid;
    valid = markField(personnes, personnes.value>=1) && valid;
    if(!valid){ toast("Champs manquants","Veuillez renseigner tous les champs.", true); return; }

    const type = document.getElementById("r-type").value;
    const nb = parseInt(personnes.value,10);
    RES_STATE = {dateArrivee:arrivee.value, dateDepart:depart.value, nbPersonnes:nb};
    const rooms = searchAvailableRooms(arrivee.value, depart.value, nb, type||null);
    const resultsEl = document.getElementById("rooms-results");
    if(!rooms.length){
      resultsEl.innerHTML = `<div class="empty-state">${ic('empty')}<h4>Aucune chambre disponible</h4><p>Aucune chambre disponible pour ces dates. Essayez d'autres dates ou un autre type de chambre.</p></div>`;
    } else {
      const nuits = nightsBetween(arrivee.value, depart.value);
      resultsEl.innerHTML = `<p style="font-size:13px;color:var(--text-soft);margin-bottom:16px;">${rooms.length} chambre(s) disponible(s) pour ${nuits} nuit(s), du ${fmtDate(arrivee.value)} au ${fmtDate(depart.value)}.</p>
        <div class="room-grid">` + rooms.map(c=>`
          <div class="room-card" style="cursor:pointer;" data-pick-room="${c.numeroChambre}">
            <div class="room-visual" style="background:var(--bleu-nuit);">
              ${roomImageTag(c, "width:100%;height:100%;object-fit:cover;")}
            </div>
            <div class="room-body">
              <div class="type">Chambre ${c.type}</div>
              <div class="room-meta"><span>${ic('users')} ${c.capacite} pers.</span><span>N° ${c.numeroChambre}</span></div>
              <div class="room-price">${fmtMoney(c.prixParNuit)} <span>/ nuit</span></div>
              <div style="font-size:12px;color:var(--vert);margin-top:6px;">Total séjour : ${fmtMoney(c.prixParNuit*nuits)}</div>
              <button class="btn btn-gold btn-sm btn-block" style="margin-top:12px;">Choisir cette chambre</button>
            </div>
          </div>`).join("") + `</div>`;
      resultsEl.querySelectorAll("[data-pick-room]").forEach(card=>{
        card.onclick = ()=>{
          const numero = card.dataset.pickRoom;
          const chambre = DB.chambres.find(c=>c.numeroChambre===numero);
          RES_STATE.numeroChambre = numero;
          const nuits2 = nightsBetween(RES_STATE.dateArrivee, RES_STATE.dateDepart);
          document.getElementById("price-summary").innerHTML = `
            <div style="display:flex;justify-content:space-between;font-size:13.5px;margin-bottom:6px;"><span>Chambre ${chambre.type} N° ${chambre.numeroChambre}</span><span>${fmtMoney(chambre.prixParNuit)} / nuit</span></div>
            <div style="display:flex;justify-content:space-between;font-size:13.5px;margin-bottom:6px;color:var(--text-soft);"><span>${fmtDate(RES_STATE.dateArrivee)} → ${fmtDate(RES_STATE.dateDepart)}</span><span>${nuits2} nuit(s)</span></div>
            <div style="display:flex;justify-content:space-between;font-family:var(--serif);font-size:20px;margin-top:10px;padding-top:10px;border-top:1px solid rgba(13,27,46,.1);"><span>Montant total</span><span>${fmtMoney(chambre.prixParNuit*nuits2)}</span></div>`;
          fillInfoFromSession();
          goStep(4);
        };
      });
    }
    goStep(3);
  };

  document.getElementById("btn-back-2").onclick = ()=>goStep(2);
  document.getElementById("btn-back-3").onclick = ()=>goStep(3);

  const wireConfirm = ()=>{
    const btn = document.getElementById("btn-confirm-res");
    if(!btn) return;
    btn.onclick = ()=>{
      if(!currentSession || !currentSession.idClient){
        // Sécurité : la réservation exige une identification préalable (étape 1)
        toast("Identification requise","Veuillez vous connecter ou créer un compte avant de réserver.", true);
        goStep(1);
        return;
      }
      const nom = document.getElementById("c-nom"), prenom = document.getElementById("c-prenom"),
            email = document.getElementById("c-email"), tel = document.getElementById("c-tel");
      // Filet de sécurité : si les champs n'ont pas été pré-remplis au moment du choix
      // de la chambre (fiche client pas encore retrouvée à cet instant), on retente ici,
      // juste avant de valider — jamais si l'un des champs contient déjà une valeur.
      if(!nom.value.trim() && !prenom.value.trim() && !email.value.trim() && !tel.value.trim()){
        fillInfoFromSession();
      }
      let valid = true;
      valid = markField(nom, !!nom.value.trim()) && valid;
      valid = markField(prenom, !!prenom.value.trim()) && valid;
      valid = markField(email, isEmailValid(email.value), "Veuillez saisir un email valide.") && valid;
      valid = markField(tel, isPhoneValid(tel.value), "Veuillez saisir un téléphone valide.") && valid;
      if(!valid){ toast("Formulaire incomplet","Veuillez renseigner tous les champs.", true); return; }

      btn.innerHTML = `<span class="loader"></span> Traitement...`; btn.disabled = true;
      setTimeout(async ()=>{
        // Met à jour les coordonnées du compte du client déjà identifié (pas de nouveau compte anonyme)
        const client = DB.clients.find(c=>c.idClient===currentSession.idClient);
        client.nom = nom.value.trim(); client.prenom = prenom.value.trim(); client.telephone = tel.value.trim();
        save();
        // On attend la réponse réelle du serveur partagé avant d'afficher un succès :
        // createReservation vérifie désormais directement auprès de Supabase (voir
        // js/data.js) pour ne jamais confirmer côté client une réservation que le
        // serveur aurait en réalité refusée à cause d'un conflit avec un autre appareil.
        const result = await createReservation({idClient:client.idClient, numeroChambre:RES_STATE.numeroChambre, dateArrivee:RES_STATE.dateArrivee, dateDepart:RES_STATE.dateDepart, nbPersonnes:RES_STATE.nbPersonnes});
        if(!result.ok){
          toast("Réservation impossible", result.error, true);
          btn.innerHTML = "Confirmer la réservation"; btn.disabled = false;
          goStep(3);
          return;
        }
        document.getElementById("res-step-5").innerHTML = `
          <div style="text-align:center;padding:20px 0;">
            <div style="color:var(--vert);">${ic('check')}</div>
            <h3 style="margin-top:14px;">Réservation confirmée</h3>
            <p style="color:var(--text-soft);margin:6px 0 20px;">ID : <b>${result.reservation.id}</b></p>
            <div class="panel" style="text-align:left;max-width:420px;margin:0 auto;">
              <div style="display:flex;justify-content:space-between;font-size:13.5px;padding:6px 0;"><span>Client</span><b>${client.prenom} ${client.nom}</b></div>
              <div style="display:flex;justify-content:space-between;font-size:13.5px;padding:6px 0;"><span>Chambre</span><b>N° ${RES_STATE.numeroChambre}</b></div>
              <div style="display:flex;justify-content:space-between;font-size:13.5px;padding:6px 0;"><span>Séjour</span><b>${fmtDate(RES_STATE.dateArrivee)} → ${fmtDate(RES_STATE.dateDepart)}</b></div>
              <div style="display:flex;justify-content:space-between;font-size:13.5px;padding:6px 0;"><span>Montant</span><b>${fmtMoney(result.reservation.montant)}</b></div>
            </div>
            <div style="display:flex;gap:10px;justify-content:center;margin-top:26px;">
              <a href="#/mes-reservations" class="btn btn-gold">Voir mes réservations</a>
              <a href="#/accueil" class="btn btn-outline">Retour à l'accueil</a>
            </div>
          </div>`;
        goStep(5);
        toast("Réservation confirmée", "ID : "+result.reservation.id);
      }, 500);
    };
  };
  wireConfirm();
  // re-wire confirm button whenever step 4 content changes
  const obs = new MutationObserver(wireConfirm);
  obs.observe(document.getElementById("res-step-4"), {childList:true, subtree:true});

  // Si déjà connecté à l'arrivée sur la page, on saute directement l'identification
  if(currentSession && currentSession.idClient){
    goStep(2);
    if(preselect){
      document.getElementById("r-arrivee").value = todayStr();
      const d = new Date(); d.setDate(d.getDate()+3);
      document.getElementById("r-depart").value = d.toISOString().slice(0,10);
      setTimeout(()=>{ document.getElementById("btn-search-rooms").click(); }, 0);
    }
  } else {
    goStep(1);
  }
}

/* ---------------------------- MES RÉSERVATIONS ---------------------------- */
function pageMesReservations(session){
  return `
  <section class="section">
    <div class="section-head"><div class="eyebrow">Espace client</div><h2>Mes réservations</h2>
      <p>Consultez, modifiez ou annulez vos réservations à tout moment.</p></div>
    ${session && session.role==="Client" ? `<div id="my-res-list"></div>` : `
    <div class="panel" style="max-width:520px;">
      <p style="font-size:13.5px;color:var(--text-soft);margin-bottom:16px;">Connectez-vous à votre espace client, ou retrouvez une réservation avec son identifiant et votre email.</p>
      <div class="field"><label>Identifiant de réservation</label><input type="text" id="lookup-id" placeholder="TP-2026-00101"></div>
      <div class="field"><label>Email utilisé lors de la réservation</label><input type="email" id="lookup-email"></div>
      <button class="btn btn-gold btn-block" id="btn-lookup">Rechercher ma réservation</button>
      <div id="lookup-result" style="margin-top:20px;"></div>
      <p style="font-size:12.5px;text-align:center;margin-top:18px;">— ou — <a href="#/connexion" style="color:var(--or);text-decoration:underline;">connectez-vous</a></p>
    </div>`}
  </section>`;
}
function reservationRow(r, session, editable){
  const client = DB.clients.find(c=>c.idClient===r.idClient);
  const chambre = DB.chambres.find(c=>c.numeroChambre===r.numeroChambre);
  const badge = r.statut==="Confirmée" ? '<span class="badge badge-green">Confirmée</span>'
    : r.statut==="Annulée" ? '<span class="badge badge-red">Annulée</span>' : '<span class="badge badge-blue">Terminée</span>';
  return `<div class="panel" style="margin-bottom:16px;">
    <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px;align-items:flex-start;">
      <div>
        <div style="font-family:var(--serif);font-size:19px;">${r.id}</div>
        <div style="font-size:12.5px;color:var(--text-soft);margin-top:4px;">Chambre ${chambre?chambre.type:''} N° ${r.numeroChambre} · ${client?client.prenom+' '+client.nom:''}</div>
      </div>
      ${badge}
    </div>
    <div style="display:flex;gap:26px;margin-top:14px;flex-wrap:wrap;font-size:13px;">
      <div><span style="color:var(--text-soft);">Arrivée</span><br><b>${fmtDate(r.dateArrivee)}</b></div>
      <div><span style="color:var(--text-soft);">Départ</span><br><b>${fmtDate(r.dateDepart)}</b></div>
      <div><span style="color:var(--text-soft);">Personnes</span><br><b>${r.nbPersonnes}</b></div>
      <div><span style="color:var(--text-soft);">Montant</span><br><b>${fmtMoney(r.montant)}</b></div>
    </div>
    ${editable && r.statut==="Confirmée" ? `<div class="row-actions" style="margin-top:16px;">
      <button class="btn btn-outline btn-sm" data-modify="${r.id}">Modifier</button>
      <button class="btn btn-danger btn-sm" data-cancel="${r.id}">Annuler</button>
    </div>` : ""}
  </div>`;
}
function wireMesReservations(session){
  if(session && session.role==="Client"){
    const list = DB.reservations.filter(r=>r.idClient===session.idClient).sort((a,b)=>b.dateCreation.localeCompare(a.dateCreation));
    const el = document.getElementById("my-res-list");
    el.innerHTML = list.length ? list.map(r=>reservationRow(r,session,true)).join("") : emptyState("Vous n'avez pas encore de réservation. <a href='#/reserver'>Réserver maintenant</a>");
    wireReservationActions(el, ()=>wireMesReservations(session));
    return;
  }
  const btn = document.getElementById("btn-lookup");
  if(!btn) return;
  btn.onclick = ()=>{
    const id = document.getElementById("lookup-id").value.trim();
    const email = document.getElementById("lookup-email").value.trim().toLowerCase();
    const r = DB.reservations.find(x=>x.id.toLowerCase()===id.toLowerCase());
    const c = r ? DB.clients.find(cl=>cl.idClient===r.idClient) : null;
    const resultEl = document.getElementById("lookup-result");
    if(!r || !c || c.email.toLowerCase()!==email){
      resultEl.innerHTML = `<p style="color:var(--rouge);font-size:13px;">Aucune réservation trouvée avec ces informations.</p>`;
      return;
    }
    resultEl.innerHTML = reservationRow(r, null, true);
    wireReservationActions(resultEl, ()=>btn.click());
  };
}
function wireReservationActions(container, refresh){
  container.querySelectorAll("[data-noshow]").forEach(b=>{
    b.onclick = ()=>{
      openModal(`<h3>Client absent (No-show)</h3><p style="font-size:13.5px;color:var(--text-soft);">Confirmez-vous que le client ne s'est pas présenté pour la réservation <b>${b.dataset.noshow}</b> ? Elle passera au statut "No-show" et la chambre sera immédiatement libérée pour ces dates.</p>
      <div class="modal-actions"><button class="btn btn-outline btn-sm" id="modal-noshow-no">Retour</button><button class="btn btn-danger btn-sm" id="modal-noshow-yes">Confirmer l'absence</button></div>`);
      document.getElementById("modal-noshow-no").onclick = closeModal;
      document.getElementById("modal-noshow-yes").onclick = ()=>{
        const r = markNoShow(b.dataset.noshow);
        closeModal();
        if(!r.ok){ toast("Action impossible", r.error, true); return; }
        toast("Client marqué absent","La chambre est de nouveau disponible.");
        refresh();
      };
    };
  });
  container.querySelectorAll("[data-cancel]").forEach(b=>{
    b.onclick = ()=>{
      openModal(`<h3>Annuler la réservation</h3><p style="font-size:13.5px;color:var(--text-soft);">Confirmez-vous l'annulation de la réservation <b>${b.dataset.cancel}</b> ? La chambre sera libérée pour ces dates.</p>
      <div class="modal-actions"><button class="btn btn-outline btn-sm" id="modal-cancel-no">Retour</button><button class="btn btn-danger btn-sm" id="modal-cancel-yes">Confirmer l'annulation</button></div>`);
      document.getElementById("modal-cancel-no").onclick = closeModal;
      document.getElementById("modal-cancel-yes").onclick = ()=>{ cancelReservation(b.dataset.cancel); closeModal(); toast("Réservation annulée","La chambre est de nouveau disponible."); refresh(); };
    };
  });
  container.querySelectorAll("[data-modify]").forEach(b=>{
    b.onclick = ()=>{
      const r = DB.reservations.find(x=>x.id===b.dataset.modify);
      openModal(`<h3>Modifier la réservation</h3>
        <div class="field"><label>Date d'arrivée</label><input type="date" id="mod-arrivee" value="${r.dateArrivee}"></div>
        <div class="field"><label>Date de départ</label><input type="date" id="mod-depart" value="${r.dateDepart}"></div>
        <div class="field"><label>Nombre de personnes</label><input type="number" min="1" id="mod-nb" value="${r.nbPersonnes}"></div>
        <p id="mod-error" style="color:var(--rouge);font-size:12.5px;"></p>
        <div class="modal-actions"><button class="btn btn-outline btn-sm" id="modal-mod-no">Annuler</button><button class="btn btn-gold btn-sm" id="modal-mod-yes">Enregistrer</button></div>`);
      document.getElementById("modal-mod-no").onclick = closeModal;
      document.getElementById("modal-mod-yes").onclick = ()=>{
        const arr = document.getElementById("mod-arrivee").value, dep = document.getElementById("mod-depart").value, nb = parseInt(document.getElementById("mod-nb").value,10);
        if(!arr || !dep || dep<=arr){ document.getElementById("mod-error").textContent = "La date de départ doit être postérieure à la date d'arrivée."; return; }
        const chambre = DB.chambres.find(c=>c.numeroChambre===r.numeroChambre);
        if(nb > chambre.capacite){ document.getElementById("mod-error").textContent = "Le nombre de personnes dépasse la capacité de la chambre."; return; }
        if(!isRoomAvailable(r.numeroChambre, arr, dep, r.id)){ document.getElementById("mod-error").textContent = "Aucune chambre disponible pour ces dates."; return; }
        r.dateArrivee = arr; r.dateDepart = dep; r.nbPersonnes = nb;
        r.montant = nightsBetween(arr,dep) * chambre.prixParNuit;
        save(); closeModal(); toast("Réservation modifiée","Les nouvelles dates ont été enregistrées."); refresh();
      };
    };
  });
}

/* ---------------------------- MÉDAILLES DE DISTINCTIONS ----------------------------
   Vraies médailles illustrées (ruban à rayures, disque métallique en relief avec
   dégradé radial + reflet, tranche crénelée façon pièce, plaque centrale avec icône)
   pour la section "Reconnu par". 100% SVG en ligne, aucune dépendance externe,
   aucun logo réel de tiers reproduit. */
const MEDAL_ICONS = {
  star:`<path d="M0 -13 L3.1 -4.2 12.4 -4 5 1.7 7.6 10.6 0 5.2 -7.6 10.6 -5 1.7 -12.4 -4 -3.1 -4.2 Z" stroke-linejoin="round"/>`,
  shield:`<path d="M0 -14 10.2 -9.3 V2.8 C10.2 10.2 4.7 14.9 0 16.7 C-4.7 14.9 -10.2 10.2 -10.2 2.8 V-9.3 Z"/><path d="M0 -5.6 2.1 -0.7 7.4 -0.5 3.2 2.8 4.6 7.8 0 4.8 -4.6 7.8 -3.2 2.8 -7.4 -0.5 -2.1 -0.7 Z" stroke-width="1"/>`,
  key:`<circle cx="-5.6" cy="-5.6" r="5.2"/><path d="M-1.9 -1.9 L9.4 9.4"/><path d="M5.4 5.4 L8.4 2.4"/><path d="M7.9 7.9 L10.9 4.9"/>`,
  book:`<path d="M-11.2 -6.6 C-7.5 -8.5 -2.8 -8.5 0 -6.6 C2.8 -8.5 7.5 -8.5 11.2 -6.6 V8.4 C7.5 6.6 2.8 6.6 0 8.4 C-2.8 6.6 -7.5 6.6 -11.2 8.4 Z"/><line x1="0" y1="-6.6" x2="0" y2="8.4"/>`,
};
const MEDAL_METALS = {
  gold:  {hi:"#fbeec4", mid:"#ad8a3f", sh:"#8a6a2c", ring:"#d3b876"},
  silver:{hi:"#f3f6f8", mid:"#b7c0c9", sh:"#727b85", ring:"#dfe4e8"},
  bronze:{hi:"#eccaa0", mid:"#b97a4e", sh:"#71431f", ring:"#e0b088"},
  green: {hi:"#d7ecda", mid:"#4f8a5f", sh:"#2c4f34", ring:"#a9d3b3"},
};
function ribbonStripes(colors){
  const n = colors.length, step = 100/n;
  return colors.map((c,i)=>`<stop offset="${(i*step).toFixed(2)}%" stop-color="${c}"/><stop offset="${((i+1)*step).toFixed(2)}%" stop-color="${c}"/>`).join("");
}
function medalGraphic(uid, iconKey, metalKey, ribbonColors){
  const m = MEDAL_METALS[metalKey];
  const gradId = `medal-metal-${uid}`, ribbonId = `medal-ribbon-${uid}`, shadowId = `medal-shadow-${uid}`;
  // tranche crénelée (petits traits autour du disque)
  let notches = "";
  for(let i=0;i<40;i++){
    const a = (i/40)*Math.PI*2;
    const x1=70+Math.cos(a)*50.5, y1=142+Math.sin(a)*50.5;
    const x2=70+Math.cos(a)*47.5, y2=142+Math.sin(a)*47.5;
    notches += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${m.sh}" stroke-width=".8" opacity=".55"/>`;
  }
  return `
  <svg viewBox="0 0 140 226" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block;overflow:visible;">
    <defs>
      <radialGradient id="${gradId}" cx="42%" cy="34%" r="75%">
        <stop offset="0%" stop-color="${m.hi}"/><stop offset="55%" stop-color="${m.mid}"/><stop offset="100%" stop-color="${m.sh}"/>
      </radialGradient>
      <linearGradient id="${ribbonId}" x1="0" y1="0" x2="1" y2="0">${ribbonStripes(ribbonColors)}</linearGradient>
      <filter id="${shadowId}" x="-40%" y="-20%" width="180%" height="160%">
        <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000" flood-opacity=".38"/>
      </filter>
    </defs>
    <g filter="url(#${shadowId})">
      <!-- ruban -->
      <path d="M52,0 H88 V60 L70,47 L52,60 Z" fill="url(#${ribbonId})"/>
      <path d="M52,0 H88 V60 L70,47 L52,60 Z" fill="#000" opacity=".08"/>
      <path d="M52,0 L70,10 L88,0 V6 L70,15 L52,6 Z" fill="#000" opacity=".18"/>
      <!-- attache -->
      <circle cx="70" cy="66" r="6.5" fill="${m.mid}" stroke="${m.sh}" stroke-width="1"/>
      <!-- disque -->
      <circle cx="70" cy="142" r="52" fill="url(#${gradId})" stroke="${m.sh}" stroke-width="1.4"/>
      ${notches}
      <circle cx="70" cy="142" r="44" fill="none" stroke="${m.hi}" stroke-width="1" opacity=".7"/>
      <circle cx="70" cy="142" r="38" fill="#0d1b2e" stroke="${m.mid}" stroke-width="2"/>
      <circle cx="70" cy="142" r="38" fill="none" stroke="${m.hi}" stroke-width=".6" opacity=".5"/>
      <g transform="translate(70 146)" stroke="${m.ring}" fill="none" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${MEDAL_ICONS[iconKey]}</g>
      <!-- reflet brillant -->
      <ellipse cx="52" cy="118" rx="16" ry="9" fill="#fff" opacity=".22" transform="rotate(-28 52 118)"/>
    </g>
  </svg>`;
}

function pageApropos(){
  return `
  <!-- ===== EN-TÊTE — bandeau photographique ===== -->
  <section class="about-header">
    <div class="about-header-media">
      <img src="assets/images/facade-hotel.jpg" alt="Façade de Teranga Palace">
      <div class="about-header-overlay"></div>
    </div>
    <div class="about-header-content reveal">
      <p class="breadcrumb"><a href="#/accueil">Accueil</a><span>/</span>À propos</p>
      <div class="eyebrow">Notre histoire</div>
      <h1>À propos de Teranga Palace</h1>
      <p>Depuis la Corniche Ouest de Dakar, Teranga Palace réunit l'art de recevoir sénégalais et les standards internationaux de l'hôtellerie de luxe.</p>
    </div>
  </section>

  <!-- ===== UNE ADRESSE PENSÉE POUR VOUS ===== -->
  <section class="section editorial-split">
    <div class="editorial-visual reveal">
      <img src="assets/images/chambre-301.jpg" alt="Suite Teranga Palace" loading="lazy">
    </div>
    <div class="editorial-text reveal">
      <div class="eyebrow">Une adresse pensée pour vous</div>
      <h2>48 chambres et suites face à l'océan</h2>
      <p>Face à l'océan Atlantique, l'hôtel propose 48 chambres et suites, un restaurant panoramique, une piscine à débordement et des espaces de bien-être. Chaque chambre a été conçue avec des matériaux locaux — bois, raphia, tissus wax — pour une ambiance à la fois luxueuse et chaleureuse.</p>
      <p class="editorial-note">Teranga désigne l'hospitalité, une valeur fondamentale de la culture sénégalaise — celle que notre équipe s'engage à vous offrir du premier contact jusqu'à votre retour.</p>
      <a href="#/chambres" class="btn btn-outline">Découvrir nos chambres</a>
    </div>
  </section>

  <!-- ===== CHIFFRES CLÉS ===== -->
  <section class="section-tight" style="background:var(--bleu-nuit);color:var(--ivoire);">
    <div class="grid-4" data-reveal-group style="display:grid;gap:26px;text-align:center;padding:56px 28px;max-width:1240px;margin:0 auto;">
      ${[["48","Chambres et suites"],["24/7","Réception et conciergerie"],["4.8/5","Satisfaction client moyenne"],["2014","Année d'ouverture"]].map(([n,l])=>`
      <div class="reveal">
        <div class="stat-counter" data-counter="${n}" style="color:var(--or-clair);">0</div>
        <div style="font-size:12.5px;color:rgba(250,248,243,.65);margin-top:6px;">${l}</div>
      </div>`).join("")}
    </div>
  </section>

  <!-- ===== NOS VALEURS ===== -->
  <section class="section">
    <div class="section-head reveal"><div class="eyebrow">Ce qui nous anime</div><h2>Nos valeurs</h2></div>
    <div class="value-grid" data-reveal-group>
      ${[["01","Teranga","L'hospitalité avant tout : chaque client est accueilli comme un invité d'honneur.","assets/images/chambre-108.jpg"],
         ["02","Excellence","Un souci du détail constant, de la réservation en ligne jusqu'au départ.","assets/images/offres/reservation-anticipee.jpg"],
         ["03","Ancrage local","Des matériaux, des produits et des artisans sénégalais mis à l'honneur.","assets/images/chambre-207.jpg"],
         ["04","Confiance","Réservation sécurisée, disponibilités en temps réel, confirmation immédiate.","assets/images/offres/transfert-aeroport.jpg"]]
        .map(([n,t,d,photo])=>`
      <div class="value-card reveal">
        <div class="value-visual">
          <img src="${photo}" alt="${t}" loading="lazy">
          <span class="value-index">${n}</span>
        </div>
        <div class="value-body"><h4>${t}</h4><p>${d}</p></div>
      </div>`).join("")}
    </div>
  </section>

  <!-- ===== NOTRE PARCOURS (chronologie) ===== -->
  <section class="section section-tight" style="background:var(--sable);">
    <div class="section-head reveal" style="margin-bottom:10px;"><div class="eyebrow">Étapes clés</div><h2>Notre parcours</h2></div>
    <div class="about-timeline reveal">
      ${[["2014","Ouverture de Teranga Palace","Inauguration de l'hôtel sur la Corniche Ouest avec 48 chambres et suites."],
         ["2017","Rénovation du restaurant panoramique","Réouverture d'une carte mêlant cuisine sénégalaise et internationale."],
         ["2021","Lancement de la réservation en ligne","Disponibilités en temps réel et confirmation immédiate depuis le site."],
         ["2025","Distinction « Excellence Hôtelière »","Reconnaissance de la qualité de service par les acteurs du tourisme local."]]
        .map(([y,t,d])=>`
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-year">${y}</div>
        <div class="timeline-content"><h4>${t}</h4><p>${d}</p></div>
      </div>`).join("")}
    </div>
  </section>

  <!-- ===== SERVICES ET EQUIPEMENTS ===== -->
  <section class="section">
    <div class="section-head reveal"><div class="eyebrow">Sur place</div><h2>Services et équipements</h2></div>
    <div class="numbered-list numbered-list-2col" data-reveal-group>
      ${[["Chambres & suites","Du confort Simple à la Suite, chaque espace est climatisé et connecté."],
         ["Restaurant panoramique","Cuisine sénégalaise et internationale, vue sur l'océan Atlantique."],
         ["Piscine à débordement","Ouverte toute la journée, face à la Corniche Ouest."],
         ["Conciergerie 24/7","Transferts aéroport, réservations et assistance à toute heure."]]
        .map(([t,d])=>`
      <div class="numbered-item reveal">
        <div><h4>${t}</h4><p>${d}</p></div>
      </div>`).join("")}
    </div>
  </section>

  <!-- ===== NOTRE EQUIPE ===== -->
  <section class="section section-tight" style="background:var(--sable);">
    <div class="section-head reveal" style="margin-bottom:30px;"><div class="eyebrow">Derrière l'accueil</div><h2>Une équipe à votre écoute</h2></div>
    <div class="grid-4" data-reveal-group style="display:grid;gap:24px;">
      ${[["Moussa Diop","Directeur général","assets/images/equipe/moussa-diop.jpg"],["Aminata Fall","Cheffe de cuisine","assets/images/equipe/aminata-fall.jpg"],["Ibrahima Ndiaye","Responsable réception","assets/images/equipe/ibrahima-ndiaye.jpg"],["Khady Sarr","Responsable conciergerie","assets/images/equipe/khady-sarr.jpg"]]
        .map(([n,role,photo])=>`
      <div class="panel reveal team-card" style="text-align:center;">
        <div class="team-portrait"><img src="${photo}" alt="${n}" style="width:100%;height:100%;object-fit:cover;display:block;"></div>
        <h4 style="font-size:15.5px;margin-bottom:4px;">${n}</h4>
        <p style="font-size:12px;color:var(--text-soft);text-transform:uppercase;letter-spacing:.05em;">${role}</p>
      </div>`).join("")}
    </div>
    <p style="text-align:center;font-size:11.5px;color:var(--text-soft);margin-top:26px;opacity:.75;">Équipe présentée à titre d'exemple pour ce projet académique.</p>
  </section>

  <!-- ===== DISTINCTIONS — bandeau sobre, sans médailles ===== -->
  <section class="section-tight distinctions-strip">
    <div class="section-head reveal" style="margin-bottom:34px;">
      <div class="eyebrow">Reconnu par</div>
      <h2>Nos distinctions</h2>
    </div>
    <div class="distinctions-row" data-reveal-group>
      ${[
        ["Excellence Hôtelière","Distinction 2025"],
        ["Ordre National du Tourisme","République du Sénégal"],
        ["Green Key Sénégal","Certification éco-responsable"],
        ["Guide Dakar Prestige","Sélection recommandée"]
      ].map(([title,sub])=>`
      <div class="distinctions-item reveal">
        <h4>${title}</h4>
        <p>${sub}</p>
      </div>`).join("")}
    </div>
  </section>

  <!-- ===== CTA — bandeau photographique ===== -->
  <section class="about-cta reveal">
    <div class="about-cta-media">
      <img src="assets/images/offres/romantique.jpg" alt="">
      <div class="about-cta-overlay"></div>
    </div>
    <div class="about-cta-content">
      <div class="eyebrow">Envie de le vivre vous-même ?</div>
      <h2>Réservez votre séjour à Teranga Palace</h2>
      <div style="margin-top:26px;display:flex;gap:14px;justify-content:center;flex-wrap:wrap;">
        <a href="#/reserver" class="btn btn-gold">Réserver une chambre</a>
        <a href="#/contact" class="btn btn-outline-light">Nous contacter</a>
      </div>
    </div>
  </section>`;
}


function pageContact(){
  return `
  <section class="section">
    <div class="section-head"><div class="eyebrow">Contact</div><h2>Nous contacter</h2><p>Une question sur votre réservation ou votre séjour ? Notre équipe vous répond rapidement.</p></div>
    <div class="grid-2" style="display:grid;gap:50px;">
      <div class="panel">
        <div class="field"><label>Nom complet</label><input type="text" id="ct-nom"><span class="err">Veuillez renseigner votre nom.</span></div>
        <div class="field"><label>Email</label><input type="email" id="ct-email"><span class="err">Veuillez saisir un email valide.</span></div>
        <div class="field"><label>Message</label><textarea id="ct-msg" rows="5"></textarea><span class="err">Veuillez renseigner tous les champs.</span></div>
        <button class="btn btn-gold btn-block" id="btn-send-contact">Envoyer le message</button>
      </div>
      <div>
        <h4 style="font-size:19px;margin-bottom:10px;">Coordonnées</h4>
        <p style="font-size:13.5px;color:var(--text-soft);line-height:2;">Corniche Ouest, Dakar, Sénégal<br>+221 33 820 00 00<br>contact@terangapalace.sn</p>
        <h4 style="font-size:19px;margin:24px 0 10px;">Horaires de réception</h4>
        <p style="font-size:13.5px;color:var(--text-soft);">Ouverte 24h/24, 7j/7</p>
      </div>
    </div>
  </section>`;
}
function wireContact(){
  document.getElementById("btn-send-contact").onclick = ()=>{
    const nom = document.getElementById("ct-nom"), email = document.getElementById("ct-email"), msg = document.getElementById("ct-msg");
    let valid = true;
    valid = markField(nom, !!nom.value.trim()) && valid;
    valid = markField(email, isEmailValid(email.value), "Veuillez saisir un email valide.") && valid;
    valid = markField(msg, !!msg.value.trim()) && valid;
    if(!valid){ toast("Formulaire incomplet","Veuillez renseigner tous les champs.", true); return; }
    toast("Message envoyé","Notre équipe vous répondra sous peu.");
    nom.value=""; email.value=""; msg.value="";
  };
}

/* ---------------------------- CONNEXION ---------------------------- */
function pageConnexion(session){
  if(session) return `<section class="section" style="text-align:center;"><p>Vous êtes déjà connecté en tant que ${session.email}.</p></section>`;
  return `
  <section class="section" style="max-width:460px;">
    <div class="section-head"><div class="eyebrow">Espace sécurisé</div><h2>Connexion</h2><p>Accédez à votre espace selon votre rôle.</p></div>
    <div class="panel">
      <div class="field"><label>Email</label><input type="email" id="lg-email"><span class="err">Veuillez saisir un email valide.</span></div>
      <div class="field"><label>Mot de passe</label><input type="password" id="lg-pass"><span class="err">Veuillez renseigner votre mot de passe.</span></div>
      <p id="login-error" style="color:var(--rouge);font-size:12.5px;margin-bottom:10px;"></p>
      <button class="btn btn-gold btn-block" id="btn-login">Se connecter</button>
      <p style="font-size:12px;color:var(--text-soft);margin-top:16px;text-align:center;">Pas encore de compte ? <a href="#/reserver" style="color:var(--or);text-decoration:underline;">Commencez une réservation</a> : la création de compte vous sera proposée avant la confirmation.</p>
    </div>
  </section>`;
}
function wireConnexion(){
  const btn = document.getElementById("btn-login");
  if(!btn) return;
  wirePasswordToggle("lg-pass");
  btn.onclick = ()=>{
    const email = document.getElementById("lg-email"), pass = document.getElementById("lg-pass");
    let valid = true;
    valid = markField(email, isEmailValid(email.value), "Veuillez saisir un email valide.") && valid;
    valid = markField(pass, !!pass.value) && valid;
    if(!valid) return;
    const user = DB.users.find(u=>u.email.toLowerCase()===email.value.toLowerCase() && u.password===pass.value);
    if(!user){ document.getElementById("login-error").textContent = "Email ou mot de passe incorrect."; return; }
    const client = user.idClient ? DB.clients.find(c=>c.idClient===user.idClient) : null;
    setSession({email:user.email, role:user.role, idClient:user.idClient||null, prenom: client?client.prenom:user.role});
    toast("Connexion réussie","Bienvenue "+ (client?client.prenom:user.role) +".");
    goto(user.role==="Client" ? "#/mes-reservations" : "#/admin/dashboard");
  };
}

/* ---------------------------- WIRE : page d'accueil (ajouts) ----------------------------
   Compteurs animés, carrousel d'avis et accordéon FAQ de la page d'accueil.
   N'affecte aucune donnée ni aucune fonctionnalité existante. */
function wireAccueil(){
  animateCounters();
  wireTestimonials();
  wireFaq();
  const q = routeQuery();
  if(q.section){
    const target = document.getElementById(q.section);
    if(target) setTimeout(()=>target.scrollIntoView({behavior:"smooth", block:"start"}), 80);
  }
  const nlForm = document.getElementById("newsletter-form");
  if(nlForm){
    nlForm.onsubmit = (e)=>{
      e.preventDefault();
      const email = document.getElementById("nl-email");
      if(!isEmailValid(email.value)){ toast("Email invalide","Veuillez saisir une adresse email valide.", true); return; }
      toast("Inscription confirmée","Merci ! Vous recevrez bientôt nos offres exclusives.");
      const band = nlForm.closest(".newsletter-inner");
      const success = document.getElementById("newsletter-success");
      if(band && success){ band.classList.add("is-submitted"); success.classList.add("show"); }
      email.value = "";
    };
  }
}

function animateCounters(){
  const els = document.querySelectorAll("[data-counter]");
  if(!els.length) return;
  const run = (el)=>{
    const raw = el.dataset.counter;
    const match = raw.match(/[\d.]+/);
    if(!match) { el.textContent = raw; return; }
    const target = parseFloat(match[0]);
    const suffix = raw.slice(match.index + match[0].length);
    const prefix = raw.slice(0, match.index);
    const isDecimal = match[0].includes(".");
    const duration = 1100, start = performance.now();
    function step(now){
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = target * eased;
      el.textContent = prefix + (isDecimal ? val.toFixed(1) : Math.round(val)) + suffix;
      if(p < 1) requestAnimationFrame(step); else el.textContent = raw;
    }
    requestAnimationFrame(step);
  };
  if("IntersectionObserver" in window){
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{ if(entry.isIntersecting){ run(entry.target); io.unobserve(entry.target); } });
    }, {threshold:0.4});
    els.forEach(el=>io.observe(el));
  } else {
    els.forEach(run);
  }
}

function wireTestimonials(){
  const track = document.getElementById("testimonials-slides");
  const dots = document.querySelectorAll("#testimonial-dots .testimonial-dot");
  if(!track || !dots.length) return;
  let idx = 0, timer = null;
  function go(i){
    idx = (i + dots.length) % dots.length;
    track.style.transform = `translateX(-${idx * 100}%)`;
    dots.forEach((d,j)=>d.classList.toggle("active", j===idx));
  }
  dots.forEach((d,i)=>d.addEventListener("click", ()=>{ go(i); restart(); }));
  function restart(){ if(timer) clearInterval(timer); timer = setInterval(()=>go(idx+1), 5500); }
  restart();
}

function wireFaq(){
  document.querySelectorAll("[data-faq-toggle]").forEach(btn=>{
    const item = btn.closest(".faq-item");
    const answer = item.querySelector(".faq-answer");
    if(item.classList.contains("open")) answer.style.maxHeight = answer.scrollHeight + "px";
    btn.onclick = ()=>{
      const wasOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach(other=>{
        if(other !== item){ other.classList.remove("open"); other.querySelector(".faq-answer").style.maxHeight = null; }
      });
      item.classList.toggle("open", !wasOpen);
      answer.style.maxHeight = !wasOpen ? answer.scrollHeight + "px" : null;
    };
  });
}
