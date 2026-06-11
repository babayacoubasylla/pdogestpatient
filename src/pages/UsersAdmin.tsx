import { useState, useEffect } from "react";
import { UserPlus, Edit, Eye, EyeOff, Shield, Stethoscope, Activity, FolderArchive, X, Loader2, CheckCircle2 } from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import type { Role, User } from "../types";

const ROLES: { value: Role; label: string; icon: any; color: string }[] = [
  { value: "admin", label: "Administrateur", icon: Shield, color: "bg-purple-100 text-purple-700" },
  { value: "medecin", label: "Médecin", icon: Stethoscope, color: "bg-cyan-100 text-cyan-700" },
  { value: "infirmier", label: "Infirmier", icon: Activity, color: "bg-emerald-100 text-emerald-700" },
  { value: "archiviste", label: "Archiviste", icon: FolderArchive, color: "bg-amber-100 text-amber-700" },
  { value: "secretaire", label: "Secrétaire", icon: UserPlus, color: "bg-pink-100 text-pink-700" },
];

function generatePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#";
  let pwd = "";
  for (let i = 0; i < 10; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
  return pwd;
}

export function UsersAdmin() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [toast, setToast] = useState<{ msg: string; pwd?: string } | null>(null);

  const [form, setForm] = useState({
    prenom: "", nom: "", username: "", role: "infirmier" as Role,
  });

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  useEffect(() => { load(); }, []);

  async function load() {
    if (!isSupabaseConfigured || !supabase) { setLoading(false); return; }
    const { data } = await supabase.from("staff").select("*").order("role");
    if (data) setUsers(data as User[]);
    setLoading(false);
  }

  function resetForm() {
    setForm({ prenom: "", nom: "", username: "", role: "infirmier" });
    setEditing(null);
    setShowForm(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;

    if (editing) {
      const { error } = await supabase.from("staff").update({
        prenom: form.prenom, nom: form.nom, username: form.username, role: form.role,
      }).eq("id", editing.id);

      if (!error) {
        await supabase.from("audit_logs").insert({
          user_role: "admin", user_name: "admin", action: "modification_utilisateur",
          cible_type: "staff", cible_id: editing.id.toString(),
          details: `${form.prenom} ${form.nom} modifié`,
        });
        setToast({ msg: `Utilisateur ${form.prenom} ${form.nom} mis à jour` });
        await load();
      }
    } else {
      const pwd = generatePassword();
      const { data, error } = await supabase.from("staff").insert({
        prenom: form.prenom, nom: form.nom, username: form.username,
        role: form.role, password_hash: pwd, actif: true,
      }).select().single();

      if (!error && data) {
        await supabase.from("audit_logs").insert({
          user_role: "admin", user_name: "admin", action: "creation_utilisateur",
          cible_type: "staff", cible_id: data.id.toString(),
          details: `Compte ${form.role} créé pour ${form.prenom} ${form.nom}`,
        });
        setToast({ msg: `Compte créé pour ${form.prenom} ${form.nom}`, pwd });
        await load();
      } else {
        setToast({ msg: `Erreur : ${error?.message}` });
      }
    }
    resetForm();
  }

  async function toggleActive(id: number, current: boolean) {
    if (!supabase) return;
    await supabase.from("staff").update({ actif: !current }).eq("id", id);
    await load();
  }

  function editUser(u: User) {
    setForm({ prenom: u.prenom, nom: u.nom, username: u.username, role: u.role });
    setEditing(u);
    setShowForm(true);
  }

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return !q || u.nom.toLowerCase().includes(q) || u.prenom.toLowerCase().includes(q) || u.username.toLowerCase().includes(q) || u.role.toLowerCase().includes(q);
  });

  const stats = {
    total: users.length,
    actifs: users.filter((u) => u.actif).length,
    medecins: users.filter((u) => u.role === "medecin").length,
    infirmiers: users.filter((u) => u.role === "infirmier").length,
    secretaires: users.filter((u) => u.role === "secretaire").length,
    archivistes: users.filter((u) => u.role === "archiviste").length,
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-cyan-600" /></div>;

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-wrap justify-between items-start gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestion des Utilisateurs</h1>
          <p className="text-sm text-slate-500 mt-1">Créer et gérer les comptes du personnel de la clinique</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm">
          <UserPlus className="w-4 h-4" /> Nouveau compte
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <StatCard label="Total" value={stats.total} color="bg-slate-100 text-slate-700" />
        <StatCard label="Actifs" value={stats.actifs} color="bg-emerald-100 text-emerald-700" />
        <StatCard label="Médecins" value={stats.medecins} color="bg-cyan-100 text-cyan-700" />
        <StatCard label="Infirmiers" value={stats.infirmiers} color="bg-teal-100 text-teal-700" />
        <StatCard label="Secrétaires" value={stats.secretaires} color="bg-pink-100 text-pink-700" />
        <StatCard label=" Archivistes" value={stats.archivistes} color="bg-amber-100 text-amber-700" />
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <input type="text" placeholder="Rechercher par nom, identifiant ou rôle..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none" />
      </div>

      {/* Liste */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Utilisateur</th>
              <th className="px-4 py-3 text-left">Identifiant</th>
              <th className="px-4 py-3 text-left">Rôle</th>
              <th className="px-4 py-3 text-left">Statut</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((u) => {
              const roleInfo = ROLES.find((r) => r.value === u.role);
              const Icon = roleInfo?.icon || UserPlus;
              return (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full ${roleInfo?.color} flex items-center justify-center`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{u.nom} {u.prenom}</div>
                        <div className="text-xs text-slate-500">{u.derniere_connexion ? `Vu le ${new Date(u.derniere_connexion).toLocaleDateString("fr-FR")}` : "Jamais connecté"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">{u.username}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full ${roleInfo?.color}`}>{roleInfo?.label || u.role}</span></td>
                  <td className="px-4 py-3">
                    {u.actif ? <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">Actif</span> : <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">Désactivé</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => editUser(u)} className="p-1.5 text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 rounded transition" title="Modifier"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => toggleActive(u.id, u.actif)} className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded transition" title={u.actif ? "Désactiver" : "Activer"}>
                        {u.actif ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-slate-500">Aucun utilisateur</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Modal formulaire */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">{editing ? "Modifier" : "Nouveau compte"}</h2>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Prénom *</label>
                  <input required type="text" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nom *</label>
                  <input required type="text" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Identifiant de connexion *</label>
                <input required type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().replace(/\s+/g, ".") })} className="w-full px-3 py-2 border rounded-lg font-mono" placeholder="ex: dr.awa.kone" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Rôle *</label>
                <div className="grid grid-cols-2 gap-2">
                  {ROLES.map((r) => {
                    const Icon = r.icon;
                    return (
                      <button key={r.value} type="button" onClick={() => setForm({ ...form, role: r.value })} className={`p-3 border-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${form.role === r.value ? "border-cyan-500 bg-cyan-50 text-cyan-700" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}>
                        <Icon className="w-4 h-4" /> {r.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              {!editing && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
                  Un mot de passe temporaire sécurisé sera généré automatiquement. L'utilisateur devra le changer à la première connexion.
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={resetForm} className="flex-1 py-2 border rounded-lg text-sm">Annuler</button>
                <button type="submit" className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white py-2 rounded-lg text-sm font-medium">{editing ? "Enregistrer" : "Créer le compte"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-4 right-4 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 max-w-md z-50">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div className="flex-1">
            <div className="text-sm font-medium">{toast.msg}</div>
            {toast.pwd && (
              <div className="text-xs text-cyan-300 mt-1 font-mono">
                Mot de passe : <span className="bg-slate-800 px-2 py-0.5 rounded">{toast.pwd}</span>
              </div>
            )}
          </div>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`${color} rounded-xl p-3`}>
      <div className="text-xs font-medium opacity-80">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}