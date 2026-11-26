"""Prepare individually inspected HD replacements; merge after the main batch."""
import concurrent.futures
import importlib.util
import json
from pathlib import Path

spec = importlib.util.spec_from_file_location('hd_media', Path(__file__).with_name('build-express-hd-media.py'))
hd = importlib.util.module_from_spec(spec)
spec.loader.exec_module(hd)
guides = json.loads((hd.ROOT/'artifacts/hd-guide-sources.json').read_text(encoding='utf8'))
manifest = json.loads(hd.MANIFEST.read_text(encoding='utf8'))
jobs = []

for key, name in [('gi:10000150','odette'),('gi:10000136','mitya'),('gi:10000137','valeriy'),
                  ('gi:10000143','vesna'),('gi:10000140','vodyanitsa')]:
    source = guides[name]
    available = hd.probe(Path(source['sourceFile']))['seconds']
    jobs.append({'key':key, **source, 'sourceTitle':name+' · Elemental Burst',
                 'chapter':'Elemental Burst', 'start':.05, 'length':min(4.8,available-.1),
                 'sceneKind':'gameplay', 'character':manifest[key]['character']})

for key, name, start in [('gi:10000062','aloy2',.3),('gi:10000148','alyosha',98.5),
                         ('gi:10000132','prune',104),('gi:10000124','jahoda',95.2),
                         ('gi:10000127','illuga',103)]:
    data = json.loads((hd.SOURCES/(name+'.json')).read_text(encoding='utf8'))
    jobs.append({'key':key, 'sourceFile':str(hd.SOURCES/(name+'-native.mp4')),
                 'source':data['webpage_url'], 'sourceTitle':data['title'],
                 'creator':data['uploader'], 'chapter':'Elemental Burst · inspected footage',
                 'start':start, 'length':4.8, 'sceneKind':'gameplay',
                 'character':manifest[key]['character'],
                 'betaCapture':'leak' in data['title'].lower()})

key = 'ww:1502'
entry = manifest[key]
jobs.append({'key':key, 'sourceFile':str(hd.SOURCES/'rover-female-native.mp4'),
             'source':entry['source'], 'sourceTitle':entry['title'], 'creator':'Wotpack',
             'chapter':'Resonance Liberation', 'start':.03, 'length':3.7,
             'sceneKind':'gameplay', 'character':entry['character']})

if __name__ == '__main__':
    (hd.ROOT/'artifacts/hd-extra-plan.json').write_text(json.dumps(jobs, ensure_ascii=False, indent=2), encoding='utf8')
    results = {}
    with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
        for key, result in pool.map(hd.encode, jobs):
            results[key] = result
            (hd.ROOT/'artifacts/hd-extra-build.json').write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding='utf8')
    assert not any('error' in result for result in results.values()), results
    print('Individually inspected HD clips ready:', len(results), flush=True)
