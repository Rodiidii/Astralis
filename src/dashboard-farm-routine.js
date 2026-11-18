const asId=value=>String(value??'').trim();
const dateKey=value=>String(value??'').slice(0,10);

/** Select the next planned farm day and expand shared sessions into character checkboxes. */
export function buildFarmRoutine(rows=[],people=[],today=new Date().toLocaleDateString('sv-SE')){
 const source=Array.isArray(rows)?rows:[],roster=Array.isArray(people)?people:[];
 const candidates=source.filter(row=>!dateKey(row?.date)||dateKey(row.date)>=today);
 const dated=candidates.map(row=>dateKey(row.date)).filter(Boolean).sort();
 const openDates=candidates.filter(row=>!row?.done).map(row=>dateKey(row.date)).filter(Boolean).sort();
 const date=openDates[0]||dated[0]||'';
 const dayRows=candidates.filter(row=>date?dateKey(row.date)===date:!dateKey(row.date));
 const findPerson=id=>roster.find(person=>[person?.id,person?.sourceId,person?._id].some(value=>asId(value)===asId(id)));
 const steps=dayRows.flatMap(row=>{
  const farmId=asId(row.id);
  if(!farmId)return [];
  const characterIds=[...new Set((Array.isArray(row.characterIds)?row.characterIds:[row.characterId].filter(Boolean)).map(asId).filter(Boolean))];
  const finished=new Set(Array.isArray(row.doneCharacters)?row.doneCharacters.map(asId):[]);
  const targets=characterIds.length?characterIds.map(id=>({id,person:findPerson(id)})):[{id:'',person:null}];
  const title=String(row.title||row.label||row.category||row.materialName||'Session de farm').trim();
  return targets.map(({id,person})=>({
   id:`${farmId}:${id||'session'}`,farmId,characterId:id,
   characterName:person?.name||person?._name||String(row.characterName||''),
   characterImage:person?.image||person?.portrait||'',
   label:title,done:!!row.done||finished.has(id),
  }));
 });
 return {date,steps,sourceCount:dayRows.length,completed:steps.filter(step=>step.done).length,total:steps.length};
}
