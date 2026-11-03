@echo off
cd /d "%~dp0"
echo Re-telechargement de TOUS les artworks (sans les illustrations d anniversaire)...
where py >nul 2>nul && (py -3 scripts\telecharger_artworks.py --remplacer) || (python scripts\telecharger_artworks.py --remplacer)
pause
