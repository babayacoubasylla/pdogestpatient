import { useState } from "react";
import { QrCode, Copy, X, CheckCircle2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export function QrCodeButton({ nip, patientName }: { nip: string; patientName: string }) {
    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const url = `${window.location.origin}/public/patient/${nip}`;

    return (
        <>
            <button onClick={() => setOpen(true)} className="text-xs bg-cyan-50 text-cyan-700 hover:bg-cyan-100 px-2 py-1 rounded transition flex items-center gap-1" title="QR Code Carnet">
                <QrCode className="w-3 h-3" /> QR Carnet
            </button>

            {open && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
                    <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-bold text-slate-900">Carnet digital de {patientName}</h3>
                            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="text-center">
                            <div className="inline-block bg-white p-3 rounded-lg border-2 border-cyan-100">
                                <QRCodeSVG value={url} size={200} level="H" />
                            </div>
                            <p className="text-xs text-slate-500 mt-3">Scannez pour accéder au carnet depuis votre téléphone</p>
                            <div className="mt-3 bg-slate-50 p-2 rounded text-xs font-mono break-all">{url}</div>
                            <button
                                onClick={() => {
                                    navigator.clipboard?.writeText(url);
                                    setCopied(true);
                                    setTimeout(() => setCopied(false), 2000);
                                }}
                                className="mt-3 w-full text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded transition flex items-center justify-center gap-1"
                            >
                                {copied ? <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Copié !</> : <><Copy className="w-3.5 h-3.5" /> Copier le lien</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}