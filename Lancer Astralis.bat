@echo off
cd /d "%~dp0"
rem Arrete un ancien serveur Astralis encore ouvert sur le port 8766 (sinon l'ancien dossier reste servi et la page peut rester vide).
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-NetTCPConnection -LocalPort 8766 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }; Start-Sleep -Milliseconds 400; Start-Process -FilePath 'python' -ArgumentList 'server.py' -WorkingDirectory '%CD%' -WindowStyle Hidden; Start-Sleep -Milliseconds 900; Start-Process 'http://127.0.0.1:8766/index.html'"


