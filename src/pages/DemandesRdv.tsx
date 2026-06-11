import { useState, useEffect } from "react";
import { Inbox, CheckCircle2, X, Clock, Loader2, MessageSquare, Eye } from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { formatRelativeDate } from "../data/mockData";
import type { PageId } from "../types";

export function DemandesRdv({ onNavigate }: { onNavigate: (p: PageId, payload?: any) => void }) {
    const { user } = useAuth();
    const [demandes, setDemandes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtre, setFiltre] = useState<"toutes" | "nouvelle" | "confirmee" | "rejetee">("nouvelle");
    const [selected, setSelected] = useState<any>(null);
    const [commentaire, setCommentaire] = useState("");

    useEffect(() => { load(); }, []);

    async function load() {
        if (!isSupabaseConfigured || !supabase) { setLoading(false); return; }
        const { data } = await supabase
            .from("demandes_rdv")
            .select("*, patients(nom, prenom, nip, telephone)")
            .order("date_demande", { ascending: false })
            .limit(100);
        if (data) setDemandes(data);
        setLoading(false);
    }

    async function traiter(id: number, statut: string) {
        if (!user || !supabase) return;
        await supabase.from("demandes_rdv").update({
            statut,
            traitee_par: `${user.prenom} ${user.nom}`,
            date_traitement: new Date().toISOString(),
            commentaire_admin: commentaire,
        }).eq("id", id);

        // Si confirmée, créer le RDV automatiquement
        if (statut === "confirmee") {
            const demande = demandes.find((d) => d.id === id);
            if (demande?.date_souhaitee) {
                await supabase.from("rendez_vous").insert({
                    patient_id: demande.patient_id,
                    nip: demande.nip,
                    date_rdv: demande.date_souhaitee,
                    heure_rdv: "09:00",
                    medecin: user.role === "medecin" ? `${user.prenom} ${user.nom}` : "À affecter",
                    motif: demande.motif,
                    type: demande.service_demande || "consultation",
                    statut: "planifie",
                    cree_par: `${user.prenom} ${user.nom}`,
                });
            }
        }

        // Audit
        await supabase.from("audit_logs").insert({
            user_role: user.role,
            user_name: `${user.prenom} ${user.nom}`,
            action: `demande_rdv_${statut}`,
            cible_type: "demande_rdv",
            cible_id: id.toString(),
            details: `Demande ${statut} : ${commentaire || "sans commentaire"}`,
        });

        setSelected(null);
        setCommentaire("");
        await load();
    }

    const filtered = demandes.filter((d) => {
        if (filtre === "toutes") return true;
        return d.statut === filtre;
    });

    const counts = {
        nouvelle: demandes.filter((d) => d.statut === "nouvelle").length,
        confirmee: demandes.filter((d) => d.statut === "confirmee").length,
        rejetee: demandes.filter((d) => d.statut === "rejetee").length,
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-cyan-600" /></div>;

    return (
        <div className="p-6 space-y-5">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Inbox className="w-7 h-7 text-cyan-600" />
                    Demandes de rendez-vous patients
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Les patients peuvent demander un RDV via leur QR code. La secrétaire traite, le médecin valide.
                </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-3 flex flex-wrap gap-2">
                <FilterBtn active={filtre === "nouvelle"} onClick={() => setFiltre("nouvelle")}>
                    🔔 Nouvelles ({counts.nouvelle})
                </FilterBtn>
                <FilterBtn active={filtre === "confirmee"} onClick={() => setFiltre("confirmee")}>
                    ✅ Confirmées ({counts.confirmee})
                </FilterBtn>
                <FilterBtn active={filtre === "rejetee"} onClick={() => setFiltre("rejetee")}>
                    ❌ Rejetées ({counts.rejetee})
                </FilterBtn>
                <FilterBtn active={filtre === "toutes"} onClick={() => setFiltre("toutes")}>
                    📋 Toutes
                </FilterBtn>
            </div>

            {filtered.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
                    {filtre === "nouvelle" ? "✅ Aucune nouvelle demande" : "Aucune demande dans cette catégorie"}
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((d) => (
                        <div key={d.id} className={`bg-white rounded-xl border-l-4 shadow-sm p-4 ${d.statut === "nouvelle" ? "border-amber-500" :
                                d.statut === "confirmee" ? "border-emerald-500" :
                                    d.statut === "rejetee" ? "border-red-500" : "border-slate-300"
                            }`}>
                            <div className="flex justify-between items-start gap-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <button
                                            onClick={() => d.patient_id && onNavigate("patient-detail", d.patient_id)}
                                            className="font-bold text-slate-900 hover:text-cyan-600"
                                        >
                                            {d.patients?.nom} {d.patients?.prenom}
                                        </button>
                                        <span className="text-xs text-slate-500 font-mono">{d.nip}</span>
                                        <span className="text-xs bg-slate-100 px-2 py-0.5 rounded">{d.service_demande}</span>
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                                        <Clock className="w-3 h-3" />
                                        Demandé {formatRelativeDate(d.date_demande)}
                                        {d.date_souhaitee && <span> · 📅 Souhaité : {new Date(d.date_souhaitee).toLocaleDateString("fr-FR")}</span>}
                                    </div>
                                    <div className="text-sm text-slate-700 mt-2 bg-slate-50 p-2 rounded">
                                        <MessageSquare className="w-3.5 h-3.5 inline mr-1" /> {d.motif}
                                    </div>
                                    {d.commentaire_admin && (
                                        <div className="text-xs text-slate-500 mt-2 italic bg-cyan-50 p-2 rounded">
                                            💬 {d.traitee_par} : {d.commentaire_admin}
                                        </div>
                                    )}
                                </div>

                                {d.statut === "nouvelle" ? (
                                    <button
                                        onClick={() => setSelected(d)}
                                        className="bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1"
                                    >
                                        <Eye className="w-4 h-4" /> Traiter
                                    </button>
                                ) : (
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${d.statut === "confirmee" ? "bg-emerald-100 text-emerald-700" :
                                            d.statut === "rejetee" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700"
                                        }`}>
                                        {d.statut}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de traitement */}
            {selected && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5">
                        <h3 className="text-lg font-bold text-slate-900 mb-3">Traiter la demande</h3>
                        <div className="bg-slate-50 p-3 rounded-lg mb-4 text-sm">
                            <div className="font-semibold">{selected.patients?.nom} {selected.patients?.prenom}</div>
                            <div className="text-slate-600 text-xs">{selected.motif}</div>
                        </div>
                        <textarea
                            value={commentaire}
                            onChange={(e) => setCommentaire(e.target.value)}
                            placeholder="Commentaire (optionnel)..."
                            rows={3}
                            className="w-full px-3 py-2 border rounded-lg text-sm mb-4"
                        />
                        <div className="flex gap-2">
                            <button onClick={() => setSelected(null)} className="flex-1 py-2 border rounded-lg text-sm">Annuler</button>
                            <button onClick={() => traiter(selected.id, "rejetee")} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm">Refuser</button>
                            <button onClick={() => traiter(selected.id, "confirmee")} className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1">
                                <CheckCircle2 className="w-4 h-4" /> Confirmer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function FilterBtn({ active, onClick, children }: any) {
    return (
        <button
            onClick={onClick}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${active ? "bg-cyan-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
        >
            {children}
        </button>
    );
}