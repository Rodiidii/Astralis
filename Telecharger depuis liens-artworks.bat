@echo off
cd /d "%~dp0"
where py >nul 2>nul && (py -3 scripts\telecharger_depuis_liens.py) || (python scripts\telecharger_depuis_liens.py)
pause
