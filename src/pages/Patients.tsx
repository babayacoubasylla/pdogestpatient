import { useState, useMemo } from "react";
import { Search, Plus, Phone, Calendar, User as UserIcon, Eye, Filter, Database } from "lucide-react";
import { calculerAge } from "../data/mockData";
import { useData } from "../context/DataContext";
import type { Patient, PageId } from "../types";

export function Patients({ onNavigate }: { onNavigate: (p: PageId, payload?: any) => void }) {
  const { patients, supabaseActive, loading } = useData();
  const [search, setSearch] = useState("");
  const [filtreSexe, setFiltreSexe] = useState<"all" | "M" | "F">("all");

  const filtered = useMemo(() => {
    return patients.filter((p) => {
      const q = search.toLowerCase();
      const matches =
        !q ||
        p.nom.toLowerCase().includes(q) ||
        p.prenom.toLowerCase().includes(q) ||
        p.nip.toLowerCase().includes(q) ||
        p.telephone.includes(q) ||
        p.id_sgh.toString().includes(q);
      const sexMatch = filtreSexe === "all" || p.sexe === filtreSexe;
      return matches && sexMatch;
    });
  }, [patients, search, filtreSexe]);

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            Patients
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 ${
                supabaseActive
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              <Database className="w-3 h-3" />
              {supabaseActive ? "Supabase connecté" : "Mode démo"}
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {loading ? "Chargement..." : `${patients.length} patients synchronisés depuis Firebird (SGH)`}
          </p>
        </div>
        <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm">
          <Plus className="w-4 h-4" />
          Nouveau patient (via SGH)
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap gap-3">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, prénom, NIP, ID SGH ou téléphone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filtreSexe}
            onChange={(e) => setFiltreSexe(e.target.value as any)}
            className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
          >
            <option value="all">Tous sexes</option>
            <option value="M">Hommes</option>
            <option value="F">Femmes</option>
          </select>
        </div>
      </div>

      {/* Grid patients */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
          Aucun patient trouvé
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <PatientCard key={p.id} patient={p} onClick={() => onNavigate("patient-detail", p.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function PatientCard({ patient, onClick }: { patient: Patient; onClick: () => void }) {
  const age = calculerAge(patient.date_naissance);
  const initiales = `${patient.prenom.charAt(0)}${patient.nom.charAt(0)}`;
  const color = patient.sexe === "F" ? "bg-pink-100 text-pink-700" : "bg-blue-100 text-blue-700";

  return (
    <button
      onClick={onClick}
      className="text-left bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:border-cyan-300 transition group"
    >
      <div className="flex items-start gap-3">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${color}`}>
          {initiales}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-slate-900 truncate">
            {patient.nom} {patient.prenom}
          </div>
          <div className="text-xs text-slate-500 font-mono">{patient.nip}</div>
        </div>
        <Eye className="w-4 h-4 text-slate-300 group-hover:text-cyan-500 transition" />
      </div>

      <div className="mt-4 space-y-2 text-sm">
        <div className="flex items-center gap-2 text-slate-600">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>
            {age} ans · {patient.sexe === "F" ? "Femme" : "Homme"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <Phone className="w-4 h-4 text-slate-400" />
          <span>{patient.telephone}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <UserIcon className="w-4 h-4 text-slate-400" />
          <span>ID SGH : {patient.id_sgh}</span>
        </div>
      </div>

      {patient.allergies && patient.allergies !== "Aucune connue" && (
        <div className="mt-3 flex flex-wrap gap-1">
          <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full">
            ⚠️ {patient.allergies}
          </span>
        </div>
      )}
      {patient.groupe_sanguin && (
        <div className="mt-2 flex gap-1">
          <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
            🩸 {patient.groupe_sanguin}
          </span>
        </div>
      )}
    </button>
  );
}
