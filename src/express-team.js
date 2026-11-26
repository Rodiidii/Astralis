// Team bonuses are balanced for the Astralis tycoon, not game combat formulas.
const STARTERS={gi:['amber','kaeya','lisa','barbara'],hsr:['march7th','danheng','himeko','asta'],ww:['yangyang','chixia','baizhi','rover']};
export function teamState(s){
 const c=s.clicker??={};c.teams??={};c.energy??={};c.teamBursts??={};c.mediaMuted??=false;
 if(!Array.isArray(c.teams[s.world]))c.teams[s.world]=[s.characters.active,...s.characters.owned,...(STARTERS[s.world]||[])].filter((v,i,a)=>v&&a.indexOf(v)===i&&s.characters.owned.includes(v)).slice(0,4);
 const seen=new Set();c.teams[s.world]=Array.from({length:4},(_,i)=>{const k=c.teams[s.world][i];if(!k||seen.has(k)||!s.characters.owned.includes(k))return null;seen.add(k);return k});
 return c;
}
export const teamKeys=s=>teamState(s).teams[s.world];
export function setTeamSlot(s,slot,key){
 if(!Number.isInteger(slot)||slot<0||slot>3||key&&!s.characters.owned.includes(key))return false;
 const team=teamKeys(s),old=team[slot],other=team.indexOf(key);if(key&&other>=0&&other!==slot)team[other]=old;
 team[slot]=key||null;
 // Removing a teammate also removes their ongoing team support.
 const c=teamState(s);for(const k of Object.keys(c.teamBursts[s.world]||{}))if(!team.includes(k))delete c.teamBursts[s.world][k];
 if(!team.includes(s.characters.active)&&team.some(Boolean))s.characters.active=team.find(Boolean);
 return true;
}
export function chargeTeam(s){const c=teamState(s);for(const key of teamKeys(s))if(key)c.energy[`${s.world}:${key}`]=Math.min(100,(Number(c.energy[`${s.world}:${key}`])||0)+(key===s.characters.active?8:4));}
const SPECIAL={
 bennett:[.65,.10,0,'Cercle d’encouragement'],furina:[.35,.40,0,'Fanfare du salon'],nahida:[.25,.30,.05,'Sanctuaire des récoltes'],zhongli:[.25,.40,0,'Contrat de prospérité'],
 raiden:[.50,.15,.03,'Énergie de l’éternité'],raidenshogun:[.50,.15,.03,'Énergie de l’éternité'],venti:[.25,.35,.03,'Courant porteur'],kazuha:[.35,.25,.03,'Feuilles dans la brise'],
 phainon:[.80,.05,0,'Après l’impact'],barbara:[.15,.45,.02,'Chœur de l’équipe'],lisa:[.45,.20,.03,'Rose sous tension'],kaeya:[.35,.15,.08,'Valse de givre'],amber:[.55,.10,.02,'Pluie de récompenses'],
 ronova:[.65,.15,.02,'Ailes écarlates'],istaroth:[.25,.50,.03,'Temps suspendu'],naberius:[.15,.60,.02,'Croissance de la Vie'],asmoday:[.55,.25,0,'Espace verrouillé'],capitano:[.60,.15,.04,'Serment de givre'],dainsleif:[.60,.20,.03,'Sceau du rameau'],obsidian:[.40,.20,.08,'Pacte écarlate']
};
export function burstProfile(person,key){
 const el=String(person?.elementText||person?.element||person?.damageType||'').toLowerCase();
 const fallback=/fire|pyro|fusion/.test(el)?[.55,.10,.02,'Braises d’abondance']:/cryo|ice|glacio/.test(el)?[.30,.15,.08,'Récolte cristalline']:/hydro|water/.test(el)?[.25,.40,.02,'Marée généreuse']:/dendro/.test(el)?[.20,.50,.02,'Croissance accélérée']:/electro|électro|lightning/.test(el)?[.45,.20,.04,'Surtension productive']:/anemo|wind|aero|anémo/.test(el)?[.30,.35,.03,'Souffle de récolte']:/geo|géo/.test(el)?[.35,.35,.02,'Fondations prospères']:[.40,.25,.04,'Élan de l’équipe'];
 const [click,auto,crit,name]=SPECIAL[key]||SPECIAL[{kaedeharakazuha:'kazuha',genshinraidenshogun:'raidenshogun'}[key]]||fallback;return {click,auto,crit,name,duration:20,reward:12};
}
export function teamBonuses(s,now=Date.now()){
 const c=teamState(s),team=teamKeys(s),entries=Object.values(c.teamBursts[s.world]||{}).filter(x=>x.until>now&&team.includes(x.key));
 return {entries,click:entries.reduce((n,b)=>n+b.click,0),auto:entries.reduce((n,b)=>n+b.auto,0),crit:entries.reduce((n,b)=>n+b.crit,0)};
}
export function activateTeamBurst(s,key,person,now=Date.now()){
 const c=teamState(s),energyKey=`${s.world}:${key}`;
 if(!teamKeys(s).includes(key)||!s.characters.owned.includes(key)||(c.energy[energyKey]||0)<100)return null;
 const kit=burstProfile(person,key);c.energy[energyKey]=0;c.teamBursts[s.world]??={};
 const buff={...kit,key,person:person?._name||person?.name||person?.en||key,until:now+kit.duration*1000};c.teamBursts[s.world][key]=buff;
 return buff;
}
export const buffText=b=>`Clics +${Math.round(b.click*100)} % · production +${Math.round(b.auto*100)} % · chance dorée +${Math.round(b.crit*100)} pts`;
