"""Import distinct locally archived Genshin promo artworks as card variants.

This only imports image files from assets/artworks-candidats. It rejects exact
SHA-256 duplicates already in assets/fanarts and assigns each chosen image to
one rarity slot, so a source image is never reused for another card variant.
"""
from __future__ import annotations

import hashlib
import json
import re
import shutil
from urllib.parse import quote
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(r"C:\Users\Ravon\Downloads\Astralis-v86-Genshin\Astralis-v76-Genshin\assets\artworks-candidats")
DEST = ROOT / "assets" / "fanarts"
MANIFEST = ROOT / "assets" / "card-art-imports.json"
IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".webp", ".avif"}
RARITIES = ("common", "super", "rare", "epic")


def digest(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def slug(value: str) -> str:
    value = re.sub(r"-(?:full|astral)$", "", value, flags=re.I)
    return value.lower()


def main() -> None:
    DEST.mkdir(parents=True, exist_ok=True)
    used = {digest(path) for path in DEST.iterdir() if path.is_file() and path.suffix.lower() in IMAGE_EXTS}
    imports: list[dict[str, str]] = []
    if not SOURCE.is_dir():
        raise SystemExit(f"Source d’illustrations introuvable : {SOURCE}")
    for folder in sorted(path for path in SOURCE.iterdir() if path.is_dir()):
        # Candidate folders were curated for a specific character and contain
        # official wallpapers, commemorative art and illustration contest art.
        if not re.search(r"-(?:full|astral)$", folder.name, flags=re.I):
            continue
        character = slug(folder.name)
        candidates = sorted(
            (path for path in folder.iterdir() if path.is_file() and path.suffix.lower() in IMAGE_EXTS),
            key=lambda path: ("shorts" in path.stem.lower(), path.name.lower()),
        )
        selected: list[Path] = []
        for source in candidates:
            sha = digest(source)
            if sha in used:
                continue
            used.add(sha)
            selected.append(source)
            if len(selected) == len(RARITIES):
                break
        for rarity, source in zip(RARITIES, selected):
            target = DEST / f"{character}-{rarity}{source.suffix.lower()}"
            if target.exists():
                # Never overwrite a previously curated file.
                continue
            shutil.copy2(source, target)
            imports.append({"file": target.name, "character": character, "rarity": rarity,
                            "sha256": digest(target), "source_file": source.name,
                            "source_folder": folder.name,
                            "source": "https://genshin-impact.fandom.com/wiki/File:" + quote(source.name.replace(" ", "_"))})
    old = []
    if MANIFEST.exists():
        try:
            old = json.loads(MANIFEST.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            old = []
    merged = {row["file"]: row for row in old if isinstance(row, dict) and row.get("file")}
    merged.update({row["file"]: row for row in imports})
    MANIFEST.write_text(json.dumps(list(merged.values()), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Illustrations ajoutées : {len(imports)}")
    print(f"Manifeste : {MANIFEST}")
    for row in imports:
        print(f"{row['character']} [{row['rarity']}] <- {row['source_file']} -> {row['file']}")


if __name__ == "__main__":
    main()
