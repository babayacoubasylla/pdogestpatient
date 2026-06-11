# 🚀 GUIDE MAÎTRE — TOUT depuis ZÉRO, dans l'ordre

> Suivez ce guide de haut en bas, étape par étape. Chaque commande indique
> OÙ la taper. Cochez au fur et à mesure ✅

---

# PARTIE A — EXPORTER LE PROJET ET L'OUVRIR DANS VS CODE

## A1. Exporter depuis Arena
1. Dans l'interface Arena : bouton **Download / Export** (en haut à droite)
2. Vous obtenez un fichier **.zip**
3. Clic droit sur le .zip → **Extraire tout** → choisissez par exemple :
   `C:\Projets\pdogestpatient`

## A2. Ouvrir dans VS Code
1. Ouvrez **VS Code**
2. Menu **File → Open Folder** → sélectionnez `C:\Projets\pdogestpatient`
3. Ouvrez le terminal intégré : menu **Terminal → New Terminal**
   (ou raccourci `Ctrl + ù`)

> 💡 TOUTES les commandes des parties B, C, D se tapent dans CE terminal.

## A3. Vérifier que Node.js est installé

Dans le terminal VS Code, tapez :
```bash
node --version
```
- ✅ Affiche un numéro (ex: `v20.11.0`) → continuez
- ❌ Erreur "node n'est pas reconnu" → installez Node.js :
  1. Allez sur **https://nodejs.org** → bouton vert **LTS** → téléchargez
  2. Installez (Suivant, Suivant... tout par défaut)
  3. **FERMEZ et ROUVREZ VS Code** (important !)
  4. Retapez `node --version` pour vérifier

---

# PARTIE B — INSTALLER ET TESTER EN LOCAL

## B1. Installer les dépendances (1 seule fois)

```bash
npm install
```
⏳ Attendez 1-2 minutes. C'est normal de voir plein de texte défiler.

## B2. Vérifier le fichier .env

Dans VS Code, ouvrez le fichier **`.env`** (à la racine). Il doit contenir :
```env
VITE_SUPABASE_URL=https://cwrywgrszkasfljhhrxs.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
✅ C'est déjà rempli avec vos clés. Ne touchez à rien.

> ⚠️ Si le fichier `.env` n'existe pas après l'export (certains systèmes
> cachent les fichiers commençant par un point) : créez-le à la racine
> et copiez le contenu ci-dessus, ou dupliquez `.env.example` et remplissez-le.

## B3. Vérifier les scripts SQL dans Supabase

Vous avez déjà exécuté `supabase/schema.sql` ✅
Vérifiez que vous avez AUSSI exécuté **`supabase/migration_gestionnaire.sql`**
(le 2ème script, pour le rôle gestionnaire) :
1. supabase.com → votre projet → **SQL Editor → New query**
2. Copiez tout le contenu du fichier `supabase/migration_gestionnaire.sql`
3. Collez → **Run**
4. La dernière ligne affiche vos comptes : admin, dr.kone, inf.diallo, gest.archives

## B4. Lancer l'application en local

```bash
npm run dev
```
Le terminal affiche : `Local: http://localhost:5173/`

1. **Ctrl + clic** sur le lien (ou tapez-le dans Chrome)
2. Connectez-vous : `admin` / `admin123`
3. Page **Patients** → vous devez voir le badge **VERT "Supabase connecté"**

> ❌ Badge orange "Mode démo" ? Le `.env` est mal rempli ou absent.
> Corrigez-le, puis dans le terminal : `Ctrl + C` pour arrêter, et relancez
> `npm run dev`.

## B5. (Optionnel) Remettre les données à zéro

Si vous voulez supprimer les patients de démonstration avant la mise en ligne :
1. Supabase → **SQL Editor** → collez `supabase/reset_donnees_demo.sql` → **Run**
2. Rechargez l'app → page Patients → "0 patients" ✅
   (vos comptes utilisateurs sont conservés)

## B6. Arrêter le serveur local

Dans le terminal : **Ctrl + C** (puis tapez `O` si demandé)

---

# PARTIE C — POUSSER SUR GITHUB

## C1. Vérifier que Git est installé

```bash
git --version
```
- ✅ Affiche un numéro → continuez
- ❌ Erreur → installez Git : **https://git-scm.com/download/win**
  (Suivant, Suivant... tout par défaut), puis **fermez/rouvrez VS Code**

## C2. Se présenter à Git (1 seule fois sur votre PC)

```bash
git config --global user.name "Votre Nom"
git config --global user.email "votre@email.com"
```

## C3. Créer le dépôt sur GitHub

1. Allez sur **https://github.com** → connectez-vous (ou créez un compte)
2. Bouton vert **New**
3. Repository name : `pdogestpatient`
4. ⚠️ Cochez **Private** (projet médical = données sensibles !)
5. NE COCHEZ RIEN d'autre → **Create repository**
6. Laissez la page ouverte, vous aurez besoin de l'adresse affichée

## C4. Pousser le projet

Dans le terminal VS Code (remplacez VOTRE-PSEUDO par votre pseudo GitHub) :

```bash
git init
git add .
git commit -m "Version initiale - Gestion patients Paracliniques des Oliviers"
git branch -M main
git remote add origin https://github.com/VOTRE-PSEUDO/pdogestpatient.git
git push -u origin main
```

> 💬 À la première connexion, une fenêtre GitHub s'ouvre pour vous
> authentifier → cliquez "Authorize" dans le navigateur.

> ✅ Le `.gitignore` empêche automatiquement l'envoi du `.env` (vos clés
> restent privées). C'est voulu.

## C5. Vérifier

Rechargez la page GitHub → vos fichiers sont là ! 🎉

---

# PARTIE D — METTRE EN LIGNE SUR NETLIFY

## Méthode recommandée : liée à GitHub (mises à jour automatiques)

### D1. Connecter Netlify à GitHub
1. Allez sur **https://app.netlify.com** → créez un compte
   (choisissez **"Sign up with GitHub"** = plus simple)
2. **Add new site → Import an existing project**
3. Cliquez **GitHub** → autorisez Netlify
4. Sélectionnez le dépôt **pdogestpatient**

### D2. Configurer le build
Netlify détecte tout seul, vérifiez juste :
- Build command : `npm run build`
- Publish directory : `dist`

### D3. ⚠️ AJOUTER LES CLÉS (étape cruciale !)
Avant de cliquer Deploy :
1. Dépliez **"Add environment variables"** (ou après coup :
   Site configuration → Environment variables → Add a variable)
2. Ajoutez ces 2 variables :

| Key | Value |
|---|---|
| `VITE_SUPABASE_URL` | `https://cwrywgrszkasfljhhrxs.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3cnl3Z3Jzemthc2ZsamhocnhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMDk1MTIsImV4cCI6MjA5NjY4NTUxMn0.fY0pmAb_X1E5vU-GymDs8tpTV-vdk78HfBa8jyV3t98` |

### D4. Déployer
1. Cliquez **Deploy site** → attendez 2-3 minutes ⏳
2. Netlify donne une adresse : `https://xxxx-yyyy.netlify.app`
3. **Testez-la** : connexion admin → badge vert → ✅ EN LIGNE !

### D5. (Optionnel) Joli nom
Site configuration → **Change site name** → `paracliniques-oliviers`
→ adresse : `https://paracliniques-oliviers.netlify.app`

### D6. Sur les postes de la clinique
Sur chaque poste : Chrome → votre adresse → menu ⋮ →
**"Installer la page en tant qu'application"** → icône sur le bureau.

## 🔁 Pour les futures mises à jour
```bash
git add .
git commit -m "Description de la modification"
git push
```
→ Netlify redéploie AUTOMATIQUEMENT. Rien d'autre à faire !

---

# PARTIE E — PYTHON : RÉCUPÉRER LES DONNÉES SGH

> ⚠️ Cette partie se fait sur un poste qui a accès à la base Firebird de SGH
> (le serveur, ou un poste du réseau). PAS forcément votre PC de développement.

## E1. Installer Python

1. Sur le poste choisi : **https://www.python.org/downloads** → **Download Python 3.x**
2. Lancez l'installateur :
   - ⚠️⚠️ **COCHEZ "Add python.exe to PATH"** (case en bas) ⚠️⚠️
   - Puis **Install Now**
3. Vérifiez : ouvrez une **Invite de commandes** (touche Windows → tapez `cmd`) :
   ```cmd
   python --version
   ```
   → doit afficher `Python 3.x.x`

## E2. Installer les bibliothèques

Dans la même invite de commandes :
```cmd
pip install fdb supabase qrcode[pil]
```

## E3. Copier les fichiers du dossier server/

Copiez (clé USB ou réseau) ces fichiers du projet vers le poste, par exemple
dans `C:\Clinique\sync\` :
- `server/import_initial.py`
- `server/sync_service.py`
- `server/import_csv.py` (plan B)

```cmd
mkdir C:\Clinique\sync
mkdir C:\Clinique\qr_codes
```

## E4. Configurer les scripts

Ouvrez `C:\Clinique\sync\import_initial.py` avec le **Bloc-notes** et modifiez
la section CONFIGURATION en haut :

```python
# --- Firebird ---
FIREBIRD_DB = r"C:\SGH\DATA.FDB"        # ← chemin RÉEL vers DATA.FDB
# (si le script tourne sur un autre poste que le serveur :)
# FIREBIRD_DB = r"192.168.1.10:C:\SGH\DATA.FDB"
FIREBIRD_USER = "SYSDBA"
FIREBIRD_PASSWORD = "masterkey"          # ← mot de passe Firebird de SGH

# --- Noms des tables SGH ---
SGH_TABLE = "PATIENTS"                   # ← nom réel de la table
COL_ID = "ID_PATIENT"                    # ← nom réel de la colonne
# ... etc.

# --- Supabase ---
SUPABASE_URL = "https://cwrywgrszkasfljhhrxs.supabase.co"
SUPABASE_SECRET_KEY = "sb_secret_..."    # ← votre clé SECRÈTE
```

> 🔑 **Où trouver la clé secrète ?** supabase.com → Settings → API Keys →
> section "Secret keys" → cliquez l'œil 👁 → copiez `sb_secret_...`
> Cette clé ne va QUE dans les scripts Python, JAMAIS dans le site web.

> 🔍 **Comment connaître les noms des tables SGH ?**
> Téléchargez **FlameRobin** (gratuit, http://flamerobin.org) → ouvrez
> DATA.FDB → regardez les tables et colonnes. Ou demandez à l'éditeur de SGH.

Faites les mêmes modifications dans `sync_service.py`.

## E5. IMPORT INITIAL — récupérer tout l'historique (1 seule fois)

```cmd
cd C:\Clinique\sync

REM 1. TEST à blanc (ne modifie RIEN, montre un aperçu) :
python import_initial.py --test
```

Vous devez voir :
```
✅ 8542 patients trouvés dans SGH
📋 APERÇU DES 5 PREMIERS :
   NIP-20260322-000001 | KOUASSI Jean | tel: 0701020304
   ...
MODE TEST TERMINÉ — Rien n'a été écrit.
```

- ❌ Erreur de connexion → revérifiez FIREBIRD_DB et le mot de passe
- ❌ "table unknown" → le nom SGH_TABLE est faux (voir FlameRobin)
- ❌ Accents bizarres → changez `FIREBIRD_CHARSET = "WIN1252"`

```cmd
REM 2. Si l'aperçu est correct → IMPORT RÉEL :
python import_initial.py
REM → tapez OUI pour confirmer
```

✅ Ouvrez votre application en ligne : **TOUS vos patients sont là !**

## E6. SYNCHRONISATION AUTOMATIQUE — pour les futurs patients

### Test manuel d'abord :
```cmd
python sync_service.py
```
Laissez tourner, et **créez un patient test dans SGH** → en 2 secondes :
```
NOUVEAU PATIENT : NIP-20260322-008543 - TEST Patient (ID SGH 8543)
```
→ Et il apparaît dans l'app avec une notification 🔔 !
Arrêtez le test avec **Ctrl + C**.

### Installation en service Windows (tourne tout seul, démarre avec Windows) :

1. Téléchargez **NSSM** : https://nssm.cc/download
2. Extrayez `nssm.exe` (dossier win64) dans `C:\Clinique\`
3. Trouvez le chemin de Python :
   ```cmd
   where python
   ```
   → notez le chemin (ex: `C:\Users\X\AppData\Local\Programs\Python\Python312\python.exe`)
4. Ouvrez une invite de commandes **EN ADMINISTRATEUR**
   (Windows → tapez cmd → clic droit → Exécuter en tant qu'administrateur) :
   ```cmd
   cd C:\Clinique
   nssm install CliniqueSync "CHEMIN\PYTHON\python.exe" "C:\Clinique\sync\sync_service.py"
   nssm set CliniqueSync AppDirectory C:\Clinique\sync
   nssm start CliniqueSync
   nssm status CliniqueSync
   ```
   → doit afficher `SERVICE_RUNNING` ✅

### Commandes utiles ensuite :
```cmd
nssm stop CliniqueSync       (arrêter)
nssm start CliniqueSync      (démarrer)
nssm restart CliniqueSync    (redémarrer)
notepad C:\Clinique\sync.log (voir le journal)
```

---

# ✅ CHECKLIST FINALE COMPLÈTE

## Sur votre PC
- [ ] A. Projet exporté, ouvert dans VS Code, Node.js installé
- [ ] B1. `npm install` exécuté
- [ ] B3. Les 2 scripts SQL exécutés dans Supabase
- [ ] B4. `npm run dev` → badge VERT "Supabase connecté"
- [ ] B5. (Optionnel) Données démo remises à zéro
- [ ] C. Projet poussé sur GitHub (dépôt PRIVÉ)
- [ ] D. Netlify en ligne avec les 2 variables d'environnement
- [ ] D6. Raccourcis créés sur les postes de la clinique

## Sur le poste avec accès Firebird
- [ ] E1-E2. Python + bibliothèques installés
- [ ] E4. Scripts configurés (Firebird + clé secrète Supabase)
- [ ] E5. `python import_initial.py --test` puis import réel
- [ ] E6. `sync_service.py` testé puis installé en service NSSM

## Test final 🏆
- [ ] Créer un patient dans SGH → il apparaît dans l'app en 2 s avec notification 🔔
- [ ] Saisir une constante anormale sur un poste → alerte sur l'autre poste

---

# 🆘 EN CAS DE PROBLÈME

| Problème | Solution |
|---|---|
| `npm n'est pas reconnu` | Node.js pas installé ou VS Code pas redémarré |
| Badge orange "Mode démo" | `.env` absent/mal rempli → corriger puis relancer `npm run dev` |
| `git n'est pas reconnu` | Git pas installé ou VS Code pas redémarré |
| Page blanche sur Netlify | Variables d'environnement oubliées → les ajouter puis Deploys → Trigger deploy |
| `python n'est pas reconnu` | Case "Add to PATH" pas cochée → réinstaller Python |
| Firebird : connexion refusée | Chemin DATA.FDB faux, ou Firebird pas démarré, ou port 3050 fermé |
| Identifiants invalides au login | Scripts SQL pas exécutés dans Supabase |
