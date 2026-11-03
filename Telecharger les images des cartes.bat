@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Telechargement des illustrations des cartes (cartes-images.txt)...
where py >nul 2>nul
if %errorlevel%==0 (py -3 "scripts\telecharger_images_cartes.py") else (python "scripts\telecharger_images_cartes.py")
echo.
pause
