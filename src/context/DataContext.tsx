import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import type {
  Patient, Alerte, Constante, Consultation,
  ParcoursPatient, PreEnregistrement
} from "../types";

interface DataContextType {
  patients: Patient[];
  alertes: Alerte[];
  constantes: Constante[];
  consultations: Consultation[];
  parcours: ParcoursPatient[];
  preEnregistrements: PreEnregistrement[];
  loading: boolean;
  refresh: () => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [alertes, setAlertes] = useState<Alerte[]>([]);
  const [constantes, setConstantes] = useState<Constante[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [parcours, setParcours] = useState<ParcoursPatient[]>([]);
  const [preEnregistrements, setPreEnregistrements] = useState<PreEnregistrement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }
    try {
      const [p, a, c, co, pa, pr] = await Promise.all([
        supabase.from("patients").select("*").order("date_creation", { ascending: false }).limit(200),
        supabase.from("alertes").select("*, patients(nom, prenom, nip)").order("date_creation", { ascending: false }).limit(200),
        supabase.from("constantes").select("*").order("date_mesure", { ascending: false }).limit(200),
        supabase.from("consultations").select("*, patients(nom, prenom)").order("date_consultation", { ascending: false }).limit(200),
        supabase.from("parcours_patient").select("*, patients(nom, prenom, nip)").order("date_journee", { ascending: false }).limit(200),
        supabase.from("pre_enregistrements").select("*").order("date_creation", { ascending: false }).limit(200),
      ]);
      if (p.data) setPatients(p.data as Patient[]);
      if (a.data) setAlertes(a.data as Alerte[]);
      if (c.data) setConstantes(c.data as Constante[]);
      if (co.data) setConsultations(co.data as Consultation[]);
      if (pa.data) setParcours(pa.data as ParcoursPatient[]);
      if (pr.data) setPreEnregistrements(pr.data as PreEnregistrement[]);
    } catch (e) {
      console.error("DataContext fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return (
    <DataContext.Provider
      value={{
        patients, alertes, constantes, consultations,
        parcours, preEnregistrements, loading,
        refresh: fetchAll,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData doit être utilisé dans DataProvider");
  return ctx;
}