/**
 * DataContext — source unique de données pour toute l'application.
 * - Si Supabase est configuré (.env) : charge les vraies données + temps réel
 * - Sinon : utilise les données de démonstration (mockData)
 */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { Patient, Constante, Consultation, Alerte } from "../types";
import {
  PATIENTS as MOCK_PATIENTS,
  CONSTANTES as MOCK_CONSTANTES,
  CONSULTATIONS as MOCK_CONSULTATIONS,
  ALERTES as MOCK_ALERTES,
} from "../data/mockData";
import {
  fetchPatients,
  fetchConstantes,
  fetchConsultations,
  fetchAlertes,
  insertConstante,
  traiterAlerteRemote,
  isSupabaseConfigured,
  type NouvelleConstante,
} from "../services/api";
import { supabase } from "../lib/supabase";

interface DataContextType {
  patients: Patient[];
  constantes: Constante[];
  consultations: Consultation[];
  alertes: Alerte[];
  loading: boolean;
  supabaseActive: boolean;
  refresh: () => Promise<void>;
  ajouterConstante: (c: NouvelleConstante) => Promise<{ ok: boolean; nbAlertes: number }>;
  traiterAlerte: (id: number, par: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const [constantes, setConstantes] = useState<Constante[]>(MOCK_CONSTANTES);
  const [consultations, setConsultations] = useState<Consultation[]>(MOCK_CONSULTATIONS);
  const [alertes, setAlertes] = useState<Alerte[]>(MOCK_ALERTES);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    setLoading(true);
    const [p, c, cons, a] = await Promise.all([
      fetchPatients(),
      fetchConstantes(),
      fetchConsultations(),
      fetchAlertes(),
    ]);
    // Quand Supabase est connecté, on affiche TOUJOURS ses données
    // (même vides) — les données de démo ne servent qu'en mode hors-Supabase.
    if (p) setPatients(p);
    if (c) setConstantes(c);
    if (cons) setConsultations(cons);
    if (a) setAlertes(a);
    setLoading(false);
  }, []);

  // Chargement initial depuis Supabase
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Temps réel : rafraîchit quand un patient / constante / alerte change
  useEffect(() => {
    if (!supabase) return;
    const sb = supabase;
    const channel = sb
      .channel("data-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "patients" },
        () => refresh()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "constantes" },
        () => refresh()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "alertes" },
        () => refresh()
      )
      .subscribe();
    return () => {
      sb.removeChannel(channel);
    };
  }, [refresh]);

  const ajouterConstante = useCallback(
    async (c: NouvelleConstante): Promise<{ ok: boolean; nbAlertes: number }> => {
      if (isSupabaseConfigured) {
        const res = await insertConstante(c);
        if (res) {
          await refresh();
          return { ok: true, nbAlertes: res.alertes };
        }
        return { ok: false, nbAlertes: 0 };
      }
      // Mode démo : ajout local
      const newConst: Constante = {
        id: Date.now(),
        patient_id: c.patient_id,
        nip: c.nip,
        date: new Date().toISOString().slice(0, 16).replace("T", " "),
        tension_systole: c.tension_systole ?? 0,
        tension_diastole: c.tension_diastole ?? 0,
        pouls: c.pouls ?? 0,
        temperature: c.temperature ?? 0,
        saturation_o2: c.saturation_o2 ?? 0,
        frequence_respiratoire: c.frequence_respiratoire ?? 0,
        poids: c.poids ?? 0,
        taille: c.taille ?? 0,
        douleur_eva: c.douleur_eva ?? 0,
        note: c.note,
        saisie_par: c.saisie_par,
      };
      setConstantes((prev) => [newConst, ...prev]);
      return { ok: true, nbAlertes: 0 };
    },
    [refresh]
  );

  const traiterAlerte = useCallback(
    async (id: number, par: string) => {
      setAlertes((prev) =>
        prev.map((a) => (a.id === id ? { ...a, traitee: true, traitee_par: par } : a))
      );
      if (isSupabaseConfigured) {
        await traiterAlerteRemote(id, par);
      }
    },
    []
  );

  return (
    <DataContext.Provider
      value={{
        patients,
        constantes,
        consultations,
        alertes,
        loading,
        supabaseActive: isSupabaseConfigured,
        refresh,
        ajouterConstante,
        traiterAlerte,
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
