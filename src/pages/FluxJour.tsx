import { useState, useEffect } from "react";
import { ClipboardList, Loader2, User } from "lucide-react";
import { useData } from "../context/DataContext";
import { formatRelativeDate } from "../data/mockData";
import type { PageId } from "../types";

export function FluxJour({ onNavigate }: { onNavigate: (p: PageId, payload?: any) => void }) {
    const { parcours, preEnregistrements, loading } = useData();

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-cyan-600" /></div>;

    const today = new Date().toISOString().split("T")[0];
    const parcoursToday = parcours.filter((p) => p.date_journee === today);
    const preToday = preEnregistrements.filter((p) => p.date_creation?.startsWith(today));

    const cols = [
        { id: "pre", title: "Pré-enregistrés (secrétaire)", color: "bg-pink-100 border-pink-300", items: preToday, statut: null },
        { id: "attente_const", title: "En attente constantes", color: "bg-amber-100 border-amber-300", items: parcoursToday.filter((p) => p.statut === "en_attente_constantes"), statut: "en_attente_constantes" },
        { id: "attente_med", title: "En attente médecin", color: "bg-cyan-100 border-cyan-300", items: parcoursToday.filter((p) => p.statut === "en_attente_medecin" || p.statut === "constantes_terminees"), statut: "en_attente_medecin" },
        { id: "termine", title: "Terminés", color: "bg-emerald-100 border-emerald-300", items: parcoursToday.filter((p) => p.statut === "termine"), statut: "termine" },
    ];

    return (
        <div className="p-6 space-y-5">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <ClipboardList className="w-7 h-7 text-cyan-600" />
                    Flux du jour
                </h1>
                <p className="text-sm text-slate-500 mt-1">{new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {cols.map((col) => (
                    <div key={col.id} className={`rounded-xl border-2 ${col.color} p-4`}>
                        <h3 className="font-bold text-slate-900 mb-3 flex items-center justify-between">
                            <span className="text-sm">{col.title}</span>
                            <span className="text-xs bg-white px-2 py-0.5 rounded-full">{col.items.length}</span>
                        </h3>
                        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                            {col.items.length === 0 ? (
                                <div className="text-xs text-slate-500 italic text-center py-4">Aucun patient</div>
                            ) : (
                                col.items.map((item: any) => (
                                    <button
                                        key={item.id}
                                        onClick={() => item.patient_id && onNavigate("patient-detail", item.patient_id)}
                                        className="w-full text-left bg-white p-3 rounded-lg hover:shadow transition"
                                    >
                                        <div className="font-semibold text-sm text-slate-900">
                                            {item.patients?.nom || item.nom} {item.patients?.prenom || item.prenom}
                                        </div>
                                        <div className="text-xs text-slate-500 font-mono mt-0.5">
                                            {item.nip || item.pre_id}
                                        </div>
                                        <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                            <User className="w-3 h-3" /> {item.heure_pre_enregistrement || item.date_creation ? formatRelativeDate(item.heure_pre_enregistrement || item.date_creation) : ""}
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}