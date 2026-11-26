import {nextMonthlyReset,serverTimestamp} from './home-command-model.js';
const idsOf=row=>[...(row.characterIds||[]),row.characterId,row.character,row.ownerId,row.targetId].filter(Boolean).map(String);
export function projectPeople(c={},tracked=[]){
 const active=new Set([...(c.farmProjects||[]).map(r=>String(r.id)),...(c.farmRows||[]).filter(r=>!r.done).flatMap(idsOf),...tracked.map(String)]);
 return (c.people||[]).filter(p=>active.has(String(p.id))||active.has(String(p.sourceId))).map(person=>({...person,project:(c.farmProjects||[]).find(p=>String(p.id)===String(person.id))||{},builds:(c.builds||[]).filter(b=>[person.id,person.sourceId].map(String).includes(String(b.character))),sessions:(c.farmRows||[]).filter(r=>idsOf(r).some(id=>[person.id,person.sourceId].map(String).includes(id)))}));
}
export {serverTimestamp} from './home-command-model.js';
export function endgamePreparation(data={},kind='abyss',now=new Date(),server='europe'){
 const rows=(data.archive?.rotations||[]).filter(r=>r.kind===kind&&r.published&&serverTimestamp(r.start,server)>+now&&(r.floors?.length||r.bosses?.length)).sort((a,b)=>serverTimestamp(a.start,server)-serverTimestamp(b.start,server));
 const upcoming=rows[0],window=data.windows?.[kind]||{},current=kind==='abyss'?{floors:data.floors||[],blessing:data.blessing}:data[kind]||{},currentActive=serverTimestamp(window.end,server)>+now;
 const next=upcoming?.start||(kind==='abyss'?nextMonthlyReset(16,now,server):kind==='theater'?nextMonthlyReset(1,now,server):'');
 const content=upcoming||(currentActive?current:{}),bosses=kind==='abyss'?(content.floors||[]).filter(f=>Number(f.floor)===12).flatMap(f=>(f.chambers||[]).flatMap(ch=>(ch.halves||[]).map((half,i)=>({name:(ch.name||'Salle')+' · '+(i===0?'1re':'2e')+' moitié',enemies:half.enemies||[]})))):content.bosses||[];
 return {kind,upcoming:!!upcoming,currentActive,next,content,bosses,hasContent:bosses.length>0||content.opening?.length>0,source:upcoming?.source||({abyss:'https://genshinflex.com/en/abyss/',theater:'https://genshinflex.com/en/theater/history/',onslaught:'https://genshinflex.com/en/onslaught/'})[kind],updatedAt:data.updatedAt||''};
}
export function dayResinBudget(rows=[],day,available=null){const planned=rows.filter(r=>r.date===day&&!r.done).reduce((sum,r)=>sum+Math.max(0,Number(r.resin)||0),0);return {planned,available:available==null?null:Math.max(0,Number(available)||0),missing:available==null?null:Math.max(0,planned-available),runs20:Math.ceil(planned/20)};}
export function preparationChecklist(tasks=[],day){return tasks.filter(t=>!t.done).sort((a,b)=>String(a.due||'9999').localeCompare(String(b.due||'9999'))).map(t=>({...t,late:!!t.due&&t.due<day,steps:(t.steps||[]).filter(s=>s&&s.id),completedSteps:(t.steps||[]).filter(s=>s.done).length}));}
const escapeICS=v=>String(v||'').replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
export function programmeICS(rows=[],deadlines=[],now=new Date()){
 const date=now.toISOString().replace(/[-:]/g,'').replace(/\.\d+Z$/,'Z'),events=[];
 for(const [i,r]of rows.entries()){if(!/^\d{4}-\d{2}-\d{2}$/.test(r.date)||r.done)continue;const next=new Date(r.date+'T12:00:00Z');next.setUTCDate(next.getUTCDate()+1);events.push(`BEGIN:VEVENT\r\nUID:${escapeICS(r.id||'farm-'+i)}@astralis\r\nDTSTAMP:${date}\r\nDTSTART;VALUE=DATE:${r.date.replaceAll('-','')}\r\nDTEND;VALUE=DATE:${next.toISOString().slice(0,10).replaceAll('-','')}\r\nSUMMARY:${escapeICS(r.title||r.category||'Farm Genshin')}\r\nDESCRIPTION:${escapeICS((r.materialName||'')+' · '+(r.resin||0)+' résines')}\r\nEND:VEVENT`)}
 for(const r of deadlines){if(!r.end||!Number.isFinite(Date.parse(r.end)))continue;const stamp=new Date(r.end).toISOString().replace(/[-:]/g,'').replace(/\.\d+Z$/,'Z');events.push(`BEGIN:VEVENT\r\nUID:${r.kind}-${stamp}@astralis\r\nDTSTAMP:${date}\r\nDTSTART:${stamp}\r\nSUMMARY:${escapeICS('Reset · '+r.title)}\r\nEND:VEVENT`)}
 return foldICS('BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Astralis//Programme//FR\r\nCALSCALE:GREGORIAN\r\n'+events.join('\r\n')+'\r\nEND:VCALENDAR\r\n');
}

function foldICS(text){return text.split('\r\n').map(line=>{let out='',part='',bytes=0;for(const c of line){const size=new TextEncoder().encode(c).length;if(bytes+size>75){out+=part+'\r\n ';part='';bytes=1;}part+=c;bytes+=size;}return out+part;}).join('\r\n');}
