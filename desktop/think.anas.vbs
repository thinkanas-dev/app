' think.anas — double-cliquer pour ouvrir l'app de bureau.
' Aucune fenêtre de terminal, aucune commande à taper : l'app démarre elle-même son serveur.
Option Explicit
Dim fso, shell, racine, electron
Set fso = CreateObject("Scripting.FileSystemObject")
Set shell = CreateObject("WScript.Shell")
racine = fso.GetParentFolderName(fso.GetParentFolderName(WScript.ScriptFullName))
electron = racine & "\node_modules\electron\dist\electron.exe"
If Not fso.FileExists(electron) Then
  MsgBox "Electron est introuvable dans le dossier node_modules du projet." & vbCrLf & _
         "Les dépendances doivent avoir été installées une première fois.", vbExclamation, "think.anas"
  WScript.Quit 1
End If
shell.CurrentDirectory = racine
shell.Run """" & electron & """ """ & racine & "\desktop\main.mjs""", 1, False
