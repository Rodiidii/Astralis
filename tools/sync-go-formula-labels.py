"""Import pinned French labels and UI descriptors for formula controls."""
import concurrent.futures
import importlib.util
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('go_source',ROOT/'tools/sync-go-formula-source.py')
source=importlib.util.module_from_spec(spec)
spec.loader.exec_module(source)
tree=json.loads((ROOT/'data/lab-go-tree.json').read_text())['paths']
paths=[p for p in tree if (
 p.startswith('libs/gi/dm-localization/assets/locales/fr/') and any(n in p for n in ['/char_','/weapon_','/artifact_'])
 or p.startswith('libs/gi/localization/assets/locales/fr/')
 or p.startswith('libs/gi/formula-ui/src/char/sheets/') and p.endswith('.tsx')
 or p.startswith('libs/gi/formula-ui/src/weapon/') and p.endswith(('.ts','.tsx')) and '.test.' not in p
 or p.startswith('libs/gi/formula-ui/src/art/') and p.endswith(('.ts','.tsx')) and '.test.' not in p
)]
paths+=['libs/gi/dm/src/dm/weapon/WeaponExcelConfigData_idmap_gen.json','libs/gi/dm/src/dm/character/AvatarExcelConfigData_idmap_gen.json','libs/gi/dm/src/dm/artifact/ReliquaryExcelConfigData_idmap_gen.json']
failures=[]
with concurrent.futures.ThreadPoolExecutor(max_workers=16) as pool:
 jobs={pool.submit(source.get,p):p for p in paths}
 for number,future in enumerate(concurrent.futures.as_completed(jobs),1):
  try:future.result()
  except Exception as error:failures.append({'path':jobs[future],'error':str(error)})
  if number%100==0:print(str(number)+'/'+str(len(paths))+' label sources',flush=True)
print('label errors',failures,flush=True)
if failures:raise SystemExit(1)
