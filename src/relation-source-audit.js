const hostOf=value=>{try{return new URL(value).hostname.replace(/^www\./,'');}catch{return 'Source non précisée';}};

export function formatRelationCitation(row={},fromName='',toName=''){
 const quote=String(row?.quote||row?.reply||'').trim(),title=String(row?.title||row?.quest||'Référence relationnelle').trim();
 const direction=fromName&&toName?`${fromName} → ${toName}`:String(row?.id||'');
 const source=String(row?.source||'').trim(),language=String(row?.lang||'').toUpperCase();
 return [title,direction,language,quote,source].filter(Boolean).join(' — ');
}

export function summarizeRelationSources(rows=[]){
 const groups=new Map();
 for(const row of Array.isArray(rows)?rows:[]){
  const host=hostOf(row?.source),dataset=String(row?.dataset||'Corpus local'),key=host+'|'+dataset;
  let group=groups.get(key);
  if(!group){group={host,dataset,total:0,voice:0,story:0,languages:new Set(),urls:new Set()};groups.set(key,group);}
  group.total++;
  if(row?.kind==='voice')group.voice++;
  if(row?.kind==='story')group.story++;
  if(row?.lang)group.languages.add(String(row.lang).toUpperCase());
  if(row?.source)group.urls.add(String(row.source));
 }
 return [...groups.values()].map(group=>({...group,languages:[...group.languages].sort(),urls:[...group.urls].sort()}))
  .sort((a,b)=>b.total-a.total||a.host.localeCompare(b.host)||a.dataset.localeCompare(b.dataset));
}
