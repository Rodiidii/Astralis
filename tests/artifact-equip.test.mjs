import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
test('équiper une pièce remplace image et sous-stats sans modifier l’inventaire',()=>{
 const a=source.indexOf('function giApplyGoodArtifact('),body=source.slice(a,source.indexOf('\nfunction ',a+12));
 const context={structuredClone,giGoodSet:()=>({_id:'set-canonique'}),giOwnedPieceImage:()=> './assets/piece-correcte.png'};vm.createContext(context);vm.runInContext(body,context);
 const artifact={id:'owned-1',slot:'goblet',setKey:'15040',mainType:'cryoDmg',mainValue:46.6,level:20,rarity:5,substats:[{type:'atkPct',value:10},{type:'critRate',value:7.8}]};
 const result=context.giApplyGoodArtifact({pieces:[{image:'ancienne-image',sub3Type:'defFlat',sub3Value:99}]},0,artifact,[]);
 assert.equal(result.image,'./assets/piece-correcte.png');assert.equal(result.set,'set-canonique');assert.equal(result.mainType,'cryoDmg');assert.equal(result.sub0Type,'atkPct');assert.equal(result.sub1Value,7.8);assert.equal(result.sub3Type,'');assert.equal(result.sub3Value,'');result.substats[0].value=999;assert.equal(artifact.substats[0].value,10);
});
