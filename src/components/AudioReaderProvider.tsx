import { useState, useEffect } from "react";
import { AudioReader } from "./AudioReader";
import { Volume2, X } from "lucide-react";

export function AudioReaderProvider() {
    const [showBubble, setShowBubble] = useState(false);
    const [selectedText, setSelectedText] = useState("");

    useEffect(() => {
        const handleSelection = () => {
            const sel = window.getSelection();
            const text = sel?.toString().trim() || "";
            if (text.length > 2) {
                setSelectedText(text);
                setShowBubble(true);
            } else {
                setShowBubble(false);
            }
        };

        document.addEventListener("mouseup", handleSelection);
        document.addEventListener("touchend", handleSelection);
        return () => {
            document.removeEventListener("mouseup", handleSelection);
            document.removeEventListener("touchend", handleSelection);
        };
    }, []);

    if (!showBubble) return null;

    return (
        <div className="fixed bottom-24 right-4 z-50 bg-white shadow-2xl rounded-xl border border-slate-200 p-3 max-w-xs animate-[slideIn_0.2s_ease-out]">
            <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-700">
                    <Volume2 className="w-4 h-4 text-cyan-600" />
                    <span>Texte sélectionné</span>
                </div>
                <button onClick={() => setShowBubble(false)} className="text-slate-400 hover:text-slate-700">
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>
            <div className="text-xs text-slate-600 italic line-clamp-2 mb-2">"{selectedText}"</div>
            <AudioReader text={selectedText} size="sm" />
        </div>
    );
}