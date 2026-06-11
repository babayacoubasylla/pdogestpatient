import { useState, useEffect, useMemo } from "react";
import {
  FolderArchive,
  FileText,
  Search,
  Plus,
  Archive,
  ArchiveRestore,
  Trash2,
  Download,
  X,
  CheckCircle2,
  History,
  FolderOpen,
  FileImage,
  FilePlus2,
  Pill,
  FlaskConical,
  Files,
  ClipboardList,
} from "lucide-react";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import type { DocumentArchive, JournalEntry } from "../types";

const TYPES_DOC = [
  { id: "consultation", label: "Consultation", icon: ClipboardList, color: "bg-cyan-100 text-cyan-700" },
  { id: "examen", label: "Examen", icon: FlaskConical, color: "bg-purple-100 text-purple-700" },
  { id: "ordonnance", label: "Ordonnance", icon: Pill, color: "bg-emerald-100 text-emerald-700" },
  { id: "imagerie", label: "Imagerie", icon: FileImage, color: "bg-blue-100 text-blue-700" },
  { id: "administratif", label: "Administratif", icon: Files, color: "bg-slate-100 text-slate-700" },
  { id: "laboratoire", label: "Laboratoire", icon: FlaskConical, color: "bg-amber-100 text-amber-700" },
  { id: "autre", label: "Autre", icon: FileText, color: "bg-gray-100 text-gray-700" },
] as const;

export function Archives() {
  const { patients } = useData();
  const { user } = useAuth();
  const auteur = user ? `${user.prenom} ${user.nom}` : "Gestionnaire";

  const [documents, setDocuments] = useState<DocumentArchive[]>([]);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [patientsArchives, setPatientsArchives] = useState<Set<number>>(new Set());

  const [search, setSearch] = useState("");
  const [filtreType, setFiltreType] = useState<string>("all");
  const [filtreStatut, setFiltreStatut] = useState<"actifs" | "archives" | "tous">("actifs");
  const [onglet, setOnglet] = useState<"dossiers" | "documents" | "journal">("dossiers");
  const [showAddDoc, setShowAddDoc] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [formDoc, setFormDoc] = useState({
    patient_id: "",
    nom_document: "",
    type_document: "consultation" as DocumentArchive["type_document"],
    description: "",
  });

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // ============ Chargement Supabase ============
  const chargerDonnees = async () => {
    if (!supabase) return;
    const [docsRes, journalRes, patientsRes] = await Promise.all([
      supabase.from("archives_documents").select("*").order("date_creation", { ascending: false }),
      supabase.from("archives_journal").select("*").order("date_action", { ascending: false }).limit(50),
      supabase.from("patients").select("id, archive").eq("archive", true),
    ]);
    if (docsRes.data) {
      setDocuments(
        docsRes.data.map((d: any) => ({
          ...d,
          date_creation: d.date_creation,
        }))
      );
    }
    if (journalRes.data) setJournal(journalRes.data);
    if (patientsRes.data) {
      setPatientsArchives(new Set(patientsRes.data.map((p: any) => p.id)));
    }
  };

  useEffect(() => {
    chargerDonnees();
  }, []);

  // ============ Actions ============
  const ecrireJournal = async (action: string, cible: string, details?: string) => {
    const entry: JournalEntry = {
      id: Date.now(),
      action,
      cible,
      details,
      effectue_par: auteur,
      date_action: new Date().toISOString(),
    };
    setJournal((prev) => [entry, ...prev]);
    if (supabase) {
      await supabase.from("archives_journal").insert({
        action,
        cible,
        details,
        effectue_par: auteur,
      });
    }
  };

  const archiverDossier = async (patientId: number, nip: string, archiver: boolean) => {
    setPatientsArchives((prev) => {
      const next = new Set(prev);
      if (archiver) next.add(patientId);
      else next.delete(patientId);
      return next;
    });
    if (supabase) {
      await supabase
        .from("patients")
        .update({
          archive: archiver,
          archive_par: archiver ? auteur : null,
          date_archivage: archiver ? new Date().toISOString() : null,
        })
        .eq("id", patientId);
    }
    await ecrireJournal(archiver ? "archivage" : "restauration", nip);
    setToast(archiver ? `Dossier ${nip} archivé` : `Dossier ${nip} restauré`);
  };

  const ajouterDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find((p) => p.id === Number(formDoc.patient_id));
    if (!patient) return;

    const nouveau: DocumentArchive = {
      id: Date.now(),
      patient_id: patient.id,
      nip: patient.nip,
      nom_document: formDoc.nom_document,
      type_document: formDoc.type_document,
      description: formDoc.description || undefined,
      taille_ko: Math.floor(Math.random() * 900) + 100,
      archive: false,
      cree_par: auteur,
      date_creation: new Date().toISOString(),
    };

    if (supabase) {
      const { data } = await supabase
        .from("archives_documents")
        .insert({
          patient_id: patient.id,
          nip: patient.nip,
          nom_document: formDoc.nom_document,
          type_document: formDoc.type_document,
          description: formDoc.description || null,
          taille_ko: nouveau.taille_ko,
          cree_par: auteur,
        })
        .select()
        .single();
      if (data) nouveau.id = data.id;
    }

    setDocuments((prev) => [nouveau, ...prev]);
    await ecrireJournal("ajout_document", formDoc.nom_document, `Patient ${patient.nip}`);
    setToast(`Document "${formDoc.nom_document}" ajouté au dossier ${patient.nip}`);
    setFormDoc({ patient_id: "", nom_document: "", type_document: "consultation", description: "" });
    setShowAddDoc(false);
  };

  const supprimerDocument = async (doc: DocumentArchive) => {
    if (!confirm(`Supprimer le document "${doc.nom_document}" ?`)) return;
    setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    if (supabase) {
      await supabase.from("archives_documents").delete().eq("id", doc.id);
    }
    await ecrireJournal("suppression_document", doc.nom_document, `Patient ${doc.nip}`);
    setToast("Document supprimé");
  };

  const exporterRegistre = async () => {
    const lignes = [
      ["NIP", "Nom", "Prénom", "Statut", "Nb documents"].join(";"),
      ...patients.map((p) =>
        [
          p.nip,
          p.nom,
          p.prenom,
          patientsArchives.has(p.id) ? "ARCHIVÉ" : "ACTIF",
          documents.filter((d) => d.patient_id === p.id).length,
        ].join(";")
      ),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + lignes], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `registre_dossiers_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    await ecrireJournal("export", "Registre des dossiers", `${patients.length} dossiers`);
    setToast("Registre exporté en CSV");
  };

  // ============ Filtres ============
  const dossiersFiltres = useMemo(() => {
    return patients.filter((p) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        p.nom.toLowerCase().includes(q) ||
        p.prenom.toLowerCase().includes(q) ||
        p.nip.toLowerCase().includes(q);
      const estArchive = patientsArchives.has(p.id);
      const matchStatut =
        filtreStatut === "tous" ||
        (filtreStatut === "actifs" && !estArchive) ||
        (filtreStatut === "archives" && estArchive);
      return matchSearch && matchStatut;
    });
  }, [patients, search, filtreStatut, patientsArchives]);

  const docsFiltres = useMemo(() => {
    return documents.filter((d) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        d.nom_document.toLowerCase().includes(q) ||
        d.nip.toLowerCase().includes(q);
      const matchType = filtreType === "all" || d.type_document === filtreType;
      return matchSearch && matchType;
    });
  }, [documents, search, filtreType]);

  const getTypeInfo = (type: string) =>
    TYPES_DOC.find((t) => t.id === type) || TYPES_DOC[TYPES_DOC.length - 1];

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FolderArchive className="w-7 h-7 text-amber-600" />
            Gestion des archives
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Dossiers patients, documents médicaux et journal des opérations
            {!isSupabaseConfigured && " · Mode démo (local)"}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exporterRegistre}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exporter le registre (CSV)
          </button>
          <button
            onClick={() => setShowAddDoc(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <FilePlus2 className="w-4 h-4" />
            Ajouter un document
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile
          icon={FolderOpen}
          label="Dossiers actifs"
          value={patients.length - patientsArchives.size}
          color="bg-cyan-100 text-cyan-700"
        />
        <StatTile
          icon={Archive}
          label="Dossiers archivés"
          value={patientsArchives.size}
          color="bg-amber-100 text-amber-700"
        />
        <StatTile
          icon={FileText}
          label="Documents"
          value={documents.length}
          color="bg-purple-100 text-purple-700"
        />
        <StatTile
          icon={History}
          label="Opérations journalisées"
          value={journal.length}
          color="bg-slate-100 text-slate-700"
        />
      </div>

      {/* Onglets */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200">
          <TabBtn active={onglet === "dossiers"} onClick={() => setOnglet("dossiers")}>
            <FolderOpen className="w-4 h-4" /> Dossiers patients
          </TabBtn>
          <TabBtn active={onglet === "documents"} onClick={() => setOnglet("documents")}>
            <FileText className="w-4 h-4" /> Documents ({documents.length})
          </TabBtn>
          <TabBtn active={onglet === "journal"} onClick={() => setOnglet("journal")}>
            <History className="w-4 h-4" /> Journal
          </TabBtn>
        </div>

        {/* Barre recherche + filtres */}
        <div className="p-4 flex flex-wrap gap-3 border-b border-slate-100 bg-slate-50">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher (nom, NIP, document)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>
          {onglet === "dossiers" && (
            <select
              value={filtreStatut}
              onChange={(e) => setFiltreStatut(e.target.value as any)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
            >
              <option value="actifs">Dossiers actifs</option>
              <option value="archives">Dossiers archivés</option>
              <option value="tous">Tous</option>
            </select>
          )}
          {onglet === "documents" && (
            <select
              value={filtreType}
              onChange={(e) => setFiltreType(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
            >
              <option value="all">Tous types</option>
              {TYPES_DOC.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* ===== ONGLET DOSSIERS ===== */}
        {onglet === "dossiers" && (
          <div className="divide-y divide-slate-100">
            {dossiersFiltres.length === 0 ? (
              <div className="p-10 text-center text-slate-400 text-sm">Aucun dossier trouvé</div>
            ) : (
              dossiersFiltres.map((p) => {
                const estArchive = patientsArchives.has(p.id);
                const nbDocs = documents.filter((d) => d.patient_id === p.id).length;
                return (
                  <div
                    key={p.id}
                    className={`p-4 flex flex-wrap items-center gap-4 hover:bg-slate-50 ${
                      estArchive ? "opacity-70" : ""
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        estArchive ? "bg-amber-100 text-amber-600" : "bg-cyan-100 text-cyan-600"
                      }`}
                    >
                      {estArchive ? <Archive className="w-5 h-5" /> : <FolderOpen className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-[180px]">
                      <div className="font-semibold text-slate-900">
                        {p.nom} {p.prenom}
                        {estArchive && (
                          <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                            ARCHIVÉ
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 font-mono">{p.nip}</div>
                    </div>
                    <div className="text-sm text-slate-500">
                      <FileText className="w-4 h-4 inline mr-1" />
                      {nbDocs} document{nbDocs > 1 ? "s" : ""}
                    </div>
                    <button
                      onClick={() => archiverDossier(p.id, p.nip, !estArchive)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition ${
                        estArchive
                          ? "bg-emerald-100 hover:bg-emerald-200 text-emerald-700"
                          : "bg-amber-100 hover:bg-amber-200 text-amber-700"
                      }`}
                    >
                      {estArchive ? (
                        <>
                          <ArchiveRestore className="w-4 h-4" /> Restaurer
                        </>
                      ) : (
                        <>
                          <Archive className="w-4 h-4" /> Archiver
                        </>
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ===== ONGLET DOCUMENTS ===== */}
        {onglet === "documents" && (
          <div className="divide-y divide-slate-100">
            {docsFiltres.length === 0 ? (
              <div className="p-10 text-center text-slate-400 text-sm">
                Aucun document — cliquez sur "Ajouter un document"
              </div>
            ) : (
              docsFiltres.map((d) => {
                const info = getTypeInfo(d.type_document);
                const Icon = info.icon;
                return (
                  <div key={d.id} className="p-4 flex flex-wrap items-center gap-4 hover:bg-slate-50">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${info.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-[180px]">
                      <div className="font-semibold text-slate-900">{d.nom_document}</div>
                      <div className="text-xs text-slate-500">
                        <span className="font-mono">{d.nip}</span>
                        {d.description && <> · {d.description}</>}
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${info.color}`}>{info.label}</span>
                    <div className="text-xs text-slate-400">
                      {d.taille_ko} Ko ·{" "}
                      {new Date(d.date_creation).toLocaleDateString("fr-FR")}
                      <br />
                      par {d.cree_par}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setToast(`Téléchargement de "${d.nom_document}" (démo)`)}
                        className="p-2 text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition"
                        title="Télécharger"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => supprimerDocument(d)}
                        className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ===== ONGLET JOURNAL ===== */}
        {onglet === "journal" && (
          <div className="divide-y divide-slate-100">
            {journal.length === 0 ? (
              <div className="p-10 text-center text-slate-400 text-sm">
                Aucune opération enregistrée
              </div>
            ) : (
              journal.map((j) => (
                <div key={j.id} className="p-3 px-4 flex items-center gap-3 text-sm">
                  <ActionBadge action={j.action} />
                  <div className="flex-1">
                    <span className="font-medium text-slate-900">{j.cible}</span>
                    {j.details && <span className="text-slate-500"> — {j.details}</span>}
                  </div>
                  <div className="text-xs text-slate-400 text-right">
                    {j.effectue_par}
                    <br />
                    {new Date(j.date_action).toLocaleString("fr-FR")}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* ===== MODAL AJOUT DOCUMENT ===== */}
      {showAddDoc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">Ajouter un document</h2>
              <button onClick={() => setShowAddDoc(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={ajouterDocument} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Dossier patient
                </label>
                <select
                  required
                  value={formDoc.patient_id}
                  onChange={(e) => setFormDoc({ ...formDoc, patient_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">— Sélectionner —</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nom} {p.prenom} ({p.nip})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nom du document
                </label>
                <input
                  type="text"
                  required
                  value={formDoc.nom_document}
                  onChange={(e) => setFormDoc({ ...formDoc, nom_document: e.target.value })}
                  placeholder="Ex: Radio thorax 22-03-2026"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {TYPES_DOC.map((t) => {
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setFormDoc({ ...formDoc, type_document: t.id })}
                        className={`p-2 border-2 rounded-lg text-xs font-medium flex items-center gap-2 transition ${
                          formDoc.type_document === t.id
                            ? "border-amber-500 bg-amber-50 text-amber-700"
                            : "border-slate-200 text-slate-600"
                        }`}
                      >
                        <Icon className="w-4 h-4" /> {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description (optionnel)
                </label>
                <textarea
                  value={formDoc.description}
                  onChange={(e) => setFormDoc({ ...formDoc, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
                💡 Pour joindre de vrais fichiers (PDF, images), activez Supabase
                Storage : créez un bucket "documents" dans Supabase → Storage.
              </div>
              <button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2.5 rounded-lg font-medium flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Enregistrer le document
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-[100] bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm">{toast}</span>
        </div>
      )}
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        <div className="text-xs text-slate-500">{label}</div>
      </div>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition ${
        active
          ? "border-amber-500 text-amber-700 bg-amber-50/50"
          : "border-transparent text-slate-500 hover:text-slate-700"
      }`}
    >
      {children}
    </button>
  );
}

function ActionBadge({ action }: { action: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    archivage: { label: "📦 Archivage", cls: "bg-amber-100 text-amber-700" },
    restauration: { label: "♻️ Restauration", cls: "bg-emerald-100 text-emerald-700" },
    ajout_document: { label: "➕ Ajout doc", cls: "bg-cyan-100 text-cyan-700" },
    suppression_document: { label: "🗑️ Suppression", cls: "bg-red-100 text-red-700" },
    export: { label: "📤 Export", cls: "bg-purple-100 text-purple-700" },
  };
  const info = map[action] || { label: action, cls: "bg-slate-100 text-slate-700" };
  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${info.cls}`}>
      {info.label}
    </span>
  );
}
