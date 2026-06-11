import { useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Line } from "react-chartjs-2";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  AlertTriangle,
  Download,
  Heart,
  Activity,
  Thermometer,
  Wind,
  Weight,
  Ruler,
  Frown,
  FileText,
  Clock,
  Copy,
  CheckCircle2,
} from "lucide-react";
import { calculerAge, calculerIMC, formatRelativeDate } from "../data/mockData";
import { useData } from "../context/DataContext";
import type { PageId } from "../types";
import { useState } from "react";

export function PatientDetail({
  patientId,
  onNavigate,
}: {
  patientId: number;
  onNavigate: (p: PageId, payload?: any) => void;
}) {
  const {
    patients,
    constantes: allConstantes,
    consultations: allConsultations,
    alertes: allAlertes,
  } = useData();
  const patient = patients.find((p) => p.id === patientId);
  const [qrCopied, setQrCopied] = useState(false);
  const [showPdf, setShowPdf] = useState(false);

  if (!patient) {
    return (
      <div className="p-6">
        <button
          onClick={() => onNavigate("patients")}
          className="text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>
        <div className="mt-6 bg-white rounded-xl p-8 text-center text-slate-500">
          Patient introuvable
        </div>
      </div>
    );
  }

  const constantes = allConstantes
    .filter((c) => c.patient_id === patient.id)
    .sort((a, b) => b.date.localeCompare(a.date));
  const derniereConstante = constantes[0];
  const consultations = allConsultations
    .filter((c) => c.patient_id === patient.id)
    .sort((a, b) => b.date.localeCompare(a.date));
  const alertes = allAlertes.filter((a) => a.patient_id === patient.id && !a.traitee);

  const age = calculerAge(patient.date_naissance);
  const qrUrl = `http://clinique.local/public/patient/${patient.nip}`;

  const chartData = useMemo(() => {
    const sorted = [...constantes].reverse().slice(-12);
    return {
      labels: sorted.map((c) =>
        new Date(c.date.replace(" ", "T")).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
        })
      ),
      datasets: [
        {
          label: "Tension systolique",
          data: sorted.map((c) => c.tension_systole),
          borderColor: "#ef4444",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 3,
        },
        {
          label: "Tension diastolique",
          data: sorted.map((c) => c.tension_diastole),
          borderColor: "#f59e0b",
          backgroundColor: "rgba(245, 158, 11, 0.1)",
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 3,
        },
        {
          label: "Pouls",
          data: sorted.map((c) => c.pouls),
          borderColor: "#0891b2",
          backgroundColor: "rgba(8, 145, 178, 0.1)",
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 3,
        },
      ],
    };
  }, [constantes]);

  const imc = derniereConstante
    ? calculerIMC(derniereConstante.poids, derniereConstante.taille)
    : 0;

  const copyQr = () => {
    navigator.clipboard?.writeText(qrUrl);
    setQrCopied(true);
    setTimeout(() => setQrCopied(false), 2000);
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => onNavigate("patients")}
          className="text-cyan-600 hover:text-cyan-700 flex items-center gap-1 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Retour à la liste
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => onNavigate("constantes")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <Activity className="w-4 h-4" />
            Saisir constantes
          </button>
          <button
            onClick={() => setShowPdf(true)}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Identity card */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-cyan-600 to-teal-600 p-6 text-white">
          <div className="flex flex-wrap items-start gap-5">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-3xl font-bold backdrop-blur">
              {patient.prenom.charAt(0)}
              {patient.nom.charAt(0)}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">
                {patient.nom} {patient.prenom}
              </h1>
              <div className="text-cyan-100 mt-1">
                {age} ans · {patient.sexe === "F" ? "Femme" : "Homme"} · Groupe {patient.groupe_sanguin || "?"}
              </div>
              <div className="mt-2 flex flex-wrap gap-4 text-sm text-cyan-50">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4" />
                  {patient.telephone}
                </div>
                {patient.email && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4" />
                    {patient.email}
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {patient.adresse}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-cyan-100 uppercase tracking-wide">NIP</div>
              <div className="font-mono font-bold text-lg">{patient.nip}</div>
              <div className="text-xs text-cyan-100 mt-1">ID SGH : {patient.id_sgh}</div>
            </div>
          </div>
        </div>

        {/* Antécédents & allergies */}
        {(patient.allergies || patient.antecedents) && (
          <div className="p-4 bg-amber-50 border-t border-amber-200 flex flex-wrap gap-3">
            {patient.allergies && patient.allergies !== "Aucune connue" && (
              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-slate-700">
                  <strong className="text-red-700">Allergies :</strong> {patient.allergies}
                </span>
              </div>
            )}
            {patient.antecedents && (
              <div className="flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4 text-amber-600" />
                <span className="text-slate-700">
                  <strong>Antécédents :</strong> {patient.antecedents}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Alertes */}
      {alertes.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="font-bold text-red-900">
              {alertes.length} alerte(s) active(s) sur ce patient
            </h3>
          </div>
          <div className="grid md:grid-cols-2 gap-2">
            {alertes.map((a) => (
              <div
                key={a.id}
                className={`rounded-lg p-3 border-l-4 ${
                  a.niveau === "danger"
                    ? "border-red-500 bg-white"
                    : "border-amber-500 bg-white"
                }`}
              >
                <div className="text-sm font-semibold text-slate-900">{a.message}</div>
                <div className="text-xs text-slate-600 mt-1">
                  Valeur : <strong className="text-red-700">{a.valeur} {a.unite}</strong>
                  {" · "}Normale : {a.seuil_min}-{a.seuil_max} {a.unite}
                  {" · "}{formatRelativeDate(a.date_creation)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-5">
          {/* Dernière constante */}
          {derniereConstante && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-900">Dernières constantes</h3>
                  <p className="text-xs text-slate-500">
                    Saisies {formatRelativeDate(derniereConstante.date)} par {derniereConstante.saisie_par}
                  </p>
                </div>
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                  À jour
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <VitalTile
                  icon={Heart}
                  label="Tension"
                  value={`${derniereConstante.tension_systole}/${derniereConstante.tension_diastole}`}
                  unite="mmHg"
                  danger={derniereConstante.tension_systole > 140 || derniereConstante.tension_diastole > 90}
                />
                <VitalTile
                  icon={Activity}
                  label="Pouls"
                  value={derniereConstante.pouls.toString()}
                  unite="bpm"
                  danger={derniereConstante.pouls > 100 || derniereConstante.pouls < 60}
                />
                <VitalTile
                  icon={Thermometer}
                  label="Température"
                  value={derniereConstante.temperature.toFixed(1)}
                  unite="°C"
                  danger={derniereConstante.temperature > 37.5}
                />
                <VitalTile
                  icon={Wind}
                  label="Sat O₂"
                  value={derniereConstante.saturation_o2.toString()}
                  unite="%"
                  danger={derniereConstante.saturation_o2 < 94}
                />
                <VitalTile
                  icon={Activity}
                  label="Resp."
                  value={derniereConstante.frequence_respiratoire.toString()}
                  unite="/min"
                />
                <VitalTile
                  icon={Weight}
                  label="Poids"
                  value={derniereConstante.poids.toString()}
                  unite="kg"
                />
                <VitalTile
                  icon={Ruler}
                  label="Taille"
                  value={derniereConstante.taille.toString()}
                  unite="cm"
                />
                <VitalTile
                  icon={Frown}
                  label="Douleur EVA"
                  value={derniereConstante.douleur_eva.toString()}
                  unite="/10"
                  danger={derniereConstante.douleur_eva > 3}
                />
              </div>

              <div className="mt-4 bg-slate-50 rounded-lg p-3 flex items-center justify-between text-sm">
                <span className="text-slate-600">IMC calculé</span>
                <span className="font-bold text-slate-900">
                  {imc}{" "}
                  <span className="font-normal text-xs text-slate-500">
                    ({imc < 18.5 ? "Maigreur" : imc < 25 ? "Normal" : imc < 30 ? "Surpoids" : "Obésité"})
                  </span>
                </span>
              </div>
            </div>
          )}

          {/* Graphique */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-bold text-slate-900 mb-1">Évolution des constantes</h3>
            <p className="text-xs text-slate-500 mb-4">12 dernières mesures</p>
            <div className="h-72">
              <Line
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: "top", align: "end" } },
                }}
              />
            </div>
          </div>

          {/* Historique constantes */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Historique des constantes</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                  <tr>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">TA</th>
                    <th className="px-4 py-2 text-left">Pouls</th>
                    <th className="px-4 py-2 text-left">T°</th>
                    <th className="px-4 py-2 text-left">Sat</th>
                    <th className="px-4 py-2 text-left">EVA</th>
                    <th className="px-4 py-2 text-left">Par</th>
                  </tr>
                </thead>
                <tbody>
                  {constantes.slice(0, 8).map((c) => (
                    <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-2.5 text-xs text-slate-600">
                        {new Date(c.date.replace(" ", "T")).toLocaleString("fr-FR", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className={`px-4 py-2.5 font-mono text-xs ${c.tension_systole > 140 ? "text-red-600 font-bold" : ""}`}>
                        {c.tension_systole}/{c.tension_diastole}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-xs">{c.pouls}</td>
                      <td className="px-4 py-2.5 font-mono text-xs">{c.temperature.toFixed(1)}</td>
                      <td className="px-4 py-2.5 font-mono text-xs">{c.saturation_o2}%</td>
                      <td className="px-4 py-2.5 font-mono text-xs">{c.douleur_eva}/10</td>
                      <td className="px-4 py-2.5 text-xs text-slate-500">{c.saisie_par}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Consultations */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900">Consultations ({consultations.length})</h3>
            </div>
            {consultations.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">Aucune consultation enregistrée</p>
            ) : (
              <div className="space-y-3">
                {consultations.map((c) => (
                  <div key={c.id} className="border border-slate-200 rounded-lg p-4 hover:border-cyan-300 transition">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-semibold text-slate-900">{c.medecin}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(c.date.replace(" ", "T")).toLocaleString("fr-FR")}
                        </div>
                      </div>
                      <button
                        onClick={() => setShowPdf(true)}
                        className="text-xs text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" /> PDF
                      </button>
                    </div>
                    <div className="text-sm">
                      <div className="text-slate-600">
                        <strong>Motif :</strong> {c.motif}
                      </div>
                      <div className="text-slate-600 mt-1">
                        <strong>Diagnostic :</strong> {c.diagnostic}
                      </div>
                      {c.prochain_rdv && (
                        <div className="mt-2 inline-block bg-cyan-50 text-cyan-700 text-xs px-2 py-1 rounded-full">
                          Prochain RDV : {new Date(c.prochain_rdv).toLocaleDateString("fr-FR")}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* QR Code */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 text-center">
            <h3 className="font-bold text-slate-900 mb-1">QR Code d'accès</h3>
            <p className="text-xs text-slate-500 mb-4">
              Imprimé sur le reçu SGH
            </p>
            <div className="inline-block bg-white p-3 rounded-lg border-2 border-cyan-100">
              <QRCodeSVG
                value={qrUrl}
                size={160}
                level="H"
                bgColor="#ffffff"
                fgColor="#0e7490"
                includeMargin={false}
              />
            </div>
            <div className="mt-3 text-xs text-slate-500 font-mono break-all">{qrUrl}</div>
            <button
              onClick={copyQr}
              className="mt-3 w-full text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-medium flex items-center justify-center gap-1.5 transition"
            >
              {qrCopied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Copié !
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copier le lien
                </>
              )}
            </button>
          </div>

          {/* Infos médicales */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-bold text-slate-900 mb-3">Informations médicales</h3>
            <dl className="space-y-2 text-sm">
              <InfoRow label="Date de naissance" value={new Date(patient.date_naissance).toLocaleDateString("fr-FR")} />
              <InfoRow label="Âge" value={`${age} ans`} />
              <InfoRow label="Sexe" value={patient.sexe === "F" ? "Féminin" : "Masculin"} />
              <InfoRow label="Groupe sanguin" value={patient.groupe_sanguin || "Non renseigné"} />
              <InfoRow label="Création dossier" value={new Date(patient.date_creation).toLocaleDateString("fr-FR")} />
            </dl>
          </div>

          {/* Synthèse */}
          <div className="bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl p-5 text-white">
            <h3 className="font-bold mb-3">Synthèse du dossier</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-cyan-100">Consultations</span>
                <span className="font-bold">{consultations.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cyan-100">Constantes saisies</span>
                <span className="font-bold">{constantes.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cyan-100">Alertes actives</span>
                <span className="font-bold">{alertes.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cyan-100">Dernière visite</span>
                <span className="font-bold">
                  {constantes[0] ? formatRelativeDate(constantes[0].date) : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPdf && (
        <PdfPreview
          patient={patient}
          derniereConstante={derniereConstante}
          consultation={consultations[0]}
          onClose={() => setShowPdf(false)}
          age={age}
        />
      )}
    </div>
  );
}

function VitalTile({
  icon: Icon,
  label,
  value,
  unite,
  danger,
}: {
  icon: any;
  label: string;
  value: string;
  unite: string;
  danger?: boolean;
}) {
  return (
    <div
      className={`rounded-lg p-3 border-2 ${
        danger ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-100"
      }`}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className={`w-4 h-4 ${danger ? "text-red-600" : "text-slate-500"}`} />
        <span className="text-xs text-slate-500">{label}</span>
      </div>
      <div className={`font-bold ${danger ? "text-red-700 text-lg" : "text-slate-900 text-lg"}`}>
        {value}
        <span className="text-xs font-normal text-slate-500 ml-1">{unite}</span>
      </div>
      {danger && (
        <div className="text-xs text-red-600 mt-0.5 font-medium flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> Anormal
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-slate-100 last:border-0">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium text-slate-900 text-right">{value}</dd>
    </div>
  );
}

function PdfPreview({
  patient,
  derniereConstante,
  consultation,
  onClose,
  age,
}: {
  patient: any;
  derniereConstante: any;
  consultation: any;
  onClose: () => void;
  age: number;
}) {
  const imc = derniereConstante
    ? calculerIMC(derniereConstante.poids, derniereConstante.taille)
    : 0;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-8">
        {/* PDF Content */}
        <div className="p-10 space-y-5 print:p-0">
          <div className="text-center border-b-2 border-cyan-700 pb-4">
            <div className="text-2xl font-bold text-cyan-800">PARACLINIQUES DES OLIVIERS</div>
            <div className="text-sm text-slate-600 mt-1">COMPTE RENDU DE CONSULTATION</div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-xs text-slate-500 uppercase mb-1">Date</div>
              <div className="font-semibold">
                {consultation
                  ? new Date(consultation.date.replace(" ", "T")).toLocaleString("fr-FR")
                  : new Date().toLocaleString("fr-FR")}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase mb-1">Médecin</div>
              <div className="font-semibold">{consultation?.medecin || "—"}</div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-4">
            <div className="text-xs text-slate-500 uppercase font-bold mb-2">Patient</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-slate-500">NIP : </span>
                <span className="font-mono">{patient.nip}</span>
              </div>
              <div>
                <span className="text-slate-500">Nom : </span>
                <strong>{patient.nom} {patient.prenom}</strong>
              </div>
              <div>
                <span className="text-slate-500">Naissance : </span>
                {new Date(patient.date_naissance).toLocaleDateString("fr-FR")} ({age} ans)
              </div>
              <div>
                <span className="text-slate-500">Téléphone : </span>
                {patient.telephone}
              </div>
            </div>
          </div>

          {derniereConstante && (
            <div>
              <div className="text-xs text-slate-500 uppercase font-bold mb-2">Constantes du jour</div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>Tension : <strong>{derniereConstante.tension_systole}/{derniereConstante.tension_diastole} mmHg</strong></div>
                <div>Pouls : <strong>{derniereConstante.pouls} bpm</strong></div>
                <div>Temp : <strong>{derniereConstante.temperature.toFixed(1)}°C</strong></div>
                <div>Sat O₂ : <strong>{derniereConstante.saturation_o2}%</strong></div>
                <div>Poids : <strong>{derniereConstante.poids} kg</strong></div>
                <div>IMC : <strong>{imc}</strong></div>
              </div>
            </div>
          )}

          {consultation && (
            <>
              <div>
                <div className="text-xs text-slate-500 uppercase font-bold mb-1">Motif</div>
                <div className="text-sm">{consultation.motif}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase font-bold mb-1">Diagnostic</div>
                <div className="text-sm">{consultation.diagnostic}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase font-bold mb-1">Prescription</div>
                <pre className="text-sm whitespace-pre-wrap font-sans">{consultation.prescription}</pre>
              </div>
              {consultation.prochain_rdv && (
                <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3 text-sm">
                  <strong>Prochain rendez-vous : </strong>
                  {new Date(consultation.prochain_rdv).toLocaleDateString("fr-FR")}
                </div>
              )}
            </>
          )}

          <div className="mt-10 pt-4 border-t border-slate-200 flex justify-between items-end text-sm">
            <div className="text-xs text-slate-500">
              Document généré automatiquement · Paracliniques des Oliviers
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500">Signature et cachet</div>
              <div className="w-40 border-b border-slate-400 mt-10"></div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 p-4 bg-slate-50 border-t border-slate-200 rounded-b-xl">
          <button
            onClick={() => window.print()}
            className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Imprimer / Enregistrer PDF
          </button>
          <button
            onClick={onClose}
            className="px-6 bg-white hover:bg-slate-100 text-slate-700 py-2 rounded-lg text-sm font-medium border border-slate-200"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
