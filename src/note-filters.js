const normalize=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('fr');

/** Sort notes predictably while keeping pinned notes ahead of the rest. */
export function sortNotes(notes=[],sort='recent'){
 const mode=['oldest','title','character'].includes(sort)?sort:'recent';
 const rows=Array.isArray(notes)?notes:[];
 return rows.map((note,index)=>({note,index})).sort((a,b)=>{
  const pin=Number(Boolean(b.note?.pinned))-Number(Boolean(a.note?.pinned));
  if(pin)return pin;
  let order=0;
  if(mode==='title')order=normalize(a.note?.title).localeCompare(normalize(b.note?.title),'fr');
  else if(mode==='character'){const aCharacter=normalize(a.note?.targetName),bCharacter=normalize(b.note?.targetName);order=(!aCharacter&&!bCharacter?0:!aCharacter?1:!bCharacter?-1:aCharacter.localeCompare(bCharacter,'fr'))||normalize(a.note?.title).localeCompare(normalize(b.note?.title),'fr');}
  else {const delta=(Number(b.note?.updated)||0)-(Number(a.note?.updated)||0);order=mode==='oldest'?-delta:delta;}
  return order||a.index-b.index;
 }).map(row=>row.note);
}

export function filterNotes(notes=[],{query='',tag='all',pinnedOnly=false}={}){
 const needle=normalize(query).trim();
 return (Array.isArray(notes)?notes:[]).filter(note=>{
  if(pinnedOnly&&!note?.pinned)return false;
  if(tag!=='all'&&(note?.tag||'NOTE')!==tag)return false;
  if(!needle)return true;
  return normalize([note?.title,note?.body,note?.tag,note?.targetName].filter(Boolean).join(' ')).includes(needle);
 });
}

export function noteLibrarySummary(notes=[],now=Date.now()){
 const rows=Array.isArray(notes)?notes:[],weekAgo=Number(now)-7*24*60*60*1000;
 return {
  total:rows.length,
  pinned:rows.filter(note=>!!note?.pinned).length,
  linked:rows.filter(note=>String(note?.targetName||'').trim()).length,
  updatedThisWeek:rows.filter(note=>{const updated=Number(note?.updated)||0;return updated>=weekAgo&&updated<=Number(now);}).length,
 };
}
