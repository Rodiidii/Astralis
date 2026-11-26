export const FESTIVAL_PROGRAMS=[
 {id:'harvest',name:'La grande cueillette',text:'Chaque clic compte. Récolte +35 % et butin des combats +20 %.',cost:{flora:12,wood:6},effects:{click:1.35,loot:1.2}},
 {id:'workshop',name:'L’atelier en ébullition',text:'Pendant la fête, chaque recette fabrique deux fois plus de produits.',cost:{ore:14,wood:8},effects:{craft:2}},
 {id:'encore',name:'Le grand final',text:'Recharge +25 %, VIT +8 et taux CRIT +5 points pour ton équipe.',cost:{crystal:5,flora:10},effects:{energy:1.25,speed:8,crit:.05}}
];
const duration=120000,cooldown=300000;
const REGION_NAMES={mondstadt:['Fête des alizées','Les guirlandes s’élèvent. Le comptoir s’anime au rythme du vent.'],liyue:['Nuit des lanternes','Une lumière dorée accompagne les échanges du port.'],inazuma:['Festival des étincelles','Les échoppes s’illuminent et la fête se prolonge.'],sumeru:['Jardin des rêves','Les ateliers et les idées fleurissent sous les feuillages.'],fontaine:['Encore sous les projecteurs','Tout le comptoir devient la scène du prochain grand numéro.'],natlan:['Au rythme des flammes','Une cadence nouvelle emporte le camp dans la célébration.']};
const key=s=>String(s.world||'gi')+':'+String(s.place||'mondstadt');
export function festivalTheme(s){const pair=s.world==='hsr'?['Escale du grand voyage','L’équipage prépare une fête entre deux destinations.']:s.world==='ww'?['Rendez-vous des résonances','Les résonateurs accordent leurs forces autour du comptoir.']:(REGION_NAMES[s.place]||['Fête du voyage','Le comptoir célèbre cette étape du voyage.']);return {name:pair[0],text:pair[1]};}
export function festivalState(s){if(!s.industry||typeof s.industry!=='object')s.industry={};if(!s.industry.festivals||typeof s.industry.festivals!=='object')s.industry.festivals={};return s.industry.festivals[key(s)]||null;}
export function festivalEffects(s,now=Date.now()){const state=festivalState(s);if(!state||!Number.isFinite(state.start)||!Number.isFinite(state.end)||state.start>now||state.end<=now)return {};return FESTIVAL_PROGRAMS.find(p=>p.id===state.program)?.effects||{};}
export function activateFestival(s,stock,program,now=Date.now()){
 const choice=FESTIVAL_PROGRAMS.find(p=>p.id===program),previous=festivalState(s);
 if(!choice||!Number.isFinite(now)||previous&&Math.max(previous.end,previous.readyAt)>now)return false;
 if(Object.entries(choice.cost).some(([k,v])=>!Number.isFinite(stock?.[k])||stock[k]<v))return false;
 for(const [k,v]of Object.entries(choice.cost))stock[k]-=v;
 s.industry.festivals[key(s)]={program,start:now,end:now+duration,readyAt:now+cooldown};return true;
}
