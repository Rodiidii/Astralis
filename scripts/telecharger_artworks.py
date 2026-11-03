#!/usr/bin/env python3
"""Télécharge des ARTWORKS OFFICIELS (illustrations HoYoverse / Kuro, anniversaires, promos, key visuals, illustrations commandées)
depuis Danbooru (tag official_art, tout public) puis, à défaut, les wikis communautaires, en écartant splash arts, icônes, cartes de nom, sprites, bannières, etc.
Pour chaque carte de fanarts-a-trouver.txt : meilleur candidat -> assets/fanarts/<stem>.<ext>  (nom lu par le site)
autres candidats  -> assets/artworks-candidats/<stem>/  + galerie choisir-artworks.html pour changer d'image d'un clic droit / copie.
Crédits (page du fichier sur le wiki) -> credits-artworks.txt.  Ne remplace jamais un fichier déjà présent.
Options : --only furina   --max-candidats 4   --min-pixels 800000   --test (vérifie le classement sans réseau)"""
import argparse, html, json, re, sys, time, urllib.parse, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
UA = {"User-Agent": "Astralis-card-binder/1.0 (usage personnel, non commercial)"}
WIKIS = {"GENSHIN": "https://genshin-impact.fandom.com", "HONKAI": "https://honkai-star-rail.fandom.com", "WUTHERING": "https://wutheringwaves.fandom.com"}
EXT_OK = {"png", "jpg", "jpeg", "webp"}
REJECT = re.compile(r"splash|icon|namecard|name[ _]card|card\b|sprite|portrait|thumb|gacha|wish|banner|chibi|emote|sticker|talent|weapon|constellation|"
                    r"profile|avatar|side|element|logo|screenshot|model|render|cutscene|in-?game|menu|vision|artifact|relic|lightcone|light[ _]cone|"
                    r"trace|skill|ability|material|item|food|enemy|boss|npc|vo[ _]|voice|trailer|video|gif|\.svg|map|achievement|title|loading|"
                    r"cosplay|merch|figure|plush|collab|ui[ _]|build|guide|wallpaper phone", re.I)
BONUS = [(re.compile(r"birthday|anniversary|b-?day|bday", re.I), -80),   # on ne veut plus des illustrations d'anniversaire
         (re.compile(r"key[ _]?visual|promo|poster|cover|collab|commission", re.I), 36), (re.compile(r"illustration|official[ _]?art", re.I), 30),
         (re.compile(r"artwork|art\b", re.I), 20), (re.compile(r"wallpaper|festival|event|version|trailer[ _]?art|teaser", re.I), 14)]

BROWSER_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"

def get(url, binary=False, referer=None):
    h = dict(UA)
    if binary:  # le CDN des wikis (anti-hotlink) refuse les clients sans Referer / sans UA de navigateur
        h = {"User-Agent": BROWSER_UA, "Accept": "image/avif,image/webp,image/png,image/*,*/*;q=0.8", "Accept-Language": "en-US,en;q=0.9"}
        if referer: h["Referer"] = referer + "/"
    with urllib.request.urlopen(urllib.request.Request(url, headers=h), timeout=60) as r:
        data = r.read()
    return data if binary else json.loads(data.decode("utf-8"))

_PW = {}
def _pw_ctx():
    """Lance (et installe si besoin) un vrai Chromium : les CDN des wikis laissent passer un navigateur, pas urllib."""
    if "ctx" in _PW: return _PW["ctx"]
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        import subprocess
        print("   [auto] installation de Playwright (une seule fois, ~2 min)…", flush=True)
        subprocess.run([sys.executable, "-m", "pip", "install", "--quiet", "playwright"], check=True)
        from playwright.sync_api import sync_playwright
    pw = sync_playwright().start()
    try:
        br = pw.chromium.launch()
    except Exception:
        import subprocess
        print("   [auto] téléchargement de Chromium (une seule fois, ~150 Mo)…", flush=True)
        subprocess.run([sys.executable, "-m", "playwright", "install", "chromium"], check=True)
        br = pw.chromium.launch()
    _PW.update(pw=pw, br=br, ctx=br.new_context(user_agent=BROWSER_UA, locale="en-US"), warm=set())
    return _PW["ctx"]

def get_pw(url, base):
    ctx = _pw_ctx()
    if base not in _PW["warm"]:
        try: pg = ctx.new_page(); pg.goto(base + "/wiki/Special:Random", timeout=45000); pg.close()
        except Exception: pass
        _PW["warm"].add(base)
    r = ctx.request.get(url, headers={"Referer": base + "/", "Accept": "image/avif,image/webp,image/png,image/*,*/*;q=0.8"}, timeout=60000)
    if r.status != 200: raise RuntimeError(f"HTTP {r.status} (navigateur)")
    return r.body()

def download(c, base):
    """Essaie l'URL du CDN avec Referer, puis sans paramètres, puis la redirection Special:Redirect/file du wiki."""
    u = c["url"]
    tries = [u, u.split("/revision/")[0] if "/revision/" in u else u, base + "/wiki/Special:Redirect/file/" + urllib.parse.quote(c["title"].replace("File:", "").replace(" ", "_"))]
    last = None
    for t in dict.fromkeys(tries):
        try:
            data = get(t, binary=True, referer=c.get("referer") or base)
            if data[:4] == b"\x89PNG" or data[:2] == b"\xff\xd8" or data[:4] == b"RIFF": return data
            last = "réponse non image"
        except Exception as e:
            last = e
        time.sleep(.5)
    print(f"   (téléchargement direct refusé : {last} → je passe par un vrai navigateur)", flush=True)
    for t in dict.fromkeys(tries[:2]):
        try:
            data = get_pw(t, c.get("referer") or base)
            if data[:4] == b"\x89PNG" or data[:2] == b"\xff\xd8" or data[:4] == b"RIFF": return data
        except Exception as e:
            last = e
    raise RuntimeError(last)

def rank(pages, name, min_pixels):
    """pages : liste {title,url,width,height,mime}. Retourne les candidats triés (meilleur d'abord)."""
    key = re.sub(r"[^a-z0-9]+", " ", name.lower()).split()[:1]
    out = []
    for p in pages:
        title = re.sub(r"^File:", "", p["title"]); low = title.lower()
        ext = low.rsplit(".", 1)[-1]
        if ext not in EXT_OK or REJECT.search(title) or not all(k in re.sub(r"[^a-z0-9]+", " ", low) for k in key): continue
        w, h = p.get("width") or 0, p.get("height") or 0
        if w * h < min_pixels: continue
        score = sum(b for rx, b in BONUS if rx.search(title))
        ratio = w / h if h else 1
        score += 14 if 0.55 <= ratio <= 0.95 else 6 if ratio <= 1.25 else 0   # carte 5:7 -> portrait de préférence
        score += min(12, (w * h) / 1_000_000 * 3)
        out.append({**p, "ext": ext, "score": score})
    out.sort(key=lambda c: c["score"], reverse=True)
    return out

def wiki_search(base, queries):
    found = {}
    for q in queries:
        params = {"action": "query", "generator": "search", "gsrsearch": q, "gsrnamespace": 6, "gsrlimit": 40, "prop": "imageinfo",
                  "iiprop": "url|size|mime", "format": "json"}
        try:
            data = get(base + "/api.php?" + urllib.parse.urlencode(params))
        except Exception as e:
            try: data = json.loads(get_pw(base + "/api.php?" + urllib.parse.urlencode(params), base).decode("utf-8"))
            except Exception as e2: print("   recherche échouée :", e, "/", e2); continue
        for pg in (data.get("query", {}).get("pages", {}) or {}).values():
            ii = (pg.get("imageinfo") or [{}])[0]
            if ii.get("url"): found[pg["title"]] = {"title": pg["title"], "url": ii["url"], "width": ii.get("width"), "height": ii.get("height"), "mime": ii.get("mime"), "page": base + "/wiki/" + urllib.parse.quote(pg["title"].replace(" ", "_"))}
        time.sleep(1)
    return list(found.values())


# ───────── Source n°1 : Danbooru, tag « official_art » (illustrations officielles HoYoverse / Kuro) ─────────
DB_BAD = {"game_cg", "chibi", "sprite", "icon", "4koma", "comic", "character_profile", "character_sheet", "merchandise", "figure", "photo", "cosplay",
          "birthday", "happy_birthday", "sticker", "emoji", "lowres", "cropped", "partial_scan", "screenshot", "model_sheet", "turnaround", "artbook", "official_style", "alternate_hair_color_unused"}

def danbooru_rank(posts, chars, min_pixels=800000):
    out = []
    for p in posts:
        tags = set((p.get("tag_string") or "").split())
        if p.get("rating") != "g" or "official_art" not in tags or tags & DB_BAD or not p.get("file_url"): continue
        if p.get("file_ext") not in EXT_OK: continue
        w, h = p.get("image_width") or 0, p.get("image_height") or 0
        if w * h < min_pixels or not all(c in tags for c in chars): continue
        ratio = w / h if h else 1
        sc = (14 if 0.55 <= ratio <= 0.95 else 6 if ratio <= 1.25 else 0) + min(12, w * h / 1e6 * 3) + min(25, (p.get("score") or 0) / 12) + (6 if "solo" in tags and len(chars) < 2 else 0)
        out.append({"title": f"danbooru #{p['id']}", "url": p["file_url"], "width": w, "height": h, "ext": p["file_ext"], "score": sc,
                    "page": f"https://danbooru.donmai.us/posts/{p['id']}", "artist": p.get("tag_string_artist") or "officiel", "referer": "https://danbooru.donmai.us"})
    out.sort(key=lambda c: c["score"], reverse=True)
    return out

def danbooru_search(chars):
    posts = []
    for page in (1, 2):
        url = "https://danbooru.donmai.us/posts.json?" + urllib.parse.urlencode({"tags": f"{chars[0]} official_art", "limit": 200, "page": page})
        try: batch = get(url)
        except Exception:
            try: batch = json.loads(get_pw(url, "https://danbooru.donmai.us").decode("utf-8"))
            except Exception as e: print("   Danbooru indisponible :", e); break
        posts += batch if isinstance(batch, list) else []
        if not isinstance(batch, list) or len(batch) < 200: break
        time.sleep(1)
    return posts

def selftest():
    pages = [{"title": "File:Furina Splash Art.png", "width": 2048, "height": 1024}, {"title": "File:Furina Icon.png", "width": 256, "height": 256},
             {"title": "File:Furina Birthday 2023.png", "width": 2000, "height": 2800}, {"title": "File:Furina Namecard Background.png", "width": 840, "height": 400},
             {"title": "File:Furina Official Artwork.jpg", "width": 3000, "height": 2000}, {"title": "File:Nahida Birthday 2023.png", "width": 2000, "height": 2800}]
    r = [c["title"] for c in rank(pages, "Furina", 800000)]
    assert r == ["File:Furina Official Artwork.jpg", "File:Furina Birthday 2023.png"], r
    posts = [{"id": 1, "rating": "g", "tag_string": "official_art solo furina_(genshin_impact)", "file_url": "u1", "file_ext": "jpg", "image_width": 2000, "image_height": 3000, "score": 90},
             {"id": 2, "rating": "g", "tag_string": "official_art game_cg furina_(genshin_impact)", "file_url": "u2", "file_ext": "jpg", "image_width": 2000, "image_height": 3000, "score": 500},
             {"id": 3, "rating": "q", "tag_string": "official_art furina_(genshin_impact)", "file_url": "u3", "file_ext": "jpg", "image_width": 2000, "image_height": 3000, "score": 900},
             {"id": 4, "rating": "g", "tag_string": "official_art birthday furina_(genshin_impact)", "file_url": "u4", "file_ext": "png", "image_width": 2000, "image_height": 3000, "score": 300},
             {"id": 5, "rating": "g", "tag_string": "official_art furina_(genshin_impact) neuvillette_(genshin_impact)", "file_url": "u5", "file_ext": "png", "image_width": 3000, "image_height": 2000, "score": 80}]
    d = [c["page"].rsplit("/", 1)[1] for c in danbooru_rank(posts, ["furina_(genshin_impact)"])]; assert d == ["1", "5"], d
    g = [c["page"].rsplit("/", 1)[1] for c in danbooru_rank(posts, ["furina_(genshin_impact)", "neuvillette_(genshin_impact)"])]; assert g == ["5"], g
    print("test OK :", r, d, g)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", default=""); ap.add_argument("--max-candidats", type=int, default=4); ap.add_argument("--min-pixels", type=int, default=800000); ap.add_argument("--test", action="store_true"); ap.add_argument("--remplacer", action="store_true", help="re-télécharge même si le fichier existe")
    a = ap.parse_args()
    if a.test: return selftest()
    out = ROOT / "assets" / "fanarts"; out.mkdir(parents=True, exist_ok=True)
    cand_root = ROOT / "assets" / "artworks-candidats"; credits = ROOT / "credits-artworks.txt"
    print(f"Dossier de destination : {out}\n(le site doit être lancé depuis CE MÊME dossier : {ROOT})\n", flush=True)
    game, done, fail, skip, gallery = "GENSHIN", 0, 0, 0, []
    for line in (ROOT / "fanarts-a-trouver.txt").read_text(encoding="utf-8").splitlines():
        if line.startswith("## "):
            game = "GENSHIN" if "GENSHIN" in line else "HONKAI" if "HONKAI" in line else "WUTHERING"; continue
        m = re.match(r"^(.+?) \[(.+?)\] -> .*à enregistrer sous : assets/fanarts/(.+)\.webp$", line)
        if not m or (a.only and a.only.lower() not in line.lower()): continue
        name, kind, stem = m.groups()
        old = [out / f"{stem}.{e}" for e in ("webp", "jpg", "jpeg", "png", "avif") if (out / f"{stem}.{e}").exists()]
        if old and not a.remplacer:
            skip += 1; continue
        if old and a.remplacer:
            for f in old: f.unlink()
            import shutil; shutil.rmtree(cand_root / stem, ignore_errors=True)
        who = re.split(r"\s*&\s*", name)[0]
        print(f"{name} [{kind}] …", flush=True)
        tg = re.search(r"posts\?tags=([^ |]+)", line); chars = [t for t in urllib.parse.unquote_plus(tg.group(1)).split() if not t.startswith(("rating:", "order:"))] if tg else []
        cands = danbooru_rank(danbooru_search(chars), chars, a.min_pixels) if chars else []
        if cands: print(f"   {len(cands)} artwork(s) officiel(s) trouvé(s) sur Danbooru (official_art)", flush=True)
        else:
            print("   rien sur Danbooru → je cherche sur le wiki", flush=True)
            pages = wiki_search(WIKIS[game], [f"{who} artwork", f"{who} illustration", f"{who} official art", f"{who} birthday"])
            cands = rank(pages, who, a.min_pixels)
        if not cands:
            print("   aucun artwork officiel trouvé : glisse une image sur la carte (ou range-la dans assets/fanarts)"); fail += 1; continue
        saved = []
        for i, c in enumerate(cands[: a.max_candidats]):
            try: data = download(c, WIKIS[game])
            except Exception as e: print("   téléchargement échoué :", e); continue
            if i == 0:
                (out / f"{stem}.{c['ext']}").write_bytes(data); path = f"assets/fanarts/{stem}.{c['ext']}"
            else:
                d = cand_root / stem; d.mkdir(parents=True, exist_ok=True)
                fn = re.sub(r"[^\w.\-]+", "_", c["title"].replace("File:", "")); (d / fn).write_bytes(data); path = f"assets/artworks-candidats/{stem}/{fn}"
            saved.append((path, c)); time.sleep(.6)
            with credits.open("a", encoding="utf-8") as f: f.write(f"{path} | {c['title']} | {c.get('artist','')} | {c['page']}\n")
        if saved:
            print(f"   ok  {saved[0][0]}  ({saved[0][1]['width']}x{saved[0][1]['height']}) + {len(saved)-1} autre(s)"); done += 1; gallery.append((name, kind, stem, saved))
        else: fail += 1
    if gallery:
        rows = "".join(f"<section><h2>{html.escape(n)} <small>[{html.escape(k)}]</small></h2><p>Actuel : <code>assets/fanarts/{html.escape(s)}.*</code> — pour en prendre un autre, copie-le dans <code>assets/fanarts/</code> sous le nom <code>{html.escape(s)}.png</code> (ou .jpg).</p><div>"
                       + "".join(f"<figure class='{'cur' if i == 0 else ''}'><img loading=lazy src='{html.escape(p)}'><figcaption>{'★ choisi' if i == 0 else 'option'} · {html.escape(c['title'])} · <a href='{html.escape(c['page'])}'>source</a></figcaption></figure>" for i, (p, c) in enumerate(sv)) + "</div></section>" for n, k, s, sv in gallery)
        (ROOT / "choisir-artworks.html").write_text("<meta charset=utf-8><title>Choisir les artworks</title><style>body{background:#111;color:#eee;font:14px system-ui;padding:20px}div{display:flex;gap:12px;flex-wrap:wrap}figure{margin:0;width:220px}img{width:220px;height:300px;object-fit:cover;border-radius:8px}.cur img{outline:3px solid gold}figcaption{font-size:11px;opacity:.8}a{color:#9cf}</style><h1>Artworks officiels trouvés</h1>" + rows, encoding="utf-8")
        print("\nGalerie pour comparer / changer : choisir-artworks.html")
    if _PW.get("br"):
        try: _PW["br"].close(); _PW["pw"].stop()
        except Exception: pass
    n = len([f for f in out.iterdir() if f.suffix.lower() in (".webp", ".jpg", ".jpeg", ".png", ".avif")])
    print(f"\nFichiers présents dans {out} : {n}\nTerminé : {done} téléchargés, {skip} déjà présents, {fail} sans résultat.")

if __name__ == "__main__":
    sys.exit(main())
