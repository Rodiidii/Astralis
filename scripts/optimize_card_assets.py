"""Reduce card-art storage while preserving usable resolution and provenance.

By default this reports the projected image/cache reduction. --apply rewrites
canonical card WebP files at 1600x2400 maximum and quality 89, updates their
manifest hashes, and removes downloaded source binaries after conversion. Source
URLs, artists, ratings, dimensions and hashes remain in the metadata manifests.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "public/card-artworks.json"
MAX_SIZE = (1600, 2400)
QUALITY = 89


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def pixel_digest(image: Image.Image) -> str:
    return digest(f"{image.width}x{image.height}".encode() + image.tobytes())


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true", help="Optimiser les images et retirer les binaires de cache source.")
    args = parser.parse_args()

    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    records = manifest.get("artworks", {})
    by_path = {ROOT / row["src"]: row for row in records.values() if row.get("provenance") in {"official-hoyoverse", "official-kuro", "official-wiki-file-title"}}
    files = sorted(path for path in by_path if path.is_file())
    before = sum(path.stat().st_size for path in files)
    estimate = None
    samples = files[::max(1, len(files) // 30)][:30] if not args.apply else []
    sample_before = 0
    sample_after = 0
    for path in samples:
        with Image.open(path) as original:
            image = ImageOps.exif_transpose(original).convert("RGB")
            image.thumbnail(MAX_SIZE, Image.Resampling.LANCZOS)
            import io
            buffer = io.BytesIO()
            image.save(buffer, "WEBP", quality=QUALITY, method=5)
            sample_before += path.stat().st_size
            sample_after += len(buffer.getvalue())
    if not args.apply and sample_before:
        estimate = int(before * sample_after / sample_before)
    cache_files = [path for path in (ROOT / "assets/card-art/downloads").rglob("*") if path.is_file() and path.suffix.lower() != ".json"]
    cache_size = sum(path.stat().st_size for path in cache_files)
    print(json.dumps({"files": len(files), "cardArtBeforeBytes": before, "cardArtEstimatedBytes": estimate, "cacheFiles": len(cache_files), "cacheBytes": cache_size, "apply": args.apply}, ensure_ascii=False))
    if not args.apply:
        return 0

    for path in files:
        row = by_path.get(path)
        if row is None:
            raise SystemExit(f"Image absente du manifeste : {path.relative_to(ROOT)}")
        with Image.open(path) as original:
            image = ImageOps.exif_transpose(original).convert("RGB")
            image.thumbnail(MAX_SIZE, Image.Resampling.LANCZOS)
            image.save(path, "WEBP", quality=QUALITY, method=5)
        raw = path.read_bytes()
        with Image.open(path) as optimized:
            decoded = ImageOps.exif_transpose(optimized).convert("RGB")
            row["width"], row["height"] = decoded.size
            row["pixelSha256"] = pixel_digest(decoded)
            small = decoded.resize((9, 8)).convert("L")
            values = list(small.get_flattened_data())
            perceptual = sum((values[y * 9 + x] > values[y * 9 + x + 1]) << (y * 8 + x) for y in range(8) for x in range(8))
            row["dhash"] = f"{perceptual:016x}"
        row["sha256"] = digest(raw)

    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    removed = 0
    removed_bytes = 0
    for path in cache_files:
        try:
            size = path.stat().st_size
            path.unlink()
            removed += 1
            removed_bytes += size
        except FileNotFoundError:
            pass
    for folder in sorted((p for p in (ROOT / "assets/card-art/downloads").rglob("*") if p.is_dir()), key=lambda p: len(p.parts), reverse=True):
        try:
            folder.rmdir()
        except OSError:
            pass
    (ROOT / "assets/card-art/downloads").mkdir(parents=True, exist_ok=True)
    print(json.dumps({"optimizedFiles": len(files), "beforeBytes": before, "afterBytes": sum(p.stat().st_size for p in files), "removedCacheFiles": removed, "removedCacheBytes": removed_bytes}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
