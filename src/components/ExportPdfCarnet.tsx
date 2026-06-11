import { useState } from "react";
import { FileDown, Loader2, X } from "lucide-react";
import jsPDF from "jspdf";
import { useAuth } from "../context/AuthContext";

interface ExportPdfProps {
    patient: any;
    carnet: any;
    constantes?: any[];
}

export function ExportPdfCarnet({ patient, carnet, constantes = [] }: ExportPdfProps) {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [generating, setGenerating] = useState(false);

    const generate = async () => {
        setGenerating(true);

        const pdf = new jsPDF("p", "mm", "a4");
        const W = pdf.internal.pageSize.getWidth();

        // En-tête
        pdf.setFillColor(8, 145, 178);
        pdf.rect(0, 0, W, 30, "F");
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(18);
        pdf.setFont("helvetica", "bold");
        pdf.text("PARACLINIQUES DES OLIVIERS", W / 2, 13, { align: "center" });
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");
        pdf.text("Carnet de Santé Digital", W / 2, 22, { align: "center" });

        // Identité patient
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text(`${patient.nom} ${patient.prenom}`, 15, 45);

        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        pdf.text(`NIP : ${patient.nip || "—"}`, 15, 52);
        pdf.text(`Date de naissance : ${patient.date_naissance || "—"}`, 15, 58);
        pdf.text(`Sexe : ${patient.sexe === "M" ? "Masculin" : patient.sexe === "F" ? "Féminin" : "—"}`, 15, 64);
        pdf.text(`Groupe sanguin : ${patient.groupe_sanguin || "—"}`, 15, 70);
        pdf.text(`Téléphone : ${patient.telephone || "—"}`, 15, 76);

        // Section allergies
        pdf.setFillColor(254, 226, 226);
        pdf.rect(15, 85, W - 30, 20, "F");
        pdf.setTextColor(153, 27, 27);
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "bold");
        pdf.text("⚠️ ALLERGIES", 18, 92);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        pdf.text(carnet?.allergies || "Aucune connue", 18, 99);

        let y = 115;
        // Antécédents
        pdf.setTextColor(0, 0, 0);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(12);
        pdf.text("Antécédents médicaux", 15, y);
        y += 5;
        pdf.setLineWidth(0.3);
        pdf.line(15, y, W - 15, y);
        y += 6;
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        const antecedentsLines = pdf.splitTextToSize(carnet?.antecedents || "Aucun", W - 30);
        pdf.text(antecedentsLines, 15, y);
        y += antecedentsLines.length * 5 + 6;

        // Traitements
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(12);
        pdf.text("Traitements chroniques", 15, y);
        y += 5;
        pdf.line(15, y, W - 15, y);
        y += 6;
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        const traitLines = pdf.splitTextToSize(carnet?.traitements_chroniques || "Aucun", W - 30);
        pdf.text(traitLines, 15, y);
        y += traitLines.length * 5 + 6;

        // Vaccinations
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(12);
        pdf.text("Vaccinations", 15, y);
        y += 5;
        pdf.line(15, y, W - 15, y);
        y += 6;
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        const vaccLines = pdf.splitTextToSize(carnet?.vaccinations || "Non renseigné", W - 30);
        pdf.text(vaccLines, 15, y);
        y += vaccLines.length * 5 + 6;

        // Constantes récentes
        if (constantes.length > 0 && y < 240) {
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(12);
            pdf.text("3 dernières mesures", 15, y);
            y += 5;
            pdf.line(15, y, W - 15, y);
            y += 6;
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(9);
            constantes.slice(0, 3).forEach((c) => {
                pdf.text(`${new Date(c.date_mesure).toLocaleDateString("fr-FR")} — TA: ${c.tension_systole}/${c.tension_diastole} | Pouls: ${c.pouls} | T°: ${c.temperature}°C | Sat: ${c.saturation_o2}%`, 15, y);
                y += 6;
            });
        }

        // Pied de page
        pdf.setFontSize(8);
        pdf.setTextColor(100, 116, 139);
        pdf.text(`Document généré le ${new Date().toLocaleString("fr-FR")} par ${user?.prenom} ${user?.nom}`, 15, 285);
        pdf.text("Paracliniques des Oliviers · Abidjan, Côte d'Ivoire", W - 15, 285, { align: "right" });

        // Télécharger
        pdf.save(`carnet-sante-${patient.nip || patient.id}.pdf`);

        setGenerating(false);
        setOpen(false);
    };

    return (
        <>
            <button onClick={() => setOpen(true)} className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition">
                <FileDown className="w-4 h-4" /> Exporter PDF
            </button>

            {open && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex items-start justify-between mb-3">
                            <h3 className="text-lg font-bold text-slate-900">Export PDF du carnet</h3>
                            <button onClick={() => setOpen(false)} className="text-slate-400"><X className="w-5 h-5" /></button>
                        </div>
                        <p className="text-sm text-slate-600 mb-4">
                            Un PDF complet du carnet de santé de <strong>{patient.nom} {patient.prenom}</strong> sera téléchargé.
                        </p>
                        <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600 space-y-1">
                            <div>📋 Identité + NIP</div>
                            <div>⚠️ Allergies</div>
                            <div>📋 Antécédents + Traitements + Vaccinations</div>
                            <div>📊 3 dernières constantes</div>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button onClick={() => setOpen(false)} className="flex-1 py-2 border rounded-lg text-sm">Annuler</button>
                            <button onClick={generate} disabled={generating} className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50">
                                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                                Télécharger
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}