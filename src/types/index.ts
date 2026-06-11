export type Role = "infirmier" | "medecin" | "admin" | "archiviste" | "secretaire";

export interface User {
    id: number;
    username: string;
    nom: string;
    prenom: string;
    role: Role;
    actif: boolean;
    derniere_connexion?: string;
}

export type StatutPatient =
    | "en_attente_enregistrement_paiement"   // secrétaire, avant SGH
    | "pre_enregistre"                      // secrétaire vient de créer
    | "synchronise"                         // synchronisé depuis SGH
    | "en_attente_constantes"               // infirmier
    | "constantes_terminees"                // infirmier a fini
    | "en_attente_medecin"                  // prêt pour médecin
    | "en_consultation"                     // médecin en cours
    | "termine"                             // dossier du jour fini
    | "archive";                            // archivé

export interface PreEnregistrement {
    id: number;
    pre_id: string;
    nom: string;
    prenom: string;
    date_naissance?: string;
    sexe?: "M" | "F";
    telephone?: string;
    adresse?: string;
    motif?: string;
    note_accueil?: string;
    cree_par?: string;
    date_creation: string;
    statut: StatutPatient;
    patient_id?: number;
    nip?: string;
    date_synchro_sgh?: string;
}

export interface Patient {
    id: number;
    nip?: string;
    id_sgh?: number;
    nom: string;
    prenom: string;
    date_naissance?: string;
    sexe?: "M" | "F";
    telephone?: string;
    email?: string;
    adresse?: string;
    groupe_sanguin?: string;
    allergies?: string;
    antecedents?: string;
    contact_urgence?: string;
    assurance?: string;
    qr_code?: string;
    date_creation: string;
}

export interface ParcoursPatient {
    id: number;
    patient_id: number;
    pre_enregistrement_id?: number;
    nip?: string;
    date_journee: string;
    statut: StatutPatient;
    heure_pre_enregistrement?: string;
    heure_synchro_sgh?: string;
    heure_constantes?: string;
    heure_medecin?: string;
    heure_fin?: string;
    source?: string;
    commentaire?: string;
    patients?: Patient;
}

export interface Constante {
    id: number;
    patient_id: number;
    parcours_id?: number;
    nip?: string;
    date_mesure: string;
    tension_systole: number;
    tension_diastole: number;
    pouls: number;
    temperature: number;
    saturation_o2: number;
    frequence_respiratoire: number;
    poids: number;
    taille: number;
    douleur_eva: number;
    glycemie?: number;
    note?: string;
    saisie_par?: string;
}

export interface Consultation {
    id: number;
    patient_id: number;
    parcours_id?: number;
    nip?: string;
    date_consultation: string;
    medecin: string;
    motif: string;
    diagnostic: string;
    prescription?: string;
    observations?: string;
    prochain_rdv?: string;
}

export interface Alerte {
    id: number;
    patient_id: number;
    constante_id: number;
    parcours_id?: number;
    parametre: string;
    valeur: number;
    seuil_min: number;
    seuil_max: number;
    unite: string;
    message: string;
    niveau: "warning" | "danger";
    traitee: boolean;
    traitee_par?: string;
    salle?: string;
    date_creation: string;
    patients?: Patient;
}

export interface CarnetDigital {
    id: number;
    patient_id: number;
    nip: string;
    allergies?: string;
    antecedents?: string;
    traitements_chroniques?: string;
    vaccinations?: string;
    observations_longitudinales?: string;
    derniere_mise_a_jour: string;
}

export interface Archive {
    id: number;
    patient_id: number;
    nip?: string;
    titre: string;
    type_fichier: string;
    url_fichier?: string;
    ajoute_par?: string;
    date_ajout: string;
    patients?: Patient;
}

export interface AuditLog {
    id: number;
    user_role?: string;
    user_name?: string;
    action: string;
    cible_type?: string;
    cible_id?: string;
    details?: string;
    date_action: string;
}

export type PageId =
    | "dashboard"
    | "pre-enregistrement"
    | "flux-jour"
    | "patients"
    | "patient-detail"
    | "carnet-digital"
    | "constantes"
    | "alertes"
    | "consultations"
    | "stats"
    | "users"
    | "archives"
    | "integration"
    | "audit";