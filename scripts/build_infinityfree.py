"""Prepare a public htdocs tree; leave installed-app profiles and source unchanged."""
from __future__ import annotations
import gzip,hashlib,json,shutil,subprocess,sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
OUTPUT=ROOT/'releases'/'InfinityFree'
WEB=OUTPUT/'htdocs'
FOLDERS={'src','styles','assets','public','data','published','companions'}
ROOT_FILES={'index.html','sw.js','manifest.webmanifest','manifest.json','VERSION','changelog.json','import-sources.json','favicon.ico','favicon.png','app-icon.svg','icon.png'}
VIDEO={'.mp4','.webm','.mov','.avi','.mkv'}
PRIVATE_PARTS={'user','userdata','user-data','local-data','lab-user-exports','downloads','__pycache__','.git'}
PRIVATE_SUFFIX={'.sqlite3','.sqlite','.db','.dpapi','.pem','.key','.log','.bak','.pyc','.py','.ps1','.bat','.tmp'}

def selected(name:str)->bool:
 p=Path(name);parts=tuple(v.lower() for v in p.parts)
 if not parts or any(v in PRIVATE_PARTS for v in parts) or p.suffix.lower() in PRIVATE_SUFFIX or p.name.startswith('.env'):return False
 if parts[:2]==('docs','sources'):return True
 return p.name in ROOT_FILES if len(parts)==1 else parts[0] in FOLDERS

def main()->None:
 owned=(WEB/'api/router.php').is_file() and b'Astralis' in (WEB/'api/router.php').read_bytes()
 if WEB.exists() and not (OUTPUT/'verification.json').is_file() and not owned:raise SystemExit('Le dossier htdocs existe déjà sans rapport de préparation. Conserve-le et choisis une sortie neuve.')
 WEB.mkdir(parents=True,exist_ok=True)
 names=subprocess.check_output(['git','ls-files','--cached','--others','--exclude-standard','-z'],cwd=ROOT).decode('utf-8').split('\0')
 manifest=[];remote_video=[]
 for name in sorted(set(names)):
  source=ROOT/name
  if not name or not source.is_file() or not selected(name):continue
  if source.suffix.lower() in VIDEO:remote_video.append(name);continue
  dest=WEB/name;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(source,dest);manifest.append(name)
 (WEB/'api').mkdir(exist_ok=True)
 shutil.copy2(ROOT/'hosting/infinityfree/api-router.php',WEB/'api/router.php')
 for service in ['feedback-service.php','profile-icon-service.php']:
  shutil.copy2(ROOT/'hosting/infinityfree'/service,WEB/'api'/service)
 shutil.copy2(ROOT/'hosting/infinityfree/htaccess.template',WEB/'.htaccess')
 (WEB/'api/config.php').write_text("<?php\n// Adresse HTTPS du serveur de données Astralis, si disponible.\nreturn ['api_origin' => ''];\n",encoding='utf-8')
 catalog=json.loads((ROOT/'public/card-catalog.json').read_text(encoding='utf-8'))
 for game in ['hsr','ww']:
  rows=catalog.get('catalogs',{}).get(game+':character',[])
  folder=WEB/'data'/game;folder.mkdir(parents=True,exist_ok=True)
  (folder/'character').write_text(json.dumps({str(row.get('id',row.get('_id'))):row for row in rows},ensure_ascii=False,separators=(',',':')),encoding='utf-8')
 # Only the web copy needs minification to meet the host's 1 MB JS limit.
 encoded=[]
 for file in WEB.rglob('*.js'):
  if file.stat().st_size>=1000000:
   source=ROOT/file.relative_to(WEB)
   subprocess.run(['npx.cmd','--yes','esbuild@0.25.6',str(source),'--minify','--keep-names','--charset=utf8','--target=es2022','--outfile='+str(file)],cwd=ROOT,check=True)
   if file.stat().st_size>=1000000:
    compressed=Path(str(file)+'.gz');compressed.write_bytes(gzip.compress(file.read_bytes(),compresslevel=9,mtime=0));encoded.append(file.relative_to(WEB).as_posix());file.unlink()
 for old in ['src/genshin-tycoon.js','styles/genshin-tycoon.css']:
  path=WEB/old
  if path.is_file() and not (ROOT/old).exists():path.unlink()
 files=[p for p in WEB.rglob('*') if p.is_file()]
 bad=[]
 for p in files:
  size=p.stat().st_size;limit=10000 if p.name=='.htaccess' else 1000000 if p.suffix.lower() in {'.php','.html','.js','.mjs'} else 10000000
  if size>=limit:bad.append({'path':p.relative_to(WEB).as_posix(),'bytes':size,'limit':limit})
 if bad:raise SystemExit('Fichiers trop volumineux pour InfinityFree : '+json.dumps(bad))
 report={'version':'1.0.59','platform':'InfinityFree','fileCount':len(files),'totalBytes':sum(p.stat().st_size for p in files),'oversizeFiles':bad,'privateFilesIncluded':False,'videoFilesServedFromGitHubRelease':len(remote_video),'precompressedJavascript':encoded,'apiMode':'read-only, optional external Python API for live feeds','applicationSourceUnminified':True}
 (OUTPUT/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
 readme="""ASTRALIS 1.0.59 — DOSSIER INFINITYFREE

1. Dans InfinityFree, crée ton hébergement et active HTTPS pour ton domaine.
2. Transfère le CONTENU du dossier htdocs dans le htdocs du domaine. Conserve src, styles, assets, public et data. Transfère aussi .htaccess (fichier caché).
3. Utilise FTP/FileZilla pour ce dossier complet. Une grosse archive ZIP ne doit pas être envoyée telle quelle : InfinityFree limite chaque fichier.
4. Ouvre https://ton-domaine/ puis recharge si tu avais déjà ouvert une ancienne version.

Les jeux, l’éditeur de builds, les équipes, le laboratoire, les cartes, la planification et les sauvegardes du navigateur sont inclus. Les catalogues conservent leurs sources publiques. Les fiches publiées sont en lecture seule.

LES FONCTIONS QUI ONT BESOIN DU SERVEUR DE DONNÉES
InfinityFree n’exécute pas le serveur Python de l’application. Les flux Événements, Endgame, certains textes de lore et médias demandent un serveur de données Astralis compatible. Si tu en possèdes un, indique son URL HTTPS dans htdocs/api/config.php, champ api_origin. Aucun mot de passe ou profil de ton installation locale n’est fourni. Sans cette configuration, ces flux signalent leur indisponibilité ; ils n’inventent pas de résultats.

Les opérations Windows (lancement de Genshin, raccourcis, installation de mises à jour) restent réservées à l’application installée. Les vidéos de jeu sont chargées depuis les fichiers de la release GitHub v1.0.58 ; elles ne sont pas copiées sur InfinityFree.

Le contrôle de taille est dans verification.json. La préparation ne remplace pas un essai sur ton domaine : aucun accès à ton compte InfinityFree ni upload n’a été effectué.

Documentation officielle :
https://forum.infinityfree.com/t/file-size-and-upload-limits/49308
https://forum.infinityfree.com/t/why-isnt-api-access-working-on-my-website/115198
"""
 (OUTPUT/'LIRE-AVANT-UPLOAD.txt').write_text(readme,encoding='utf-8')
 print(json.dumps(report,ensure_ascii=False),flush=True);print('DOSSIER : '+str(OUTPUT),flush=True)

if __name__=='__main__':main()
