"""
SERVICE DE SYNCHRONISATION FIREBIRD (SGH) -> SUPABASE
À installer sur le serveur Windows de la clinique.

Prérequis :
pip install fdb supabase qrcode[pil]
"""

import fdb
import time
import os
from datetime import datetime
from supabase import create_client, Client
import qrcode

# ==========================================
# CONFIGURATION
# ==========================================
# 1. Base Firebird (SGH)
FIREBIRD_DB = r"C:\SGH\DATA.FDB"
FIREBIRD_USER = "SYSDBA"
FIREBIRD_PASSWORD = "masterkey"

# 2. Supabase
# Remplacez VOTRE_ID_PROJET par votre vrai ID (ex: abcdefghijklm)
SUPABASE_URL = "https://VOTRE_ID_PROJET.supabase.co"
# Utilisez votre clé SECRET ici car c'est un script backend
SUPABASE_SECRET_KEY = "sb_secret_3t5Hr..." # <-- Mettez votre clé secrète complète ici

# 3. Dossier QR Codes
QR_FOLDER = r"C:\Clinique\qr_codes"
os.makedirs(QR_FOLDER, exist_ok=True)

# Initialisation Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SECRET_KEY)

def generate_nip(id_sgh: int) -> str:
    return f"NIP-{datetime.now().strftime('%Y%m%d')}-{id_sgh:06d}"

def generate_qr_code(nip: str) -> str:
    url = f"https://votre-domaine.com/public/patient/{nip}"
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    path = os.path.join(QR_FOLDER, f"{nip}.png")
    img.save(path)
    return path

def sync_new_patients():
    try:
        conn = fdb.connect(
            dsn=FIREBIRD_DB,
            user=FIREBIRD_USER,
            password=FIREBIRD_PASSWORD,
            charset='UTF8'
        )
        cur = conn.cursor()
        
        # Récupérer les patients SGH créés aujourd'hui (ou non synchronisés)
        cur.execute("""
            SELECT ID_PATIENT, NOM, PRENOM, DATE_NAISSANCE, SEXE, TELEPHONE, ADRESSE
            FROM PATIENTS
            WHERE DATE_CREATION >= CURRENT_DATE
        """)
        
        nouveaux = cur.fetchall()
        
        for row in nouveaux:
            id_sgh, nom, prenom, ddn, sexe, tel, adresse = row
            
            # Vérifier dans Supabase si ce patient existe déjà
            response = supabase.table('patients').select('id_sgh').eq('id_sgh', id_sgh).execute()
            
            if len(response.data) == 0:
                # Nouveau patient !
                nip = generate_nip(id_sgh)
                qr_path = generate_qr_code(nip)
                
                patient_data = {
                    'nip': nip,
                    'id_sgh': id_sgh,
                    'nom': nom.strip() if nom else "",
                    'prenom': prenom.strip() if prenom else "",
                    'date_naissance': ddn.isoformat() if ddn else None,
                    'sexe': sexe.strip() if sexe else None,
                    'telephone': tel.strip() if tel else None,
                    'adresse': adresse.strip() if adresse else None,
                    'qr_code': qr_path,
                }
                
                # Insertion dans Supabase
                supabase.table('patients').insert(patient_data).execute()
                print(f"[{datetime.now().strftime('%H:%M:%S')}] ✅ Patient synchronisé : {nip} ({nom} {prenom})")
        
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"[{datetime.now().strftime('%H:%M:%S')}] ❌ Erreur de connexion/synchro : {e}")

if __name__ == "__main__":
    print("===================================================")
    print("🔄 SERVICE DE SYNCHRONISATION FIREBIRD -> SUPABASE")
    print("===================================================")
    while True:
        sync_new_patients()
        time.sleep(2) # Vérifie toutes les 2 secondes
