import { createContext, useContext, useState, type ReactNode } from "react";
import type { User } from "../types";
import { USERS_MOCK } from "../data/mockData";
import { loginStaff, isSupabaseConfigured } from "../services/api";

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (username: string, password: string) => {
    // 1. Tentative via Supabase (table staff + RPC login_staff)
    if (isSupabaseConfigured) {
      const supaUser = await loginStaff(username, password);
      if (supaUser) {
        setUser(supaUser);
        return { ok: true };
      }
      // Si Supabase est actif mais identifiants invalides → on tente le fallback démo
    }

    // 2. Fallback : comptes de démonstration
    const found = USERS_MOCK.find(
      (u) => u.username === username && u.password === password
    );
    if (!found) return { ok: false, error: "Identifiants incorrects" };
    const { password: _pw, ...safeUser } = found;
    setUser(safeUser);
    return { ok: true };
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
  if (!ctx) throw new Error("useAuth doit être utilisé dans AuthProvider");
  return ctx;
}
