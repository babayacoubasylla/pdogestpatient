import { useState } from "react";
import { Search, Loader2, Phone, User } from "lucide-react";
import { useData } from "../context/DataContext";
import { calculerAge } from "../data/mockData";
import type { PageId } from "../types";

export function Patients({ onNavigate }: { onNavigate: (p: PageId, payload?: any) => void }) {
  const { patients, loading } = useData();
  const [search, setSearch] = useState("");

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-cyan-600" /></div>;

  const filtered = patients.filter((p) => {
    const q = search.toLowerCase();
    return !q || p.nom?.toLowerCase().includes(q) || p.prenom?.toLowerCase().includes(q) || p.nip?.toLowerCase().includes(q) || p.telephone?.includes(q);
  });

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Patients</h1>
        <p className="text-sm text-slate-500 mt-1">{patients.length} patient(s) dans la base</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, NIP ou téléphone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
          {patients.length === 0 ? "Aucun patient. Les patients apparaîtront après synchronisation SGH." : "Aucun résultat"}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => {
            const age = p.date_naissance ? calculerAge(p.date_naissance) : 0;
            const initiales = `${p.prenom?.charAt(0) || ""}${p.nom?.charAt(0) || ""}`;
            const color = p.sexe === "F" ? "bg-pink-100 text-pink-700" : "bg-blue-100 text-blue-700";
            return (
              <button key={p.id} onClick={() => onNavigate("patient-detail", p.id)} className="text-left bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:border-cyan-300 transition group">
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${color}`}>{initiales}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 truncate">{p.nom} {p.prenom}</div>
                    <div className="text-xs text-slate-500 font-mono">{p.nip || "—"}</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1 text-sm text-slate-600">
                  <div className="flex items-center gap-2"><User className="w-3.5 h-3.5 text-slate-400" />{age} ans · {p.sexe === "F" ? "F" : "H"}</div>
                  {p.telephone && <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-400" />{p.telephone}</div>}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}