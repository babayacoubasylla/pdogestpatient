import { useState, useMemo } from "react";
import { BarChart3, Download, TrendingUp, Users, Activity, AlertTriangle, Stethoscope } from "lucide-react";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  STATS_30J,
  TOP_DIAGNOSTICS,
  REPARTITION_AGE,
  ACTIVITE_MEDECINS,
  PATIENTS,
} from "../data/mockData";

export function Stats() {
  const [periode, setPeriode] = useState<"semaine" | "mois" | "annee">("mois");

  const totalConsultations = STATS_30J.reduce((sum, s) => sum + s.nb_consultations, 0);
  const totalConstantes = STATS_30J.reduce((sum, s) => sum + s.nb_constantes, 0);
  const totalNouveaux = STATS_30J.reduce((sum, s) => sum + s.nb_nouveaux_patients, 0);
  const totalAlertes = STATS_30J.reduce(
    (sum, s) => sum + s.nb_alertes_critiques + s.nb_alertes_warning,
    0
  );

  const ligneData = useMemo(() => {
    const nbJours = periode === "semaine" ? 7 : periode === "mois" ? 30 : 30;
    const slice = STATS_30J.slice(-nbJours);
    return {
      labels: slice.map((s) =>
        new Date(s.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })
      ),
      datasets: [
        {
          label: "Consultations",
          data: slice.map((s) => s.nb_consultations),
          borderColor: "#0891b2",
          backgroundColor: "rgba(8, 145, 178, 0.2)",
          tension: 0.4,
          fill: true,
        },
        {
          label: "Nouveaux patients",
          data: slice.map((s) => s.nb_nouveaux_patients),
          borderColor: "#8b5cf6",
          backgroundColor: "rgba(139, 92, 246, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    };
  }, [periode]);

  const alertesData = useMemo(() => {
    return {
      labels: STATS_30J.slice(-14).map((s) =>
        new Date(s.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })
      ),
      datasets: [
        {
          label: "Critiques",
          data: STATS_30J.slice(-14).map((s) => s.nb_alertes_critiques),
          backgroundColor: "#ef4444",
          borderRadius: 4,
        },
        {
          label: "Avertissements",
          data: STATS_30J.slice(-14).map((s) => s.nb_alertes_warning),
          backgroundColor: "#f59e0b",
          borderRadius: 4,
        },
      ],
    };
  }, []);

  const ageData = {
    labels: REPARTITION_AGE.map((r) => r.tranche),
    datasets: [
      {
        data: REPARTITION_AGE.map((r) => r.pourcentage),
        backgroundColor: ["#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"],
        borderWidth: 0,
      },
    ],
  };

  const medecinData = {
    labels: ACTIVITE_MEDECINS.map((m) => m.nom),
    datasets: [
      {
        data: ACTIVITE_MEDECINS.map((m) => m.consultations),
        backgroundColor: ACTIVITE_MEDECINS.map((m) => m.couleur),
        borderRadius: 6,
      },
    ],
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-wrap justify-between items-start gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-cyan-600" />
            Statistiques avancées
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Analyse de l'activité clinique · Données pré-calculées quotidiennement
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-white border border-slate-200 rounded-lg p-1">
            {(["semaine", "mois", "annee"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriode(p)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition ${
                  periode === p ? "bg-cyan-600 text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {p === "annee" ? "30 jours" : p}
              </button>
            ))}
          </div>
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* KPIs cumulés */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiStat icon={Users} label="Nouveaux patients" value={totalNouveaux} color="from-purple-500 to-purple-600" />
        <KpiStat icon={Stethoscope} label="Consultations" value={totalConsultations} color="from-cyan-500 to-cyan-600" />
        <KpiStat icon={Activity} label="Constantes saisies" value={totalConstantes} color="from-emerald-500 to-emerald-600" />
        <KpiStat icon={AlertTriangle} label="Alertes totales" value={totalAlertes} color="from-red-500 to-red-600" />
      </div>

      {/* Graphique principal */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900">Évolution de l'activité</h3>
            <p className="text-xs text-slate-500">Consultations et nouveaux patients</p>
          </div>
          <TrendingUp className="w-5 h-5 text-emerald-500" />
        </div>
        <div className="h-80">
          <Line
            data={ligneData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: "top", align: "end" } },
              scales: { y: { beginAtZero: true } },
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Alertes */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-bold text-slate-900 mb-1">Alertes générées</h3>
          <p className="text-xs text-slate-500 mb-4">14 derniers jours</p>
          <div className="h-64">
            <Bar
              data={alertesData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: "top", align: "end" } },
                scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } },
              }}
            />
          </div>
        </div>

        {/* Répartition âge */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-bold text-slate-900 mb-1">Répartition par tranche d'âge</h3>
          <p className="text-xs text-slate-500 mb-4">{PATIENTS.length} patients analysés</p>
          <div className="h-64 flex items-center justify-center">
            <Doughnut
              data={ageData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: "right" } },
                cutout: "60%",
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Médecins */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-bold text-slate-900 mb-1">Performance des médecins</h3>
          <p className="text-xs text-slate-500 mb-4">Consultations du mois</p>
          <div className="h-64">
            <Bar
              data={medecinData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: "y" as const,
                plugins: { legend: { display: false } },
              }}
            />
          </div>
        </div>

        {/* Top diagnostics */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-bold text-slate-900 mb-4">Top diagnostics</h3>
          <div className="space-y-3">
            {TOP_DIAGNOSTICS.map((d, i) => {
              const max = TOP_DIAGNOSTICS[0].count;
              const pct = (d.count / max) * 100;
              return (
                <div key={d.nom}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700">
                      {i + 1}. {d.nom}
                    </span>
                    <span className="font-bold text-slate-900">{d.count}</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: d.couleur }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <div className="text-xs text-slate-500 mb-2">Moyennes globales du mois</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-slate-50 rounded-lg p-2">
                <div className="text-xs text-slate-500">Tension moy.</div>
                <div className="font-bold">
                  {Math.round(
                    STATS_30J.reduce((s, x) => s + x.tension_moyenne_systole, 0) / STATS_30J.length
                  )}
                  /
                  {Math.round(
                    STATS_30J.reduce((s, x) => s + x.tension_moyenne_diastole, 0) / STATS_30J.length
                  )}{" "}
                  mmHg
                </div>
              </div>
              <div className="bg-slate-50 rounded-lg p-2">
                <div className="text-xs text-slate-500">Pouls moyen</div>
                <div className="font-bold">
                  {Math.round(STATS_30J.reduce((s, x) => s + x.pouls_moyen, 0) / STATS_30J.length)} bpm
                </div>
              </div>
              <div className="bg-slate-50 rounded-lg p-2">
                <div className="text-xs text-slate-500">Température moy.</div>
                <div className="font-bold">
                  {(
                    STATS_30J.reduce((s, x) => s + x.temperature_moyenne, 0) / STATS_30J.length
                  ).toFixed(1)}
                  °C
                </div>
              </div>
              <div className="bg-slate-50 rounded-lg p-2">
                <div className="text-xs text-slate-500">Taux retour</div>
                <div className="font-bold text-emerald-600">+12%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiStat({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className={`w-11 h-11 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center text-white shadow-md mb-3`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="text-3xl font-bold text-slate-900">{value.toLocaleString("fr-FR")}</div>
      <div className="text-sm text-slate-500 mt-0.5">{label}</div>
      <div className="text-xs text-slate-400 mt-1">30 derniers jours</div>
    </div>
  );
}
