# -*- coding: utf-8 -*-
"""
============================================================
SERVICE DE SYNCHRONISATION FIREBIRD (SGH) -> SUPABASE
Paracliniques des Oliviers
============================================================

A INSTALLER SUR : le serveur Windows ou tourne le logiciel SGH
(la ou se trouve le fichier DATA.FDB de Firebird)

CE QUE FAIT CE SCRIPT :
1. Lit la base Firebird de SGH toutes les 2 secondes (lecture seule)
2. Detecte les nouveaux patients enregistres par la secretaire
3. Genere un NIP unique : NIP-YYYYMMDD-XXXXXX
4. Genere un QR code (imprimable sur le recu)
5. Insere le patient dans Supabase
6. -> Le patient apparait INSTANTANEMENT dans l'application web
   (grace au temps reel Supabase)

INSTALLATION (voir server/INSTALLATION.md) :
    pip install fdb supabase qrcode[pil]
    python sync_service.py
============================================================
"""

import os
import time
import logging
from datetime import datetime

import fdb                      # pip install fdb
import qrcode                   # pip install qrcode[pil]
from supabase import create_client  # pip install supabase

# ============================================================
# CONFIGURATION — A ADAPTER A VOTRE INSTALLATION
# ============================================================

# --- Firebird (base SGH) ---
# CAS 1 : ce script tourne SUR le serveur (la ou est DATA.FDB) :
FIREBIRD_DB = r"C:\SGH\DATA.FDB"        # <-- Chemin vers votre DATA.FDB
# CAS 2 : ce script tourne sur un AUTRE poste (connexion reseau au serveur) :
# FIREBIRD_DB = r"192.168.1.10:C:\SGH\DATA.FDB"   # <-- IP_SERVEUR:chemin_sur_le_serveur
FIREBIRD_USER = "SYSDBA"                 # Utilisateur Firebird par defaut
FIREBIRD_PASSWORD = "masterkey"          # Mot de passe Firebird par defaut
FIREBIRD_CHARSET = "UTF8"                # Essayez "WIN1252" si caracteres bizarres

# --- Table et colonnes SGH (adaptez aux vrais noms de votre base) ---
# Pour connaitre les noms exacts, ouvrez DATA.FDB avec FlameRobin ou IBExpert
SGH_TABLE = "PATIENTS"                   # <-- Nom de la table patients dans SGH
COL_ID = "ID_PATIENT"                    # <-- Colonne identifiant
COL_NOM = "NOM"
COL_PRENOM = "PRENOM"
COL_DATE_NAISSANCE = "DATE_NAISSANCE"    # Mettre None si n'existe pas
COL_SEXE = "SEXE"                        # Mettre None si n'existe pas
COL_TELEPHONE = "TELEPHONE"              # Mettre None si n'existe pas
COL_ADRESSE = "ADRESSE"                  # Mettre None si n'existe pas

# --- Supabase (projet pdogestpatient) ---
SUPABASE_URL = "https://VOTRE-REF-PROJET.supabase.co"   # <-- Settings > Data API > Project URL
SUPABASE_SECRET_KEY = "sb_secret_VOTRE_CLE_SECRETE"     # <-- Settings > API Keys > secret key
# IMPORTANT : utilisez la cle SECRETE ici (pas la publishable),
# car ce script tourne sur le serveur, jamais dans un navigateur.

# --- QR Codes ---
QR_FOLDER = r"C:\Clinique\qr_codes"      # Dossier ou seront crees les QR codes
APP_URL = "https://votre-app.exemple.com"  # URL de votre application web deployee

# --- Frequence de verification (secondes) ---
POLL_INTERVAL = 2

# ============================================================
# INITIALISATION
# ============================================================

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(r"C:\Clinique\sync.log", encoding="utf-8"),
        logging.StreamHandler(),
    ],
)
log = logging.getLogger("sync")

os.makedirs(QR_FOLDER, exist_ok=True)
supabase = create_client(SUPABASE_URL, SUPABASE_SECRET_KEY)

# Cache local des IDs deja synchronises (evite de requeter Supabase a chaque tour)
ids_deja_synchronises: set = set()


def charger_ids_existants():
    """Au demarrage, recupere les id_sgh deja presents dans Supabase."""
    global ids_deja_synchronises
    try:
        res = supabase.table("patients").select("id_sgh").execute()
        ids_deja_synchronises = {
            row["id_sgh"] for row in res.data if row.get("id_sgh") is not None
        }
        log.info(f"{len(ids_deja_synchronises)} patients deja synchronises.")
    except Exception as e:
        log.error(f"Impossible de charger les IDs existants : {e}")


def generer_nip(id_sgh: int) -> str:
    """NIP unique : NIP-YYYYMMDD-000000 (base sur l'ID SGH)."""
    return f"NIP-{datetime.now():%Y%m%d}-{id_sgh:06d}"


def generer_qr_code(nip: str) -> str:
    """Genere le QR code et retourne le chemin du fichier PNG."""
    url = f"{APP_URL}/public/patient/{nip}"
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    chemin = os.path.join(QR_FOLDER, f"{nip}.png")
    img.save(chemin)
    return chemin


def lire_patients_firebird():
    """Lit tous les patients de la base SGH (lecture seule)."""
    colonnes = [COL_ID, COL_NOM, COL_PRENOM]
    for col in (COL_DATE_NAISSANCE, COL_SEXE, COL_TELEPHONE, COL_ADRESSE):
        if col:
            colonnes.append(col)

    conn = fdb.connect(
        dsn=FIREBIRD_DB,
        user=FIREBIRD_USER,
        password=FIREBIRD_PASSWORD,
        charset=FIREBIRD_CHARSET,
    )
    try:
        cur = conn.cursor()
        cur.execute(f"SELECT {', '.join(colonnes)} FROM {SGH_TABLE}")
        rows = cur.fetchall()
        cur.close()
        return rows, colonnes
    finally:
        conn.close()


def valeur(row, colonnes, nom_colonne):
    """Recupere une valeur de la ligne par nom de colonne (ou None)."""
    if not nom_colonne or nom_colonne not in colonnes:
        return None
    v = row[colonnes.index(nom_colonne)]
    if isinstance(v, str):
        return v.strip() or None
    return v


def synchroniser():
    """Un cycle de synchronisation."""
    rows, colonnes = lire_patients_firebird()
    nouveaux = 0

    for row in rows:
        id_sgh = valeur(row, colonnes, COL_ID)
        if id_sgh is None or id_sgh in ids_deja_synchronises:
            continue

        nom = valeur(row, colonnes, COL_NOM) or "INCONNU"
        prenom = valeur(row, colonnes, COL_PRENOM) or ""
        ddn = valeur(row, colonnes, COL_DATE_NAISSANCE)
        sexe = valeur(row, colonnes, COL_SEXE)
        tel = valeur(row, colonnes, COL_TELEPHONE)
        adresse = valeur(row, colonnes, COL_ADRESSE)

        nip = generer_nip(id_sgh)

        try:
            chemin_qr = generer_qr_code(nip)

            supabase.table("patients").insert({
                "nip": nip,
                "id_sgh": id_sgh,
                "nom": nom,
                "prenom": prenom,
                "date_naissance": ddn.isoformat() if hasattr(ddn, "isoformat") else ddn,
                "sexe": sexe if sexe in ("M", "F") else None,
                "telephone": tel,
                "adresse": adresse,
                "qr_code": chemin_qr,
            }).execute()

            ids_deja_synchronises.add(id_sgh)
            nouveaux += 1
            log.info(f"NOUVEAU PATIENT : {nip} - {nom} {prenom} (ID SGH {id_sgh})")

        except Exception as e:
            # Doublon NIP ou autre erreur : on marque comme traite pour ne pas boucler
            if "duplicate" in str(e).lower() or "unique" in str(e).lower():
                ids_deja_synchronises.add(id_sgh)
                log.warning(f"Deja present (ignore) : ID SGH {id_sgh}")
            else:
                log.error(f"Erreur insertion ID SGH {id_sgh} : {e}")

    return nouveaux


# ============================================================
# BOUCLE PRINCIPALE
# ============================================================
if __name__ == "__main__":
    log.info("=" * 50)
    log.info("DEMARRAGE - Service de synchronisation SGH -> Supabase")
    log.info(f"Base Firebird : {FIREBIRD_DB}")
    log.info(f"Supabase      : {SUPABASE_URL}")
    log.info(f"Intervalle    : {POLL_INTERVAL}s")
    log.info("=" * 50)

    charger_ids_existants()

    while True:
        try:
            n = synchroniser()
            if n > 0:
                log.info(f"{n} patient(s) synchronise(s)")
        except fdb.DatabaseError as e:
            log.error(f"Erreur Firebird : {e}")
        except Exception as e:
            log.error(f"Erreur : {e}")
        time.sleep(POLL_INTERVAL)
