-- ============================================================================
-- TERANGA PALACE — Données de démonstration
-- Jeu de données identique à celui utilisé par l'application (js/data.js),
-- pour garantir la cohérence entre la version LocalStorage et la base SQL.
-- ============================================================================

-- -------- CLIENTS --------
INSERT INTO clients (idClient, nom, prenom, telephone, email, adresse) VALUES
    ('CL-001', 'Diallo', 'Sophie', '+221 77 123 45 67', 'sophie.diallo@example.com', 'Mermoz, Dakar'),
    ('CL-002', 'Ndiaye', 'Moussa', '+221 76 234 56 78', 'moussa.ndiaye@example.com', 'Almadies, Dakar'),
    ('CL-003', 'Faye', 'Aïda', '+221 78 345 67 89', 'aida.faye@example.com', 'Point E, Dakar'),
    ('CL-004', 'Martin', 'Julien', '+33 6 12 34 56 78', 'julien.martin@example.com', 'Lyon, France'),
    ('CL-005', 'Sow', 'Fatou', '+221 70 456 78 90', 'fatou.sow@example.com', 'Yoff, Dakar'),
    ('CL-006', 'Camara', 'Ibrahima', '+221 77 567 89 01', 'ibrahima.camara@example.com', 'Ouakam, Dakar');

-- -------- CHAMBRES --------
INSERT INTO chambres (numeroChambre, type, prixParNuit, capacite, statut, description) VALUES
    ('101', 'Simple', 35000, 1, 'Disponible', 'Chambre lumineuse avec vue jardin, idéale pour un séjour d''affaires.'),
    ('102', 'Simple', 35000, 1, 'Disponible', 'Chambre épurée, bureau de travail et literie premium.'),
    ('103', 'Simple', 38000, 1, 'Maintenance', 'Chambre en cours de rénovation de la salle de bain.'),
    ('201', 'Double', 55000, 2, 'Disponible', 'Chambre spacieuse avec balcon donnant sur la piscine.'),
    ('202', 'Double', 58000, 2, 'Occupée', 'Ambiance chaleureuse, décoration inspirée de l''artisanat sénégalais.'),
    ('203', 'Double', 55000, 2, 'Disponible', 'Chambre calme côté cour intérieure, idéale pour couples.'),
    ('301', 'Suite', 95000, 4, 'Disponible', 'Suite avec salon privé et vue panoramique sur la baie de Dakar.'),
    ('302', 'Suite', 110000, 4, 'Disponible', 'Suite Présidentielle, terrasse privative et jacuzzi.'),
    ('104', 'Simple', 35000, 1, 'Disponible', 'Chambre cosy avec douche à l''italienne et coin lecture.'),
    ('105', 'Simple', 36000, 1, 'Disponible', 'Chambre climatisée, vue sur la cour intérieure arborée.'),
    ('106', 'Simple', 35000, 1, 'Disponible', 'Chambre moderne avec Wi-Fi haut débit et coffre-fort.'),
    ('107', 'Simple', 37000, 1, 'Disponible', 'Chambre chaleureuse, décoration en bois clair et tissus locaux.'),
    ('108', 'Simple', 35000, 1, 'Disponible', 'Chambre pratique proche de l''ascenseur, idéale courts séjours.'),
    ('109', 'Simple', 38000, 1, 'Disponible', 'Chambre calme côté rue piétonne, double vitrage.'),
    ('110', 'Simple', 36000, 1, 'Disponible', 'Chambre avec petit balcon donnant sur les jardins.'),
    ('111', 'Simple', 35000, 1, 'Disponible', 'Chambre confortable, literie premium et bureau ergonomique.'),
    ('112', 'Simple', 37000, 1, 'Disponible', 'Chambre claire avec dressing et coin bureau.'),
    ('113', 'Simple', 36000, 1, 'Disponible', 'Chambre rénovée, salle de bain moderne et douche à jets.'),
    ('114', 'Simple', 35000, 1, 'Disponible', 'Chambre discrète côté jardin, idéale pour un séjour au calme.'),
    ('115', 'Simple', 38000, 1, 'Disponible', 'Chambre fonctionnelle avec vue sur la piscine.'),
    ('116', 'Simple', 36000, 1, 'Disponible', 'Chambre chaleureuse aux tons sable et bois exotique.'),
    ('117', 'Simple', 35000, 1, 'Disponible', 'Chambre spacieuse avec grand bureau et fauteuil de lecture.'),
    ('118', 'Simple', 37000, 1, 'Disponible', 'Chambre lumineuse avec double fenêtre côté cour.'),
    ('119', 'Simple', 36000, 1, 'Disponible', 'Chambre récemment rafraîchie, literie haut de gamme.'),
    ('120', 'Simple', 35000, 1, 'Disponible', 'Chambre pratique avec kitchenette pour longs séjours.'),
    ('204', 'Double', 55000, 2, 'Disponible', 'Chambre lumineuse avec grand lit king size et coin salon.'),
    ('205', 'Double', 58000, 2, 'Disponible', 'Chambre vue mer partielle, terrasse privative.'),
    ('206', 'Double', 56000, 2, 'Disponible', 'Chambre familiale avec canapé-lit d''appoint disponible.'),
    ('207', 'Double', 60000, 2, 'Disponible', 'Chambre rénovée, douche à l''italienne et dressing.'),
    ('208', 'Double', 55000, 2, 'Disponible', 'Chambre avec vue sur le jardin tropical de l''hôtel.'),
    ('209', 'Double', 57000, 2, 'Disponible', 'Chambre élégante, tons ocre et mobilier en bois massif.'),
    ('210', 'Double', 62000, 2, 'Disponible', 'Chambre spacieuse proche du spa et de la piscine.'),
    ('211', 'Double', 55000, 2, 'Disponible', 'Chambre avec coin salon et vue sur la baie.'),
    ('212', 'Double', 58000, 2, 'Disponible', 'Chambre confortable, deux lits jumeaux modulables.'),
    ('213', 'Double', 56000, 2, 'Disponible', 'Chambre baignée de lumière, balcon filant côté jardin.'),
    ('214', 'Double', 55000, 2, 'Disponible', 'Chambre au design contemporain, douche à l''italienne.'),
    ('215', 'Double', 60000, 2, 'Disponible', 'Chambre calme en fond de cour, idéale longs séjours.'),
    ('216', 'Double', 57000, 2, 'Disponible', 'Chambre avec vue piscine et accès direct à la terrasse commune.'),
    ('217', 'Double', 55000, 2, 'Disponible', 'Chambre chaleureuse, textiles wax et bois local.'),
    ('218', 'Double', 58000, 2, 'Disponible', 'Chambre spacieuse avec espace bureau dédié.'),
    ('219', 'Double', 56000, 2, 'Disponible', 'Chambre rénovée avec literie premium et coffre-fort.'),
    ('220', 'Double', 55000, 2, 'Disponible', 'Chambre lumineuse côté est, idéale lever de soleil sur la baie.'),
    ('303', 'Suite', 98000, 4, 'Disponible', 'Suite Junior avec coin bureau et dressing spacieux.'),
    ('304', 'Suite', 105000, 4, 'Disponible', 'Suite Duplex sur deux niveaux, vue mer imprenable.'),
    ('305', 'Suite', 120000, 5, 'Disponible', 'Suite Prestige avec salle à manger privée.'),
    ('306', 'Suite', 100000, 4, 'Disponible', 'Suite d''angle, double exposition et balcon filant.'),
    ('307', 'Suite', 115000, 4, 'Disponible', 'Suite Familiale, deux chambres communicantes.'),
    ('308', 'Suite', 130000, 6, 'Disponible', 'Suite Diplomate avec salon de réception et bar privatif.');

-- -------- UTILISATEURS (comptes de démonstration) --------
INSERT INTO utilisateurs (email, password, role, idClient) VALUES
    ('sophie.diallo@example.com', 'client123', 'Client', 'CL-001'),
    ('moussa.ndiaye@example.com', 'client123', 'Client', 'CL-002'),
    ('reception@terangapalace.sn', 'reception123', 'Réceptionniste', NULL),
    ('manager@terangapalace.sn', 'manager123', 'Gestionnaire', NULL);

-- -------- RÉSERVATIONS --------
-- NB : insérées avec statut temporaire 'Confirmée' puis mises à jour ensuite
-- pour les réservations Annulée/Terminée, afin de ne pas déclencher le
-- contrôle anti-chevauchement sur des lignes historiques déjà closes.
INSERT INTO reservations (id, idClient, numeroChambre, dateArrivee, dateDepart, nbPersonnes, montant, statut, dateCreation) VALUES
    ('TP-2026-00100', 'CL-001', '201', '2026-08-22', '2026-08-25', 2, 165000, 'Confirmée', '2026-08-22'),
    ('TP-2026-00101', 'CL-002', '301', '2026-08-20', '2026-08-23', 3, 285000, 'Confirmée', '2026-08-20'),
    ('TP-2026-00102', 'CL-003', '101', '2026-08-24', '2026-08-26', 1, 70000, 'Confirmée', '2026-08-24'),
    ('TP-2026-00103', 'CL-005', '203', '2026-09-02', '2026-09-05', 2, 165000, 'Confirmée', '2026-09-02'),
    ('TP-2026-00104', 'CL-004', '202', '2026-08-18', '2026-08-20', 2, 116000, 'Confirmée', '2026-08-18'),
    ('TP-2026-00105', 'CL-006', '202', '2026-08-14', '2026-08-18', 2, 232000, 'Confirmée', '2026-08-14'),
    ('TP-2026-00106', 'CL-001', '101', '2026-07-10', '2026-07-13', 1, 105000, 'Confirmée', '2026-07-10'),
    ('TP-2026-00107', 'CL-003', '301', '2026-07-02', '2026-07-06', 3, 380000, 'Confirmée', '2026-07-02'),
    ('TP-2026-00108', 'CL-005', '201', '2026-06-20', '2026-06-24', 2, 220000, 'Confirmée', '2026-06-20'),
    ('TP-2026-00109', 'CL-002', '302', '2026-06-05', '2026-06-09', 4, 440000, 'Confirmée', '2026-06-05'),
    ('TP-2026-00110', 'CL-004', '203', '2026-05-15', '2026-05-17', 2, 110000, 'Confirmée', '2026-05-15');

UPDATE reservations SET statut = 'Annulée' WHERE id = 'TP-2026-00104';
UPDATE reservations SET statut = 'Terminée' WHERE id = 'TP-2026-00106';
UPDATE reservations SET statut = 'Terminée' WHERE id = 'TP-2026-00107';
UPDATE reservations SET statut = 'Terminée' WHERE id = 'TP-2026-00108';
UPDATE reservations SET statut = 'Terminée' WHERE id = 'TP-2026-00109';
UPDATE reservations SET statut = 'Terminée' WHERE id = 'TP-2026-00110';

-- -------- SÉJOURS --------
INSERT INTO sejours (idSejour, idReservation, idClient, numeroChambre, dateArriveeReelle, dateDepartReelle, montantTotal, statut) VALUES
    ('SJ-0040', 'TP-2026-00105', 'CL-006', '202', '2026-08-14', '2026-08-18', 232000, 'En cours'),
    ('SJ-0041', 'TP-2026-00106', 'CL-001', '101', '2026-07-10', '2026-07-13', 105000, 'Terminé'),
    ('SJ-0042', 'TP-2026-00107', 'CL-003', '301', '2026-07-02', '2026-07-06', 380000, 'Terminé'),
    ('SJ-0043', 'TP-2026-00108', 'CL-005', '201', '2026-06-20', '2026-06-24', 220000, 'Terminé'),
    ('SJ-0044', 'TP-2026-00109', 'CL-002', '302', '2026-06-05', '2026-06-09', 440000, 'Terminé'),
    ('SJ-0045', 'TP-2026-00110', 'CL-004', '203', '2026-05-15', '2026-05-17', 110000, 'Terminé');

-- -------- PAIEMENTS --------
INSERT INTO paiements (idPaiement, idSejour, datePaiement, montant, modePaiement) VALUES
    ('PM-0060', 'SJ-0040', '2026-08-14', 50000, 'Mobile Money'),
    ('PM-0061', 'SJ-0041', '2026-07-13', 105000, 'Carte bancaire'),
    ('PM-0062', 'SJ-0042', '2026-07-06', 200000, 'Espèces'),
    ('PM-0063', 'SJ-0043', '2026-06-24', 220000, 'Mobile Money'),
    ('PM-0064', 'SJ-0044', '2026-06-09', 264000, 'Carte bancaire'),
    ('PM-0065', 'SJ-0045', '2026-05-17', 110000, 'Espèces');

-- -------- FACTURES --------
INSERT INTO factures (numeroFacture, idSejour, dateFacture, montantTotal, statut) VALUES
    ('FA-2026-0040', 'SJ-0041', '2026-07-13', 105000, 'Payée'),
    ('FA-2026-0041', 'SJ-0042', '2026-07-06', 380000, 'Partiellement payée'),
    ('FA-2026-0042', 'SJ-0043', '2026-06-24', 220000, 'Payée'),
    ('FA-2026-0043', 'SJ-0044', '2026-06-09', 440000, 'Partiellement payée'),
    ('FA-2026-0044', 'SJ-0045', '2026-05-17', 110000, 'Payée');
