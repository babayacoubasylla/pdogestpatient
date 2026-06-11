import { createContext, useContext, useState, type ReactNode } from "react";
import type { User } from "../types";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (username: string, password: string) => {
    if (!isSupabaseConfigured || !supabase) {
      return { ok: false, error: "Supabase non configuré. Vérifiez .env" };
    }

    try {
      const { data, error } = await supabase
        .from("staff")
        .select("*")
        .eq("username", username)
        .eq("password_hash", password)
        .eq("actif", true)
        .maybeSingle();

      if (error || !data) {
        return { ok: false, error: "Identifiants incorrects ou compte désactivé" };
      }

      // Mise à jour de la dernière connexion
      await supabase
        .from("staff")
        .update({ derniere_connexion: new Date().toISOString() })
        .eq("id", data.id);

      // Log d'audit
      await supabase.from("audit_logs").insert({
        user_role: data.role,
        user_name: `${data.prenom} ${data.nom}`,
        action: "connexion",
        cible_type: "staff",
        cible_id: data.id.toString(),
        details: "Connexion réussie",
      });

      setUser(data as User);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: "Erreur de connexion au serveur" };
    }
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être dans AuthProvider");
  return ctx;
}