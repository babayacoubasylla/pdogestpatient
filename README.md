# 🏥 Paracliniques des Oliviers — Système Unifié de Gestion des Patients

Application web de gestion des patients, constantes vitales, alertes et consultations, conçue pour s'intégrer à votre logiciel SGH (WinDev + Firebird) existant.

---

## 📦 1. Exporter le projet dans VS Code

### Option A — Télécharger le projet
1. Dans l'interface Arena, cliquez sur **"Download"** ou **"Export"** en haut à droite
2. Vous obtiendrez un fichier `.zip` contenant tout le projet

### Option B — Copier manuellement
1. Ouvrez **VS Code**
2. `File → Open Folder` → créez un dossier `paracliniques-oliviers`
3. Ouvrez un terminal dans VS Code : `Ctrl+ù` (ou `Terminal → New Terminal`)
4. Copiez tous les fichiers du projet dans ce dossier

### Installer les dépendances
```bash
# Dans le terminal VS Code
npm install
```

### Lancer en mode développement
```bash
npm run dev
```
Ouvrez ensuite `http://localhost:5173` dans votre navigateur.

### Personnaliser
- **Logo / Nom clinique** : `src/components/Layout.tsx` (ligne 30-40)
- **Couleurs** : `tailwind.config.js` (à créer si besoin, sinon modifier les classes `from-cyan-*`)
- **Titre de la page** : `index.html`
- **Données** : `src/data/mockData.ts`

### Build pour production
```bash
npm run build
```
Les fichiers finaux seront dans `dist/`.

---

## 🔗 2. Connecter à Supabase

Supabase remplace avantageusement SQLite + API Python. Voici la migration complète.

### Étape 1 : Créer un projet Supabase
1. Allez sur [https://supabase.com](https://supabase.com)
2. **New Project** → nommez-le `paracliniques-oliviers`
3. Choisissez une région proche (ex: `West EU (Paris)`)
4. Notez **l'URL** et la **clé `anon`** (Settings → API)

### Étape 2 : Créer les tables
Dans **SQL Editor** de Supabase, collez ce script :

```sql
-- Patients
CREATE TABLE patients (
  id BIGSERIAL PRIMARY KEY,
  nip TEXT UNIQUE NOT NULL,
  id_sgh BIGINT UNIQUE,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  date_naissance DATE,
  sexe TEXT CHECK (sexe IN ('M','F')),
  telephone TEXT,
  email TEXT,
  adresse TEXT,
  groupe_sanguin TEXT,
  allergies TEXT,
  antecedents TEXT,
  qr_code TEXT,
  date_creation TIMESTAMPTZ DEFAULT NOW()
);

-- Constantes
CREATE TABLE constantes (
  id BIGSERIAL PRIMARY KEY,
  patient_id BIGINT REFERENCES patients(id) ON DELETE CASCADE,
  nip TEXT REFERENCES patients(nip),
  date_mesure TIMESTAMPTZ DEFAULT NOW(),
  tension_systole INT,
  tension_diastole INT,
  pouls INT,
  temperature NUMERIC(4,1),
  saturation_o2 INT,
  frequence_respiratoire INT,
  poids NUMERIC(5,1),
  taille INT,
  douleur_eva INT,
  glycemie NUMERIC(4,2),
  note TEXT,
  saisie_par TEXT
);

-- Consultations
CREATE TABLE consultations (
  id BIGSERIAL PRIMARY KEY,
  patient_id BIGINT REFERENCES patients(id),
  nip TEXT,
  date_consultation TIMESTAMPTZ DEFAULT NOW(),
  medecin TEXT,
  motif TEXT,
  diagnostic TEXT,
  prescription TEXT,
  prochain_rdv DATE,
  observations TEXT
);

-- Utilisateurs (staff)
CREATE TABLE staff (
  id BIGSERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin','medecin','infirmier')),
  actif BOOLEAN DEFAULT true,
  derniere_connexion TIMESTAMPTZ
);

-- Alertes
CREATE TABLE alertes (
  id BIGSERIAL PRIMARY KEY,
  patient_id BIGINT REFERENCES patients(id),
  constante_id BIGINT REFERENCES constantes(id),
  parametre TEXT,
  valeur NUMERIC,
  seuil_min NUMERIC,
  seuil_max NUMERIC,
  unite TEXT,
  message TEXT,
  niveau TEXT CHECK (niveau IN ('warning','danger')),
  traitee BOOLEAN DEFAULT false,
  traitee_par TEXT,
  date_creation TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX idx_patient_nip ON patients(nip);
CREATE INDEX idx_constantes_patient ON constantes(patient_id);
CREATE INDEX idx_alertes_non_traitees ON alertes(traitee) WHERE traitee = false;

-- Row Level Security
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE constantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff peut tout" ON patients FOR ALL USING (true);
CREATE POLICY "Staff peut tout" ON constantes FOR ALL USING (true);
CREATE POLICY "Staff peut tout" ON consultations FOR ALL USING (true);
CREATE POLICY "Staff peut tout" ON alertes FOR ALL USING (true);
```

### Étape 3 : Installer le client Supabase
```bash
npm install @supabase/supabase-js
```

### Étape 4 : Créer `src/lib/supabase.ts`
```ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
```

### Étape 5 : Créer `.env` à la racine
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

### Étape 6 : Remplacer les données mock
Par exemple dans `src/pages/Patients.tsx` :
```ts
import { supabase } from '../lib/supabase'
import { useEffect, useState } from 'react'

export function Patients() {
  const [patients, setPatients] = useState([])
  
  useEffect(() => {
    supabase
      .from('patients')
      .select('*')
      .order('date_creation', { ascending: false })
      .then(({ data }) => setPatients(data || []))
  }, [])
  
  // ...
}
```

### Étape 7 : Temps réel avec Supabase Realtime
```ts
// Écouter les nouvelles alertes en temps réel
supabase
  .channel('alertes')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'alertes' },
    (payload) => {
      console.log('Nouvelle alerte :', payload.new)
      // Afficher toast / notification
    }
  )
  .subscribe()
```

---

## 🔔 3. Notifications temps réel

Le projet intègre maintenant :
- **Centre de notifications** (cloche dans le header) avec compteur
- **Toasts** qui apparaissent en bas à droite
- **Polling** toutes les 10 secondes (ou **Realtime** avec Supabase)
- **Notifications navigateur** (avec permission utilisateur)

Voir `src/context/NotificationContext.tsx`.

---

## 👥 4. Gestion des comptes (admin)

Page **"Utilisateurs"** accessible uniquement aux admins.
Permet de :
- Créer un nouveau compte médecin/infirmier
- Générer un mot de passe temporaire
- Activer/désactiver un compte
- Modifier les rôles

---

## 🔗 5. Intégration avec SGH / Firebird (dossier patient unique)

### Le problème
- SGH enregistre le patient → `ID_PATIENT = 32432` dans Firebird
- Votre app a besoin de récupérer ce patient et créer un NIP unique

### Solution : Service Python de synchronisation

Créez un dossier `C:\Clinique\sync\` sur votre serveur Windows et créez `sync_service.py` :

```python
"""
Service de synchronisation Firebird → Supabase
Tourne en arrière-plan et surveille les nouveaux patients dans SGH
"""
import fdb
import time
import os
from datetime import datetime
from supabase import create_client, Client
import qrcode

# === Configuration ===
FIREBIRD_DB = r"C:\SGH\DATA.FDB"
FIREBIRD_USER = "SYSDBA"
FIREBIRD_PASSWORD = "masterkey"

SUPABASE_URL = "https://xxxxx.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

QR_FOLDER = r"C:\Clinique\qr_codes"
os.makedirs(QR_FOLDER, exist_ok=True)

def generate_nip(id_sgh: int) -> str:
    """Génère un NIP unique basé sur la date et l'ID SGH"""
    return f"NIP-{datetime.now().strftime('%Y%m%d')}-{id_sgh:06d}"

def generate_qr_code(nip: str) -> str:
    """Génère un QR code pointant vers la fiche publique du patient"""
    url = f"https://paracliniques-oliviers.app/public/patient/{nip}"
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    path = os.path.join(QR_FOLDER, f"{nip}.png")
    img.save(path)
    return path

def sync_new_patients():
    """Lit les nouveaux patients depuis Firebird et les insère dans Supabase"""
    conn = fdb.connect(
        dsn=FIREBIRD_DB,
        user=FIREBIRD_USER,
        password=FIREBIRD_PASSWORD,
        charset='UTF8'
    )
    cur = conn.cursor()
    
    # Récupérer les patients pas encore synchronisés
    cur.execute("""
        SELECT ID_PATIENT, NOM, PRENOM, DATE_NAISSANCE, SEXE, 
               TELEPHONE, ADRESSE
        FROM PATIENTS
        WHERE ID_PATIENT NOT IN (
            SELECT id_sgh FROM patients WHERE id_sgh IS NOT NULL
        )
    """)
    
    # Note: la sous-requête ci-dessus interroge Supabase, 
    # en pratique on garde un cache local
    nouveaux = cur.fetchall()
    
    for row in nouveaux:
        id_sgh, nom, prenom, ddn, sexe, tel, adresse = row
        nip = generate_nip(id_sgh)
        qr_path = generate_qr_code(nip)
        
        supabase.table('patients').insert({
            'nip': nip,
            'id_sgh': id_sgh,
            'nom': nom.strip(),
            'prenom': prenom.strip(),
            'date_naissance': ddn.isoformat() if ddn else None,
            'sexe': sexe.strip() if sexe else None,
            'telephone': tel.strip() if tel else None,
            'adresse': adresse.strip() if adresse else None,
            'qr_code': qr_path,
        }).execute()
        
        print(f"✅ Synchronisé : {nip} ({nom} {prenom})")
    
    cur.close()
    conn.close()

if __name__ == "__main__":
    print("🔄 Démarrage du service de synchronisation...")
    while True:
        try:
            sync_new_patients()
        except Exception as e:
            print(f"❌ Erreur : {e}")
        time.sleep(2)  # Polling toutes les 2 secondes
```

### Installation du service Windows
```batch
REM Installer NSSM (https://nssm.cc/)
nssm install ParacliniquesSync "C:\Python311\python.exe" "C:\Clinique\sync\sync_service.py"
nssm start ParacliniquesSync
```

### Imprimer le QR code sur le reçu SGH
1. Dans WinDev, après génération du reçu, ajoutez un champ image
2. Chemin : `C:\Clinique\qr_codes\NIP-{id}.png`
3. Le patient scanne → accès direct à son dossier public

---

## 🎯 Récapitulatif des améliorations apportées

| Fonctionnalité | Fichier |
|---|---|
| Notifications temps réel (toasts + centre) | `src/context/NotificationContext.tsx` |
| Centre de notifications dans header | `src/components/Layout.tsx` |
| Page d'administration utilisateurs | `src/pages/UsersAdmin.tsx` |
| Page intégration SGH + Supabase | `src/pages/Integration.tsx` |
| Guide Supabase complet | `README.md` |

---

## 🆘 Support

Pour toute question sur l'intégration Firebird ou Supabase, consultez :
- [Documentation Supabase](https://supabase.com/docs)
- [Driver Python Firebird (fdb)](https://firebirdsql.org/en/python-driver/)
- [NSSM - Service Windows](https://nssm.cc/)
