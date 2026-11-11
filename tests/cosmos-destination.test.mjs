import test from 'node:test';
import assert from 'node:assert/strict';
import {orbitTrackPosition} from '../src/dashboard-voyage.js';
import {replaceMapBackground} from '../src/cosmos-planet.js';
import {WIDGETS,normalizeLayout,CELESTIAL_ICONS} from '../src/dashboard-studio.js';

test('le blanc extérieur devient exactement #20638C sans effacer la neige isolée',()=>{
 const bytes=new Uint8ClampedArray(5*5*4).fill(255);
 for(let y=1;y<4;y++)for(let x=1;x<4;x++)bytes.set([20,70,80,255],(y*5+x)*4);
 bytes.set([255,255,255,255],(2*5+2)*4);bytes.set([220,220,220,255],4);
 replaceMapBackground(bytes,5,5);
 assert.deepEqual([...bytes.slice(0,8)],[32,99,140,255,32,99,140,255]);
 assert.deepEqual([...bytes.slice(48,52)],[255,255,255,255]);
 assert.deepEqual([...bytes.slice(24,28)],[20,70,80,255]);
});

test('les orbites par défaut restent sur trois pistes séparées pendant une heure',()=>{
 for(let seconds=0;seconds<=3600;seconds+=7){
  const radii=new Map();
  for(let index=0;index<12;index++){
   const track=index%3,p=orbitTrackPosition(index,12,seconds*2*Math.PI/(90+track*45));
   const tilt=-8*Math.PI/180,x=p.x-50,y=p.y-50;
   const radius=Math.hypot(x*Math.cos(tilt)+y*Math.sin(tilt),(-x*Math.sin(tilt)+y*Math.cos(tilt))/.85);
   assert.ok(Math.abs(radius-(25+track*9.5))<1e-9);
   assert.ok(p.x>5&&p.x<95&&p.y>5&&p.y<95);
   radii.set(track,radius);
  }
  assert.ok(radii.get(1)-radii.get(0)>9.49);assert.ok(radii.get(2)-radii.get(1)>9.49);
 }
});

test('les orbites libres restent bornées et le mémo est retiré des sauvegardes',()=>{
 const point=orbitTrackPosition(0,10,0,{radius:1000,tilt:90},true);assert.equal(point.radius,44);
 assert.equal(WIDGETS.enka,undefined);
 assert.deepEqual(normalizeLayout({widgets:[{id:'enka'},{id:'wall'}]}).widgets.map(w=>w.id),['wall']);
 for(const kind of ['mars','neptune','ice','venus','mercury','gas','lava'])assert.ok(CELESTIAL_ICONS[kind]);
});
