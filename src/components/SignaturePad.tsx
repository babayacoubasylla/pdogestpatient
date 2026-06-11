import { useRef, useState, useEffect } from "react";
import SignaturePad from "signature_pad";
import { Eraser, Save, Loader2, CheckCircle2, X } from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

interface SignaturePadProps {
    patientId: number;
    nip: string;
    typeSignature: "patient" | "medecin" | "infirmier" | "tuteur";
    contexte: string;
    contexteId?: number;
    onSigned?: () => void;
}

export function SignaturePadComponent({ patientId, nip, typeSignature, contexte, contexteId, onSigned }: SignaturePadProps) {
    const { user } = useAuth();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sigPad = useRef<SignaturePad | null>(null);
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [done, setDone] = useState(false);

    useEffect(() => {
        if (!open) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        sigPad.current = new SignaturePad(canvas, { penColor: "#0e7490" });
        const resize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = 200;
        };
        resize();
        window.addEventListener("resize", resize);
        return () => window.removeEventListener("resize", resize);
    }, [open]);

    async function save() {
        if (!sigPad.current || sigPad.current.isEmpty() || !user) return;
        setSaving(true);
        const dataUrl = sigPad.current.toDataURL("image/png");

        if (supabase) {
            await supabase.from("signatures").insert({
                patient_id: patientId,
                nip,
                type_signature: typeSignature,
                contexte,
                contexte_id: contexteId,
                signature_data: dataUrl,
                signe_par: `${user.prenom} ${user.nom}`,
            });
            await supabase.from("audit_logs").insert({
                user_role: user.role,
                user_name: `${user.prenom} ${user.nom}`,
                action: "signature_electronique",
                cible_type: contexte,
                cible_id: contexteId?.toString() || "—",
                details: `Signature ${typeSignature} apposée pour patient ${nip}`,
            });
        }

        setSaving(false);
        setDone(true);
        setTimeout(() => { setDone(false); setOpen(false); onSigned?.(); }, 1500);
    }

    return (
        <>
            <button onClick={() => setOpen(true)} className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition">
                ✍️ Signature électronique
            </button>

            {open && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => !saving && setOpen(false)}>
                    <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
                        {done ? (
                            <div className="p-12 text-center">
                                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-3" />
                                <h3 className="text-xl font-bold">Signature enregistrée ✓</h3>
                                <p className="text-sm text-slate-500 mt-2">Stockée et tracée dans l'audit.</p>
                            </div>
                        ) : (
                            <>
                                <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-slate-900">Signature {typeSignature}</h3>
                                    <button onClick={() => setOpen(false)} className="text-slate-400"><X className="w-5 h-5" /></button>
                                </div>
                                <div className="p-5">
                                    <p className="text-sm text-slate-600 mb-3">Signez dans le cadre ci-dessous :</p>
                                    <div className="border-2 border-dashed border-slate-300 rounded-lg overflow-hidden bg-slate-50">
                                        <canvas ref={canvasRef} className="w-full block touch-none" style={{ height: 200 }} />
                                    </div>
                                    <div className="mt-3 text-xs text-slate-500 flex items-center justify-between">
                                        <span>Contexte : <strong>{contexte}</strong></span>
                                        <span>NIP : <strong>{nip}</strong></span>
                                    </div>
                                </div>
                                <div className="flex gap-2 p-5 border-t border-slate-200">
                                    <button onClick={() => sigPad.current?.clear()} className="px-4 py-2 border border-slate-200 rounded-lg text-sm flex items-center gap-2 hover:bg-slate-50">
                                        <Eraser className="w-4 h-4" /> Effacer
                                    </button>
                                    <button onClick={save} disabled={saving} className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50">
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Valider la signature
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