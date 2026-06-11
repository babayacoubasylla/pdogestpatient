import { useState, useEffect } from "react";
import { FolderArchive, Upload, Search, FileText, FileImage, Download, Loader2 } from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import type { Archive, Patient, PageId } from "../types";

export function Archives({ onNavigate }: { onNavigate: (p: PageId, payload?: any) => void }) {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [archives, setArchives] = useState<Archive[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [titre, setTitre] = useState("");
  const [typeDoc, setTypeDoc] = useState("Biologie");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }
    const [p, a] = await Promise.all([
      supabase.from("patients").select("id, nip, nom, prenom").order("nom"),
      supabase.from("archives").select("*, patients(nom, prenom)").order("date_ajout", { ascending: false }),
    ]);
    if (p.data) setPatients(p.data as Patient[]);
    if (a.data) setArchives(a.data as Archive[]);
    setLoading(false);
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPatient || !user || !supabase) return;
    setUploading(true);

    const { data, error } = await supabase.from("archives").insert({
      patient_id: selectedPatient.id,
      nip: selectedPatient.nip,
      titre,
      type_fichier: typeDoc,
      url_fichier: "#",
      ajoute_par: `${user.prenom} ${user.nom}`,
    }).select("*, patients(nom, prenom)").single();

    if (data && !error) {
      setArchives([data as Archive, ...archives]);
      setShowUpload(false);
      setTitre("");
      setSelectedPatient(null);
    }
    setUploading(false);
  }

  const filtered = archives.filter((a) => {
    const q = search.toLowerCase();
    return !q || a.titre.toLowerCase().includes(q) || (a.nip && a.nip.toLowerCase().includes(q)) || (a.patients?.nom.toLowerCase().includes(q));
  });

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-wrap justify-between items-start gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FolderArchive className="w-7 h-7 text-cyan-600" />
            Gestion des Archives
          </h1>
          <p className="text-sm text-slate-500 mt-1">Numérisation et classement des documents patients</p>
        </div>
        <button onClick={() => setShowUpload(true)} className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
          <Upload className="w-4 h-4" /> Ajouter un document
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, NIP ou titre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-cyan-600" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left">Document</th>
                <th className="px-4 py-3 text-left">Patient</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Ajouté par</th>
                <th className="px-4 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900 flex items-center gap-2">
                      {a.type_fichier === "Imagerie" ? <FileImage className="w-4 h-4 text-purple-500" /> : <FileText className="w-4 h-4 text-blue-500" />}
                      {a.titre}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => onNavigate("patient-detail", a.patient_id)} className="font-medium text-cyan-600 hover:underline">
                      {a.patients?.nom} {a.patients?.prenom}
                    </button>
                    <div className="text-xs text-slate-500 font-mono">{a.nip}</div>
                  </td>
                  <td className="px-4 py-3"><span className="bg-slate-100 px-2 py-1 rounded text-xs">{a.type_fichier}</span></td>
                  <td className="px-4 py-3 text-slate-600">{a.ajoute_par}</td>
                  <td className="px-4 py-3 text-slate-500">{new Date(a.date_ajout).toLocaleDateString("fr-FR")}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Aucun document</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showUpload && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-5 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">Numériser un document</h2>
            </div>
            <form onSubmit={handleUpload} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Patient</label>
                <select required className="w-full px-3 py-2 border border-slate-200 rounded-lg" onChange={(e) => setSelectedPatient(patients.find((p) => p.id === parseInt(e.target.value)) || null)} value={selectedPatient?.id || ""}>
                  <option value="" disabled>Sélectionner...</option>
                  {patients.map((p) => <option key={p.id} value={p.id}>{p.nom} {p.prenom} ({p.nip})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Titre</label>
                <input type="text" required value={titre} onChange={(e) => setTitre(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Catégorie</label>
                <select value={typeDoc} onChange={(e) => setTypeDoc(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg">
                  <option value="Biologie">Biologie / Labo</option>
                  <option value="Imagerie">Imagerie</option>
                  <option value="Ordonnance externe">Ordonnance externe</option>
                  <option value="Ancien Dossier">Ancien Dossier</option>
                </select>
              </div>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center bg-slate-50">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <div className="text-sm text-slate-500">Fichier à ajouter (simulation)</div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowUpload(false)} className="flex-1 py-2 border border-slate-200 rounded-lg text-sm">Annuler</button>
                <button type="submit" disabled={uploading || !selectedPatient || !titre} className="flex-1 bg-cyan-600 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Sauvegarder"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}