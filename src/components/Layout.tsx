import type { ReactNode } from "react";
import {
  LayoutDashboard,
  Users,
  Activity,
  AlertTriangle,
  FileText,
  BarChart3,
  LogOut,
  Stethoscope,
  Wifi,
  UserCog,
  Link2,
  FolderArchive,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { NotificationCenter } from "./NotificationCenter";
import type { PageId } from "../types";

interface LayoutProps {
  children: ReactNode;
  currentPage: PageId;
  onNavigate: (page: PageId, payload?: any) => void;
}

const NAV_ITEMS: { id: PageId; label: string; icon: any; roles: string[] }[] = [
  { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard, roles: ["medecin", "admin"] },
  { id: "patients", label: "Patients", icon: Users, roles: ["infirmier", "medecin", "admin", "gestionnaire"] },
  { id: "constantes", label: "Saisie Constantes", icon: Activity, roles: ["infirmier", "medecin", "admin"] },
  { id: "consultations", label: "Consultations", icon: FileText, roles: ["medecin", "admin"] },
  { id: "alertes", label: "Alertes", icon: AlertTriangle, roles: ["medecin", "admin"] },
  { id: "archives", label: "Archives", icon: FolderArchive, roles: ["gestionnaire", "admin"] },
  { id: "stats", label: "Statistiques", icon: BarChart3, roles: ["admin"] },
  { id: "users", label: "Utilisateurs", icon: UserCog, roles: ["admin"] },
  { id: "integration", label: "Intégration SGH", icon: Link2, roles: ["admin"] },
];

export function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const { user, logout } = useAuth();

  const visibleNav = NAV_ITEMS.filter((n) => user && n.roles.includes(user.role));

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-cyan-800 to-cyan-950 text-white flex flex-col shadow-xl">
        <div className="p-5 border-b border-cyan-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-sm leading-tight">Paracliniques</div>
              <div className="text-xs text-cyan-200 leading-tight">des Oliviers</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const active =
              currentPage === item.id ||
              (item.id === "patients" && currentPage === "patient-detail");
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  active
                    ? "bg-white/15 text-white shadow-inner"
                    : "text-cyan-100 hover:bg-white/10"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
                {item.id === "alertes" && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                    5
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-cyan-700/50 space-y-2">
          <div className="flex items-center gap-2 text-xs text-cyan-200 px-2">
            <Wifi className="w-3.5 h-3.5 text-green-400 animate-pulse" />
            <span>Sync Firebird active</span>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-xs text-cyan-200">Connecté en tant que</div>
            <div className="font-semibold text-sm">
              {user?.prenom} {user?.nom}
            </div>
            <div className="text-xs text-cyan-300 capitalize">{user?.role}</div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-cyan-100 hover:bg-red-500/20 hover:text-red-200 transition"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main content with top bar */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
          <div className="text-sm text-slate-500">
            {new Date().toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
          <div className="flex items-center gap-2">
            <NotificationCenter />
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 text-white flex items-center justify-center font-semibold text-xs">
                {user?.prenom?.charAt(0)}
                {user?.nom?.charAt(0)}
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-semibold text-slate-900">
                  {user?.prenom} {user?.nom}
                </div>
                <div className="text-xs text-slate-500 capitalize">{user?.role}</div>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
