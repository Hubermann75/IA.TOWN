@echo off
chcp 65001 >nul
title IA TOWN — REVENUE ENGINE V3.0 (BETA V1.0)
color 0B
echo =====================================================================
echo    IA TOWN - REVENUE ENGINE V3.0 & CCC.CONNECT HUB
echo    Lancement de l'application autonome Windows (Beta v1.0)
echo =====================================================================
echo.
echo Initialisation du moteur autonome en cours...

set "APP_DIR=%~dp0"
set "APP_INDEX=%APP_DIR%app\index.html"
set "APP_EXE=%APP_DIR%IA_TOWN_Beta_v1.0.exe"

rem Verification du dossier des ressources
if not exist "%APP_INDEX%" (
    echo [ERREUR] Le dossier 'app' est introuvable dans ce repertoire !
    echo Assurez-vous d'avoir extrait TOUT le contenu de 'IA_TOWN_Beta_v1.0_Complet.zip'.
    echo.
    pause
    exit /b 1
)

rem Priorite 1 : Lancement via le binaire natif optimise
if exist "%APP_EXE%" (
    echo [DEMARRAGE] Lancement via IA_TOWN_Beta_v1.0.exe (Serveur autonome integre)...
    start "" "%APP_EXE%"
    exit /b 0
)

rem Priorite 2 : Detection des navigateurs Edge / Chrome
set "EDGE_EXE="
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" set "EDGE_EXE=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" set "EDGE_EXE=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"

set "CHROME_EXE="
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" set "CHROME_EXE=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" set "CHROME_EXE=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if exist "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" set "CHROME_EXE=%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"

set "BROWSER_EXE="
if defined EDGE_EXE set "BROWSER_EXE=%EDGE_EXE%"
if not defined BROWSER_EXE if defined CHROME_EXE set "BROWSER_EXE=%CHROME_EXE%"

set "APP_URL=file:///%APP_INDEX:\=/%"
set "USER_DATA=%TEMP%\IA_TOWN_Profile"

if defined BROWSER_EXE (
    echo [DEMARRAGE] Lancement en mode application isolee avec contournement CORS securise...
    start "" "%BROWSER_EXE%" --app="%APP_URL%" --allow-file-access-from-files --disable-web-security --user-data-dir="%USER_DATA%" --window-size=1600,920 --disable-features=Translate,OptimizationHints
    exit /b 0
)

echo [DEMARRAGE] Lancement dans votre navigateur par defaut...
start "" "%APP_INDEX%"
exit /b 0
