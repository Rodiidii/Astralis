import {RADIANCE_KITS} from './lab-radiance-kit-data.js?v=20261120-radiance-1';

const clone=value=>structuredClone(value);
const read=(path,type='number')=>({operation:'read',operands:[],path,type});
const sourceStat=(character,stat)=>read(['labSourceStat',character,stat]);
const number=(engine,value,info)=>({operation:'const',operands:[],type:'number',value,info});
const string=(engine,value)=>({operation:'const',operands:[],type:'string',value});
const percentTable=(engine,values,index)=>({operation:'subscript',operands:[index],list:values,info:{unit:'%'}});
const asPercent=value=>{const match=String(value??'').match(/-?\d+(?:\.\d+)?/);return match?Number(match[0]):NaN;};
const valuesFor=(entry,label)=>entry?.multipliers?.[label]?.map(asPercent)||[];
const percentPartsFor=(entry,label)=>entry?.multipliers?.[label]?.map(value=>(String(value).match(/-?\d+(?:\.\d+)?/g)||[]).map(Number))||[];
const percentSeriesFor=(entry,label,part=0)=>percentPartsFor(entry,label).map(values=>(values[part]??values[0]??NaN)/100);
const firstLabel=(entry,regexp)=>Object.keys(entry?.multipliers||{}).find(label=>regexp.test(label));
const formula=(op,operands,extra={})=>({operation:op,operands,...extra});
const match=(engine,condition,value,yes,no=number(engine,0))=>formula('match',[condition,string(engine,value),yes,no],{emptyOn:'unmatch'});
const subscript=(engine,index,values)=>({operation:'subscript',operands:[index],list:values});
const min=(engine,...operands)=>formula('min',operands);
const mul=(...operands)=>formula('mul',operands);
const sum=(...operands)=>formula('add',operands);
const threshold=(engine,test,limit,yes,no=number(engine,0))=>formula('threshold',[test,number(engine,limit),yes,no],{emptyOn:'l'});

function coefficient(engine,entry,label,index,scale=1){
 const values=valuesFor(entry,label);
 if(!values.length||values.some(value=>!Number.isFinite(value)))return null;
 const ratio=percentTable(engine,values.map(value=>value/100),index),factor=typeof scale==='number'?number(engine,scale):scale;
 return mul(ratio,factor);
}
function hitCount(entry,label){const value=entry?.multipliers?.[label]?.[0]||'',match=String(value).match(/\bx\s*(\d+)/i);return match?Number(match[1]):1;}
function makeOrdinaryHit(engine,template,entry,label,index,move,element,scale=1){
 const ratio=coefficient(engine,entry,label,index,scale);if(!ratio||!template)return null;
 const node=clone(template),source=node.data?.hit?.base;
 const stat=source?.operands?.find(value=>value.operation==='read'&&value.path?.[0]==='total'&&value.path[1]==='atk')||engine.input.total.atk;
 node.data||={};node.data.hit||={};node.data.hit.base=mul(ratio,clone(stat));node.data.hit.move=string(engine,move);node.data.hit.ele=string(engine,element);
 node.info={...(node.info||{}),name:label};return node;
}
function makeStellarHit(engine,entry,label,index,variant,element,condition,conditionValue,scale=1){
 const ratio=coefficient(engine,entry,label,index,scale);if(!ratio)return null;
 const multiplier=condition?match(engine,condition,conditionValue,ratio):ratio;
 const node=engine.stellarDmgNode(multiplier,'atk',variant,element);
 node.info={...(node.info||{}),name:label,path:`${variant}_hit`,variant};return node;
}
function addNode(group,key,node){if(node)group[key]=node;}
function statBase(template,engine,source,key){
 const rows=source.data.info.attributes,values=Array.from({length:91},(_,level)=>level?Number(rows.find(value=>value.level===level)?.[key]??NaN):0);
 if(values.slice(1).some(value=>!Number.isFinite(value)))return clone(template.base[key]);
 return {operation:'subscript',operands:[engine.input.lvl],list:values,info:{path:key,prefix:'char',asConst:true}};
}
function ascensionBonus(source,key){
 const aliases={'atk_':'ATK%','critDMG_':'CRIT DMG%','critRate_':'CRIT Rate%','eleMas':'Elemental Mastery','hp_':'HP%','def_':'DEF%'};
 const column=aliases[key]||Object.keys(source.data.info.attributes[0]||{}).find(name=>name.toLowerCase()===key.toLowerCase()||name.toLowerCase()===key.replace(/_$/,'').toLowerCase()+'%');
 if(!column)return [0,0,0,0,0,0,0];
 const rows=source.data.info.attributes;
 return Array.from({length:7},(_,asc)=>{
  if(!asc)return 0;
  const row=rows.find(value=>value.ascension===asc&&value.level===({1:21,2:41,3:51,4:61,5:71,6:81}[asc]));
  return Number(row?.[column]||0)/100;
 });
}
function makeStats(template,engine,source){
 const base=Object.fromEntries(['hp','atk','def'].map(key=>[key,statBase(template,engine,source,key)]));
 const premod={};
 for(const [field,column]of [['atk_','atk_'],['critDMG_','critDMG_'],['critRate_','critRate_'],['eleMas','eleMas'],['hp_','hp_'],['def_','def_']]){
  const values=ascensionBonus(source,column);if(values.some(value=>value))premod[field]=subscript(engine,engine.input.asc,values);
 }
 return {base,premod};
}

function conditionalsFor(engine,key){
 const readCondition=path=>read(['conditional',key,path],'string');
 return {readCondition};
}
function registerDanica(engine,source){
 const template=engine.characters.Odette.sheetData,stats=makeStats(template,engine,source),kit=source.data;
 const normal=kit.skills.normalattack,skill=kit.skills.elementalskill,burst=kit.skills.elementalburst;
 const {readCondition}=conditionalsFor(engine,'Danica'),radiance=readCondition('a0StellarRadianceSc'),form=readCondition('servantForm'),burstReady=readCondition('burstBuffActive'),anchor=readCondition('anchorActive'),trinkets=readCondition('trinketsConsumed');
 const disp={normal:{},charged:{},plunging:{},skill:{},burst:{},passive1:{},passive2:{},passive3:{},constellation1:{},constellation2:{},constellation4:{},constellation6:{},basic:clone(template.display.basic),reaction:clone(template.display.reaction)};
 const ordinary=template.display.normal[0],charged=template.display.charged.dmg,plunge=template.display.plunging.dmg,skillHit=template.display.skill.skillDmg,burstHit=template.display.skill.skillDmg;
 for(const [index,label]of ['DGT 1er coup','DGT 2e coup','DGT 3e coup','DGT 4e coup'].entries())addNode(disp.normal,String(index),makeOrdinaryHit(engine,ordinary,normal,label,engine.input.total.autoIndex,'normal','electro',hitCount(normal,label)));
 for(const [index,label]of ['DGT enchaînement attaque chargée','DGT coup final attaque chargée'].entries())addNode(disp.charged,String(index),makeOrdinaryHit(engine,charged,normal,label,engine.input.total.autoIndex,'charged','electro',hitCount(normal,label)));
 for(const [index,label]of ['DGT durant la chute','DGT chute basse/élevée'].entries())addNode(disp.plunging,String(index),makeOrdinaryHit(engine,plunge,normal,label,engine.input.total.autoIndex,'plunging_impact','electro',index?1.25:1));
 const skillRows=[['Skill','DGT compétence','skill'],['Protection','DGT Volonté de protection','skill'],['Épuration',"DGT Volonté d'épuration",'skill'],['Coordonnée','DGT attaque coordonnée (ancre de tempête)','skill']];
 for(const [index,[key,label,move]]of skillRows.entries())addNode(disp.skill,key,makeOrdinaryHit(engine,skillHit,skill,label,engine.input.total.skillIndex,move,'electro'));
 for(const [index,label]of ['DGT Électro 1er coup (attaque normale d’ancre de tempête)','DGT Électro 2e coup (attaque normale d’ancre de tempête)','DGT Électro 3e coup (attaque normale d’ancre de tempête)','DGT Électro 4e coup (attaque normale d’ancre de tempête)'].entries())addNode(disp.skill,'Ancre'+index,makeOrdinaryHit(engine,ordinary,skill,label,engine.input.total.skillIndex,'normal','electro'));
 const burstElectroLabels=['DGT Électro/Astroconduction 1er coup','DGT Électro 2e/3e/4e coup','DGT Électro/Astroconduction 5e coup'];
 const parts=label=>percentPartsFor(burst,label);
 for(const [i,label]of burstElectroLabels.entries()){
  const rows=parts(label),vals=percentSeriesFor(burst,label,1);if(!rows.length)continue;
  if(i===0||i===2){const electroLabel=label+' · Électro';addNode(disp.burst,electroLabel,makeOrdinaryHit(engine,burstHit,burst,label,engine.input.total.burstIndex,'burst','electro',1));
   const scLabel=label.replace('Électro/Astroconduction','Astroconduction');
   const sc=engine.stellarDmgNode(match(engine,radiance,'on',percentTable(engine,vals,engine.input.total.burstIndex)),'atk','stellarconduct','electro');sc.info={...(sc.info||{}),name:scLabel,path:'stellarconduct_hit',variant:'stellarconduct'};disp.burst[scLabel]=sc;
  }else addNode(disp.burst,label,makeOrdinaryHit(engine,burstHit,burst,label,engine.input.total.burstIndex,'burst','electro',3));
 }
 const c1Unlocked=threshold(engine,engine.input.constellation,1,number(engine,1),number(engine,0));
 const formBonus=sum(match(engine,form,'cleaner',sum(number(engine,1),mul(c1Unlocked,number(engine,1.2)))),match(engine,form,'royal',sum(number(engine,1),mul(c1Unlocked,number(engine,.8)))));
 const atkRatio=percentTable(engine,valuesFor(burst,"Bonus d'ATQ").map(value=>value/100),engine.input.total.burstIndex),atkLimit=subscript(engine,engine.input.total.burstIndex,valuesFor(burst,"Limite de bonus d'ATQ"));
 const baseAtkBonus=min(engine,mul(sourceStat('Danica','baseAtk'),atkRatio),atkLimit);
 const teamAtk=match(engine,burstReady,'on',mul(baseAtkBonus,formBonus));
 const zero=number(engine,0);
 const baseReaction=()=>min(engine,mul(number(engine,.007),sourceStat('Danica','atk'),number(engine,.01)),number(engine,.14));
 const stepped=(value,thresholds,increments)=>thresholds.reduceRight((next,limit,index)=>threshold(engine,value,limit,number(engine,increments[index]),next),number(engine,0));
 const royalC6=stepped(sourceStat('Danica','atk'),[1000,2000,3000,4000],[.1,.2,.3,.4]);
 const cleanerStacks=stepped(sourceStat('Danica','atk'),[500,1000,1500,2000],[.025,.05,.075,.1]);
 const cleanerCritDmg=stepped(sourceStat('Danica','atk'),[500,1000,1500,2000],[.25,.5,.75,1]);
 const radianceOn=match(engine,radiance,'on',number(engine,1));
 const teamBuff={tally:clone(template.teamBuff.tally),nonStacking:{},premod:{stellarconduct_baseDmg_:baseReaction()},total:{atk:teamAtk}};
 const data={...stats,charKey:string(engine,'Danica'),charEle:string(engine,'electro'),weaponType:string(engine,'claymore'),display:disp,teamBuff,infusion:clone(template.infusion||{}),special:{},flags:{}};
 data.teamBuff.premod.electro_enemyRes_=sum(match(engine,anchor,'on',number(engine,-.15)),mul(match(engine,anchor,'on',number(engine,-.15)),radianceOn));
 data.teamBuff.premod.cryo_enemyRes_=mul(match(engine,anchor,'on',number(engine,-.3)),radianceOn);
 data.teamBuff.premod.stellarconduct_specialDmg_=mul(threshold(engine,engine.input.constellation,6,royalC6),match(engine,form,'royal',number(engine,1)));
 disp.passive2.a1Speed=match(engine,form,'cleaner',number(engine,.2));
 disp.passive2.royalSpeed=match(engine,form,'royal',number(engine,.2));
 const trinketCount=sum(...Array.from({length:7},(_,index)=>match(engine,trinkets,String(index+1),number(engine,index+1))));
 const sourceIsDanica=formula('match',[read(['target','charKey'],'string'),string(engine,'Danica'),number(engine,1),number(engine,0)],{emptyOn:'unmatch'});
 const cleanerBonus=mul(match(engine,form,'cleaner',number(engine,.5)),sourceIsDanica);
 const trinketDamage=mul(sourceStat('Danica','atk'),trinketCount,sum(number(engine,1),cleanerBonus));
 data.teamBuff.premod.stellarconduct_dmgInc=threshold(engine,engine.input.constellation,2,trinketDamage);
 data.premod.skill_critRate_=sum(data.premod.skill_critRate_||zero,threshold(engine,engine.input.constellation,6,mul(cleanerStacks,match(engine,form,'cleaner',number(engine,1)))));
 data.premod.skill_critDMG_=sum(data.premod.skill_critDMG_||zero,threshold(engine,engine.input.constellation,6,mul(cleanerCritDmg,match(engine,form,'cleaner',number(engine,1)))));
 data.premod.atkSPD_=sum(data.premod.atkSPD_||zero,match(engine,form,'cleaner',number(engine,.2)),match(engine,form,'royal',number(engine,.2)));
 const sheet={...data};sheet.sheetData=sheet;engine.characters.Danica=sheet;
 engine.conditionalPaths.characters.Danica=['a0StellarRadianceSc','servantForm','burstBuffActive','anchorActive','trinketsConsumed'];
}

function registerAnastasya(engine,source){
 const template=engine.characters.Odette.sheetData,stats=makeStats(template,engine,source),kit=source.data;
 const normal=kit.skills.normalattack,skill=kit.skills.elementalskill,burst=kit.skills.elementalburst;
 const {readCondition}=conditionalsFor(engine,'Anastasya'),radiance=readCondition('a0StellarRadiance'),blessing=readCondition('blessing'),distinction=readCondition('distinctionActive'),c2Active=readCondition('c2Active'),c6Active=readCondition('c6Active'),activeSealed=readCondition('activeSealed'),anastasyaSealed=readCondition('anastasyaSealed'),otherSealedCount=readCondition('otherSealedCount');
 const disp={normal:{},charged:{},plunging:{},skill:{},burst:{},passive1:{},passive2:{},passive3:{},constellation1:{},constellation2:{},constellation6:{},basic:clone(template.display.basic),reaction:clone(template.display.reaction)};
 const ordinary=template.display.normal[0],charged=template.display.charged.dmg,plunge=template.display.plunging.dmg,skillHit=template.display.skill.skillDmg,burstHit=template.display.skill.skillDmg;
 const gateBlessing=(node,state,scaleByC2=false)=>{if(!node?.data?.hit?.base)return node;let base=node.data.hit.base;if(scaleByC2){const multiplier=threshold(engine,engine.input.constellation,2,number(engine,1.25),number(engine,1));base=match(engine,c2Active,'on',mul(base,multiplier),base);}node.data.hit.base=match(engine,blessing,state,base);return node;};
 const gateUnlessHonor=node=>{if(node?.data?.hit?.base)node.data.hit.base=match(engine,blessing,'honor',number(engine,0),node.data.hit.base);return node;};
 const stellarMultiplier=(base,variant,state,scaleByC2=false)=>{const active=match(engine,radiance,variant==='stellarconduct'?'sc':'ss',base);if(!state)return active;let value=active;if(scaleByC2){const multiplier=threshold(engine,engine.input.constellation,2,number(engine,1.25),number(engine,1));value=match(engine,c2Active,'on',mul(value,multiplier),value);}return match(engine,blessing,state,value);};
 const normalLabels=['DGT 1er coup','DGT 2e coup','DGT 3e coup','DGT 4e coup','DGT 5e coup'];
 for(let i=0;i<normalLabels.length;i++)addNode(disp.normal,String(i),gateUnlessHonor(makeOrdinaryHit(engine,ordinary,normal,normalLabels[i],engine.input.total.autoIndex,'normal','cryo',hitCount(normal,normalLabels[i]))));
 for(const [key,label]of [['charged','DGT tir visé'],['aimed','DGT tir visé (pleine charge)']])addNode(disp.charged,key,gateUnlessHonor(makeOrdinaryHit(engine,charged,normal,label,engine.input.total.autoIndex,'charged','cryo')));
 for(const [key,label]of [['drop','DGT durant la chute'],['plunge','DGT chute basse/élevée']])addNode(disp.plunging,key,makeOrdinaryHit(engine,plunge,normal,label,engine.input.total.autoIndex,'plunging_impact','cryo',key==='plunge'?1.25:1));
 const simple=makeOrdinaryHit(engine,skillHit,skill,'DGT appui simple',engine.input.total.skillIndex,'skill','cryo');if(simple)simple.data.hit.base=match(engine,blessing,'love',simple.data.hit.base);addNode(disp.skill,'skillDmg',simple);
 const hold=makeOrdinaryHit(engine,skillHit,skill,'DGT appui long',engine.input.total.skillIndex,'skill','cryo');if(hold)hold.data.hit.base=match(engine,blessing,'honor',hold.data.hit.base);addNode(disp.skill,'holdDmg',hold);
 const crownLabel=firstLabel(skill,/Astroconduction\/Astrodispersion.*couronne/i),crownSc=percentSeriesFor(skill,crownLabel,0),crownSs=percentSeriesFor(skill,crownLabel,1);
 const crownCryo=firstLabel(skill,/DGT Cryo \(couronne/i);
 const crownCount=match(engine,radiance,'sc',number(engine,1),match(engine,radiance,'ss',number(engine,1),number(engine,2)));
 const crown=makeOrdinaryHit(engine,skillHit,skill,crownCryo,engine.input.total.skillIndex,'skill','cryo',crownCount);if(crown)crown.data.hit.base=match(engine,blessing,'love',crown.data.hit.base);addNode(disp.skill,'crownCryo',crown);
 if(crownLabel&&crownSc.length&&crownSs.length){
  const sc=engine.stellarDmgNode(match(engine,blessing,'love',match(engine,radiance,'sc',percentTable(engine,crownSc,engine.input.total.skillIndex))),'atk','stellarconduct','cryo');sc.info={...(sc.info||{}),name:'Couronne · Astroconduction',path:'stellarconduct_hit',variant:'stellarconduct'};disp.skill.crownSC=sc;
  const ss=engine.stellarDmgNode(match(engine,blessing,'love',match(engine,radiance,'ss',percentTable(engine,crownSs,engine.input.total.skillIndex))),'atk','stellarswirl','cryo');ss.info={...(ss.info||{}),name:'Couronne · Astrodispersion',path:'stellarswirl_hit',variant:'stellarswirl'};disp.skill.crownSS=ss;
 }
 const cryoNormalLabels=Object.keys(skill.multipliers||{}).filter(label=>/^DGT Cryo (?:1er|[2-5]e) coup/.test(label));
 for(let i=0;i<cryoNormalLabels.length;i++){const node=gateBlessing(makeOrdinaryHit(engine,ordinary,skill,cryoNormalLabels[i],engine.input.total.skillIndex,'normal','cryo',hitCount(skill,cryoNormalLabels[i])),'honor',true);addNode(disp.skill,'honneur'+i,node);}
 const stellarNormalLabels=Object.keys(skill.multipliers||{}).filter(label=>/^DGT d'Astroconduction\/Astrodispersion \((?:1er|[2-5]e) coup\)/.test(label));
 for(let i=0;i<stellarNormalLabels.length;i++){
  const scValues=percentSeriesFor(skill,stellarNormalLabels[i],0),ssValues=percentSeriesFor(skill,stellarNormalLabels[i],1);if(scValues.length&&ssValues.length){
   const sc=engine.stellarDmgNode(stellarMultiplier(percentTable(engine,scValues,engine.input.total.skillIndex),'stellarconduct','honor',true),'atk','stellarconduct','cryo');sc.info={...(sc.info||{}),name:`Honneur · ${i+1}e coup · Astroconduction`,path:'stellarconduct_hit',variant:'stellarconduct'};disp.skill['honorSC'+i]=sc;
   const ss=engine.stellarDmgNode(stellarMultiplier(percentTable(engine,ssValues,engine.input.total.skillIndex),'stellarswirl','honor',true),'atk','stellarswirl','cryo');ss.info={...(ss.info||{}),name:`Honneur · ${i+1}e coup · Astrodispersion`,path:'stellarswirl_hit',variant:'stellarswirl'};disp.skill['honorSS'+i]=ss;
  }
 }
 for(const label of Object.keys(burst.multipliers||{}).filter(label=>/^DGT/.test(label))){
  const values=percentPartsFor(burst,label),key=label.replace(/[^a-z0-9]/gi,'_').replace(/_+/g,'_');if(!values.length)continue;
  if(/Astroconduction\/Astrodispersion/.test(label)&&values.length>=2){
   const blessingState=/Triomphe|Vers le nouveau monde|couronne/i.test(label)?'love':/Nuit éternelle|Annihilation|Honneur/i.test(label)?'honor':null,move=/Triomphe|Annihilation/i.test(label)?'skill':'burst',group=move==='skill'?disp.skill:disp.burst;
   for(const [variant,part]of [['stellarconduct',0],['stellarswirl',1]]){const series=values.map(row=>(row[part]??row[0]??NaN)/100),index=move==='skill'?engine.input.total.skillIndex:engine.input.total.burstIndex,base=stellarMultiplier(percentTable(engine,series,index),variant,blessingState,blessingState==='honor'),node=engine.stellarDmgNode(base,'atk',variant,'cryo');node.info={...(node.info||{}),name:`${label} · ${variant==='stellarconduct'?'Astroconduction':'Astrodispersion'}`,path:variant+'_hit',variant};group[key+variant]=node;
    if(/Triomphe/i.test(label)){let extraBase=match(engine,c6Active,'on',mul(base,number(engine,2.5)));extraBase=threshold(engine,engine.input.constellation,6,extraBase,number(engine,0));const extra=engine.stellarDmgNode(extraBase,'atk',variant,'cryo');extra.info={...(extra.info||{}),name:`C6 · Triomphe · ${variant==='stellarconduct'?'Astroconduction':'Astrodispersion'}`};disp.constellation6['triomphe'+variant]=extra;}
    if(/3e coup \(Annihilation\)/i.test(label)){let extraBase=match(engine,c6Active,'on',mul(base,number(engine,2)));extraBase=threshold(engine,engine.input.constellation,6,extraBase,number(engine,0));const extra=engine.stellarDmgNode(extraBase,'atk',variant,'cryo');extra.info={...(extra.info||{}),name:`C6 · Annihilation · phase finale · ${variant==='stellarconduct'?'Astroconduction':'Astrodispersion'}`};disp.constellation6['annihilation'+variant]=extra;}
   }
  }else {const move=/Triomphe|Annihilation/i.test(label)?'skill':'burst',index=move==='skill'?engine.input.total.skillIndex:engine.input.total.burstIndex,node=makeOrdinaryHit(engine,burstHit,burst,label,index,move,'cryo',hitCount(burst,label));if(node){if(/Triomphe|Vers le nouveau monde|couronne/i.test(label))gateBlessing(node,'love');if(/Annihilation|Nuit éternelle|Honneur|lance/i.test(label))gateBlessing(node,'honor',true);(move==='skill'?disp.skill:disp.burst)[key]=node;}}
 }
 const zero=number(engine,0),one=number(engine,1),factor=threshold(engine,engine.input.constellation,4,number(engine,1.3),one);
 const c1=threshold(engine,engine.input.constellation,1,number(engine,.15),zero),c1Em=threshold(engine,engine.input.constellation,1,number(engine,60),zero);
 const activeDistinction=match(engine,distinction,'on',one);
 const sealedCount=sum(match(engine,otherSealedCount,'1',one),match(engine,otherSealedCount,'2',number(engine,2)));
 const activeSeal=match(engine,activeSealed,'on',one);
 const sourceSeal=match(engine,anastasyaSealed,'on',one);
 const otherCharacter=formula('match',[read(['target','charKey'],'string'),string(engine,'Anastasya'),zero,one],{emptyOn:'unmatch'});
 const sourceSealForOthers=mul(sourceSeal,otherCharacter);
 const remaining=formula('max',[one,sum(number(engine,4),mul(number(engine,-1),sealedCount),mul(number(engine,-1),activeSeal),mul(number(engine,-1),sourceSealForOthers))]);
 const redistributedCount=formula('max',[number(engine,0),sum(remaining,mul(number(engine,-1),sealedCount))]);
 const share=formula('sum_frac',[sealedCount,redistributedCount]);
 const retained=match(engine,activeSealed,'on',threshold(engine,engine.input.constellation,1,one,zero),sum(one,share));
 const sourceSealBonus=match(engine,anastasyaSealed,'on',threshold(engine,engine.input.constellation,1,number(engine,3),one),one);
 const sourceSealAmplification=threshold(engine,otherCharacter,1,sourceSealBonus,one);
 const activeBonus=mul(number(engine,.12),factor,retained,sourceSealAmplification,activeDistinction);
 const cryoTarget=formula('match',[read(['target','charEle'],'string'),string(engine,'cryo'),one,zero],{emptyOn:'unmatch'});
 const p1CryoAtk=mul(c1,factor,activeDistinction,retained,sourceSealAmplification,cryoTarget);
 const p1OtherEm=mul(c1Em,factor,activeDistinction,retained,sourceSealAmplification,formula('match',[read(['target','charEle'],'string'),string(engine,'cryo'),zero,one],{emptyOn:'unmatch'}),otherCharacter);
 const teamBuff={tally:clone(template.teamBuff.tally),nonStacking:{},premod:{critDMG_:activeBonus,atk_:p1CryoAtk,eleMas:p1OtherEm,stellarswirl_baseDmg_:number(engine,.15)}};
 teamBuff.premod.stellarconduct_critDMG_=mul(threshold(engine,engine.input.constellation,2,number(engine,.6)),match(engine,blessing,'love',match(engine,c2Active,'on',one)));
 teamBuff.premod.stellarswirl_critDMG_=clone(teamBuff.premod.stellarconduct_critDMG_);
 teamBuff.premod.stellarconduct_specialDmg_=mul(threshold(engine,engine.input.constellation,2,number(engine,.05)),match(engine,c2Active,'on',one));
 teamBuff.premod.stellarswirl_specialDmg_=clone(teamBuff.premod.stellarconduct_specialDmg_);
 teamBuff.premod.stellarconduct_specialDmg_=sum(teamBuff.premod.stellarconduct_specialDmg_,mul(threshold(engine,engine.input.constellation,6,number(engine,.1)),match(engine,blessing,'love',match(engine,c6Active,'on',one))));
 const teamBase=mul(number(engine,.007),sourceStat('Anastasya','atk'),number(engine,.01));
 teamBuff.premod.stellarconduct_baseDmg_=min(engine,teamBase,number(engine,.14));
 teamBuff.premod.stellarswirl_baseDmg_=sum(teamBuff.premod.stellarswirl_baseDmg_,min(engine,teamBase,number(engine,.14)));
 const selfElev=mul(threshold(engine,engine.input.constellation,6,number(engine,.2)),match(engine,blessing,'honor',match(engine,c6Active,'on',one)));
 const data={...stats,charKey:string(engine,'Anastasya'),charEle:string(engine,'cryo'),weaponType:string(engine,'bow'),display:disp,teamBuff,infusion:clone(template.infusion||{}),special:{},flags:{}};
 disp.passive3.radianceSc=match(engine,radiance,'sc',one);
 disp.passive3.radianceSs=match(engine,radiance,'ss',one);
 data.premod.stellarconduct_specialDmg_=selfElev;data.premod.stellarswirl_specialDmg_=selfElev;
 const sheet={...data};sheet.sheetData=sheet;engine.characters.Anastasya=sheet;
 engine.conditionalPaths.characters.Anastasya=['a0StellarRadiance','blessing','distinctionActive','c2Active','c6Active','activeSealed','anastasyaSealed','otherSealedCount'];
}

export function registerRadianceCharacters(engine){
 if(engine.characters.Danica&&engine.characters.Anastasya)return engine;
 registerDanica(engine,RADIANCE_KITS.Danica);registerAnastasya(engine,RADIANCE_KITS.Anastasya);return engine;
}
