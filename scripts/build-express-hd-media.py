"""Replace low-resolution GIF derivatives with attributed, native HD gameplay.

Requires the downloaded chaptered sources in artifacts/video-quality-sources.
No upscaling or duplicated frames are used to claim an HD/60 fps upgrade.
Each replacement is decoded and measured before its manifest entry is committed.
"""
import concurrent.futures
import json
import re
import subprocess
import unicodedata
from pathlib import Path

import imageio_ffmpeg

ROOT = Path(__file__).resolve().parent.parent
SOURCES = ROOT / 'artifacts/video-quality-sources'
OUT = ROOT / 'assets/express-ultimates'
MANIFEST = OUT / 'manifest.json'
FF = imageio_ffmpeg.get_ffmpeg_exe()


def canonical(value):
    return re.sub('[^a-z0-9]', '', unicodedata.normalize('NFD', value.lower()))


def probe(path):
    result = subprocess.run([FF, '-hide_banner', '-i', str(path)], capture_output=True, text=True)
    line = next((s for s in result.stderr.splitlines() if 'Video:' in s), '')
    size = re.search(r'\b(\d{3,5})x(\d{3,5})\b', line)
    fps = re.search(r'([\d.]+) fps', line)
    duration = re.search(r'Duration: (\d+):(\d+):([\d.]+)', result.stderr)
    if not (size and fps and duration):
        raise ValueError(f'No complete video stream in {path}')
    hh, mm, ss = duration.groups()
    return {'width': int(size[1]), 'height': int(size[2]), 'fps': float(fps[1]),
            'codec': re.search(r'Video: (\w+)', line)[1],
            'seconds': int(hh)*3600 + int(mm)*60 + float(ss),
            'hasAudio': 'Audio:' in result.stderr, 'bytes': path.stat().st_size}


def plans():
    manifest = json.loads(MANIFEST.read_text(encoding='utf8'))
    roster = set(json.loads((ROOT/'artifacts/hd-roster.json').read_text(encoding='utf8')))
    names = {'gi': {}, 'hsr': {}, 'ww': {}}
    for key, entry in manifest.items():
        names[key.split(':')[0]][canonical(entry.get('character', ''))] = key
    for person in json.loads((ROOT/'assets/data/gi-characters.json').read_text(encoding='utf8')):
        names['gi'].setdefault(canonical(person['name']), 'gi:'+str(person['id']))
    for key, person in json.loads((ROOT/'assets/data/hsr-nanoka-character.json').read_text(encoding='utf8')).items():
        if int(key) < 8000:
            names['hsr'].setdefault(canonical(person.get('en', '')), 'hsr:'+key)
    for person in json.loads((ROOT/'assets/data/ww-characters.json').read_text(encoding='utf8')):
        if not person['name'].startswith('Rover'):
            names['ww'][canonical(person['name'])] = 'ww:'+person['id']
    names['hsr']['march7th'] = 'hsr:1001'
    names['hsr']['march7ththehunt'] = 'hsr:1224'
    names['hsr']['aha'] = 'hsr:1511'
    aliases = {'kokomi':'sangonomiyakokomi', 'kyryllflins':'flins',
               'topaz':'topaznumby', 'yanquing':'yanqing', 'drratio':'drratio',
               'luuk':'luukherssen'}
    jobs = {}
    collections = [('gi', 'gi-compilation', 'gi-1080p60', .8),
                   ('gi', 'gi4-compilation', 'gi4-avc60', .6),
                   ('gi', 'gi6-compilation', 'gi6-1080p60', .7),
                   ('hsr', 'hsr-compilation', 'hsr-avc60', 3.1),
                   ('hsr', 'hsr4-compilation', 'hsr4-1080p60', 4.3),
                   ('ww', 'ww-compilation', 'ww-1080p60', .05)]
    for world, metadata, filename, offset in collections:
        source = json.loads((SOURCES/(metadata+'.json')).read_text(encoding='utf8'))
        for chapter in source.get('chapters', []):
            title = chapter['title']
            chapter_name = re.sub(r'\([^)]*\)', '', title).strip()
            # The Hunt annotation is significant; Japanese translations are not.
            if 'March 7th' in title and ('Hunt' in title or '巡狩' in title):
                chapter_name = 'March 7th The Hunt'
            norm = canonical(chapter_name)
            norm = aliases.get(norm, norm)
            key = names[world].get(norm)
            if world == 'gi' and title.startswith('Durin (Principle of Darkness)'):
                continue  # retain the first verified form, not a duplicate mapping
            if world == 'hsr' and ('Trailblazer' in title or 'Stelle (' in title):
                paths = {'Destruction':8001, 'Preservation':8003, 'Harmony':8005,
                         'Remembrance':8007, 'Elation':8009}
                for path, base in paths.items():
                    if path in title:
                        female = 'Female' in title or title.startswith('Stelle')
                        key = 'hsr:'+str(base+int(female))
            if not key or key not in roster:
                continue
            available = chapter['end_time']-chapter['start_time']
            length = min(4.8, max(.8, available-offset-.08))
            jobs[key] = {'key':key, 'sourceFile':str(SOURCES/(filename+'.mp4')),
                         'source':source['webpage_url'], 'sourceTitle':source['title'],
                         'creator':source.get('uploader', ''), 'chapter':title,
                         'start':round(chapter['start_time']+offset, 3), 'length':length,
                         'sceneKind':'gameplay', 'character':manifest.get(key, {}).get('character', chapter_name)}
    for key, entry in manifest.items():
        if entry.get('sceneKind') != 'lore':
            continue
        video_id = entry['source'].split('v=')[-1]
        file = SOURCES/('lore-'+video_id+'.mp4')
        if file.exists():
            jobs[key] = {'key':key, 'sourceFile':str(file), 'source':entry['source'],
                         'sourceTitle':entry['title'], 'creator':entry.get('creator', 'Source du lore référencée'),
                         'chapter':entry['title'], 'start':entry['sourceStart'],
                         'length':min(4.42, entry['seconds']), 'sceneKind':'lore',
                         'character':entry['character']}
    return manifest, list(jobs.values())


def encode(job):
    key = job['key']
    dest = OUT/(('lore-'+key.split(':')[1] if job['sceneKind']=='lore' else key.replace(':', '-'))+'-hd.mp4')
    temp = dest.with_name(dest.stem+'-building.mp4')
    try:
        if dest.exists() and not job.get('forceSourceCopy'):
            quality = probe(dest)
            if quality['height'] >= 1080 and quality['fps'] >= 23 and quality['seconds'] <= 5.1:
                return key, {**job, **quality, 'kind':'video', 'url':'/assets/express-ultimates/'+dest.name,
                             'qualityTier':'native-hd', 'interpolated':False,
                             'audioType':'Original audio of the attributed gameplay capture',
                             'audioLanguage':'EN', 'sourceStart':job['start']}
        source = probe(Path(job['sourceFile']))
        if source['height'] < 720 or source['fps'] < 23:
            raise ValueError('Source is not native HD video')
        # MP4 edit lists preserve the precise start while retaining the original
        # H.264 frames (including decoder preroll). This avoids a quality loss.
        copied = False
        if source['codec'] == 'h264' and not job.get('skipSourceCopy'):
            subprocess.run([FF, '-y', '-v', 'error', '-ss', str(job['start']),
                            '-i', job['sourceFile'], '-t', str(job['length']),
                            '-map', '0:v:0', '-map', '0:a:0?', '-c', 'copy',
                            '-movflags', '+faststart', str(temp)],
                           check=True, capture_output=True, timeout=45)
            copied = probe(temp)['seconds'] <= 5.1
        if not copied:
            subprocess.run([FF, '-y', '-hide_banner', '-loglevel', 'error',
                        '-ss', str(job['start']), '-threads', '2', '-i', job['sourceFile'],
                        '-t', str(job['length']), '-map', '0:v:0', '-map', '0:a:0?',
                        '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18',
                        '-threads', '2', '-pix_fmt', 'yuv420p', '-profile:v', 'high',
                        '-c:a', 'aac', '-b:a', '192k', '-af', 'afade=t=out:st='+str(max(0,job['length']-.15))+':d=0.15',
                        '-movflags', '+faststart', str(temp)],
                           check=True, capture_output=True, timeout=150)
        quality = probe(temp)
        assert quality['height'] >= 720 and quality['seconds'] <= 5.1
        assert quality['fps'] >= source['fps']-.1, 'Native cadence lost'
        decoded = subprocess.run([FF, '-v', 'error', '-threads', '2', '-i', str(temp), '-f', 'null', '-'],
                                 capture_output=True, timeout=40)
        if decoded.returncode and copied:
            # Some open GOPs cannot form a standalone, error-free copied clip.
            # Decode from the complete source and encode an independent GOP.
            temp.unlink(missing_ok=True)
            return encode({**job, 'skipSourceCopy':True})
        decoded.check_returncode()
        temp.replace(dest)
        print('HD', key, job['character'], quality['width'], quality['height'], quality['fps'], flush=True)
        return key, {**job, **quality, 'kind':'video', 'url':'/assets/express-ultimates/'+dest.name,
                     'qualityTier':'native-hd', 'interpolated':False,
                     'audioType':'Original audio of the attributed gameplay capture',
                     'audioLanguage':'EN', 'sourceStart':job['start']}
    except Exception as error:
        temp.unlink(missing_ok=True)
        print('HD FAILED', key, str(error)[:180], flush=True)
        return key, {'error':str(error)}


if __name__ == '__main__':
    manifest, jobs = plans()
    (ROOT/'artifacts/hd-media-plan.json').write_text(json.dumps(jobs, ensure_ascii=False, indent=2), encoding='utf8')
    print('Native HD jobs', len(jobs), flush=True)
    results = {}
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        for key, result in pool.map(encode, jobs):
            results[key] = result
            if 'error' not in result:
                entry = {**manifest.get(key, {}), **result}
                entry.pop('sourceFile', None)
                entry.pop('start', None)
                entry.pop('length', None)
                entry.pop('previewSource', None)  # stale GIF is no longer this video's source
                manifest[key] = entry
            MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf8')
            (ROOT/'artifacts/hd-media-build.json').write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding='utf8')
    print('HD replacements', sum('error' not in r for r in results.values()), 'failures', sum('error' in r for r in results.values()), flush=True)
