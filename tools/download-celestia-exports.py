"""Download the public Solo, Team and artifact set exports of every Celestia leaderboard.

Install browser dependency once:
    python -m pip install playwright
    python -m playwright install chromium
Run:
    python tools/download-celestia-exports.py
Use --limit 3 for a smoke test, --refresh to replace valid existing downloads.
The manifest records unavailable exports and failures. Failed runs return exit code 1.
"""
import argparse
import hashlib
import json
import re
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import urlsplit
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://celestia.cv"


def write_json(path, data):
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    temporary.replace(path)


def validate(data, kind):
    if not isinstance(data, dict):
        raise ValueError("Export is not a JSON object")
    if kind == "config" and not isinstance(data.get("targets"), list):
        raise ValueError("Solo targets missing")
    if kind == "team" and not isinstance(data.get("loadoutData"), list):
        raise ValueError("Team loadoutData missing")
    if not data.get("name"):
        raise ValueError("Export name missing")
    return data


def stable_export(data):
    return {key: value for key, value in data.items() if key != "lastEdit"} if isinstance(data, dict) else data


def save_export(output, kind, slug, data):
    validate(data, kind)
    target = output / kind / (slug + ".json")
    encoded = json.dumps(data, ensure_ascii=False, indent=2).encode("utf-8")
    if target.exists():
        try:
            old = target.read_bytes()
            if stable_export(json.loads(old)) == stable_export(data):
                encoded = old
        except (ValueError, OSError):
            pass
    if not target.exists() or target.read_bytes() != encoded:
        write_json(target, data)
    return {"status": "downloaded", "file": target.relative_to(output).as_posix(),
            "sha256": hashlib.sha256(encoded).hexdigest()}


def set_variants(output, slug, payload, defaults):
    by_set = {}
    for item in payload.get("goSets") or []:
        set_id = item.get("setId")
        if isinstance(set_id, int):
            by_set[set_id] = {"config": (item.get("go") or {}).get("multiTarget"),
                              "team": item.get("team")}
    for item in payload.get("goTeams") or []:
        set_id = item.get("setId")
        team = (item.get("team") or {}).get("team")
        if isinstance(set_id, int) and team:
            by_set.setdefault(set_id, {})["team"] = team
    variants = []
    for set_id, exports in sorted(by_set.items()):
        files = {}
        for kind, data in exports.items():
            if data is not None and stable_export(data) != stable_export(defaults[kind]):
                files[kind] = save_export(output, kind, f"{slug}--set-{set_id}", data)
        if files:
            variants.append({"setId": set_id, "exports": files})
    return variants


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=ROOT / "data" / "celestia-exports")
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--refresh", action="store_true")
    args = parser.parse_args()
    if args.limit < 0:
        parser.error("--limit must be zero or positive")
    output = args.output.resolve()
    for kind in ("config", "team"):
        (output / kind).mkdir(parents=True, exist_ok=True)
    manifest = {"source": BASE + "/leaderboards", "updatedAt": datetime.now(timezone.utc).isoformat(), "entries": []}
    manifest_path = output / "manifest.json"
    try:
        previous = json.loads(manifest_path.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        previous = {}
    previous_by_slug = {entry["slug"]: entry for entry in previous.get("entries", []) if "slug" in entry}
    failures = 0
    checked_at = datetime.now(timezone.utc)
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        context = browser.new_context(locale="en-US")
        page = context.new_page()
        page.set_default_timeout(20000)
        page.goto(BASE + "/leaderboards", wait_until="domcontentloaded")
        response = context.request.get(BASE + "/api/categories")
        if response.status != 200:
            raise RuntimeError("Category index HTTP " + str(response.status))
        categories = response.json().get("categories", [])
        links = list(dict.fromkeys("/leaderboards/" + row["id"] for row in categories
                                   if isinstance(row.get("id"), str) and re.fullmatch(r"[a-z0-9-]+", row["id"])))
        if not links:
            raise RuntimeError("No valid categories in the Celestia index")
        if args.limit:
            links = links[:args.limit]
        for index, link in enumerate(links):
            slug = urlsplit(link).path.rsplit("/", 1)[-1]
            entry = {"slug": slug, "url": BASE + link, "exports": {}}
            pending = []
            previous_entry = previous_by_slug.get(slug, {})
            try:
                previous_check = datetime.fromisoformat(previous_entry.get("checkedAt") or previous.get("updatedAt", ""))
                expired = checked_at - previous_check >= timedelta(days=6)
            except (TypeError, ValueError):
                expired = True
            for kind in ("config", "team"):
                target = output / kind / (slug + ".json")
                try:
                    if args.refresh or expired or not target.exists():
                        pending.append(kind)
                    else:
                        validate(json.loads(target.read_text(encoding="utf-8")), kind)
                        entry["exports"][kind] = {"status": "cached", "file": target.relative_to(output).as_posix(), "sha256": hashlib.sha256(target.read_bytes()).hexdigest()}
                except (ValueError, OSError):
                    pending.append(kind)
            if pending or "variants" not in previous_entry:
                try:
                    for attempt in range(3):
                        response = context.request.get(BASE + "/api/categories/" + slug + "/export", timeout=30000)
                        if response.status == 200:
                            break
                        if attempt == 2:
                            raise RuntimeError("Export HTTP " + str(response.status))
                        time.sleep(1.2 * (attempt + 1))
                    payload = response.json()
                    exports = {"config": (payload.get("go") or {}).get("multiTarget"),
                               "team": (payload.get("goTeam") or {}).get("team")}
                    for kind in pending:
                        data = exports[kind]
                        if data is None:
                            entry["exports"][kind] = {"status": "unavailable"}
                            continue
                        try:
                            entry["exports"][kind] = save_export(output, kind, slug, data)
                        except Exception as error:
                            failures += 1
                            entry["exports"][kind] = {"status": "error", "error": str(error)[:500]}
                    entry["variants"] = set_variants(output, slug, payload, exports)
                    # Keep the accompanying assumptions and export issues verifiable.
                    metadata = {"category": payload.get("category"), "child": payload.get("child"),
                                "reference": payload.get("reference"),
                                "goConditions": (payload.get("go") or {}).get("goConditions"),
                                "characterBonusStats": (payload.get("go") or {}).get("characterBonusStats"),
                                "enemy": (payload.get("go") or {}).get("enemy"),
                                "issues": (payload.get("go") or {}).get("issues", []),
                                "teamIssues": (payload.get("goTeam") or {}).get("issues", [])}
                    (output / "metadata").mkdir(exist_ok=True)
                    write_json(output / "metadata" / (slug + ".json"), metadata)
                    entry["checkedAt"] = checked_at.isoformat()
                except Exception as error:
                    failures += 1
                    entry["error"] = str(error)[:500]
            if previous_entry.get("checkedAt") or previous.get("updatedAt"):
                entry.setdefault("checkedAt", previous_entry.get("checkedAt") or previous["updatedAt"])
            if "variants" in previous_entry:
                entry.setdefault("variants", previous_entry["variants"])
            old = previous_entry.get("exports", {})
            for kind in ("config", "team"):
                result = entry["exports"].get(kind, {})
                if not result.get("file") and old.get(kind, {}).get("file"):
                    entry["exports"][kind] = {**old[kind], "status": "retained", "lastCheck": result.get("status", "error")}
            manifest["entries"].append(entry)
            print(f"{index + 1}/{len(links)} {slug} " + " ".join(kind + "=" + result["status"] for kind, result in entry["exports"].items()), flush=True)
            time.sleep(.25)
        browser.close()
    manifest["failures"] = failures
    if args.limit:
        processed = {row["slug"] for row in manifest["entries"]}
        manifest["entries"].extend(row for slug, row in previous_by_slug.items() if slug not in processed)
    write_json(manifest_path, manifest)
    raise SystemExit(1 if failures else 0)


if __name__ == "__main__":
    main()
