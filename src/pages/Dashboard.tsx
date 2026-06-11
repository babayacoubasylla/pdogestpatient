import { useMemo } from "react";
import {
  Users,
  Activity,
  AlertTriangle,
  TrendingUp,
  Stethoscope,
  Heart,
  Thermometer,
  Wind,
  ArrowUpRight,
  Clock,
} from "lucide-react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import {
  STATS_30J,
  TOP_DIAGNOSTICS,
  REPARTITION_AGE,
  ACTIVITE_MEDECINS,
  formatRelativeDate,
} from "../data/mockData";
import { useData } from "../context/DataContext";
import type { PageId } from "../types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function Dashboard({ onNavigate }: { onNavigate: (p: PageId) => void }) {
  const { patients, alertes } = useData();
  const alertesNonTraitees = alertes.filter((a) => !a.traitee);
  const statsAujourdhui = STATS_30J[STATS_30J.length - 1];
  const statsHier = STATS_30J[STATS_30J.length - 2];
  const trendConsultations = Math.round(
    ((statsAujourdhui.nb_consultations - statsHier.nb_consultations) /
      statsHier.nb_consultations) *
      100
  );

  const chartData = useMemo(
    () => ({
      labels: STATS_30J.map((s) =>
        new Date(s.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })
      ),
      datasets: [
        {
          label: "Consultations",
          data: STATS_30J.map((s) => s.nb_consultations),
          borderColor: "#0891b2",
          backgroundColor: "rgba(8, 145, 178, 0.15)",
          tension: 0.4,
          fill: true,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 5,
        },
        {
          label: "Constantes saisies",
          data: STATS_30J.map((s) => s.nb_constantes),
          borderColor: "#10b981",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          tension: 0.4,
          fill: true,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 5,
        },
      ],
    }),
    []
  );

  const diagnosticsData = {
    labels: TOP_DIAGNOSTICS.map((d) => d.nom),
    datasets: [
      {
        data: TOP_DIAGNOSTICS.map((d) => d.count),
        backgroundColor: TOP_DIAGNOSTICS.map((d) => d.couleur),
        borderRadius: 6,
      },
    ],
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
          <p className="text-sm text-slate-500 mt-1">
            Vue d'ensemble en temps réel · {new Date().toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
          <Clock className="w-3.5 h-3.5" />
          Dernière sync : il y a 2 secondes
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={Users}
          label="Patients actifs"
          value={patients.length.toString()}
          trend="+3 aujourd'hui"
          trendPositive
          color="cyan"
        />
        <KpiCard
          icon={Stethoscope}
          label="Consultations (jour)"
          value={statsAujourdhui.nb_consultations.toString()}
          trend={`${trendConsultations > 0 ? "+" : ""}${trendConsultations}% vs hier`}
          trendPositive={trendConsultations > 0}
          color="emerald"
        />
        <KpiCard
          icon={Activity}
          label="Constantes saisies"
          value={statsAujourdhui.nb_constantes.toString()}
          trend="Temps réel"
          color="blue"
        />
        <KpiCard
          icon={AlertTriangle}
          label="Alertes actives"
          value={alertesNonTraitees.length.toString()}
          trend={`${alertesNonTraitees.filter((a) => a.niveau === "danger").length} critiques`}
          trendPositive={false}
          color="red"
          onClick={() => onNavigate("alertes")}
        />
      </div>

      {/* Alertes critiques */}
      {alertesNonTraitees.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Alertes constantes anormales</h3>
                <p className="text-xs text-slate-600">
                  {alertesNonTraitees.length} alerte(s) en attente de traitement
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate("alertes")}
              className="text-sm text-red-700 hover:text-red-900 font-semibold flex items-center gap-1"
            >
              Voir tout <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {alertesNonTraitees.slice(0, 3).map((a) => (
              <div
                key={a.id}
                className={`bg-white rounded-lg p-3 border-l-4 ${
                  a.niveau === "danger" ? "border-red-500" : "border-amber-500"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="font-semibold text-sm text-slate-900">{a.patient_nom}</div>
                  <span className="text-xs text-slate-500">{formatRelativeDate(a.date_creation)}</span>
                </div>
                <div className="text-xs text-slate-600 mt-1">{a.message}</div>
                <div className="text-xs font-mono mt-1">
                  <span className="font-bold text-red-700">{a.valeur} {a.unite}</span>
                  <span className="text-slate-400"> (normale: {a.seuil_min}-{a.seuil_max})</span>
                </div>
                {a.salle && (
                  <div className="text-xs text-slate-500 mt-1">📍 {a.salle}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Graphique activité 30 jours */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900">Activité des 30 derniers jours</h3>
              <p className="text-xs text-slate-500">Consultations et constantes saisies</p>
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="h-72">
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: "top", align: "end" } },
                scales: { y: { beginAtZero: true } },
              }}
            />
          </div>
        </div>

        {/* Moyennes constantes */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <h3 className="font-bold text-slate-900 mb-1">Moyennes constantes</h3>
          <p className="text-xs text-slate-500 mb-4">Aujourd'hui</p>
          <div className="space-y-3">
            <MoyRow
              icon={Heart}
              label="Tension"
              value={`${statsAujourdhui.tension_moyenne_systole}/${statsAujourdhui.tension_moyenne_diastole}`}
              unite="mmHg"
              color="red"
            />
            <MoyRow
              icon={Activity}
              label="Pouls"
              value={statsAujourdhui.pouls_moyen.toString()}
              unite="bpm"
              color="cyan"
            />
            <MoyRow
              icon={Thermometer}
              label="Température"
              value={statsAujourdhui.temperature_moyenne.toFixed(1)}
              unite="°C"
              color="orange"
            />
            <MoyRow
              icon={Wind}
              label="Sat O₂"
              value="97"
              unite="%"
              color="blue"
            />
          </div>
        </div>
      </div>

      {/* Diagnostics & Tranches d'âge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <h3 className="font-bold text-slate-900 mb-1">Top 5 diagnostics du mois</h3>
          <p className="text-xs text-slate-500 mb-4">Pathologies les plus fréquentes</p>
          <div className="h-64">
            <Bar
              data={diagnosticsData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: "y" as const,
                plugins: { legend: { display: false } },
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <h3 className="font-bold text-slate-900 mb-1">Répartition par âge</h3>
          <p className="text-xs text-slate-500 mb-4">Patients actifs</p>
          <div className="space-y-3">
            {REPARTITION_AGE.map((t) => (
              <div key={t.tranche}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-700">{t.tranche}</span>
                  <span className="font-semibold text-slate-900">{t.pourcentage}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full"
                    style={{ width: `${t.pourcentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activité médecins */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <h3 className="font-bold text-slate-900 mb-1">Activité des médecins</h3>
        <p className="text-xs text-slate-500 mb-4">Consultations ce mois</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {ACTIVITE_MEDECINS.map((m) => (
            <div
              key={m.nom}
              className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mb-2"
                style={{ backgroundColor: m.couleur }}
              >
                {m.nom.charAt(4)}
              </div>
              <div className="font-semibold text-slate-900 text-sm">{m.nom}</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{m.consultations}</div>
              <div className="text-xs text-slate-500">consultations</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  trend,
  trendPositive,
  color,
  onClick,
}: {
  icon: any;
  label: string;
  value: string;
  trend?: string;
  trendPositive?: boolean;
  color: "cyan" | "emerald" | "blue" | "red";
  onClick?: () => void;
}) {
  const colorClasses = {
    cyan: "from-cyan-500 to-cyan-600",
    emerald: "from-emerald-500 to-emerald-600",
    blue: "from-blue-500 to-blue-600",
    red: "from-red-500 to-red-600",
  };
  return (
    <button
      onClick={onClick}
      className="text-left bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition disabled:cursor-default"
      disabled={!onClick}
    >
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 bg-gradient-to-br ${colorClasses[color]} rounded-xl flex items-center justify-center text-white shadow-md`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              trendPositive === false
                ? "bg-red-100 text-red-700"
                : trendPositive
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {trend}
          </span>
        )}
      </div>
      <div className="mt-3">
        <div className="text-3xl font-bold text-slate-900">{value}</div>
        <div className="text-sm text-slate-500 mt-0.5">{label}</div>
      </div>
    </button>
  );
}

function MoyRow({
  icon: Icon,
  label,
  value,
  unite,
  color,
}: {
  icon: any;
  label: string;
  value: string;
  unite: string;
  color: "red" | "cyan" | "orange" | "blue";
}) {
  const colorClasses = {
    red: "bg-red-100 text-red-600",
    cyan: "bg-cyan-100 text-cyan-600",
    orange: "bg-orange-100 text-orange-600",
    blue: "bg-blue-100 text-blue-600",
  };
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <div className="text-xs text-slate-500">{label}</div>
        <div className="font-bold text-slate-900">
          {value} <span className="text-xs font-normal text-slate-500">{unite}</span>
        </div>
      </div>
    </div>
  );
}
