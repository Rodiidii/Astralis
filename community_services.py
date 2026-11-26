"""Owner configuration stays in the excluded local profile, never in a release."""
from __future__ import annotations
import base64,hashlib,ipaddress,json,re,shutil,subprocess
from pathlib import Path

ROOT=Path(__file__).resolve().parent
OWNER=ROOT/'assets/user/owner-services.json'
def owner_settings():
    try:
        data=json.loads(OWNER.read_text(encoding='utf-8'))
        return data if isinstance(data,dict) else {}
    except (OSError,ValueError):return {}

def creator_github_credentials():
    settings=owner_settings();repo=str(settings.get('publishRepo',''))
    if not re.fullmatch(r'[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+',repo):return '', ''
    gh=shutil.which('gh')
    if not gh:return '', ''
    try:
        result=subprocess.run([gh,'auth','token'],capture_output=True,text=True,timeout=8,creationflags=getattr(subprocess,'CREATE_NO_WINDOW',0))
        token=result.stdout.strip() if result.returncode==0 else ''
        return (repo,token) if token else ('','')
    except (OSError,subprocess.TimeoutExpired):return '', ''

def owner_link(address):
    try:local=ipaddress.ip_address(address).is_loopback
    except ValueError:local=False
    data=owner_settings()
    if not local or not data.get('feedbackKey'):return None
    return 'https://astralis.wuaze.com/#feedback-owner='+str(data['feedbackKey'])

def store_profile_icon(body):
    if not isinstance(body,dict):raise ValueError('Icône invalide.')
    value=str(body.get('image',''))
    if len(value)>900000 or not re.fullmatch(r'data:image/png;base64,[A-Za-z0-9+/=]+',value):raise ValueError('Icône PNG invalide.')
    data=base64.b64decode(value.split(',',1)[1],validate=True)
    if len(data)>650000 or data[:8]!=b'\x89PNG\r\n\x1a\n' or data[16:24]!=b'\x00\x00\x02\x00\x00\x00\x02\x00':raise ValueError('Une icône de 512 × 512 pixels est nécessaire.')
    digest=hashlib.sha256(data).hexdigest();folder=ROOT/'assets/user/profile-icons';folder.mkdir(parents=True,exist_ok=True);(folder/(digest+'.png')).write_bytes(data)
    return {'ok':True,'iconUrl':'/api/profile-icon?id='+digest,'manifestUrl':'/api/profile-icon/manifest?id='+digest}
