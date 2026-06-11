-- ============================================================
-- REMISE À ZÉRO — Supprime les données de DÉMONSTRATION
-- Paracliniques des Oliviers
--
-- À exécuter dans Supabase > SQL Editor AVANT d'importer
-- vos vraies données depuis SGH.
--
-- ⚠️ CE QUI EST SUPPRIMÉ : patients, constantes, consultations, alertes
-- ✅ CE QUI EST CONSERVÉ : vos comptes utilisateurs (staff),
--                          la configuration des seuils d'alertes
-- ============================================================

-- Supprime dans le bon ordre (à cause des clés étrangères)
DELETE FROM alertes;
DELETE FROM consultations;
DELETE FROM constantes;
DELETE FROM patients;

-- Remet les compteurs d'ID à zéro
ALTER SEQUENCE patients_id_seq RESTART WITH 1;
ALTER SEQUENCE constantes_id_seq RESTART WITH 1;
ALTER SEQUENCE consultations_id_seq RESTART WITH 1;
ALTER SEQUENCE alertes_id_seq RESTART WITH 1;

-- Vérification : tout doit être à 0
SELECT
  (SELECT COUNT(*) FROM patients)      AS patients,
  (SELECT COUNT(*) FROM constantes)    AS constantes,
  (SELECT COUNT(*) FROM consultations) AS consultations,
  (SELECT COUNT(*) FROM alertes)       AS alertes,
  (SELECT COUNT(*) FROM staff)         AS comptes_conserves;
