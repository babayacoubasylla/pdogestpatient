import { useState } from "react";
import { AlertTriangle, CheckCircle2, Clock, Filter, Bell } from "lucide-react";
import { formatRelativeDate } from "../data/mockData";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";

export function Alerts() {
  const { alertes, traiterAlerte } = useData();
  const { user } = useAuth();
  const [filtres, setFiltres] = useState<"all" | "danger" | "warning" | "traitees">("all");

  const filtered = alertes.filter((a) => {
    if (filtres === "all") return !a.traitee;
    if (filtres === "traitees") return a.traitee;
    return !a.traitee && a.niveau === filtres;
  });

  const nonTraitees = alertes.filter((a) => !a.traitee);
  const critiques = nonTraitees.filter((a) => a.niveau === "danger").length;

  const traiter = (id: number) => {
    traiterAlerte(id, user ? `${user.prenom} ${user.nom}` : "Médecin");
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-wrap justify-between items-start gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Alertes constantes anormales</h1>
          <p className="text-sm text-slate-500 mt-1">
            Détection automatique basée sur les seuils configurés · Temps réel (WebSocket)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-red-500 animate-pulse" />
          <span className="text-sm text-slate-700">
            <strong className="text-red-600">{critiques}</strong> critiques ·{" "}
            <strong className="text-amber-600">{nonTraitees.length - critiques}</strong> avertissements
          </span>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 flex flex-wrap gap-2">
        <Filter className="w-4 h-4 text-slate-400 my-auto" />
        <FilterBtn active={filtres === "all"} onClick={() => setFiltres("all")}>
          Actives ({nonTraitees.length})
        </FilterBtn>
        <FilterBtn active={filtres === "danger"} onClick={() => setFiltres("danger")}>
          🔴 Critiques
        </FilterBtn>
        <FilterBtn active={filtres === "warning"} onClick={() => setFiltres("warning")}>
          🟡 Avertissements
        </FilterBtn>
        <FilterBtn active={filtres === "traitees"} onClick={() => setFiltres("traitees")}>
          ✓ Traitée(s)
        </FilterBtn>
      </div>

      {/* Liste alertes */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <div className="font-semibold text-slate-900">Aucune alerte</div>
          <div className="text-sm text-slate-500 mt-1">Tout est sous contrôle</div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => (
            <div
              key={a.id}
              className={`bg-white rounded-xl border-l-4 shadow-sm overflow-hidden ${
                a.traitee
                  ? "border-slate-300 opacity-60"
                  : a.niveau === "danger"
                  ? "border-red-500"
                  : "border-amber-500"
              }`}
            >
              <div className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        a.niveau === "danger"
                          ? "bg-red-100 text-red-600"
                          : "bg-amber-100 text-amber-600"
                      }`}
                    >
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900">{a.patient_nom}</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            a.niveau === "danger"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {a.niveau === "danger" ? "CRITIQUE" : "AVERTISSEMENT"}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">{a.nip}</div>
                      <div className="mt-2 text-sm">
                        <strong>{a.message}</strong>
                      </div>
                      <div className="mt-1 text-sm text-slate-700">
                        Valeur mesurée :{" "}
                        <span className="font-bold text-red-700">
                          {a.valeur} {a.unite}
                        </span>
                        <span className="text-slate-400 mx-1">·</span>
                        Normale : {a.seuil_min}-{a.seuil_max} {a.unite}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatRelativeDate(a.date_creation)}
                        </span>
                        {a.salle && (
                          <span>
                            📍 <strong>{a.salle}</strong>
                          </span>
                        )}
                        {a.traitee && a.traitee_par && (
                          <span className="text-emerald-700">✓ Traitée par {a.traitee_par}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {!a.traitee && (
                    <button
                      onClick={() => traiter(a.id)}
                      className="flex-shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Marquer traitée
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Configuration seuils */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-bold text-slate-900 mb-1">Configuration des seuils d'alerte</h3>
        <p className="text-xs text-slate-500 mb-4">
          Les valeurs hors de ces plages déclenchent automatiquement une alerte
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { p: "Tension systolique", min: 90, max: 140, u: "mmHg", n: "danger" },
            { p: "Tension diastolique", min: 60, max: 90, u: "mmHg", n: "danger" },
            { p: "Pouls", min: 60, max: 100, u: "bpm", n: "warning" },
            { p: "Température", min: 36.0, max: 37.5, u: "°C", n: "warning" },
            { p: "Saturation O₂", min: 94, max: 100, u: "%", n: "danger" },
            { p: "Fréq. respiratoire", min: 12, max: 20, u: "/min", n: "warning" },
            { p: "Douleur EVA", min: 0, max: 3, u: "/10", n: "warning" },
          ].map((s) => (
            <div key={s.p} className="border border-slate-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-slate-900">{s.p}</span>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded ${
                    s.n === "danger" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {s.n === "danger" ? "Critique" : "Warning"}
                </span>
              </div>
              <div className="text-xs text-slate-600 font-mono">
                {s.min} – {s.max} {s.u}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FilterBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
        active
          ? "bg-cyan-600 text-white"
          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
      }`}
    >
      {children}
    </button>
  );
}
