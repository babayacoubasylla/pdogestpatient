import { useState } from "react";
import { Play, Pause, Volume2, Loader2 } from "lucide-react";

interface AudioPlayerCustomProps {
    src: string; // URL du fichier audio préenregistré
    label?: string;
}

export function AudioPlayerCustom({ src, label = "Écouter en langue locale" }: AudioPlayerCustomProps) {
    const [playing, setPlaying] = useState(false);
    const [loading, setLoading] = useState(false);

    const toggle = () => {
        const audio = document.getElementById(`audio-${src}`) as HTMLAudioElement;
        if (!audio) return;
        if (playing) {
            audio.pause();
            setPlaying(false);
        } else {
            setLoading(true);
            audio.play();
            setPlaying(true);
        }
    };

    return (
        <div className="inline-flex items-center gap-2">
            <button
                onClick={toggle}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${playing ? "bg-red-100 text-red-700" : "bg-amber-50 text-amber-800 border border-amber-200"
                    }`}
            >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
                    playing ? <Pause className="w-3.5 h-3.5" /> :
                        <Play className="w-3.5 h-3.5" />}
                <Volume2 className="w-3.5 h-3.5" />
                {label}
            </button>
            <audio
                id={`audio-${src}`}
                src={src}
                onLoadStart={() => setLoading(false)}
                onEnded={() => setPlaying(false)}
                onPause={() => setPlaying(false)}
                onPlay={() => { setPlaying(true); setLoading(false); }}
            />
        </div>
    );
}