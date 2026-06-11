import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { BookHeart, Phone, MapPin, Loader2, Stethoscope, AlertTriangle, Calendar } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { calculerAge } from "../data/mockData";
import { AudioReader } from "../components/AudioReader";

export function PatientCarnetPublic() {
    const { nip } = useParams<{ nip: string }>();
    const [patient, setPatient] = useState<any>(null);
    const [carnet, setCarnet] = useState<any>(null);
    const [constantes, setConstantes] = useState<any[]>([]);
    const [consultations, setConsultations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (nip) load();
    }, [nip]);

    async function load() {
        if (!isSupabaseConfigured || !supabase) { setLoading(false); return; }
        const [p, c, cons, consult] = await Promise.all([
            supabase.from("patients").select("*").eq("nip", nip).maybeSingle(),
            supabase.from("carnet_digital").select("*").eq("nip", nip).maybeSingle(),
            supabase.from("constantes").select("*").eq("nip", nip).order("date_mesure", { ascending: false }).limit(3),
            supabase.from("consultations").select("date_consultation, medecin, motif, diagnostic").eq("nip", nip).order("date_consultation", { ascending: false }).limit(5),
        ]);
        if (p.data) setPatient(p.data);
        if (c.data) setCarnet(c.data);
        if (cons.data) setConstantes(cons.data);
        if (consult.data) setConsultations(consult.data);
        setLoading(false);
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
        </div>
    );

    if (!patient) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-slate-900">Carnet non trouvé</h1>
                <p className="text-slate-600 mt-2">Le NIP <code className="bg-slate-100 px-2 py-1 rounded">{nip}</code> n'existe pas dans notre base.</p>
            </div>
        </div>
    );

    const age = patient.date_naissance ? calculerAge(patient.date_naissance) : 0;
    const currentUrl = window.location.href;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50 p-4">
            <div className="max-w-3xl mx-auto space-y-4">
                {/* Header */}
                <div className="bg-gradient-to-r from-cyan-600 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2 text-cyan-100 text-sm">
                                <BookHeart className="w-4 h-4" /> CARNET DE SANTÉ DIGITAL
                            </div>
                            <h1 className="text-3xl font-bold mt-1">{patient.nom} {patient.prenom}</h1>
                            <div className="text-cyan-100 mt-1">{age} ans · {patient.sexe === "M" ? "Homme" : "Femme"} · {patient.groupe_sanguin || "—"}</div>
                            <div className="text-sm text-cyan-100 mt-2 font-mono">NIP : {patient.nip}</div>
                        </div>
                        <div className="bg-white p-2 rounded-lg">
                            <QRCodeSVG value={currentUrl} size={100} level="H" />
                        </div>
                    </div>
                </div>

                {/* Alertes critiques */}
                {carnet?.allergies && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <div className="font-bold text-red-900">⚠️ Allergies connues</div>
                                <AudioReader text={carnet.allergies} compact />
                            </div>
                            <div className="text-red-800 text-sm mt-1">{carnet.allergies}</div>
                        </div>
                    </div>
                )}

                {/* Carnet digital */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-slate-900 flex items-center gap-2">
                            <Stethoscope className="w-5 h-5 text-cyan-600" /> Informations médicales
                        </h2>
                        <AudioReader text="Carnet de santé digital" compact />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <Field label="Antécédents médicaux" value={carnet?.antecedents} />
                        <Field label="Traitements en cours" value={carnet?.traitements_chroniques} />
                        <Field label="Vaccinations" value={carnet?.vaccinations} />
                        <Field label="Observations médicales" value={carnet?.observations_longitudinales} />
                    </div>
                </div>

                {/* 3 dernières constantes */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-cyan-600" /> Dernières mesures
                    </h2>
                    {constantes.length === 0 ? (
                        <div className="text-sm text-slate-500 italic">Aucune mesure enregistrée</div>
                    ) : (
                        <div className="space-y-2">
                            {constantes.map((c) => (
                                <div key={c.id} className="bg-slate-50 p-3 rounded-lg flex items-center justify-between text-sm">
                                    <div className="text-slate-500">{new Date(c.date_mesure).toLocaleString("fr-FR")}</div>
                                    <div className="flex gap-4 text-xs">
                                        <span><strong>{c.tension_systole}/{c.tension_diastole}</strong> mmHg</span>
                                        <span><strong>{c.pouls}</strong> bpm</span>
                                        <span><strong>{c.temperature}°C</strong></span>
                                        <span><strong>{c.saturation_o2}%</strong></span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Consultations */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="font-bold text-slate-900 mb-4">Dernières consultations</h2>
                    {consultations.length === 0 ? (
                        <div className="text-sm text-slate-500 italic">Aucune consultation</div>
                    ) : (
                        <div className="space-y-3">
                            {consultations.map((c, i) => (
                                <div key={i} className="border-l-4 border-cyan-500 pl-3 py-1">
                                    <div className="text-xs text-slate-500">{new Date(c.date_consultation).toLocaleDateString("fr-FR")} · {c.medecin}</div>
                                    <div className="font-semibold text-sm mt-0.5">{c.motif}</div>
                                    <div className="text-sm text-slate-600">{c.diagnostic}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Bouton Demander un RDV */}
                <Link
                    to={`/public/patient/${nip}/rdv`}
                    className="block bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-xl p-5 text-center hover:shadow-lg transition"
                >
                    <Calendar className="w-8 h-8 mx-auto mb-2" />
                    <div className="font-bold text-lg">Demander un rendez-vous</div>
                    <div className="text-sm text-cyan-100 mt-1">Choisissez un service et envoyez votre demande à notre équipe</div>
                </Link>

                {/* Footer */}
                <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4 text-center text-sm text-cyan-800">
                    <Phone className="w-4 h-4 inline mr-1" /> Clinique : +225 27 22 00 00 00 · <MapPin className="w-4 h-4 inline ml-2 mr-1" /> Abidjan, Côte d'Ivoire
                </div>

                <div className="text-center">
                    <Link to="/" className="text-xs text-slate-500 hover:text-cyan-600">← Retour à l'espace professionnel</Link>
                </div>
            </div>
        </div>
    );
}

function Field({ label, value }: { label: string; value?: string }) {
    return (
        <div>
            <div className="text-xs font-medium text-slate-500 mb-1">{label}</div>
            <div className="text-slate-800 bg-slate-50 px-3 py-2 rounded-lg min-h-[40px] whitespace-pre-wrap">
                {value || <span className="text-slate-400 italic">Non renseigné</span>}
            </div>
        </div>
    );
}