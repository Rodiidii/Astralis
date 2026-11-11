import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {normalizeEnkaArtifact,enkaReferenceConfiguration,enkaReferenceValid} from '../src/build-model.js';
const imported=()=>{
 const build={character:'10000114',weapon:'11517',level:90,weaponLevelValue:90,weaponRefinement:1,constellation:'C0',pieces:[{set:'15040',mainType:'cryoDmg',mainValue:46.6,substats:[{type:'atkPct',value:10}]}],enkaBaseStats:{hp:12000,atk:900,def:800}};
 build.enkaReference={configuration:enkaReferenceConfiguration(build)};return build;
};
test('une référence Enka inchangée reste exacte, quel que soit le nom ou la présentation',()=>{
 const build=imported();assert.equal(enkaReferenceValid(build),true);assert.equal(enkaReferenceValid({...build,name:'Mon build',color:'#ff33ff',notes:'Note'}),true);
 assert.equal(enkaReferenceValid({...build,level:'90',weaponLevelValue:'90'}),true);
});
test('tous les changements de combat invalident la référence observée',()=>{
 const build=imported();
 for(const change of [{weapon:'11101'},{character:'10000089'},{weaponRefinement:5},{constellation:'C2'},{level:80},{weaponLevelValue:80},{ascended:false},{weaponAscended:false},{set:'autre'},{set2:'autre'},{setMode:'two-two'},{tcSettings:{setConditions:{active:true}}},{pieces:[{...build.pieces[0],mainValue:34.8}]},{pieces:[{...build.pieces[0],substats:[{type:'atkPct',value:20}]}]}])assert.equal(enkaReferenceValid({...build,...change}),false,JSON.stringify(change));
});
test('les champs de sous-stats édités remplacent aussi la référence, sans dépendre de leur ordre',()=>{
 const build=imported(),edited={...build,pieces:[{...build.pieces[0],sub0Type:'atkPct',sub0Value:15}]};
 assert.equal(enkaReferenceValid(edited),false);
 const conditions={...build,tcSettings:{b:2,a:{d:4,c:3}}};conditions.enkaReference={configuration:enkaReferenceConfiguration(conditions)};
 assert.equal(enkaReferenceValid({...conditions,tcSettings:{a:{c:3,d:4},b:2}}),true);
});
test('un ancien snapshot non traçable ou une base inconnue ne devient pas une référence fiable',()=>{
 const build=imported();assert.equal(enkaReferenceValid({...build,enkaReference:{weapon:build.weapon,level:90,weaponLevel:90,sets:'15040'}}),false);
 assert.equal(enkaReferenceValid({...build,enkaBaseStats:{hp:null,atk:900,def:800}}),false);
});

test('une réparation d’ancien import ne certifie pas la configuration d’un profil différent',()=>{
 const source=readFileSync(new URL('../src/app.js',import.meta.url),'utf8'),a=source.indexOf('function repairStoredEnkaBuild('),body=source.slice(a,source.indexOf('\nfunction ',a+12));
 const avatar={avatarId:10000114,equipList:[{reliquary:{level:21},flat:{icon:'FixtureGoblet',equipType:'EQUIP_RING',reliquaryMainstat:{mainPropId:'FIGHT_PROP_ICE_ADD_HURT',statValue:46.6}}}]};
 const context={state:{catalogs:{'gi:character':[{_id:'skirk',id:10000114}]},giProfile:{avatarInfoList:[avatar]}},normalizeEnkaArtifact};
 vm.createContext(context);vm.runInContext(body,context);
 const build={source:'enka',enkaRevision:1,character:'skirk',weapon:'arme-modifiée',pieces:[{},{},{},{image:'https://enka.network/ui/FixtureGoblet.png',level:21,mainType:'hpPct',mainValue:7},{}]};
 const repaired=context.repairStoredEnkaBuild(build);assert.equal(repaired.pieces[3].mainType,'cryoDmg');assert.equal(repaired.pieces[3].mainValue,46.6);assert.equal(repaired.pieces[3].level,20);
 assert.equal(repaired.enkaReference.configuration,null);assert.equal(enkaReferenceValid(repaired),false);assert.equal(build.pieces[3].mainType,'hpPct');
});
