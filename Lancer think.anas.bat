@echo off
title think.anas
cd /d "%~dp0"
if exist "think.anas" cd "think.anas"
if exist "desktop\think.anas.exe" start "" "desktop\think.anas.exe" & exit
start "" wscript.exe "%~dp0think.anas\desktop\think.anas.vbs" 2>nul || start "" wscript.exe "%~dp0desktop\think.anas.vbs" 2>nul || npm run desktop
exit
