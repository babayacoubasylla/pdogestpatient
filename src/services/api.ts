/**
 * Couche de services API — Supabase
 * Toutes les fonctions retournent les données au format des types frontend.
 * Si Supabase n'est pas configuré, les fonctions retournent null
 * et l'application utilise les données de démonstration (mockData).
 */
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import type { Patient, Constante, Consultation, Alerte, User, Role } from "../types";
import { ALERTES_CONFIG } from "../data/mockData";

// ====================================================
// AUTHENTIFICATION
// ====================================================

export async function loginStaff(
  username: string,
  password: string
): Promise<User | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("login_staff", {
    p_username: username,
    p_password: password,
  });
  if (error || !data || data.length === 0) return null;
  const u = data[0];
  return {
    id: u.id,
    username: u.username,
    nom: u.nom,
    prenom: u.prenom,
    role: u.role as Role,
  };
}

// ====================================================
// PATIENTS
// ====================================================

export async function fetchPatients(): Promise<Patient[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .order("date_creation", { ascending: false });
  if (error) {
    console.error("fetchPatients:", error.message);
    return null;
  }
  return (data || []).map(mapPatient);
}

function mapPatient(r: any): Patient {
  return {
    id: r.id,
    nip: r.nip,
    id_sgh: r.id_sgh,
    nom: r.nom,
    prenom: r.prenom,
    date_naissance: r.date_naissance || "1990-01-01",
    sexe: r.sexe || "M",
    telephone: r.telephone || "",
    email: r.email || undefined,
    adresse: r.adresse || "",
    groupe_sanguin: r.groupe_sanguin || undefined,
    allergies: r.allergies || undefined,
    antecedents: r.antecedents || undefined,
    date_creation: r.date_creation,
  };
}

// ====================================================
// CONSTANTES
// ====================================================

export async function fetchConstantes(): Promise<Constante[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("constantes")
    .select("*")
    .order("date_mesure", { ascending: false })
    .limit(500);
  if (error) {
    console.error("fetchConstantes:", error.message);
    return null;
  }
  return (data || []).map(mapConstante);
}

function mapConstante(r: any): Constante {
  return {
    id: r.id,
    patient_id: r.patient_id,
    nip: r.nip || "",
    date: (r.date_mesure || "").replace("T", " ").slice(0, 16),
    tension_systole: r.tension_systole ?? 0,
    tension_diastole: r.tension_diastole ?? 0,
    pouls: r.pouls ?? 0,
    temperature: Number(r.temperature ?? 0),
    saturation_o2: r.saturation_o2 ?? 0,
    frequence_respiratoire: r.frequence_respiratoire ?? 0,
    poids: Number(r.poids ?? 0),
    taille: r.taille ?? 0,
    douleur_eva: r.douleur_eva ?? 0,
    glycémie: r.glycemie ? Number(r.glycemie) : undefined,
    note: r.note || undefined,
    saisie_par: r.saisie_par || "",
  };
}

export interface NouvelleConstante {
  patient_id: number;
  nip: string;
  tension_systole?: number;
  tension_diastole?: number;
  pouls?: number;
  temperature?: number;
  saturation_o2?: number;
  frequence_respiratoire?: number;
  poids?: number;
  taille?: number;
  douleur_eva?: number;
  glycemie?: number;
  note?: string;
  saisie_par: string;
}

/**
 * Insère une constante + détecte et crée automatiquement les alertes.
 * Les alertes insérées déclenchent le Realtime → notifications.
 */
export async function insertConstante(
  c: NouvelleConstante
): Promise<{ constante: Constante; alertes: number } | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("constantes")
    .insert({
      patient_id: c.patient_id,
      nip: c.nip,
      tension_systole: c.tension_systole,
      tension_diastole: c.tension_diastole,
      pouls: c.pouls,
      temperature: c.temperature,
      saturation_o2: c.saturation_o2,
      frequence_respiratoire: c.frequence_respiratoire,
      poids: c.poids,
      taille: c.taille,
      douleur_eva: c.douleur_eva,
      glycemie: c.glycemie,
      note: c.note,
      saisie_par: c.saisie_par,
    })
    .select()
    .single();

  if (error || !data) {
    console.error("insertConstante:", error?.message);
    return null;
  }

  // Détection automatique des alertes
  const alertesRows: any[] = [];
  for (const config of ALERTES_CONFIG) {
    const valeur = (c as any)[config.parametre];
    if (valeur === undefined || valeur === null || isNaN(valeur)) continue;
    if (valeur < config.min_normal || valeur > config.max_normal) {
      alertesRows.push({
        patient_id: c.patient_id,
        constante_id: data.id,
        parametre: config.parametre,
        valeur,
        seuil_min: config.min_normal,
        seuil_max: config.max_normal,
        unite: config.unite,
        message: config.message_alerte,
        niveau: config.niveau,
      });
    }
  }

  if (alertesRows.length > 0) {
    const { error: aErr } = await supabase.from("alertes").insert(alertesRows);
    if (aErr) console.error("insertAlertes:", aErr.message);
  }

  return { constante: mapConstante(data), alertes: alertesRows.length };
}

// ====================================================
// CONSULTATIONS
// ====================================================

export async function fetchConsultations(): Promise<Consultation[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("consultations")
    .select("*")
    .order("date_consultation", { ascending: false });
  if (error) {
    console.error("fetchConsultations:", error.message);
    return null;
  }
  return (data || []).map((r: any) => ({
    id: r.id,
    patient_id: r.patient_id,
    nip: r.nip || "",
    date: (r.date_consultation || "").replace("T", " ").slice(0, 19),
    medecin: r.medecin || "",
    motif: r.motif || "",
    diagnostic: r.diagnostic || "",
    prescription: r.prescription || "",
    prochain_rdv: r.prochain_rdv || undefined,
    observations: r.observations || undefined,
  }));
}

export async function insertConsultation(c: Omit<Consultation, "id" | "date">) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("consultations")
    .insert({
      patient_id: c.patient_id,
      nip: c.nip,
      medecin: c.medecin,
      motif: c.motif,
      diagnostic: c.diagnostic,
      prescription: c.prescription,
      prochain_rdv: c.prochain_rdv,
      observations: c.observations,
    })
    .select()
    .single();
  if (error) {
    console.error("insertConsultation:", error.message);
    return null;
  }
  return data;
}

// ====================================================
// ALERTES
// ====================================================

export async function fetchAlertes(): Promise<Alerte[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("alertes")
    .select("*, patients(nom, prenom, nip)")
    .order("date_creation", { ascending: false })
    .limit(100);
  if (error) {
    console.error("fetchAlertes:", error.message);
    return null;
  }
  return (data || []).map((r: any) => ({
    id: r.id,
    patient_id: r.patient_id,
    nip: r.patients?.nip || "",
    patient_nom: r.patients ? `${r.patients.nom} ${r.patients.prenom}` : "Patient inconnu",
    constante_id: r.constante_id,
    parametre: r.parametre,
    valeur: Number(r.valeur),
    seuil_min: Number(r.seuil_min),
    seuil_max: Number(r.seuil_max),
    unite: r.unite || "",
    message: r.message || "",
    niveau: r.niveau,
    date_creation: r.date_creation,
    traitee: r.traitee,
    traitee_par: r.traitee_par || undefined,
    salle: r.salle || undefined,
  }));
}

export async function traiterAlerteRemote(id: number, par: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from("alertes")
    .update({ traitee: true, traitee_par: par, date_traitement: new Date().toISOString() })
    .eq("id", id);
  if (error) console.error("traiterAlerte:", error.message);
  return !error;
}

// ====================================================
// STAFF (gestion des comptes)
// ====================================================

export interface StaffRow {
  id: number;
  username: string;
  nom: string;
  prenom: string;
  role: Role;
  actif: boolean;
  derniere_connexion?: string;
}

export async function fetchStaff(): Promise<StaffRow[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("staff")
    .select("id, username, nom, prenom, role, actif, derniere_connexion")
    .order("id");
  if (error) {
    console.error("fetchStaff:", error.message);
    return null;
  }
  return data as StaffRow[];
}

export async function createStaffRemote(
  username: string,
  password: string,
  nom: string,
  prenom: string,
  role: Role
): Promise<number | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("create_staff", {
    p_username: username,
    p_password: password,
    p_nom: nom,
    p_prenom: prenom,
    p_role: role,
  });
  if (error) {
    console.error("createStaff:", error.message);
    return null;
  }
  return data as number;
}

export async function toggleStaffActiveRemote(id: number): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.rpc("toggle_staff_active", { p_user_id: id });
  return !error;
}

export async function changePasswordRemote(id: number, newPassword: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.rpc("change_staff_password", {
    p_user_id: id,
    p_new_password: newPassword,
  });
  return !error;
}

export { isSupabaseConfigured };
