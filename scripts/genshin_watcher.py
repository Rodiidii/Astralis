"""Small independent watcher: it survives Astralis being closed or updated."""
from __future__ import annotations
import ctypes
import json
import os
import subprocess
import time
from pathlib import Path

GAMES = {"genshinimpact.exe", "yuanshen.exe"}

def process_names() -> list[str]:
    from ctypes import wintypes
    class ProcessEntry(ctypes.Structure):
        _fields_ = [("dwSize", wintypes.DWORD), ("cntUsage", wintypes.DWORD),
                    ("th32ProcessID", wintypes.DWORD), ("th32DefaultHeapID", ctypes.c_size_t),
                    ("th32ModuleID", wintypes.DWORD), ("cntThreads", wintypes.DWORD),
                    ("th32ParentProcessID", wintypes.DWORD), ("pcPriClassBase", wintypes.LONG),
                    ("dwFlags", wintypes.DWORD), ("szExeFile", wintypes.WCHAR * 260)]
    kernel = ctypes.WinDLL("kernel32", use_last_error=True)
    kernel.CreateToolhelp32Snapshot.argtypes = [wintypes.DWORD, wintypes.DWORD]
    kernel.CreateToolhelp32Snapshot.restype = wintypes.HANDLE
    kernel.Process32FirstW.argtypes = [wintypes.HANDLE, ctypes.POINTER(ProcessEntry)]
    kernel.Process32NextW.argtypes = [wintypes.HANDLE, ctypes.POINTER(ProcessEntry)]
    kernel.CloseHandle.argtypes = [wintypes.HANDLE]
    snapshot = kernel.CreateToolhelp32Snapshot(2, 0)
    if snapshot == ctypes.c_void_p(-1).value:
        raise ctypes.WinError(ctypes.get_last_error())
    try:
        entry = ProcessEntry(); entry.dwSize = ctypes.sizeof(entry)
        names = []
        found = kernel.Process32FirstW(snapshot, ctypes.byref(entry))
        while found:
            names.append(entry.szExeFile)
            found = kernel.Process32NextW(snapshot, ctypes.byref(entry))
        return names
    finally:
        kernel.CloseHandle(snapshot)


def game_running() -> bool:
    return any(name.casefold() in GAMES for name in process_names())


def should_open(was_running: bool, running: bool) -> bool:
    return running and not was_running

def open_app(root: Path) -> None:
    import urllib.request
    try:
        with urllib.request.urlopen(os.environ.get("ASTRALIS_WATCHER_HEALTH_URL", "http://127.0.0.1:8766/health"), timeout=2) as response:
            health = json.load(response)
        if health.get("ok") and int(health.get("appWindows", 0)) > 0:
            return
    except Exception:
        pass
    launcher = root / "Installer et lancer Astralis.ps1"
    if launcher.is_file():
        subprocess.Popen(["powershell.exe", "-NoProfile", "-WindowStyle", "Hidden", "-ExecutionPolicy", "Bypass", "-File", str(launcher), "-ReuseServer"], cwd=str(root), creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0), stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

def main() -> None:
    if os.name != "nt":
        return
    kernel = ctypes.WinDLL("kernel32", use_last_error=True)
    kernel.CreateMutexW.argtypes = [ctypes.c_void_p, ctypes.c_int, ctypes.c_wchar_p]
    kernel.CreateMutexW.restype = ctypes.c_void_p
    mutex = kernel.CreateMutexW(None, False, "Local\\AstralisGenshinWatcher")
    if ctypes.get_last_error() == 183:
        return
    config = Path(os.environ.get("LOCALAPPDATA") or Path.home() / "AppData" / "Local") / "Astralis" / "desktop-settings.json"
    was_running = False
    try:
        while True:
            try:
                settings = json.loads(config.read_text(encoding="utf-8"))
                if not settings.get("autoOpenGenshin"):
                    break
                running = game_running()
                if should_open(was_running, running):
                    open_app(Path(settings["root"]))
                was_running = running
            except (OSError, ValueError, subprocess.SubprocessError):
                pass
            time.sleep(3)
    finally:
        kernel.CloseHandle.argtypes = [ctypes.c_void_p]
        kernel.CloseHandle(mutex)

if __name__ == "__main__":
    main()
