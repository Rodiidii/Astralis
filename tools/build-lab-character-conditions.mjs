import fs from 'node:fs';
import * as engine from '../public/lab-wr-engine.js';
const snapshot=JSON.parse(fs.readFileSync('data/lab-kit-snapshot.json','utf8'));
const aliases=JSON.parse(fs.readFileSync('public/gi-name-aliases.json','utf8'));
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/gi,'').toLowerCase();
const output={revision:snapshot.revisions,characters:{}};
for(const key of Object.keys(engine.characters)){
 const paths=engine.conditionalPaths.characters[key]||[];
 const alias=aliases.characters.find(a=>(a.en||[]).some(name=>norm(name)===norm(key))),id=alias?.id;

 const kit=snapshot.characters[id],talents=kit?.talents||{},constellations=kit?.constellations||{};
 output.characters[key]={id,name:kit?.name||alias?.fr?.[0]||key,conditions:paths.map(path=>{
  const c=path.match(/(?:constellation|(?:^|[^a-z])c|[a-z]c)([1-6])/i)||path.match(/^c([1-6])/i);
  const passive=path.match(/(?:a|ascension|passive)([124])/i);
  let talent=c?'c'+c[1]:passive?'passive'+(Number(passive[1])===4?2:1):/burst|afterq|fanfare|overstack/i.test(path)?'combat3':/skill|aftere|shield|coil|mirrors|bond/i.test(path)?'combat2':null;
  const overrides={
   Albedo:{p1EnemyHp:'passive1'},Alhaitham:{debateStacks:'passive2',excessMirror:'c6'},
   Bennett:{activeInArea:'combat3',underHP:'combat3'},Collei:{offField:'c6'},
   Eula:{Grimheart:'combat2',LightfallSword:'combat3',TidalIllusion:'c1'},Freminet:{stalk:'combat2'},
   Gorou:{inField:'combat2'},HuTao:{GuideToAfterlifeVoyage:'combat2',FlutterBy:'passive1',SanguineRouge:'passive2',GardenOfEternalRest:'c4',ButterflysEmbrace:'c6'},
   KamisatoAyaka:{afterSprint:'passive2'},Keqing:{afterRecast:'combat2',afterReact:'c4'},
   Klee:{ExplosiveFrags:'passive1',BlazingDelight:'c6'},KukiShinobu:{underHP:'passive1'},
   Lyney:{propStacks:'combat3'},Mika:{inSoulwind:'combat2'},
   Mona:{Omen:'combat3',ProphecyOfSubmersion:'c1',RhetoricsOfCalamitas:'c4'},Navia:{shotsHit:'combat2'},
   Noelle:{SweepingTime:'combat3'},Razor:{ElectroSigil:'combat2',TheWolfWithin:'combat3'},
   Shenhe:{quill:'combat2'},ShikanoinHeizou:{takeField:'passive1'},Sucrose:{absorption:'c6'},
   Tighnari:{p1AfterWreath:'passive1'},Xiangling:{afterChili:'passive2',afterGuobaHit:'c1',afterPyronado:'c6'},
   Xiao:{offField:'passive2'},Xilonen:{sourceActive:'combat2',nsBlessing:'combat2'},Yanfei:{p1Seals:'passive1'},Yaoyao:{adeptalLegacy:'combat3'},Zhongli:{p1:'passive1'}
  };
  talent=overrides[key]?.[path]||talent;
  // Mechanic locks shared across characters have no single talent owner.
  if(/^lock/.test(path))talent=null;
  const source=talent?.startsWith('c')&&!talent.startsWith('combat')?constellations[talent]:talents[talent];
  const options=engine.conditionOptions(key,path);
  return {path,talent,constellation:talent?.match(/^c([1-6])$/)?Number(talent[1]):0,name:source?.name||path.replace(/([a-z])([A-Z])/g,'$1 $2').replace(/_/g,' '),description:source?.description||source?.descriptionRaw||'',options};
 })};
}
fs.writeFileSync('data/lab-character-conditions.json',JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify({characters:Object.keys(output.characters).length,conditions:Object.values(output.characters).reduce((n,c)=>n+c.conditions.length,0),withText:Object.values(output.characters).flatMap(c=>c.conditions).filter(c=>c.description).length}));
