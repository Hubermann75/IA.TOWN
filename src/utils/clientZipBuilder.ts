/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * IA TOWN — Complete Windows Release Package Downloader
 * Downloads the full 26 MB production offline bundle (with native 64-bit .exe launcher,
 * micro HTTP server, silent VBS, desktop shortcut installer, and offline web app)
 */

import JSZip from 'jszip';
import { NATIVE_EXE_BASE64 } from './exeBase64';

const VBS_SILENT_CONTENT = `Dim WshShell, fso, appDir, exePath, edgePath, chromePath, appUrl
Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

appDir = fso.GetParentFolderName(WScript.ScriptFullName)
exePath = appDir & "\\IA_TOWN_Beta_v1.0.exe"

If fso.FileExists(exePath) Then
    WshShell.Run """" & exePath & """", 0, False
    WScript.Quit 0
End If

appUrl = "file:///" & Replace(appDir & "\\app\\index.html", "\\", "/")
edgePath = WshShell.ExpandEnvironmentStrings("%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe")
If Not fso.FileExists(edgePath) Then
    edgePath = WshShell.ExpandEnvironmentStrings("%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe")
End If

If fso.FileExists(edgePath) Then
    WshShell.Run """" & edgePath & """ --app=""" & appUrl & """ --allow-file-access-from-files --window-size=1600,920", 1, False
    WScript.Quit 0
End If

chromePath = WshShell.ExpandEnvironmentStrings("%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe")
If Not fso.FileExists(chromePath) Then
    chromePath = WshShell.ExpandEnvironmentStrings("%ProgramFiles(x86)%\\Google\\Chrome\\Application\\chrome.exe")
End If
If Not fso.FileExists(chromePath) Then
    chromePath = WshShell.ExpandEnvironmentStrings("%LOCALAPPDATA%\\Google\\Chrome\\Application\\chrome.exe")
End If

If fso.FileExists(chromePath) Then
    WshShell.Run """" & chromePath & """ --app=""" & appUrl & """ --allow-file-access-from-files --window-size=1600,920", 1, False
    WScript.Quit 0
End If

WshShell.Run """" & appDir & "\\app\\index.html""", 1, False
`;

const CMD_LAUNCHER_CONTENT = `@echo off
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
set "APP_INDEX=%APP_DIR%app\\index.html"
set "APP_URL=file:///%APP_INDEX:\\=/%"

if exist "%APP_DIR%IA_TOWN_Beta_v1.0.exe" (
    echo [DEMARRAGE] Lancement via IA_TOWN_Beta_v1.0.exe...
    start "" "%APP_DIR%IA_TOWN_Beta_v1.0.exe"
    exit /b 0
)

set "EDGE_EXE="
if exist "%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe" set "EDGE_EXE=%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe"
if exist "%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe" set "EDGE_EXE=%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe"

set "CHROME_EXE="
if exist "%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe" set "CHROME_EXE=%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe"
if exist "%ProgramFiles(x86)%\\Google\\Chrome\\Application\\chrome.exe" set "CHROME_EXE=%ProgramFiles(x86)%\\Google\\Chrome\\Application\\chrome.exe"
if exist "%LOCALAPPDATA%\\Google\\Chrome\\Application\\chrome.exe" set "CHROME_EXE=%LOCALAPPDATA%\\Google\\Chrome\\Application\\chrome.exe"

if defined EDGE_EXE (
    echo [DEMARRAGE] Lancement en mode application autonome (Edge Engine)...
    start "" "%EDGE_EXE%" --app="%APP_URL%" --allow-file-access-from-files --window-size=1600,920
    exit /b 0
)

if defined CHROME_EXE (
    echo [DEMARRAGE] Lancement en mode application autonome (Chrome Engine)...
    start "" "%CHROME_EXE%" --app="%APP_URL%" --allow-file-access-from-files --window-size=1600,920
    exit /b 0
)

echo [DEMARRAGE] Lancement dans votre navigateur par defaut...
start "" "%APP_INDEX%"
exit /b 0
`;

const INSTALLER_CMD_CONTENT = `@echo off
chcp 65001 >nul
title IA TOWN — INSTALLATEUR RACCOURCI BUREAU (BETA V1.0)
color 0B
echo =====================================================================
echo    IA TOWN - REVENUE ENGINE V3.0 (Beta v1.0)
echo    Installation du raccourci sur votre Bureau Windows...
echo =====================================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$WshShell = New-Object -comObject WScript.Shell; " ^
  "$DesktopPath = [Environment]::GetFolderPath('Desktop'); " ^
  "$Shortcut = $WshShell.CreateShortcut($DesktopPath + '\\IA TOWN - Beta v1.0.lnk'); " ^
  "$AppDir = '%~dp0'; " ^
  "$ExePath = $AppDir + 'IA_TOWN_Beta_v1.0.exe'; " ^
  "if (Test-Path $ExePath) { $Shortcut.TargetPath = $ExePath; } else { $Shortcut.TargetPath = $AppDir + 'LANCER_IA_TOWN.cmd'; } " ^
  "$Shortcut.WorkingDirectory = $AppDir; " ^
  "$Shortcut.IconLocation = $AppDir + 'IA_TOWN.ico'; " ^
  "$Shortcut.Description = 'IA TOWN & CCC.CONNECT HUB - Beta v1.0'; " ^
  "$Shortcut.Save();"

echo.
echo [SUCCES] Le raccourci 'IA TOWN - Beta v1.0' a ete cree sur votre Bureau !
echo.
pause
`;

const UNBLOCKER_CMD_CONTENT = `@echo off
chcp 65001 >nul
title IA TOWN — AUTORISATION & DEBLOCAGE WINDOWS
color 0A
echo =====================================================================
echo    IA TOWN - REVENUE ENGINE V3.0 (Beta v1.0)
echo    Deblocage de securite Windows (Zone.Identifier Mark-of-the-Web)
echo =====================================================================
echo.
echo Autorisation de tous les fichiers du dossier en cours...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-ChildItem -Path '%~dp0' -Recurse | Unblock-File"
echo.
echo [SUCCES] Tous les fichiers ont ete autorises et debloques !
echo Vous pouvez desormais lancer IA_TOWN_Beta_v1.0.exe ou le raccourci Bureau sans aucune alerte.
echo.
pause
`;

const GUIDE_TXT_CONTENT = `====================================================================
  IA TOWN — REVENUE ENGINE V3.0 & CCC.CONNECT HUB
  PACKAGE COMPLET BETA V1.0 (WINDOWS 11 / 10 / ANDROID)
====================================================================

TOUS VOS FICHIERS SONT RÉUNIS DANS CE DOSSIER UNIQUE (26 MB) !

COMMENT LANCER L'APPLICATION DIRECTEMENT SUR WINDOWS :

Option 1 (EXÉCUTABLE OFFICIEL AVEC MICRO-SERVEUR EMBARQUÉ) :
  Double-cliquez sur "IA_TOWN_Beta_v1.0.exe"
  -> Démarre instantanément l'application en mode fenêtre dédiée 60 FPS
     sans barre d'adresse ni onglet.

Option 2 (LANCEMENT RAPIDE BATCH) :
  Double-cliquez sur "LANCER_IA_TOWN.cmd"

Option 3 (SILENCIEUX SANS CONSOLE) :
  Double-cliquez sur "LANCER_IA_TOWN_SILENCIEUX.vbs"

Option 4 (RACCOURCI SUR LE BUREAU EN 1 CLIC) :
  Double-cliquez sur "INSTALLER_RACCOURCI_BUREAU.cmd"
  -> Crée immédiatement l'icône "IA TOWN - Beta v1.0" sur votre Bureau Windows.

* En cas d'alerte SmartScreen :
  Double-cliquez sur "DEBLOQUER_FICHIERS_WINDOWS.cmd" pour lever le blocage en 1 seconde.

====================================================================
`;

function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Downloads the full 26 MB Windows release package with .exe, all assets, scripts and launchers.
 */
export async function downloadCompleteBetaZipClientSide(): Promise<void> {
  try {
    // 1. Direct browser download of the pre-compiled full 26 MB zip package
    const directUrl = './downloads/IA_TOWN_Beta_v1.0_Complet.zip';
    const a = document.createElement('a');
    a.href = directUrl;
    a.download = 'IA_TOWN_Beta_v1.0_Complet.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return;
  } catch {
    // In-memory fallback if direct path fails
    const zip = new JSZip();
    const exeBytes = base64ToUint8Array(NATIVE_EXE_BASE64);

    zip.file("IA_TOWN_Beta_v1.0.exe", exeBytes);
    zip.file("LANCER_IA_TOWN.cmd", CMD_LAUNCHER_CONTENT);
    zip.file("LANCER_IA_TOWN_SILENCIEUX.vbs", VBS_SILENT_CONTENT);
    zip.file("INSTALLER_RACCOURCI_BUREAU.cmd", INSTALLER_CMD_CONTENT);
    zip.file("DEBLOQUER_FICHIERS_WINDOWS.cmd", UNBLOCKER_CMD_CONTENT);
    zip.file("GUIDE_LANCEMENT_WINDOWS.txt", GUIDE_TXT_CONTENT);

    const folder = zip.folder("IA_TOWN_Beta_v1.0");
    if (folder) {
      folder.file("IA_TOWN_Beta_v1.0.exe", exeBytes);
      folder.file("LANCER_IA_TOWN.cmd", CMD_LAUNCHER_CONTENT);
      folder.file("LANCER_IA_TOWN_SILENCIEUX.vbs", VBS_SILENT_CONTENT);
      folder.file("INSTALLER_RACCOURCI_BUREAU.cmd", INSTALLER_CMD_CONTENT);
      folder.file("DEBLOQUER_FICHIERS_WINDOWS.cmd", UNBLOCKER_CMD_CONTENT);
      folder.file("GUIDE_LANCEMENT_WINDOWS.txt", GUIDE_TXT_CONTENT);
    }

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "IA_TOWN_Beta_v1.0.zip";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }
}

/**
 * Downloads the standalone 95 KB native Windows 64-bit .EXE binary
 */
export function downloadStandaloneExeClientSide(): void {
  try {
    const a = document.createElement('a');
    a.href = './downloads/IA_TOWN_Beta_v1.0.exe';
    a.download = 'IA_TOWN_Beta_v1.0.exe';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch {
    const exeBytes = base64ToUint8Array(NATIVE_EXE_BASE64);
    const blob = new Blob([exeBytes.buffer as ArrayBuffer], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "IA_TOWN_Beta_v1.0.exe";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }
}
