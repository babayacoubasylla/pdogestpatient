# 🟢 GUIDE ULTRA SIMPLE — Mettre l'application en ligne (15 minutes)

## 💡 D'abord, comprendre avec une image simple

Pensez à **Facebook** : Facebook n'est pas installé sur votre ordinateur.
Il est sur un serveur quelque part, et vous y accédez avec votre navigateur.

**Votre application va fonctionner PAREIL :**
- On la met en ligne UNE FOIS (c'est ça "déployer")
- Ensuite, sur chaque poste : on ouvre Chrome → on tape l'adresse → ça marche
- RIEN à installer sur les postes 1, 2 et 3

```
   VOUS (une seule fois)                  ENSUITE (tous les jours)
   ┌──────────────────┐                  ┌─────────────────────────┐
   │ 1. Préparer l'app │                  │ Poste 1 : Chrome → URL  │
   │ 2. La mettre en   │   ════════►      │ Poste 2 : Chrome → URL  │
   │    ligne (déployer)│                 │ Poste 3 : Chrome → URL  │
   └──────────────────┘                  └─────────────────────────┘
```

---

# 📝 LES 4 ÉTAPES (sur VOTRE ordinateur uniquement)

## ÉTAPE 1 — Remplir le fichier `.env` (2 min)

C'est la SEULE configuration à faire. Dans VS Code, ouvrez le fichier `.env` :

```env
VITE_SUPABASE_URL=https://VOTRE-REF-PROJET.supabase.co    ← À CHANGER
VITE_SUPABASE_ANON_KEY=sb_publishable_GWeF6620Qkrj4gwlyGGdWQ_Y40i0t28    ← déjà bon
```

**Où trouver l'URL ?**
1. Allez sur supabase.com → votre projet **pdogestpatient**
2. Menu gauche : **Settings** (roue dentée)
3. Cliquez **Data API**
4. Copiez le **Project URL** (ça ressemble à `https://abcdefgh.supabase.co`)
5. Collez-le dans le `.env` à la place de `https://VOTRE-REF-PROJET.supabase.co`
6. **Enregistrez** (Ctrl+S)

## ÉTAPE 2 — Tester que ça marche chez vous (3 min)

Dans le terminal VS Code (menu Terminal → New Terminal) :

```bash
npm install
npm run dev
```

Ouvrez `http://localhost:5173` dans Chrome :
- Connectez-vous avec `admin` / `admin123`
- Allez sur la page **Patients**
- ✅ Vous devez voir le badge VERT **"Supabase connecté"**

> ❌ Badge orange "Mode démo" ? → l'URL dans le `.env` est fausse.
> Revérifiez l'étape 1, puis arrêtez (Ctrl+C) et relancez `npm run dev`.

## ÉTAPE 3 — Fabriquer la version finale (1 min)

Toujours dans le terminal :

```bash
npm run build
```

Cela crée un dossier **`dist`** dans votre projet.
👉 Ce dossier contient votre application complète, prête à être mise en ligne.

## ÉTAPE 4 — Mettre en ligne par GLISSER-DÉPOSER (5 min)

On utilise **Netlify** : gratuit, et on dépose le dossier comme une pièce jointe.

1. Allez sur : **https://app.netlify.com/drop**

2. Créez un compte gratuit si demandé (avec votre email — 1 minute)

3. **Glissez-déposez le dossier `dist`** (tout le dossier !) dans la grande
   zone au milieu de la page
   - Le dossier `dist` se trouve dans votre projet :
     clic droit dessus dans VS Code → "Reveal in File Explorer" pour le voir

4. Attendez 30 secondes... ⏳

5. 🎉 Netlify vous donne une adresse, par exemple :
   ```
   https://melodic-tartufo-123abc.netlify.app
   ```

6. **Testez cette adresse** dans votre navigateur → votre application est EN LIGNE !

7. (Optionnel) Changez le nom : Site settings → Change site name →
   par exemple `paracliniques-oliviers` → l'adresse devient
   `https://paracliniques-oliviers.netlify.app`

---

# 🏥 ET MAINTENANT, SUR LES 3 POSTES DE LA CLINIQUE ?

Sur **chaque poste** (1, 2 et le serveur), faites juste ceci :

1. Ouvrez **Chrome** (ou Edge)
2. Tapez votre adresse : `https://paracliniques-oliviers.netlify.app`
3. Connectez-vous (admin/admin123 ou les comptes que vous créez)
4. **Créez un raccourci sur le bureau** pour que ce soit comme un logiciel :
   - Dans Chrome : menu ⋮ → **Caster, enregistrer et partager** →
     **Installer la page en tant qu'application**
   - Une icône apparaît sur le bureau, comme un vrai logiciel ! 🖥️

**C'EST TOUT.** Aucune installation, aucun fichier à copier sur les postes.

---

# 🔁 Pour mettre à jour l'application plus tard

Quand vous modifiez le code :

```bash
npm run build
```
Puis sur Netlify : votre site → onglet **Deploys** → glissez-déposez
le nouveau dossier `dist`. Tous les postes ont la mise à jour immédiatement.

---

# ❓ Questions fréquentes

**« Et le serveur SGH dans tout ça ? »**
→ Rien ne change pour SGH ! Il continue de fonctionner comme avant.
Le SEUL ajout optionnel sur le serveur, c'est le petit script Python
(`server/sync_service.py`) pour que les patients SGH apparaissent
automatiquement dans l'app. Mais l'app marche très bien sans, vous
pouvez le faire plus tard.

**« Les données sont où ? »**
→ Dans Supabase (le cloud), pas sur Netlify ni sur les postes.
Netlify n'héberge que "l'écran" de l'application.

**« Si je ferme mon ordinateur, l'app marche encore sur les postes ? »**
→ OUI ! Une fois déployée, l'app vit sur Netlify, plus sur votre PC.

**« C'est vraiment gratuit ? »**
→ Oui : Netlify gratuit + Supabase gratuit = 0 FCFA pour démarrer.

**« Internet est obligatoire ? »**
→ Oui, sur chaque poste, car les données sont dans Supabase (cloud).
SGH lui continue de marcher sans Internet comme avant.

---

# 📋 Checklist finale

- [ ] `.env` rempli avec votre Project URL Supabase
- [ ] `npm run dev` → badge vert "Supabase connecté"
- [ ] `npm run build` → dossier `dist` créé
- [ ] Dossier `dist` glissé sur https://app.netlify.com/drop
- [ ] Adresse testée dans le navigateur
- [ ] Raccourci créé sur les 3 postes
- [ ] (Plus tard, optionnel) Script Python sur le serveur pour la sync SGH
