import { useState } from "react";
import { Search, BookHeart, Loader2 } from "lucide-react";
import { useData } from "../context/DataContext";
import type { PageId } from "../types";

export function CarnetDigital({ onNavigate }: { onNavigate: (p: PageId, payload?: any) => void }) {
    const { patients, loading } = useData();
    const [search, setSearch] = useState("");

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-cyan-600" /></div>;

    const filtered = patients.filter((p) => {
        const q = search.toLowerCase();
        return !q || p.nom?.toLowerCase().includes(q) || p.prenom?.toLowerCase().includes(q) || p.nip?.toLowerCase().includes(q);
    });

    return (
        <div className="p-6 space-y-5">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <BookHeart className="w-7 h-7 text-pink-600" />
                    Carnets Digitaux Patients
                </h1>
                <p className="text-sm text-slate-500 mt-1">Cliquez sur un patient pour ouvrir/éditer son carnet de santé</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="text" placeholder="Rechercher un patient..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none" />
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-xl border text-slate-500">Aucun patient. Le carnet sera créé automatiquement à l'ouverture de chaque fiche patient.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((p) => (
                        <button key={p.id} onClick={() => onNavigate("patient-detail", p.id)} className="text-left bg-white p-5 rounded-xl border hover:shadow-lg hover:border-pink-300 transition">
                            <div className="font-bold text-slate-900">{p.nom} {p.prenom}</div>
                            <div className="text-xs text-slate-500 font-mono">{p.nip || "—"}</div>
                            {p.allergies && <div className="mt-2 text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full inline-block">⚠️ {p.allergies}</div>}
                            {p.antecedents && <div className="mt-1 text-xs text-slate-600 line-clamp-2">📋 {p.antecedents}</div>}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}