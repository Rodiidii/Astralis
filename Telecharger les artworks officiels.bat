@echo off
cd /d "%~dp0"
where py >nul 2>nul && (py -3 scripts\telecharger_artworks.py) || (python scripts\telecharger_artworks.py)
pause
