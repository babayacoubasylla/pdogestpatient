import { useState, useEffect } from "react";
import { Calendar, Plus, Clock, User, Loader2, X, Check } from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import type { PageId } from "../types";

export function RendezVous({ onNavigate }: { onNavigate: (p: PageId, payload?: any) => void }) {
    const { user } = useAuth();
    const { patients } = useData();
    const [rdvs, setRdvs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form
    const [form, setForm] = useState({
        patient_id: "",
        date_rdv: new Date().toISOString().split("T")[0],
        heure_rdv: "09:00",
        medecin: user?.role === "medecin" ? `${user.prenom} ${user.nom}` : "",
        motif: "",
        type: "consultation",
    });

    useEffect(() => { load(); }, []);

    async function load() {
        if (!isSupabaseConfigured || !supabase) { setLoading(false); return; }
        const { data } = await supabase
            .from("rendez_vous")
            .select("*, patients(nom, prenom, nip)")
            .order("date_rdv", { ascending: true })
            .limit(100);
        if (data) setRdvs(data);
        setLoading(false);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!user || !supabase) return;
        setSaving(true);

        const patient = patients.find((p) => p.id === parseInt(form.patient_id));
        await supabase.from("rendez_vous").insert({
            patient_id: parseInt(form.patient_id),
            nip: patient?.nip,
            date_rdv: form.date_rdv,
            heure_rdv: form.heure_rdv,
            medecin: form.medecin,
            motif: form.motif,
            type: form.type,
            cree_par: `${user.prenom} ${user.nom}`,
        });

        setSaving(false);
        setShowForm(false);
        setForm({ ...form, motif: "", patient_id: "" });
        await load();
    }

    async function confirmerRdv(id: number) {
        await supabase.from("rendez_vous").update({ statut: "confirme" }).eq("id", id);
        await load();
    }

    async function annulerRdv(id: number) {
        await supabase.from("rendez_vous").update({ statut: "annule" }).eq("id", id);
        await load();
    }

    // Regrouper par jour
    const parJour: Record<string, any[]> = {};
    rdvs.forEach((r) => {
        if (!parJour[r.date_rdv]) parJour[r.date_rdv] = [];
        parJour[r.date_rdv].push(r);
    });

    return (
        <div className="p-6 space-y-5">
            <div className="flex flex-wrap justify-between items-start gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Calendar className="w-7 h-7 text-cyan-600" />
                        Rendez-vous
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Calendrier des consultations à venir</p>
                </div>
                <button onClick={() => setShowForm(true)} className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Nouveau RDV
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-cyan-600" /></div>
            ) : rdvs.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-xl border text-slate-500">Aucun RDV planifié</div>
            ) : (
                <div className="space-y-4">
                    {Object.entries(parJour).map(([jour, liste]) => (
                        <div key={jour} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                            <div className="bg-slate-50 px-5 py-2 border-b border-slate-200 font-semibold text-slate-700 text-sm">
                                {new Date(jour).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                                <span className="ml-2 text-xs text-slate-500">({liste.length} RDV)</span>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {liste.map((r) => (
                                    <div key={r.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                                        <div className="flex items-center gap-3">
                                            <div className="text-center bg-cyan-50 rounded-lg p-2 w-16">
                                                <div className="text-lg font-bold text-cyan-700">{r.heure_rdv}</div>
                                            </div>
                                            <div>
                                                <button onClick={() => r.patient_id && onNavigate("patient-detail", r.patient_id)} className="font-semibold text-slate-900 hover:text-cyan-600">
                                                    {r.patients?.nom} {r.patients?.prenom}
                                                </button>
                                                <div className="text-xs text-slate-500">{r.medecin} · {r.motif}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs px-2 py-1 rounded-full ${r.statut === "confirme" ? "bg-emerald-100 text-emerald-700" :
                                                    r.statut === "annule" ? "bg-red-100 text-red-700" :
                                                        "bg-amber-100 text-amber-700"
                                                }`}>{r.statut || "planifie"}</span>
                                            {r.statut !== "confirme" && (
                                                <button onClick={() => confirmerRdv(r.id)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded">
                                                    <Check className="w-4 h-4" />
                                                </button>
                                            )}
                                            {r.statut !== "annule" && (
                                                <button onClick={() => annulerRdv(r.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showForm && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
                        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-900">Nouveau RDV</h2>
                            <button onClick={() => setShowForm(false)} className="text-slate-400"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-5 space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Patient *</label>
                                <select required value={form.patient_id} onChange={(e) => setForm({ ...form, patient_id: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                                    <option value="">Sélectionner...</option>
                                    {patients.map((p) => <option key={p.id} value={p.id}>{p.nom} {p.prenom} ({p.nip})</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
                                    <input type="date" required value={form.date_rdv} onChange={(e) => setForm({ ...form, date_rdv: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Heure *</label>
                                    <input type="time" required value={form.heure_rdv} onChange={(e) => setForm({ ...form, heure_rdv: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Médecin</label>
                                <input value={form.medecin} onChange={(e) => setForm({ ...form, medecin: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Motif *</label>
                                <input required value={form.motif} onChange={(e) => setForm({ ...form, motif: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 border rounded-lg text-sm">Annuler</button>
                                <button type="submit" disabled={saving} className="flex-1 bg-cyan-600 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Créer le RDV"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}