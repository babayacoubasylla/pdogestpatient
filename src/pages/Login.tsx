import { useState, useEffect } from "react";
import { Stethoscope, Lock, User as UserIcon, ShieldCheck, AlertCircle, Loader2, ChevronLeft, ChevronRight, Heart, Activity, Users, Building2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

// ==== LOGO ET INFOS CLINIQUE (À PERSONNALISER) ====
const CLINIQUE_INFO = {
  nom: "Paracliniques des Oliviers",
  slogan: "Votre santé, notre priorité",
  ville: "Abidjan, Côte d'Ivoire",
  telephone: "+225 27 22 00 00 00",
  email: "contact@paracliniques-oliviers.ci",
  // Mettez le chemin de votre logo (mettez-le dans public/logo.png)
  logo: "/logo.png",
};

// ==== SLIDES PROMOTIONNELS (BOUCLE AUTO TOUTES LES 6 SECONDES) ====
const SLIDES_PROMO = [
  {
    icon: Heart,
    title: "Carnet de Santé Digital",
    desc: "Chaque patient dispose désormais de son carnet digital accessible via QR code depuis son téléphone.",
    color: "from-pink-500 to-rose-600",
  },
  {
    icon: Activity,
    title: "Suivi des constantes en temps réel",
    desc: "Les infirmiers saisissent les constantes directement sur tablette. Alertes automatiques envoyées aux médecins.",
    color: "from-cyan-500 to-blue-600",
  },
  {
    icon: Users,
    title: "Dossier patient unique",
    desc: "Fini les doubles saisies. Le NIP unique relie le dossier SGH, les constantes, les consultations et les archives.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: Building2,
    title: "Plateforme moderne & sécurisée",
    desc: "Système conforme, traçabilité complète, audit logs, stockage cloud sécurisé Supabase.",
    color: "from-purple-500 to-indigo-600",
  },
];

export function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [slideActif, setSlideActif] = useState(0);

  // Boucle auto des slides
  useEffect(() => {
    const t = setInterval(() => {
      setSlideActif((i) => (i + 1) % SLIDES_PROMO.length);
    }, 6000);
    return () => clearInterval(t);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await login(username, password);
    setLoading(false);
    if (!res.ok) setError(res.error || "Erreur");
  };

  const quickLogin = async (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setLoading(true);
    const res = await login(u, p);
    setLoading(false);
    if (!res.ok) setError(res.error || "Erreur");
  };

  const slide = SLIDES_PROMO[slideActif];
  const SlideIcon = slide.icon;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-700 via-teal-800 to-slate-900 p-4 relative overflow-hidden">
      {/* Logo flottant en arrière-plan */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-cyan-300 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-300 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        {/* === COLONNE GAUCHE : CAROUSEL PROMO === */}
        <div className="text-white space-y-6 hidden md:flex md:flex-col">
          {/* Logo + nom */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center backdrop-blur border border-white/20 overflow-hidden">
              {CLINIQUE_INFO.logo ? (
                <img src={CLINIQUE_INFO.logo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Stethoscope className="w-10 h-10" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{CLINIQUE_INFO.nom}</h1>
              <p className="text-cyan-100">{CLINIQUE_INFO.slogan}</p>
            </div>
          </div>

          {/* Slide promo en boucle */}
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20 min-h-[260px] flex flex-col justify-between transition-all">
            <div>
              <div className={`w-14 h-14 bg-gradient-to-br ${slide.color} rounded-xl flex items-center justify-center mb-4`}>
                <SlideIcon className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold mb-2">{slide.title}</h2>
              <p className="text-cyan-50 text-sm leading-relaxed">{slide.desc}</p>
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="flex gap-2">
                {SLIDES_PROMO.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSlideActif(i)}
                    className={`h-1.5 rounded-full transition-all ${i === slideActif ? "bg-white w-8" : "bg-white/30 w-4"}`}
                  />
                ))}
              </div>
              <div className="flex gap-1">
                <button onClick={() => setSlideActif((i) => (i - 1 + SLIDES_PROMO.length) % SLIDES_PROMO.length)} className="p-1.5 bg-white/10 rounded-lg hover:bg-white/20">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setSlideActif((i) => (i + 1) % SLIDES_PROMO.length)} className="p-1.5 bg-white/10 rounded-lg hover:bg-white/20">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Coordonnées */}
          <div className="text-xs text-cyan-100 space-y-1">
            <div>📍 {CLINIQUE_INFO.ville}</div>
            <div>📞 {CLINIQUE_INFO.telephone}</div>
            <div>✉️ {CLINIQUE_INFO.email}</div>
          </div>
        </div>

        {/* === COLONNE DROITE : FORMULAIRE === */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-auto w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-3 overflow-hidden">
              {CLINIQUE_INFO.logo ? (
                <img src={CLINIQUE_INFO.logo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Stethoscope className="w-8 h-8 text-cyan-700" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Connexion</h2>
            <p className="text-sm text-slate-500 mt-1">{CLINIQUE_INFO.nom}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Identifiant</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none" placeholder="votre.identifiant" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none" placeholder="••••••••" required />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white font-semibold py-2.5 rounded-lg shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <ShieldCheck className="w-4 h-4" />
              Se connecter
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-500 text-center mb-3">Comptes de démonstration :</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => quickLogin(" ", " ")} className="text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 px-2 py-1.5 rounded-md font-medium transition">Admin</button>
              <button onClick={() => quickLogin(" ", " ")} className="text-xs bg-cyan-50 hover:bg-cyan-100 text-cyan-700 px-2 py-1.5 rounded-md font-medium transition">Médecin</button>
              <button onClick={() => quickLogin(" ", " ")} className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2 py-1.5 rounded-md font-medium transition">Infirmier</button>
              <button onClick={() => quickLogin(" ", " ")} className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 px-2 py-1.5 rounded-md font-medium transition">Archiviste</button>
              <button onClick={() => quickLogin(" ", " ")} className="text-xs bg-pink-50 hover:bg-pink-100 text-pink-700 px-2 py-1.5 rounded-md font-medium transition col-span-2">Secrétaire</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}