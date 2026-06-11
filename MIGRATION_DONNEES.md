# 🔄 Récupérer les données existantes de SGH + Mise à zéro + GitHub

Vous avez raison de penser à ça MAINTENANT : SGH contient déjà des années
de patients. Voici le plan complet, dans le BON ordre.

---

## 🗺️ LE PLAN EN 5 PHASES

```
PHASE 1          PHASE 2         PHASE 3        PHASE 4              PHASE 5
Mise à zéro  →   GitHub      →   Netlify    →   Import historique → Sync auto
(vider démo)     (sauvegarde)    (en ligne)     (TOUS les patients   (nouveaux
                                                 SGH d'un coup)       patients)
```

---

## PHASE 1 — Mettre le projet à 0 (5 min)

### 1a. Vider les données de démo dans Supabase

Dans **Supabase → SQL Editor → New query**, copiez-collez le fichier :

📄 **`supabase/reset_donnees_demo.sql`**

Puis **Run**. Résultat :
- ❌ Supprimés : les 5 patients de démo, constantes, consultations, alertes
- ✅ Conservés : vos comptes (admin, dr.kone...) et les seuils d'alertes

### 1b. Vérifier dans l'application

Relancez l'app (`npm run dev`) → page Patients → badge vert + **"0 patients"**.
✅ Le projet est maintenant à zéro, prêt pour les vraies données.

> 💡 Les données de démonstration dans le code (`src/data/mockData.ts`) ne
> s'affichent QUE si Supabase n'est pas configuré. Une fois connecté à
> Supabase, elles sont ignorées — pas besoin de les supprimer du code.

---

## PHASE 2 — Pousser sur GitHub (10 min)

### 2a. Créer le dépôt

1. Allez sur [github.com](https://github.com) → connectez-vous
2. Bouton **New** (vert) → nom : `pdogestpatient`
3. Choisissez **Private** (recommandé pour un projet médical !)
4. **Create repository** (ne cochez rien d'autre)

### 2b. Pousser le projet

Dans le terminal VS Code, à la racine du projet :

```bash
git init
git add .
git commit -m "Version initiale - Systeme de gestion patients"
git branch -M main
git remote add origin https://github.com/VOTRE-PSEUDO/pdogestpatient.git
git push -u origin main
```

> ✅ Le fichier `.gitignore` est déjà configuré : votre `.env` (avec les clés)
> ne sera **PAS** envoyé sur GitHub. C'est voulu et c'est important.
>
> ⚠️ Vérifiez aussi que `server/sync_service.py` et `server/import_initial.py`
> ne contiennent PAS encore vos vraies clés `sb_secret_...` avant de pousser.
> Si vous les avez déjà remplies, remettez les placeholders avant le push,
> ou gardez ces fichiers configurés uniquement sur le serveur.

---

## PHASE 3 — Déployer sur Netlify (5 min)

### Option simple (glisser-déposer)
```bash
npm run build
```
→ Glissez le dossier `dist` sur https://app.netlify.com/drop

### Option pro (liée à GitHub — mises à jour automatiques !)
1. Sur [app.netlify.com](https://app.netlify.com) : **Add new site → Import an existing project**
2. Choisissez **GitHub** → autorisez → sélectionnez `pdogestpatient`
3. Build command : `npm run build` — Publish directory : `dist`
4. **Avant de déployer** : Site settings → **Environment variables** → ajoutez :
   | Clé | Valeur |
   |---|---|
   | `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | `sb_publishable_GWeF...` |
5. **Deploy site**

> 🎉 Bonus : à chaque `git push`, Netlify redéploie automatiquement !

---

## PHASE 4 — Importer TOUTES les données existantes de SGH

C'est la réponse à votre question principale. **2 méthodes**, choisissez selon
votre situation :

### ✅ MÉTHODE A : Import direct depuis Firebird (recommandée)

J'ai créé le script 📄 **`server/import_initial.py`** qui :
- Se connecte à la base Firebird de SGH (en LECTURE SEULE, aucun risque)
- Lit **TOUS** les patients existants (même 10 000+)
- Génère un NIP pour chacun
- Les importe dans Supabase par paquets de 100 (rapide)
- **Peut être relancé sans créer de doublons** (il saute ceux déjà importés)

**Comment faire :**

```cmd
REM 1. Sur le poste qui a accès à DATA.FDB (serveur, ou poste 1/2 via réseau)
pip install fdb supabase

REM 2. Éditez import_initial.py : configurez Firebird + Supabase
REM    (mêmes paramètres que sync_service.py)

REM 3. D'ABORD un test à blanc (ne touche à rien, montre un aperçu) :
python import_initial.py --test

REM 4. Si l'aperçu montre bien vos patients, import réel :
python import_initial.py
REM    → tape OUI pour confirmer
```

Exemple de sortie :
```
[2/4] Lecture de la table PATIENTS...
      ✅ 8542 patients trouvés dans SGH
      📋 APERÇU DES 5 PREMIERS :
         NIP-20260322-000001 | KOUASSI Jean | tel: 0701020304
         ...
[4/4] Import dans Supabase...
      ⏳ 100%  (8542 importés)
 ✅ TERMINÉ en 45.2s
```

→ Ouvrez votre app : **tous vos patients historiques sont là** ! 🎉

### 📄 MÉTHODE B : Import par fichier CSV (si Firebird inaccessible)

Si vous ne connaissez pas le mot de passe Firebird, ou si l'éditeur SGH
peut vous fournir un export :

1. Exportez les patients depuis SGH en **CSV ou Excel**
   (fonction Exporter du logiciel, ou demandez à l'éditeur)
2. Format attendu (1ère ligne = en-têtes) :
   ```csv
   id_sgh;nom;prenom;date_naissance;sexe;telephone;adresse
   32432;DIALLO;Aminata;15/06/1985;F;76123456;Plateau
   ```
3. Lancez le script 📄 **`server/import_csv.py`** :
   ```cmd
   pip install supabase
   python import_csv.py patients.csv
   ```

### ❓ Et les consultations / constantes historiques de SGH ?

Les patients sont le plus important (c'est eux qui garantissent le dossier
unique via le NIP). Pour l'historique médical :
- **Option pragmatique (recommandée)** : on importe les patients, et
  l'historique des constantes/consultations démarre à partir d'aujourd'hui
  dans le nouveau système. L'ancien historique reste consultable dans SGH.
- **Option complète** : si SGH stocke des consultations dans Firebird, on
  peut adapter `import_initial.py` pour les importer aussi — il faudra
  connaître les noms des tables (FlameRobin). Faisable dans un 2ème temps.

---

## PHASE 5 — Activer la synchronisation automatique

Une fois l'historique importé, lancez `sync_service.py`
(voir `server/INSTALLATION.md`) :
- Il détecte chaque NOUVEAU patient créé dans SGH
- L'ajoute dans Supabase en ~2 secondes
- 🔔 Notification instantanée dans l'app sur tous les postes

```
   PASSÉ                    PRÉSENT                FUTUR
   import_initial.py   +    (vous êtes ici)   +    sync_service.py
   (1 fois)                                        (tourne en continu)
   = historique complet                            = nouveaux patients auto
```

---

## ✅ CHECKLIST RÉCAPITULATIVE

- [ ] **Phase 1** : `reset_donnees_demo.sql` exécuté → app à 0 patient
- [ ] **Phase 2** : projet poussé sur GitHub (dépôt **privé**, `.env` exclu)
- [ ] **Phase 3** : Netlify en ligne avec les 2 variables d'environnement
- [ ] **Phase 4** : `python import_initial.py --test` puis import réel
       → tous les patients SGH visibles dans l'app
- [ ] **Phase 5** : `sync_service.py` installé en service Windows (NSSM)
- [ ] Test final : créer un patient dans SGH → il apparaît dans l'app en 2 s 🔔
