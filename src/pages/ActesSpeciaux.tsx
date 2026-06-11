import { useState, useEffect } from "react";
import { FileCheck, Camera, Upload, CheckCircle2, Loader2, X, Download, Search, FlaskConical, ScanLine, FileText, Filter } from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import type { PageId } from "../types";

type TypeActe = "retrait_labo" | "retrait_radio" | "retrait_resultat" | "autre";

interface ActeSpecial {
    id: number;
    patient_id: number;
    nip?: string;
    type_acte: TypeActe;
    description: string;
    photo_url?: string;
    signature?: string;
    effectue_par: string;
    date_acte: string;
    patients?: { nom: string; prenom: string; nip: string };
}

const TYPES_ACTES: { value: TypeActe; label: string; icon: any; color: string }[] = [
    { value: "retrait_labo", label: "Retrait Labo", icon: FlaskConical, color: "bg-emerald-100 text-emerald-700" },
    { value: "retrait_radio", label: "Retrait Radio", icon: ScanLine, color: "bg-purple-100 text-purple-700" },
    { value: "retrait_resultat", label: "Retrait Résultat", icon: FileText, color: "bg-cyan-100 text-cyan-700" },
    { value: "autre", label: "Autre acte", icon: FileCheck, color: "bg-slate-100 text-slate-700" },
];

export function ActesSpeciaux({ onNavigate }: { onNavigate: (p: PageId, payload?: any) => void }) {
    const { user } = useAuth();
    const { patients } = useData();
    const [actes, setActes] = useState<ActeSpecial[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filtreType, setFiltreType] = useState<"all" | TypeActe>("all");

    // Modal
    const [showForm, setShowForm] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [typeActe, setTypeActe] = useState<TypeActe>("retrait_labo");
    const [description, setDescription] = useState("");
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => { load(); }, []);

    async function load() {
        if (!isSupabaseConfigured || !supabase) { setLoading(false); return; }
        const { data } = await supabase
            .from("actes_speciaux")
            .select("*, patients(nom, prenom, nip)")
            .order("date_acte", { ascending: false })
            .limit(200);
        if (data) setActes(data as any[]);
        setLoading(false);
    }

    function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            setPhotoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setPhotoPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedPatient || !user || !supabase) return;
        setSaving(true);

        // Upload photo si présente
        let photoUrl = null;
        if (photoFile) {
            const fileName = `${selectedPatient.nip}_${Date.now()}.${photoFile.name.split(".").pop()}`;
            const { data: upload } = await supabase.storage
                .from("actes-speciaux")
                .upload(fileName, photoFile);
            if (upload) {
                const { data: url } = supabase.storage.from("actes-speciaux").getPublicUrl(fileName);
                photoUrl = url.publicUrl;
            }
        }

        const { data, error } = await supabase.from("actes_speciaux").insert({
            patient_id: selectedPatient.id,
            nip: selectedPatient.nip,
            type_acte: typeActe,
            description,
            photo_url: photoUrl,
            effectue_par: `${user.prenom} ${user.nom}`,
        }).select("*, patients(nom, prenom, nip)").single();

        if (data && !error) {
            setActes([data as any, ...actes]);

            // Log d'audit
            await supabase.from("audit_logs").insert({
                user_role: user.role,
                user_name: `${user.prenom} ${user.nom}`,
                action: "acte_special",
                cible_type: "patient",
                cible_id: selectedPatient.id.toString(),
                details: `${TYPES_ACTES.find((t) => t.value === typeActe)?.label} - ${description}`,
            });

            // Reset
            setShowForm(false);
            setSelectedPatient(null);
            setDescription("");
            setPhotoFile(null);
            setPhotoPreview(null);
        }
        setSaving(false);
    }

    async function exportActes() {
        if (!actes.length) return;
        // Export CSV
        const header = "Date,NIP,Patient,Type,Description,Effectué par\n";
        const rows = actes.map((a) =>
            `${new Date(a.date_acte).toLocaleString("fr-FR")},${a.nip || ""},"${a.patients?.nom || ""} ${a.patients?.prenom || ""}","${TYPES_ACTES.find((t) => t.value === a.type_acte)?.label}","${(a.description || "").replace(/"/g, "'")}","${a.effectue_par}"`
        ).join("\n");
        const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `actes-speciaux-${new Date().toISOString().split("T")[0]}.csv`;
        link.click();
    }

    const filtered = actes.filter((a) => {
        const q = search.toLowerCase();
        const matchSearch = !q || a.patients?.nom.toLowerCase().includes(q) || a.patients?.prenom.toLowerCase().includes(q) || a.nip?.toLowerCase().includes(q) || a.description.toLowerCase().includes(q);
        const matchType = filtreType === "all" || a.type_acte === filtreType;
        return matchSearch && matchType;
    });

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-cyan-600" /></div>;

    return (
        <div className="p-6 space-y-5">
            <div className="flex flex-wrap justify-between items-start gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <FileCheck className="w-7 h-7 text-emerald-600" />
                        Actes spéciaux (sans constantes)
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Retrait labo, radio, résultats, signatures et autres actes administratifs
                    </p>
                </div>
                <div className="flex gap-2">
                    <button onClick={exportActes} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                        <Download className="w-4 h-4" /> Exporter CSV
                    </button>
                    <button onClick={() => setShowForm(true)} className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                        <Camera className="w-4 h-4" /> Nouvel acte
                    </button>
                </div>
            </div>

            {/* Filtres */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap gap-3">
                <div className="flex-1 min-w-[240px] relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="text" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none" />
                </div>
                <select value={filtreType} onChange={(e) => setFiltreType(e.target.value as any)} className="px-3 py-2.5 border rounded-lg text-sm">
                    <option value="all">Tous les types</option>
                    {TYPES_ACTES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
            </div>

            {/* Liste */}
            {filtered.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
                    Aucun acte spécial enregistré. Cliquez sur "Nouvel acte" pour commencer.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filtered.map((a) => {
                        const typeInfo = TYPES_ACTES.find((t) => t.value === a.type_acte);
                        const Icon = typeInfo?.icon || FileCheck;
                        return (
                            <div key={a.id} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-9 h-9 rounded-lg ${typeInfo?.color} flex items-center justify-center`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-slate-900 text-sm">{typeInfo?.label}</div>
                                            <div className="text-xs text-slate-500">{new Date(a.date_acte).toLocaleString("fr-FR")}</div>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => a.patient_id && onNavigate("patient-detail", a.patient_id)} className="font-bold text-slate-900 hover:text-cyan-600 transition text-left">
                                    {a.patients?.nom} {a.patients?.prenom}
                                </button>
                                <div className="text-xs text-slate-500 font-mono">{a.nip}</div>
                                {a.description && <div className="text-sm text-slate-700 mt-2 bg-slate-50 p-2 rounded">{a.description}</div>}
                                {a.photo_url && (
                                    <a href={a.photo_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-cyan-600 hover:underline">
                                        📎 Voir la photo jointe
                                    </a>
                                )}
                                <div className="text-xs text-slate-400 mt-2">Par {a.effectue_par}</div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-900">Enregistrer un acte</h2>
                            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Patient *</label>
                                <select required className="w-full px-3 py-2 border rounded-lg" onChange={(e) => setSelectedPatient(patients.find((p) => p.id === parseInt(e.target.value)) || null)} value={selectedPatient?.id || ""}>
                                    <option value="" disabled>Sélectionner...</option>
                                    {patients.map((p) => <option key={p.id} value={p.id}>{p.nom} {p.prenom} ({p.nip})</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Type d'acte *</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {TYPES_ACTES.map((t) => {
                                        const Icon = t.icon;
                                        return (
                                            <button key={t.value} type="button" onClick={() => setTypeActe(t.value)} className={`p-3 border-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${typeActe === t.value ? "border-cyan-500 bg-cyan-50 text-cyan-700" : "border-slate-200 text-slate-600"}`}>
                                                <Icon className="w-4 h-4" /> {t.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description / Détails *</label>
                                <textarea required rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Ex: Retrait bilan sanguin du 10/06/2026" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Photo / Document (optionnel)</label>
                                <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center bg-slate-50">
                                    {photoPreview ? (
                                        <div>
                                            <img src={photoPreview} alt="Aperçu" className="max-h-40 mx-auto rounded" />
                                            <button type="button" onClick={() => { setPhotoFile(null); setPhotoPreview(null); }} className="mt-2 text-xs text-red-600 hover:underline">Retirer</button>
                                        </div>
                                    ) : (
                                        <label className="cursor-pointer block">
                                            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                            <div className="text-sm text-slate-600">Cliquer pour joindre une photo</div>
                                            <div className="text-xs text-slate-400 mt-1">Photo de l'enveloppe, signature, etc.</div>
                                            <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                                        </label>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 border rounded-lg text-sm">Annuler</button>
                                <button type="submit" disabled={saving || !selectedPatient || !description} className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                    Valider l'acte
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}