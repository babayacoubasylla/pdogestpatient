import { useState, useEffect } from "react";
import { BarChart3, Download, Loader2 } from "lucide-react";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, Title, Tooltip, Legend
} from "chart.js";
import { useData } from "../context/DataContext";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export function Stats() {
  const { patients, alertes, consultations, constantes, loading } = useData();
  const [periode, setPeriode] = useState<"semaine" | "mois" | "annee">("mois");

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
      </div>
    );
  }

  // Calcul de la répartition par âge à partir des vraies données Supabase
  const repartitionAge = [
    { tranche: "0-18 ans", count: 0 },
    { tranche: "19-35 ans", count: 0 },
    { tranche: "36-50 ans", count: 0 },
    { tranche: "51-65 ans", count: 0 },
    { tranche: "65+ ans", count: 0 },
  ];

  patients.forEach((p) => {
    if (!p.date_naissance) return;
    const age = Math.floor((Date.now() - new Date(p.date_naissance).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    if (age < 18) repartitionAge[0].count++;
    else if (age < 35) repartitionAge[1].count++;
    else if (age < 50) repartitionAge[2].count++;
    else if (age < 65) repartitionAge[3].count++;
    else repartitionAge[4].count++;
  });

  const totalPatients = patients.length;
  const consultationsMois = consultations.length;
  const alertesActives = alertes.filter((a) => !a.traitee).length;

  const ageData = {
    labels: repartitionAge.map((r) => r.tranche),
    datasets: [
      {
        data: repartitionAge.map((r) => r.count),
        backgroundColor: ["#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"],
        borderWidth: 0,
      },
    ],
  };

  const sexeData = {
    labels: ["Hommes", "Femmes"],
    datasets: [
      {
        data: [
          patients.filter((p) => p.sexe === "M").length,
          patients.filter((p) => p.sexe === "F").length,
        ],
        backgroundColor: ["#3b82f6", "#ec4899"],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-wrap justify-between items-start gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-cyan-600" />
            Statistiques
          </h1>
          <p className="text-sm text-slate-500 mt-1">Données calculées en temps réel depuis Supabase</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-white border border-slate-200 rounded-lg p-1">
            {(["semaine", "mois", "annee"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriode(p)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition ${periode === p ? "bg-cyan-600 text-white" : "text-slate-600 hover:bg-slate-100"
                  }`}
              >
                {p === "annee" ? "30 jours" : p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiStat label="Total patients" value={totalPatients} color="from-cyan-500 to-cyan-600" />
        <KpiStat label="Consultations" value={consultationsMois} color="from-emerald-500 to-emerald-600" />
        <KpiStat label="Constantes saisies" value={constantes.length} color="from-blue-500 to-blue-600" />
        <KpiStat label="Alertes actives" value={alertesActives} color="from-red-500 to-red-600" />
      </div>

      {totalPatients === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
          Aucune donnée à afficher. Les statistiques apparaîtront dès que des patients seront enregistrés.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-bold text-slate-900 mb-4">Répartition par tranche d'âge</h3>
            <div className="h-64 flex items-center justify-center">
              <Doughnut data={ageData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "right" } } }} />
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-bold text-slate-900 mb-4">Répartition par sexe</h3>
            <div className="h-64 flex items-center justify-center">
              <Doughnut data={sexeData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "right" } } }} />
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 font-bold text-slate-900">Détail patients</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">NIP</th>
                <th className="px-4 py-3 text-left">Patient</th>
                <th className="px-4 py-3 text-left">Sexe</th>
                <th className="px-4 py-3 text-left">Téléphone</th>
                <th className="px-4 py-3 text-left">Création</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patients.slice(0, 50).map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs">{p.nip || "—"}</td>
                  <td className="px-4 py-3 font-semibold">{p.nom} {p.prenom}</td>
                  <td className="px-4 py-3">{p.sexe === "M" ? "H" : p.sexe === "F" ? "F" : "—"}</td>
                  <td className="px-4 py-3">{p.telephone || "—"}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {p.date_creation ? new Date(p.date_creation).toLocaleDateString("fr-FR") : "—"}
                  </td>
                </tr>
              ))}
              {patients.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Aucun patient</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KpiStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className={`w-11 h-11 bg-gradient-to-br ${color} rounded-xl mb-3`} />
      <div className="text-3xl font-bold text-slate-900">{value.toLocaleString("fr-FR")}</div>
      <div className="text-sm text-slate-500">{label}</div>
    </div>
  );
}