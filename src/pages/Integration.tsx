import {
  Database,
  Server,
  RefreshCw,
  Link2,
  ShieldCheck,
  QrCode,
  Fingerprint,
  CheckCircle2,
  AlertTriangle,
  Code2,
  Terminal,
  Copy,
  Wifi,
} from "lucide-react";
import { useState } from "react";

export function Integration() {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Link2 className="w-7 h-7 text-cyan-600" />
          Intégration SGH / Firebird
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Garantir l'unicité du dossier patient entre votre logiciel SGH existant et cette
          application
        </p>
      </div>

      {/* Architecture */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white">
        <h2 className="font-bold mb-4 flex items-center gap-2">
          <Server className="w-5 h-5 text-cyan-400" />
          Architecture d'intégration
        </h2>

        <div className="grid md:grid-cols-5 gap-3 items-center">
          <Box
            icon={Database}
            title="Firebird"
            subtitle="DATA.FDB"
            color="from-orange-500 to-orange-600"
            description="Base SGH existante (lecture seule)"
          />
          <Arrow />
          <Box
            icon={RefreshCw}
            title="Sync Service"
            subtitle="Python"
            color="from-purple-500 to-purple-600"
            description="Polling 2s · Détecte nouveaux patients"
          />
          <Arrow />
          <Box
            icon={Database}
            title="Supabase"
            subtitle="PostgreSQL"
            color="from-emerald-500 to-emerald-600"
            description="Base unifiée + Realtime"
          />
        </div>

        <div className="mt-6 pt-6 border-t border-white/10 grid md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <Fingerprint className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold">NIP unique</div>
              <div className="text-slate-300 text-xs">
                NIP-YYYYMMDD-{`{ID_SGH}`}
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold">Lecture seule</div>
              <div className="text-slate-300 text-xs">
                Aucune écriture dans Firebird
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <QrCode className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold">QR Code</div>
              <div className="text-slate-300 text-xs">
                Imprimé sur le reçu SGH
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Le problème */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-amber-900 mb-2">Problème actuel</h3>
            <ul className="text-sm text-amber-900 space-y-1">
              <li>
                ❌ La secrétaire enregistre le patient dans <strong>SGH (WinDev)</strong>
              </li>
              <li>
                ❌ Le patient est <strong>ré-enregistré</strong> au bureau des entrées
              </li>
              <li>❌ Deux bases de données, pas de lien → données éparpillées</li>
              <li>❌ Risque de doublons et erreurs de saisie</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Solution */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-bold text-emerald-900 mb-2">Solution : dossier patient unique</h3>
            <ol className="text-sm text-emerald-900 space-y-2">
              <li>
                <strong>1.</strong> SGH crée le patient → <code className="bg-emerald-100 px-1.5 py-0.5 rounded">ID_PATIENT = 32432</code>
              </li>
              <li>
                <strong>2.</strong> Service Python détecte automatiquement le nouvel ID (polling
                toutes les 2 secondes)
              </li>
              <li>
                <strong>3.</strong> Génération du NIP unique :{" "}
                <code className="bg-emerald-100 px-1.5 py-0.5 rounded">
                  NIP-20260320-032432
                </code>
              </li>
              <li>
                <strong>4.</strong> Création du dossier dans Supabase + génération QR code
              </li>
              <li>
                <strong>5.</strong> QR code imprimé sur le reçu SGH → scan = accès direct au
                dossier
              </li>
            </ol>
          </div>
        </div>
      </div>

      {/* Étapes d'installation */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-5">
        <h2 className="font-bold text-lg text-slate-900">
          🛠️ Guide d'installation pas-à-pas
        </h2>

        {/* Étape 1 */}
        <Step
          num="1"
          title="Installer Python et les dépendances"
          icon={Terminal}
        >
          <p className="text-sm text-slate-600 mb-3">
            Sur le serveur Windows où tourne SGH, installez Python 3.11+ puis :
          </p>
          <CodeBlock
            code="pip install fdb supabase qrcode[pil]"
            onCopy={() => copy("pip install fdb supabase qrcode[pil]", "s1")}
            copied={copied === "s1"}
          />
        </Step>

        {/* Étape 2 */}
        <Step num="2" title="Créer le projet Supabase" icon={Database}>
          <ol className="text-sm text-slate-600 space-y-1 list-decimal list-inside mb-3">
            <li>
              Allez sur{" "}
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noreferrer"
                className="text-cyan-600 underline"
              >
                supabase.com
              </a>{" "}
              et créez un nouveau projet
            </li>
            <li>Récupérez l'URL et la clé <code className="bg-slate-100 px-1 rounded">anon</code></li>
            <li>Dans SQL Editor, exécutez le script de création des tables (voir README.md)</li>
          </ol>
        </Step>

        {/* Étape 3 */}
        <Step num="3" title="Service de synchronisation Python" icon={RefreshCw}>
          <p className="text-sm text-slate-600 mb-3">
            Créez le fichier <code className="bg-slate-100 px-1.5 py-0.5 rounded">C:\Clinique\sync\sync_service.py</code> :
          </p>
          <CodeBlock
            code={`import fdb, time, os, qrcode
from datetime import datetime
from supabase import create_client

# === Config ===
FIREBIRD_DB = r"C:\\SGH\\DATA.FDB"
SUPABASE_URL = "https://xxxxx.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJI..."

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def sync():
    conn = fdb.connect(
        dsn=FIREBIRD_DB,
        user="SYSDBA",
        password="masterkey",
        charset='UTF8'
    )
    cur = conn.cursor()
    cur.execute("""
        SELECT ID_PATIENT, NOM, PRENOM, DATE_NAISSANCE
        FROM PATIENTS
        WHERE DATE_CREATION > CURRENT_TIMESTAMP - 1
    """)
    for id_sgh, nom, prenom, ddn in cur.fetchall():
        nip = f"NIP-{datetime.now():%Y%m%d}-{id_sgh:06d}"
        # Vérifier si déjà synchro
        exist = supabase.table('patients').select('id').eq('id_sgh', id_sgh).execute()
        if not exist.data:
            supabase.table('patients').insert({
                'nip': nip,
                'id_sgh': id_sgh,
                'nom': nom.strip(),
                'prenom': prenom.strip(),
                'date_naissance': ddn.isoformat() if ddn else None,
            }).execute()
            print(f"✅ {nip} ({nom} {prenom})")
    conn.close()

while True:
    try: sync()
    except Exception as e: print(f"❌ {e}")
    time.sleep(2)`}
            onCopy={() => copy("sync_service.py", "s3")}
            copied={copied === "s3"}
          />
        </Step>

        {/* Étape 4 */}
        <Step num="4" title="Installer comme service Windows" icon={Server}>
          <p className="text-sm text-slate-600 mb-3">
            Téléchargez <strong>NSSM</strong> (Non-Sucking Service Manager) puis :
          </p>
          <CodeBlock
            code={`nssm install ParacliniquesSync "C:\\Python311\\python.exe" "C:\\Clinique\\sync\\sync_service.py"
nssm start ParacliniquesSync
nssm status ParacliniquesSync`}
            onCopy={() => copy("nssm install ...", "s4")}
            copied={copied === "s4"}
          />
          <p className="text-xs text-slate-500 mt-2">
            Le service démarrera automatiquement avec Windows.
          </p>
        </Step>

        {/* Étape 5 */}
        <Step num="5" title="Imprimer le QR code sur le reçu SGH" icon={QrCode}>
          <p className="text-sm text-slate-600 mb-3">
            Dans votre état WinDev du reçu :
          </p>
          <ol className="text-sm text-slate-600 space-y-1 list-decimal list-inside">
            <li>Ajoutez un champ Image lié au fichier <code className="bg-slate-100 px-1 rounded">C:\Clinique\qr_codes\{`{NIP}`}.png</code></li>
            <li>Ajoutez le NIP en texte sous le QR</li>
            <li>Le patient scanne → ouvre la fiche publique</li>
          </ol>
        </Step>
      </div>

      {/* Connexion Supabase depuis le frontend */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2">
          <Wifi className="w-5 h-5 text-cyan-600" />
          Connecter ce frontend à Supabase
        </h2>

        <Step num="A" title="Installer le SDK" icon={Code2}>
          <CodeBlock
            code="npm install @supabase/supabase-js"
            onCopy={() => copy("npm install @supabase/supabase-js", "a1")}
            copied={copied === "a1"}
          />
        </Step>

        <Step num="B" title="Créer src/lib/supabase.ts" icon={Code2}>
          <CodeBlock
            code={`import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
)`}
            onCopy={() => copy("supabase.ts", "a2")}
            copied={copied === "a2"}
          />
        </Step>

        <Step num="C" title="Créer .env à la racine" icon={ShieldCheck}>
          <CodeBlock
            code={`VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...`}
            onCopy={() => copy(".env", "a3")}
            copied={copied === "a3"}
          />
        </Step>

        <Step num="D" title="Temps réel avec Supabase Realtime" icon={RefreshCw}>
          <p className="text-sm text-slate-600 mb-3">
            Pour les notifications en temps réel :
          </p>
          <CodeBlock
            code={`supabase
  .channel('alertes')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'alertes' },
    (payload) => {
      console.log('Nouvelle alerte:', payload.new)
      showNotification(payload.new)
    }
  )
  .subscribe()`}
            onCopy={() => copy("realtime", "a4")}
            copied={copied === "a4"}
          />
        </Step>
      </div>

      {/* Avantages */}
      <div className="bg-gradient-to-r from-cyan-600 to-teal-600 rounded-xl p-5 text-white">
        <h3 className="font-bold mb-3">✅ Avantages de cette architecture</h3>
        <div className="grid md:grid-cols-2 gap-3 text-sm">
          <div className="flex gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>Aucune modification du logiciel SGH</span>
          </div>
          <div className="flex gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>Dossier patient 100% unique (NIP)</span>
          </div>
          <div className="flex gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>Synchronisation automatique 24/7</span>
          </div>
          <div className="flex gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>QR code = accès instantané au dossier</span>
          </div>
          <div className="flex gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>Base de données moderne (PostgreSQL)</span>
          </div>
          <div className="flex gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>Realtime, auth, stockage inclus avec Supabase</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Box({
  icon: Icon,
  title,
  subtitle,
  color,
  description,
}: {
  icon: any;
  title: string;
  subtitle: string;
  color: string;
  description: string;
}) {
  return (
    <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/10">
      <div className={`w-10 h-10 bg-gradient-to-br ${color} rounded-lg flex items-center justify-center mb-2`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="font-bold">{title}</div>
      <div className="text-xs text-cyan-200 font-mono">{subtitle}</div>
      <div className="text-xs text-slate-300 mt-2">{description}</div>
    </div>
  );
}

function Arrow() {
  return (
    <div className="flex items-center justify-center text-cyan-400 hidden md:flex">
      <svg className="w-8 h-4" viewBox="0 0 32 16" fill="none">
        <path d="M0 8 H28 M24 4 L28 8 L24 12" stroke="currentColor" strokeWidth="2" />
      </svg>
    </div>
  );
}

function Step({
  num,
  title,
  icon: Icon,
  children,
}: {
  num: string;
  title: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
        {num}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
          <Icon className="w-4 h-4 text-cyan-600" />
          {title}
        </h3>
        {children}
      </div>
    </div>
  );
}

function CodeBlock({
  code,
  onCopy,
  copied,
}: {
  code: string;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div className="relative bg-slate-900 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800 border-b border-slate-700">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
        </div>
        <button
          onClick={onCopy}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
        >
          {copied ? (
            <>
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Copié !
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" /> Copier
            </>
          )}
        </button>
      </div>
      <pre className="text-xs text-cyan-100 p-3 overflow-x-auto font-mono">
        <code>{code}</code>
      </pre>
    </div>
  );
}
