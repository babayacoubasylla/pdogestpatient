-- ============================================================
-- PARACLINIQUES DES OLIVIERS - Schéma complet Supabase
-- Projet : pdogestpatient
--
-- INSTRUCTIONS :
-- 1. Ouvrez Supabase > SQL Editor > New query
-- 2. Collez TOUT ce fichier
-- 3. Cliquez sur "Run"
-- ============================================================

-- Extension pour le hachage des mots de passe
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- 1. TABLES
-- ============================================================

-- Patients (synchronisés depuis SGH/Firebird)
CREATE TABLE IF NOT EXISTS patients (
  id BIGSERIAL PRIMARY KEY,
  nip TEXT UNIQUE NOT NULL,
  id_sgh BIGINT UNIQUE,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  date_naissance DATE,
  sexe TEXT CHECK (sexe IN ('M','F')),
  telephone TEXT,
  email TEXT,
  adresse TEXT,
  groupe_sanguin TEXT,
  allergies TEXT,
  antecedents TEXT,
  qr_code TEXT,
  date_creation TIMESTAMPTZ DEFAULT NOW()
);

-- Constantes vitales
CREATE TABLE IF NOT EXISTS constantes (
  id BIGSERIAL PRIMARY KEY,
  patient_id BIGINT REFERENCES patients(id) ON DELETE CASCADE,
  nip TEXT,
  date_mesure TIMESTAMPTZ DEFAULT NOW(),
  tension_systole INT,
  tension_diastole INT,
  pouls INT,
  temperature NUMERIC(4,1),
  saturation_o2 INT,
  frequence_respiratoire INT,
  poids NUMERIC(5,1),
  taille INT,
  douleur_eva INT,
  glycemie NUMERIC(4,2),
  note TEXT,
  saisie_par TEXT
);

-- Consultations
CREATE TABLE IF NOT EXISTS consultations (
  id BIGSERIAL PRIMARY KEY,
  patient_id BIGINT REFERENCES patients(id) ON DELETE CASCADE,
  nip TEXT,
  date_consultation TIMESTAMPTZ DEFAULT NOW(),
  medecin TEXT,
  motif TEXT,
  diagnostic TEXT,
  prescription TEXT,
  prochain_rdv DATE,
  observations TEXT
);

-- Personnel (médecins, infirmiers, admins)
CREATE TABLE IF NOT EXISTS staff (
  id BIGSERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin','medecin','infirmier')) NOT NULL,
  actif BOOLEAN DEFAULT true,
  derniere_connexion TIMESTAMPTZ,
  date_creation TIMESTAMPTZ DEFAULT NOW()
);

-- Alertes constantes anormales
CREATE TABLE IF NOT EXISTS alertes (
  id BIGSERIAL PRIMARY KEY,
  patient_id BIGINT REFERENCES patients(id) ON DELETE CASCADE,
  constante_id BIGINT REFERENCES constantes(id) ON DELETE CASCADE,
  parametre TEXT,
  valeur NUMERIC,
  seuil_min NUMERIC,
  seuil_max NUMERIC,
  unite TEXT,
  message TEXT,
  niveau TEXT CHECK (niveau IN ('warning','danger')),
  salle TEXT,
  traitee BOOLEAN DEFAULT false,
  traitee_par TEXT,
  date_traitement TIMESTAMPTZ,
  date_creation TIMESTAMPTZ DEFAULT NOW()
);

-- Configuration des seuils d'alertes
CREATE TABLE IF NOT EXISTS alertes_config (
  id BIGSERIAL PRIMARY KEY,
  parametre TEXT UNIQUE NOT NULL,
  min_normal NUMERIC,
  max_normal NUMERIC,
  unite TEXT,
  message_alerte TEXT,
  niveau TEXT CHECK (niveau IN ('warning','danger'))
);

-- ============================================================
-- 2. INDEX
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_patients_nip ON patients(nip);
CREATE INDEX IF NOT EXISTS idx_patients_id_sgh ON patients(id_sgh);
CREATE INDEX IF NOT EXISTS idx_constantes_patient ON constantes(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultations_patient ON consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_alertes_actives ON alertes(traitee) WHERE traitee = false;

-- ============================================================
-- 3. ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE constantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertes ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertes_config ENABLE ROW LEVEL SECURITY;

-- Policies (démo : accès complet avec la clé publishable ;
-- en production, restreignez selon vos besoins avec Supabase Auth)
DROP POLICY IF EXISTS "acces_total_patients" ON patients;
CREATE POLICY "acces_total_patients" ON patients FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "acces_total_constantes" ON constantes;
CREATE POLICY "acces_total_constantes" ON constantes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "acces_total_consultations" ON consultations;
CREATE POLICY "acces_total_consultations" ON consultations FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "lecture_staff" ON staff;
CREATE POLICY "lecture_staff" ON staff FOR SELECT USING (true);

DROP POLICY IF EXISTS "acces_total_alertes" ON alertes;
CREATE POLICY "acces_total_alertes" ON alertes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "lecture_config" ON alertes_config;
CREATE POLICY "lecture_config" ON alertes_config FOR SELECT USING (true);

-- ============================================================
-- 4. FONCTIONS RPC (authentification sécurisée)
-- ============================================================

-- Connexion : vérifie le mot de passe avec bcrypt
CREATE OR REPLACE FUNCTION login_staff(p_username TEXT, p_password TEXT)
RETURNS TABLE(id BIGINT, username TEXT, nom TEXT, prenom TEXT, role TEXT)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE staff SET derniere_connexion = NOW()
  WHERE staff.username = p_username
    AND staff.actif = true
    AND staff.password_hash = crypt(p_password, staff.password_hash);

  RETURN QUERY
  SELECT s.id, s.username, s.nom, s.prenom, s.role
  FROM staff s
  WHERE s.username = p_username
    AND s.actif = true
    AND s.password_hash = crypt(p_password, s.password_hash);
END;
$$;

-- Création de compte (hash automatique du mot de passe)
CREATE OR REPLACE FUNCTION create_staff(
  p_username TEXT, p_password TEXT,
  p_nom TEXT, p_prenom TEXT, p_role TEXT
)
RETURNS BIGINT
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE new_id BIGINT;
BEGIN
  INSERT INTO staff (username, password_hash, nom, prenom, role)
  VALUES (p_username, crypt(p_password, gen_salt('bf')), p_nom, p_prenom, p_role)
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$$;

-- Changement de mot de passe
CREATE OR REPLACE FUNCTION change_staff_password(p_user_id BIGINT, p_new_password TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE staff SET password_hash = crypt(p_new_password, gen_salt('bf'))
  WHERE id = p_user_id;
  RETURN FOUND;
END;
$$;

-- Activer / désactiver un compte
CREATE OR REPLACE FUNCTION toggle_staff_active(p_user_id BIGINT)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE staff SET actif = NOT actif WHERE id = p_user_id;
  RETURN FOUND;
END;
$$;

-- ============================================================
-- 5. ACTIVER LE TEMPS RÉEL (notifications)
-- ============================================================
-- Active la publication realtime pour les alertes et constantes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'alertes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE alertes;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'constantes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE constantes;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'patients'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE patients;
  END IF;
END $$;

-- ============================================================
-- 6. DONNÉES INITIALES
-- ============================================================

-- Comptes utilisateurs (mots de passe : admin123 / medecin / infirmier)
SELECT create_staff('admin', 'admin123', 'Administrateur', 'Clinique', 'admin');
SELECT create_staff('dr.kone', 'medecin', 'KONE', 'Dr. Awa', 'medecin');
SELECT create_staff('inf.diallo', 'infirmier', 'DIALLO', 'Fatoumata', 'infirmier');

-- Seuils d'alertes
INSERT INTO alertes_config (parametre, min_normal, max_normal, unite, message_alerte, niveau) VALUES
('tension_systole', 90, 140, 'mmHg', 'Tension systolique anormale', 'danger'),
('tension_diastole', 60, 90, 'mmHg', 'Tension diastolique anormale', 'danger'),
('pouls', 60, 100, 'bpm', 'Fréquence cardiaque anormale', 'warning'),
('temperature', 36.0, 37.5, '°C', 'Température anormale', 'warning'),
('saturation_o2', 94, 100, '%', 'Désaturation en oxygène', 'danger'),
('frequence_respiratoire', 12, 20, '/min', 'Fréquence respiratoire anormale', 'warning'),
('douleur_eva', 0, 3, '/10', 'Douleur significative', 'warning')
ON CONFLICT (parametre) DO NOTHING;

-- Patients de démonstration
INSERT INTO patients (nip, id_sgh, nom, prenom, date_naissance, sexe, telephone, email, adresse, groupe_sanguin, allergies, antecedents) VALUES
('NIP-20260320-032432', 32432, 'DIALLO', 'Aminata', '1985-06-15', 'F', '76 123 45 67', 'aminata.diallo@email.com', 'Quartier Plateau, Rue 12', 'O+', 'Pénicilline', 'Hypertension artérielle depuis 2019, Diabète type 2'),
('NIP-20260319-032431', 32431, 'TOURE', 'Mamadou', '1972-02-08', 'M', '77 234 56 78', NULL, 'Cocody, Villa 45', 'A+', NULL, 'Asthme chronique'),
('NIP-20260318-032430', 32430, 'KOUAME', 'Marie', '1995-11-22', 'F', '78 345 67 89', NULL, 'Yopougon, Cité SIR', 'B+', NULL, 'Aucun'),
('NIP-20260317-032429', 32429, 'OUATTARA', 'Ibrahim', '1960-07-30', 'M', '75 456 78 90', NULL, 'Treichville, Avenue 5', 'AB+', 'Aspirine', 'Insuffisance cardiaque, Hypercholestérolémie'),
('NIP-20260316-032428', 32428, 'BAMBA', 'Salimata', '2001-03-14', 'F', '79 567 89 01', NULL, 'Abobo, PK 18', 'O-', NULL, 'Aucun')
ON CONFLICT (nip) DO NOTHING;

-- Constantes de démonstration
INSERT INTO constantes (patient_id, nip, date_mesure, tension_systole, tension_diastole, pouls, temperature, saturation_o2, frequence_respiratoire, poids, taille, douleur_eva, saisie_par)
SELECT p.id, p.nip, NOW() - (n || ' days')::interval,
  115 + (n*7)%40, 70 + (n*3)%20, 65 + (n*5)%30,
  36.4 + ((n*2)%14)/10.0, 95 + (n*2)%5, 14 + (n*3)%7,
  62 + (n*4)%25, 165, n%4, 'DIALLO F.'
FROM patients p, generate_series(0, 9) n
WHERE p.nip = 'NIP-20260320-032432'
ON CONFLICT DO NOTHING;

-- Une constante anormale + son alerte
WITH c AS (
  INSERT INTO constantes (patient_id, nip, tension_systole, tension_diastole, pouls, temperature, saturation_o2, frequence_respiratoire, poids, taille, douleur_eva, saisie_par)
  SELECT id, nip, 165, 98, 112, 38.7, 96, 18, 65, 165, 7, 'DIALLO F.'
  FROM patients WHERE nip = 'NIP-20260320-032432'
  RETURNING id, patient_id
)
INSERT INTO alertes (patient_id, constante_id, parametre, valeur, seuil_min, seuil_max, unite, message, niveau, salle)
SELECT patient_id, id, 'tension_systole', 165, 90, 140, 'mmHg', 'Tension systolique anormale', 'danger', 'Salle 3' FROM c;

-- Consultation de démonstration
INSERT INTO consultations (patient_id, nip, medecin, motif, diagnostic, prescription, prochain_rdv)
SELECT id, nip, 'Dr. KONE',
  'Douleur thoracique depuis 3 jours, irradiant vers le bras gauche',
  'Angine de poitrine stable',
  E'- Aspirine 100mg 1x/jour\n- Atorvastatine 20mg le soir\n- Repos 48h\n- Consultation cardiologue dans 15 jours',
  '2026-04-05'
FROM patients WHERE nip = 'NIP-20260320-032432';

-- ============================================================
-- TERMINÉ ! Vérifiez avec : SELECT * FROM patients;
-- ============================================================
