#!/usr/bin/env python3
"""Lit liens-artworks.txt (une ligne par carte :  nom-de-fichier | URL de l'image) et enregistre chaque image dans assets/fanarts/.
Exemple de ligne :  furina-full | https://exemple.com/image.jpg
Passe par un vrai navigateur si le site refuse le téléchargement direct. Ne remplace pas un fichier existant (option --remplacer)."""
import re, sys, time, urllib.parse
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import telecharger_artworks as t

def main():
    root = t.ROOT; out = root / "assets" / "fanarts"; out.mkdir(parents=True, exist_ok=True)
    src = root / "liens-artworks.txt"
    if not src.exists(): print("Crée d'abord liens-artworks.txt (voir PROMPT_CHATGPT.txt)."); return 1
    remplacer = "--remplacer" in sys.argv; ok = bad = skip = 0
    for line in src.read_text(encoding="utf-8").splitlines():
        m = re.match(r"^\s*([a-z0-9\-]+)(?:\.\w+)?\s*[|;\t]\s*(https?://\S+)", line.strip().strip("`"))
        if not m: continue
        stem, url = m.groups(); url = url.rstrip(").,;>")
        if any((out / f"{stem}.{e}").exists() for e in ("webp", "jpg", "jpeg", "png", "avif")) and not remplacer: skip += 1; continue
        base = "{0.scheme}://{0.netloc}".format(urllib.parse.urlparse(url))
        c = {"url": url, "title": stem + ".img", "referer": base}
        try:
            data = t.download(c, base)
        except Exception as e:
            print(f"{stem} : échec ({e})"); bad += 1; continue
        ext = "png" if data[:4] == b"\x89PNG" else "webp" if data[:4] == b"RIFF" else "jpg"
        for e in ("webp", "jpg", "jpeg", "png", "avif"):
            (out / f"{stem}.{e}").unlink(missing_ok=True)
        (out / f"{stem}.{ext}").write_bytes(data); print(f"{stem}.{ext} ok"); ok += 1; time.sleep(.5)
    print(f"\nTerminé : {ok} téléchargés, {skip} déjà présents, {bad} échecs."); t._PW.get("br") and (t._PW["br"].close(), t._PW["pw"].stop())

if __name__ == "__main__":
    sys.exit(main())
