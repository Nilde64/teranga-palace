/* ==========================================================================
   ADMIN PAGES
   ========================================================================== */
function adminHeader(title, subtitle, actionsHtml){
  return `<div class="admin-topline"><div><h1>${title}</h1><p>${subtitle||""}</p></div><div>${actionsHtml||""}</div></div>`;
}

/* ---- DASHBOARD ---- */
function pageDashboard(session){
  const totalChambres = DB.chambres.length;
  const disponibles = DB.chambres.filter(c=>c.statut==="Disponible").length;
  const occupees = DB.chambres.filter(c=>c.statut==="Occupée").length;
  const maintenance = DB.chambres.filter(c=>c.statut==="Maintenance").length;
  const confirmees = DB.reservations.filter(r=>r.statut==="Confirmée").length;
  const annulees = DB.reservations.filter(r=>r.statut==="Annulée").length;
  const revenus = DB.paiements.reduce((s,p)=>s+p.montant,0);
  const tauxOccupation = totalChambres ? Math.round((occupees/totalChambres)*100) : 0;

  const resByMonth = groupByMonth(DB.reservations, r=>r.dateCreation);
  const revByMonth = groupByMonth(DB.paiements, p=>p.datePaiement, "montant");
  const topRooms = topReservedRooms();

  return `
  ${adminHeader("Dashboard", "Vue d'ensemble de l'activité de Teranga Palace")}
  <div class="stat-grid">
    <div class="stat-card"><div class="stat-label">${ic('bed')} Chambres totales</div><div class="stat-value">${totalChambres}</div></div>
    <div class="stat-card accent"><div class="stat-label">${ic('check')} Disponibles</div><div class="stat-value">${disponibles}</div></div>
    <div class="stat-card"><div class="stat-label">${ic('users')} Occupées</div><div class="stat-value">${occupees}</div></div>
    <div class="stat-card"><div class="stat-label">${ic('settings')} En maintenance</div><div class="stat-value">${maintenance}</div></div>
    <div class="stat-card"><div class="stat-label">${ic('calendar')} Réservations confirmées</div><div class="stat-value">${confirmees}</div></div>
    <div class="stat-card"><div class="stat-label">${ic('calendar')} Réservations annulées</div><div class="stat-value">${annulees}</div></div>
    <div class="stat-card accent"><div class="stat-label">${ic('cash')} Revenus encaissés</div><div class="stat-value" style="font-size:22px;">${fmtMoney(revenus)}</div></div>
    <div class="stat-card"><div class="stat-label">${ic('gauge')} Taux d'occupation</div><div class="stat-value">${tauxOccupation}%</div></div>
  </div>
  <div class="grid-dash" style="display:grid;gap:20px;">
    <div class="panel"><h4 style="margin-bottom:16px;font-size:16px;">Évolution des réservations</h4>${barChart(resByMonth,"#c9a15a")}</div>
    <div class="panel"><h4 style="margin-bottom:16px;font-size:16px;">Chambres les plus réservées</h4>${topRooms.map(t=>barRow(t.label, t.count, Math.max(...topRooms.map(x=>x.count),1))).join("")}</div>
  </div>
  <div style="display:grid;grid-template-columns:1fr;gap:20px;margin-top:20px;">
    <div class="panel"><h4 style="margin-bottom:16px;font-size:16px;">Revenus par mois</h4>${barChart(revByMonth,"#4a5d46",fmtMoney)}</div>
  </div>`;
}
function groupByMonth(items, dateFn, sumField){
  const map = {};
  items.forEach(it=>{
    if(sumField===undefined && it.statut==="Annulée") return;
    const k = monthKey(dateFn(it));
    map[k] = (map[k]||0) + (sumField ? it[sumField] : 1);
  });
  return Object.keys(map).sort().map(k=>({label:monthLabel(k), value:map[k]}));
}
function topReservedRooms(){
  const map = {};
  DB.reservations.forEach(r=>{ if(r.statut!=="Annulée") map[r.numeroChambre]=(map[r.numeroChambre]||0)+1; });
  return Object.keys(map).map(k=>({label:"Chambre "+k, count:map[k]})).sort((a,b)=>b.count-a.count).slice(0,5);
}
function barChart(data, color, fmt){
  if(!data.length) return emptyState("Pas encore de données.");
  const max = Math.max(...data.map(d=>d.value),1);
  return `<div style="display:flex;align-items:flex-end;gap:14px;height:160px;padding-top:10px;">
    ${data.map(d=>`<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:8px;">
      <div style="font-size:10.5px;color:var(--text-soft);">${fmt?fmt(d.value):d.value}</div>
      <div style="width:100%;background:${color};border-radius:2px 2px 0 0;height:${Math.max(6,(d.value/max)*110)}px;"></div>
      <div style="font-size:10.5px;color:var(--text-soft);">${d.label}</div>
    </div>`).join("")}
  </div>`;
}
function barRow(label, value, max){
  return `<div style="margin-bottom:12px;">
    <div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:5px;"><span>${label}</span><b>${value}</b></div>
    <div style="background:var(--ivoire);height:8px;border-radius:4px;overflow:hidden;"><div style="background:var(--or);height:100%;width:${(value/max)*100}%;"></div></div>
  </div>`;
}
function wireDashboard(){}

/* ---- CLIENTS ---- */
function pageAdminClients(){
  return `${adminHeader("Clients","Gestion des clients de l'hôtel", `<button class="btn btn-gold btn-sm" id="btn-add-client">+ Ajouter un client</button>`)}
  <div class="field" style="max-width:320px;"><input type="text" id="client-search" placeholder="Rechercher un client..."></div>
  <div class="table-wrap"><table>
    <thead><tr><th>ID</th><th>Nom</th><th>Prénom</th><th>Téléphone</th><th>Email</th><th>Séjours</th><th>Actions</th></tr></thead>
    <tbody id="clients-tbody"></tbody>
  </table></div>`;
}
function clientRows(filter){
  const f = (filter||"").toLowerCase();
  const list = DB.clients.filter(c=>!f || (c.nom+c.prenom+c.email).toLowerCase().includes(f));
  if(!list.length) return `<tr><td colspan="7">${emptyState("Aucun client trouvé.")}</td></tr>`;
  return list.map(c=>{
    const nbSejours = DB.sejours.filter(s=>s.idClient===c.idClient).length;
    return `<tr>
      <td>${c.idClient}</td><td>${c.nom}</td><td>${c.prenom}</td><td>${c.telephone}</td><td>${c.email}</td><td>${nbSejours}</td>
      <td class="row-actions">
        <button class="btn btn-outline btn-sm" data-view-client="${c.idClient}">Détails</button>
        <button class="btn btn-outline btn-sm" data-edit-client="${c.idClient}">Modifier</button>
      </td></tr>`;
  }).join("");
}
function wireAdminClients(){
  const refresh = (f)=>{ document.getElementById("clients-tbody").innerHTML = clientRows(f); wireClientRowActions(refresh); };
  refresh();
  document.getElementById("client-search").oninput = (e)=>refresh(e.target.value);
  document.getElementById("btn-add-client").onclick = ()=>clientFormModal(null, refresh);
}
function wireClientRowActions(refresh){
  document.querySelectorAll("[data-edit-client]").forEach(b=>b.onclick = ()=>clientFormModal(DB.clients.find(c=>c.idClient===b.dataset.editClient), refresh));
  document.querySelectorAll("[data-view-client]").forEach(b=>b.onclick = ()=>{
    const c = DB.clients.find(x=>x.idClient===b.dataset.viewClient);
    const history = DB.sejours.filter(s=>s.idClient===c.idClient);
    openModal(`<h3>${c.prenom} ${c.nom}</h3>
      <p style="font-size:13px;color:var(--text-soft);line-height:1.9;">${c.email}<br>${c.telephone}<br>${c.adresse||"—"}</p>
      <h4 style="font-size:14px;margin:16px 0 8px;">Historique de séjours</h4>
      ${history.length? history.map(s=>`<div style="font-size:12.5px;padding:8px 0;border-bottom:1px solid rgba(11,27,46,.08);">Chambre ${s.numeroChambre} · ${fmtDate(s.dateArriveeReelle)} → ${fmtDate(s.dateDepartReelle)} · ${fmtMoney(s.montantTotal)}</div>`).join("") : "<p style='font-size:12.5px;color:var(--text-soft);'>Aucun séjour enregistré.</p>"}
      <div class="modal-actions"><button class="btn btn-outline btn-sm" id="modal-close">Fermer</button></div>`);
    document.getElementById("modal-close").onclick = closeModal;
  });
}
function clientFormModal(client, refresh){
  const isEdit = !!client;
  openModal(`<h3>${isEdit?"Modifier le client":"Ajouter un client"}</h3>
    <div class="field"><label>Nom</label><input type="text" id="f-nom" value="${client?client.nom:''}"><span class="err">Le nom est obligatoire.</span></div>
    <div class="field"><label>Prénom</label><input type="text" id="f-prenom" value="${client?client.prenom:''}"><span class="err">Le prénom est obligatoire.</span></div>
    <div class="field"><label>Email</label><input type="email" id="f-email" value="${client?client.email:''}"><span class="err">Veuillez saisir un email valide.</span></div>
    <div class="field"><label>Téléphone</label><input type="tel" id="f-tel" value="${client?client.telephone:''}"><span class="err">Veuillez saisir un téléphone valide.</span></div>
    <div class="field"><label>Adresse</label><input type="text" id="f-adr" value="${client?client.adresse:''}"></div>
    <div class="modal-actions"><button class="btn btn-outline btn-sm" id="modal-cancel">Annuler</button><button class="btn btn-gold btn-sm" id="modal-save">Enregistrer</button></div>`);
  document.getElementById("modal-cancel").onclick = closeModal;
  document.getElementById("modal-save").onclick = ()=>{
    const nom = document.getElementById("f-nom"), prenom = document.getElementById("f-prenom"), email = document.getElementById("f-email"), tel = document.getElementById("f-tel");
    let valid = true;
    valid = markField(nom, !!nom.value.trim()) && valid;
    valid = markField(prenom, !!prenom.value.trim()) && valid;
    valid = markField(email, isEmailValid(email.value), "Veuillez saisir un email valide.") && valid;
    valid = markField(tel, isPhoneValid(tel.value), "Veuillez saisir un téléphone valide.") && valid;
    if(!valid) return;
    const adr = document.getElementById("f-adr").value.trim();
    if(isEdit){ Object.assign(client, {nom:nom.value.trim(), prenom:prenom.value.trim(), email:email.value.trim(), telephone:tel.value.trim(), adresse:adr}); }
    else{
      // Compteur partagé (voir findOrCreateClient dans data.js) pour éviter qu'un
      // client créé ici et un autre créé au même moment depuis un autre poste/onglet
      // (côté public ou admin) ne se retrouvent avec le même idClient.
      if(!DB.counters.client) DB.counters.client = DB.clients.length+1;
      DB.clients.push({idClient:"CL-"+pad(DB.counters.client++,3), nom:nom.value.trim(), prenom:prenom.value.trim(), email:email.value.trim(), telephone:tel.value.trim(), adresse:adr});
    }
    if(!save()) return;
    closeModal(); toast(isEdit?"Client modifié":"Client ajouté","Les informations ont été enregistrées."); refresh();
  };
}

/* ---- CHAMBRES (admin) ---- */
function pageAdminChambres(){
  return `${adminHeader("Chambres","Gestion du parc de chambres", `<div style="display:flex;gap:8px;"><button class="btn btn-outline btn-sm" id="btn-export-photos">Exporter les photos</button><button class="btn btn-gold btn-sm" id="btn-add-room">+ Ajouter une chambre</button></div>`)}
  <div style="display:flex;gap:10px;margin-bottom:20px;">
    ${["Toutes","Disponible","Occupée","Maintenance"].map(s=>`<button class="btn btn-sm ${s==='Toutes'?'btn-dark':'btn-outline'}" data-room-filter="${s}">${s}</button>`).join("")}
  </div>
  <div class="table-wrap"><table>
    <thead><tr><th>Photo</th><th>N°</th><th>Type</th><th>Prix/nuit</th><th>Capacité</th><th>Statut</th><th>Actions</th></tr></thead>
    <tbody id="rooms-tbody"></tbody>
  </table></div>`;
}
function roomRows(filter){
  const list = (!filter||filter==="Toutes") ? DB.chambres : DB.chambres.filter(c=>c.statut===filter);
  if(!list.length) return `<tr><td colspan="7">${emptyState("Aucune chambre dans cette catégorie.")}</td></tr>`;
  return list.map(c=>{
    const badge = c.statut==="Disponible" ? '<span class="badge badge-green">Disponible</span>' : c.statut==="Occupée" ? '<span class="badge badge-red">Occupée</span>' : '<span class="badge badge-gray">Maintenance</span>';
    const thumb = c.hasPhoto && !c.photo ? `<div style="width:44px;height:44px;border-radius:4px;background:rgba(11,27,46,.06);display:flex;align-items:center;justify-content:center;color:var(--text-soft);font-size:9px;">...</div>`
      : roomImageTag(c, "width:44px;height:44px;object-fit:cover;border-radius:4px;");
    return `<tr><td>${thumb}</td><td><b>${c.numeroChambre}</b></td><td>${c.type}</td><td>${fmtMoney(c.prixParNuit)}</td><td>${c.capacite} pers.</td><td>${badge}</td>
      <td class="row-actions">
        <button class="btn btn-outline btn-sm" data-edit-room="${c.numeroChambre}">Modifier</button>
        ${c.statut!=="Maintenance" ? `<button class="btn btn-outline btn-sm" data-maint-room="${c.numeroChambre}">Maintenance</button>` : `<button class="btn btn-outline btn-sm" data-avail-room="${c.numeroChambre}">Remettre disponible</button>`}
        <button class="btn btn-danger btn-sm" data-delete-room="${c.numeroChambre}">Supprimer</button>
      </td></tr>`;
  }).join("");
}
function wireAdminChambres(){
  const refresh = (f)=>{ document.getElementById("rooms-tbody").innerHTML = roomRows(f); wireRoomActions(refresh); };
  refresh();
  document.querySelectorAll("[data-room-filter]").forEach(btn=>{
    btn.onclick = ()=>{
      document.querySelectorAll("[data-room-filter]").forEach(b=>{ b.classList.remove("btn-dark"); b.classList.add("btn-outline"); });
      btn.classList.add("btn-dark"); btn.classList.remove("btn-outline");
      refresh(btn.dataset.roomFilter);
    };
  });
  document.getElementById("btn-add-room").onclick = ()=>roomFormModal(null, refresh);
  document.getElementById("btn-export-photos").onclick = async (e)=>{
    const btn = e.currentTarget;
    btn.disabled = true; btn.textContent = "Export en cours...";
    try{
      const exported = await exportRealRoomPhotos();
      if(exported===0){
        toast("Rien à exporter","Aucune chambre n'a de photo ajoutée dans ce navigateur. Ajoutez d'abord une photo via \"Modifier\" sur une chambre.");
      }else{
        toast("Photos exportées", exported+" photo(s) téléchargée(s). Place ces fichiers dans le dossier assets/images/ du projet, puis commit + push sur GitHub pour qu'elles soient visibles par tout le monde.");
      }
    }catch(err){
      toast("Erreur","L'export des photos a échoué.", true);
    }finally{
      btn.disabled = false; btn.textContent = "Exporter les photos";
    }
  };
}
function wireRoomActions(refresh){
  document.querySelectorAll("[data-edit-room]").forEach(b=>b.onclick = ()=>roomFormModal(DB.chambres.find(c=>c.numeroChambre===b.dataset.editRoom), refresh));
  document.querySelectorAll("[data-maint-room]").forEach(b=>b.onclick = ()=>{
    const c = DB.chambres.find(x=>x.numeroChambre===b.dataset.maintRoom);
    if(c.statut==="Occupée"){ toast("Action impossible","Une chambre occupée ne peut pas être mise en maintenance.", true); return; }
    c.statut = "Maintenance"; save(); toast("Chambre mise à jour","La chambre "+c.numeroChambre+" est désormais en maintenance."); refresh();
  });
  document.querySelectorAll("[data-avail-room]").forEach(b=>b.onclick = ()=>{
    const c = DB.chambres.find(x=>x.numeroChambre===b.dataset.availRoom);
    c.statut = "Disponible"; save(); toast("Chambre mise à jour","La chambre "+c.numeroChambre+" est de nouveau disponible."); refresh();
  });
  document.querySelectorAll("[data-delete-room]").forEach(b=>b.onclick = ()=>{
    const numero = b.dataset.deleteRoom;
    const c = DB.chambres.find(x=>x.numeroChambre===numero);
    if(c.statut==="Occupée"){ toast("Suppression impossible","Une chambre occupée ne peut pas être supprimée.", true); return; }
    const resFutures = DB.reservations.filter(r=>r.numeroChambre===numero && r.statut==="Confirmée");
    if(resFutures.length){ toast("Suppression impossible","Cette chambre a "+resFutures.length+" réservation(s) confirmée(s) en cours. Annulez-les d'abord.", true); return; }
    openModal(`<h3>Supprimer la chambre ${numero} ?</h3>
      <p style="font-size:13.5px;color:var(--text-soft);line-height:1.7;">Cette action est irréversible. La chambre ${numero} (${c.type}) sera définitivement retirée du parc de chambres.</p>
      <div class="modal-actions"><button class="btn btn-outline btn-sm" id="modal-cancel">Annuler</button><button class="btn btn-danger btn-sm" id="modal-confirm-delete">Supprimer définitivement</button></div>`);
    document.getElementById("modal-cancel").onclick = closeModal;
    document.getElementById("modal-confirm-delete").onclick = async ()=>{
      try{ await idbDeletePhoto(numero); }catch(e){ console.warn("Suppression photo IndexedDB échouée", e); }
      DB.chambres = DB.chambres.filter(x=>x.numeroChambre!==numero);
      if(!save()) return;
      closeModal(); toast("Chambre supprimée","La chambre "+numero+" a été retirée du parc de chambres."); refresh();
    };
  });
}
function roomFormModal(room, refresh){
  const isEdit = !!room;
  let photoData = room ? (room.photo || null) : null; // dataURL en mémoire, en attente d'enregistrement
  let photoLoading = !!(isEdit && room.hasPhoto && !photoData); // photo pas encore hydratée depuis IndexedDB
  openModal(`<h3>${isEdit?"Modifier la chambre":"Ajouter une chambre"}</h3>
    <div class="field">
      <label>Photo de la chambre</label>
      <div id="f-photo-preview" style="height:130px;border:1px dashed rgba(11,27,46,.25);border-radius:4px;display:flex;align-items:center;justify-content:center;overflow:hidden;background:rgba(11,27,46,.03);margin-bottom:8px;"></div>
      <div style="display:flex;gap:8px;">
        <label class="btn btn-outline btn-sm" style="cursor:pointer;">Choisir un fichier<input type="file" id="f-photo-input" accept="image/*" style="display:none;"></label>
        <button type="button" class="btn btn-outline btn-sm" id="f-photo-remove">Retirer</button>
      </div>
      <span style="font-size:11.5px;color:var(--text-soft);display:block;margin-top:6px;">Formats JPG/PNG — compressée automatiquement et stockée dans IndexedDB.</span>
    </div>
    <div class="field"><label>Numéro de chambre</label><input type="text" id="f-num" value="${room?room.numeroChambre:''}" ${isEdit?"disabled":""}><span class="err">Le numéro est obligatoire.</span></div>
    <div class="field"><label>Type</label><select id="f-type"><option ${room&&room.type==='Simple'?'selected':''}>Simple</option><option ${room&&room.type==='Double'?'selected':''}>Double</option><option ${room&&room.type==='Suite'?'selected':''}>Suite</option></select></div>
    <div class="field"><label>Prix par nuit (FCFA)</label><input type="number" id="f-prix" min="1" value="${room?room.prixParNuit:''}"><span class="err">Le prix doit être positif.</span></div>
    <div class="field"><label>Capacité (personnes)</label><input type="number" id="f-cap" min="1" value="${room?room.capacite:''}"><span class="err">La capacité doit être positive.</span></div>
    <div class="field"><label>Description</label><textarea id="f-desc" rows="3">${room?room.description:''}</textarea></div>
    <div class="modal-actions"><button class="btn btn-outline btn-sm" id="modal-cancel">Annuler</button><button class="btn btn-gold btn-sm" id="modal-save">Enregistrer</button></div>`);
  const preview = document.getElementById("f-photo-preview");
  const removeBtn = document.getElementById("f-photo-remove");
  const renderPreview = ()=>{
    if(photoLoading){
      preview.innerHTML = `<span style="color:var(--text-soft);font-size:12px;">Chargement de la photo...</span>`;
      removeBtn.disabled = true;
      return;
    }
    preview.innerHTML = photoData
      ? `<img src="${photoData}" style="width:100%;height:100%;object-fit:cover;">`
      : `<span style="color:var(--text-soft);font-size:12px;display:flex;flex-direction:column;align-items:center;gap:6px;">${ic('camera')} Aucune photo</span>`;
    removeBtn.disabled = !photoData;
  };
  renderPreview();
  if(photoLoading){
    idbGetPhoto(room.numeroChambre).then(data=>{
      photoData = data || null;
      room.photo = data || undefined; // mise en cache mémoire pour le reste de l'appli
      photoLoading = false;
      renderPreview();
    }).catch(()=>{
      photoLoading = false; renderPreview();
      toast("Erreur","Impossible de charger la photo existante de cette chambre.", true);
    });
  }
  document.getElementById("f-photo-input").onchange = (e)=>{
    const file = e.target.files[0];
    if(!file) return;
    if(!file.type.startsWith("image/")){ toast("Fichier invalide","Merci de choisir une image.", true); return; }
    compressImage(file, 800, 0.72).then(dataUrl=>{ photoData = dataUrl; renderPreview(); })
      .catch(()=>{ toast("Erreur","Impossible de traiter cette image.", true); });
  };
  removeBtn.onclick = ()=>{ photoData = null; renderPreview(); };
  document.getElementById("modal-cancel").onclick = closeModal;
  document.getElementById("modal-save").onclick = async ()=>{
    const num = document.getElementById("f-num"), prix = document.getElementById("f-prix"), cap = document.getElementById("f-cap");
    let valid = true;
    valid = markField(num, !!num.value.trim()) && valid;
    valid = markField(prix, prix.value>0, "Le prix doit être positif.") && valid;
    valid = markField(cap, cap.value>0, "La capacité doit être positive.") && valid;
    if(!isEdit && DB.chambres.some(c=>c.numeroChambre===num.value.trim())){ markField(num,false,"Ce numéro de chambre existe déjà."); valid=false; }
    if(!valid) return;
    const numero = num.value.trim();
    const type = document.getElementById("f-type").value, desc = document.getElementById("f-desc").value.trim();
    const saveBtn = document.getElementById("modal-save");
    saveBtn.disabled = true; saveBtn.textContent = "Enregistrement...";
    try{
      if(photoData){ await idbSetPhoto(numero, photoData); } else { await idbDeletePhoto(numero); }
    }catch(e){
      toast("Erreur","Impossible d'enregistrer la photo (IndexedDB indisponible).", true);
      saveBtn.disabled = false; saveBtn.textContent = "Enregistrer";
      return;
    }
    const hasPhoto = !!photoData;
    if(isEdit){ Object.assign(room, {type, prixParNuit:+prix.value, capacite:+cap.value, description:desc, photo:photoData, hasPhoto}); }
    else{ DB.chambres.push({numeroChambre:numero, type, prixParNuit:+prix.value, capacite:+cap.value, statut:"Disponible", description:desc, photo:photoData, hasPhoto}); }
    if(!save()){ saveBtn.disabled = false; saveBtn.textContent = "Enregistrer"; return; }
    closeModal(); toast(isEdit?"Chambre modifiée":"Chambre ajoutée","Les informations ont été enregistrées."); refresh();
  };
}

/* ---- RÉSERVATIONS (admin) ---- */
function pageAdminReservations(){
  return `${adminHeader("Réservations","Ensemble des réservations de l'hôtel", `<a href="#/reserver" class="btn btn-gold btn-sm">+ Nouvelle réservation</a>`)}
  <div style="display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap;">
    ${["Toutes","Confirmée","Annulée","Terminée"].map(s=>`<button class="btn btn-sm ${s==='Toutes'?'btn-dark':'btn-outline'}" data-res-filter="${s}">${s}</button>`).join("")}
    <input type="text" id="res-search" placeholder="Rechercher (ID, client)..." style="margin-left:auto;padding:9px 12px;border:1px solid rgba(11,27,46,.16);min-width:220px;">
  </div>
  <div class="table-wrap"><table>
    <thead><tr><th>ID</th><th>Client</th><th>Chambre</th><th>Arrivée</th><th>Départ</th><th>Pers.</th><th>Montant</th><th>Statut</th><th>Actions</th></tr></thead>
    <tbody id="res-tbody"></tbody>
  </table></div>`;
}
function reservationAdminRows(filter, search){
  let list = (!filter||filter==="Toutes") ? DB.reservations : DB.reservations.filter(r=>r.statut===filter);
  if(search){
    const s = search.toLowerCase();
    list = list.filter(r=>{
      const c = DB.clients.find(cl=>cl.idClient===r.idClient);
      return r.id.toLowerCase().includes(s) || (c && (c.nom+c.prenom).toLowerCase().includes(s));
    });
  }
  list = [...list].sort((a,b)=>b.dateCreation.localeCompare(a.dateCreation));
  if(!list.length) return `<tr><td colspan="9">${emptyState("Aucune réservation trouvée.")}</td></tr>`;
  return list.map(r=>{
    const c = DB.clients.find(cl=>cl.idClient===r.idClient);
    const badge = r.statut==="Confirmée" ? '<span class="badge badge-green">Confirmée</span>' : r.statut==="Annulée" ? '<span class="badge badge-red">Annulée</span>' : '<span class="badge badge-blue">Terminée</span>';
    return `<tr><td><b>${r.id}</b></td><td>${c?c.prenom+' '+c.nom:'—'}</td><td>N° ${r.numeroChambre}</td><td>${fmtDate(r.dateArrivee)}</td><td>${fmtDate(r.dateDepart)}</td><td>${r.nbPersonnes}</td><td>${fmtMoney(r.montant)}</td><td>${badge}</td>
    <td class="row-actions">
      <button class="btn btn-outline btn-sm" data-view-res="${r.id}">Voir</button>
      ${r.statut==="Confirmée" ? `<button class="btn btn-outline btn-sm" data-modify="${r.id}">Modifier</button><button class="btn btn-danger btn-sm" data-cancel="${r.id}">Annuler</button>` : ""}
    </td></tr>`;
  }).join("");
}
function wireAdminReservations(){
  const refresh = ()=>{
    const active = document.querySelector("[data-res-filter].btn-dark");
    const f = active ? active.dataset.resFilter : "Toutes";
    const s = document.getElementById("res-search").value;
    document.getElementById("res-tbody").innerHTML = reservationAdminRows(f,s);
    wireReservationActions(document.getElementById("res-tbody"), refresh);
    document.querySelectorAll("[data-view-res]").forEach(b=>b.onclick = ()=>{
      const r = DB.reservations.find(x=>x.id===b.dataset.viewRes);
      const c = DB.clients.find(cl=>cl.idClient===r.idClient);
      openModal(`<h3>${r.id}</h3><div style="font-size:13px;line-height:2;color:var(--text-soft);">
        Client : <b style="color:var(--text);">${c.prenom} ${c.nom}</b> (${c.email})<br>
        Chambre : <b style="color:var(--text);">N° ${r.numeroChambre}</b><br>
        Séjour : <b style="color:var(--text);">${fmtDate(r.dateArrivee)} → ${fmtDate(r.dateDepart)}</b><br>
        Personnes : <b style="color:var(--text);">${r.nbPersonnes}</b><br>
        Montant : <b style="color:var(--text);">${fmtMoney(r.montant)}</b><br>
        Statut : <b style="color:var(--text);">${r.statut}</b></div>
        <div class="modal-actions"><button class="btn btn-outline btn-sm" id="modal-close">Fermer</button></div>`);
      document.getElementById("modal-close").onclick = closeModal;
    });
  };
  refresh();
  document.querySelectorAll("[data-res-filter]").forEach(btn=>{
    btn.onclick = ()=>{
      document.querySelectorAll("[data-res-filter]").forEach(b=>{ b.classList.remove("btn-dark"); b.classList.add("btn-outline"); });
      btn.classList.add("btn-dark"); btn.classList.remove("btn-outline");
      refresh();
    };
  });
  document.getElementById("res-search").oninput = refresh;
}

/* ---- CHECK-IN ---- */
function pageAdminCheckin(){
  return `${adminHeader("Arrivée / Check-in","Enregistrer l'arrivée d'un client")}
  <div class="panel" style="max-width:640px;">
    <div class="field"><label>Identifiant de réservation ou nom du client</label><input type="text" id="ci-search" placeholder="TP-2026-00101 ou nom du client"></div>
    <button class="btn btn-gold" id="btn-ci-search">${ic('search')} Rechercher</button>
    <div id="ci-result" style="margin-top:22px;"></div>
  </div>`;
}
function wireAdminCheckin(){
  document.getElementById("btn-ci-search").onclick = ()=>{
    const q = document.getElementById("ci-search").value.trim().toLowerCase();
    const resultEl = document.getElementById("ci-result");
    if(!q){ toast("Champ requis","Veuillez saisir un identifiant ou un nom.", true); return; }
    let match = DB.reservations.find(r=>r.id.toLowerCase()===q && r.statut==="Confirmée");
    if(!match){
      const client = DB.clients.find(c=>(c.nom+" "+c.prenom).toLowerCase().includes(q) || (c.prenom+" "+c.nom).toLowerCase().includes(q));
      if(client) match = DB.reservations.find(r=>r.idClient===client.idClient && r.statut==="Confirmée" && !DB.sejours.some(s=>s.idReservation===r.id));
    }
    if(!match){
      resultEl.innerHTML = `<div class="empty-state">${ic('empty')}<h4>Aucune réservation</h4><p>Aucune réservation trouvée pour ces critères.</p>
        <a href="#/reserver" class="btn btn-gold btn-sm" style="margin-top:12px;">Créer une réservation (walk-in)</a></div>`;
      return;
    }
    const c = DB.clients.find(cl=>cl.idClient===match.idClient);
    const chambre = DB.chambres.find(ch=>ch.numeroChambre===match.numeroChambre);
    resultEl.innerHTML = `
      <div class="panel">
        <div style="font-family:var(--serif);font-size:19px;">${match.id}</div>
        <div style="font-size:13px;color:var(--text-soft);margin:8px 0 16px;">${c.prenom} ${c.nom} · Chambre ${chambre.type} N° ${chambre.numeroChambre} · ${fmtDate(match.dateArrivee)} → ${fmtDate(match.dateDepart)}</div>
        <button class="btn btn-gold" id="btn-do-checkin">${ic('arrowIn')} Enregistrer l'arrivée — Chambre attribuée</button>
      </div>`;
    document.getElementById("btn-do-checkin").onclick = ()=>{
      const r = checkinReservation(match.id);
      if(!r.ok){ toast("Check-in impossible", r.error, true); return; }
      toast("Arrivée enregistrée","Séjour "+r.sejour.idSejour+" créé, chambre "+chambre.numeroChambre+" occupée.");
      resultEl.innerHTML = `<div class="empty-state">${ic('check')}<h4>Client enregistré</h4><p>Séjour ${r.sejour.idSejour} créé pour la chambre ${chambre.numeroChambre}.</p></div>`;
    };
  };
}

/* ---- SÉJOURS ---- */
function pageAdminSejours(){
  return `${adminHeader("Séjours","Suivi des séjours en cours et terminés")}
  <div class="table-wrap"><table>
    <thead><tr><th>ID</th><th>Client</th><th>Chambre</th><th>Arrivée</th><th>Départ</th><th>Durée</th><th>Montant</th><th>Statut</th></tr></thead>
    <tbody id="sej-tbody"></tbody>
  </table></div>`;
}
function sejourRows(){
  const list = [...DB.sejours].sort((a,b)=>(b.dateArriveeReelle||"").localeCompare(a.dateArriveeReelle||""));
  if(!list.length) return `<tr><td colspan="8">${emptyState("Aucun séjour enregistré.")}</td></tr>`;
  return list.map(s=>{
    const c = DB.clients.find(cl=>cl.idClient===s.idClient);
    const duree = nightsBetween(s.dateArriveeReelle, s.dateDepartReelle||todayStr());
    const badge = s.statut==="En cours" ? '<span class="badge badge-gold">En cours</span>' : '<span class="badge badge-blue">Terminé</span>';
    return `<tr><td>${s.idSejour}</td><td>${c?c.prenom+' '+c.nom:'—'}</td><td>N° ${s.numeroChambre}</td><td>${fmtDate(s.dateArriveeReelle)}</td><td>${s.dateDepartReelle?fmtDate(s.dateDepartReelle):'—'}</td><td>${duree} nuit(s)</td><td>${fmtMoney(s.montantTotal)}</td><td>${badge}</td></tr>`;
  }).join("");
}
function wireAdminSejours(){ document.getElementById("sej-tbody").innerHTML = sejourRows(); }

/* ---- CHECK-OUT ---- */
function pageAdminCheckout(){
  const ouverts = DB.sejours.filter(s=>s.statut==="En cours");
  return `${adminHeader("Départ / Check-out","Clôturer un séjour et générer la facture")}
  <div class="table-wrap"><table>
    <thead><tr><th>ID Séjour</th><th>Client</th><th>Chambre</th><th>Arrivée</th><th>Payé</th><th>Montant dû</th><th>Actions</th></tr></thead>
    <tbody>${ouverts.length ? ouverts.map(s=>{
      const c = DB.clients.find(cl=>cl.idClient===s.idClient);
      const paye = DB.paiements.filter(p=>p.idSejour===s.idSejour).reduce((sum,p)=>sum+p.montant,0);
      return `<tr><td>${s.idSejour}</td><td>${c?c.prenom+' '+c.nom:'—'}</td><td>N° ${s.numeroChambre}</td><td>${fmtDate(s.dateArriveeReelle)}</td><td>${fmtMoney(paye)}</td><td>${fmtMoney(Math.max(0,s.montantTotal-paye))}</td>
      <td><button class="btn btn-gold btn-sm" data-checkout="${s.idSejour}">${ic('arrowOut')} Clôturer le séjour</button></td></tr>`;
    }).join("") : `<tr><td colspan="7">${emptyState("Aucun séjour en cours actuellement.")}</td></tr>`}</tbody>
  </table></div>`;
}
function wireAdminCheckout(){
  document.querySelectorAll("[data-checkout]").forEach(b=>b.onclick = ()=>{
    const s = DB.sejours.find(x=>x.idSejour===b.dataset.checkout);
    const paye = DB.paiements.filter(p=>p.idSejour===s.idSejour).reduce((sum,p)=>sum+p.montant,0);
    const solde = s.montantTotal - paye;
    openModal(`<h3>Clôturer le séjour ${s.idSejour}</h3>
      <p style="font-size:13px;color:var(--text-soft);line-height:1.9;">Montant total : <b>${fmtMoney(s.montantTotal)}</b><br>Déjà payé : <b>${fmtMoney(paye)}</b><br>Solde : <b style="color:${solde>0?'var(--rouge)':'var(--vert)'}">${fmtMoney(Math.max(0,solde))}</b></p>
      ${solde>0 ? `<div class="field"><label>Encaisser le solde — mode de paiement</label>
        <select id="co-mode"><option>Espèces</option><option>Carte bancaire</option><option>Mobile Money</option></select></div>` : ""}
      <div class="modal-actions"><button class="btn btn-outline btn-sm" id="modal-no">Annuler</button><button class="btn btn-gold btn-sm" id="modal-yes">Clôturer et générer la facture</button></div>`);
    document.getElementById("modal-no").onclick = closeModal;
    document.getElementById("modal-yes").onclick = ()=>{
      if(solde>0){ addPaiement(s.idSejour, solde, document.getElementById("co-mode").value); }
      const r = checkoutSejour(s.idSejour);
      closeModal();
      toast("Séjour clôturé","La chambre "+s.numeroChambre+" est de nouveau disponible. Facture générée.");
      pageAdminCheckoutRefresh();
    };
  });
}
function pageAdminCheckoutRefresh(){ document.getElementById("admin-content").innerHTML = pageAdminCheckout(); wireAdminCheckout(); }

/* ---- PAIEMENTS ---- */
function pageAdminPaiements(){
  const sejoursOuverts = DB.sejours.filter(s=>s.statut==="En cours");
  return `${adminHeader("Paiements","Historique et enregistrement des paiements", `<button class="btn btn-gold btn-sm" id="btn-add-paiement" ${!sejoursOuverts.length?'disabled title="Aucun séjour en cours"':''}>+ Enregistrer un paiement</button>`)}
  <div class="table-wrap"><table>
    <thead><tr><th>ID</th><th>Séjour</th><th>Client</th><th>Date</th><th>Montant</th><th>Mode</th></tr></thead>
    <tbody id="pay-tbody"></tbody>
  </table></div>`;
}
function paiementRows(){
  const list = [...DB.paiements].sort((a,b)=>b.datePaiement.localeCompare(a.datePaiement));
  if(!list.length) return `<tr><td colspan="6">${emptyState("Aucun paiement enregistré.")}</td></tr>`;
  return list.map(p=>{
    const s = DB.sejours.find(sj=>sj.idSejour===p.idSejour);
    const c = s ? DB.clients.find(cl=>cl.idClient===s.idClient) : null;
    return `<tr><td>${p.idPaiement}</td><td>${p.idSejour}</td><td>${c?c.prenom+' '+c.nom:'—'}</td><td>${fmtDate(p.datePaiement)}</td><td>${fmtMoney(p.montant)}</td><td><span class="badge badge-blue">${p.modePaiement}</span></td></tr>`;
  }).join("");
}
function wireAdminPaiements(){
  document.getElementById("pay-tbody").innerHTML = paiementRows();
  const btn = document.getElementById("btn-add-paiement");
  if(btn && !btn.disabled) btn.onclick = ()=>{
    const sejoursOuverts = DB.sejours.filter(s=>s.statut==="En cours");
    openModal(`<h3>Enregistrer un paiement</h3>
      <div class="field"><label>Séjour</label><select id="p-sejour">${sejoursOuverts.map(s=>{const c=DB.clients.find(cl=>cl.idClient===s.idClient);return `<option value="${s.idSejour}">${s.idSejour} — ${c.prenom} ${c.nom}</option>`;}).join("")}</select></div>
      <div class="field"><label>Montant (FCFA)</label><input type="number" id="p-montant" min="1"><span class="err">Le montant doit être positif.</span></div>
      <div class="field"><label>Mode de paiement</label><select id="p-mode"><option>Espèces</option><option>Carte bancaire</option><option>Mobile Money</option></select></div>
      <div class="modal-actions"><button class="btn btn-outline btn-sm" id="modal-no">Annuler</button><button class="btn btn-gold btn-sm" id="modal-yes">Enregistrer</button></div>`);
    document.getElementById("modal-no").onclick = closeModal;
    document.getElementById("modal-yes").onclick = ()=>{
      const montant = document.getElementById("p-montant");
      if(!markField(montant, montant.value>0, "Le montant doit être positif.")) return;
      addPaiement(document.getElementById("p-sejour").value, +montant.value, document.getElementById("p-mode").value);
      closeModal(); toast("Paiement enregistré","Le paiement a été associé au séjour.");
      document.getElementById("admin-content").innerHTML = pageAdminPaiements(); wireAdminPaiements();
    };
  };
}

/* ---- FACTURES ---- */
function pageAdminFactures(){
  return `${adminHeader("Factures","Factures émises pour les séjours clôturés")}
  <div class="table-wrap"><table>
    <thead><tr><th>N° Facture</th><th>Client</th><th>Chambre</th><th>Date</th><th>Montant</th><th>Statut</th><th>Actions</th></tr></thead>
    <tbody id="fac-tbody"></tbody>
  </table></div>`;
}
function factureRows(){
  const list = [...DB.factures].sort((a,b)=>b.dateFacture.localeCompare(a.dateFacture));
  if(!list.length) return `<tr><td colspan="7">${emptyState("Aucune facture émise pour le moment.")}</td></tr>`;
  return list.map(f=>{
    const s = DB.sejours.find(sj=>sj.idSejour===f.idSejour);
    const c = s ? DB.clients.find(cl=>cl.idClient===s.idClient) : null;
    const badge = f.statut==="Payée" ? '<span class="badge badge-green">Payée</span>' : f.statut==="Non payée" ? '<span class="badge badge-red">Non payée</span>' : '<span class="badge badge-gold">Partiellement payée</span>';
    return `<tr><td><b>${f.numeroFacture}</b></td><td>${c?c.prenom+' '+c.nom:'—'}</td><td>N° ${s?s.numeroChambre:'—'}</td><td>${fmtDate(f.dateFacture)}</td><td>${fmtMoney(f.montantTotal)}</td><td>${badge}</td>
    <td><button class="btn btn-outline btn-sm" data-print-facture="${f.numeroFacture}">${ic('print')} Imprimer</button></td></tr>`;
  }).join("");
}
function wireAdminFactures(){
  document.getElementById("fac-tbody").innerHTML = factureRows();
  document.querySelectorAll("[data-print-facture]").forEach(b=>b.onclick = ()=>printFacture(b.dataset.printFacture));
}
function printFacture(numeroFacture){
  const f = DB.factures.find(x=>x.numeroFacture===numeroFacture);
  const s = DB.sejours.find(sj=>sj.idSejour===f.idSejour);
  const c = DB.clients.find(cl=>cl.idClient===s.idClient);
  const chambre = DB.chambres.find(ch=>ch.numeroChambre===s.numeroChambre);
  const paiements = DB.paiements.filter(p=>p.idSejour===s.idSejour);
  const paye = paiements.reduce((sum,p)=>sum+p.montant,0);
  const nuits = nightsBetween(s.dateArriveeReelle, s.dateDepartReelle);
  document.getElementById("print-area").innerHTML = `
    <div style="font-family:'Jost',sans-serif;max-width:640px;margin:0 auto;">
      <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #c9a15a;padding-bottom:16px;margin-bottom:20px;">
        <div><div style="font-family:'Cormorant Garamond',serif;font-size:26px;">Teranga Palace</div><div style="font-size:11px;color:#666;">Corniche Ouest, Dakar, Sénégal</div></div>
        <div style="text-align:right;"><div style="font-size:13px;font-weight:600;">Facture ${f.numeroFacture}</div><div style="font-size:11px;color:#666;">${fmtDate(f.dateFacture)}</div></div>
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:20px;font-size:12.5px;">
        <div><b>Client</b><br>${c.prenom} ${c.nom}<br>${c.email}<br>${c.telephone}</div>
        <div style="text-align:right;"><b>Séjour</b><br>Chambre ${chambre.type} N° ${chambre.numeroChambre}<br>${fmtDate(s.dateArriveeReelle)} → ${fmtDate(s.dateDepartReelle)}<br>${nuits} nuit(s)</div>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:12.5px;margin-bottom:20px;">
        <thead><tr style="background:#faf6ec;"><th style="text-align:left;padding:8px;border:1px solid #ddd;">Description</th><th style="text-align:right;padding:8px;border:1px solid #ddd;">Montant</th></tr></thead>
        <tbody>
          <tr><td style="padding:8px;border:1px solid #ddd;">${nuits} nuit(s) × ${fmtMoney(chambre.prixParNuit)} (Chambre ${chambre.type} N° ${chambre.numeroChambre})</td><td style="text-align:right;padding:8px;border:1px solid #ddd;">${fmtMoney(f.montantTotal)}</td></tr>
        </tbody>
      </table>
      <div style="max-width:280px;margin-left:auto;font-size:12.5px;">
        <div style="display:flex;justify-content:space-between;padding:5px 0;"><span>Montant total</span><b>${fmtMoney(f.montantTotal)}</b></div>
        <div style="display:flex;justify-content:space-between;padding:5px 0;"><span>Payé</span><b>${fmtMoney(paye)}</b></div>
        <div style="display:flex;justify-content:space-between;padding:5px 0;border-top:1px solid #ddd;margin-top:4px;"><span>Solde</span><b>${fmtMoney(Math.max(0,f.montantTotal-paye))}</b></div>
        <div style="margin-top:10px;text-align:right;"><b>Statut : ${f.statut}</b></div>
      </div>
      <div style="margin-top:30px;font-size:10.5px;color:#999;text-align:center;">Merci de votre confiance — Teranga Palace, Dakar</div>
    </div>`;
  document.body.classList.add("is-printing");
  window.print();
  setTimeout(()=>document.body.classList.remove("is-printing"), 500);
}
window.addEventListener("afterprint", ()=>document.body.classList.remove("is-printing"));

/* ---- STATISTIQUES ---- */
function pageAdminStatistiques(){
  const resByMonth = groupByMonth(DB.reservations, r=>r.dateCreation);
  const revByMonth = groupByMonth(DB.paiements, p=>p.datePaiement, "montant");
  const topRooms = topReservedRooms();
  const totalChambres = DB.chambres.length;
  const occupees = DB.chambres.filter(c=>c.statut==="Occupée").length;
  const taux = totalChambres ? Math.round((occupees/totalChambres)*100) : 0;
  return `${adminHeader("Statistiques","Analyse de l'activité de l'hôtel")}
  <div class="stat-grid">
    <div class="stat-card accent"><div class="stat-label">Revenus totaux</div><div class="stat-value" style="font-size:22px;">${fmtMoney(DB.paiements.reduce((s,p)=>s+p.montant,0))}</div></div>
    <div class="stat-card"><div class="stat-label">Taux d'occupation</div><div class="stat-value">${taux}%</div></div>
    <div class="stat-card"><div class="stat-label">Réservations totales</div><div class="stat-value">${DB.reservations.filter(r=>r.statut!=="Annulée").length}</div></div>
    <div class="stat-card"><div class="stat-label">Panier moyen</div><div class="stat-value" style="font-size:22px;">${fmtMoney(DB.reservations.length? DB.reservations.reduce((s,r)=>s+r.montant,0)/DB.reservations.length : 0)}</div></div>
  </div>
  <div class="grid-2" style="display:grid;gap:20px;">
    <div class="panel"><h4 style="margin-bottom:16px;font-size:16px;">Évolution des réservations</h4>${barChart(resByMonth,"#c9a15a")}</div>
    <div class="panel"><h4 style="margin-bottom:16px;font-size:16px;">Revenus par mois</h4>${barChart(revByMonth,"#4a5d46",fmtMoney)}</div>
  </div>
  <div class="panel" style="margin-top:20px;"><h4 style="margin-bottom:16px;font-size:16px;">Chambres les plus réservées</h4>${topRooms.length?topRooms.map(t=>barRow(t.label,t.count,Math.max(...topRooms.map(x=>x.count),1))).join(""):emptyState("Pas encore de données.")}</div>`;
}
function wireAdminStatistiques(){}

/* ---- RAPPORTS ---- */
function pageAdminRapports(){
  return `${adminHeader("Rapports","Rapports détaillés pour la direction", `<div style="display:flex;gap:8px;"><button class="btn btn-outline btn-sm" id="btn-export-csv">${ic('download')} Exporter (CSV)</button><button class="btn btn-outline btn-sm" id="btn-print-report">${ic('print')} Imprimer</button></div>`)}
  <div id="report-content">
    <div class="panel" style="margin-bottom:20px;"><h4 style="margin-bottom:14px;">Rapport des réservations</h4>
      <div class="table-wrap"><table><thead><tr><th>ID</th><th>Client</th><th>Chambre</th><th>Dates</th><th>Montant</th><th>Statut</th></tr></thead>
      <tbody>${DB.reservations.map(r=>{const c=DB.clients.find(cl=>cl.idClient===r.idClient);return `<tr><td>${r.id}</td><td>${c.prenom} ${c.nom}</td><td>N° ${r.numeroChambre}</td><td>${fmtDate(r.dateArrivee)} → ${fmtDate(r.dateDepart)}</td><td>${fmtMoney(r.montant)}</td><td>${r.statut}</td></tr>`;}).join("")}</tbody></table></div>
    </div>
    <div class="panel" style="margin-bottom:20px;"><h4 style="margin-bottom:14px;">Rapport des revenus</h4>
      <div class="table-wrap"><table><thead><tr><th>Mois</th><th>Revenus encaissés</th></tr></thead>
      <tbody>${groupByMonth(DB.paiements,p=>p.datePaiement,"montant").map(m=>`<tr><td>${m.label}</td><td>${fmtMoney(m.value)}</td></tr>`).join("")}</tbody></table></div>
    </div>
    <div class="panel"><h4 style="margin-bottom:14px;">Chambres les plus réservées</h4>
      <div class="table-wrap"><table><thead><tr><th>Chambre</th><th>Nombre de réservations</th></tr></thead>
      <tbody>${topReservedRooms().map(t=>`<tr><td>${t.label}</td><td>${t.count}</td></tr>`).join("")}</tbody></table></div>
    </div>
  </div>`;
}
function wireAdminRapports(){
  document.getElementById("btn-export-csv").onclick = ()=>{
    let csv = "ID;Client;Chambre;Arrivee;Depart;Montant;Statut\n";
    DB.reservations.forEach(r=>{
      const c = DB.clients.find(cl=>cl.idClient===r.idClient);
      csv += `${r.id};${c.prenom} ${c.nom};${r.numeroChambre};${r.dateArrivee};${r.dateDepart};${r.montant};${r.statut}\n`;
    });
    const blob = new Blob([csv], {type:"text/csv;charset=utf-8;"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "rapport_teranga_palace.csv"; a.click();
    URL.revokeObjectURL(url);
    toast("Export terminé","Le fichier CSV a été téléchargé.");
  };
  document.getElementById("btn-print-report").onclick = ()=>{
    document.getElementById("print-area").innerHTML = document.getElementById("report-content").innerHTML;
    document.body.classList.add("is-printing");
    window.print();
    setTimeout(()=>document.body.classList.remove("is-printing"), 500);
  };
}

/* ---- PARAMÈTRES (placeholder simple) ---- */
function pageAdminParametres(session){
  return `${adminHeader("Paramètres","Informations du compte connecté")}
  <div class="panel" style="max-width:480px;">
    <div style="font-size:13px;line-height:2;color:var(--text-soft);">Email : <b style="color:var(--text);">${session.email}</b><br>Rôle : <b style="color:var(--text);">${session.role}</b></div>
  </div>`;
}

