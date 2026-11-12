"""Remove community/fan-art card illustrations and their catalogue links.

Official source downloads are left temporarily available so missing official
files can be rebuilt by scripts/audit_cards.py before the raw cache is pruned.
"""
from __future__ import annotations

import hashlib
import json
import subprocess
from collections import defaultdict
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
OFFICIAL = {"official-hoyoverse", "official-kuro", "official-wiki-file-title"}


def accepted(row: dict) -> bool:
    return row.get("provenance") in OFFICIAL


def read(path: Path, default):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return default


def write(path: Path, data) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def refresh_record(row: dict, path: Path) -> None:
    raw = path.read_bytes()
    row["sha256"] = hashlib.sha256(raw).hexdigest()
    with Image.open(path) as source:
        image = ImageOps.exif_transpose(source).convert("RGB")
        width, height = image.size
        row["width"], row["height"] = width, height
        row["pixelSha256"] = hashlib.sha256(f"{width}x{height}".encode() + image.tobytes()).hexdigest()
        small = image.resize((9, 8)).convert("L")
        values = list(small.get_flattened_data())
        dhash = sum((values[y * 9 + x] > values[y * 9 + x + 1]) << (y * 8 + x) for y in range(8) for x in range(8))
        row["dhash"] = f"{dhash:016x}"


def main() -> int:
    manifest_path = ROOT / "public/card-artworks.json"
    manifest = read(manifest_path, {})
    artworks = manifest.get("artworks", {})
    removed = [row for row in artworks.values() if not accepted(row)]
    removed_paths = {row.get("src", "") for row in removed if row.get("src")}
    official = {key: dict(row) for key, row in artworks.items() if accepted(row)}
    old_manifest_text = subprocess.check_output(["git", "show", "HEAD:public/card-artworks.json"], cwd=ROOT, text=True, encoding="utf-8")
    old_manifest = json.loads(old_manifest_text)
    restored = 0
    for old_row in old_manifest.get("artworks", {}).values():
        if old_row.get("provenance") not in OFFICIAL:
            continue
        src = old_row.get("src", "")
        if not src.startswith("assets/card-art/"):
            continue
        path = ROOT / src
        if not path.is_file():
            check = subprocess.run(["git", "restore", "--source=HEAD", "--", src], cwd=ROOT, capture_output=True, text=True)
            if check.returncode == 0 and path.is_file():
                restored += 1
        if not path.is_file():
            continue
        if src not in {row.get("src") for row in official.values()}:
            official[src] = dict(old_row)
        else:
            current = next(row for row in official.values() if row.get("src") == src)
            # Keep the current attribution if it is already official; the baseline
            # still establishes the official provenance of the identical path.
            if current.get("provenance") not in OFFICIAL:
                current.update(old_row)

    missing_official = {row.get("src", "") for row in official.values() if row.get("src") and not (ROOT / row["src"]).is_file()}
    official = {key: row for key, row in official.items() if row.get("src") not in missing_official}
    keep_paths = {row.get("src") for row in official.values()}

    # Reconcile the old official catalogue and the newly fetched official files.
    # A duplicate pixel fingerprint keeps one attribution and one usable asset.
    unique = {}
    seen_pixels = {}
    duplicate_rows = []
    invalid_rows = []
    for key, row in sorted(official.items()):
        path = ROOT / row["src"]
        try:
            refresh_record(row, path)
        except Exception as error:
            invalid_rows.append({"file": row["src"], "reason": f"Image officielle absente ou illisible: {error}"})
            removed_paths.add(row["src"])
            continue
        fingerprint = row.get("sourcePixelSha256") or row.get("pixelSha256")
        if fingerprint in seen_pixels:
            duplicate_rows.append({"file": row["src"], "sameAs": seen_pixels[fingerprint]})
            removed_paths.add(row["src"])
            continue
        seen_pixels[fingerprint] = row["src"]
        unique[key] = row
    official = unique
    keep_paths = {row.get("src") for row in official.values()}
    manifest["artworks"] = official
    all_pools = defaultdict(list)
    for source_manifest in (old_manifest, manifest):
        for key, paths in source_manifest.get("ASTRALIS_CARD_ARTWORKS", {}).items():
            for src in paths:
                if src in keep_paths and src not in all_pools[key]:
                    all_pools[key].append(src)
    manifest["ASTRALIS_CARD_ARTWORKS"] = {key: paths for key, paths in all_pools.items()}
    manifest["assignments"] = {}
    write(manifest_path, manifest)

    sources_path = ROOT / "assets/card-art/sources.json"
    sources = read(sources_path, [])
    kept_sources = [row for row in sources if accepted(row)]
    write(sources_path, kept_sources)
    official_downloads_path = ROOT / "assets/card-art/downloads/sources.json"
    downloads = read(official_downloads_path, [])
    write(official_downloads_path, [row for row in downloads if row.get("provenance") in OFFICIAL])

    audit_path = ROOT / "docs/card-audit.json"
    audit = read(audit_path, {})
    audit["duplicateCandidates"] = duplicate_rows
    audit["rejected"] = invalid_rows
    write(audit_path, audit)

    deleted = 0
    for src in removed_paths | missing_official:
        if not src.startswith("assets/card-art/"):
            raise SystemExit(f"Chemin d’image hors du dossier cartes : {src}")
        path = (ROOT / src).resolve()
        if ROOT.resolve() not in path.parents:
            raise SystemExit(f"Chemin de suppression invalide : {path}")
        try:
            path.unlink()
            deleted += 1
        except FileNotFoundError:
            pass

    report = ROOT / "assets/card-art/downloads/community-art-report.json"
    try:
        report.unlink()
    except FileNotFoundError:
        pass
    print(json.dumps({"removedNonOfficialManifestRows": len(removed), "removedNonOfficialFiles": deleted, "restoredVerifiedOfficialFiles": restored, "remainingOfficialFiles": len(official), "missingOfficialQueuedForReimport": len(missing_official), "sourceCreditsKept": len(kept_sources)}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
