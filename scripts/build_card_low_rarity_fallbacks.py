"""Allocate unused official in-game portraits to otherwise blank low-rarity cards.

Splash portraits are intentionally restricted to Common/Super Common/Rare/Epic.
Each source is fingerprinted and can be assigned only once.
"""
from __future__ import annotations

import hashlib
import json
from collections import defaultdict
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
CATALOG = ROOT / "public/card-catalog.json"
MANIFEST = ROOT / "public/card-artworks.json"
OUTPUT = ROOT / "public/card-low-rarity-fallbacks.json"
SPLASH_SOURCES = ROOT / "assets/genshin/splashes/sources.json"
ALLOWED_RARITIES = {"common", "super", "rare", "epic"}
RARITY_ORDER = {
    "eternal": 0, "astral": 1, "gold": 2, "secret": 3, "legend": 4,
    "full": 5, "group": 6, "aeon": 7, "epic": 8, "rare": 9,
    "super": 10, "common": 11, "equipment": 12, "energy": 13,
}


def slug(value: str) -> str:
    import re
    import unicodedata
    value = unicodedata.normalize("NFD", value)
    value = "".join(char for char in value if not unicodedata.combining(char))
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def main() -> None:
    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))["cards"]
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    splash_index = json.loads(SPLASH_SOURCES.read_text(encoding="utf-8")).get("artworks", {})
    artworks = manifest.get("artworks", {})
    assignments = manifest.get("assignments", {})
    source_map = manifest.get("ASTRALIS_CARD_ARTWORKS", {})
    globally_used_hashes = {
        row.get("sourcePixelSha256") or row.get("pixelSha256")
        for row in artworks.values()
        if row.get("sourcePixelSha256") or row.get("pixelSha256")
    }
    used_fallback_dhashes = [int(row["dhash"], 16) for row in artworks.values() if row.get("dhash")]
    groups: dict[str, list[dict]] = defaultdict(list)
    for card in catalog:
        identity = f"{card['game']}:{card.get('artSlug') or slug(card['name'])}"
        groups[identity].append(card)

    fallback_targets: list[dict] = []
    used_fallback_hashes: set[str] = set()
    for identity, cards in groups.items():
        source_keys = {f"{card['game']}:{card.get('artSlug') or slug(card['name'])}" for card in cards}
        source_keys.update(f"{card['game']}:{slug(card['name'])}" for card in cards)
        if cards[0]["game"] == "hsr" and slug(cards[0]["name"]) in {"aha", "aha-forme-nihilux"}:
            source_keys.add("hsr:aeon-aha")
        if cards[0]["game"] == "hsr" and slug(cards[0]["name"]).startswith("silver-wolf"):
            source_keys.add("hsr:silver-wolf")
        paths = {path for key in source_keys for path in source_map.get(key, [])}
        image_hash = lambda path: (artworks.get(path, {}).get("sourcePixelSha256")
                                  or artworks.get(path, {}).get("pixelSha256")
                                  or artworks.get(path, {}).get("sha256") or path)
        unique_paths = {}
        for path in paths:
            unique_paths.setdefault(image_hash(path), path)
        already_used = {
            image_hash(path) for key, path in assignments.items()
            if any(key.startswith(source + ":") for source in source_keys)
        }
        available = [path for fingerprint, path in unique_paths.items() if fingerprint not in already_used]
        ordered = sorted(cards, key=lambda card: (RARITY_ORDER.get(card["rarity"], 99), str(card["id"])))
        cursor = 0
        missing = []
        for card in ordered:
            key = f"{card['game']}:{card.get('artSlug') or slug(card['name'])}:{card['rarity']}"
            if assignments.get(key):
                continue
            if len(unique_paths) == 1:
                continue  # keep the runtime's documented single-image exception intact
            if cursor < len(available):
                cursor += 1
                continue
            missing.append(card)

        # In-game Genshin splash portraits are only a legal fallback for the four
        # basic rarities; do not make them available to Full Art or above.
        if not cards or cards[0]["game"] != "gi":
            continue
        low_missing = [card for card in missing if card["kind"] == "character" and card["rarity"] in ALLOWED_RARITIES]
        low_missing.sort(key=lambda card: (RARITY_ORDER[card["rarity"]], str(card["id"])))
        for card in low_missing:
            item_id = (card.get("_item") or {}).get("id")
            path = ROOT / "assets/genshin/splashes" / f"{item_id}.webp"
            if not item_id or not path.is_file():
                continue
            source_record = splash_index.get(str(item_id), {})
            try:
                with Image.open(path) as source:
                    image = ImageOps.exif_transpose(source).convert("RGB")
                    image.thumbnail((1600, 2400), Image.Resampling.LANCZOS)
                    width, height = image.size
                    pixels = image.tobytes()
            except Exception:
                continue
            # Genshin's official in-game character cutouts are commonly 2:1
            # canvases with the character centered; CSS crops the sides cleanly.
            if width < 500 or height < 500 or width / height > 2.1 or height / width > 2.1:
                continue
            pixel_hash = hashlib.sha256(f"{width}x{height}".encode() + pixels).hexdigest()
            small = image.resize((9, 8)).convert("L")
            values = list(small.get_flattened_data())
            dhash = sum((values[y * 9 + x] > values[y * 9 + x + 1]) << (y * 8 + x)
                        for y in range(8) for x in range(8))
            if pixel_hash in globally_used_hashes or pixel_hash in used_fallback_hashes:
                continue
            if any((known_hash ^ dhash).bit_count() <= 3 for known_hash in used_fallback_dhashes):
                continue
            fallback_targets.append({
                "cardId": card["id"],
                "identity": identity,
                "rarity": card["rarity"],
                "src": "/assets/genshin/splashes/" + path.name,
                "pixelSha256": pixel_hash,
                "dhash": f"{dhash:016x}",
                "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
                "width": width,
                "height": height,
                "focal": [50, 35],
                "sourceType": "official-in-game-splash-low-rarity",
                "sourceUrl": source_record.get("url", ""),
                "sourceVerifiedBy": "Illustration officielle intégrée au jeu, copie locale issue de l’index d’assets Enka; SHA-256 du fichier contrôlé.",
            })
            already_used.add(pixel_hash)
            used_fallback_hashes.add(pixel_hash)
            used_fallback_dhashes.append(dhash)
            break  # one card per character; never repeat a splash between cards

    document = {"schemaVersion": 1, "rarities": sorted(ALLOWED_RARITIES), "fallbacks": {row["cardId"]: row for row in fallback_targets}}
    OUTPUT.write_text(json.dumps(document, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{len(fallback_targets)} images uniques attribuées aux cartes sans source, raretés Common à Epic uniquement.")


if __name__ == "__main__":
    main()
