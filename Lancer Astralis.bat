@echo off
setlocal
cd /d "%~dp0"
title Astralis
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Installer et lancer Astralis.ps1" %*
if errorlevel 1 (
  echo.
  echo Astralis n'a pas pu demarrer. Copie ce message pour le diagnostic.
  pause
)
endlocal
