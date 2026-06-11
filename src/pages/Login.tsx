import { useState } from "react";
import { Stethoscope, Lock, User as UserIcon, ShieldCheck, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await login(username, password);
    if (!res.ok) setError(res.error || "Erreur");
  };

  const quickLogin = async (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    const res = await login(u, p);
    if (!res.ok) setError(res.error || "Erreur");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-600 via-teal-700 to-slate-900 p-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20">
        <div className="absolute top-10 left-10 w-72 h-72 bg-cyan-400 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-400 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left: Branding */}
        <div className="text-white space-y-6 hidden md:block">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur border border-white/20">
              <Stethoscope className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Paracliniques des Oliviers</h1>
              <p className="text-cyan-100">Système Unifié de Gestion des Patients</p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <Feature icon="🔗" text="Synchronisation automatique avec Firebird (SGH)" />
            <Feature icon="🆔" text="NIP unique généré automatiquement" />
            <Feature icon="📊" text="Suivi des constantes & graphiques temporels" />
            <Feature icon="⚠️" text="Alertes automatiques pour valeurs anormales" />
            <Feature icon="📱" text="PWA avec mode hors-ligne" />
            <Feature icon="🔐" text="Authentification JWT sécurisée" />
            <Feature icon="📄" text="Export PDF des consultations" />
          </div>

          <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
            <div className="text-xs text-cyan-100 uppercase tracking-wide mb-1">Architecture</div>
            <div className="font-mono text-xs text-cyan-50">
              Firebird (SGH) → Python Sync → SQLite → API REST → Interfaces Web/PWA
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-auto w-full">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-8 h-8 text-cyan-700" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Connexion</h2>
            <p className="text-sm text-slate-500 mt-1">Accédez à votre espace professionnel</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Identifiant
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition"
                  placeholder="votre.identifiant"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white font-semibold py-2.5 rounded-lg shadow-md transition"
            >
              Se connecter
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-500 text-center mb-3">Comptes de démonstration :</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => quickLogin("admin", "admin123")}
                className="text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 px-2 py-1.5 rounded-md font-medium transition"
              >
                Admin
              </button>
              <button
                onClick={() => quickLogin("dr.kone", "medecin")}
                className="text-xs bg-cyan-50 hover:bg-cyan-100 text-cyan-700 px-2 py-1.5 rounded-md font-medium transition"
              >
                Médecin
              </button>
              <button
                onClick={() => quickLogin("inf.diallo", "infirmier")}
                className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2 py-1.5 rounded-md font-medium transition"
              >
                Infirmier
              </button>
              <button
                onClick={() => quickLogin("gest.archives", "gestion")}
                className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 px-2 py-1.5 rounded-md font-medium transition"
              >
                Gestionnaire
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-xl">{icon}</span>
      <span className="text-cyan-50">{text}</span>
    </div>
  );
}
