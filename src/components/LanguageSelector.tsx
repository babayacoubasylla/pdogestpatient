import { useState } from "react";
import { Globe, Search } from "lucide-react";
import i18n from "../i18n";

const LANGS = [
    { code: "fr", label: "Français", region: "Officielle", flag: "🇫🇷" },
    { code: "en", label: "English", region: "International", flag: "🇬🇧" },
    { code: "dioula", label: "Dioula", region: "Malinké · Nord", flag: "🌍" },
    { code: "baoule", label: "Baoulé", region: "Centre · Bouaké", flag: "🌍" },
    { code: "bhete", label: "Bété", region: "Ouest · Gagnoa", flag: "🌍" },
    { code: "senoufo", label: "Sénoufo", region: "Nord · Korhogo", flag: "🌍" },
    { code: "agni", label: "Agni", region: "Est · Abengourou", flag: "🌍" },
    { code: "attie", label: "Attié", region: "Sud · Adzopé", flag: "🌍" },
    { code: "guere", label: "Guéré", region: "Ouest · Man", flag: "🌍" },
    { code: "wobe", label: "Wobè", region: "Nord-Ouest · Man", flag: "🌍" },
    { code: "yacouba", label: "Yacouba", region: "Ouest · Man", flag: "🌍" },
    { code: "lobi", label: "Lobi/Koulango", region: "Nord-Est · Bouna", flag: "🌍" },
];

export function LanguageSelector() {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const current = i18n.language;

    const change = (code: string) => {
        i18n.changeLanguage(code);
        localStorage.setItem("lang", code);
        setOpen(false);
        setSearch("");
        window.location.reload();
    };

    const filtered = LANGS.filter(
        (l) => l.label.toLowerCase().includes(search.toLowerCase()) || l.region.toLowerCase().includes(search.toLowerCase())
    );

    const currentLang = LANGS.find((l) => l.code === current);

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-slate-100 rounded-lg text-sm"
                title="Changer de langue"
            >
                <Globe className="w-4 h-4 text-slate-600" />
                <span className="text-slate-700 font-medium hidden md:inline">{currentLang?.label || "Français"}</span>
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-2xl border border-slate-200 z-50 overflow-hidden">
                        {/* Header recherche */}
                        <div className="p-3 border-b border-slate-100 bg-slate-50">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Rechercher une langue..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Liste */}
                        <div className="max-h-80 overflow-y-auto">
                            {filtered.map((l) => (
                                <button
                                    key={l.code}
                                    onClick={() => change(l.code)}
                                    className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-slate-50 transition ${current === l.code ? "bg-cyan-50 text-cyan-700 font-semibold" : "text-slate-700"
                                        }`}
                                >
                                    <div>
                                        <div className="font-medium">{l.label}</div>
                                        <div className="text-xs text-slate-500">{l.region}</div>
                                    </div>
                                    {current === l.code && <span className="text-cyan-600 text-xs">✓</span>}
                                </button>
                            ))}
                            {filtered.length === 0 && (
                                <div className="p-4 text-center text-sm text-slate-400">Aucune langue trouvée</div>
                            )}
                        </div>

                        <div className="px-3 py-2 border-t border-slate-100 bg-slate-50 text-xs text-slate-500">
                            🇨🇮 12 langues disponibles
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}