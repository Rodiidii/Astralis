"""Fetch the original WR formula sheets, without installing their React UI."""
import concurrent.futures
import importlib.util
import json
import re
import sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('go_source',ROOT/'tools/sync-go-formula-source.py')
source=importlib.util.module_from_spec(spec)
spec.loader.exec_module(source)
tree=json.loads((ROOT/'data/lab-go-tree.json').read_text())['paths']
if '--missing' in sys.argv:
    paths=json.loads((ROOT/'vendor/legacy-missing.json').read_text())
else:
    paths=[p for p in tree if re.match(r'^libs/gi/sheets/src/(Characters|Weapons|Artifacts)/.+/index\.tsx$',p)
           or p.startswith('libs/gi/wr/src/') and p.endswith('.ts') and '.test.' not in p
           or p.startswith('libs/gi/uidata/src/') and p.endswith('.ts')]
    paths+=['libs/gi/sheets/src/SheetUtil.tsx','libs/gi/sheets/src/Characters/dataUtil.tsx','libs/gi/sheets/src/Reaction.tsx','libs/gi/sheets/src/Resonance.tsx']
failures=[]
with concurrent.futures.ThreadPoolExecutor(max_workers=16) as pool:
    jobs={pool.submit(source.get,p):p for p in paths}
    for number,future in enumerate(concurrent.futures.as_completed(jobs),1):
        try:future.result()
        except Exception as error:failures.append({'path':jobs[future],'error':str(error)})
        if number%100==0:print(str(number)+'/'+str(len(paths))+' original formula sources',flush=True)
print('source errors',failures,flush=True)
if failures:raise SystemExit(1)
