# 🖧 Guide de déploiement — 3 postes (2 postes + 1 serveur)

## ⚡ LE PRINCIPE À COMPRENDRE

Votre projet est une **application WEB**. Contrairement à SGH (qui s'installe sur chaque poste),
elle s'installe à **UN SEUL endroit** et tous les postes l'utilisent avec un **simple navigateur**
(Chrome, Edge, Firefox) — comme un site internet.

```
                    ☁️ SUPABASE (cloud - déjà prêt, rien à installer)
                              ▲
                              │ Internet
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   POSTE 1               POSTE 2               POSTE 3 (SERVEUR)
   ┌──────────┐          ┌──────────┐          ┌──────────────────┐
   │ SGH      │          │ SGH      │          │ SGH + Firebird   │
   │ Navigateur│         │ Navigateur│         │ (DATA.FDB)       │
   │ → l'app  │          │ → l'app  │          │                  │
   └──────────┘          └──────────┘          │ + sync_service.py│ ← seul ajout
   RIEN à installer      RIEN à installer      └──────────────────┘
```

---

## ✅ OPTION 1 (RECOMMANDÉE) : Héberger l'app sur Internet — GRATUIT

L'application est mise en ligne gratuitement sur **Vercel**. Tous les postes
(et même les téléphones/tablettes) y accèdent via une adresse comme
`https://paracliniques-oliviers.vercel.app`.

### Étapes (15 minutes, une seule fois, depuis VOTRE PC) :

1. **Créez un compte gratuit** sur [vercel.com](https://vercel.com) (avec GitHub ou email)

2. **Installez l'outil Vercel** dans le terminal VS Code :
   ```bash
   npm install -g vercel
   ```

3. **Déployez** depuis le dossier du projet :
   ```bash
   vercel
   ```
   Répondez aux questions (Entrée pour tout accepter).

4. **Ajoutez vos clés Supabase** sur Vercel :
   - vercel.com → votre projet → **Settings → Environment Variables**
   - Ajoutez :
     | Nom | Valeur |
     |---|---|
     | `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` |
     | `VITE_SUPABASE_ANON_KEY` | `sb_publishable_GWeF...` |

5. **Redéployez** pour prendre en compte les clés :
   ```bash
   vercel --prod
   ```

6. ✅ **Terminé !** Sur les Postes 1, 2 et 3 : ouvrez le navigateur →
   `https://votre-app.vercel.app` → ajoutez en favori / raccourci bureau.

### Avantages
- ✅ Rien à installer sur aucun poste
- ✅ Accessible aussi sur tablettes et téléphones
- ✅ Mises à jour : un seul `vercel --prod` et tout le monde a la nouvelle version
- ✅ HTTPS automatique (sécurisé)

---

## ✅ OPTION 2 : Héberger l'app sur le SERVEUR local (sans Internet pour les postes)

Si vous préférez tout garder en local, l'app est servie depuis le **Poste 3 (serveur)**
et les Postes 1 et 2 y accèdent par le réseau local.

> ⚠️ Une connexion Internet reste nécessaire sur tous les postes pour joindre
> Supabase (la base est dans le cloud).

### Étapes (sur le SERVEUR uniquement) :

1. **Installez Node.js** sur le serveur : [nodejs.org](https://nodejs.org) (version LTS)

2. **Copiez le projet** sur le serveur (ex: `C:\Clinique\app\`)

3. **Construisez et servez** l'application :
   ```cmd
   cd C:\Clinique\app
   npm install
   npm run build
   npm install -g serve
   serve -s dist -l 3000
   ```

4. **Trouvez l'adresse IP du serveur** :
   ```cmd
   ipconfig
   ```
   → notez l'adresse IPv4, ex : `192.168.1.10`

5. **Ouvrez le port dans le pare-feu Windows** (cmd administrateur) :
   ```cmd
   netsh advfirewall firewall add rule name="App Clinique" dir=in action=allow protocol=TCP localport=3000
   ```

6. ✅ **Sur les Postes 1 et 2** : ouvrez le navigateur →
   `http://192.168.1.10:3000` → raccourci sur le bureau.

7. **Pour que ça démarre avec Windows** (service permanent avec NSSM) :
   ```cmd
   nssm install CliniqueApp "C:\Program Files\nodejs\node.exe"
   nssm set CliniqueApp AppParameters "C:\Users\VOTRE_USER\AppData\Roaming\npm\node_modules\serve\build\main.js -s C:\Clinique\app\dist -l 3000"
   nssm start CliniqueApp
   ```

---

## 🐍 ET LE SERVICE DE SYNCHRONISATION SGH ?

Le script `sync_service.py` doit pouvoir **lire la base Firebird (DATA.FDB)**.

### Cas normal (recommandé) : sur le SERVEUR (Poste 3)
C'est là qu'est DATA.FDB → installation directe (voir `server/INSTALLATION.md`).

### Possible aussi : sur le Poste 1 ou 2 (sans toucher au serveur)
Firebird est un serveur réseau (port 3050). Le script peut tourner sur un autre
poste en se connectant à distance. Dans `sync_service.py`, changez simplement :

```python
# Au lieu de :
FIREBIRD_DB = r"C:\SGH\DATA.FDB"

# Mettez (IP du serveur + chemin du fichier SUR le serveur) :
FIREBIRD_DB = r"192.168.1.10:C:\SGH\DATA.FDB"
```

> ⚠️ Conditions : le poste choisi doit **rester allumé** pendant les heures
> d'ouverture, et le port 3050 doit être ouvert sur le pare-feu du serveur :
> ```cmd
> netsh advfirewall firewall add rule name="Firebird" dir=in action=allow protocol=TCP localport=3050
> ```

---

## 📊 RÉCAPITULATIF : qui installe quoi ?

### Avec l'OPTION 1 (Vercel — recommandée)

| Poste | À installer | Utilisation |
|---|---|---|
| Poste 1 | ❌ Rien | Navigateur → https://votre-app.vercel.app |
| Poste 2 | ❌ Rien | Navigateur → https://votre-app.vercel.app |
| Serveur (Poste 3) | 🐍 Python + sync_service.py (optionnel) | Sync SGH automatique |

### Avec l'OPTION 2 (serveur local)

| Poste | À installer | Utilisation |
|---|---|---|
| Poste 1 | ❌ Rien | Navigateur → http://192.168.1.10:3000 |
| Poste 2 | ❌ Rien | Navigateur → http://192.168.1.10:3000 |
| Serveur (Poste 3) | Node.js + l'app + Python sync | Héberge tout |

---

## ❓ FAQ

**Q : Peut-on installer SANS toucher au serveur du tout ?**
R : Oui ! Option 1 (Vercel) pour l'app = zéro installation locale.
Et le script de sync peut tourner sur le Poste 1 ou 2 avec la connexion
Firebird à distance (`192.168.1.10:C:\SGH\DATA.FDB`). Le serveur n'est
jamais modifié — on ne fait que LIRE sa base par le réseau.

**Q : Et si Internet coupe ?**
R : L'app ne pourra plus joindre Supabase (les données sont dans le cloud).
SGH continue de fonctionner normalement. À la reconnexion, le script de
sync rattrape automatiquement les patients créés entre-temps.

**Q : Les 2 postes peuvent-ils utiliser l'app en même temps ?**
R : Oui, sans limite ! Et grâce au temps réel Supabase, une constante saisie
sur le Poste 1 apparaît instantanément sur le Poste 2.

**Q : Faut-il un nom de domaine ?**
R : Non. Vercel fournit une adresse gratuite (xxx.vercel.app). Vous pourrez
ajouter un domaine personnalisé plus tard si vous voulez.
