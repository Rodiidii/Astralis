
export const RELATION_RANKS=['Aucun recoupement','Même groupe','Même scène','Ont parlé ensemble','Mentionné dans les répliques','Relation définie'];
export function relationRank(proofs=[]) {
 let rank=0;
 for(const p of proofs){
  if(!p.source||!p.id||!p.quote)continue;
  if(p.relationType&&p.explicitRelation===true)rank=Math.max(rank,5);
  else if(p.kind==='voice'&&p.scope!=='collective')rank=Math.max(rank,4);
  else if(p.directDialogue===true)rank=Math.max(rank,3);
  else if(p.kind==='story'&&(p.quest||p.sharedScene))rank=Math.max(rank,2);
  else if(p.scope==='collective'||p.explicitGroup===true)rank=Math.max(rank,1);
 }
 return {rank,label:RELATION_RANKS[rank],diamonds:'◆'.repeat(rank)+'◇'.repeat(5-rank)};
}
export function concentricRelations(people,edges,selected,radius=420) {
 const direct=new Map(edges.filter(e=>e.a===selected||e.b===selected).map(e=>[e.a===selected?e.b:e.a,relationRank(e.proofs).rank]));
 const points=[],rings=new Map();
 for(const c of people){if(c.id===selected){points.push({c,x:500,y:500,boundary:70});continue;}const rank=direct.get(c.id)||0;if(!rings.has(rank))rings.set(rank,[]);rings.get(rank).push(c);}
 for(const [rank,members]of rings){
  const r=rank===0?radius:Math.max(110,radius*(1-rank*.14));
  members.forEach((c,i)=>{const angle=-Math.PI/2+i*Math.PI*2/members.length;points.push({c,x:500+Math.cos(angle)*r,y:500+Math.sin(angle)*r,angle,ringRank:rank,ringRadius:r,boundary:Math.max(5,Math.PI*r/members.length-3),label:RELATION_RANKS[rank],start:i===0,startAngle:-Math.PI/2,endAngle:Math.PI*1.5,middleAngle:-Math.PI/2});});
 }
 return points;
}

/** Presentation filters never change the evidence available when opening a duo. */
export function sharedVoiceTargets(edges, a, b) {
 const targets = id => new Set(edges.flatMap(edge => edge.proofs
  .filter(proof => proof.kind === 'voice' && proof.scope !== 'collective' && proof.from === id)
  .map(proof => proof.to)));
 const left = targets(a), right = targets(b);
 return [...left].filter(id => right.has(id) && ![a,b,'10000005','paimon'].includes(id));
}

export function proofsForMode(proofs, mode) {
 if(mode==='voice')return proofs.filter(p=>p.kind==='voice'&&p.scope!=='collective');
 if(mode==='lore')return proofs.filter(p=>p.kind==='story');
 return proofs;
}
