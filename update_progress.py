"""Shared, persistent update progress used before and after the server restarts."""
from __future__ import annotations
import json
import os
import time
from pathlib import Path

STEPS = [("checking", "Vérification de la version"), ("downloading", "Téléchargement de l’archive"), ("verifying", "Vérification des fichiers"), ("extracting", "Décompression"), ("closing", "Fermeture de l’ancienne fenêtre et du serveur"), ("replacing", "Remplacement du dossier"), ("starting", "Démarrage du nouveau serveur"), ("cleaning", "Suppression de l’archive et nettoyage"), ("opening", "Ouverture de la nouvelle fenêtre")]

def local_root() -> Path:
    return Path(os.environ.get("LOCALAPPDATA") or Path.home() / "AppData" / "Local") / "Astralis"

def read_status() -> dict:
    try:
        return json.loads((local_root() / "update-status.json").read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return {}

def write_status(**values) -> dict:
    now = time.time()
    previous = read_status()
    if values.get("jobId") and previous.get("jobId") != values["jobId"]:
        previous = {}
    state = values.get("state", previous.get("state", "idle"))
    data = {**previous, **values, "updatedAt": now}
    if state != previous.get("state"):
        completed = list(previous.get("completedSteps", []))
        old = previous.get("state")
        if old in dict(STEPS) and old not in completed and state != "error":
            completed.append(old)
        data.update(stepStartedAt=now, completedSteps=completed)
    data.setdefault("startedAt", now)
    data["elapsedSeconds"] = max(0, now - data["startedAt"])
    data["steps"] = [{"id": key, "label": label, "status": "done" if state == "done" or key in data.get("completedSteps", []) else "active" if key == state else "pending"} for key, label in STEPS]
    if state in dict(STEPS):
        index = [key for key, _ in STEPS].index(state)
        fraction = max(0, min(1, float(data.get("percent", 0)) / 100)) if state in {"downloading", "extracting"} else 0
        data["overallPercent"] = round((index + fraction) / len(STEPS) * 100)
    if state == "downloading":
        seconds = max(.1, now - data.get("stepStartedAt", now))
        speed = float(data.get("receivedBytes", 0)) / seconds
        remaining = max(0, float(data.get("totalBytes", 0)) - float(data.get("receivedBytes", 0)))
        data["remainingSeconds"] = round(remaining / speed + 25) if speed > 0 and data.get("totalBytes") else None
    elif state == "extracting" and data.get("extractedFiles") and data.get("totalFiles"):
        seconds=max(.1,now-data.get("stepStartedAt",now))
        data["remainingSeconds"]=round(seconds*(data["totalFiles"]-data["extractedFiles"])/data["extractedFiles"]+20)
    elif state in dict(STEPS):
        data["remainingSeconds"] = max(1, round((len(STEPS) - [key for key, _ in STEPS].index(state)) * 4))
    elif state == "done":
        data.update(overallPercent=100, remainingSeconds=0)
    folder = local_root()
    folder.mkdir(parents=True, exist_ok=True)
    target = folder / "update-status.json"
    temporary = folder / f"update-status.{os.getpid()}.tmp"
    temporary.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
    os.replace(temporary, target)
    return data
