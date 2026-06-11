export type Role = "infirmier" | "medecin" | "admin" | "gestionnaire";

export interface DocumentArchive {
  id: number;
  patient_id: number;
  nip: string;
  nom_document: string;
  type_document:
    | "consultation"
    | "examen"
    | "ordonnance"
    | "imagerie"
    | "administratif"
    | "laboratoire"
    | "autre";
  description?: string;
  fichier_url?: string;
  taille_ko?: number;
  archive: boolean;
  cree_par: string;
  date_creation: string;
}

export interface JournalEntry {
  id: number;
  action: string;
  cible: string;
  details?: string;
  effectue_par: string;
  date_action: string;
}

export interface User {
  id: number;
  username: string;
  nom: string;
  prenom: string;
  role: Role;
  derniere_connexion?: string;
}

export interface Patient {
  id: number;
  nip: string;
  id_sgh: number;
  nom: string;
  prenom: string;
  date_naissance: string;
  sexe: "M" | "F";
  telephone: string;
  email?: string;
  adresse: string;
  groupe_sanguin?: string;
  allergies?: string;
  antecedents?: string;
  date_creation: string;
}

export interface Constante {
  id: number;
  patient_id: number;
  nip: string;
  date: string;
  tension_systole: number;
  tension_diastole: number;
  pouls: number;
  temperature: number;
  saturation_o2: number;
  frequence_respiratoire: number;
  poids: number;
  taille: number;
  douleur_eva: number;
  glycémie?: number;
  note?: string;
  saisie_par: string;
}

export interface Consultation {
  id: number;
  patient_id: number;
  nip: string;
  date: string;
  medecin: string;
  motif: string;
  diagnostic: string;
  prescription: string;
  prochain_rdv?: string;
  observations?: string;
}

export interface Alerte {
  id: number;
  patient_id: number;
  nip: string;
  patient_nom: string;
  constante_id: number;
  parametre: string;
  valeur: number;
  seuil_min: number;
  seuil_max: number;
  unite: string;
  message: string;
  niveau: "warning" | "danger";
  date_creation: string;
  traitee: boolean;
  traitee_par?: string;
  salle?: string;
}

export interface AlerteConfig {
  parametre: string;
  min_normal: number;
  max_normal: number;
  unite: string;
  message_alerte: string;
  niveau: "warning" | "danger";
}

export interface StatsJournalieres {
  date: string;
  nb_consultations: number;
  nb_constantes: number;
  nb_nouveaux_patients: number;
  tension_moyenne_systole: number;
  tension_moyenne_diastole: number;
  pouls_moyen: number;
  temperature_moyenne: number;
  nb_alertes_critiques: number;
  nb_alertes_warning: number;
}

export type PageId =
  | "dashboard"
  | "patients"
  | "patient-detail"
  | "constantes"
  | "alertes"
  | "consultations"
  | "stats"
  | "users"
  | "integration"
  | "archives";
