// src/data/mockData.ts
// ⚠️ CE FICHIER N'EST UTILISÉ QU'EN DÉVELOPPEMENT OU SI SUPABASE N'EST PAS CONFIGURÉ
// En production, les vraies données viennent de Supabase

import type {
  Patient,
  Constante,
  Consultation,
  Alerte,
  AlerteConfig,
  StatsJournalieres,
  User,
} from "../types";

// ============= DONNÉES MOCK (DÉVELOPPEMENT UNIQUEMENT) =============

export const USERS_MOCK: (User & { password: string })[] = [
  {
    id: 1,
    username: "admin",
    password: "admin123",
    nom: "Administrateur",
    prenom: "Clinique",
    role: "admin",
  },
  {
    id: 2,
    username: "dr.kone",
    password: "medecin",
    nom: "KONE",
    prenom: "Dr. Awa",
    role: "medecin",
  },
  {
    id: 3,
    username: "inf.diallo",
    password: "infirmier",
    nom: "DIALLO",
    prenom: "Fatoumata",
    role: "infirmier",
  },
  {
    id: 4,
    username: "gest.archives",
    password: "gestion",
    nom: "SANGARE",
    prenom: "Moussa",
    role: "gestionnaire",
  },
];

export const PATIENTS: Patient[] = [
  {
    id: 1,
    nip: "NIP-20260320-032432",
    id_sgh: 32432,
    nom: "DIALLO",
    prenom: "Aminata",
    date_naissance: "1985-06-15",
    sexe: "F",
    telephone: "76 123 45 67",
    email: "aminata.diallo@email.com",
    adresse: "Quartier Plateau, Rue 12",
    groupe_sanguin: "O+",
    allergies: "Pénicilline",
    antecedents: "Hypertension artérielle depuis 2019, Diabète type 2",
    date_creation: "2026-03-20 10:15:00",
  },
  {
    id: 2,
    nip: "NIP-20260319-032431",
    id_sgh: 32431,
    nom: "TOURE",
    prenom: "Mamadou",
    date_naissance: "1972-02-08",
    sexe: "M",
    telephone: "77 234 56 78",
    adresse: "Cocody, Villa 45",
    groupe_sanguin: "A+",
    allergies: "Aucune connue",
    antecedents: "Asthme chronique",
    date_creation: "2026-03-19 14:30:00",
  },
  {
    id: 3,
    nip: "NIP-20260318-032430",
    id_sgh: 32430,
    nom: "KOUAME",
    prenom: "Marie",
    date_naissance: "1995-11-22",
    sexe: "F",
    telephone: "78 345 67 89",
    adresse: "Yopougon, Cité SIR",
    groupe_sanguin: "B+",
    antecedents: "Aucun",
    date_creation: "2026-03-18 09:00:00",
  },
  {
    id: 4,
    nip: "NIP-20260317-032429",
    id_sgh: 32429,
    nom: "OUATTARA",
    prenom: "Ibrahim",
    date_naissance: "1960-07-30",
    sexe: "M",
    telephone: "75 456 78 90",
    adresse: "Treichville, Avenue 5",
    groupe_sanguin: "AB+",
    allergies: "Aspirine",
    antecedents: "Insuffisance cardiaque, Hypercholestérolémie",
    date_creation: "2026-03-17 11:45:00",
  },
  {
    id: 5,
    nip: "NIP-20260316-032428",
    id_sgh: 32428,
    nom: "BAMBA",
    prenom: "Salimata",
    date_naissance: "2001-03-14",
    sexe: "F",
    telephone: "79 567 89 01",
    adresse: "Abobo, PK 18",
    groupe_sanguin: "O-",
    antecedents: "Aucun",
    date_creation: "2026-03-16 16:20:00",
  },
  {
    id: 6,
    nip: "NIP-20260315-032427",
    id_sgh: 32427,
    nom: "CISSÉ",
    prenom: "Abdoulaye",
    date_naissance: "1988-09-05",
    sexe: "M",
    telephone: "76 678 90 12",
    adresse: "Marcory Zone 4",
    groupe_sanguin: "A-",
    antecedents: "Lombalgie chronique",
    date_creation: "2026-03-15 13:10:00",
  },
  {
    id: 7,
    nip: "NIP-20260314-032426",
    id_sgh: 32426,
    nom: "TRAORÉ",
    prenom: "Kadidja",
    date_naissance: "1978-12-01",
    sexe: "F",
    telephone: "77 789 01 23",
    adresse: "Riviera Bonoumin",
    groupe_sanguin: "B-",
    allergies: "Iode",
    antecedents: "Hypothyroïdie",
    date_creation: "2026-03-14 08:30:00",
  },
  {
    id: 8,
    nip: "NIP-20260313-032425",
    id_sgh: 32425,
    nom: "DIARRA",
    prenom: "Souleymane",
    date_naissance: "1955-04-18",
    sexe: "M",
    telephone: "78 890 12 34",
    adresse: "Adjamé Liberté",
    groupe_sanguin: "O+",
    antecedents: "HTA, Diabète, Insuffisance rénale stade 3",
    date_creation: "2026-03-13 10:00:00",
  },
];

function genConst(
  id: number,
  patient: Patient,
  daysAgo: number,
  overrides: Partial<Constante> = {}
): Constante {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(9 + (id % 8), (id * 13) % 60);
  return {
    id,
    patient_id: patient.id,
    nip: patient.nip,
    date: d.toISOString().slice(0, 16).replace("T", " "),
    tension_systole: 115 + ((id * 7) % 40),
    tension_diastole: 70 + ((id * 3) % 20),
    pouls: 65 + ((id * 5) % 30),
    temperature: 36.4 + ((id * 2) % 20) / 10,
    saturation_o2: 95 + ((id * 2) % 5),
    frequence_respiratoire: 14 + ((id * 3) % 8),
    poids: 62 + ((id * 4) % 25),
    taille: 165 + ((id * 2) % 20),
    douleur_eva: id % 5,
    saisie_par: id % 2 === 0 ? "DIALLO F." : "KOUASSI M.",
    ...overrides,
  };
}

export const CONSTANTES: Constante[] = [
  ...Array.from({ length: 12 }, (_, i) => genConst(i + 1, PATIENTS[0], i * 2)),
  {
    ...genConst(100, PATIENTS[0], 0),
    tension_systole: 165,
    tension_diastole: 98,
    pouls: 112,
    temperature: 38.7,
    douleur_eva: 7,
    saisie_par: "DIALLO F.",
  },
  ...Array.from({ length: 8 }, (_, i) => genConst(200 + i, PATIENTS[1], i * 3)),
  ...Array.from({ length: 6 }, (_, i) => genConst(300 + i, PATIENTS[2], i * 4)),
  ...Array.from({ length: 10 }, (_, i) => genConst(400 + i, PATIENTS[3], i * 2)),
  ...Array.from({ length: 5 }, (_, i) => genConst(500 + i, PATIENTS[4], i * 5)),
  {
    ...genConst(600, PATIENTS[7], 0),
    tension_systole: 180,
    tension_diastole: 110,
    saturation_o2: 91,
    saisie_par: "KOUASSI M.",
  },
];

export const CONSULTATIONS: Consultation[] = [
  {
    id: 1,
    patient_id: 1,
    nip: PATIENTS[0].nip,
    date: "2026-03-20 14:30:00",
    medecin: "Dr. KONE",
    motif: "Douleur thoracique depuis 3 jours, irradiant vers le bras gauche",
    diagnostic: "Angine de poitrine stable",
    prescription:
      "- Aspirine 100mg 1x/jour\n- Atorvastatine 20mg le soir\n- Repos 48h\n- Consultation cardiologue dans 15 jours",
    prochain_rdv: "2026-04-05",
    observations: "ECG normal. Contrôle dans 15 jours.",
  },
  {
    id: 2,
    patient_id: 2,
    nip: PATIENTS[1].nip,
    date: "2026-03-19 16:00:00",
    medecin: "Dr. TOURE",
    motif: "Crise d'asthme récurrente",
    diagnostic: "Asthme persistant modéré",
    prescription:
      "- Salbutamol inhalateur 2 bouffées si besoin\n- Beclomethasone 250µg 2x/jour\n- Éviter les allergènes",
    prochain_rdv: "2026-04-20",
  },
  {
    id: 3,
    patient_id: 4,
    nip: PATIENTS[3].nip,
    date: "2026-03-18 10:15:00",
    medecin: "Dr. KONE",
    motif: "Suivi insuffisance cardiaque",
    diagnostic: "Insuffisance cardiaque stade II stabilisée",
    prescription:
      "- Ramipril 5mg 1x/jour\n- Bisoprolol 2.5mg 1x/jour\n- Furosémide 40mg 1x/jour\n- Régime hyposodé",
    prochain_rdv: "2026-04-18",
  },
  {
    id: 4,
    patient_id: 8,
    nip: PATIENTS[7].nip,
    date: "2026-03-15 09:30:00",
    medecin: "Dr. DIARRA",
    motif: "Bilan diabète et HTA",
    diagnostic: "Diabète type 2 déséquilibré, HTA non contrôlée",
    prescription:
      "- Metformine 1000mg 2x/jour\n- Amlodipine 10mg 1x/jour\n- Bilan biologique complet\n- Régime diabétique",
    prochain_rdv: "2026-03-25",
  },
];

export const ALERTES_CONFIG: AlerteConfig[] = [
  {
    parametre: "tension_systole",
    min_normal: 90,
    max_normal: 140,
    unite: "mmHg",
    message_alerte: "Tension systolique anormale",
    niveau: "danger",
  },
  {
    parametre: "tension_diastole",
    min_normal: 60,
    max_normal: 90,
    unite: "mmHg",
    message_alerte: "Tension diastolique anormale",
    niveau: "danger",
  },
  {
    parametre: "pouls",
    min_normal: 60,
    max_normal: 100,
    unite: "bpm",
    message_alerte: "Fréquence cardiaque anormale",
    niveau: "warning",
  },
  {
    parametre: "temperature",
    min_normal: 36.0,
    max_normal: 37.5,
    unite: "°C",
    message_alerte: "Température anormale",
    niveau: "warning",
  },
  {
    parametre: "saturation_o2",
    min_normal: 94,
    max_normal: 100,
    unite: "%",
    message_alerte: "Désaturation en oxygène",
    niveau: "danger",
  },
  {
    parametre: "frequence_respiratoire",
    min_normal: 12,
    max_normal: 20,
    unite: "/min",
    message_alerte: "Fréquence respiratoire anormale",
    niveau: "warning",
  },
  {
    parametre: "douleur_eva",
    min_normal: 0,
    max_normal: 3,
    unite: "/10",
    message_alerte: "Douleur significative",
    niveau: "warning",
  },
];

export const ALERTES: Alerte[] = [
  {
    id: 1,
    patient_id: 1,
    nip: PATIENTS[0].nip,
    patient_nom: "DIALLO Aminata",
    constante_id: 100,
    parametre: "tension_systole",
    valeur: 165,
    seuil_min: 90,
    seuil_max: 140,
    unite: "mmHg",
    message: "Tension systolique anormale",
    niveau: "danger",
    date_creation: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    traitee: false,
    salle: "Salle 3",
  },
  {
    id: 2,
    patient_id: 1,
    nip: PATIENTS[0].nip,
    patient_nom: "DIALLO Aminata",
    constante_id: 100,
    parametre: "temperature",
    valeur: 38.7,
    seuil_min: 36.0,
    seuil_max: 37.5,
    unite: "°C",
    message: "Température anormale (fièvre)",
    niveau: "warning",
    date_creation: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    traitee: false,
    salle: "Salle 3",
  },
  {
    id: 3,
    patient_id: 1,
    nip: PATIENTS[0].nip,
    patient_nom: "DIALLO Aminata",
    constante_id: 100,
    parametre: "douleur_eva",
    valeur: 7,
    seuil_min: 0,
    seuil_max: 3,
    unite: "/10",
    message: "Douleur significative",
    niveau: "warning",
    date_creation: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    traitee: false,
    salle: "Salle 3",
  },
  {
    id: 4,
    patient_id: 8,
    nip: PATIENTS[7].nip,
    patient_nom: "DIARRA Souleymane",
    constante_id: 600,
    parametre: "tension_systole",
    valeur: 180,
    seuil_min: 90,
    seuil_max: 140,
    unite: "mmHg",
    message: "Tension systolique très élevée",
    niveau: "danger",
    date_creation: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    traitee: false,
    salle: "Salle 1",
  },
  {
    id: 5,
    patient_id: 8,
    nip: PATIENTS[7].nip,
    patient_nom: "DIARRA Souleymane",
    constante_id: 600,
    parametre: "saturation_o2",
    valeur: 91,
    seuil_min: 94,
    seuil_max: 100,
    unite: "%",
    message: "Désaturation en oxygène",
    niveau: "danger",
    date_creation: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    traitee: false,
    salle: "Salle 1",
  },
];

export const STATS_30J: StatsJournalieres[] = Array.from(
  { length: 30 },
  (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const weekend = d.getDay() === 0 || d.getDay() === 6;
    return {
      date: d.toISOString().slice(0, 10),
      nb_consultations: weekend ? 12 + (i % 8) : 30 + (i * 7) % 25,
      nb_constantes: weekend ? 20 + (i % 10) : 55 + (i * 11) % 40,
      nb_nouveaux_patients: 3 + (i % 7),
      tension_moyenne_systole: 120 + (i % 10),
      tension_moyenne_diastole: 75 + (i % 8),
      pouls_moyen: 72 + (i % 6),
      temperature_moyenne: 36.6 + ((i % 5) / 10),
      nb_alertes_critiques: (i * 3) % 5,
      nb_alertes_warning: 2 + ((i * 5) % 8),
    };
  }
);

export const TOP_DIAGNOSTICS = [
  { nom: "Hypertension artérielle", count: 45, couleur: "#ef4444" },
  { nom: "Grippe / Syndrome grippal", count: 32, couleur: "#f59e0b" },
  { nom: "Lombalgie chronique", count: 28, couleur: "#3b82f6" },
  { nom: "Diabète type 2", count: 21, couleur: "#8b5cf6" },
  { nom: "Anxiété / Stress", count: 18, couleur: "#10b981" },
];

export const REPARTITION_AGE = [
  { tranche: "0-18 ans", pourcentage: 15 },
  { tranche: "19-35 ans", pourcentage: 22 },
  { tranche: "36-50 ans", pourcentage: 35 },
  { tranche: "51-65 ans", pourcentage: 18 },
  { tranche: "65+ ans", pourcentage: 10 },
];

export const ACTIVITE_MEDECINS = [
  { nom: "Dr. KONE", consultations: 78, couleur: "#0891b2" },
  { nom: "Dr. TOURE", consultations: 65, couleur: "#059669" },
  { nom: "Dr. DIARRA", consultations: 52, couleur: "#7c3aed" },
  { nom: "Dr. CISSÉ", consultations: 48, couleur: "#dc2626" },
];

export function formatRelativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `Il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `Il y a ${h}h`;
  const j = Math.floor(h / 24);
  return `Il y a ${j}j`;
}

export function calculerAge(dateNaissance: string): number {
  const d = new Date(dateNaissance);
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
}

export function calculerIMC(poids: number, tailleCm: number): number {
  const taille = tailleCm / 100;
  return Number((poids / (taille * taille)).toFixed(1));
}