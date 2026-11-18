// Read the actual constellation descriptions: C3 is not always Skill +3.
const fold=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/<[^>]*>/g,'').toLowerCase().replace(/[^a-z0-9+]/g,' ').replace(/\b(?:a|de|du|des|la|le|les|d|l|et)\b/g,' ').replace(/\s+/g,' ').trim();
export function mergeKitSnapshot(details={},entry){
 if(!entry)return details;
 const talents=entry.talents;
 return {...details,error:false,talentValues:talents,_labConstellations:entry.constellations,
  skillTalents:[1,2,3].map((n,index)=>({...details.skillTalents?.[index],...talents['combat'+n]})),
  passives:[1,2,3,4].map(n=>talents['passive'+n]).filter(Boolean),
  constellations:[1,2,3,4,5,6].map(n=>entry.constellations['c'+n]).filter(Boolean),
  kitSources:entry.sources};
}
export function effectiveTalentLevel(details,index,baseLevel=10,constellation=0) {
 const skills=details?.talentValues||details?.talents||{};
 const skill=skills['combat'+(index+1)]||details?.skillTalents?.[index];
 const name=fold(skill?.name).trim();
 let increase=0;
 if(name){
  const cons=details?._labConstellations||details?.constellations||{};
  for(let c=1;c<=Math.min(6,Number(constellation)||0);c++){
   const row=cons['c'+c]||cons[c-1];
   const text=fold(row?.description||row?.descriptionRaw);
   // Require the complete talent name next to the upgrade, never infer C3/C5.
   const escaped=name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
   const match=text.match(new RegExp(escaped+'\\s*(?:level\\s*)?\\+\\s*(\\d+)'));
   if(match&&/niveau|level/.test(text))increase+=Number(match[1]);
  }
 }
 return Math.max(1,Math.min(15,(Number(baseLevel)||10)+increase));
}
