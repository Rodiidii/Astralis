import {setEffectOptions} from './lab-config.js';
const fold=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/gi,'').toLowerCase();
export function recommendedLabSets(character,sets,guides={},aliases={},baseStat='atk'){
 const names=(kind,item)=>[item?._name,item?.name,item?._id,...(aliases[kind]||[]).filter(row=>String(row.id)===String(item?.id)).flatMap(row=>[...(row.fr||[]),...(row.en||[])])].map(fold);
 const characterNames=names('characters',character),listed=(guides.characters||[]).filter(row=>characterNames.includes(fold(row.name))).flatMap(row=>row.sets||[]).map(fold);
 const recommended=sets.filter(set=>names('artifacts',set).some(name=>listed.includes(name)));
 const element=({'électro':'electro','anémo':'anemo','géo':'geo'})[String(character?.elementText).toLowerCase()]||String(character?.elementText||'').toLowerCase();
 const stat=({10000089:'hp',10000063:'atk',10000112:'atk',10000064:'def',10000041:'er'})[character?.id]||baseStat;
 const useful=new Set([stat,stat+'Pct',element+'Dmg',...(stat==='er'?['er']:['critRate','critDmg'])]);
 const alternatives=sets.filter(set=>!recommended.includes(set)&&setEffectOptions(set).two.some(option=>Object.keys(option.bonuses).some(key=>useful.has(key))));
 return {recommended,alternatives};
}
