import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { ALERTES, PATIENTS } from "../data/mockData";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

export interface Notification {
  id: string;
  type: "alerte" | "info" | "success" | "warning" | "patient" | "sync";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  patientId?: number;
  level?: "warning" | "danger";
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (n: Omit<Notification, "id" | "timestamp" | "read">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    // Notifications initiales basées sur les alertes actives
    return ALERTES.filter((a) => !a.traitee).map((a, i) => ({
      id: `init-${i}`,
      type: "alerte" as const,
      title: `⚠️ Alerte ${a.niveau === "danger" ? "critique" : ""} : ${a.patient_nom}`,
      message: `${a.message} — ${a.valeur} ${a.unite} (normale: ${a.seuil_min}-${a.seuil_max})`,
      timestamp: a.date_creation,
      read: false,
      patientId: a.patient_id,
      level: a.niveau,
    }));
  });

  const addNotification = useCallback(
    (n: Omit<Notification, "id" | "timestamp" | "read">) => {
      const newNotif: Notification = {
        ...n,
        id: `n-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toISOString(),
        read: false,
      };
      setNotifications((prev) => [newNotif, ...prev].slice(0, 50));

      // Toast event
      window.dispatchEvent(
        new CustomEvent("show-toast", {
          detail: {
            title: n.title,
            message: n.message,
            type: n.type,
          },
        })
      );

      // Notification navigateur
      if (typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification(n.title, {
            body: n.message,
            icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%230891b2'%3E%3Cpath d='M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z'/%3E%3C/svg%3E",
          });
        }
      }
    },
    []
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => setNotifications([]), []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // ============================================
  // TEMPS RÉEL SUPABASE : notifications instantanées
  // dès qu'une alerte / un patient / une constante est insérée
  // ============================================
  useEffect(() => {
    if (!supabase) return;
    const sb = supabase;

    const channel = sb
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "alertes" },
        (payload: any) => {
          const a = payload.new;
          addNotification({
            type: "alerte",
            title: `⚠️ Alerte ${a.niveau === "danger" ? "CRITIQUE" : ""} détectée`,
            message: `${a.message} — ${a.valeur} ${a.unite} (normale: ${a.seuil_min}-${a.seuil_max})`,
            patientId: a.patient_id,
            level: a.niveau,
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "patients" },
        (payload: any) => {
          const p = payload.new;
          addNotification({
            type: "sync",
            title: "🔄 Nouveau patient synchronisé depuis SGH",
            message: `${p.nom} ${p.prenom} — NIP : ${p.nip}`,
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "constantes" },
        (payload: any) => {
          const c = payload.new;
          addNotification({
            type: "patient",
            title: "📋 Nouvelles constantes saisies",
            message: `Tension: ${c.tension_systole}/${c.tension_diastole} · Pouls: ${c.pouls} · Temp: ${c.temperature}°C (par ${c.saisie_par})`,
          });
        }
      )
      .subscribe();

    return () => {
      sb.removeChannel(channel);
    };
  }, [addNotification]);

  // Simulation d'activité (UNIQUEMENT en mode démo sans Supabase)
  useEffect(() => {
    if (isSupabaseConfigured) return;
    const messages = [
      {
        type: "sync" as const,
        title: "🔄 Synchronisation Firebird",
        message: "2 nouveaux patients détectés depuis SGH",
      },
      {
        type: "patient" as const,
        title: `📋 Nouvelles constantes : ${PATIENTS[1].nom} ${PATIENTS[1].prenom}`,
        message: "Tension : 128/82 · Pouls : 74 · Temp : 36.7°C",
      },
      {
        type: "info" as const,
        title: "📄 Consultation terminée",
        message: "Dr. KONE a terminé la consultation de BAMBA Salimata",
      },
    ];

    const interval = setInterval(() => {
      const msg = messages[Math.floor(Math.random() * messages.length)];
      addNotification(msg);
    }, 45000); // toutes les 45 secondes en démo

    return () => clearInterval(interval);
  }, [addNotification]);

  // Demander la permission de notifications navigateur
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      setTimeout(() => Notification.requestPermission(), 3000);
    }
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be in NotificationProvider");
  return ctx;
}
