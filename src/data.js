import { getLocal, putLocal } from './persistence.js?v=20261107-stability-6';
import { ic } from './icons.js?v=20261107-stability-6';

export const GAMES = {
  hsr: { label: 'Honkai: Star Rail', short: 'Star Rail', icon: ic('hsr'), accent: '#c1a7ff', source: 'StarRailStaticAPI' },
  gi: { label: 'Genshin Impact', short: 'Genshin', icon: ic('gi'), accent: '#e8c788', source: 'genshin.jmp.blue' },
  ww: { label: 'Wuthering Waves', short: 'Wuthering', icon: ic('ww'), accent: '#7ed7cf', source: 'Encore API · catalogue Beta' },
};

const ELEMENTS_FR = { Fire: 'Feu', Ice: 'Glace', Thunder: 'Foudre', Wind: 'Vent', Quantum: 'Quantique', Imaginary: 'Imaginaire', Physical: 'Physique', Geo: 'Géo', Dendro: 'Dendro', Hydro: 'Hydro', Pyro: 'Pyro', Electro: 'Électro', Cryo: 'Cryo', Anemo: 'Anémo', Spectro: 'Spectro', Havoc: 'Havoc', Glacio: 'Glacio', Fusion: 'Fusion' };
const PATHS_FR = { Knight: 'Préservation', Rogue: 'Chasse', Mage: 'Érudition', Warlock: 'Nihilité', Shaman: 'Harmonie', Warrior: 'Destruction', Priest: 'Abondance', Memory: 'Souvenir' };
const WEAPONS_FR = { Sword: 'Épée', Claymore: 'Épée à deux mains', Bow: 'Arc', Catalyst: 'Catalyseur', Polearm: 'Lance', Broadblade: 'Épée large', Gauntlets: 'Gantelets', Pistols: 'Pistolets', Rectifier: 'Rectificateur', 'Sword': 'Épée' };
export function frenchTerm(value) { const raw = String(value ?? ''); return ELEMENTS_FR[raw] || PATHS_FR[raw] || WEAPONS_FR[raw] || raw; }

const catalogCache = new Map();
const detailCache = new Map();
const levelStatsCache = new Map();
const skillCache = new Map();
let hsrRankCache;
const refreshing = new Map();
const retiredPreviewIds = new Set(['mitya-preview', 'lily-preview', 'starsealed-edict-preview']);
function cleanCatalogRows(rows) {
  return (Array.isArray(rows) ? rows : []).filter(row => {
    const id = String(row?._id || row?.id || '').toLowerCase();
    const name = String(row?._name || row?.name || '').toLowerCase();
    return !retiredPreviewIds.has(id) && !(row?.preRelease && ['mitya', 'lily', 'starsealed-edict'].some(key => id === key || name === key));
  });
}
function cacheTtl(){try{const days=Number(JSON.parse(localStorage.getItem('astralis:preferences')||'{}').dataRefreshDays)||1;return Math.max(1,Math.min(30,days))*24*60*60*1000;}catch{return 24*60*60*1000;}}
const MAX_JSON_BYTES = 16 * 1024 * 1024;

export const slugify = value => String(value ?? '')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  .replace(/[’']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function displayName(game, item, fallback) {
  const raw = item?.name ?? item?.Name ?? item?.item_name ?? item?.en ?? fallback ?? 'Sans nom';
  if (game === 'gi' && String(raw).toLowerCase() === 'traveler') {
    const element = item?.vision || item?.element || 'Anemo';
    return `Voyageur · ${element}`;
  }
  if (raw !== '{NICKNAME}') return String(raw);
  const names = {
    playerboy: 'Pionnier (Homme)', playergirl: 'Pionnière (Femme)',
    playerboy2: 'Pionnier · Feu (Homme)', playergirl2: 'Pionnière · Feu (Femme)',
    playerboy3: 'Pionnier · Imaginaire (Homme)', playergirl3: 'Pionnière · Imaginaire (Femme)',
  };
  return names[item?.tag] || 'Pionnier';
}

function entityId(game, item, fallback) {
  if (game === 'ww') return String(item?.id ?? fallback);
  if (game === 'gi') {
    const name = String(item?.name || fallback || '');
    return name.toLowerCase() === 'traveler' ? `traveler-${slugify(item?.vision || item?.element || 'anemo')}` : slugify(name);
  }
  return String(item?.id ?? item?.Id ?? item?.ID ?? fallback);
}

function normalize(game, category, item, fallback) {
  if (!item || typeof item !== 'object') item = { name: String(item ?? fallback) };
  const id = entityId(game, item, fallback);
  return { ...item, _id: id, _name: displayName(game, item, id), _game: game, _category: category };
}
async function json(url, signal) {
  const response = await fetch(url, { signal, cache: 'no-cache' });
  if (!response.ok) throw new Error(`La source répond avec HTTP ${response.status}`);
  const headerSize = Number(response.headers.get('content-length') || 0);
  if (headerSize > MAX_JSON_BYTES) throw new Error('Mise à jour ignorée : la base dépasse la limite locale de 16 Mo.');
  let payload;
  if (response.body?.getReader) {
    const reader = response.body.getReader(), chunks = [];
    let total = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_JSON_BYTES) { await reader.cancel(); throw new Error('Mise à jour ignorée : la base dépasse la limite locale de 16 Mo.'); }
      chunks.push(value);
    }
    const joined = new Uint8Array(total); let offset = 0;
    for (const chunk of chunks) { joined.set(chunk, offset); offset += chunk.byteLength; }
    payload = new TextDecoder().decode(joined);
  } else payload = await response.text();
  const result = JSON.parse(payload);
  if (result?.error) throw new Error(result.detail || result.error);
  return result;
}

export async function catalog(game, category, { force = false } = {}) {
  const key = `studio64:${game}:${category}`;
  const cached = catalogCache.get(key);
  const ttl=cacheTtl();
  if (!force && cached && Date.now() - cached.savedAt < ttl) return cleanCatalogRows(cached.items);
  if (!force && cached?.pending) return cached.pending;
  if (!force) {
    try {
      const saved = await getLocal('cache', `catalog:${key}`);
      if (Array.isArray(saved?.items) && saved.items.length) {
        const savedAt=Number(saved.savedAt)||0;
        const cleanItems = cleanCatalogRows(saved.items);
        catalogCache.set(key, { items: cleanItems, savedAt });
        let autoRefresh=true;try{autoRefresh=JSON.parse(localStorage.getItem('astralis:preferences')||'{}').autoRefresh!==false;}catch{}
        if (autoRefresh&&Date.now()-savedAt>=ttl&&!refreshing.has(key)) {
          const refresh = fetchCatalog(game, category, false).then(items => {
            const previous = catalogCache.get(key)?.items;
            if (game === 'gi' && category === 'character' && previous?.length > 40 && items.length < previous.length * 0.75) throw new Error('Mise à jour partielle ignorée : conservation du catalogue Genshin déjà valide.');
            catalogCache.set(key, { items, savedAt: Date.now() });
            putLocal('cache', `catalog:${key}`, { items, savedAt: Date.now(), source: GAMES[game].source }).catch(() => {});
            window.dispatchEvent(new CustomEvent('astralis:catalog-updated', { detail: key }));
          }).catch(() => {}).finally(() => refreshing.delete(key));
          refreshing.set(key, refresh);
        }
        if (cleanItems.length !== saved.items.length) putLocal('cache', `catalog:${key}`, { ...saved, items: cleanItems }).catch(() => {});
        return cleanItems;
      }
    } catch { /* Cache absente : lecture réseau ci-dessous. */ }
  }
  const pending = fetchCatalog(game, category, force).then(rows => {
    const items = cleanCatalogRows(rows);
    if (game === 'gi' && category === 'character' && cached?.items?.length > 40 && items.length < cached.items.length * 0.75) throw new Error('Mise à jour partielle ignorée : conservation du catalogue Genshin déjà valide.');
    const savedAt = Date.now();
    catalogCache.set(key, { items, savedAt });
    putLocal('cache', `catalog:${key}`, { items, savedAt, source: GAMES[game].source }).catch(() => {});
    return items;
  }).catch(error => { if (cached?.items && !force) { catalogCache.set(key, cached); return cached.items; } catalogCache.delete(key); throw error; });
  catalogCache.set(key, { pending });
  return pending;
}

async function fetchLunarisGi(category) {
  const meta=await json('https://api.lunaris.moe/data/version.json',AbortSignal.timeout(20000));
  const version=String(meta?.version||'');
  if(!/^\d+\.\d+\.\d+$/.test(version))throw new Error('Version Lunaris invalide.');
  const file=category==='character'?'charlist.json':category==='weapon'?'weaponlist.json':category==='artifact'?'artifactlist.json':null;
  if(!file)return null;
  const raw=await json(`https://api.lunaris.moe/data/${version}/${file}`,AbortSignal.timeout(30000));
  const rows=Object.entries(raw||{}).map(([id,row])=>{
    const rarity=String(row.qualityType||'').includes('ORANGE')?5:String(row.qualityType||'').includes('PURPLE')?4:Number(row.rarity)||0;
    if(category==='character')return {id,name:row.frName||row.enName||row.chsName, enName:row.enName,rarity,element:row.element,weaponType:row.weaponType,version,sourceVersion:version,images:{filename_icon:row.CardImg||`UI_Gacha_AvatarIcon_${row.enName}`,filename_gachaSplash:row.GachaImg||`UI_Gacha_AvatarImg_${row.enName}`,lunarisIcon:row.CardImg,lunarisSplash:row.GachaImg},introduction:row.description||'',description:row.description||'',ascensionStats:row.ascensionStats||{}};
    if(category==='weapon')return {id,name:row.frName||row.enName||row.chsName,enName:row.enName,rarity,weaponType:row.weaponType,ascensionStats:row.ascensionStats||{},images:{filename_icon:row.weaponIcon,lunarisIcon:row.weaponIcon},description:row.description||''};
    return {id,name:row.frName||row.enName||row.chsName,enName:row.enName,rarity,setId:row.setId,images:{filename_icon:row.setIcon,lunarisIcon:row.setIcon},twoPieceBonus:row.twoPieceBonus||'',fourPieceBonus:row.fourPieceBonus||'',description:row.description||''};
  });
  return {version,items:rows};
}

async function fetchCatalog(game, category, force) {
  let data;
  if (game === 'gi') {
    const file = category === 'character' ? 'characters' : category === 'weapon' ? 'weapons' : category === 'artifact' ? 'artifacts' : category==='material'?'materials':'';
    if (file) {
      const lunaris=await fetchLunarisGi(category).catch(()=>null);
      const endpoint = file;
      const url = `https://genshin-db-api.vercel.app/api/v5/${endpoint}?query=names&matchCategories=true&verboseCategories=true&queryLanguages=french&resultLanguage=French`;
      const secondary=await json(url, AbortSignal.timeout(30000)).catch(()=>null);
      if(lunaris?.items?.length){
        const normName=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
        const extras=Array.isArray(secondary)?secondary:Object.values(secondary||{});
        const byName=new Map(extras.map(row=>[normName(row.name||row.enName),row]));
        data=lunaris.items.map(row=>({...((byName.get(normName(row.enName))||byName.get(normName(row.name)))||{}),...row,images:{...((byName.get(normName(row.enName))||{}).images||{}),...(row.images||{})}}));
      } else data=secondary||await json(`assets/data/gi-${file}.json`,AbortSignal.timeout(30000));
      // The live database has French text; the bundled Hakushin-era export is
      // retained only as a complete source for stable icon filenames and costs.
      try {
        const local = await json(`assets/data/gi-${file}.json`, AbortSignal.timeout(20000));
        const localRows = Array.isArray(local) ? local : Object.values(local || {});
        const byId = new Map(localRows.map(row => [String(row.id ?? row.name ?? '').toLowerCase(), row]));
        const byName = new Map(localRows.map(row => [String(row.name || '').toLowerCase(), row]));
        const merge = (remote, original) => {
          const key = String(remote.id ?? remote.name ?? '').toLowerCase();
          const saved = byId.get(key) || byName.get(String(remote.name || '').toLowerCase()) || {};
          return { ...saved, ...remote, id: remote.id ?? saved.id, costs: remote.costs || saved.costs,
            images: { ...(saved.images || {}), ...(remote.images || {}),
              filename_icon: remote.images?.filename_icon || saved.images?.filename_icon,
              filename_flower: remote.images?.filename_flower || saved.images?.filename_flower } };
        };
        data = Array.isArray(data) ? data.map(row => merge(row)) : Object.fromEntries(Object.entries(data || {}).map(([key,row]) => [key, merge(row)]));
      } catch { /* Les assets locaux sont un enrichissement, la source principale reste utilisable. */ }
    } else data = [];
  } else if (game === 'hsr') {
    const file = category === 'character' ? 'character' : category === 'weapon' ? 'lightcone' : category === 'artifact' ? 'relicset' : category==='material'?'item':'';
    if (file) {
      const supplemental = await json(`assets/data/hsr-nanoka-${file}.json`, AbortSignal.timeout(30000));
      const base = ['character','weapon','artifact'].includes(category) ? await json(`/data/hsr/${category}${force ? '?refresh=1' : ''}`, AbortSignal.timeout(30000)).catch(() => ({})) : {};
      const merged = { ...supplemental, ...base };
      data = Object.fromEntries(Object.entries(merged).map(([id, value]) => {
        const nanoka = supplemental[id] || {};
        return [id, { ...value, id, name: value.name || nanoka.item_name || nanoka.fr || nanoka.en, nanokaIcon: nanoka.icon, item_figure_icon_path:nanoka.item_figure_icon_path, en: nanoka.en, path: value.path || nanoka.baseType, element: value.element || nanoka.damageType, baseType: nanoka.baseType, damageType: nanoka.damageType, rarity: nanoka.rank?.match(/Type(\d+)/)?.[1] || ({SuperRare:5,VeryRare:4,Rare:3,Normal:2,NotNormal:1})[nanoka.rarity] || value.rarity }];
      }));
    } else data = await json(`/data/${game}/${category}${force ? '?refresh=1' : ''}`, AbortSignal.timeout(30000));
  } else if (game === 'ww' && category==='material') data=await json('assets/data/ww-items.json',AbortSignal.timeout(30000));
  else data = await json(`/data/${game}/${category}${force || game === 'ww' ? '?refresh=1' : ''}`, AbortSignal.timeout(30000));
    const entries = Array.isArray(data) ? data.map((value, index) => [value?.id ?? index, value]) : Object.entries(data || {});
    const items = entries.map(([id, value]) => normalize(game, category, value, id))
      .filter(item => item._name && item._name !== 'Sans nom' && !/^\s*\.{2,}\s*$/.test(item._name));
    if(game==='hsr'&&category==='character'){
      try{const profile=await getLocal('profiles','hsr');for(const avatar of profile?.data?.avatar_list||[]){const id=String(avatar.id);if(items.some(item=>item._id===id))continue;items.push(normalize(game,category,{id,name:avatar.name,element:avatar.element,rarity:avatar.rarity,icon:avatar.icon,portrait:avatar.image,preview:avatar.image,profileOnly:true},id));}}catch{/* No profile imported yet. */}
    }
    await putLocal('cache', `catalog:${game}:${category}`, { items, savedAt: Date.now(), source: GAMES[game].source });
    return items;
}

export async function levelStatsFor(folder,item) {
  const key=`${folder}:${item?.name||item?._name||item?._id||''}`;
  if(levelStatsCache.has(key))return levelStatsCache.get(key);
  const pending=(async()=>{
    try{const cached=await getLocal('cache',`gi-level-stats:${key}`);if(cached?.items&&Date.now()-(Number(cached.savedAt)||0)<30*86400000)return cached.items;}catch{}
    const query=encodeURIComponent(item?.name||item?._name||item?._id||'');
    const result=await json(`https://genshin-db-api.vercel.app/api/v5/stats?folder=${encodeURIComponent(folder)}&query=${query}&queryLanguages=English&resultLanguage=English`,AbortSignal.timeout(25000));
    const rows=result?.stats||result?.result?.stats||result;
    if(!rows||typeof rows!=='object')throw new Error('Courbe de statistiques indisponible.');
    await putLocal('cache',`gi-level-stats:${key}`,{items:rows,savedAt:Date.now()}).catch(()=>{});return rows;
  })();
  levelStatsCache.set(key,pending);
  try{return await pending;}catch(error){levelStatsCache.delete(key);throw error;}
}

export async function gameSkills(game) {
  if (skillCache.has(game)) return skillCache.get(game);
  let value;
  if (game === 'hsr') value = await json('/data/hsr/skills', AbortSignal.timeout(30000));
  else value = {};
  skillCache.set(game, value);
  return value;
}

export async function hsrCharacterRanks(){
  if(hsrRankCache)return hsrRankCache;
  hsrRankCache=(async()=>{
    const saved=await getLocal('cache','hsr:character-ranks').catch(()=>null);
    if(saved?.items)return saved.items;
    const data=await json('assets/data/hsr-character-ranks-fr.json',AbortSignal.timeout(30000));
    await putLocal('cache','hsr:character-ranks',{items:data,savedAt:Date.now(),source:'StarRailStaticAPI FR'});
    return data;
  })().catch(error=>{hsrRankCache=null;throw error;});
  return hsrRankCache;
}

export async function characterDetails(game, character) {
  const key = `${game}:${character._id}`;
  // Never fuzzy-query unreleased characters: wait for a connected public source rather than fabricating kit data.
  if (game === 'gi' && character.preRelease) {
    const details = { ...character, levelStats: null, skillTalents: [], talentValues: null, passives: [], constellations: [] };
    detailCache.set(key, details);
    return details;
  }
  if (detailCache.has(key)) return detailCache.get(key);
  try{const saved=await getLocal('cache',`detail:studio69:${key}`);if(saved?.items&&Date.now()-(Number(saved.savedAt)||0)<cacheTtl()){detailCache.set(key,saved.items);return saved.items;}}catch{}
  let details = character;
  if (game === 'gi') {
    if(/^\d+$/.test(String(character.id||''))){
      try{
        const meta=await json('https://api.lunaris.moe/data/version.json',AbortSignal.timeout(15000));
        const version=String(meta?.version||'');
        const raw=await json(`https://api.lunaris.moe/data/${version}/fr/char/${encodeURIComponent(character.id)}.json`,AbortSignal.timeout(25000));
        const info=raw.info||{},skillIcons=raw.icons||{},skills=raw.skills||{};
        const skillKeys=['normalattack','elementalskill','elementalburst'];
        const skillTalents=skillKeys.map((key,index)=>{const value=skills[key];if(!value)return null;return {...value,name:value.name||key,unlock:['Attaque normale','Compétence élémentaire','Déchaînement élémentaire'][index],icon:value.icon?`https://api.lunaris.moe/data/assets/skills/${encodeURIComponent(value.icon)}.webp`:undefined,description:value.description||value.desc||'',values:value.multipliers?Object.entries(value.multipliers).map(([label,values])=>`${label} · ${Array.isArray(values)?values.join(' / '):values}`):[]};}).filter(Boolean);
        const constellations=Array.from({length:6},(_,i)=>raw.constellations?.[`const${i+1}`]).filter(Boolean).map((value,i)=>({...value,name:`C${i+1} · ${value.name||''}`,icon:value.icon?`https://api.lunaris.moe/data/assets/skills/${encodeURIComponent(value.icon)}.webp`:undefined}));
        const attr=(info.attributes||[]).filter(x=>Number(x.level)===90).sort((a,b)=>Number(b.ascension)-Number(a.ascension))[0]||{};
        const icon=filename=>filename?`https://api.lunaris.moe/data/assets/skills/${encodeURIComponent(filename)}.webp`:undefined;
        details={...character,...info,levelStats:info.attributes,baseStats:{hp:attr.hp,attack:attr.atk,defense:attr.def},skillTalents,passives:Object.values(skills).filter(x=>x&&(/passive|utility/i.test(String(x.type||x.name||'')))),constellations,kitVersion:`Lunaris ${version}`,source:'Lunaris'};
        detailCache.set(key,details);putLocal('cache',`detail:studio69:${key}`,{items:details,savedAt:Date.now(),source:'Lunaris'}).catch(()=>{});return details;
      }catch{/* fallback below: Genshin-DB remains a rescue source */}
    }
    const options = `query=${encodeURIComponent(character.name || character._name)}&matchCategories=true&verboseCategories=true&queryLanguages=french&resultLanguage=French`;
    const statsQuery=encodeURIComponent(character.name||character._name);
    const [talentValues,constellations,levelStats] = await Promise.all([
      json(`https://genshin-db-api.vercel.app/api/v5/talents?${options}`, AbortSignal.timeout(25000)),
      json(`https://genshin-db-api.vercel.app/api/v5/constellations?${options}`, AbortSignal.timeout(25000)).catch(()=>null),
      levelStatsFor('characters',character).catch(()=>null),
    ]);
    const skillTalents=['combat1','combat2','combat3'].map(key=>talentValues?.[key]).filter(Boolean);
    details = { ...character, description:character.description, levelStats, talentValues, skillTalents:skillTalents.map((skill,index)=>{const legacy=`https://genshin.jmp.blue/characters/${encodeURIComponent(character._id)}/talent-${['na','skill','burst'][index]}`;const filename=talentValues?.images?.[`filename_combat${index+1}`];return {...skill,icon:filename?`https://enka.network/ui/${encodeURIComponent(filename)}.png`:legacy,iconFallbacks:[legacy]}}), talentCosts:talentValues?.costs||{}, passives:['passive1','passive2','passive3'].map(key=>talentValues?.[key]).filter(Boolean), constellations:constellations?['c1','c2','c3','c4','c5','c6'].map((key,index)=>constellations[key]&&({name:`Constellation ${index+1} · ${constellations[key].name}`,description:constellations[key].description,icon:`https://genshin.jmp.blue/characters/${encodeURIComponent(character._id)}/constellation-${index+1}`,level:10})).filter(Boolean):[] };
  }
  if (game === 'ww'&&!character.preRelease) details = { ...character, ...await json(`/detail/ww/character/${encodeURIComponent(character.apiId||character._id)}`, AbortSignal.timeout(25000)) };
  if (game === 'hsr') {
    const [skills,ranks] = await Promise.all([gameSkills(game),hsrCharacterRanks()]);
    const eidolons=Object.values(ranks||{}).filter(rank=>String(rank.id||'').startsWith(String(character._id))&&Number(rank.rank)>0).sort((a,b)=>Number(a.rank)-Number(b.rank));
    let kit=(character.skills||[]).map(id=>skills[id]).filter(Boolean);
    let nanokaRanks=[];
    if(kit.length<3||eidolons.length<6){
      try{
        const key=`hsr:nanoka-character:${character._id}`;
        let remote=await getLocal('cache',key).catch(()=>null);
        if(!remote?.items){
          remote=await json(`https://static.nanoka.cc/hsr/4.6.54/en/character/${encodeURIComponent(character._id)}.json`,AbortSignal.timeout(20000));
          await putLocal('cache',key,{items:remote,savedAt:Date.now(),source:'Nanoka HSR 4.6.54'});
        } else remote=remote.items;
        const renderDesc=(text,params=[])=>String(text||'').replace(/<[^>]*>/g,'').replace(/#(\d+)\[i\](%?)/g,(_,n,pct)=>{const value=Number(params[Number(n)-1]);return Number.isFinite(value)?`${Number((value*(pct?100:1)).toFixed(2))}${pct?'%':''}`:`#${n}`;});
        const remoteSkills=Object.values(remote.skills||{}).filter(skill=>skill.type_name&&skill.type!=='MazeNormal').map(skill=>{
          const level=skill.level?.['10']||Object.values(skill.level||{}).at(-1)||{};
          const values=level.param_list||[];
          return {id:String(skill.id),name:skill.name,type:skill.type,type_text:skill.type_name,desc:renderDesc(skill.desc,values),simple_desc:skill.simple_desc,max_level:10,params:values.map(value=>Array(10).fill(value)),icon:''};
        });
        if(kit.length<3&&remoteSkills.length)kit=remoteSkills;
        nanokaRanks=Object.entries(remote.ranks||{}).map(([rank,value])=>({id:String(value.id),rank:Number(rank),name:value.name,desc:renderDesc(value.desc,value.param_list||[]),icon:''}));
      }catch{/* La fiche reste utilisable avec le kit français déjà en cache. */}
    }
    details = { ...character, kit, eidolons:eidolons.length?eidolons:nanokaRanks };
  }
  detailCache.set(key, details);
  putLocal('cache',`detail:studio69:${key}`,{items:details,savedAt:Date.now()}).catch(()=>{});
  return details;
}

// Sources de secours par nom interne (UI_AvatarIcon_<Nom>) pour les personnages récents
// dont l'image n'existe pas encore sur genshin.jmp.blue.
function genshinNameSources(item) {
  const raw = String(item?.name || item?._name || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const pascal = raw.split(/[^A-Za-z0-9]+/).filter(Boolean).map(w => w[0].toUpperCase() + w.slice(1)).join('');
  if (!pascal || /^Traveler|^Voyageur/i.test(pascal)) return [];
  return [
    `https://gi.yatta.moe/assets/UI/UI_AvatarIcon_${pascal}.png`,
    `https://enka.network/ui/UI_AvatarIcon_${pascal}.png`,
    `https://api.ambr.top/assets/UI/UI_AvatarIcon_${pascal}.png`,
  ];
}

export function imageSet(game, item, category = item?._category || 'character') {
  const id = encodeURIComponent(item?._id || '');
  if (game === 'hsr') {
    const prefix = 'https://vizualabstract.github.io/StarRailStaticAPI/assets/';
    const fields = category === 'character' ? [item?.portrait, item?.preview, item?.icon] : [item?.icon, item?.preview, item?.portrait];
    const urls = fields.filter(Boolean).map(path => path.startsWith('http') ? path : prefix + path);
    if (category === 'character' && /^\d+$/.test(String(item?._id || ''))) {
      const id = encodeURIComponent(item._id);
      urls.push(`https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/image/character_portrait/${id}.png`);
      urls.push(`https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/image/character_preview/${id}.png`);
    }
    if (item?.nanokaIcon) {
      const assetType = category === 'character' ? 'avatarshopicon' : 'lightconemediumicon';
      urls.push(`https://static.nanoka.cc/assets/hsr/${assetType}/${encodeURIComponent(item._id)}.webp`);
    }
    // Nanoka remains as an icon fallback; StarRailStaticAPI/StarRailRes keep
    // priority for the established character portraits. Its kit data is unchanged.
    // StarRailRes keeps portraits keyed by the same stable game ID.
    if (category === 'weapon' && /^\d+$/.test(String(item?._id || ''))) {
      urls.push(`https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/image/light_cone_portrait/${encodeURIComponent(item._id)}.png`);
    }
    return [...new Set(urls)];
  }
  if (game === 'gi') {
    if (category === 'character') {
      const prydwenAliases={ayaka:'kamisato-ayaka',ayato:'kamisato-ayato',kazuha:'kaedehara-kazuha',kokomi:'sangonomiya-kokomi',itto:'arataki-itto',sara:'kujou-sara',heizou:'shikanoin-heizou',heizo:'shikanoin-heizou',yae:'yae-miko',miko:'yae-miko',alhatham:'alhaitham',ambor:'amber',baizhuer:'baizhu',hutao:'hu-tao',qin:'jean',momoka:'kirara',shinobu:'kuki-shinobu',lanyan:'lan-yan',linette:'lynette',liney:'lyney',noel:'noelle',olorun:'ororon',shougun:'raiden-shogun','marionette-new':'sandrone','skirk-new':'skirk',tohma:'thoma',liuyun:'xianyun',feiyan:'yanfei',mizuki:'yumemizuki-mizuki',yunjin:'yun-jin'};
      const toPrydwenSlug=value=>{const clean=String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/^UI_(?:(?:Gacha_)?AvatarIcon_)(?:Side_)?/i,'').replace(/_Card$/i,'');const slug=clean.replace(/([a-z0-9])([A-Z])/g,'$1-$2').replace(/[^A-Za-z0-9]+/g,'-').replace(/^-|-$/g,'').toLowerCase();return prydwenAliases[slug]||slug;};
      const prydwenSlugs=[...new Set([item?.images?.filename_icon,item?.enName,item?.englishName,item?.name,item?._name].map(toPrydwenSlug).filter(Boolean))];
      const prydwenIcons=prydwenSlugs.map(slug=>`https://cdn.prydwen.gg/images/genshin-impact/characters/${slug}_icon.webp`);
      const lunarisIcon=item?.images?.lunarisIcon||item?.images?.filename_icon;
      const lunarisUrls=lunarisIcon?[`https://api.lunaris.moe/data/assets/avataricon/${encodeURIComponent(String(lunarisIcon).replace('UI_Gacha_AvatarIcon','UI_AvatarIcon'))}.webp`]:[];
      return [
      // Keep the familiar Prydwen portraits first. Other icon sources remain
      // as fallbacks; character splash art stays in splashImage() and is not
      // substituted into compact avatar/icon slots.
      ...prydwenIcons,...lunarisUrls,
      item?.images?.filename_icon && `https://enka.network/ui/${encodeURIComponent(item.images.filename_icon)}.png`,
      item?.images?.filename_icon && `https://gi.yatta.moe/assets/UI/${encodeURIComponent(item.images.filename_icon)}.png`,
      item?.images?.['mihoyo_icon'], item?.images?.portrait, item?.images?.image,
      `https://genshin.jmp.blue/characters/${id}/portrait`,
      `https://genshin.jmp.blue/characters/${id}/gacha-card`,
      `https://genshin.jmp.blue/characters/${id}/icon-big`,
      ...genshinNameSources(item),
    ].filter(Boolean);
    }
    if (category === 'weapon') return [
      item?.images?.filename_icon && `https://enka.network/ui/${encodeURIComponent(item.images.filename_icon)}.png`,
      item?.images?.filename_icon && `https://gi.yatta.moe/assets/UI/${encodeURIComponent(item.images.filename_icon)}.png`,
      item?.images?.['mihoyo_icon'], item?.images?.icon, item?.images?.['hoyowiki_icon'], `https://genshin.jmp.blue/weapons/${id}/icon.png`, `https://genshin.jmp.blue/weapons/${id}/icon`].filter(Boolean);
    if (category === 'artifact') return [
      item?.images?.filename_flower && `https://enka.network/ui/${encodeURIComponent(item.images.filename_flower)}.png`,
      item?.images?.filename_flower && `https://gi.yatta.moe/assets/UI/${encodeURIComponent(item.images.filename_flower)}.png`,
      item?.images?.flower, item?.images?.circlet, `https://genshin.jmp.blue/artifacts/${id}/flower-of-life`].filter(Boolean);
    if (category === 'material') {
      const filename=item?.images?.filename_icon;
      return [filename&&`https://gi.yatta.moe/assets/UI/${encodeURIComponent(filename)}.png`,
        filename&&`https://enka.network/ui/${encodeURIComponent(filename)}.png`,
        item?.images?.icon, item?.images?.item, item?.images?.['hoyowiki_icon'], item?.icon,
        filename&&`https://upload-os-bbs.hoyolab.com/game_record/genshin/item_icon/${encodeURIComponent(filename)}.png`,
        filename&&`https://api.ambr.top/assets/UI/item/${encodeURIComponent(filename)}.png`,
        filename&&`https://genshin-impact.fandom.com/wiki/Special:FilePath/${encodeURIComponent(filename)}.png`].filter(Boolean);
    }
  }
  if (game === 'ww') {
    const urls = [item?.portraitUrl, item?.imageUrl, item?.image, item?.iconUrl, item?.icon].filter(Boolean);
    return [...new Set(urls.map(sharpenWuwa))];
  }
  return [];
}

export function splashImage(game, item) {
  if (game === 'gi' && item?._category === 'character') {
    if (item?.preRelease && item?.images?.cover1) return item.images.cover1;
    const lunarisSplash = item?.images?.lunarisSplash || item?.images?.filename_gachaSplash;
    if (lunarisSplash) return /^https?:\/\//i.test(lunarisSplash) ? lunarisSplash : `https://enka.network/ui/${encodeURIComponent(lunarisSplash)}.png`;
    const iconName = item?.images?.filename_icon || '';
    const gacha = iconName.replace('UI_AvatarIcon_', 'UI_Gacha_AvatarImg_');
    return gacha && gacha !== iconName ? `https://enka.network/ui/${encodeURIComponent(gacha)}.png` : (item?.images?.cover1 || item?.images?.card || `https://genshin.jmp.blue/characters/${encodeURIComponent(item._id)}/gacha-splash`);
  }
  if (game === 'hsr' && item?._category === 'character' && item?.preview) return `https://vizualabstract.github.io/StarRailStaticAPI/assets/${item.preview}`;
  return imageSet(game, item)[0] || '';
}

export function splashImageCandidates(game, item) {
  const primary = splashImage(game, item);
  if (!item || item._category !== 'character') return [primary, ...imageSet(game, item, 'character')].filter(Boolean);
  if (game === 'gi') {
    const id = encodeURIComponent(item._id || '');
    if (item.preRelease && primary) return [...new Set([primary, item.images?.cover1, item.images?.card].filter(Boolean))];
    return [...new Set([
      item.images?.cover1,
      item.images?.card,
      `https://genshin.jmp.blue/characters/${id}/gacha-splash`,
      primary,
    ].filter(Boolean))];
  }
  return [...new Set([primary].filter(Boolean))];
}

export function setBonuses(item, game) {
  const raw = item || {};
  if (game === 'gi') return [
    (raw['2-piece_bonus']||raw.effect2Pc) && { pieces: 2, text: raw['2-piece_bonus']||raw.effect2Pc },
    (raw['4-piece_bonus']||raw.effect4Pc) && { pieces: 4, text: raw['4-piece_bonus']||raw.effect4Pc },
  ].filter(Boolean);
  if (game === 'hsr') {
    const desc = Array.isArray(raw.desc) ? raw.desc : [];
    return desc.map((text, index) => ({ pieces: index ? 4 : 2, text, properties: raw.properties?.[index] || [] })).filter(row => row.text);
  }
  const text = raw.description || raw.desc || raw.subtitle || '';
  return text ? [{ pieces: 5, text }] : [];
}

export function skillList(game, character, details) {
  if (game === 'hsr') return (details?.kit || []).map(skill => {
    const typeLabels={ 'Basic ATK':'Attaque normale', Skill:'Compétence', Ultimate:'Ultime', Talent:'Talent', Technique:'Technique', 'Elation Skill':'Compétence d’Élation', 'Elation DMG':'DGT d’Élation', Assist:'Assistance', 'Memosprite Skill':'Compétence du mémosprite' };
    const rawLabel = skill.type_text || skill.type || 'Action';
    const label = typeLabels[rawLabel] || rawLabel;
    const code = /basic|normal|attaque de base/i.test(label) ? 'N' : /ultimate|ultime/i.test(label) ? 'Q' : /skill|compétence/i.test(label) ? 'E' : /talent|follow.?up/i.test(label) ? 'F' : 'T';
    const params = skill.params || [];
    const sourceLevel = Math.min(10, params[0]?.length || skill.max_level || 1);
    const levelIndex = sourceLevel - 1;
    const description = String(skill.desc || skill.simple_desc || '').replace(/#(\d+)\[(?:i|f1|f2|f3|s)\](%?)/g, (token, index, percent) => {
      const value = params[Number(index) - 1]?.[levelIndex];
      if (value == null) return token;
      const rendered = percent ? Number(value) * 100 : Number(value);
      return `${Number(rendered.toFixed(2))}${percent}`;
    });
    return { id: String(skill.id), name: skill.name || label, label, description, level: sourceLevel, image: skill.icon ? (skill.icon.startsWith('http') ? skill.icon : `https://vizualabstract.github.io/StarRailStaticAPI/assets/${skill.icon}`) : '', variants: [code] };
  });
  if (game === 'gi') {
    const types = ['talent-na', 'talent-skill', 'talent-burst'];
    return (details?.skillTalents || []).map((skill, index) => {
      const label = skill.unlock || ['Normal Attack', 'Elemental Skill', 'Elemental Burst'][index] || 'Talent';
      const description = skill.description || '';
      const hasHold = /\bhold\b|press and hold|can be held|while holding|maintain(?:ed|ing)?|hold to|appui long|maintenir|maintenez|maintenue|maintenu/i.test(description);
      const variants = index === 0
        ? ['N', 'C', 'Pa']
        : index === 1 ? ['E', ...(hasHold ? ['hE'] : []) ]
          : index === 2 ? ['Q'] : [];
      const table = details?.talentValues?.[`combat${index + 1}`]?.attributes;
      const values = table?.labels?.length ? table.labels.map(line => formatTalentValue(line, table.parameters)).filter(Boolean) : (skill.values || []);
      return { id: `gi-${index}`, name: skill.name || 'Compétence', label, description, level: 10, values, image: skill.icon || `https://genshin.jmp.blue/characters/${encodeURIComponent(character._id)}/${types[index] || 'talent-skill'}`, fallbacks: skill.iconFallbacks || [], variants };
    });
  }
  const types = details?.skills || [];
  return types.map((skill, index) => {
    const label = skill.label || skill.name || 'Compétence';
    const description = skill.description || '';
    const hasHold = /\bhold\b|press and hold|can be held|while holding|maintain(?:ed|ing)?|hold to|appui long|maintenir|maintenez|maintenue|maintenu/i.test(description);
    const variants = /basic attack|attaque normale|attaque de base/i.test(label) ? ['N', 'C', 'Pa']
      : /resonance skill|compétence de résonance/i.test(label) ? ['E', ...(hasHold ? ['hE'] : []) ]
        : /resonance liberation/i.test(label) ? ['Q'] : /intro skill/i.test(label) ? ['I'] : /outro skill/i.test(label) ? ['O'] : ['F'];
    return { ...skill, id: skill.id || `ww-${index}`, label, description, image: skill.icon || '', variants };
  });
}

function formatTalentValue(line, parameters) {
  const [label, template = ''] = String(line).split('|');
  const formatted = template.replace(/\{(param\d+):([^}]+)\}/g, (_, key, format) => {
    const value = parameters?.[key]?.[9];
    if (value == null) return '—';
    const percent = format.includes('P');
    const decimals = Number((format.match(/F(\d)/) || [])[1] || 0);
    return `${(Number(value) * (percent ? 100 : 1)).toLocaleString('fr-FR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${percent ? '%' : ''}`;
  });
  return `${label.trim()} · ${formatted}`;
}

function sharpenWuwa(url) {
  return String(url).replaceAll('&amp;', '&')
    .replace(/\/_ipx\/q_\d+&s_\d+x\d+\//, '/_ipx/q_95&s_700x700/');
}

export function equipmentImage(game, item, category) {
  return imageSet(game, item, category)[0] || '';
}


