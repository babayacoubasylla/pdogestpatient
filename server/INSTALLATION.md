# 🖥️ Installation du service de synchronisation sur le serveur

## ❓ Ai-je besoin de cette partie ?

| Votre situation | Installation serveur nécessaire ? |
|---|---|
| Je veux juste utiliser l'application web (saisie manuelle des patients) | ❌ **NON** — l'app fonctionne déjà avec Supabase |
| Je veux que les patients enregistrés dans **SGH apparaissent automatiquement** dans l'app | ✅ **OUI** — suivez ce guide |

> ⚠️ **L'application web fonctionne déjà sans cette partie !** Le service de sync sert UNIQUEMENT à éviter la double saisie depuis SGH.

---

## 📋 Prérequis sur le serveur Windows (celui où tourne SGH)

1. **Python 3.10+** : téléchargez sur [python.org](https://www.python.org/downloads/)
   - ⚠️ Cochez **"Add Python to PATH"** pendant l'installation
2. Accès au fichier **DATA.FDB** de Firebird (le serveur SGH)
3. Connexion Internet (pour joindre Supabase)

---

## 🚀 Installation pas-à-pas

### Étape 1 : Copier le dossier `server/` sur le serveur

Copiez les fichiers suivants sur le serveur Windows (clé USB, réseau...) :
- `sync_service.py`
- `requirements.txt`
- `installer_service.bat`

### Étape 2 : Lancer l'installation

Clic droit sur `installer_service.bat` → **Exécuter en tant qu'administrateur**

Cela crée `C:\Clinique\sync\` et installe les dépendances Python.

### Étape 3 : Configurer le script

Ouvrez `C:\Clinique\sync\sync_service.py` avec le Bloc-notes et modifiez :

```python
# --- Firebird ---
FIREBIRD_DB = r"C:\SGH\DATA.FDB"        # ← Chemin réel vers votre DATA.FDB
FIREBIRD_USER = "SYSDBA"
FIREBIRD_PASSWORD = "masterkey"          # ← Mot de passe Firebird de votre SGH

# --- Noms des tables/colonnes SGH ---
SGH_TABLE = "PATIENTS"                   # ← Nom réel de la table
COL_ID = "ID_PATIENT"                    # ← Nom réel de la colonne ID
# ... etc.

# --- Supabase ---
SUPABASE_URL = "https://xxxxx.supabase.co"           # ← Settings > Data API
SUPABASE_SECRET_KEY = "sb_secret_..."                # ← Settings > API Keys > secret
```

> 💡 **Comment connaître les noms des tables SGH ?**
> Téléchargez [FlameRobin](http://flamerobin.org/) (gratuit), ouvrez DATA.FDB,
> et regardez les noms des tables et colonnes.

### Étape 4 : Tester manuellement

Ouvrez une invite de commande (cmd) :
```cmd
python C:\Clinique\sync\sync_service.py
```

Vous devez voir :
```
DEMARRAGE - Service de synchronisation SGH -> Supabase
X patients deja synchronises.
NOUVEAU PATIENT : NIP-20260322-032433 - KOUASSI Jean (ID SGH 32433)
```

✅ Vérifiez dans Supabase (**Table Editor → patients**) que le patient apparaît.
✅ Vérifiez dans l'application web : le patient apparaît **instantanément** + notification 🔔

### Étape 5 : Installer comme service Windows (démarrage automatique)

1. Téléchargez **NSSM** : [https://nssm.cc/download](https://nssm.cc/download)
2. Extrayez `nssm.exe` dans `C:\Clinique\`
3. Dans cmd **en administrateur** :

```cmd
cd C:\Clinique
nssm install CliniqueSync "C:\Python311\python.exe" "C:\Clinique\sync\sync_service.py"
nssm set CliniqueSync AppDirectory C:\Clinique\sync
nssm set CliniqueSync Description "Synchronisation SGH vers Supabase - Paracliniques des Oliviers"
nssm start CliniqueSync
```

> 💡 Vérifiez le chemin Python avec : `where python`

### Étape 6 : Vérifier que le service tourne

```cmd
nssm status CliniqueSync
```
Doit afficher `SERVICE_RUNNING`.

Le journal est dans : `C:\Clinique\sync.log`

---

## 🔧 Commandes utiles

| Action | Commande |
|---|---|
| Démarrer | `nssm start CliniqueSync` |
| Arrêter | `nssm stop CliniqueSync` |
| Redémarrer | `nssm restart CliniqueSync` |
| Statut | `nssm status CliniqueSync` |
| Désinstaller | `nssm remove CliniqueSync confirm` |
| Voir les logs | `notepad C:\Clinique\sync.log` |

---

## ❗ Dépannage

| Problème | Solution |
|---|---|
| `Unable to complete network request` | Vérifiez le chemin DATA.FDB et que Firebird tourne |
| `table unknown PATIENTS` | Le nom de table SGH est différent → ouvrez avec FlameRobin |
| Caractères bizarres (é → Ã©) | Changez `FIREBIRD_CHARSET = "WIN1252"` |
| `Invalid API key` | Vérifiez la clé `sb_secret_...` (pas la publishable !) |
| Patient n'apparaît pas dans l'app | Vérifiez Table Editor dans Supabase + la console du navigateur (F12) |

---

## 🖨️ Bonus : QR code sur le reçu SGH

Les QR codes sont générés dans `C:\Clinique\qr_codes\NIP-XXXXXXXX-XXXXXX.png`.

Dans votre état d'impression WinDev (si vous y avez accès via l'éditeur) :
1. Ajoutez un champ **Image**
2. Source : `"C:\Clinique\qr_codes\" + NIP + ".png"`

Si vous ne pouvez pas modifier l'état WinDev, vous pouvez imprimer le QR
séparément depuis l'application web (fiche patient → QR Code).
