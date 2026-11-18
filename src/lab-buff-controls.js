import {furinaFanfare} from './complex-effects.js';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const choices={hydroCryoCount:[0,1,2,3,4],deathStacks:[0,1,2,3],voidRifts:[0,1,2,3],serpentExtra:Array.from({length:23},(_,i)=>i),talentLevel:Array.from({length:13},(_,i)=>i+1),burstLevel:Array.from({length:15},(_,i)=>i+1)};
const hints={fanfare:'Points de Fanfare réellement accumulés pendant le déchaînement.',excess:'À C2, uniquement après avoir atteint le plafond de Fanfare. Ce bonus de PV bénéficie seulement à Furina.',sevenPhase:'Coche cette condition pendant la posture de la compétence.',deathStacks:'Choisis le nombre de cumuls réellement obtenus avant le coup.',voidRifts:'Nombre de failles absorbées lors du déchaînement spécial.',hpChangePercent:'Somme des variations de PV de toute l’équipe. Le laboratoire calcule la Fanfare et son plafond.',atk:'Valeur finale du personnage qui fournit le bonus, au moment de son lancement.',def:'DÉF finale du personnage qui fournit le bonus.',startedAt:'Seconde de déclenchement dans la rotation. Le buff expire selon sa durée.',serpentExtra:'Serpentine au-delà du coût de 50. Le plafond dépend de la constellation.'};
export function buffFieldOptions(scope,key,config={}){
 if(key==='serpentExtra')return choices[key].filter(value=>value<=(Number(config.constellation)>=2?22:12));
 return choices[key]||null;
}
export function renderCharacterBuffFields(scope,fields,config={},options={}){
 return fields.filter(([key])=>(!(scope==='escoffier'&&key==='atk')||Number(config.constellation)>=2)&&key!=='constellation'&&!/(?:At|startedAt)$/.test(key)&&key!=='freezeExtension'&&(key!=='excess'||Number(config.constellation)>=2)).map(([key,originalLabel,def])=>{
  let label=originalLabel;
  const attrs=' data-lab-character-buff="'+esc(scope)+'" data-buff-key="'+esc(key)+'"';
  const checked=key==='hold'?config.cast==='hold':key==='passive2'?config[key]!==false:!!config[key];
  const options=buffFieldOptions(scope,key,config);
  if(scope==='furina'&&key==='fanfare')label='Nombre de points de Fanfare';
  if(scope==='furina'&&key==='excess')label='Points excédentaires de Fanfare · C2';
  let value=config[key]??def;
  // Never replace a previously saved value with the browser's first option.
  const values=options&&!options.includes(Number(value))?[...options,Number(value)].sort((a,b)=>a-b):options;
  const input=def==='checkbox'?'<input type="checkbox"'+attrs+(checked?' checked':'')+'>':values?'<select'+attrs+'>'+values.map(option=>'<option value="'+option+'" '+(Number(value)===option?'selected':'')+'>'+(key==='hydroCryoCount'?(option===0?'Automatique selon l’équipe':option+' Hydro/Cryo : −'+[0,5,10,15,55][option]+' % RÉS Hydro et Cryo'):option)+(key==='deathStacks'?' cumul'+(option>1?'s':''):key==='voidRifts'?' faille'+(option>1?'s':''):'')+'</option>').join('')+'</select>':'<input type="number" min="0" '+(scope==='furina'&&key==='fanfare'?'max="'+furinaFanfare(config).cap+'" ':scope==='furina'&&key==='excess'?'max="400" ':'')+'step="any"'+(scope==='furina'&&key==='excess'&&Number(config.fanfare||0)<furinaFanfare(config).cap?' disabled':'')+attrs+' value="'+esc(value)+'">';
  return '<label class="lab-buff-setting '+(def==='checkbox'?'is-checkbox':'')+'">'+(def==='checkbox'?input:'')+'<span>'+esc(label)+(hints[key]?'<small>'+esc(hints[key])+'</small>':'')+'</span>'+(def==='checkbox'?'':input)+'</label>';
 }).join('');
}

export function nativeBuffGroups(scope){
 const group=(kind,index,keys,primary=false)=>({kind,index,keys,primary});
 const map={
  skirk:[group('talent',1,['sevenPhase'],true),group('passive',1,['deathStacks','deathStacksAt']),group('talent',2,['afterSpecialBurst','voidRifts','specialBurstAt','serpentExtra','burstLevel'])],
  furina:[group('talent',2,['talentLevel','fanfare','excess'],true)],
  mona:[group('talent',2,['talentLevel','freezeExtension','startedAt'],true)],
  escoffier:[group('passive',1,['hydroCryoCount','atk','startedAt'],true)],
  yunjin:[group('talent',2,['talentLevel','def','startedAt'],true),group('passive',1,['passive2'])],
  shenhe:[group('talent',1,['talentLevel','atk','hold','startedAt'],true),group('talent',2,['burst','insideField','burstLevel','burstStartedAt'])]
 };
 return map[scope]||[];
}
export function complexConfigForSimulation(p){
 const config=structuredClone(p.complexEffects||{});
 for(const [scope,effect]of Object.entries(config)){
  if(!effect||typeof effect!=='object')continue;
  if(effect.primaryEnabled!==undefined){
   const primary=!!effect.primaryEnabled;
   if(scope==='skirk'){
    const a4=!!effect.enable_passive_1,burst=!!effect.enable_talent_2;
    effect.enabled=primary||a4||burst;
    if(!primary)effect.sevenPhase=false;
    if(!a4)effect.deathStacks=0;
    if(!burst){effect.afterSpecialBurst=false;effect.serpentExtra=0;}
   }else if(scope==='shenhe'){
    const burst=!!effect.enable_talent_2;effect.enabled=primary||burst;effect.skillEnabled=primary;if(!burst)effect.burst=false;
   }else{effect.enabled=primary;if(scope==='yunjin'&&!effect.enable_passive_1)effect.passive2=false;}
  }
  for(const key of Object.keys(effect))if(/At$/.test(key))effect[key]=0;
 }
 return config;
}

export function furinaBuffInputs(config={}){
 const state=furinaFanfare(config);
 return {fanfare:state.fanfare,excess:state.excess,mode:'manual'};
}
export function buffGroupInfo(scope,group){
 const key=group.kind+':'+group.index;
 const info={
  skirk:{'talent:1':['Posture Sept phases','Active cet effet si les attaques normales Cryo testées sont exécutées pendant la posture de la compétence de Skirk.'],'passive:1':['Amplification du passif de Skirk','Active ce passif lorsque ses cumuls sont obtenus. Choisis le nombre de cumuls réellement présents : ils renforcent ses attaques normales Cryo en posture et son déchaînement Cryo.'],'talent:2':['Bonus du déchaînement de Skirk','Indique si le déchaînement spécial a précédé les attaques normales testées, combien de failles ont été absorbées et quelle Serpentine excédentaire est utilisée pour le déchaînement.']},
  furina:{'talent:2':['Fanfare de Furina','Le déchaînement de Furina doit être actif. Renseigne les points de Fanfare accumulés : ils augmentent les dégâts de l’équipe. Le plafond est de 300 points à C0 et 400 à partir de C1. À C2, les points excédentaires augmentent uniquement les PV de Furina.']},
  mona:{'talent:2':['Présage de Mona','L’ennemi touché doit être affecté par le Présage du déchaînement de Mona. Son niveau détermine le bonus de dégâts ; le bonus de taux CRIT nécessite C4.']},
  escoffier:{'passive:1':['Réduction de RÉS d’Escoffier','La compétence ou le déchaînement d’Escoffier doit avoir appliqué son effet. La réduction de RÉS Hydro et Cryo dépend du nombre de personnages Hydro ou Cryo de l’équipe. Les plumes de C2 exigent son ATQ finale.']},
  yunjin:{'talent:2':['Formation de Yun Jin','Le déchaînement de Yun Jin doit être actif et le coup testé doit être une attaque normale. Le bonus utilise sa DÉF finale et le nombre de déclenchements disponibles.'],'passive:1':['Diversité élémentaire de Yun Jin','Ce passif doit être débloqué. Le bonus supplémentaire de sa formation dépend du nombre d’éléments différents dans l’équipe et nécessite son déchaînement.']},
  shenhe:{'talent:1':['Plumes de glace de Shenhe','La compétence de Shenhe doit avoir été utilisée et le coup testé doit infliger des dégâts Cryo. Renseigne son ATQ finale et choisis appui court ou long pour le quota de plumes.'],'talent:2':['Champ du déchaînement de Shenhe','Le déchaînement de Shenhe doit être actif. Sa réduction de RÉS concerne les dégâts Cryo et physiques ; les bonus du champ exigent que le personnage soit à l’intérieur.']}
 };
 const [name,condition]=info[scope]?.[key]||['Effet du personnage','Respecte les conditions décrites dans le texte du talent avant d’activer ce bonus.'];
 return {name,condition};
}
