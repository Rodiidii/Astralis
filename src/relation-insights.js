const identity=row=>String(row?.id??[row?.from||'',row?.to||'',row?.title||'',row?.quote||''].join('|'));
export function summarizeRelationInsights(characters=[],evidence=[]){
 const people=new Map((characters||[]).map(person=>[String(person.id),person]));
 const incoming=new Map([...people.keys()].map(id=>[id,new Set()]));
 const outgoing=new Map([...people.keys()].map(id=>[id,new Set()]));
 const directions=new Map();
 const rows=Array.isArray(evidence)?evidence:[];
 for(const row of rows){
  const from=String(row?.from||''),to=String(row?.to||'');
  if(from===to||!people.has(from)||!people.has(to))continue;
  outgoing.get(from).add(to);incoming.get(to).add(from);
  const a=from<to?from:to,b=from<to?to:from,key=a+'|'+b;
  if(!directions.has(key))directions.set(key,{a,b,forward:new Set(),reverse:new Set()});
  const pair=directions.get(key),side=from===a?'forward':'reverse';
  pair[side].add(identity(row));
 }
 const ordered=map=>[...map].map(([id,others])=>({id,value:others.size,name:people.get(id)?.name||id})).sort((a,b)=>b.value-a.value||a.name.localeCompare(b.name));
 const reciprocal=[...directions.values()].map(pair=>({a:pair.a,b:pair.b,forward:pair.forward.size,reverse:pair.reverse.size,total:pair.forward.size+pair.reverse.size})).filter(pair=>pair.forward&&pair.reverse).sort((a,b)=>b.total-a.total||Math.min(b.forward,b.reverse)-Math.min(a.forward,a.reverse)||people.get(a.a).name.localeCompare(people.get(b.a).name));
 const isolated=[...people.values()].filter(person=>!incoming.get(String(person.id))?.size&&!outgoing.get(String(person.id))?.size).map(person=>({id:String(person.id),name:person.name,value:0})).sort((a,b)=>a.name.localeCompare(b.name));
 const cited=ordered(incoming),speakers=ordered(outgoing);
 return {people:people.size,evidenceCount:rows.filter(row=>people.has(String(row?.from||''))&&people.has(String(row?.to||''))).length,mostMentioned:cited.find(row=>row.value>0)||null,mostSpeaks:speakers.find(row=>row.value>0)||null,mostReciprocal:reciprocal[0]||null,isolated:isolated[0]||null,isolatedCount:isolated.length};
}
