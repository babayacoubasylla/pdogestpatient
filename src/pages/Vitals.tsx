import { useState } from "react";
import { Search, Save, AlertTriangle, CheckCircle2, Tablet, WifiOff } from "lucide-react";
import { ALERTES_CONFIG } from "../data/mockData";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import type { Patient } from "../types";

export function Vitals() {
  const { patients, ajouterConstante } = useData();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Patient | null>(null);
  const [form, setForm] = useState({
    tension_systole: "",
    tension_diastole: "",
    pouls: "",
    temperature: "",
    saturation_o2: "",
    frequence_respiratoire: "",
    poids: "",
    taille: "",
    douleur_eva: "0",
    glycemie: "",
    note: "",
  });
  const [alertes, setAlertes] = useState<any[]>([]);
  const [saved, setSaved] = useState(false);
  const [offline, setOffline] = useState(false);

  const results = search
    ? patients.filter((p) => {
        const q = search.toLowerCase();
        return (
          p.nom.toLowerCase().includes(q) ||
          p.prenom.toLowerCase().includes(q) ||
          p.nip.toLowerCase().includes(q)
        );
      }).slice(0, 6)
    : [];

  const detectAlertes = () => {
    const a: any[] = [];
    Object.entries(form).forEach(([param, val]) => {
      const num = parseFloat(val);
      if (isNaN(num)) return;
      const config = ALERTES_CONFIG.find((c) => c.parametre === param);
      if (!config) return;
      if (num < config.min_normal || num > config.max_normal) {
        a.push({
          parametre: config.parametre,
          valeur: num,
          min: config.min_normal,
          max: config.max_normal,
          unite: config.unite,
          message: config.message_alerte,
          niveau: config.niveau,
        });
      }
    });
    return a;
  };

  const handleChange = (k: string, v: string) => {
    setForm({ ...form, [k]: v });
    setAlertes(detectAlertes());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;

    // Enregistrement réel (Supabase) ou local (démo)
    const num = (v: string) => (v ? parseFloat(v) : undefined);
    await ajouterConstante({
      patient_id: selected.id,
      nip: selected.nip,
      tension_systole: num(form.tension_systole),
      tension_diastole: num(form.tension_diastole),
      pouls: num(form.pouls),
      temperature: num(form.temperature),
      saturation_o2: num(form.saturation_o2),
      frequence_respiratoire: num(form.frequence_respiratoire),
      poids: num(form.poids),
      taille: num(form.taille),
      douleur_eva: num(form.douleur_eva),
      glycemie: num(form.glycemie),
      note: form.note || undefined,
      saisie_par: user ? `${user.prenom} ${user.nom}` : "Inconnu",
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 4000);
    setForm({
      tension_systole: "",
      tension_diastole: "",
      pouls: "",
      temperature: "",
      saturation_o2: "",
      frequence_respiratoire: "",
      poids: "",
      taille: "",
      douleur_eva: "0",
      glycemie: "",
      note: "",
    });
    setAlertes([]);
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header mode tablette */}
      <div className="bg-gradient-to-r from-cyan-600 to-teal-600 rounded-xl p-5 text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur">
            <Tablet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Saisie des constantes</h1>
            <p className="text-cyan-100 text-sm">
              Mode tablette · Interface optimisée PWA avec fonctionnement hors-ligne
            </p>
          </div>
        </div>
        <button
          onClick={() => setOffline(!offline)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 ${
            offline ? "bg-amber-500 text-white" : "bg-white/20 text-white"
          }`}
        >
          <WifiOff className="w-3.5 h-3.5" />
          {offline ? "Mode hors-ligne activé" : "Mode en ligne"}
        </button>
      </div>

      {offline && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800 flex items-start gap-2">
          <WifiOff className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Mode hors-ligne actif.</strong> Les données saisies seront stockées localement
            (IndexedDB) et synchronisées automatiquement via Background Sync au retour du réseau.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Colonne gauche : sélection patient */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="font-bold text-slate-900 mb-3">1. Sélectionner un patient</h3>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher nom ou NIP..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
              />
            </div>

            {selected ? (
              <div className="border-2 border-cyan-500 rounded-lg p-3 bg-cyan-50">
                <div className="font-bold text-slate-900">
                  {selected.nom} {selected.prenom}
                </div>
                <div className="text-xs text-slate-600 font-mono mt-1">{selected.nip}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  ID SGH : {selected.id_sgh}
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="mt-2 text-xs text-cyan-700 hover:text-cyan-900"
                >
                  Changer de patient
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {results.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelected(p);
                      setSearch("");
                    }}
                    className="w-full text-left p-3 border border-slate-200 rounded-lg hover:border-cyan-400 hover:bg-cyan-50 transition"
                  >
                    <div className="font-semibold text-sm text-slate-900">
                      {p.nom} {p.prenom}
                    </div>
                    <div className="text-xs text-slate-500 font-mono">{p.nip}</div>
                  </button>
                ))}
                {search && results.length === 0 && (
                  <div className="text-sm text-slate-500 text-center py-4">
                    Aucun patient trouvé
                  </div>
                )}
                {!search && (
                  <div className="text-sm text-slate-400 text-center py-4">
                    Tapez pour rechercher un patient
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
                <h3 className="font-bold text-red-900 text-sm">
                  {alertes.length} valeur(s) anormale(s) détectée(s)
                </h3>
              </div>
              <div className="space-y-1.5">
                {alertes.map((a, i) => (
                  <div
                    key={i}
                    className={`text-xs p-2 rounded ${
                      a.niveau === "danger" ? "bg-red-100 text-red-900" : "bg-amber-100 text-amber-900"
                    }`}
                  >
                    <strong>{a.message}</strong>
                    <div>
                      Valeur : {a.valeur} {a.unite} (normale : {a.min}-{a.max})
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Colonne droite : formulaire */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-bold text-slate-900 mb-4">2. Saisir les constantes</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="text-xs font-bold text-red-700 uppercase mb-2">🩺 Tension artérielle</div>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Systolique"
                    unite="mmHg"
                    value={form.tension_systole}
                    onChange={(v) => handleChange("tension_systole", v)}
                    placeholder="120"
                    range="90-140"
                  />
                  <Input
                    label="Diastolique"
                    unite="mmHg"
                    value={form.tension_diastole}
                    onChange={(v) => handleChange("tension_diastole", v)}
                    placeholder="80"
                    range="60-90"
                  />
                </div>
              </div>

              <Input
                label="Pouls"
                unite="bpm"
                value={form.pouls}
                onChange={(v) => handleChange("pouls", v)}
                placeholder="72"
                range="60-100"
                icon="❤️"
              />
              <Input
                label="Température"
                unite="°C"
                value={form.temperature}
                onChange={(v) => handleChange("temperature", v)}
                placeholder="36.8"
                range="36.0-37.5"
                icon="🌡️"
              />
              <Input
                label="Saturation O₂"
                unite="%"
                value={form.saturation_o2}
                onChange={(v) => handleChange("saturation_o2", v)}
                placeholder="98"
                range="94-100"
                icon="💨"
              />
              <Input
                label="Fréquence respiratoire"
                unite="/min"
                value={form.frequence_respiratoire}
                onChange={(v) => handleChange("frequence_respiratoire", v)}
                placeholder="16"
                range="12-20"
                icon="🫁"
              />
              <Input
                label="Poids"
                unite="kg"
                value={form.poids}
                onChange={(v) => handleChange("poids", v)}
                placeholder="70"
                icon="⚖️"
              />
              <Input
                label="Taille"
                unite="cm"
                value={form.taille}
                onChange={(v) => handleChange("taille", v)}
                placeholder="170"
                icon="📏"
              />

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Douleur EVA <span className="text-xs text-slate-400">(0-10)</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={form.douleur_eva}
                  onChange={(e) => handleChange("douleur_eva", e.target.value)}
                  className="w-full accent-cyan-600"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>0</span>
                  <span className="font-bold text-lg text-slate-900">{form.douleur_eva}/10</span>
                  <span>10</span>
                </div>
                <div className="flex gap-1 mt-2">
                  {[...Array(11)].map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 h-2 rounded-full"
                      style={{
                        backgroundColor:
                          i <= 3 ? "#10b981" : i <= 6 ? "#f59e0b" : "#ef4444",
                        opacity: parseInt(form.douleur_eva) === i ? 1 : 0.3,
                      }}
                    />
                  ))}
                </div>
              </div>

              <Input
                label="Glycémie (optionnel)"
                unite="g/L"
                value={form.glycemie}
                onChange={(v) => handleChange("glycemie", v)}
                placeholder="1.0"
                icon="🩸"
              />

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Notes / Observations
                </label>
                <textarea
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                  placeholder="Notes additionnelles..."
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="submit"
                disabled={!selected}
                className="flex-1 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 disabled:from-slate-300 disabled:to-slate-300 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-md transition"
              >
                <Save className="w-5 h-5" />
                {offline ? "Enregistrer localement" : "Enregistrer les constantes"}
              </button>
              <button
                type="button"
                onClick={() =>
                  setForm({
                    tension_systole: "",
                    tension_diastole: "",
                    pouls: "",
                    temperature: "",
                    saturation_o2: "",
                    frequence_respiratoire: "",
                    poids: "",
                    taille: "",
                    douleur_eva: "0",
                    glycemie: "",
                    note: "",
                  })
                }
                className="px-6 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg font-medium"
              >
                Effacer
              </button>
            </div>

            {saved && (
              <div className="mt-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg p-3 flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <strong>Constantes enregistrées avec succès !</strong>
                {alertes.length > 0 && (
                  <span className="ml-auto text-xs">
                    {alertes.length} alerte(s) envoyée(s) aux médecins
                  </span>
                )}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

function Input({
  label,
  unite,
  value,
  onChange,
  placeholder,
  range,
  icon,
}: {
  label: string;
  unite: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  range?: string;
  icon?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {icon && <span className="mr-1">{icon}</span>}
        {label}
        {range && <span className="text-xs text-slate-400 font-normal ml-1">({range})</span>}
      </label>
      <div className="relative">
        <input
          type="number"
          step="0.1"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2.5 pr-14 border border-slate-200 rounded-lg text-base font-semibold focus:ring-2 focus:ring-cyan-500 outline-none"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-medium">
          {unite}
        </span>
      </div>
    </div>
  );
}
