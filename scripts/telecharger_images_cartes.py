#!/usr/bin/env python3
"""Télécharge les illustrations listées dans cartes-images.txt vers assets/cards/.

Ligne : Nom perso [Type de carte] -> lien1 | lien2 | lien3   (les liens suivants sont des secours)
Fichier enregistré : assets/cards/<nom-en-minuscules>-<type>.<ext>   (ex. hu-tao-common.png)
Les images déjà présentes sont conservées (option --force pour les retélécharger).
"""
import argparse, re, sys, time, unicodedata
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parent.parent
TYPES = {"Common": "common", "Super Common": "super", "Rare": "rare", "Epic": "epic", "Full Art": "full", "Secrète": "secret", "Gold": "gold", "Légende": "legend"}
LINE = re.compile(r"^(?P<name>.+?) \[(?P<type>[^\]]+)\] -> (?P<links>.+)$")
MAGIC = [(b"\x89PNG\r\n\x1a\n", "png"), (b"\xff\xd8\xff", "jpg"), (b"RIFF", "webp"), (b"GIF8", "gif")]

def slug(value):
    value = unicodedata.normalize("NFD", value)
    value = "".join(c for c in value if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")

def detect(data):
    for magic, ext in MAGIC:
        if data.startswith(magic) and (ext != "webp" or data[8:12] == b"WEBP"):
            return ext
    return None

def fetch(url):
    request = Request(url, headers={"User-Agent": "Mozilla/5.0 Astralis-card-art", "Accept": "image/*,*/*;q=0.8"})
    with urlopen(request, timeout=30) as response:
        return response.read(25_000_000)

def job(entry):
    name, key, links, dest, force = entry
    base = f"{slug(name)}-{key}"
    if not force and any(dest.glob(base + ".*")):
        return base, "déjà présent", ""
    errors = []
    for url in links:
        try:
            data = fetch(url)
            ext = detect(data)
            if not ext or len(data) < 2000:
                errors.append(f"{url} : réponse non valide"); continue
            tmp = dest / (base + ".part")
            tmp.write_bytes(data); tmp.replace(dest / f"{base}.{ext}")
            return base, "ok", url
        except Exception as exc:
            errors.append(f"{url} : {exc}")
    return base, "ÉCHEC", " || ".join(errors)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--liste", default=str(ROOT / "cartes-images.txt"))
    parser.add_argument("--dest", default=str(ROOT / "assets" / "cards"))
    parser.add_argument("--workers", type=int, default=8)
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()
    dest = Path(args.dest); dest.mkdir(parents=True, exist_ok=True)
    entries, seen = [], set()
    for raw in Path(args.liste).read_text(encoding="utf-8").splitlines():
        match = LINE.match(raw.strip())
        if not match or match["type"] not in TYPES:
            continue
        links = [l.strip() for l in match["links"].split("|") if l.strip().startswith("http")]
        key = (slug(match["name"]), TYPES[match["type"]])
        if links and key not in seen:
            seen.add(key); entries.append((match["name"], TYPES[match["type"]], links, dest, args.force))
    print(f"{len(entries)} illustrations à récupérer vers {dest}")
    log, ok, skipped, failed, start = [], 0, 0, 0, time.time()
    with ThreadPoolExecutor(max_workers=max(1, args.workers)) as pool:
        for index, (base, status, detail) in enumerate(pool.map(job, entries), 1):
            ok += status == "ok"; skipped += status == "déjà présent"; failed += status == "ÉCHEC"
            log.append(f"{status}\t{base}\t{detail}")
            if status == "ÉCHEC" or index % 25 == 0 or index == len(entries):
                print(f"[{index}/{len(entries)}] {base} : {status}")
    (ROOT / "telechargement.log").write_text("\n".join(log) + "\n", encoding="utf-8")
    print(f"\nTerminé en {time.time() - start:.0f} s : {ok} téléchargées, {skipped} déjà présentes, {failed} en échec (détails : telechargement.log).")
    print("Recharge Astralis : les cartes utilisent automatiquement ces images.")
    return 0

if __name__ == "__main__":
    sys.exit(main())
