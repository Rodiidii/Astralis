"""Remove identified diagnostics, never profiles, drafts or imported assets."""
from pathlib import Path
import json,subprocess
ROOT=Path(__file__).resolve().parents[1]
def temporary_files():
 for pattern in ['.rpg-*.py','.team-*.py','.hoyo-*.json','.ww-asset-tree.json','.ww-metric-*.json','.furnishings-raw-*.txt']:
  yield from ROOT.glob(pattern)
 for p in (ROOT/'artifacts').glob('*'):
  if p.is_file() and p.suffix.lower() in {'.png','.jpg','.jpeg','.webm'}:yield p
 for p in ROOT.rglob('*.pyc'):
  if '__pycache__' in p.parts and 'releases' not in p.relative_to(ROOT).parts:yield p
 for name in subprocess.check_output(['git','ls-files','-z','*.log'],cwd=ROOT).decode('utf-8').split('\0'):
  if name and name.startswith(('docs/','tests/','artifacts/')):yield ROOT/name
def main():
 removed=[];size=0
 for p in sorted(set(temporary_files())):
  absolute=p.resolve()
  if not absolute.is_relative_to(ROOT) or not p.is_file() or p.is_symlink():continue
  size+=p.stat().st_size;removed.append(p.relative_to(ROOT).as_posix());p.unlink()
 report={'filesRemoved':len(removed),'bytesRemoved':size,'paths':removed,'preserved':['assets/user','data/character-sheets.sqlite3','user exports','source-data caches','current verification logs']}
 (ROOT/'docs/cleanup-1.0.58.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps({k:v for k,v in report.items() if k!='paths'},ensure_ascii=False))
if __name__=='__main__':main()
