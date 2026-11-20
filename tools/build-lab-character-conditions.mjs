import fs from 'node:fs';
import {wrConditionOptions} from '../src/lab-wr-adapter.js';
import {REVIEWED_BUFFS} from '../src/lab-reviewed-buffs.js';
import {formulaProvenance} from './lab-formula-provenance.mjs';
import * as engine from '../public/lab-wr-engine.js';
import {normalizeLabEngine} from '../src/lab-engine-normalize.js';
import {RADIANCE_KITS} from '../src/lab-radiance-kit-data.js';
normalizeLabEngine(engine);
const snapshot=JSON.parse(fs.readFileSync('data/lab-kit-snapshot.json','utf8'));
const aliases=JSON.parse(fs.readFileSync('public/gi-name-aliases.json','utf8'));
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/gi,'').toLowerCase();
const output={revision:snapshot.revisions,characters:{}};
for(const key of Object.keys(engine.characters)){
 const paths=engine.conditionalPaths.characters[key]||[];
 const formulaTalents=formulaProvenance(key,paths);
 const alias=aliases.characters.find(a=>(a.en||[]).some(name=>norm(name)===norm(key))),id=alias?.id||({Mitya:'10000136',Valeriy:'10000137'}[key]);

 const kit=snapshot.characters[id],radianceKit=RADIANCE_KITS[key]?.data,talents=kit?.talents||{},constellations=kit?.constellations||{};
 const travelerElement=key.match(/^Traveler(Anemo|Geo|Electro|Dendro|Hydro|Pyro|Cryo)[MF]$/i)?.[1]?.toLowerCase();
 const characterSource=Object.keys(talents).length?talents:(travelerElement?snapshot.travelerVariants?.[travelerElement]?.talents||{}:{});
 const talentIds=['combat1','combat2','combat3','passive1','passive2','passive3','passive4','lockedPassive','c1','c2','c3','c4','c5','c6'];
 const radianceTalentMap={combat1:radianceKit?.skills?.normalattack,combat2:radianceKit?.skills?.elementalskill,combat3:radianceKit?.skills?.elementalburst,passive1:radianceKit?.passives?.p1,passive2:radianceKit?.passives?.p2,passive3:radianceKit?.passives?.p3,passive4:radianceKit?.passives?.p4,...Object.fromEntries(Array.from({length:6},(_,i)=>['c'+(i+1),radianceKit?.constellations?.['const'+(i+1)]]))};
 const sourceTalents=Object.fromEntries(talentIds.map(talent=>{const entry=characterSource[talent]||constellations[talent]||radianceTalentMap[talent];const rawDescription=entry?.description||entry?.descriptionRaw||'';return [talent,entry?{name:entry.name||'',description:String(rawDescription).replace(/\\n/g,'\n').replace(/\{NON_BREAK_SPACE\}/g,' ').replace(/\{LINK#[^}]*\}|\{\/LINK\}/g,'').replace(/<[^>]+>/g,'').replace(/#/g,'').trim()}:null];}).filter(([,entry])=>entry?.name||entry?.description));
 const flattenText=value=>typeof value==='string'?value:Array.isArray(value)?value.map(flattenText).join('\n'):value&&typeof value==='object'?Object.values(value).map(flattenText).join('\n'):'';
 for(const folder of ['dm-localization','localization']){
  const filename=`vendor/genshin-optimizer-source/libs/gi/${folder}/assets/locales/fr/char_${key}${folder==='dm-localization'?'_gen':''}.json`;
  if(!fs.existsSync(filename))continue;
  const localized=JSON.parse(fs.readFileSync(filename,'utf8'));
  for(const talent of talentIds){const localKey=({combat1:'auto',combat2:'skill',combat3:'burst'}[talent]||talent.replace(/^c([1-6])$/,'constellation$1')),entry=localized[localKey];if(!entry?.name)continue;
   const text=flattenText(entry.upgradedDescription||entry.description||entry.fields).replace(/<br\s*\/?\s*>/gi,'\n').replace(/<[^>]+>/g,'');
   if(text)sourceTalents[talent]={name:entry.name,description:text};
  }
 }
 if(key==='Chasca'&&sourceTalents.c6)sourceTalents.c6.description=sourceTalents.c6.description.replace('et les DGT des cartouches','et les DGT CRIT des cartouches');
 const conditionOptions=wrConditionOptions;
 const conditionEffects=(group,key,path)=>{
  const effects=[],scan=(source,root)=>{const seen=new WeakSet(),visit=(node,trail=[])=>{if(!node||typeof node!=='object'||seen.has(node))return;seen.add(node);if(node.operation==='read'&&node.path?.[0]==='conditional'&&node.path?.[1]===key&&node.path?.[2]===path)effects.push({root,trail});for(const [name,child]of Object.entries(node))if(child&&typeof child==='object')visit(child,[...trail,name]);};visit(source);};
  for(const root of ['premod','teamBuff','display','total','infusion','special','flags'])scan(engine[group]?.[key]?.sheetData?.[root],root);
  const relevant=effects.some(effect=>effect.root!=='flags');
  return {roots:[...new Set(effects.map(effect=>effect.root))],buff:relevant};
 };
 const passives=talentIds.filter(id=>id.startsWith('passive')&&sourceTalents[id]).map(id=>({id,...sourceTalents[id]}));
 output.characters[key]={key,id,name:kit?.name||alias?.fr?.[0]||key,talents:sourceTalents,passives,conditions:paths.map(path=>{
  const c=path.match(/constellation([1-6])/i)||path.match(/^c([1-6])/i)||path.match(/[a-z]C([1-6])/);
  const passive=path.match(/(?:ascension|passive|asc|a)([0-4])/i);
  const numberedPassive=path.match(/(?:^|[a-z])p([12])/i);
  let talent=c?'c'+c[1]:passive?'passive'+(Number(passive[1])===4?2:Number(passive[1])===0?3:1):/burst|afterq|fanfare|overstack/i.test(path)?'combat3':/skill|aftere|shield|coil|mirrors|bond/i.test(path)?'combat2':null;
  if(!c&&!passive&&numberedPassive)talent='passive'+numberedPassive[1];
  const overrides={
   Albedo:{p1EnemyHp:'passive1'},Alhaitham:{debateStacks:'passive2',excessMirror:'c6'},
   Bennett:{activeInArea:'combat3',underHP:'combat3'},Collei:{offField:'c6'},
   Eula:{Grimheart:'combat2',LightfallSword:'combat3',TidalIllusion:'c1',grimheartConsumed:'combat2'},Freminet:{stalk:'combat2'},
   Gorou:{inField:'combat2'},HuTao:{GuideToAfterlifeVoyage:'combat2',FlutterBy:'passive1',SanguineRouge:'passive2',GardenOfEternalRest:'c4',ButterflysEmbrace:'c6'},KujouSara:{TenguJuuraiAmbush:'combat2'},
   KamisatoAyaka:{afterSprint:'passive2',afterApplySprint:'passive2'},Keqing:{afterRecast:'combat2',afterReact:'c4'},
   Klee:{ExplosiveFrags:'passive1',BlazingDelight:'c6'},KukiShinobu:{underHP:'passive1'},
   Lyney:{propStacks:'combat3'},Mika:{inSoulwind:'combat2'},
   Mona:{Omen:'combat3',ProphecyOfSubmersion:'c1',RhetoricsOfCalamitas:'c4'},Navia:{shotsHit:'combat2'},
   Noelle:{SweepingTime:'combat3'},Razor:{ElectroSigil:'combat2',TheWolfWithin:'combat3'},
   KaedeharaKazuha:{swirlhydro:'passive2',swirlpyro:'passive2',swirlcryo:'passive2',swirlelectro:'passive2'},
   Shenhe:{quill:'combat2'},ShikanoinHeizou:{takeField:'passive1',declensionStacks:'combat2'},Sucrose:{absorption:'c6',swirlhydro:'passive1',swirlpyro:'passive1',swirlcryo:'passive1',swirlelectro:'passive1'},Thoma:{p1BarrierStacks:'passive1'},
   Tighnari:{p1AfterWreath:'passive1'},Xiangling:{afterChili:'passive2',afterGuobaHit:'c1',afterPyronado:'c6'},
   Xiao:{offField:'passive2'},Xilonen:{sourceActive:'combat2',nsBlessing:'combat2'},Yanfei:{p1Seals:'passive1'},Yaoyao:{adeptalLegacy:'combat3'},Zhongli:{p1:'passive1'}
  };
  if(path==='moonsignAfterSkillBurst')talent=null;
  else if(Object.hasOwn(overrides[key]||{},path))talent=overrides[key][path];
  // Mechanic locks shared across characters have no single talent owner.
  if(/^lock/.test(path))talent=sourceTalents.lockedPassive?'lockedPassive':null;
  const explicit={Lohen:{willConsumed:'combat2'},Valeriy:{chargedOffensive:'combat1'},Prune:{lockRallyReaction:'passive2'},Qiqi:{QiqiLk:'lockedPassive'},Somnia:{superposition:'combat2',cycloneActive:'combat2',subtraction:'combat3',lessThan3:'combat2',multiplication:'combat3'},Klee:{ExplosiveFrags:'c2'},Mona:{RhetoricsOfCalamitas:'c6'},Shenhe:{asc1:'passive1',asc4:'passive2',asc4Hold:'passive2'},Albedo:{burstUsed:'passive2',skillInField:'c4'},Alhaitham:{mirrorsConsumed:'combat3'},Collei:{offField:'c1',afterBurst:'c4'},Keqing:{afterBurst:'passive2'},KamisatoAyaka:{afterBurst:'c4'},Gorou:{afterBurst:'passive1',afterSkillBurst:'c6'},Sucrose:{skillHit:'passive2'},Yoimiya:{burst:'passive2'},YunJin:{skill:'combat3'}};
  if(explicit[key]?.[path])talent=explicit[key][path];
  const reviewed=REVIEWED_BUFFS[key]?.[path];
  const candidates=(formulaTalents[path]||[]).filter(id=>sourceTalents[id]);
  if(!talent&&candidates.length===1&&path!=='moonsignAfterSkillBurst')talent=candidates[0];
  if(key==='Lynette'&&path==='burstAbsorb')talent='passive2';
  const verified={Alhaitham:{debateStacks:'c2'},Lyney:{propStacks:'combat2'},ShikanoinHeizou:{takeField:'c1',skillHit:'passive2'},Xiao:{offField:'c2'},Xilonen:{nsBurst:'passive2'},Vesna:{skillArmed:'c1'},Wanderer:{skillCryoContact:'passive1',skillPyroContact:'passive1'},Xingqiu:{burst:'c4'},Klee:{lockC1:'c1'},Razor:{lockC6Sigil:'c6'},Venti:{lockC4SkillBurst:'c4'}};
  if(verified[key]?.[path])talent=verified[key][path];
  if(reviewed)talent=reviewed[0];
  if(/^TravelerHydro/.test(key)&&path==='suffusion')talent='combat2';
  const source=sourceTalents[talent];
  const options=conditionOptions(engine,'characters',key,path);
  const effect=conditionEffects('characters',key,path);
  return {path,talent,ascension:talent==='passive1'?1:talent==='passive2'?4:0,formulaTalents:candidates,relatedTalents:[...new Set([...(reviewed?.[3]||[]),...candidates])].filter(id=>id!==talent),label:reviewed?.[1],help:reviewed?.[2],constellation:talent?.match(/^c([1-6])$/)?Number(talent[1]):0,name:source?.name||(path==='moonsignAfterSkillBurst'?'Lueur ascendante · Résonance de Clair de lune':path.replace(/([a-z])([A-Z])/g,'$1 $2').replace(/_/g,' ')),description:source?.description||source?.descriptionRaw||reviewed?.[2]||'',options,buff:effect.buff,effectRoots:effect.roots};
 })};
 const record=output.characters[key];
 const sourceStats=new Set(),seenSources=new WeakSet();
 const scanSources=node=>{if(!node||typeof node!=='object'||seenSources.has(node))return;seenSources.add(node);if(node.operation==='read'&&node.path?.length===2){const [root,stat]=node.path;if(root==='base'&&stat==='atk')sourceStats.add('baseAtk');else if(['total','premod'].includes(root)){const sourceKey=({hp:'hp',atk:'atk',def:'def',eleMas:'em',enerRech_:'er'})[stat];if(sourceKey)sourceStats.add(sourceKey);}}for(const child of Object.values(node))if(child&&typeof child==='object')scanSources(child);};
 for(const root of ['premod','teamBuff','total','special'])scanSources(engine.characters[key]?.sheetData?.[root]);
 record.sourceStats=[...sourceStats];
 record.kitBuffs=Object.entries(sourceTalents).map(([talent,source])=>{
  const paragraphs=source.description.split(/\n+/).map(text=>text.trim()).filter(Boolean);
  const effects=paragraphs.filter(text=>/augment|bonus|diminu|r[eé]du|conf[eè]re|obtien|ignor|convert|infus|restaur|r[eé]cup[eè]r/i.test(text)&&!/^Niveau (?:max|d'aptitude)/i.test(text));
  const conditions=record.conditions.filter(condition=>condition.talent===talent);
  return {talent,name:source.name,effects,conditions:conditions.map(condition=>condition.path),manual:conditions.length>0};
 }).filter(row=>row.effects.length||row.manual);
}
// Replace the finished file atomically: Windows readers may keep the current
// manifest open while the lab is running.
const manifestPath='data/lab-character-conditions.json',temporaryPath=manifestPath+'.tmp';
fs.writeFileSync(temporaryPath,JSON.stringify(output,null,2)+'\n');
fs.renameSync(temporaryPath,manifestPath);
console.log(JSON.stringify({characters:Object.keys(output.characters).length,conditions:Object.values(output.characters).reduce((n,c)=>n+c.conditions.length,0),withText:Object.values(output.characters).flatMap(c=>c.conditions).filter(c=>c.description).length}));
