import { useState } from "react";
import { Stamp, CheckCircle2, Loader2 } from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

interface TamponCliniqueProps {
    patientId: number;
    nip: string;
    contexte: "consultation" | "constantes" | "ordonnance" | "autre";
    contexteId?: number;
    onTamponne?: () => void;
}

export function TamponClinique({ patientId, nip, contexte, contexteId, onTamponne }: TamponCliniqueProps) {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    async function apposerTampon() {
        if (!user || !supabase) return;
        setLoading(true);

        // 1. Insérer dans table tampons
        await supabase.from("tampons_clinique").insert({
            patient_id: patientId,
            nip,
            contexte,
            contexte_id: contexteId,
            appose_par: `${user.prenom} ${user.nom}`,
            appose_par_role: user.role,
            date_tampon: new Date().toISOString(),
        });

        // 2. Logger dans audit (traçabilité totale)
        await supabase.from("audit_logs").insert({
            user_role: user.role,
            user_name: `${user.prenom} ${user.nom}`,
            action: "tampon_clinique",
            cible_type: contexte,
            cible_id: contexteId?.toString() || "—",
            details: `Tampon apposé sur ${contexte} pour patient NIP ${nip}`,
        });

        setLoading(false);
        setDone(true);
        setTimeout(() => { setDone(false); setOpen(false); onTamponne?.(); }, 1500);
    }

    return (
        <>
            <button onClick={() => setOpen(true)} className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition">
                <Stamp className="w-4 h-4" /> Apposer le tampon
            </button>

            {open && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => !loading && setOpen(false)}>
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                        {done ? (
                            <div className="text-center py-8">
                                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-3" />
                                <h3 className="text-xl font-bold text-slate-900">Tampon apposé ✓</h3>
                                <p className="text-sm text-slate-500 mt-2">L'opération est tracée dans l'audit.</p>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-lg font-bold text-slate-900 mb-4">Confirmation du tampon</h3>

                                {/* Aperçu du tampon */}
                                <div className="border-4 border-double border-amber-700 rounded-lg p-4 text-center bg-amber-50 mb-4 transform -rotate-2">
                                    <div className="text-xs text-amber-700 uppercase tracking-wider">Paracliniques des Oliviers</div>
                                    <div className="text-2xl font-bold text-amber-900 my-1">TAMPON OFFICIEL</div>
                                    <div className="text-xs text-amber-800">Abidjan · Côte d'Ivoire</div>
                                    <div className="text-xs font-mono text-amber-900 mt-1">{nip}</div>
                                </div>

                                <div className="text-sm text-slate-700 space-y-1 mb-4">
                                    <div>📋 Contexte : <strong className="capitalize">{contexte}</strong></div>
                                    <div>👤 Apposé par : <strong>{user?.prenom} {user?.nom}</strong></div>
                                    <div>🔖 Rôle : <strong className="capitalize">{user?.role}</strong></div>
                                    <div>📅 Date : {new Date().toLocaleString("fr-FR")}</div>
                                </div>

                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 mb-4">
                                    ⚠️ Cette action sera enregistrée dans l'audit et ne peut pas être annulée.
                                </div>

                                <div className="flex gap-2">
                                    <button onClick={() => setOpen(false)} disabled={loading} className="flex-1 py-2 border border-slate-200 rounded-lg text-sm">Annuler</button>
                                    <button onClick={apposerTampon} disabled={loading} className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50">
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Stamp className="w-4 h-4" />}
                                        Confirmer le tampon
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}