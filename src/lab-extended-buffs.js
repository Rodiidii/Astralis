// Explicit stat buffs only. Separate hits, infusions and healing are not inferred.
// Values checked against the pinned talent/constellation texts in lab-kit-snapshot.
const rule=(id,label,bonuses,extra={})=>({id,label,bonuses,...extra});
export const EXTENDED_BUFFS={
 '10000103':[rule('samples','Échantillon source de cet élément activé : baisse de RÉS selon le talent',{}, {elements:['pyro','hydro','cryo','electro','geo'],type:'resReduction',talent:{skill:1,param:'param2'},percent:true}),rule('a4','Éruption noctâme d’un équipier : DÉF de Xilonen, 15 s',{defPct:20},{recipient:'self'}),rule('c2geo','Échantillon Géo activé : bénéficiaire Géo',{dmgBonus:50},{c:2,recipientElements:['geo']}),rule('c2pyro','Échantillon Pyro activé : bénéficiaire Pyro',{atkPct:45},{c:2,recipientElements:['pyro']}),rule('c2hydro','Échantillon Hydro activé : bénéficiaire Hydro',{hpPct:45},{c:2,recipientElements:['hydro']}),rule('c2cryo','Échantillon Cryo activé : bénéficiaire Cryo',{critDmg:60},{c:2,recipientElements:['cryo']}),rule('c4','Don fleuri : 6 déclenchements, 15 s',{}, {c:4,kinds:['normal','charged','plunge'],source:'def',factor:.65,type:'flatDamage',sourceLabel:'DÉF finale de Xilonen',pool:{charges:6}}),rule('c6','Bénédiction de la nuit impérissable : bonus normal / plongeant',{normalFlatFromDef:300,plungeFlatFromDef:300},{c:6,recipient:'self'})],
 '10000093':[rule('a1','Ennemis touchés par la vague : pennes de tempête, 20 s',{plungeCritRate:[4,6,8,10]},{max:4}),rule('a4','Aide adeptale : bonus d’un seul ennemi par impact au sol',{}, {onfield:true,kinds:['plunge'],source:'atk',factor:2,cap:9000,c2Factor:4,c2Cap:18000,type:'flatDamage',sourceLabel:'ATQ finale de Xianyun',pool:{charges:8,oneTarget:true}}),rule('c2','Échelle céleste utilisée : ATQ personnelle, 15 s',{atkPct:20},{c:2,recipient:'self'})],
 '10000060':[rule('a1','PV personnels selon la diversité élémentaire de l’équipe',{}, {recipient:'self',teamHp:true}),rule('ramp','Dé exquis en combat : secondes écoulées depuis son utilisation',{}, {onfield:true,source:'elapsed',manual:true,factor:3.5,offset:1,floor:true,cap:50,type:'dmgBonus',sourceLabel:'Secondes écoulées (0 = +1 %, plafond +50 %)'}),rule('c4','Ennemis marqués par la ligne vitale : bonus PV, 25 s',{hpPct:10},{c:4,max:4})],
 '10000069':[rule('a1','Flèche florale tirée : maîtrise personnelle, 4 s',{em:50},{recipient:'self'}),rule('a4','Maîtrise convertie en bonus de dégâts des flèches chargées et du déchaînement',{}, {recipient:'self',source:'em',factor:.06,cap:60,type:'dmgBonus',kinds:['charged','burst']}),rule('c1','Taux CRIT des attaques chargées',{chargedCritRate:15},{c:1,recipient:'self'}),rule('c2','Ennemi dans le champ, ou champ terminé depuis moins de 6 s',{dendroDmg:20},{c:2,recipient:'self'}),rule('c4','Déchaînement utilisé : maîtrise de l’équipe, 8 s',{em:60},{c:4}),rule('c4reaction','Déchaînement déclenchant l’une des réactions du passif : supplément de maîtrise',{em:60},{c:4,requires:[['c4',1]]})],
 '10000050':[rule('c6','Barrière brûlante obtenue ou réinitialisée : 6 s',{normalDmg:15,chargedDmg:15,plungeDmg:15},{c:6})],
 '10000075':[rule('pyro','Bienfait venteux : renforcement Pyro obtenu',{atkPct:30},{recipient:'self'}),rule('cryo','Bienfait venteux : renforcement Cryo obtenu',{critRate:20},{recipient:'self'}),rule('c2','Déchaînement sous Bienfait venteux : Kuugoryoku dépensé',{}, {c:2,recipient:'self',kinds:['burst'],source:'spentPoints',manual:true,factor:4,cap:200,type:'burstDmg',sourceLabel:'Différence entre Kuugoryoku maximal et actuel'})],
 '10000087':[rule('glory','Jugement équitable : cumuls de gloire draconique présents, C1 inclus',{}, {recipient:'self',kinds:['charged'],targetPattern:'jugement|equitable',max:3,multiplier:[1.1,1.25,1.6]}),rule('a4','PV actuels : bonus Hydro au-dessus de 30 %',{}, {recipient:'self',source:'currentHPPercent',manual:true,threshold:30,factor:.6,cap:30,type:'hydroDmg',sourceLabel:'PV actuels (% des PV max)'}),rule('c2','Jugement équitable : DGT CRIT par cumul de gloire',{chargedCritDmg:14},{c:2,recipient:'self',kinds:['charged'],targetPattern:'jugement|equitable',requires:[['glory',1]],stacksFrom:'glory',max:3})],
 '10000071':[rule('a4normal','Éclaireur sermenté actif : ajout ME aux attaques normales',{normalFlatFromEm:150},{recipient:'self',kinds:['normal']}),rule('c2','Attaques normales ayant touché : cumuls de 4 s',{electroDmg:10},{c:2,recipient:'self',max:5})],
 '10000078':[rule('a4burst','Maîtrise convertie en bonus du déchaînement',{}, {recipient:'self',kinds:['burst'],source:'em',factor:.1,cap:100,type:'burstDmg'}),rule('a4projection','Maîtrise convertie en bonus des rayonnements',{}, {recipient:'self',kinds:['skill'],targetPattern:'rayonnement|projection',source:'em',factor:.1,cap:100,type:'skillDmg'}),rule('c2','Miroirs générés : cumuls de maîtrise, 8 s',{em:50},{c:2,recipient:'self',max:4}),rule('c4others','Miroirs consommés au déchaînement : maîtrise des autres équipiers, 15 s',{em:30},{c:4,recipient:'others',max:3}),rule('c4self','Miroirs générés au déchaînement : bonus Dendro personnel, 15 s',{dendroDmg:10},{c:4,recipient:'self',max:3}),rule('c6','Miroir généré au maximum : bonus CRIT personnel, 6 s',{critRate:10,critDmg:70},{c:6,recipient:'self'})],
 '10000032':[rule('burst','Dans le champ de Merveilleux voyage ; à C0, PV du bénéficiaire >70 %',{}, {onfield:true,source:'baseAtk',type:'atkFlat',talent:{skill:2,param:'param4'},c1Factor:.2,sourceLabel:'ATQ de base de Bennett (personnage + arme uniquement)'}),rule('c6','Champ actif : arme de mêlée, bonus Pyro et enchantement',{pyroDmg:15},{c:6,onfield:true,weaponTypes:['WEAPON_SWORD_ONE_HAND','WEAPON_CLAYMORE','WEAPON_POLE']})],
 '10000055':[rule('def','Bannière / champ de Gorou : personnage déployé',{}, {onfield:true,type:'defFlat',talent:{skill:1,param:'param2',flat:true}}),rule('geo','Bannière active et au moins 3 personnages Géo',{geoDmg:15},{onfield:true,minGeo:3}),rule('a1','Déchaînement de Gorou utilisé : 12 s',{defPct:25}),rule('c6','Compétence ou déchaînement utilisé : CRIT Géo selon l’équipe',{}, {c:6,elements:['geo'],geoCrit:true})],
 '10000006':[rule('a4','Rose de foudre touche l’ennemi : 10 s',{defReduction:15})],
 '10000023':[rule('pepper','Piment de Gooba ramassé : 10 s',{atkPct:10}),rule('c1','Gooba touche : RÉS Pyro −15 %, 6 s',{resReduction:15},{c:1,elements:['pyro']}),rule('c6','Pyrotation active : bonus Pyro de l’équipe',{pyroDmg:15},{c:6})],
 '10000025':[rule('a4','Bonus Hydro personnel permanent',{hydroDmg:20},{recipient:'self'}),rule('c2','Épées de déluge ayant touché : RÉS Hydro −15 %, 4 s',{resReduction:15},{c:2,elements:['hydro']})],
 '10000030':[rule('shield','Bouclier de jade actif et ennemi à proximité : toutes RÉS −20 %',{resReduction:20})],
 '10000036':[rule('a4','Lame de fin du champ ayant touché : RÉS Cryo −10 %, 8 s',{resReduction:10},{elements:['cryo']})],
 '10000038':[rule('a4','Déchaînement utilisé : 10 s',{em:125}),rule('c4','Personnage déployé dans l’aura solaire',{plungeDmg:30},{c:4,onfield:true}),rule('c6','Dans l’aura, sous bouclier de Cristallisation ou voile lunaire',{dmgBonus:17},{c:6,onfield:true})],
 '10000039':[rule('c6','Dans le champ, PV strictement supérieurs à 50 %',{em:200},{c:6,onfield:true})],
 '10000043':[rule('a1','Dispersion : allié de l’élément dispersé, 8 s',{em:50},{recipient:'others'}),rule('a4','Compétence ou déchaînement ayant touché : 8 s',{}, {recipient:'others',source:'em',factor:.2,type:'em',sourceLabel:'Maîtrise finale de Sucrose'}),rule('c6','Absorption du même élément que le coup simulé',{dmgBonus:20},{c:6,elements:['pyro','hydro','cryo','electro']})],
 '10000045':[rule('a1','Confession touche dans le dos : 5 s',{critRate:12},{recipient:'self'}),rule('a4','Sacrement mortel utilisé : alliés, 10 s',{}, {recipient:'others',source:'critRate',factor:.15,cap:15,type:'critRate',sourceLabel:'Taux CRIT final de Rosalia (%)'}),rule('c6','Sacrement mortel touche : RÉS physique −20 %, 10 s',{resReduction:20},{c:6,elements:['physical']})],
 '10000047':[rule('a4','Dispersion de l’élément du coup simulé : 8 s',{}, {source:'em',factor:.04,type:'dmgBonus',elements:['pyro','hydro','cryo','electro'],sourceLabel:'Maîtrise finale de Kazuha'}),rule('c2','Personnage dans le champ de vent d’automne',{em:200},{c:2,onfield:true})],
 '10000052':[rule('c2','Harmonie d’idéal : attaques du déchaînement',{defIgnore:60},{c:2,recipient:'self',kinds:['burst']}),rule('c4','Fin de l’Harmonie d’idéal : autres personnages, 10 s',{atkPct:30},{c:4,recipient:'others'})],
 '10000056':[rule('atk','Tengu Juurai : bonus ATQ reçu, 6 s',{}, {source:'baseAtk',type:'atkFlat',talent:{skill:1,param:'param2'},sourceLabel:'ATQ de base de Sara (personnage + arme uniquement)'}),rule('c6','Augmentation d’ATQ de Tengu Juurai active : CRIT Électro',{critDmg:60},{c:6,elements:['electro']})],
 '10000068':[rule('c4','Relié au djinn, énergie sous 50 %',{er:30},{c:4,onfield:true})],
 '10000073':[rule('a1','Personnage déployé dans le sanctuaire de Maya',{}, {onfield:true,source:'highestEM',factor:.25,cap:250,type:'em',sourceLabel:'Maîtrise la plus élevée de l’équipe'}),rule('c2','Graine de Skandha et Stimulation / Suractivation / Propagation : 8 s',{defReduction:30},{c:2})],
 '10000076':[rule('shred','Calamité de vent active : RÉS Anémo −30 %',{resReduction:30},{elements:['anemo']}),rule('bonus','Vent de prière actif : bonus Anémo',{}, {type:'anemoDmg',talent:{skill:2,param:'param2'},percent:true}),rule('c6','Vent de prière actif : CRIT Anémo',{critDmg:40},{c:6,elements:['anemo']})],
 '10000090':[rule('a1','Équipe uniquement Pyro/Électro avec les deux éléments ; Surcharge : 6 s',{resReduction:40},{elements:['pyro','electro'],team:'overload'}),rule('a4','Cartouche surchargée tirée : bonus ATQ, 30 s',{}, {recipientElements:['pyro','electro'],source:'hp',factor:.001,cap:40,type:'atkPct',sourceLabel:'PV max de Chevreuse'})],
 '10000107':[rule('a1','Itzpapa actif, Gel ou Fonte déclenché : 12 s',{resReduction:20},{elements:['pyro','hydro']}),rule('c1','Tenue d’opale : lames disponibles, ajout aux autres personnages déployés',{}, {c:1,recipient:'others',onfield:true,source:'em',factor:2,type:'flatDamage',sourceLabel:'Maîtrise finale de Citlali',pool:{charges:10}}),rule('c2self','Maîtrise personnelle de Citlali',{em:125},{c:2,recipient:'self'}),rule('c2others','Bouclier d’opale ou Itzpapa suit le bénéficiaire : maîtrise',{em:250},{c:2,recipient:'others'}),rule('c2shred','Gel ou Fonte avec Itzpapa : baisse de RÉS supplémentaire',{resReduction:20},{c:2,elements:['pyro','hydro'],requires:[['a1',1]]}),rule('c6','Points de loi secrète actuels : bonus de l’équipe',{pyroDmg:1.5,hydroDmg:1.5},{c:6,max:40,selfExtra:{dmgBonus:2.5}})],
};
const fold=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export function extendedBuffOptions(id,{own=false,constellation=0,elementKey,characterElement,actionKind,targetName='',fightPosition='on',teamElements=[],targetWeaponType}={}){
 return (EXTENDED_BUFFS[String(id)]||[]).filter(row=>Number(constellation)>=Number(row.c||0)&&!(row.recipient==='self'&&!own||row.recipient==='others'&&own)&&(!row.elements||row.elements.includes(elementKey))&&(!row.recipientElements||row.recipientElements.includes(characterElement))&&(!row.kinds||row.kinds.includes(actionKind))&&(!row.targetPattern||new RegExp(row.targetPattern).test(fold(targetName)))&&(!row.weaponTypes||row.weaponTypes.includes(targetWeaponType))&&(!row.minGeo||teamElements.filter(el=>el==='geo').length>=row.minGeo)&&(!row.onfield||fightPosition==='on')&&(row.team!=='overload'||teamElements.includes('pyro')&&teamElements.includes('electro')&&teamElements.every(el=>['pyro','electro'].includes(el))));
}
export function activeExtendedBuffRules(config={}){
 const active=[];
 for(const member of config.members||[]){
  const options=extendedBuffOptions(member.id,{...config,own:member.own,constellation:member.constellation});
  const state=row=>{const saved=member.effects?.[row.id]||{};return {...saved,stacks:Math.max(1,Math.min(row.max||1,Number(saved.stacks)||1))};};
  for(const row of options){
   const saved=state(row);if(!saved.enabled)continue;
   if(row.requires?.some(([id,min])=>{const parent=options.find(item=>item.id===id);const value=parent&&state(parent);return !value?.enabled||value.stacks<min;}))continue;
   if(row.stacksFrom){const parent=options.find(item=>item.id===row.stacksFrom);if(!parent)continue;saved.stacks=state(parent).stacks;}
   active.push({member,row,saved});
  }
 }
 return active;
}
function sourceAmount(member,row,saved,stats={},staticBonuses={},config={}){
 const own=member.own&&!row.manual&&!['highestEM','baseAtk'].includes(row.source);
 let value=own?Number(stats[row.source])+(config.statsIncludeBuffs?0:Number(staticBonuses[row.source])||0):saved.sourceValue===''||saved.sourceValue==null?NaN:Number(saved.sourceValue);
 if(!Number.isFinite(value)||value<0)return null;
 if(row.floor)value=Math.floor(value);
 const factor=row.talent?member.factors?.[row.id]+(member.constellation>=1?row.c1Factor||0:0):member.constellation>=2&&row.c2Factor!=null?row.c2Factor:row.factor;
 if(!Number.isFinite(factor))return null;
 const cap=member.constellation>=2&&row.c2Cap!=null?row.c2Cap:row.cap??Infinity;
 return Math.min(cap,Math.max(0,value-(row.threshold||0))*factor+(row.offset||0))*saved.stacks;
}
export function extendedBuffBonuses(config={},stats={}){
 const out={},derived=[];
 for(const {member,row,saved} of activeExtendedBuffRules(config)){
  if(row.pool)continue;
  if(row.source){derived.push({member,row,saved});continue;}
  const bonuses={...row.bonuses,...(member.own?row.selfExtra:{})};
  for(const [key,value]of Object.entries(bonuses))out[key]=(out[key]||0)+(Array.isArray(value)?value[saved.stacks-1]:value*saved.stacks);
  if(row.talent){const value=member.factors?.[row.id];if(Number.isFinite(value))out[row.type]=(out[row.type]||0)+value*(row.percent?100:1);}
  if(row.geoCrit){const count=config.teamElements?.filter(el=>el==='geo').length||0;out.critDmg=(out.critDmg||0)+(count>=3?40:count===2?20:count===1?10:0);}
  if(row.teamHp){const count=new Set(config.teamElements||[]).size;out.hpPct=(out.hpPct||0)+([0,6,12,18,30][Math.min(4,count)]||0);}
  if(row.multiplier)out.talentScale=(out.talentScale||1)*row.multiplier[saved.stacks-1];
 }
 const staticBonuses={...out};
 for(const {member,row,saved} of derived){const value=sourceAmount(member,row,saved,stats,staticBonuses,config);if(value!=null)out[row.type]=(out[row.type]||0)+value;}
 return out;
}
export function extendedBuffPools(config={},stats={}){
 return activeExtendedBuffRules(config).filter(({row})=>row.pool).flatMap(({member,row,saved},index)=>{
  const amount=sourceAmount(member,row,saved,stats,{}, {...config,statsIncludeBuffs:true});
  return amount==null?[]:[{id:'kit:'+member.id+':'+row.id,flatDamage:amount,charges:row.pool.charges,oneTarget:!!row.pool.oneTarget,kinds:row.kinds}];
 });
}
export function extendedBuffWarnings(config={}){
 const warnings=[];
 for(const {member,row,saved} of activeExtendedBuffRules(config)){
  if(row.source&&(!member.own||row.manual||['highestEM','baseAtk'].includes(row.source))&&(saved.sourceValue===''||saved.sourceValue==null||!Number.isFinite(Number(saved.sourceValue))))warnings.push('Renseigne '+(row.sourceLabel||'la statistique source')+'.');
  if(row.talent&&!Number.isFinite(member.factors?.[row.id]))warnings.push('Table de talent indisponible pour '+row.label+'.');
 }
 return warnings;
}
