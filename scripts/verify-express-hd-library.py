"""Read-only audit of the HD assets actually referenced by the application."""
import collections
import concurrent.futures
import hashlib
import importlib.util
import json
from pathlib import Path

spec=importlib.util.spec_from_file_location('hd_media',Path(__file__).with_name('build-express-hd-media.py'))
hd=importlib.util.module_from_spec(spec)
spec.loader.exec_module(hd)
manifest=json.loads(hd.MANIFEST.read_text(encoding='utf8'))


def audit(item):
    key,entry=item
    path=hd.ROOT/entry['url'].lstrip('/')
    measured=hd.probe(path)
    assert measured['width']>=1280 and measured['height']>=720,(key,measured)
    assert 0<measured['seconds']<=5.1,(key,measured)
    assert measured['fps']>=23 and measured['codec']=='h264',(key,measured)
    assert entry['qualityTier']=='native-hd' and entry['interpolated'] is False,key
    assert (entry['width'],entry['height'])==(measured['width'],measured['height']),key
    assert abs(entry['fps']-measured['fps'])<.1,key
    assert entry.get('source') and entry.get('sourceStart') is not None,key
    with path.open('rb') as file:
        measured['sha256']=hashlib.file_digest(file,'sha256').hexdigest()
    return key,measured


if __name__=='__main__':
    results=dict(concurrent.futures.ThreadPoolExecutor(max_workers=3).map(audit,manifest.items()))
    report={'videos':len(results),'fullHd':sum(r['height']>=1080 for r in results.values()),
            'hd720':sum(720<=r['height']<1080 for r in results.values()),
            'fps60':sum(r['fps']>=59 for r in results.values()),
            'nativeCadences':dict(collections.Counter(str(r['fps']) for r in results.values())),
            'maximumSeconds':max(r['seconds'] for r in results.values()),
            'totalBytes':sum(r['bytes'] for r in results.values()),'errors':[],'results':results}
    (hd.ROOT/'artifacts/hd-library-verification.json').write_text(json.dumps(report,indent=2),encoding='utf8')
    print(json.dumps({k:v for k,v in report.items() if k!='results'}),flush=True)
