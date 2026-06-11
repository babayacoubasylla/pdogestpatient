# -*- coding: utf-8 -*-
"""
============================================================
IMPORT INITIAL — Récupère TOUT l'historique des patients
depuis la base SGH (Firebird) vers Supabase.

À EXÉCUTER UNE SEULE FOIS, au démarrage du projet.
(Ensuite, sync_service.py prend le relais pour les nouveaux)

UTILISATION :
    1. Configurez la section CONFIGURATION ci-dessous
       (identique à sync_service.py)
    2. Lancez un test SANS rien écrire :
         python import_initial.py --test
    3. Si l'aperçu est correct, lancez l'import réel :
         python import_initial.py
============================================================
"""

import sys
import time
from datetime import datetime

import fdb                          # pip install fdb
from supabase import create_client  # pip install supabase

# ============================================================
# CONFIGURATION — IDENTIQUE À sync_service.py
# ============================================================

# --- Firebird (base SGH) ---
FIREBIRD_DB = r"C:\SGH\DATA.FDB"     # ou r"192.168.1.10:C:\SGH\DATA.FDB" en réseau
FIREBIRD_USER = "SYSDBA"
FIREBIRD_PASSWORD = "masterkey"
FIREBIRD_CHARSET = "UTF8"            # Essayez "WIN1252" si accents bizarres

# --- Table et colonnes SGH (adaptez aux VRAIS noms de votre base) ---
# Pour les connaître : ouvrez DATA.FDB avec FlameRobin (gratuit)
SGH_TABLE = "PATIENTS"
COL_ID = "ID_PATIENT"
COL_NOM = "NOM"
COL_PRENOM = "PRENOM"
COL_DATE_NAISSANCE = "DATE_NAISSANCE"   # None si la colonne n'existe pas
COL_SEXE = "SEXE"                       # None si n'existe pas
COL_TELEPHONE = "TELEPHONE"             # None si n'existe pas
COL_ADRESSE = "ADRESSE"                 # None si n'existe pas
COL_DATE_CREATION = None                # ex: "DATE_ENREG" — sert à générer le NIP
                                        # avec la date d'origine. None = date du jour.

# --- Supabase ---
SUPABASE_URL = "https://VOTRE-REF-PROJET.supabase.co"
SUPABASE_SECRET_KEY = "sb_secret_VOTRE_CLE_SECRETE"   # la clé SECRÈTE

# --- Import par paquets (ne pas toucher sauf besoin) ---
BATCH_SIZE = 100

# ============================================================
# SCRIPT (ne rien modifier en dessous)
# ============================================================

MODE_TEST = "--test" in sys.argv


def generer_nip(id_sgh: int, date_origine=None) -> str:
    """NIP basé sur la date d'enregistrement d'origine si disponible."""
    d = date_origine if date_origine else datetime.now()
    return f"NIP-{d:%Y%m%d}-{id_sgh:06d}"


def main():
    print("=" * 60)
    print(" IMPORT INITIAL — SGH (Firebird) -> Supabase")
    print(" MODE :", "TEST (aucune écriture)" if MODE_TEST else "RÉEL")
    print("=" * 60)

    # --- 1. Connexion Firebird ---
    print(f"\n[1/4] Connexion à Firebird : {FIREBIRD_DB}")
    conn = fdb.connect(
        dsn=FIREBIRD_DB,
        user=FIREBIRD_USER,
        password=FIREBIRD_PASSWORD,
        charset=FIREBIRD_CHARSET,
    )
    print("      ✅ Connecté à Firebird")

    # --- 2. Lecture de tous les patients SGH ---
    colonnes = [COL_ID, COL_NOM, COL_PRENOM]
    for col in (COL_DATE_NAISSANCE, COL_SEXE, COL_TELEPHONE, COL_ADRESSE, COL_DATE_CREATION):
        if col:
            colonnes.append(col)

    print(f"\n[2/4] Lecture de la table {SGH_TABLE}...")
    cur = conn.cursor()
    cur.execute(f"SELECT {', '.join(colonnes)} FROM {SGH_TABLE} ORDER BY {COL_ID}")
    rows = cur.fetchall()
    conn.close()
    print(f"      ✅ {len(rows)} patients trouvés dans SGH")

    if len(rows) == 0:
        print("\n⚠️  Aucun patient trouvé. Vérifiez SGH_TABLE et les noms de colonnes.")
        return

    def val(row, nom_col):
        if not nom_col or nom_col not in colonnes:
            return None
        v = row[colonnes.index(nom_col)]
        return v.strip() if isinstance(v, str) and v.strip() else (v if not isinstance(v, str) else None)

    # --- 3. Préparation des données ---
    print("\n[3/4] Préparation des données...")
    a_importer = []
    ignores = 0
    for row in rows:
        id_sgh = val(row, COL_ID)
        if id_sgh is None:
            ignores += 1
            continue
        ddn = val(row, COL_DATE_NAISSANCE)
        sexe = val(row, COL_SEXE)
        date_crea = val(row, COL_DATE_CREATION)

        a_importer.append({
            "nip": generer_nip(id_sgh, date_crea),
            "id_sgh": id_sgh,
            "nom": (val(row, COL_NOM) or "INCONNU").upper(),
            "prenom": val(row, COL_PRENOM) or "",
            "date_naissance": ddn.isoformat() if hasattr(ddn, "isoformat") else ddn,
            "sexe": sexe if sexe in ("M", "F") else None,
            "telephone": val(row, COL_TELEPHONE),
            "adresse": val(row, COL_ADRESSE),
        })

    print(f"      ✅ {len(a_importer)} patients prêts ({ignores} ignorés sans ID)")

    # Aperçu des 5 premiers
    print("\n      📋 APERÇU DES 5 PREMIERS :")
    for p in a_importer[:5]:
        print(f"         {p['nip']}  |  {p['nom']} {p['prenom']}  |  tel: {p['telephone']}")

    if MODE_TEST:
        print("\n" + "=" * 60)
        print(" MODE TEST TERMINÉ — Rien n'a été écrit dans Supabase.")
        print(" Si l'aperçu est correct, relancez SANS --test :")
        print("     python import_initial.py")
        print("=" * 60)
        return

    # --- Confirmation ---
    print(f"\n⚠️  Vous allez importer {len(a_importer)} patients dans Supabase.")
    reponse = input("    Tapez OUI pour confirmer : ")
    if reponse.strip().upper() != "OUI":
        print("    Import annulé.")
        return

    # --- 4. Import par paquets ---
    print(f"\n[4/4] Import dans Supabase ({SUPABASE_URL})...")
    supabase = create_client(SUPABASE_URL, SUPABASE_SECRET_KEY)

    # Récupérer les IDs déjà présents (pour pouvoir relancer sans doublons)
    existants = supabase.table("patients").select("id_sgh").execute()
    ids_existants = {r["id_sgh"] for r in existants.data if r.get("id_sgh") is not None}
    a_importer = [p for p in a_importer if p["id_sgh"] not in ids_existants]
    if ids_existants:
        print(f"      ℹ️  {len(ids_existants)} déjà présents — {len(a_importer)} restants à importer")

    total_ok = 0
    total_err = 0
    debut = time.time()

    for i in range(0, len(a_importer), BATCH_SIZE):
        paquet = a_importer[i : i + BATCH_SIZE]
        try:
            supabase.table("patients").insert(paquet).execute()
            total_ok += len(paquet)
        except Exception as e:
            # En cas d'erreur sur le paquet, on réessaie un par un
            for p in paquet:
                try:
                    supabase.table("patients").insert(p).execute()
                    total_ok += 1
                except Exception as e2:
                    total_err += 1
                    print(f"      ❌ Erreur {p['nip']} : {str(e2)[:80]}")
        pct = min(100, round((i + len(paquet)) / max(1, len(a_importer)) * 100))
        print(f"      ⏳ {pct}%  ({total_ok} importés)", end="\r")

    duree = round(time.time() - debut, 1)
    print("\n" + "=" * 60)
    print(f" ✅ TERMINÉ en {duree}s")
    print(f"    Importés : {total_ok}")
    print(f"    Erreurs  : {total_err}")
    print("=" * 60)
    print("\n 🎉 Ouvrez votre application : tous les patients sont là !")
    print("    Lancez maintenant sync_service.py pour les FUTURS patients.")


if __name__ == "__main__":
    main()
