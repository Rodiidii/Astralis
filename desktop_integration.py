"""Local Windows preferences, startup watcher and application shortcuts."""
from __future__ import annotations
import argparse
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

RUN_KEY = r"Software\Microsoft\Windows\CurrentVersion\Run"

def local_root() -> Path:
    return Path(os.environ.get("LOCALAPPDATA") or Path.home() / "AppData" / "Local") / "Astralis"

def read_settings() -> dict:
    try:
        data = json.loads((local_root() / "desktop-settings.json").read_text(encoding="utf-8"))
    except (OSError, ValueError):
        data = {}
    return {"autoOpenGenshin": bool(data.get("autoOpenGenshin", False)), "root": str(data.get("root", ""))}

def save_settings(root: Path, enabled: bool) -> dict:
    if os.name != "nt":
        raise ValueError("Cette option est disponible dans l’application Windows.")
    import winreg
    root = root.resolve()
    if not (root / "server.py").is_file():
        raise ValueError("Installation Astralis introuvable.")
    folder = local_root()
    folder.mkdir(parents=True, exist_ok=True)
    data = {"autoOpenGenshin": bool(enabled), "root": str(root)}
    path = folder / "desktop-settings.json"
    temporary = path.with_suffix(".tmp")
    temporary.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
    temporary.replace(path)
    with winreg.CreateKey(winreg.HKEY_CURRENT_USER, RUN_KEY) as key:
        if enabled:
            watcher = folder / "genshin_watcher.py"
            shutil.copy2(root / "scripts" / "genshin_watcher.py", watcher)
            python = Path(sys.executable).with_name("pythonw.exe")
            if not python.is_file():
                python = Path(sys.executable)
            command = subprocess.list2cmdline([str(python), str(watcher)])
            winreg.SetValueEx(key, "AstralisGenshin", 0, winreg.REG_SZ, command)
            subprocess.Popen([str(python), str(watcher)], cwd=str(folder), creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0), stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        else:
            try:
                winreg.DeleteValue(key, "AstralisGenshin")
            except FileNotFoundError:
                pass
    return {**data, "supported": True}

def create_shortcut(root: Path, location: str = "desktop", icon: str = "astralis", *, _destination: Path | None = None) -> str:
    if os.name != "nt":
        raise ValueError("Les raccourcis sont disponibles sous Windows.")
    if location not in {"desktop", "startmenu"} or icon not in {"astralis", "genshin"}:
        raise ValueError("Emplacement ou icône non valide.")
    root = root.resolve()
    launcher = root / "Installer et lancer Astralis.ps1"
    image = root / "assets" / "pwa" / ("astralis.ico" if icon == "astralis" else "genshin.ico")
    if not launcher.is_file() or not image.is_file():
        raise ValueError("Lanceur ou icône Astralis absent.")
    # Values are transported in the environment, never inserted into shell code.
    script = r"$s=New-Object -ComObject WScript.Shell;$folder=if($env:ASTRALIS_LINK_LOCATION -eq 'desktop'){[Environment]::GetFolderPath('Desktop')}else{Join-Path ([Environment]::GetFolderPath('StartMenu')) 'Programs'};$destination=if($env:ASTRALIS_LINK_DESTINATION){$env:ASTRALIS_LINK_DESTINATION}else{Join-Path $folder 'Astralis.lnk'};[void][IO.Directory]::CreateDirectory((Split-Path -Parent $destination));$l=$s.CreateShortcut($destination);$l.TargetPath=Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe';$l.Arguments=$env:ASTRALIS_LINK_ARGS;$l.WorkingDirectory=$env:ASTRALIS_LINK_ROOT;$l.IconLocation=$env:ASTRALIS_LINK_ICON+',0';$l.WindowStyle=7;$l.Description='Ouvrir Astralis';$l.Save();Write-Output $l.FullName"
    env = {**os.environ, "ASTRALIS_LINK_DESTINATION":str(_destination) if _destination else "", "ASTRALIS_LINK_LOCATION": location, "ASTRALIS_LINK_ROOT": str(root), "ASTRALIS_LINK_ICON": str(image), "ASTRALIS_LINK_ARGS": subprocess.list2cmdline(["-NoProfile", "-ExecutionPolicy", "Bypass", "-WindowStyle", "Hidden", "-File", str(launcher), "-ReuseServer"])}
    result = subprocess.run(["powershell.exe", "-NoProfile", "-NonInteractive", "-Command", script], env=env, capture_output=True, text=True, timeout=25, creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))
    if result.returncode:
        raise RuntimeError(result.stderr.strip() or "Création du raccourci impossible.")
    return result.stdout.strip()

def close_app_windows(root: Path, titles: list[str]) -> None:
    if os.name != "nt" or not titles:
        return
    env = {**os.environ, "ASTRALIS_WINDOW_TITLES": json.dumps(titles, ensure_ascii=False)}
    subprocess.run(["powershell.exe", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File", str(root / "scripts" / "close_app_windows.ps1")], env=env, timeout=20, check=False, creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("action", choices=["shortcut"])
    parser.add_argument("--root", required=True)
    parser.add_argument("--location", default="desktop")
    parser.add_argument("--icon", default="astralis")
    args = parser.parse_args()
    print(create_shortcut(Path(args.root), args.location, args.icon))
