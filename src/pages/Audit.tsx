import { useState, useEffect } from "react";
import { Shield, Loader2 } from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import type { AuditLog } from "../types";

export function Audit() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            if (!isSupabaseConfigured || !supabase) { setLoading(false); return; }
            const { data } = await supabase.from("audit_logs").select("*").order("date_action", { ascending: false }).limit(200);
            if (data) setLogs(data as AuditLog[]);
            setLoading(false);
        }
        load();
    }, []);

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-cyan-600" /></div>;

    return (
        <div className="p-6 space-y-5">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Shield className="w-7 h-7 text-cyan-600" />
                    Audit & Traçabilité
                </h1>
                <p className="text-sm text-slate-500 mt-1">Historique de toutes les actions effectuées (confidentialité)</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                        <tr>
                            <th className="px-4 py-3 text-left">Date</th>
                            <th className="px-4 py-3 text-left">Utilisateur</th>
                            <th className="px-4 py-3 text-left">Rôle</th>
                            <th className="px-4 py-3 text-left">Action</th>
                            <th className="px-4 py-3 text-left">Détails</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {logs.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-slate-500">Aucun log d'audit pour l'instant. Les actions seront enregistrées ici.</td></tr>
                        ) : logs.map((l) => (
                            <tr key={l.id} className="hover:bg-slate-50">
                                <td className="px-4 py-3 text-xs text-slate-500">{new Date(l.date_action).toLocaleString("fr-FR")}</td>
                                <td className="px-4 py-3 font-semibold">{l.user_name || "—"}</td>
                                <td className="px-4 py-3"><span className="text-xs bg-slate-100 px-2 py-0.5 rounded">{l.user_role}</span></td>
                                <td className="px-4 py-3"><code className="text-xs bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded">{l.action}</code></td>
                                <td className="px-4 py-3 text-xs text-slate-600">{l.details}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}