import { useState, useEffect } from "react";
import {
  Users, Activity, AlertTriangle, Stethoscope, Clock,
  Heart, Thermometer, Wind, Loader2, UserPlus, FileCheck, TrendingUp,
} from "lucide-react";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler,
} from "chart.js";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { formatRelativeDate } from "../data/mockData";
import type { PageId } from "../types";

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

export function Dashboard({ onNavigate }: { onNavigate: (p: PageId) => void }) {
  // ✅ BON USAGE : useAuth() retourne { user, login, logout }
  const { user } = useAuth();
  const { patients, alertes, constantes, consultations } = useData();

  const [loading, setLoading] = useState(true);
  const [journey, setJourney] = useState<any[]>([]);

  // Calculs de base
  const alertesNonTraitees = alertes.filter((a) => !a.traitee);
  const aujourdhui = new Date().toISOString().split("T")[0];

  // Constantes du jour
  const constantesAujourdhui = constantes.filter((c) => c.date_mesure?.startsWith(aujourdhui));
  const consultationsAujourdhui = consultations.filter((c) => c.date_consultation?.startsWith(aujourdhui));

  // Calcul des moyennes
  const tensionMoy = (() => {
    if (!constantesAujourdhui.length) return { sys: 0, dia: 0 };
    const sys = Math.round(constantesAujourdhui.reduce((s, c) => s + (c.tension_systole || 0), 0) / constantesAujourdhui.length);
    const dia = Math.round(constantesAujourdhui.reduce((s, c) => s + (c.tension_diastole || 0), 0) / constantesAujourdhui.length);
    return { sys, dia };
  })();

  const poulsMoy = constantesAujourdhui.length
    ? Math.round(constantesAujourdhui.reduce((s, c) => s + (c.pouls || 0), 0) / constantesAujourdhui.length)
    : 0;
  const tempMoy = constantesAujourdhui.length
    ? (constantesAujourdhui.reduce((s, c) => s + (Number(c.temperature) || 0), 0) / constantesAujourdhui.length).toFixed(1)
    : "0";

  // Répartition par âge
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

  // Données graphiques
  const chartLine = {
    labels: journey.slice(-14).map((j) =>
      new Date(j.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })
    ),
    datasets: [
      {
        label: "Constantes saisies",
        data: journey.slice(-14).map((j) => j.constantes),
        borderColor: "#0891b2",
        backgroundColor: "rgba(8, 145, 178, 0.15)",
        tension: 0.4,
        fill: true,
        borderWidth: 2,
        pointRadius: 3,
      },
      {
        label: "Consultations",
        data: journey.slice(-14).map((j) => j.consultations),
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.4,
        fill: true,
        borderWidth: 2,
        pointRadius: 3,
      },
    ],
  };

  const chartAge = {
    labels: repartitionAge.map((r) => r.tranche),
    datasets: [
      {
        data: repartitionAge.map((r) => r.count),
        backgroundColor: ["#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"],
        borderWidth: 0,
      },
    ],
  };

  const chartSexe = {
    labels: ["Hommes", "Femmes", "Inconnu"],
    datasets: [
      {
        data: [
          patients.filter((p) => p.sexe === "M").length,
          patients.filter((p) => p.sexe === "F").length,
          patients.filter((p) => p.sexe !== "M" && p.sexe !== "F").length,
        ],
        backgroundColor: ["#3b82f6", "#ec4899", "#94a3b8"],
        borderWidth: 0,
      },
    ],
  };

  // Charger l'historique 30 jours (OPTIMISÉ : 1 seule requête)
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }
    async function loadJourney() {
      try {
        // UNE SEULE requête pour récupérer TOUTES les constantes des 30 derniers jours
        const depuis = new Date();
        depuis.setDate(depuis.getDate() - 29);
        const depuisIso = depuis.toISOString().split("T")[0];

        const [constRes, consRes] = await Promise.all([
          supabase.from("constantes").select("date_mesure").gte("date_mesure", depuisIso),
          supabase.from("consultations").select("date_consultation").gte("date_consultation", depuisIso),
        ]);

        // Regrouper par jour
        const grouped: Record<string, { constantes: number; consultations: number }> = {};
        for (let i = 29; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const key = d.toISOString().split("T")[0];
          grouped[key] = { constantes: 0, consultations: 0 };
        }

        (constRes.data || []).forEach((c: any) => {
          const key = c.date_mesure?.split("T")[0];
          if (grouped[key]) grouped[key].constantes++;
        });
        (consRes.data || []).forEach((c: any) => {
          const key = c.date_consultation?.split("T")[0];
          if (grouped[key]) grouped[key].consultations++;
        });

        setJourney(Object.entries(grouped).map(([date, v]) => ({ date, ...v })));
      } finally {
        setLoading(false);
      }
    }
    loadJourney();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
      </div>
    );
  }

  const role = user?.role;
  const isSecretaire = role === "secretaire";

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
          <p className="text-sm text-slate-500 mt-1">
            {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
          <Clock className="w-3.5 h-3.5" />
          Synchronisation temps réel
        </div>
      </div>

      {/* === Vue Secrétaire === */}
      {isSecretaire && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <KpiCard icon={UserPlus} label="Pré-enregistrements en attente" value={patients.length} color="pink" onClick={() => onNavigate("pre-enregistrement")} />
            <KpiCard icon={FileCheck} label="Actes spéciaux aujourd'hui" value={constantesAujourdhui.length} color="emerald" onClick={() => onNavigate("actes-speciaux")} />
            <KpiCard icon={Users} label="Total patients" value={patients.length} color="cyan" onClick={() => onNavigate("patients")} />
          </div>

          <div className="bg-gradient-to-r from-pink-50 to-cyan-50 border border-pink-200 rounded-xl p-6">
            <h2 className="font-bold text-slate-900 mb-2">Bienvenue {user?.prenom} 👋</h2>
            <p className="text-sm text-slate-700">
              Vous êtes sur votre espace de travail. Vous pouvez pré-enregistrer un patient ou enregistrer un acte spécial
              (retrait labo, radio, etc.) sans passer par les constantes.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={() => onNavigate("pre-enregistrement")} className="bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-pink-700">
                ➕ Nouveau pré-enregistrement
              </button>
              <button onClick={() => onNavigate("actes-speciaux")} className="bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-cyan-700">
                📋 Nouvel acte spécial
              </button>
              <button onClick={() => onNavigate("patients")} className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50">
                🔍 Rechercher un patient
              </button>
            </div>
          </div>
        </>
      )}

      {/* === Vue Médecin / Admin / Infirmier / Archiviste === */}
      {!isSecretaire && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard icon={Users} label="Total patients" value={patients.length} color="cyan" onClick={() => onNavigate("patients")} />
            <KpiCard icon={Stethoscope} label="Consultations aujourd'hui" value={consultationsAujourdhui.length} color="emerald" onClick={() => onNavigate("consultations")} />
            <KpiCard icon={Activity} label="Constantes aujourd'hui" value={constantesAujourdhui.length} color="blue" onClick={() => onNavigate("constantes")} />
            <KpiCard
              icon={AlertTriangle}
              label="Alertes actives"
              value={alertesNonTraitees.length}
              color="red"
              trend={alertesNonTraitees.filter((a) => a.niveau === "danger").length + " critiques"}
              onClick={() => onNavigate("alertes")}
            />
          </div>

          {/* Alertes critiques */}
          {alertesNonTraitees.length > 0 && (
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h3 className="font-bold text-slate-900">Alertes en attente ({alertesNonTraitees.length})</h3>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {alertesNonTraitees.slice(0, 3).map((a) => {
                  const pnom = a.patients ? `${a.patients.nom} ${a.patients.prenom}` : "Patient inconnu";
                  return (
                    <div key={a.id} className={`bg-white rounded-lg p-3 border-l-4 ${a.niveau === "danger" ? "border-red-500" : "border-amber-500"}`}>
                      <div className="flex items-start justify-between">
                        <div className="font-semibold text-sm text-slate-900">{pnom}</div>
                        <span className="text-xs text-slate-500">{formatRelativeDate(a.date_creation)}</span>
                      </div>
                      <div className="text-xs text-slate-600 mt-1">{a.message}</div>
                      <div className="text-xs font-mono mt-1">
                        <span className="font-bold text-red-700">{a.valeur} {a.unite}</span>
                        <span className="text-slate-400"> (normale: {a.seuil_min}-{a.seuil_max})</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Graphiques */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900">Activité des 14 derniers jours</h3>
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="h-64">
                {journey.length > 0 ? (
                  <Line
                    data={chartLine}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: "top", align: "end" } },
                      scales: { y: { beginAtZero: true } },
                    }}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-sm">Aucune donnée</div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <h3 className="font-bold text-slate-900 mb-1">Moyennes du jour</h3>
              <p className="text-xs text-slate-500 mb-4">Sur les constantes saisies</p>
              <div className="space-y-3">
                <MoyRow icon={Heart} label="Tension" value={`${tensionMoy.sys}/${tensionMoy.dia}`} unite="mmHg" color="red" />
                <MoyRow icon={Activity} label="Pouls" value={poulsMoy.toString()} unite="bpm" color="cyan" />
                <MoyRow icon={Thermometer} label="Température" value={tempMoy} unite="°C" color="orange" />
                <MoyRow icon={Wind} label="Sat O₂" value="—" unite="%" color="blue" />
              </div>
            </div>
          </div>

          {/* Répartitions */}
          {patients.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <h3 className="font-bold text-slate-900 mb-4">Répartition par tranche d'âge</h3>
                <div className="h-64 flex items-center justify-center">
                  <Doughnut
                    data={chartAge}
                    options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "right" } } }}
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <h3 className="font-bold text-slate-900 mb-4">Répartition par sexe</h3>
                <div className="h-64 flex items-center justify-center">
                  <Doughnut
                    data={chartSexe}
                    options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "right" } } }}
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {!isSupabaseConfigured && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-sm text-amber-900">
          ⚠️ <strong>Supabase non configuré</strong> : vérifiez votre fichier <code>.env</code>.
        </div>
      )}
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, color, trend, onClick }: any) {
  const bg: any = {
    cyan: "from-cyan-500 to-cyan-600",
    red: "from-red-500 to-red-600",
    emerald: "from-emerald-500 to-emerald-600",
    blue: "from-blue-500 to-blue-600",
    pink: "from-pink-500 to-pink-600",
  };
  return (
    <button onClick={onClick} className="text-left bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition w-full">
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 bg-gradient-to-br ${bg[color] || bg.cyan} rounded-xl flex items-center justify-center text-white shadow-md`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-100 text-red-700">
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

function MoyRow({ icon: Icon, label, value, unite, color }: any) {
  const colorClasses: any = {
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