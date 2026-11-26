const idOf=value=>String(value??'');

export function normalizeFarmCalendarFilters(value={}){
 return {character:idOf(value?.character),weapon:idOf(value?.weapon),material:idOf(value?.material)};
}

export function filterFarmCalendarRows(rows=[],filters={},characters=[],weapons=[]){
 const selected=normalizeFarmCalendarFilters(filters),roster=Array.isArray(characters)?characters:[],weaponRoster=Array.isArray(weapons)?weapons:[];
 return (Array.isArray(rows)?rows:[]).filter(row=>{
  if(selected.character){
   const ids=(row.characterIds||[row.characterId].filter(Boolean)).map(idOf);
   const character=roster.find(person=>idOf(person._id??person.id)===selected.character);
   const legacyName=idOf(row.character).trim().toLocaleLowerCase();
   if(!ids.includes(selected.character)&&(!character||legacyName!==idOf(character._name??character.name).trim().toLocaleLowerCase()))return false;
  }
  if(selected.weapon){
   const ids=(row.weaponIds||[row.weaponId].filter(Boolean)).map(idOf);
   const weapon=weaponRoster.find(item=>idOf(item._id??item.id)===selected.weapon);
   const legacyName=idOf(row.weapon).trim().toLocaleLowerCase();
   if(!ids.includes(selected.weapon)&&(!weapon||legacyName!==idOf(weapon._name??weapon.name).trim().toLocaleLowerCase()))return false;
  }
  if(selected.material&&!((row.materialIds||[]).map(idOf).includes(selected.material)))return false;
  return true;
 });
}

export function farmCalendarMaterialIds(rows=[],catalog=[]){
 const referenced=new Set((Array.isArray(rows)?rows:[]).flatMap(row=>(row.materialIds||[]).map(idOf)));
 return [...new Set([...referenced].filter(id=>catalog.some(item=>idOf(item.id??item._id)===id)))];
}
