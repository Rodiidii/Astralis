"""Generate the offline, attributed Genshin lore archive."""
from concurrent.futures import ThreadPoolExecutor
from html import unescape
import json
from pathlib import Path
import re
import unicodedata
from urllib.parse import quote, urlencode
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
WIKI = 'https://genshin-impact.fandom.com'
FR = 'https://raw.githubusercontent.com/mrzjy/GenshinDialog/c06fa26faf00ad5923d6b9b897d6b021255f675d/extracted_avatar/avatar_FR.json'
CHANNELS = {'https://www.youtube.com/@genshinimpact','https://www.youtube.com/channel/ucis882ypwzt1nfam0gr0d9q'}
OVERRIDES = {'Nomade':'Wanderer','Shogun Raiden':'Raiden Shogun','Thomas':'Thoma','Rosalia':'Rosaria',
             'Noëlle':'Noelle','Émilie':'Emilie','Fréminet':'Freminet','Aether':'Traveler','Lumine':'Traveler'}


def fetch(url, limit=6_000_000):
    with urlopen(Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=13) as response:
        return response.read(limit)


def get(url):
    return json.loads(fetch(url))


def wiki(page):
    query=urlencode(dict(action='parse',page=page,prop='text|revid',redirects=1,format='json'))
    return get(WIKI+'/api.php?'+query).get('parse',{})


def text(markup):
    raw=unescape(re.sub(r'<[^>]*>',' ',markup))
    raw=re.sub(r'\[(?:\d+|Note \d+)\]', '',raw)
    return ' '.join(raw.split())


def excerpt(raw, cap=78):
    words=raw.split()
    return ' '.join(words[:cap])+('…' if len(words)>cap else '')


def norm(value):
    return ' '.join(re.findall(r'[^\W_]+',''.join(c for c in unicodedata.normalize('NFKD',str(value).casefold()) if not unicodedata.combining(c))))


def profile(row, fr):
    ident=str(row['id'])
    name=row['name']
    local=fr.get(name)
    if ident in ('10000005','10000007'):
        local=fr.get('Voyageur' if ident=='10000005' else 'Voyageuse')
    if local:
        chapters=[]
        for line in local.get('story',[]):
            title,sep,description=line.partition('\t')
            if sep and description.strip():
                chapters.append({'title':title,'text':excerpt(description),'lang':'fr','source':FR})
        return ident,{'chapters':chapters,'source':FR}
    standalone={'tsaritsa':'Anastasya','10000117':'Wonderland Manekin','10000118':'Wonderland Manekin'}
    wanted=standalone.get(ident) or row.get('page') or OVERRIDES.get(name,name)
    try:
        suffix='/Profile' if ident.isdecimal() and ident not in standalone else ''
        page=wiki(wanted+suffix)
        if norm(page.get('title','').removesuffix('/Profile'))!=norm(wanted):
            return ident,None
        markup=page['text']['*']
        source=WIKI+'/wiki/'+quote(page['title'].replace(' ','_'),safe='/')+'?oldid='+str(page['revid'])
        sections=re.split(r'<h[2-4]\b[^>]*>(.*?)</h[2-4]>',markup,flags=re.S|re.I)
        chapters=[]
        if not suffix:
            intro=re.split(r'id="toc"|<h2[^>]*>\s*<span class="mw-headline"',markup,maxsplit=1)[0]
            lead=[text(p) for p in re.findall(r'<p\b[^>]*>(.*?)</p>',intro,re.S)]
            if any(len(p.split())>9 for p in lead):
                chapters.append({'title':'Notice du personnage','text':excerpt(' '.join(p for p in lead if len(p.split())>9)), 'lang':'en','source':source})
        for heading, body in zip(sections[1::2],sections[2::2]):
            title=text(heading.split('<span class="mw-editsection"',1)[0])
            if not re.fullmatch(r'Character (?:Details|Story(?: [1-5])?)|Vision|Gnosis|Linchpin|Appearance|Personality|History|Profile|Background|Trivia|Story',title,re.I):
                continue
            paragraphs=[text(p) for p in re.findall(r'<p\b[^>]*>(.*?)</p>',body,re.S)]
            useful=[p for p in paragraphs if len(p.split())>9 and not p.startswith('Friendship Lv.')]
            if useful:
                chapters.append({'title':title,'text':excerpt(' '.join(useful)), 'lang':'en','source':source})
        return ident,{'chapters':chapters,'source':source} if chapters else None
    except (OSError,ValueError,KeyError):
        return ident,None


REGION_PAGES={'mondstadt':'Mondstadt','liyue':'Liyue','inazuma':'Inazuma','sumeru':'Sumeru',
              'fontaine':'Fontaine','natlan':'Natlan','nod-krai':'Nod-Krai','snezhnaya':'Snezhnaya',
              'khaenriah':"Khaenri'ah",'celestia':'Celestia','abyss':'Abyss'}


def build_regions():
    seeds=json.loads((ROOT/'tools/lore-region-seeds.json').read_text(encoding='utf-8'))
    def region(item):
        ident, wanted=item
        local=[dict(title=title,text=body,source=source,lang='fr') for title,body,source in seeds.get(ident,[])]
        try:
            page=wiki(wanted)
            if norm(page.get('title'))!=norm(wanted):
                return ident,local
            source=WIKI+'/wiki/'+quote(page['title'].replace(' ','_'))+'?oldid='+str(page['revid'])
            markup=page['text']['*']
            sections=re.split(r'<h[2-4]\b[^>]*>\s*<span class="mw-headline"[^>]*>(.*?)</span>.*?</h[2-4]>',markup,flags=re.S)
            topics=[]
            for heading,body in zip(sections[1::2],sections[2::2]):
                heading=text(heading)
                if heading=='Change History' or not re.search(r'histor|origin|cultur|geograph|religion|govern|population|cataclysm|archon war|econom|description|khemia|etymolog|institutions|dynasty',heading,re.I):
                    continue
                paragraphs=[text(p) for p in re.findall(r'<p\b[^>]*>(.*?)</p>',body,re.S)]
                paragraphs=[p for p in paragraphs if len(p.split())>=14]
                if paragraphs:
                    topics.append({'title':heading,'text':excerpt(' '.join(paragraphs),65),'source':source})
            return ident,local+topics[:6]
        except (OSError,ValueError,KeyError):
            return ident,local
    with ThreadPoolExecutor(max_workers=7) as pool:
        return dict(pool.map(region,REGION_PAGES.items()))


def build_events():
    seeds=json.loads((ROOT/'tools/lore-event-seeds.json').read_text(encoding='utf-8'))
    inputs=[(region,*row) for region,rows in seeds.items() for row in rows]
    thumb={}
    for offset in range(0,len(inputs),45):
        titles='|'.join(row[1] for row in inputs[offset:offset+45])
        query=urlencode(dict(action='query',titles=titles,prop='pageimages',piprop='thumbnail',pithumbsize=500,redirects=1,format='json'))
        pages=get(WIKI+'/api.php?'+query)['query']
        thumb.update((norm(page['title']),page.get('thumbnail',{}).get('source')) for page in pages['pages'].values())
    output=ROOT/'assets/lore/events'
    output.mkdir(parents=True,exist_ok=True)
    def event(row):
        region, title, heading, summary=row
        try:
            page=wiki(title)
            if norm(page.get('title'))!=norm(title):return None
            source=WIKI+'/wiki/'+quote(page['title'].replace(' ','_'))+'?oldid='+str(page['revid'])
            markup=page['text']['*']
            timeline=text(markup[:markup.find('id="toc"')] if 'id="toc"' in markup else markup[:20000])
            # Extract full dates when explicitly present. Never infer an end date.
            date_match=re.findall(r'\b(?:January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2}, 20\d{2}\b',timeline)
            main_quests={'A Dance of Snowy Tides and Hoarfrost Groves','The Rainbow Destined to Burn','Incandescent Ode of Resurrection','Perilous Trail'}
            kind='Quête principale' if region=='snezhnaya' or title in main_quests else 'Événement temporaire'
            event={'id':str(page['pageid']),'region':region,'title':heading,'originalTitle':title,
                   'summary':summary,'source':source,'dates':list(dict.fromkeys(date_match))[:2],'kind':kind}
            introduction=markup.split('id="toc"',1)[0].split('<h2',1)[0]
            paragraphs=[text(p) for p in re.findall(r'<p\b[^>]*>(.*?)</p>',introduction,re.S)]
            context=next((p for p in paragraphs if len(p.split())>=18),None)
            if context:
                event['context']=excerpt(context,45)
            url=thumb.get(norm(title))
            if url:
                url=url.replace('static.wikia.nocookie.net','images.wikia.com').split('/revision/')[0]
                try:
                    body=fetch(url,850000)
                    ext='webp' if body[8:12]==b'WEBP' and int.from_bytes(body[4:8],'little')+8==len(body) else 'png' if body.startswith(b'\x89PNG') and body.endswith(b'IEND\xaeB`\x82') else 'jpg' if body.startswith(b'\xff\xd8') and body.endswith(b'\xff\xd9') else None
                    if ext:
                        dest=output/(event['id']+'.'+ext);dest.write_bytes(body)
                        event['image']='./'+dest.relative_to(ROOT).as_posix()
                        event['imageSource']=url
                except OSError:pass
            return event
        except (OSError,ValueError,KeyError):return None
    with ThreadPoolExecutor(max_workers=10) as pool:
        return [row for row in pool.map(event,inputs) if row]


def playlist_ids(playlist):
    markup=fetch('https://www.youtube.com/playlist?list='+playlist).decode()
    video_id=r'"videoId"\s*:\s*"([\w-]{11})"'
    continuation=r'"continuationCommand"\s*:\s*\{"token"\s*:\s*"([^"]+)'
    ids=set(re.findall(video_id,markup))
    version=re.search(r'"INNERTUBE_CLIENT_VERSION":"([^"]+)',markup)
    if not version:
        return ids
    tokens=dict.fromkeys(re.findall(continuation,markup))
    seen=set()
    for _ in range(12):
        if not tokens:
            break
        token=next(iter(tokens))
        del tokens[token]
        seen.add(token)
        payload=json.dumps({'context':{'client':{'clientName':'WEB','clientVersion':version[1]}},
                            'continuation':token}).encode()
        request=Request('https://www.youtube.com/youtubei/v1/browse',data=payload,
                        headers={'User-Agent':'Mozilla/5.0','Content-Type':'application/json'})
        try:
            with urlopen(request,timeout=13) as response:
                page=response.read(6_000_000).decode()
        except (OSError,ValueError):
            continue
        added=set(re.findall(video_id,page))-ids
        if added:
            ids.update(added)
            tokens.update((value,None) for value in re.findall(continuation,page) if value not in seen)
    return ids


def build_videos():
    ids=set()
    playlists=['PLqWr7dyJNgLLcg4CLu_gDuqjRy2VH0zIn','PLqWr7dyJNgLJ80iJSJa-Yw89Z0Z-q-0Bg','PLqWr7dyJNgLLX5_mCRAauT5NTR0WAZY9V']
    for playlist in playlists:
        try:ids.update(playlist_ids(playlist))
        except (OSError,ValueError):pass
    try:
        rss=fetch('https://www.youtube.com/feeds/videos.xml?channel_id=UCiS882YPwZt1NfaM0gR0D9Q').decode()
        ids.update(re.findall(r'<yt:videoId>([\w-]{11})</yt:videoId>',rss))
    except OSError:pass
    ids.update(['aau-c8l5z9c','Go7SeJ-yOL4','lMdsrZ1otlA','kTeoJLD8U0Y','WIxkKExpu94','1hJ5J5QiyIY','M2blSYJ6hrE','TvqGRUWm8qE'])
    try:
        inazuma=fetch('https://genshin.hoyoverse.com/en/news/detail/103968').decode()
        ids.update(re.findall(r'(?:youtu\.be/|youtube\.com/(?:embed/|watch\?v=))([\w-]{11})',inazuma))
    except OSError:pass
    def video(ident):
        link='https://www.youtube.com/watch?v='+ident
        try:
            metadata=get('https://www.youtube.com/oembed?'+urlencode({'url':link,'format':'json'}))
            if metadata['author_url'].lower().rstrip('/') not in CHANNELS:return None
            return {'id':ident,'title':metadata['title'],'channel':metadata['author_url'],'link':link}
        except (OSError,ValueError,KeyError):return None
    with ThreadPoolExecutor(max_workers=12) as pool:
        return [row for row in pool.map(video,sorted(ids)) if row]


def main():
    catalog=json.loads((ROOT/'assets/data/gi-characters.json').read_text(encoding='utf-8'))
    lore=json.loads((ROOT/'assets/data/gi-relation-lore.json').read_text(encoding='utf-8'))
    additions=json.loads((ROOT/'assets/data/gi-relation-overrides.json').read_text(encoding='utf-8'))['roster']
    fr=get(FR)
    people=list({str(row['id']):row for row in catalog+lore+additions}.values())
    with ThreadPoolExecutor(max_workers=4) as batches:
        regions=batches.submit(build_regions)
        events=batches.submit(build_events)
        videos=batches.submit(build_videos)
        with ThreadPoolExecutor(max_workers=9) as pool:
            profiles={ident:data for ident,data in pool.map(lambda row:profile(row,fr),people) if data}
        result={'profiles':profiles,'regions':regions.result(),'events':events.result(),'videos':videos.result()}
    if len(profiles)<70 or len(result['events'])<20 or not result['videos']:
        raise RuntimeError('Couverture trop faible. Le corpus précédent est conservé.')
    path=ROOT/'data/lore-archive.json'
    temp=path.with_suffix('.tmp')
    temp.write_text(json.dumps(result,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8')
    temp.replace(path)
    print({key:len(value) for key,value in result.items()})


if __name__=='__main__':
    main()
