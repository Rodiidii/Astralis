@echo off
setlocal
cd /d "%~dp0"
title Publication Astralis sur GitHub

where gh >nul 2>nul
if errorlevel 1 (
  echo GitHub CLI (gh) n'est pas installe.
  echo Installe-le depuis https://cli.github.com/ puis ouvre ce fichier a nouveau.
  pause
  exit /b 1
)
gh auth status >nul 2>nul
if errorlevel 1 (
  echo Connecte ton compte GitHub dans un terminal avec : gh auth login
  pause
  exit /b 1
)

set /p REPO=Nom du depot GitHub (proprietaire/astralis) : 
if "%REPO%"=="" exit /b 1
set /p TAG=Tag de version (exemple v1.0.0) : 
if "%TAG%"=="" exit /b 1
set "VERSION=%TAG:v=%"
>VERSION echo %VERSION%

py -3 scripts\build_release.py
if errorlevel 1 goto fail
git add -A
git commit -m "Prepare Astralis %TAG%"
if errorlevel 1 echo Aucun changement a committer ou commit deja cree.

git remote get-url origin >nul 2>nul
if errorlevel 1 (
  gh repo create "%REPO%" --public --source . --remote origin --push
  if errorlevel 1 goto fail
) else (
  git push origin main
  if errorlevel 1 goto fail
)

gh release create "%TAG%" "releases\Astralis-Update.zip" "releases\Astralis-Update.zip.sha256" --title "Astralis %TAG%" --generate-notes
if errorlevel 1 goto fail
echo.
echo Publication terminee : https://github.com/%REPO%/releases/latest
echo Dans Astralis sur chaque PC : Reglages, saisir %REPO%, puis Verifier les mises a jour.
pause
exit /b 0

:fail
echo.
echo Publication non terminee. Lis le message GitHub ci-dessus puis relance ce fichier.
pause
exit /b 1
