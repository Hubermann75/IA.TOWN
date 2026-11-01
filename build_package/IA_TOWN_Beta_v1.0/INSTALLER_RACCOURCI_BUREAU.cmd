@echo off
chcp 65001 >nul
title IA TOWN — INSTALLATION RACCOURCI BUREAU (BETA V1.0)
color 0B
echo =====================================================================
echo    IA TOWN - REVENUE ENGINE V3.0 (Beta v1.0)
echo    Installation du raccourci officiel sur votre Bureau Windows
echo =====================================================================
echo.
echo Creation du raccourci sur le Bureau avec icone personnalisee...

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
echo [SUCCES] L'icone 'IA TOWN - Beta v1.0' est desormais installee sur votre Bureau !
echo Vous pouvez double-cliquer dessus directement pour lancer le jeu/plateforme.
echo.
pause
