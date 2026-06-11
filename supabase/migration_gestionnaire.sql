-- ============================================================
-- MIGRATION : Rôle "Gestionnaire d'archivage" + Tables d'archives
-- Paracliniques des Oliviers
--
-- À EXÉCUTER dans Supabase > SQL Editor > New query > Run
-- (après le schema.sql initial que vous avez déjà exécuté)
-- ============================================================

-- ============================================================
-- 1. AJOUTER LE RÔLE 'gestionnaire' AUX COMPTES
-- ============================================================
ALTER TABLE staff DROP CONSTRAINT IF EXISTS staff_role_check;
ALTER TABLE staff ADD CONSTRAINT staff_role_check
  CHECK (role IN ('admin', 'medecin', 'infirmier', 'gestionnaire'));

-- ============================================================
-- 2. STATUT D'ARCHIVAGE SUR LES PATIENTS
-- ============================================================
ALTER TABLE patients ADD COLUMN IF NOT EXISTS archive BOOLEAN DEFAULT false;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS archive_par TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS date_archivage TIMESTAMPTZ;

-- ============================================================
-- 3. TABLE DES DOCUMENTS (gérée par le gestionnaire)
-- ============================================================
CREATE TABLE IF NOT EXISTS archives_documents (
  id BIGSERIAL PRIMARY KEY,
  patient_id BIGINT REFERENCES patients(id) ON DELETE CASCADE,
  nip TEXT,
  nom_document TEXT NOT NULL,
  type_document TEXT CHECK (type_document IN
    ('consultation','examen','ordonnance','imagerie','administratif','laboratoire','autre')),
  description TEXT,
  fichier_url TEXT,
  taille_ko INT,
  archive BOOLEAN DEFAULT false,
  cree_par TEXT,
  date_creation TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_docs_patient ON archives_documents(patient_id);
CREATE INDEX IF NOT EXISTS idx_docs_type ON archives_documents(type_document);

-- ============================================================
-- 4. JOURNAL DES OPÉRATIONS D'ARCHIVAGE (traçabilité)
-- ============================================================
CREATE TABLE IF NOT EXISTS archives_journal (
  id BIGSERIAL PRIMARY KEY,
  action TEXT NOT NULL,           -- 'archivage', 'restauration', 'ajout_document', 'suppression_document', 'export'
  cible TEXT,                     -- NIP du patient ou nom du document
  details TEXT,
  effectue_par TEXT,
  date_action TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. SÉCURITÉ (RLS)
-- ============================================================
ALTER TABLE archives_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE archives_journal ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "acces_total_docs" ON archives_documents;
CREATE POLICY "acces_total_docs" ON archives_documents FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "acces_total_journal" ON archives_journal;
CREATE POLICY "acces_total_journal" ON archives_journal FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 6. TEMPS RÉEL sur les documents
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'archives_documents'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE archives_documents;
  END IF;
END $$;

-- ============================================================
-- 7. COMPTE GESTIONNAIRE DE DÉMONSTRATION
--    Login : gest.archives / Mot de passe : gestion
-- ============================================================
SELECT create_staff('gest.archives', 'gestion', 'SANGARE', 'Moussa', 'gestionnaire');

-- ============================================================
-- VÉRIFICATION
-- ============================================================
SELECT username, nom, prenom, role, actif FROM staff ORDER BY id;
