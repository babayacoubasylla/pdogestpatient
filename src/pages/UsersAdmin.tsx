import { useState, useEffect } from "react";
import {
  UserPlus,
  Shield,
  Stethoscope,
  Activity,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  Eye,
  EyeOff,
  Copy,
  AlertCircle,
  FolderArchive,
} from "lucide-react";
import type { Role } from "../types";
import {
  fetchStaff,
  createStaffRemote,
  toggleStaffActiveRemote,
  isSupabaseConfigured,
} from "../services/api";

interface Staff {
  id: number;
  username: string;
  nom: string;
  prenom: string;
  role: Role;
  actif: boolean;
  derniere_connexion?: string;
  password_temp?: string;
}

const INITIAL_STAFF: Staff[] = [
  {
    id: 1,
    username: "admin",
    nom: "Administrateur",
    prenom: "Clinique",
    role: "admin",
    actif: true,
    derniere_connexion: new Date().toISOString(),
  },
  {
    id: 2,
    username: "dr.kone",
    nom: "KONE",
    prenom: "Dr. Awa",
    role: "medecin",
    actif: true,
    derniere_connexion: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 3,
    username: "inf.diallo",
    nom: "DIALLO",
    prenom: "Fatoumata",
    role: "infirmier",
    actif: true,
    derniere_connexion: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 4,
    username: "dr.toure",
    nom: "TOURE",
    prenom: "Dr. Ibrahim",
    role: "medecin",
    actif: true,
    derniere_connexion: new Date(Date.now() - 86400000).toISOString(),
  },
];

function generatePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#";
  let pwd = "";
  for (let i = 0; i < 10; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
  return pwd;
}

export function UsersAdmin() {
  const [staff, setStaff] = useState<Staff[]>(INITIAL_STAFF);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Staff | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    username: "",
    role: "infirmier" as Role,
  });

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // Charger les utilisateurs depuis Supabase (table staff)
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    fetchStaff().then((rows) => {
      if (rows && rows.length > 0) {
        setStaff(
          rows.map((r) => ({
            id: r.id,
            username: r.username,
            nom: r.nom,
            prenom: r.prenom,
            role: r.role,
            actif: r.actif,
            derniere_connexion: r.derniere_connexion,
          }))
        );
      }
    });
  }, []);

  const filtered = staff.filter((s) => {
    const q = search.toLowerCase();
    return (
      !q ||
      s.nom.toLowerCase().includes(q) ||
      s.prenom.toLowerCase().includes(q) ||
      s.username.toLowerCase().includes(q)
    );
  });

  const resetForm = () => {
    setForm({ prenom: "", nom: "", username: "", role: "infirmier" });
    setEditing(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      setStaff((prev) =>
        prev.map((s) =>
          s.id === editing.id
            ? { ...s, prenom: form.prenom, nom: form.nom, username: form.username, role: form.role }
            : s
        )
      );
      setToast(`Utilisateur ${form.prenom} ${form.nom} mis à jour`);
    } else {
      const pwd = generatePassword();

      // Création dans Supabase (RPC create_staff avec hash bcrypt)
      let newId = Math.max(...staff.map((s) => s.id)) + 1;
      if (isSupabaseConfigured) {
        const remoteId = await createStaffRemote(
          form.username,
          pwd,
          form.nom,
          form.prenom,
          form.role
        );
        if (remoteId === null) {
          setToast("Erreur : identifiant déjà utilisé ou problème Supabase");
          return;
        }
        newId = remoteId;
      }

      const newUser: Staff = {
        id: newId,
        prenom: form.prenom,
        nom: form.nom,
        username: form.username,
        role: form.role,
        actif: true,
        password_temp: pwd,
      };
      setStaff((prev) => [...prev, newUser]);
      setToast(
        `Compte créé ! Mot de passe temporaire : ${pwd}`
      );
    }
    resetForm();
  };

  const toggleActive = async (id: number) => {
    setStaff((prev) =>
      prev.map((s) => (s.id === id ? { ...s, actif: !s.actif } : s))
    );
    if (isSupabaseConfigured) {
      await toggleStaffActiveRemote(id);
    }
  };

  const deleteUser = (id: number) => {
    const user = staff.find((s) => s.id === id);
    if (user?.role === "admin") {
      setToast("Impossible de supprimer un administrateur");
      return;
    }
    if (confirm(`Supprimer ${user?.prenom} ${user?.nom} ?`)) {
      setStaff((prev) => prev.filter((s) => s.id !== id));
      setToast("Utilisateur supprimé");
    }
  };

  const editUser = (s: Staff) => {
    setForm({
      prenom: s.prenom,
      nom: s.nom,
      username: s.username,
      role: s.role,
    });
    setEditing(s);
    setShowForm(true);
  };

  const getRoleBadge = (role: Role) => {
    const map: Record<Role, { bg: string; icon: any; label: string }> = {
      admin: {
        bg: "bg-purple-100 text-purple-700 border-purple-200",
        icon: Shield,
        label: "Administrateur",
      },
      medecin: {
        bg: "bg-cyan-100 text-cyan-700 border-cyan-200",
        icon: Stethoscope,
        label: "Médecin",
      },
      infirmier: {
        bg: "bg-emerald-100 text-emerald-700 border-emerald-200",
        icon: Activity,
        label: "Infirmier",
      },
      gestionnaire: {
        bg: "bg-amber-100 text-amber-700 border-amber-200",
        icon: FolderArchive,
        label: "Gestionnaire",
      },
    };
    const { bg, icon: Icon, label } = map[role];
    return (
      <span
        className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border font-medium ${bg}`}
      >
        <Icon className="w-3 h-3" />
        {label}
      </span>
    );
  };

  const stats = {
    total: staff.length,
    actifs: staff.filter((s) => s.actif).length,
    medecins: staff.filter((s) => s.role === "medecin").length,
    infirmiers: staff.filter((s) => s.role === "infirmier").length,
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-wrap justify-between items-start gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestion des utilisateurs</h1>
          <p className="text-sm text-slate-500 mt-1">
            Créer et gérer les comptes médecin et infirmier · Réservé aux administrateurs
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          Nouveau compte
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total" value={stats.total} color="bg-slate-100 text-slate-700" />
        <StatCard label="Actifs" value={stats.actifs} color="bg-emerald-100 text-emerald-700" />
        <StatCard label="Médecins" value={stats.medecins} color="bg-cyan-100 text-cyan-700" />
        <StatCard label="Infirmiers" value={stats.infirmiers} color="bg-teal-100 text-teal-700" />
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, prénom ou identifiant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
          />
        </div>
      </div>

      {/* Liste */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Utilisateur</th>
                <th className="px-4 py-3 text-left">Identifiant</th>
                <th className="px-4 py-3 text-left">Rôle</th>
                <th className="px-4 py-3 text-left">Dernière connexion</th>
                <th className="px-4 py-3 text-left">Statut</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr
                  key={s.id}
                  className="border-t border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 text-white flex items-center justify-center font-semibold text-xs">
                        {s.prenom.charAt(0)}
                        {s.nom.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">
                          {s.nom} {s.prenom}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">
                    {s.username}
                  </td>
                  <td className="px-4 py-3">{getRoleBadge(s.role)}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {s.derniere_connexion
                      ? new Date(s.derniere_connexion).toLocaleString("fr-FR")
                      : "Jamais"}
                  </td>
                  <td className="px-4 py-3">
                    {s.actif ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Actif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                        <XCircle className="w-3 h-3" /> Désactivé
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => editUser(s)}
                        className="p-1.5 text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 rounded transition"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleActive(s.id)}
                        className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded transition"
                        title={s.actif ? "Désactiver" : "Activer"}
                      >
                        {s.actif ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => deleteUser(s.id)}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition"
                        title="Supprimer"
                        disabled={s.role === "admin"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal formulaire */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-5 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">
                {editing ? "Modifier l'utilisateur" : "Nouveau compte"}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {editing
                  ? "Modifier les informations"
                  : "Un mot de passe temporaire sera généré automatiquement"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Prénom
                  </label>
                  <input
                    type="text"
                    required
                    value={form.prenom}
                    onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
                    placeholder="Dr. Awa"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nom
                  </label>
                  <input
                    type="text"
                    required
                    value={form.nom}
                    onChange={(e) => setForm({ ...form, nom: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
                    placeholder="KONE"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Identifiant de connexion
                </label>
                <input
                  type="text"
                  required
                  value={form.username}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      username: e.target.value.toLowerCase().replace(/\s+/g, "."),
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none font-mono"
                  placeholder="dr.awa.kone"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Rôle
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["infirmier", "medecin", "gestionnaire", "admin"] as Role[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setForm({ ...form, role: r })}
                      className={`p-3 border-2 rounded-lg text-sm font-medium transition ${
                        form.role === r
                          ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                          : "border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        {r === "infirmier" && <Activity className="w-5 h-5" />}
                        {r === "medecin" && <Stethoscope className="w-5 h-5" />}
                        {r === "gestionnaire" && <FolderArchive className="w-5 h-5" />}
                        {r === "admin" && <Shield className="w-5 h-5" />}
                        <span className="capitalize">{r}</span>
                      </div>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {form.role === "gestionnaire" &&
                    "📂 Accès : patients (lecture), gestion documentaire, archivage des dossiers"}
                  {form.role === "infirmier" &&
                    "💉 Accès : patients (lecture), saisie des constantes"}
                  {form.role === "medecin" &&
                    "🩺 Accès : dashboard, patients, constantes, consultations, alertes"}
                  {form.role === "admin" && "🔑 Accès complet à toutes les fonctions"}
                </p>
              </div>

              {!editing && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2 text-xs text-blue-800">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    Un <strong>mot de passe temporaire sécurisé</strong> sera généré et
                    affiché après la création. L'utilisateur devra le changer à la première
                    connexion.
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white py-2 rounded-lg text-sm font-medium"
                >
                  {editing ? "Enregistrer" : "Créer le compte"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-[100] bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 max-w-md">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div className="flex-1">
            <div className="text-sm font-medium">{toast}</div>
            {toast.includes("Mot de passe") && (
              <button
                onClick={() => {
                  const pwd = toast.split(" : ")[1];
                  if (pwd) navigator.clipboard?.writeText(pwd);
                }}
                className="text-xs text-cyan-300 hover:text-cyan-200 flex items-center gap-1 mt-1"
              >
                <Copy className="w-3 h-3" /> Copier le mot de passe
              </button>
            )}
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-white"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className={`${color} rounded-xl p-4`}>
      <div className="text-xs font-medium opacity-80">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}
