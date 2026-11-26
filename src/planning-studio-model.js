import {todayISO,shiftDay,validDate} from './workspace-ui.js?v=20261124-studio-2';
import {foldCalendarLines} from './planner-schedule.js';
import {nextTaskDue,makeNextRecurringTask,recurringTaskExists} from './task-recurrence.js';
export const PLANNING_KEY='astralis:planning-studio:v1';
export const taskKey=t=>`${t.game}:${t.id}`;
export function normalizePlanningFilters(raw={}){return {view:['today','calendar','board','projects','review','archive'].includes(raw.view)?raw.view:'today',game:['all','gi','hsr','ww'].includes(raw.game)?raw.game:'all',project:typeof raw.project==='string'?raw.project.slice(0,100):'all',tag:typeof raw.tag==='string'?raw.tag.slice(0,35):'all',query:typeof raw.query==='string'?raw.query.slice(0,300):'',week:Math.max(-520,Math.min(520,Number(raw.week)||0)),calendar:raw.calendar==='month'?'month':'week',monthOffset:Math.max(-120,Math.min(120,Number(raw.monthOffset)||0))};}
export const taskMinutes=t=>Math.max(5,Math.min(1440,Math.round(Number(t.durationMinutes)||30)));
const minuteOf=value=>/^([01]\d|2[0-3]):[0-5]\d$/.test(value||'')?Number(value.slice(0,2))*60+Number(value.slice(3)):null;
const clockOf=minute=>`${String(Math.floor(minute/60)).padStart(2,'0')}:${String(minute%60).padStart(2,'0')}`;
export const priorityScore=t=>({Urgente:4,Haute:3,Normale:2,Basse:1,urgent:4,high:3,medium:2,normal:2,low:1}[t.priority]||Number(t.priority)||2);
function freeMinute(busy,earliest,duration,limit){let minute=earliest;for(const [start,end]of [...busy].sort((a,b)=>a[0]-b[0])){if(minute+duration<=start)break;if(minute<end&&minute+duration>start)minute=end;}return minute+duration<=limit?minute:null;}
export function defaultPlanning(){return {version:1,projects:[],views:[],capacity:[90,90,90,90,90,150,150],startTime:'18:00',activity:[],timer:null};}
export function normalizePlanning(raw={}){const d=defaultPlanning();return {...d,projects:(Array.isArray(raw.projects)?raw.projects:[]).filter(p=>p&&typeof p.id==='string'&&typeof p.name==='string').slice(0,200).map(p=>({...p,name:p.name.slice(0,100),budget:Math.max(0,Number(p.budget)||0),spent:Math.max(0,Number(p.spent)||0),color:/^#[\da-f]{6}$/i.test(p.color||'')?p.color:'#9eb5df'})),views:(Array.isArray(raw.views)?raw.views:[]).slice(0,30).filter(v=>v&&typeof v.name==='string').map(v=>({id:String(v.id||crypto.randomUUID()).slice(0,100),name:v.name.slice(0,60),filters:normalizePlanningFilters(v.filters||{})})),capacity:Array.from({length:7},(_,i)=>Math.max(0,Math.min(720,Number(raw.capacity?.[i]??d.capacity[i])))),startTime:/^\d{2}:\d{2}$/.test(raw.startTime||'')&&Number(raw.startTime.slice(0,2))<24&&Number(raw.startTime.slice(3))<60?raw.startTime:d.startTime,activity:(Array.isArray(raw.activity)?raw.activity:[]).filter(a=>a&&typeof a.label==='string'&&Number.isFinite(Number(a.at))).slice(-500),timer:raw.timer&&typeof raw.timer.task==='string'?raw.timer:null};}
export function dependencyState(task,tasks){const map=new Map(tasks.map(t=>[taskKey(t),t]));return (Array.isArray(task.dependencies)?task.dependencies:[]).map(k=>({key:k,task:map.get(k)})).filter(d=>!d.task?.done);}
export function wouldCycle(tasks,key,dependencies){const map=new Map(tasks.map(t=>[taskKey(t),t.dependencies||[]]));map.set(key,dependencies);const walk=(k,path)=>{if(path.has(k))return true;const p=new Set(path).add(k);return (map.get(k)||[]).some(next=>walk(next,p));};return walk(key,new Set());}
export function weekday(date){return (new Date(date+'T12:00:00').getDay()+6)%7;}
export function schedulePreview(tasks,config,{start=todayISO(),days=28,keys=null,includeDated=false,now=null}={}){
 if(!validDate(start))throw Error('Date de départ invalide.');
 const selected=new Set(keys||tasks.filter(t=>!t.done&&!t.archived&&t.scheduleMode!=='fixed'&&(includeDated||!t.due||t.due<start)).map(taskKey));
 const open=tasks.filter(t=>selected.has(taskKey(t))&&!t.done&&!t.archived&&t.scheduleMode!=='fixed');
 const dayStart=minuteOf(config.startTime)??1080,positions=new Map();
 const slots=Array.from({length:Math.max(1,Math.min(90,days))},(_,i)=>{const date=shiftDay(start,i),rows=tasks.filter(t=>!t.done&&!t.archived&&!selected.has(taskKey(t))&&t.due===date),busy=[];for(const t of rows.filter(t=>minuteOf(t.startTime)!==null)){const minute=minuteOf(t.startTime);busy.push([minute,minute+taskMinutes(t)]);positions.set(taskKey(t),minute);}for(const t of rows.filter(t=>minuteOf(t.startTime)===null)){const minute=freeMinute(busy,dayStart,taskMinutes(t),1440)??1440;busy.push([minute,minute+taskMinutes(t)]);positions.set(taskKey(t),minute);}return {date,capacity:Math.min(config.capacity[weekday(date)],1440-dayStart),load:rows.reduce((s,t)=>s+taskMinutes(t),0),busy};});
 const pending=[...open].sort((a,b)=>Number(a.scheduleMode==='optional')-Number(b.scheduleMode==='optional')||priorityScore(b)-priorityScore(a)||(a.deadline||a.due||'9999').localeCompare(b.deadline||b.due||'9999'));
 const planned=new Map(),unscheduled=[];let attempts=0;
 while(pending.length&&attempts++<=open.length+1){let progress=false;for(let i=0;i<pending.length;){const task=pending[i],deps=dependencyState(task,tasks);if(deps.some(d=>!d.task||(!d.task.done&&!planned.has(d.key)&&!validDate(d.task.due)))){i++;continue;}if(deps.some(d=>selected.has(d.key)&&!planned.has(d.key))){i++;continue;}
 const earliest=[task.startDate||start,...deps.map(d=>planned.get(d.key)?.due||d.task?.due||start)].sort().at(-1);let choice;
 for(const slot of slots){if(slot.date<earliest||slot.load+taskMinutes(task)>slot.capacity||(now&&slot.date<todayISO(now)))continue;const currentFloor=now&&slot.date===todayISO(now)?Math.ceil((now.getHours()*60+now.getMinutes())/5)*5:dayStart;const dependencyEnds=deps.filter(d=>(planned.get(d.key)?.due||d.task?.due)===slot.date).map(d=>{const parent=planned.get(d.key)||d.task;return (minuteOf(parent.startTime)??positions.get(d.key)??dayStart)+taskMinutes(parent);});const minute=freeMinute(slot.busy,Math.max(dayStart,currentFloor,...dependencyEnds),taskMinutes(task),dayStart+slot.capacity);if(minute!==null){choice={slot,minute};break;}}
 if(choice){const {slot,minute}=choice;planned.set(taskKey(task),{...task,due:slot.date,startTime:clockOf(minute),scheduleMode:'flexible',forecastLate:Boolean((task.deadline||task.due)&&slot.date>(task.deadline||task.due))});slot.load+=taskMinutes(task);slot.busy.push([minute,minute+taskMinutes(task)]);positions.set(taskKey(task),minute);}else unscheduled.push({task,reason:'Aucun créneau assez long dans cette période.'});pending.splice(i,1);progress=true;}if(!progress)break;}
 unscheduled.push(...pending.map(task=>({task,reason:'Dépendance absente, non planifiée ou cyclique.'})));return {changes:[...planned.values()],unscheduled,slots};
}
export function nextOccurrence(task){
 const recurrence=task.recurrence??task.repeat;if(!['daily','weekly','monthly'].includes(recurrence)||!validDate(task.due))return null;
 const recurrenceDay=Number(task.recurrenceDay)||Number(task.due.slice(-2)),due=nextTaskDue(task.due,recurrence,recurrenceDay),next=makeNextRecurringTask(task,due);
 return next?{...next,recurrence,repeat:recurrence,recurrenceDay,status:'todo',actualMinutes:0,recurrenceParent:taskKey(task),occurrenceCreated:false}:null;
}
export function completionChanges(task,tasks,now=Date.now()){
 if(dependencyState(task,tasks).length)throw Error('Termine les dépendances avant cet objectif.');
 const changes=[{...task,done:true,status:'done',completedAt:now}],candidate=nextOccurrence(task),next=candidate&&!recurringTaskExists(tasks.filter(t=>t.game===task.game),task,candidate.due)?candidate:null;if(next){changes[0].occurrenceCreated=true;changes.push(next);}return changes;
}
export function validateTaskImport(raw,existing=[]){if(raw?.format!=='astralis-planning-studio'||!Array.isArray(raw.tasks)||raw.tasks.length>2000)throw Error('Export du Planificateur invalide (2 000 tâches maximum).');const seen=new Set(existing.map(taskKey)),tasks=[];for(const row of raw.tasks){if(!row||!['gi','hsr','ww'].includes(row.game)||typeof row.id!=='string'||typeof row.title!=='string'||!row.title.trim())throw Error('Une tâche ne contient pas de jeu, identifiant ou titre valide.');if(row.due&&!validDate(row.due))throw Error('Une date de tâche est invalide.');if(seen.has(taskKey(row)))continue;seen.add(taskKey(row));tasks.push({...row,title:row.title.slice(0,180),durationMinutes:taskMinutes(row),dependencies:Array.isArray(row.dependencies)?row.dependencies.filter(k=>typeof k==='string').slice(0,50):[],steps:Array.isArray(row.steps)?row.steps.slice(0,100).map(s=>({id:String(s.id||crypto.randomUUID()),title:String(s.title||s.text||'').slice(0,200),done:!!s.done})):[]});}const combined=[...existing,...tasks];if(tasks.some(t=>wouldCycle(combined,taskKey(t),t.dependencies)))throw Error('Les dépendances importées forment une boucle.');return {tasks,config:normalizePlanning(raw.config)};}
function eventTimes(task){
 const day=task.due.replaceAll('-',''),minute=minuteOf(task.startTime);
 if(minute===null)return [`DTSTART;VALUE=DATE:${day}`,`DTEND;VALUE=DATE:${shiftDay(task.due,1).replaceAll('-','')}`];
 const endMinute=minute+taskMinutes(task),endDay=shiftDay(task.due,Math.floor(endMinute/1440)).replaceAll('-','');
 return [`DTSTART:${day}T${task.startTime.replace(':','')}00`,`DTEND:${endDay}T${clockOf(endMinute%1440).replace(':','')}00`];
}
export function planningICS(tasks){
 const esc=s=>String(s??'').replaceAll('\\','\\\\').replaceAll('\n','\\n').replaceAll(',','\\,').replaceAll(';','\\;');
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Astralis//Planning Studio//FR','CALSCALE:GREGORIAN',...tasks.filter(t=>validDate(t.due)&&!t.archived).flatMap(t=>['BEGIN:VEVENT',`UID:${esc(taskKey(t))}@astralis`,`DTSTAMP:${new Date().toISOString().replaceAll('-','').replaceAll(':','').replace(/\.\d{3}/,'')}`,...eventTimes(t),`SUMMARY:${esc(t.title)}`,`DESCRIPTION:${esc(t.notes||'')}`,`STATUS:${t.done?'CONFIRMED':'TENTATIVE'}`,'END:VEVENT']),'END:VCALENDAR',''];
 return foldCalendarLines(lines.join('\r\n'));
}
export const PLANNING_TEMPLATES=[
 {id:'build',name:'Préparer un build',tasks:[['Choisir l’équipe et son objectif',20],['Vérifier les armes et les sets',25],['Préparer les matériaux et le calendrier',30],['Tester une rotation',30],['Comparer le résultat au laboratoire',20]]},
 {id:'exploration',name:'Explorer une sous-région',tasks:[['Choisir une zone dans l’Atlas',10],['Préparer une équipe d’exploration',15],['Explorer et prendre des repères',60],['Mettre à jour le pourcentage',10]]},
 {id:'wishes',name:'Préparer un personnage',tasks:[['Évaluer les vœux disponibles',15],['Vérifier les échéances et les gains',20],['Préparer une équipe et son équipement',30],['Créer le plan de farm',25]]},
 {id:'weekly',name:'Routine hebdomadaire',tasks:[['Prévoir les récompenses hebdomadaires',15],['Faire une session de farm ciblée',30],['Revoir les objectifs et libérer la semaine',15]]},
];
