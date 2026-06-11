import { useState, useEffect } from "react";
import { Bell, Check, X, AlertTriangle, Info, CheckCircle2, RefreshCw, User, Trash2 } from "lucide-react";
import { useNotifications } from "../context/NotificationContext";
import { formatRelativeDate } from "../data/mockData";

export function NotificationCenter() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } =
    useNotifications();
  const [open, setOpen] = useState(false);

  const getIcon = (type: string, level?: string) => {
    switch (type) {
      case "alerte":
        return (
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              level === "danger" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
          </div>
        );
      case "success":
        return (
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        );
      case "patient":
        return (
          <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
        );
      case "sync":
        return (
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
            <RefreshCw className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
            <Info className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-slate-100 transition"
        title="Notifications"
      >
        <Bell className="w-5 h-5 text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-96 max-h-[70vh] bg-white rounded-xl shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900">Notifications</h3>
                <p className="text-xs text-slate-500">
                  {unreadCount > 0 ? `${unreadCount} non lue(s)` : "Toutes lues"}
                </p>
              </div>
              <div className="flex gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-cyan-600 hover:text-cyan-700 px-2 py-1 rounded-md hover:bg-cyan-50 flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" /> Tout lire
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-xs text-slate-500 hover:text-red-600 px-2 py-1 rounded-md hover:bg-red-50 flex items-center gap-1"
                    title="Effacer tout"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-400">
                  Aucune notification
                </div>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    className={`w-full text-left p-3 border-b border-slate-100 hover:bg-slate-50 transition flex gap-3 ${
                      !n.read ? "bg-cyan-50/40" : ""
                    }`}
                  >
                    {getIcon(n.type, n.level)}
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-sm ${
                          !n.read ? "font-semibold text-slate-900" : "text-slate-700"
                        }`}
                      >
                        {n.title}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                        {n.message}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        {formatRelativeDate(n.timestamp)}
                      </div>
                    </div>
                    {!n.read && (
                      <div className="w-2 h-2 rounded-full bg-cyan-500 mt-2 flex-shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Toast container
export function ToastContainer() {
  const [toasts, setToasts] = useState<
    { id: string; title: string; message: string; type: string }[]
  >([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const id = `t-${Date.now()}`;
      setToasts((prev) => [...prev, { id, ...detail }].slice(-3));
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    };
    window.addEventListener("show-toast", handler);
    return () => window.removeEventListener("show-toast", handler);
  }, []);

  const getStyle = (type: string) => {
    switch (type) {
      case "alerte":
        return "border-l-4 border-red-500 bg-red-50";
      case "success":
        return "border-l-4 border-emerald-500 bg-emerald-50";
      case "warning":
        return "border-l-4 border-amber-500 bg-amber-50";
      case "sync":
        return "border-l-4 border-blue-500 bg-blue-50";
      default:
        return "border-l-4 border-cyan-500 bg-cyan-50";
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[100] space-y-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`${getStyle(
            t.type
          )} rounded-lg shadow-lg p-3 flex items-start gap-2 animate-[slideIn_0.3s_ease-out]`}
        >
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm text-slate-900">{t.title}</div>
            <div className="text-xs text-slate-600 mt-0.5">{t.message}</div>
          </div>
          <button
            onClick={() =>
              setToasts((prev) => prev.filter((x) => x.id !== t.id))
            }
            className="text-slate-400 hover:text-slate-700 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
