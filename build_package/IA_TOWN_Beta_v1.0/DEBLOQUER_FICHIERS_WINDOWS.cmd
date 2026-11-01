@echo off
chcp 65001 >nul
title IA TOWN — AUTORISATION & DEBLOCAGE DES FICHIERS WINDOWS
color 0A
echo =====================================================================
echo    IA TOWN - REVENUE ENGINE V3.0 (Beta v1.0)
echo    Deblocage de securite Windows (Suppression du Mark-of-the-Web)
echo =====================================================================
echo.
echo Autorisation de tous les fichiers du dossier en cours...

powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-ChildItem -Path '%~dp0' -Recurse | Unblock-File"

echo.
echo [SUCCES] Tous les fichiers ont ete autorises et debloques !
echo Windows n'affichera plus aucun blocage ni SmartScreen lors de l'execution.
echo.
pause
