import { useState, useEffect } from "react";
import { ArrowLeft, Save, Heart, AlertTriangle, FileText, BookHeart, Loader2 } from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { calculerAge } from "../data/mockData";
import type { PageId, Patient, CarnetDigital } from "../types";
import { useAuth } from "../context/AuthContext";
import { TamponClinique } from "../components/TamponClinique";
import { SignaturePadComponent } from "../components/SignaturePad";
import { ExportPdfCarnet } from "../components/ExportPdfCarnet";

export function PatientDetail({ patientId, onNavigate }: { patientId: number; onNavigate: (p: PageId) => void }) {
  const { user } = useAuth();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [carnet, setCarnet] = useState<CarnetDigital | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<CarnetDigital>>({});

  useEffect(() => {
    if (patientId) load();
  }, [patientId]);

  async function load() {
    if (!isSupabaseConfigured || !supabase) { setLoading(false); return; }
    const [p, c] = await Promise.all([
      supabase.from("patients").select("*").eq("id", patientId).maybeSingle(),
      supabase.from("carnet_digital").select("*").eq("patient_id", patientId).maybeSingle(),
    ]);
    if (p.data) setPatient(p.data as Patient);
    if (c.data) {
      setCarnet(c.data as CarnetDigital);
      setForm(c.data as CarnetDigital);
    } else if (p.data) {
      // Créer le carnet automatiquement s'il n'existe pas
      const { data: newCarnet } = await supabase.from("carnet_digital").insert({
        patient_id: p.data.id,
        nip: p.data.nip,
        allergies: p.data.allergies || "",
        antecedents: p.data.antecedents || "",
      }).select().single();
      if (newCarnet) {
        setCarnet(newCarnet as CarnetDigital);
        setForm(newCarnet as CarnetDigital);
      }
    }
    setLoading(false);
  }

  async function saveCarnet() {
    if (!carnet || !user) return;
    setSaving(true);

    // Mise à jour du carnet
    await supabase.from("carnet_digital").update({
      allergies: form.allergies,
      antecedents: form.antecedents,
      traitements_chroniques: form.traitements_chroniques,
      vaccinations: form.vaccinations,
      observations_longitudinales: form.observations_longitudinales,
      derniere_mise_a_jour: new Date().toISOString(),
    }).eq("id", carnet.id);

    // Log d'audit
    await supabase.from("audit_logs").insert({
      user_role: user.role,
      user_name: `${user.prenom} ${user.nom}`,
      action: "modification_carnet_digital",
      cible_type: "patient",
      cible_id: patientId.toString(),
      details: `Carnet digital mis à jour`,
    });

    await load();
    setEditing(false);
    setSaving(false);
  }

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-cyan-600" /></div>;
  if (!patient) return <div className="p-6">Patient introuvable</div>;

  const age = patient.date_naissance ? calculerAge(patient.date_naissance) : 0;

  return (
    <div className="p-6 space-y-5">
      <button onClick={() => onNavigate("patients")} className="text-cyan-600 hover:text-cyan-700 flex items-center gap-1 text-sm font-medium">
        <ArrowLeft className="w-4 h-4" /> Retour à la liste
      </button>

      {/* Identité */}
      <div className="bg-gradient-to-r from-cyan-600 to-teal-600 rounded-xl p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{patient.nom} {patient.prenom}</h1>
            <div className="text-cyan-100 mt-1">{age} ans · {patient.sexe === "M" ? "Homme" : "Femme"}</div>
            <div className="text-sm text-cyan-100 mt-2">
              {patient.telephone && <>📞 {patient.telephone}</>}
              {patient.adresse && <> · 📍 {patient.adresse}</>}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-cyan-100">NIP</div>
            <div className="font-mono font-bold">{patient.nip || "—"}</div>
            <div className="text-xs text-cyan-100 mt-1">ID SGH : {patient.id_sgh || "—"}</div>
          </div>
        </div>
      </div>

      {/* Tampon Clinique */}
      {patient.id && patient.nip && (
        <TamponClinique patientId={patient.id} nip={patient.nip} contexte="consultation" />
      )}

      {/* Carnet Digital */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookHeart className="w-6 h-6 text-pink-600" />
            Carnet de Santé Digital
          </h2>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm">
              Modifier
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => { setEditing(false); setForm(carnet!); }} className="px-4 py-2 border border-slate-200 rounded-lg text-sm">Annuler</button>
              <button onClick={saveCarnet} disabled={saving} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Enregistrer
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="⚠️ Allergies" value={form.allergies} editing={editing} onChange={(v) => setForm({ ...form, allergies: v })} placeholder="Ex: Pénicilline, aspirine..." />
          <Field label="📋 Antécédents médicaux" value={form.antecedents} editing={editing} onChange={(v) => setForm({ ...form, antecedents: v })} placeholder="Ex: HTA, diabète..." />
          <Field label="💊 Traitements chroniques" value={form.traitements_chroniques} editing={editing} onChange={(v) => setForm({ ...form, traitements_chroniques: v })} placeholder="Ex: Metformine 1g 2x/jour" />
          <Field label="💉 Vaccinations" value={form.vaccinations} editing={editing} onChange={(v) => setForm({ ...form, vaccinations: v })} placeholder="Ex: DTPolio 2024, fièvre jaune..." />
          <div className="md:col-span-2">
            <Field label="📝 Observations longitudinales" value={form.observations_longitudinales} editing={editing} onChange={(v) => setForm({ ...form, observations_longitudinales: v })} placeholder="Notes du médecin sur le long terme..." multiline />
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-2 mt-4 flex-wrap">
          <TamponClinique patientId={patient.id} nip={patient.nip || ""} contexte="carnet" />
          <SignaturePadComponent patientId={patient.id} nip={patient.nip || ""} typeSignature="patient" contexte="carnet_consultation" />
          <ExportPdfCarnet patient={patient} carnet={carnet} />
        </div>

        {carnet?.derniere_mise_a_jour && (
          <div className="mt-4 text-xs text-slate-500 flex items-center gap-1">
            <Heart className="w-3 h-3" />
            Dernière mise à jour : {new Date(carnet.derniere_mise_a_jour).toLocaleString("fr-FR")}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, editing, onChange, placeholder, multiline }: { label: string; value: any; editing: boolean; onChange: (v: string) => void; placeholder?: string; multiline?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      {editing ? (
        multiline ? (
          <textarea rows={4} value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none" />
        ) : (
          <textarea rows={2} value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none" />
        )
      ) : (
        <div className="text-sm text-slate-800 bg-slate-50 px-3 py-2 rounded-lg min-h-[40px] whitespace-pre-wrap">
          {value || <span className="text-slate-400 italic">Non renseigné</span>}
        </div>
      )}
    </div>
  );
}