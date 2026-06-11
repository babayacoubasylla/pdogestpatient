import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Square, Play, Pause, Loader2, AlertCircle } from "lucide-react";
import i18n from "../i18n";

interface AudioReaderProps {
    text: string;
    className?: string;
    compact?: boolean;
    size?: "sm" | "md" | "lg";
}

// === MAP DES LANGUES VERS CODES BCP-47 POUR WEB SPEECH API ===
// Les langues ivoiriennes locales n'existent PAS dans les navigateurs.
// On indique la langue "parente" la plus proche en fallback.
const LANG_MAP: Record<string, { code: string; available: boolean; fallback?: string; note?: string }> = {
    fr: { code: "fr-FR", available: true },
    en: { code: "en-US", available: true },
    dioula: { code: "fr-FR", available: false, fallback: "fr", note: "Dioula — utilisez le français" },
    baoule: { code: "fr-FR", available: false, fallback: "fr", note: "Baoulé — utilisez le français" },
    bhete: { code: "fr-FR", available: false, fallback: "fr", note: "Bété — utilisez le français" },
    senoufo: { code: "fr-FR", available: false, fallback: "fr", note: "Sénoufo — utilisez le français" },
    agni: { code: "fr-FR", available: false, fallback: "fr", note: "Agni — utilisez le français" },
    attie: { code: "fr-FR", available: false, fallback: "fr", note: "Attié — utilisez le français" },
    guere: { code: "fr-FR", available: false, fallback: "fr", note: "Guéré — utilisez le français" },
    wobe: { code: "fr-FR", available: false, fallback: "fr", note: "Wobè — utilisez le français" },
    yacouba: { code: "fr-FR", available: false, fallback: "fr", note: "Yacouba — utilisez le français" },
    lobi: { code: "fr-FR", available: false, fallback: "fr", note: "Lobi — utilisez le français" },
};

export function AudioReader({ text, className = "", compact = false, size = "sm" }: AudioReaderProps) {
    const [playing, setPlaying] = useState(false);
    const [supported, setSupported] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    const currentLang = i18n.language || "fr";
    const langConfig = LANG_MAP[currentLang] || LANG_MAP.fr;

    useEffect(() => {
        if (typeof window !== "undefined" && !("speechSynthesis" in window)) {
            setSupported(false);
        }
        return () => {
            if (typeof window !== "undefined" && window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    // Recharger la voix quand la langue change
    useEffect(() => {
        if (typeof window !== "undefined" && window.speechSynthesis) {
            window.speechSynthesis.cancel();
            setPlaying(false);
        }
    }, [currentLang]);

    const speak = () => {
        if (!supported) {
            setError("Audio non supporté par votre navigateur");
            setTimeout(() => setError(null), 3000);
            return;
        }
        if (!text || text.trim() === "") {
            setError("Aucun texte à lire");
            setTimeout(() => setError(null), 3000);
            return;
        }

        setError(null);
        setLoading(true);

        // Annuler toute lecture en cours
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = langConfig.code;
        utterance.rate = 0.9; // Vitesse légèrement réduite pour clarté
        utterance.pitch = 1;
        utterance.volume = 1;

        // Chercher une voix dans la bonne langue
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find((v) => v.lang.startsWith(langConfig.code.split("-")[0]));
        if (voice) utterance.voice = voice;

        utterance.onstart = () => {
            setLoading(false);
            setPlaying(true);
        };
        utterance.onend = () => {
            setPlaying(false);
        };
        utterance.onerror = () => {
            setLoading(false);
            setPlaying(false);
            setError("Erreur de lecture");
            setTimeout(() => setError(null), 3000);
        };

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    };

    const stop = () => {
        window.speechSynthesis.cancel();
        setPlaying(false);
    };

    const sizeClasses = {
        sm: "w-7 h-7",
        md: "w-9 h-9",
        lg: "w-11 h-11",
    };
    const iconSizes = {
        sm: "w-3.5 h-3.5",
        md: "w-4 h-4",
        lg: "w-5 h-5",
    };

    if (!langConfig.available) {
        // Pour les langues locales non supportées : montrer un bouton "inactif" + message
        if (compact) {
            return (
                <span
                    className={`inline-flex items-center justify-center ${sizeClasses[size]} bg-slate-100 text-slate-400 rounded-full cursor-help ${className}`}
                    title={langConfig.note}
                >
                    <VolumeX className={iconSizes[size]} />
                </span>
            );
        }
        return (
            <span
                className={`inline-flex items-center gap-2 text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-md border border-amber-200 ${className}`}
                title={langConfig.note}
            >
                <VolumeX className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{langConfig.note}</span>
            </span>
        );
    }

    if (!supported) {
        return null;
    }

    if (compact) {
        return (
            <button
                onClick={playing ? stop : speak}
                disabled={loading}
                className={`inline-flex items-center justify-center ${sizeClasses[size]} rounded-full transition ${playing
                        ? "bg-red-100 text-red-700 hover:bg-red-200 animate-pulse"
                        : "bg-cyan-50 text-cyan-700 hover:bg-cyan-100"
                    } ${className}`}
                title={playing ? "Arrêter la lecture" : "Écouter le texte"}
            >
                {loading ? <Loader2 className={`${iconSizes[size]} animate-spin`} /> :
                    playing ? <Square className={iconSizes[size]} /> :
                        <Volume2 className={iconSizes[size]} />}
            </button>
        );
    }

    return (
        <div className={`inline-flex items-center gap-2 ${className}`}>
            <button
                onClick={playing ? stop : speak}
                disabled={loading}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${playing
                        ? "bg-red-100 text-red-700 hover:bg-red-200"
                        : "bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border border-cyan-200"
                    } disabled:opacity-50`}
                title={playing ? "Arrêter" : "Écouter en audio"}
            >
                {loading ? (
                    <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Chargement...
                    </>
                ) : playing ? (
                    <>
                        <Square className="w-3.5 h-3.5" /> Arrêter
                    </>
                ) : (
                    <>
                        <Play className="w-3.5 h-3.5" /> Écouter
                    </>
                )}
            </button>
            {error && (
                <span className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {error}
                </span>
            )}
        </div>
    );
}