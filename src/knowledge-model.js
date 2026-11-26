export const KNOWLEDGE_KEY='astralis:knowledge:v1';
export const cleanText=v=>String(v??'').replace(/\r\n/g,'\n').trim();
export const documentId=title=>{let h=2166136261;for(const c of cleanText(title))h=Math.imul(h^c.charCodeAt(0),16777619);return 'doc-'+(h>>>0);};
export function knowledgeState(value={}){return {version:1,sessions:Array.isArray(value.sessions)?value.sessions.slice(-200):[],session:value.session||null,documents:value.documents&&typeof value.documents==='object'&&!Array.isArray(value.documents)?value.documents:{},collections:Array.isArray(value.collections)?value.collections.slice(0,100):[],timeline:Array.isArray(value.timeline)?value.timeline.slice(0,500):[],glossary:Array.isArray(value.glossary)?value.glossary.slice(0,300):[],boards:Array.isArray(value.boards)?value.boards.slice(0,100):[],history:Array.isArray(value.history)?value.history.slice(-100):[],preferences:{size:16,line:1.9,width:760,font:'sans',tone:'theme',goal:15,...value.preferences}};}
export function upsertDocument(state,doc){const next=structuredClone(knowledgeState(state)),id=doc.id||documentId(doc.title),old=next.documents[id]||{};next.documents[id]={notes:[],highlights:[],questions:[],facts:[],snapshots:[],queue:false,read:false,position:0,...old,...doc,id,text:String(doc.text??old.text??'').slice(0,30000),visited:Date.now()};if(old.sources&&doc.sources){const map=new Map(old.sources.map(x=>[x.url,x]));for(const row of doc.sources)map.set(row.url,{...row,...map.get(row.url)});next.documents[id].sources=[...map.values()];}next.history=[...next.history.filter(x=>x.id!==id),{id,at:Date.now()}].slice(-100);return next;}
export function diffLines(before='',after=''){const a=new Set(before.split('\n').map(cleanText).filter(Boolean)),b=new Set(after.split('\n').map(cleanText).filter(Boolean));return {added:[...b].filter(x=>!a.has(x)),removed:[...a].filter(x=>!b.has(x)),unchanged:[...b].filter(x=>a.has(x)).length};}
export function readingDays(state){const days=new Set(state.history.map(x=>new Date(x.at).toLocaleDateString('sv-SE')));let streak=0;const d=new Date();for(let i=0;i<365;i++){if(days.has(d.toLocaleDateString('sv-SE')))streak++;else if(i>0||!days.has(new Date(Date.now()-86400000).toLocaleDateString('sv-SE')))break;d.setDate(d.getDate()-1);}return {days:days.size,streak};}
export function validateKnowledgeImport(text) {
 if(typeof text!=='string'||text.length>2500000)throw Error('Sauvegarde limitée à 2,5 Mo.');
 const data=JSON.parse(text),record=v=>v&&typeof v==='object'&&!Array.isArray(v),safeId=v=>typeof v==='string'&&/^[a-zA-Z0-9_-]{1,120}$/.test(v);
 if(data?.version!==1||!record(data.documents))throw Error('Sauvegarde de carnet Astralis attendue.');
 const out=knowledgeState(data);
 const rows=(value,fields=[])=>Array.isArray(value)&&value.every(row=>record(row)&&safeId(row.id)&&fields.every(k=>typeof row[k]==='string'));
 for(const [id,doc]of Object.entries(out.documents)) {
  if(!/^doc-\d+$/.test(id)||!record(doc)||typeof doc.title!=='string'||typeof doc.text!=='string'||doc.text.length>30000)throw Error('Document invalide.');
  for(const key of ['notes','highlights','questions','facts','snapshots']) {
   doc[key]??=[];
   if(!rows(doc[key],['text']))throw Error('Contenu de carnet invalide.');
  }
  doc.sources??=[];
  if(!Array.isArray(doc.sources)||doc.sources.some(s=>!record(s)||typeof s.url!=='string'))throw Error('Référence invalide.');
  doc.id=id;
 }
 for(const [key,fields]of [['collections',['name']],['timeline',['period','text']],['glossary',['term','definition']],['boards',['title','text']]]) {
  if(!rows(out[key],fields))throw Error('Collection de carnet invalide.');
 }
 return out;
}
export function mergeKnowledge(current,incoming){const out=structuredClone(knowledgeState(current));for(const[id,doc]of Object.entries(incoming.documents)){const old=out.documents[id];out.documents[id]=old?{...doc,...old,notes:[...(old.notes||[]),...(doc.notes||[]).filter(n=>!(old.notes||[]).some(o=>o.id===n.id))],highlights:[...(old.highlights||[]),...(doc.highlights||[]).filter(n=>!(old.highlights||[]).some(o=>o.id===n.id))]}:doc;}for(const key of ['collections','timeline','glossary','boards'])out[key]=[...out[key],...incoming[key].filter(n=>!out[key].some(o=>o.id===n.id))];return out;}
export function knowledgeMarkdown(doc){return '# '+doc.title+'\n\n'+(doc.source||'')+'\n\n'+doc.text+'\n\n## Notes personnelles\n'+(doc.notes||[]).map(n=>'- '+n.text).join('\n')+'\n\n## Passages conservés\n'+(doc.highlights||[]).map(n=>'> '+n.text+'\n\n'+(n.note||'')).join('\n\n')+'\n\n## Questions\n'+(doc.questions||[]).map(n=>'- '+n.text+'\n  '+(n.answer||'Sans réponse')).join('\n');}
export function pathBetween(edges,a,b){if(a===b)return [a];const q=[[a]],seen=new Set([a]);for(let i=0;i<q.length;i++){const path=q[i],last=path.at(-1);for(const e of edges){const next=String(e.a)===last?String(e.b):String(e.b)===last?String(e.a):null;if(!next||seen.has(next))continue;if(next===b)return [...path,next];seen.add(next);q.push([...path,next]);}}return [];}

export function knowledgeGraphSummary(edges=[]) {
 const pairs=new Map(),nodes=new Set();let proofs=0;
 for(const edge of edges){const a=String(edge.a),b=String(edge.b),key=[a,b].sort().join(':');nodes.add(a);nodes.add(b);if(!pairs.has(key))pairs.set(key,new Set());const directions=pairs.get(key);
  if(edge.proofs?.length){proofs+=edge.proofs.length;for(const p of edge.proofs){if((String(p.from)===a&&String(p.to)===b)||(String(p.from)===b&&String(p.to)===a))directions.add(String(p.from)+':'+String(p.to));}}
  else directions.add(a+':'+b);
 }
 return {nodes:nodes.size,pairs:pairs.size,proofs,reciprocal:[...pairs.values()].filter(d=>d.size>=2).length};
}
