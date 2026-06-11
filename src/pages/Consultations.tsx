import { useState } from "react";
import { FileText, Clock, Download, Search, User as UserIcon } from "lucide-react";
import { useData } from "../context/DataContext";
import type { PageId } from "../types";

export function Consultations({ onNavigate }: { onNavigate: (p: PageId, payload?: any) => void }) {
  const { consultations, patients } = useData();
  const [search, setSearch] = useState("");

  const filtered = consultations.filter((c) => {
    if (!search) return true;
    const patient = patients.find((p) => p.nip === c.nip);
    const q = search.toLowerCase();
    return (
      c.medecin.toLowerCase().includes(q) ||
      c.motif.toLowerCase().includes(q) ||
      c.diagnostic.toLowerCase().includes(q) ||
      patient?.nom.toLowerCase().includes(q) ||
      patient?.prenom.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-wrap justify-between items-start gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Consultations</h1>
          <p className="text-sm text-slate-500 mt-1">
            Historique et comptes rendus médicaux · Export PDF disponible
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par patient, médecin, diagnostic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((c) => {
          const patient = patients.find((p) => p.nip === c.nip);
          return (
            <div
              key={c.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition"
            >
              <div className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-11 h-11 bg-cyan-100 text-cyan-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => patient && onNavigate("patient-detail", patient.id)}
                        className="font-bold text-slate-900 hover:text-cyan-600 transition"
                      >
                        {patient?.nom} {patient?.prenom}
                      </button>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">{c.nip}</div>

                      <div className="mt-3 text-sm space-y-1.5">
                        <div>
                          <span className="text-slate-500 font-medium">Motif : </span>
                          <span className="text-slate-700">{c.motif}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-medium">Diagnostic : </span>
                          <span className="text-slate-900 font-semibold">{c.diagnostic}</span>
                        </div>
                        {c.prescription && (
                          <div>
                            <span className="text-slate-500 font-medium">Prescription : </span>
                            <pre className="text-slate-700 whitespace-pre-wrap font-sans mt-1 bg-slate-50 p-2 rounded text-xs">
                              {c.prescription}
                            </pre>
                          </div>
                        )}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(c.date.replace(" ", "T")).toLocaleString("fr-FR")}
                        </span>
                        <span className="flex items-center gap-1">
                          <UserIcon className="w-3 h-3" />
                          {c.medecin}
                        </span>
                        {c.prochain_rdv && (
                          <span className="text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full">
                            Prochain RDV : {new Date(c.prochain_rdv).toLocaleDateString("fr-FR")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5">
                      <Download className="w-4 h-4" />
                      PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
            Aucune consultation trouvée
          </div>
        )}
      </div>
    </div>
  );
}
