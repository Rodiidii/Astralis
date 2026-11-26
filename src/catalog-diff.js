const normalizeToken=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('fr').replace(/[^a-z0-9]+/g,'');

export function normalizeCatalogRarity(value){
 const text=String(value??'').trim().toUpperCase();if(!text)return null;
 const numeric=Number(text);if(Number.isFinite(numeric)&&numeric>0)return numeric;
 if(/(?:ORANGE|GOLD|LEGENDARY|5STAR)/.test(text))return 5;
 if(/(?:PURPLE|EPIC|4STAR)/.test(text))return 4;
 if(/(?:BLUE|RARE|3STAR)/.test(text))return 3;
 if(/(?:GREEN|UNCOMMON|2STAR)/.test(text))return 2;
 if(/(?:WHITE|COMMON|1STAR)/.test(text))return 1;
 return null;
}

/** Build a tolerant set of stable aliases for one catalog row.
 * Localized names and source IDs can change between providers; matching any
 * shared alias avoids reporting the whole catalog as newly added.
 */
export function catalogAliases(item){
 if(!item||typeof item!=='object')return [];
 const values=[
  ['id',item.id],['stable',item.setId],['stable',item.id],['stable',item._id],
  ['name',item.enName],['name',item.name],['name',item.frName],['name',item._name],
 ];
 return [...new Set(values.map(([kind,value])=>`${kind}:${normalizeToken(value)}`).filter(value=>value.split(':')[1]))];
}

function travelerElementVariantId(item){
 for(const value of [item?._id,item?.id]){const id=String(value??'').toUpperCase();if(/^(?:10000005|10000007)[_-](?:ANEMO|CRYO|DENDRO|ELECTRO|GEO|HYDRO|PYRO)$/.test(id))return id;}
 return '';
}
function travelerElementBase(item){return travelerElementVariantId(item).match(/^(10000005|10000007)/)?.[1]||'';}

export function matchCatalogRows(previous,next){
 const rows=Array.isArray(previous)?previous:[],byAlias=new Map(),primaryId=row=>normalizeToken(travelerElementVariantId(row)||(row?.id??row?.setId??''));
 for(const row of rows)for(const alias of catalogAliases(row)){const bucket=byAlias.get(alias)||[];bucket.push(row);byAlias.set(alias,bucket);}
 const matched=new Set();
 return (Array.isArray(next)?next:[]).map(row=>{
  const id=primaryId(row);
  let old=id?rows.find(candidate=>!matched.has(candidate)&&primaryId(candidate)===id):null;
   if(!old)old=catalogAliases(row).flatMap(alias=>byAlias.get(alias)||[]).find(candidate=>{
   if(matched.has(candidate))return false;
   const oldId=primaryId(candidate);
    const sharedNames=catalogAliases(row).filter(alias=>alias.startsWith('name:')&&catalogAliases(candidate).includes(alias));
    if(!sharedNames.length)return false;
    // Provider IDs can change between exports. Keep Traveler variants separate
    // when a source collapses their localized names to one generic label.
    const genericTraveler=sharedNames.some(alias=>/^name:(?:traveler|voyageur)$/.test(alias));
    return !(id&&oldId&&id!==oldId&&genericTraveler);
  })||null;
  if(old)matched.add(old);
  return {item:row,previous:old};
 });
}

function isTravelerElementForm(item){return !!travelerElementBase(item);}

export function catalogAdditions(previous,next){
 return matchCatalogRows(previous,next).filter(row=>!row.previous&&!isTravelerElementForm(row.item)).map(row=>row.item);
}

export function catalogValueChanges(previous,next,snapshot){
 const changes=[];
 for(const {item,previous:old} of matchCatalogRows(previous,next)){
  if(!old){if(isTravelerElementForm(item))continue;changes.push({type:'new',item,fields:[]});continue;}
  const before=snapshot(old),after=snapshot(item),fields=[];
  for(const key of new Set([...Object.keys(before),...Object.keys(after)])){
   // A newly populated field often means an old local export was incomplete,
   // not that the game changed its data. Only compare values present on both sides.
   if(before[key]===undefined||after[key]===undefined||before[key]===after[key])continue;
   fields.push({key,before:String(before[key]??'').slice(0,600),after:String(after[key]??'').slice(0,600),type:before[key]===undefined?'added':after[key]===undefined?'removed':'updated'});
  }
  if(fields.length)changes.push({type:'updated',item,previous:old,fields});
 }
 return changes;
}

export function mergeCatalogDiffRows(incoming,previous=[]){
 const keyOf=row=>`${row?.category||''}:${normalizeToken(row?.id||row?.name||'')}`;
 const rows=new Map();
 for(const row of Array.isArray(previous)?previous:[])if(keyOf(row)!==':')rows.set(keyOf(row),row);
 for(const row of Array.isArray(incoming)?incoming:[]){
  const key=keyOf(row);if(key===':')continue;
  const old=rows.get(key);
  if(old?.type==='new')continue;
  if(row.type==='updated'&&old?.type==='updated'){
   const fields=new Map((old.fields||[]).map(field=>[field.key,field]));
   for(const field of row.fields||[]){const first=fields.get(field.key);fields.set(field.key,{...field,before:first?.before??field.before});}
   const merged=[...fields.values()].filter(field=>field.before!==field.after);
   if(merged.length)rows.set(key,{...row,fields:merged});else rows.delete(key);
  }else rows.set(key,row);
 }
 return [...rows.values()].sort((a,b)=>Number(b.type==='new')-Number(a.type==='new')||(Number(b.at)||0)-(Number(a.at)||0)).slice(0,250);
}

export function catalogFieldSnapshot(item,category){
 const take=(label,...keys)=>{for(const key of keys)if(item?.[key]!=null&&item[key]!=='')return [label,item[key]];return null;};
 // The Traveler's element is a player-selected form in live providers, so it
 // can flip between requests without any source data having changed.
 const traveler=category==='character'&&[item?._id,item?.id,item?._name,item?.name,item?.enName].some(value=>/^(?:voyageur|voyageuse|traveler|traveller|aether|lumine)(?:anemo|geo|electro|dendro|hydro|pyro|cryo)?$|^1000000[57]$/.test(normalizeToken(value||'')));
 const common=[traveler?null:take('Élément','elementText','element','vision'),take('Type','weaponText','weaponType'),take('Région','region','nation'),take('Statistique secondaire','substatText','substatType','mainStatType')].filter(Boolean);
 if(category==='character'){
  common.push(...[['Niveau de base','baseStats'],['Élévation','ascensionStats','ascensionStat'],['Talents','skillTalents'],['Passifs','passives'],['Constellations','constellations']].map(([label,...keys])=>take(label,...keys)).filter(Boolean));
 }else if(category==='weapon'){
  common.push(...[['ATQ de base','baseAttack','baseAtk','attack'],['Élévation','ascensionStats'],['Statistiques par niveau','statsAtMilestones','stats'],['Description','weaponDesc','description']].map(([label,...keys])=>take(label,...keys)).filter(Boolean));
  const passiveName=item?.passive?.name||item?.passiveName||item?.effectName;
  if(passiveName)common.push(['Nom du passif',passiveName]);
  // The bundled export stores text in r1..r5; Lunaris stores the same text
  // in passive.refinements["1".."5"]. Compare one canonical path so merely
  // changing provider shape never floods the journal with false updates.
  for(let rank=1;rank<=5;rank++){
   const refinement=item?.passive?.refinements?.[String(rank)]||item?.passive?.refinements?.[`r${rank}`]||item?.refinements?.[String(rank)]||item?.refinements?.[`r${rank}`]||item?.[`r${rank}`];
   const description=refinement?.description||refinement?.desc;
   if(description)common.push([`Passif · R${rank}`,description]);
  }
 }else if(category==='artifact'){
  common.push(...[['Bonus 2 pièces','twoPieceBonus','effect2Pc','effect2'],['Bonus 4 pièces','fourPieceBonus','effect4Pc','effect4']].map(([label,...keys])=>take(label,...keys)).filter(Boolean));
 }
 const out={};for(const [label,value] of common)flattenValue(label,value,out);return out;
}

function flattenValue(path,value,out){
 if(value==null)return '';
 if(Array.isArray(value)){value.forEach((part,index)=>flattenValue(`${path} · ${index+1}`,part,out));return;}
 if(typeof value==='object'){
  const ignored=/^(?:icon|image|images|url|source|id|filename|updatedAt|version)$/i;
  for(const key of Object.keys(value).sort())if(!ignored.test(key))flattenValue(`${path} › ${key}`,value[key],out);
  return;
 }
  const text=String(value).replace(/\\n/g,' ').replace(/<br\s*\/?>/gi,' ').replace(/<\/?[a-z][^>]*>/gi,' ').replace(/&nbsp;|\{NON_BREAK_SPACE\}/gi,' ').replace(/&amp;/gi,'&').replace(/&lt;/gi,'<').replace(/&gt;/gi,'>').replace(/&quot;/gi,'"').replace(/&#39;|&#x27;/gi,"'").replace(/\{M#([^}]*)\}\{F#([^}]*)\}/g,'$1').replace(/PlayStation(?:™Network|®|™)?/gi,'PlayStation').replace(/^#(?=\S)/,'').replace(/\s+%/g,'%').replace(/[\u00a0\s]+/g,' ').trim();if(text)out[path]=text;
}
