import test from 'node:test';
import assert from 'node:assert/strict';
import {Vector3} from '../assets/vendor/three/three.module.js';
import {createRegionalModel,REGIONAL_WORLDS} from '../src/planet-diorama.js';
test('chaque région possède une géométrie de terrain et des volumes détachés de la sphère',()=>{
 for(const region of Object.keys(REGIONAL_WORLDS)){
  const model=createRegionalModel(region);assert.ok(model.terrain.geometry.index.count/3>25000);
  model.update(4,.05);model.scene.updateMatrixWorld(true);let maximum=0;const v=new Vector3();model.surface.traverse(object=>{const p=object.geometry?.attributes.position;if(!p)return;for(let i=0;i<p.count;i+=3){v.fromBufferAttribute(p,i).applyMatrix4(object.matrixWorld);maximum=Math.max(maximum,v.length());}});
  if(region!=='primordial')assert.ok(maximum>1.25,region+' has no substantial 3D relief');
  assert.ok(model.scene.children.length>=5);assert.ok(model.animated.length>0);
  model.update(4,.05);model.dispose();
 }
});
test('les signatures régionales sont des objets 3D, pas des décors dessinés sur une texture',()=>{
 const names=region=>{const model=createRegionalModel(region),result=[];model.scene.traverse(o=>result.push(o.name));model.dispose();return result;};
 assert.equal(names('nodkrai').filter(n=>n==='orbital-moon').length,3);
 assert.equal(names('primordial').filter(n=>n==='tidal-wave').length,4);
 assert.equal(names('natlan').filter(n=>n==='volcano').length,2);
 assert.ok(names('sumeru').includes('desert-pyramid'));
 assert.ok(names('inazuma').includes('lightning-bolt'));
 assert.ok(names('fontaine').includes('waterfall'));
 assert.ok(names('liyue').includes('gold-asteroids'));
 assert.ok(names('snezhnaya').includes('snow-asteroids'));
});
test('la végétation et les montagnes statiques sont regroupées pour réduire les appels GPU',()=>{const model=createRegionalModel('sumeru');assert.ok(model.batchedObjects>100);assert.ok(model.surface.children.some(n=>n.name==='batched-landmarks'));model.dispose();});

import {readFileSync} from 'node:fs';
import {rulerGeometry} from '../src/planet-rulers.js';
const geography=JSON.parse(readFileSync(new URL('../assets/cosmos/map/geography.json',import.meta.url)));
test('les cartes complètes conservent tous les sites, les îles et le relief neigeux',()=>{
 for(const [region,map] of Object.entries(geography.regions)){
  assert.equal(map.projection,'stereographic');
  assert.equal(map.coverage,region==='teyvat'?'entire-teyvat':'entire-region');
  assert.ok(map.sites.every(s=>s.u>=0&&s.u<=1&&s.v>=0&&s.v<=1),region);
  const model=createRegionalModel(region,null,map);
  assert.deepEqual(model.namedLandmarks,map.sites.map(s=>s.name));
  assert.ok(model.terrain.geometry.attributes.uv.count>15000);
  if(region==='nodkrai')assert.ok(model.surface.getObjectByName('fatui-gate'));
  if(region==='mondstadt')assert.ok(model.orbits.getObjectByName('wind-gusts'));
  model.update(0,0);model.update(1,0);model.dispose();
 }
 assert.ok(geography.regions.snezhnaya.heights.filter(h=>h>5).length>1000);
});
test('les trois objets orbitaux ont une silhouette extrudée avec des ouvertures',()=>{
 for(const name of ['death','time','life']){
  const data=JSON.parse(readFileSync(new URL('../assets/cosmos/rulers/'+name+'/shape.json',import.meta.url)));
  assert.ok(data.shapes.some(s=>s.holes.length));const geometry=rulerGeometry(data);
  geometry.computeBoundingBox();assert.ok(geometry.boundingBox.max.z-geometry.boundingBox.min.z>.02);geometry.dispose();
 }
});

test('Natlan projette de la lave avec une vraie colonne de fumée et des cendres',()=>{
 const model=createRegionalModel('natlan',null,geography.regions.natlan),names=[];model.scene.traverse(o=>names.push(o.name));
 assert.equal(names.filter(n=>n==='volcanic-smoke').length,12);assert.ok(names.includes('eruption-column'));assert.ok(names.includes('volcanic-ash'));
 model.update(0,0);const geometry=model.surface.getObjectByName('volcanic-ejecta').geometry;const before=geometry.attributes.position.array.slice();model.update(1,0);assert.notDeepEqual(geometry.attributes.position.array,before);model.dispose();
});

import {mapPoint,geographicalSample} from '../src/planet-geography.js';
test('la projection agrandit les terres sans supprimer les bords des cartes',()=>{
 for(const map of Object.values(geography.regions))for(const [u,v] of [[.01,.01],[.99,.01],[.99,.99],[.01,.99],[.5,.5]]){
  const p=mapPoint(map,u,v),sample=geographicalSample(map,Math.sin(p.lon)*Math.cos(p.lat),Math.sin(p.lat),Math.cos(p.lon)*Math.cos(p.lat));
  assert.ok(Math.abs(sample.u-u)<.00001&&Math.abs(sample.v-v)<.00001);
 }
 const nk=createRegionalModel('nodkrai',null,geography.regions.nodkrai);assert.equal(nk.orbits.getObjectByName('snow-blizzard'),undefined);nk.dispose();
 const thunder=createRegionalModel('inazuma',null,geography.regions.inazuma);let count=0;thunder.scene.traverse(o=>{if(o.name==='lightning-bolt')count++});assert.equal(count,9);thunder.dispose();
});

test('les régions possèdent leurs nouveaux décors en volume',()=>{
 const sumeru=createRegionalModel('sumeru',null,geography.regions.sumeru);assert.ok(sumeru.surface.getObjectByName('tropical-grove'));sumeru.dispose();
 const inazuma=createRegionalModel('inazuma',null,geography.regions.inazuma);assert.ok(inazuma.surface.getObjectByName('sakura-tree'));assert.ok(inazuma.surface.getObjectByName('sakura-petals'));inazuma.dispose();
 const liyue=createRegionalModel('liyue',null,geography.regions.liyue);assert.ok(liyue.secondaryMountains>=15);liyue.dispose();
});

test('Teyvat possède trois lunes sur des orbites inclinées et animées',()=>{const model=createRegionalModel('teyvat',null,geography.regions.teyvat),moons=model.orbits.children.filter(c=>c.name==='central-moon');assert.equal(moons.length,3);model.update(0,0);const before=moons.map(c=>c.position.clone());model.update(2,0);assert.ok(moons.every((c,i)=>c.position.distanceTo(before[i])>.1));model.dispose();});
