const read=(storage,key,fallback)=>{try{return JSON.parse(storage.getItem(key))??fallback}catch{return fallback}};

/** Add requested local examples once, preserving every existing record. */
export function installCombatExamples(storage,pack,catalogs){
 if(pack?.schema!==1||!pack.id||!Array.isArray(pack.builds)||!Array.isArray(pack.teams))throw Error('Exemples invalides.');
 const marker='astralis:combat-examples:'+pack.id;
 if(storage.getItem(marker))return {installed:false};
 const resolve=(category,value)=>{
  if(!value)return value;
  const item=(catalogs[category]||[]).find(row=>String(row.id)===String(value)||String(row._id)===String(value));
  if(!item)throw Error('Donnée de catalogue manquante : '+category+' '+value);
  return item._id;
 };
 const adapt=value=>{
  if(Array.isArray(value))return value.map(adapt);
  if(!value||typeof value!=='object')return value;
  return Object.fromEntries(Object.entries(value).map(([key,v])=>[key,['character','referenceCharacter'].includes(key)?resolve('character',v):['weapon','weaponOverride'].includes(key)?resolve('weapon',v):['set','setSecond','set2'].includes(key)?resolve('artifact',v):adapt(v)]));
 };
 const builds=adapt(pack.builds),teams=adapt(pack.teams),scenario=adapt(pack.scenario);
 const oldBuilds=read(storage,'astralis:gi:builds',[]),oldTeams=read(storage,'astralis:teams:gi',[]);
 if(!Array.isArray(oldBuilds)||!Array.isArray(oldTeams))throw Error('Sauvegarde existante illisible.');
 const additions=(rows,existing)=>rows.filter(row=>!existing.some(old=>old.id===row.id));
 const writes=[['astralis:gi:builds',JSON.stringify([...additions(builds,oldBuilds),...oldBuilds])],
  ['astralis:teams:gi',JSON.stringify([...additions(teams,oldTeams),...oldTeams])],
  ['astralis:gi:flins-example',JSON.stringify({scenario,observed:pack.observed})],
  [marker,'1']];
 const previous=writes.map(([key])=>[key,storage.getItem(key)]);
 try{for(const [key,value]of writes)storage.setItem(key,value);}catch(error){for(const [key,value]of previous){if(value==null)storage.removeItem(key);else storage.setItem(key,value);}throw error;}
 return {installed:true,builds:additions(builds,oldBuilds).length,teams:additions(teams,oldTeams).length,character:builds[0]?.character};
}

/** The request file lives in assets/user, excluded from releases and Git. */
export async function requestedCombatExamples({storage=localStorage,loadCatalog,fetcher=fetch}){
 const request=await fetcher('/assets/user/combat-examples-request.json',{cache:'no-store'});
 if(!request.ok)return {installed:false};
 const config=await request.json();
 if(config.pack!=='/data/flins-examples.json'||storage.getItem('astralis:combat-examples:'+config.id))return {installed:false};
 const [pack,character,weapon,artifact]=await Promise.all([fetcher(config.pack).then(r=>{if(!r.ok)throw Error('Exemples absents.');return r.json();}),...['character','weapon','artifact'].map(loadCatalog)]);
 if(pack.id!==config.id)throw Error('Version des exemples incohérente.');
 return installCombatExamples(storage,pack,{character,weapon,artifact});
}
