Dim WshShell, fso, appDir, exePath, edgePath, chromePath, appUrl, userData, htmlPath
Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

appDir = fso.GetParentFolderName(WScript.ScriptFullName)
exePath = appDir & "\IA_TOWN_Beta_v1.0.exe"
htmlPath = appDir & "\app\index.html"

' Check if app exists
If Not fso.FileExists(htmlPath) Then
    MsgBox "Le dossier 'app' contenant les fichiers de la ville est introuvable !" & vbCrLf & vbCrLf & _
           "Veuillez extraire TOUS les fichiers du fichier ZIP (clic-droit > 'Extraire tout') avant de lancer l'application.", _
           48, "IA TOWN Beta v1.0 — Extraction requise"
    WScript.Quit 1
End If

' Priority 1: Launch native binary with integrated micro-server
If fso.FileExists(exePath) Then
    WshShell.Run """" & exePath & """", 0, False
    WScript.Quit 0
End If

' Priority 2: Fallback with isolated profile and CORS relaxation for local file execution
appUrl = "file:///" & Replace(htmlPath, "\", "/")
userData = WshShell.ExpandEnvironmentStrings("%TEMP%\IA_TOWN_Profile")

edgePath = WshShell.ExpandEnvironmentStrings("%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe")
If Not fso.FileExists(edgePath) Then
    edgePath = WshShell.ExpandEnvironmentStrings("%ProgramFiles%\Microsoft\Edge\Application\msedge.exe")
End If

If fso.FileExists(edgePath) Then
    WshShell.Run """" & edgePath & """ --app=""" & appUrl & """ --allow-file-access-from-files --disable-web-security --user-data-dir=""" & userData & """ --window-size=1600,920 --disable-features=Translate,OptimizationHints", 1, False
    WScript.Quit 0
End If

chromePath = WshShell.ExpandEnvironmentStrings("%ProgramFiles%\Google\Chrome\Application\chrome.exe")
If Not fso.FileExists(chromePath) Then
    chromePath = WshShell.ExpandEnvironmentStrings("%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe")
End If
If Not fso.FileExists(chromePath) Then
    chromePath = WshShell.ExpandEnvironmentStrings("%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe")
End If

If fso.FileExists(chromePath) Then
    WshShell.Run """" & chromePath & """ --app=""" & appUrl & """ --allow-file-access-from-files --disable-web-security --user-data-dir=""" & userData & """ --window-size=1600,920 --disable-features=Translate,OptimizationHints", 1, False
    WScript.Quit 0
End If

WshShell.Run """" & htmlPath & """", 1, False
