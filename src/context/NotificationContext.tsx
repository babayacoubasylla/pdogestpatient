import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
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
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      setTimeout(() => Notification.requestPermission(), 3000);
    }
  }, []);

  const addNotification = useCallback(
    (n: Omit<Notification, "id" | "timestamp" | "read">) => {
      const newNotif: Notification = {
        ...n,
        id: `n-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toISOString(),
        read: false,
      };
      setNotifications((prev) => [newNotif, ...prev].slice(0, 50));

      window.dispatchEvent(
        new CustomEvent("show-toast", {
          detail: { title: n.title, message: n.message, type: n.type },
        })
      );

      if (
        typeof window !== "undefined" &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        new Notification(n.title, { body: n.message });
      }
    },
    []
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => setNotifications([]), []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // ✅ Abonnement temps réel placé DANS useEffect (une seule fois)
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const channel = supabase
      .channel("alertes-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "alertes" },
        (payload) => {
          const a = payload.new as any;
          addNotification({
            type: "alerte",
            title: `⚠️ Nouvelle alerte ${a.niveau === "danger" ? "critique" : ""}`,
            message: a.message,
            level: a.niveau,
            patientId: a.patient_id,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [addNotification]);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead, clearAll }}
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