@echo off
REM ============================================================
REM INSTALLATION DU SERVICE DE SYNCHRONISATION
REM Paracliniques des Oliviers - SGH vers Supabase
REM
REM A EXECUTER SUR LE SERVEUR WINDOWS (en Administrateur)
REM ============================================================

echo ============================================
echo  Installation du service de synchronisation
echo ============================================
echo.

REM 1. Creer les dossiers
echo [1/4] Creation des dossiers...
mkdir C:\Clinique 2>nul
mkdir C:\Clinique\sync 2>nul
mkdir C:\Clinique\qr_codes 2>nul

REM 2. Copier les fichiers (lancez ce .bat depuis le dossier server/)
echo [2/4] Copie des fichiers...
copy /Y sync_service.py C:\Clinique\sync\
copy /Y requirements.txt C:\Clinique\sync\

REM 3. Installer les dependances Python
echo [3/4] Installation des dependances Python...
pip install -r C:\Clinique\sync\requirements.txt

REM 4. Test manuel d'abord
echo [4/4] Test du script...
echo.
echo ============================================
echo  IMPORTANT : Avant de continuer
echo ============================================
echo  1. Editez C:\Clinique\sync\sync_service.py
echo     - FIREBIRD_DB  : chemin vers votre DATA.FDB
echo     - SUPABASE_URL : votre URL de projet
echo     - SUPABASE_SECRET_KEY : votre cle secrete
echo     - SGH_TABLE / COL_* : noms reels de votre base SGH
echo.
echo  2. Testez manuellement :
echo     python C:\Clinique\sync\sync_service.py
echo.
echo  3. Si OK, installez comme service Windows avec NSSM :
echo     (telechargez nssm.exe sur https://nssm.cc)
echo.
echo     nssm install CliniqueSync "C:\Python311\python.exe" "C:\Clinique\sync\sync_service.py"
echo     nssm set CliniqueSync AppDirectory C:\Clinique\sync
echo     nssm start CliniqueSync
echo.
echo ============================================
pause
