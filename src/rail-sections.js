const GROUPS=[['TON QUOTIDIEN',['dashboard','farming','endgame','events','wishes','planner','tasks','focus','energy']],['PERSONNAGES & ÉQUIPEMENT',['characters','weapons','sets','materials','teams','builds','lab','calc','optimizer','profile','hoyolab','tierlist']],['EXPLORER & APPRENDRE',['atlas','sheets','lore','relations','journey','media','skowt']],['UNE PAUSE EN TEYVAT',['assistant','daily-quiz','arcade','collection','boosters']],['TON ESPACE',['favorites','customize','changelog','data','feedback']]];
export function renderOrganizedRail(ids,{names,icon,active,badge=()=>''}){
 const unique=[...new Set([...ids,'feedback'])],used=new Set();
 const group=(label,rows)=>rows.length?`<div class="rail-label library-label">${label}</div><nav class="rail-nav">${rows.map(id=>{used.add(id);return `<button type="button" class="rail-link ${id===active?'active':''}" data-nav="${id}"${id===active?' aria-current="page"':''}><span>${icon(id)}</span>${names[id]||id}${badge(id)}</button>`}).join('')}</nav>`:'';
 return GROUPS.map(([label,allowed])=>group(label,unique.filter(id=>allowed.includes(id)))).join('')+group('AUTRES UNIVERS',unique.filter(id=>!used.has(id)));
}
