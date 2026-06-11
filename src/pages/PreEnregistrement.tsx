import { useState, useEffect } from "react"; // 1. Ajout de useEffect
import { UserPlus, Save, CheckCircle2, Loader2 } from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import type { PageId } from "../types";

export function PreEnregistrement({ onNavigate }: { onNavigate: (p: PageId) => void }) {
    const { user } = useAuth();
    const { preEnregistrements, refresh } = useData();
    const [form, setForm] = useState({
        nom: "", prenom: "", date_naissance: "", sexe: "M" as "M" | "F",
        telephone: "", adresse: "", motif: "", note_accueil: "",
    });
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<string | null>(null);

    // Écoute en temps réel des modifications de Supabase
    useEffect(() => {
        if (!isSupabaseConfigured || !supabase) return;

        // On s'abonne aux changements (UPDATE, INSERT, DELETE) sur la table des pré-enregistrements
        const channel = supabase
            .channel("realtime_pre_enregistrements")
            .on(
                "postgres_changes",
                {
                    event: "*", // Écoute tout : insertion, mise à jour par le script Python, ou suppression
                    schema: "public",
                    table: "pre_enregistrements"
                },
                async (payload) => {
                    // Dès qu'un changement est détecté (ex: statut modifié par Firebird), on force le rafraîchissement global
                    await refresh();
                }
            )
            .subscribe();

        // Nettoyage de l'abonnement quand la secrétaire change de page
        return () => {
            supabase.removeChannel(channel);
        };
    }, [refresh]);

    const enAttente = preEnregistrements.filter((p) => p.statut === "en_attente_enregistrement_paiement");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isSupabaseConfigured || !supabase) {
            setToast("⚠️ Supabase non configuré");
            return;
        }
        setSaving(true);

        const now = new Date();
        const pre_id = `PRE-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;

        const { error } = await supabase.from("pre_enregistrements").insert({
            pre_id,
            nom: form.nom,
            prenom: form.prenom,
            date_naissance: form.date_naissance || null,
            sexe: form.sexe,
            telephone: form.telephone || null,
            adresse: form.adresse || null,
            motif: form.motif || null,
            note_accueil: form.note_accueil || null,
            cree_par: user ? `${user.prenom} ${user.nom}` : "Secrétaire",
            statut: "en_attente_enregistrement_paiement",
        });

        if (error) {
            setToast("❌ Erreur : " + error.message);
        } else {
            setToast("✅ Patient pré-enregistré. En attente d'enregistrement SGH.");
            setForm({ nom: "", prenom: "", date_naissance: "", sexe: "M", telephone: "", adresse: "", motif: "", note_accueil: "" });
            await refresh();
        }
        setSaving(true); // Gardé à true selon votre logique, sinon setSaving(false)
        setTimeout(() => setToast(null), 4000);
    };

    return (
        <div className="p-6 space-y-5">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <UserPlus className="w-7 h-7 text-pink-600" />
                    Pré-enregistrement patient
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Étape 1 : la secrétaire crée un pré-dossier. Le patient ira ensuite au bureau des entrées pour enregistrement + paiement SGH.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Formulaire */}
                <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
                    <h2 className="font-bold text-slate-900 mb-2">Nouveau patient</h2>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Nom *</label>
                            <input required value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value.toUpperCase() })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Prénom *</label>
                            <input required value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Date de naissance</label>
                            <input type="date" value={form.date_naissance} onChange={(e) => setForm({ ...form, date_naissance: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Sexe</label>
                            <select value={form.sexe} onChange={(e) => setForm({ ...form, sexe: e.target.value as "M" | "F" })} className="w-full px-3 py-2 border rounded-lg text-sm">
                                <option value="M">Masculin</option>
                                <option value="F">Féminin</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Téléphone</label>
                            <input value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Adresse</label>
                            <input value={form.adresse} onChange={(e) => setForm({ ...form, adresse: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Motif de venue</label>
                        <input value={form.motif} onChange={(e) => setForm({ ...form, motif: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Ex: Consultation, fièvre, douleur..." />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Note d'accueil</label>
                        <textarea rows={2} value={form.note_accueil} onChange={(e) => setForm({ ...form, note_accueil: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-pink-600 hover:bg-pink-700 text-white py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Enregistrer le pré-dossier
                    </button>

                    {toast && (
                        <div className="bg-slate-100 border border-slate-200 rounded-lg p-3 text-sm text-slate-800 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {toast}
                        </div>
                    )}
                </form>

                {/* Liste en attente */}
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <h2 className="font-bold text-slate-900 mb-3">
                        En attente d'enregistrement SGH
                        <span className="ml-2 text-sm font-normal text-slate-500">({enAttente.length})</span>
                    </h2>

                    {enAttente.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 text-sm">Aucun pré-enregistrement en attente</div>
                    ) : (
                        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                            {enAttente.map((p) => (
                                <div key={p.id} className="border border-slate-200 rounded-lg p-3 hover:bg-slate-50">
                                    <div className="font-semibold text-slate-900 text-sm">{p.nom} {p.prenom}</div>
                                    <div className="text-xs text-slate-500 font-mono">{p.pre_id}</div>
                                    <div className="text-xs text-slate-500 mt-1">
                                        {p.telephone && `📞 ${p.telephone}`}
                                        {p.motif && ` · ${p.motif}`}
                                    </div>
                                    <div className="text-xs text-amber-700 mt-1 font-medium">⏳ En attente SGH</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}