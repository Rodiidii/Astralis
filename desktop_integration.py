"""Local Windows preferences, startup watcher and application shortcuts."""
from __future__ import annotations
import base64
import hashlib
import struct
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

def set_app_icon(data: str | None) -> Path | None:
    folder = local_root() / "icons"
    folder.mkdir(parents=True, exist_ok=True)
    record = folder / "current.json"
    if not data:
        record.unlink(missing_ok=True)
        return None
    if not isinstance(data, str) or not data.startswith("data:image/png;base64,") or len(data) > 1_500_000:
        raise ValueError("L’icône doit être une image PNG redimensionnée.")
    try:
        png = base64.b64decode(data.split(",", 1)[1], validate=True)
    except ValueError:
        raise ValueError("Image d’icône invalide.")
    if len(png) < 33 or png[:8] != b"\x89PNG\r\n\x1a\n" or png[12:16] != b"IHDR":
        raise ValueError("Image PNG invalide.")
    width, height = struct.unpack(">II", png[16:24])
    if not (1 <= width <= 256 and 1 <= height <= 256):
        raise ValueError("L’icône doit mesurer au maximum 256 pixels.")
    image = folder / ("app-" + hashlib.sha256(png).hexdigest()[:20] + ".ico")
    image.write_bytes(struct.pack("<HHH",0,1,1) + struct.pack("<BBBBHHII",width % 256,height % 256,0,0,1,32,len(png),22) + png)
    record.write_text(json.dumps({"name":image.name}), encoding="utf-8")
    return image


def app_icon(root: Path) -> Path:
    folder = local_root() / "icons"
    try:
        name = json.loads((folder / "current.json").read_text(encoding="utf-8"))["name"]
        if isinstance(name,str) and name.startswith("app-") and Path(name).name == name and (folder/name).is_file():
            return folder/name
    except (OSError, ValueError, KeyError):
        pass
    return root / "assets" / "pwa" / "astralis.ico"


def refresh_shortcut_icons(root: Path) -> None:
    if os.name != "nt": return
    image = app_icon(root)
    script = r"$s=New-Object -ComObject WScript.Shell;foreach($folder in @([Environment]::GetFolderPath('Desktop'),(Join-Path ([Environment]::GetFolderPath('StartMenu')) 'Programs'))){Get-ChildItem -LiteralPath $folder -Filter 'Astralis*.lnk' -File -ErrorAction SilentlyContinue|ForEach-Object {$l=$s.CreateShortcut($_.FullName);if($l.WorkingDirectory -eq $env:ASTRALIS_LINK_ROOT){$l.IconLocation=$env:ASTRALIS_LINK_ICON+',0';$l.Save()}}}"
    subprocess.run(["powershell.exe","-NoProfile","-NonInteractive","-Command",script],env={**os.environ,"ASTRALIS_LINK_ROOT":str(root.resolve()),"ASTRALIS_LINK_ICON":str(image)},check=True,timeout=25,creationflags=getattr(subprocess,"CREATE_NO_WINDOW",0),capture_output=True)


def create_shortcut(root: Path, location: str = "desktop", icon: str = "app", *, _destination: Path | None = None) -> str:
    if os.name != "nt":
        raise ValueError("Les raccourcis sont disponibles sous Windows.")
    if location not in {"desktop", "startmenu"} or icon not in {"app", "astralis", "genshin"}:
        raise ValueError("Emplacement ou icône non valide.")
    root = root.resolve()
    launcher = root / "Installer et lancer Astralis.ps1"
    image = app_icon(root)
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
