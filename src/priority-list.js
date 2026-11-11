const ORDER_KEY='astralis:gi:optimizer-priority:v2',CONFIG_KEY='astralis:gi:optimizer-priority-config:v1';
const safeRead=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback));}catch{return fallback;}};
const read=()=>{const rows=safeRead(ORDER_KEY,[]);return Array.isArray(rows)?rows:[];};
const configs=()=>{const value=safeRead(CONFIG_KEY,{});return value&&typeof value==='object'&&!Array.isArray(value)?value:{};};
export const getCharacterPriority=()=>read();
export function setCharacterPriority(ids){const unique=[...new Set((ids||[]).map(String).filter(Boolean))];localStorage.setItem(ORDER_KEY,JSON.stringify(unique));return unique;}
export function movePriority(id,delta){const rows=read(),index=rows.indexOf(String(id));if(index<0)return rows;const next=Math.max(0,Math.min(rows.length-1,index+delta));rows.splice(next,0,rows.splice(index,1)[0]);return setCharacterPriority(rows);}
export function positionPriority(id,position,characters=[]){const rows=[...new Set([...read(),...characters.map(String)])],key=String(id),index=rows.indexOf(key);if(index<0)return rows;rows.splice(index,1);rows.splice(Math.max(0,Math.min(rows.length,Math.floor(Number(position)||1)-1)),0,key);return setCharacterPriority(rows);}
export function reorderPriority(fromId,toId){const rows=read(),from=rows.indexOf(String(fromId)),to=rows.indexOf(String(toId));if(from<0||to<0)return rows;rows.splice(to,0,rows.splice(from,1)[0]);return setCharacterPriority(rows);}
export function getPriorityConfig(characterId){return configs()[String(characterId)]||{locked:false,lockedIds:[],excludedIds:[],ignorePriority:false,rotation:[]};}
export function setPriorityConfig(characterId,patch){const all=configs(),id=String(characterId);all[id]={...getPriorityConfig(id),...patch};localStorage.setItem(CONFIG_KEY,JSON.stringify(all));return all[id];}
export function priorityArtifactPool(inventory,characterId,options={}){
  if(!options.enabled)return inventory;const id=String(characterId),config=getPriorityConfig(id);if(config.ignorePriority)return inventory;
  const list=read(),rank=list.indexOf(id);if(rank<0)return inventory;const protectedIds=new Set(list.slice(0,rank));
  const chars=new Map((options.characters||[]).map(c=>[String(c._id),String(c._name||'').toLocaleLowerCase('fr')]));
  const protectedNames=new Set([...protectedIds].map(pid=>chars.get(pid)).filter(Boolean));
  const excluded=new Set((config.excludedIds||[]).map(String)),locked=new Set((config.lockedIds||[]).map(String));
  return inventory.filter(piece=>{const pieceId=String(piece.id);if(excluded.has(pieceId))return false;if(locked.has(pieceId))return true;const owner=String(piece.location||'');if(owner){if(protectedIds.has(owner)||protectedNames.has(owner.toLocaleLowerCase('fr')))return false;return true;}if(piece.locked)return false;return true;});
}
export function artifactImpact(targetBuildId,inventory){const builds=safeRead('astralis:gi:builds',[]),build=builds.find(row=>String(row.id)===String(targetBuildId));if(!build)return {build:null,pieces:[]};const used=new Set((build.pieces||[]).map(piece=>String(piece.ownedArtifactId||'')).filter(Boolean));return {build,pieces:inventory.filter(piece=>used.has(String(piece.id)))};}
