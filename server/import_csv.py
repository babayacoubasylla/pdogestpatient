# -*- coding: utf-8 -*-
"""
============================================================
IMPORT CSV — Alternative si vous ne pouvez pas vous connecter
directement à Firebird.

PRINCIPE :
  1. Exportez vos patients depuis SGH en fichier CSV/Excel
     (la plupart des logiciels ont une fonction Exporter,
      ou demandez à l'éditeur de SGH)
  2. Enregistrez en CSV nommé : patients.csv
  3. Lancez : python import_csv.py patients.csv

FORMAT ATTENDU DU CSV (1ère ligne = en-têtes) :
  id_sgh;nom;prenom;date_naissance;sexe;telephone;adresse
  32432;DIALLO;Aminata;15/06/1985;F;76123456;Plateau
  32433;TOURE;Mamadou;08/02/1972;M;77234567;Cocody

  -> Le séparateur ; ou , est détecté automatiquement
  -> Seuls id_sgh, nom, prenom sont obligatoires
  -> Dates acceptées : JJ/MM/AAAA ou AAAA-MM-JJ
============================================================
"""

import csv
import sys
from datetime import datetime

from supabase import create_client   # pip install supabase

# ============================================================
# CONFIGURATION
# ============================================================
SUPABASE_URL = "https://VOTRE-REF-PROJET.supabase.co"
SUPABASE_SECRET_KEY = "sb_secret_VOTRE_CLE_SECRETE"

# ============================================================

def parse_date(s):
    """Convertit JJ/MM/AAAA ou AAAA-MM-JJ -> AAAA-MM-JJ"""
    if not s:
        return None
    s = s.strip()
    for fmt in ("%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y", "%d/%m/%y"):
        try:
            return datetime.strptime(s, fmt).date().isoformat()
        except ValueError:
            continue
    return None


def main():
    if len(sys.argv) < 2:
        print("Utilisation : python import_csv.py patients.csv")
        return
    fichier = sys.argv[1]

    print(f"Lecture de {fichier}...")
    with open(fichier, "r", encoding="utf-8-sig") as f:
        echantillon = f.read(2048)
        f.seek(0)
        sep = ";" if echantillon.count(";") >= echantillon.count(",") else ","
        lecteur = csv.DictReader(f, delimiter=sep)
        # normalise les noms de colonnes (minuscules, sans espaces)
        lignes = []
        for row in lecteur:
            lignes.append({(k or "").strip().lower(): (v or "").strip() for k, v in row.items()})

    print(f"  {len(lignes)} lignes trouvées (séparateur '{sep}')")

    patients = []
    for l in lignes:
        id_sgh = l.get("id_sgh") or l.get("id") or l.get("id_patient")
        nom = l.get("nom")
        if not id_sgh or not nom:
            continue
        id_sgh = int(float(id_sgh))
        sexe = (l.get("sexe") or "").upper()[:1]
        patients.append({
            "nip": f"NIP-{datetime.now():%Y%m%d}-{id_sgh:06d}",
            "id_sgh": id_sgh,
            "nom": nom.upper(),
            "prenom": l.get("prenom") or "",
            "date_naissance": parse_date(l.get("date_naissance") or l.get("naissance")),
            "sexe": sexe if sexe in ("M", "F") else None,
            "telephone": l.get("telephone") or l.get("tel") or None,
            "adresse": l.get("adresse") or None,
        })

    print(f"  {len(patients)} patients valides")
    print("\nAperçu :")
    for p in patients[:5]:
        print(f"  {p['nip']} | {p['nom']} {p['prenom']}")

    rep = input(f"\nImporter {len(patients)} patients dans Supabase ? (OUI/non) : ")
    if rep.strip().upper() != "OUI":
        print("Annulé.")
        return

    supabase = create_client(SUPABASE_URL, SUPABASE_SECRET_KEY)
    existants = supabase.table("patients").select("id_sgh").execute()
    ids_existants = {r["id_sgh"] for r in existants.data if r.get("id_sgh")}
    patients = [p for p in patients if p["id_sgh"] not in ids_existants]

    ok, err = 0, 0
    for i in range(0, len(patients), 100):
        paquet = patients[i:i+100]
        try:
            supabase.table("patients").insert(paquet).execute()
            ok += len(paquet)
        except Exception:
            for p in paquet:
                try:
                    supabase.table("patients").insert(p).execute()
                    ok += 1
                except Exception as e:
                    err += 1
                    print(f"  ❌ {p['nip']} : {str(e)[:60]}")
        print(f"  {ok} importés...", end="\r")

    print(f"\n✅ Terminé : {ok} importés, {err} erreurs")


if __name__ == "__main__":
    main()
