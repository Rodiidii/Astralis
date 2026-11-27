import test from 'node:test';
import assert from 'node:assert/strict';
import {sheetPalette,recolorBackdrop} from '../src/sheet-palette.js';
const fallback={e1:'#aabbcc',e2:'#ddeeff',e3:'#111111',e4:'#222222'};
test('les palettes personnelles des sept éléments et des personnages du même élément restent distinctes',()=>{
 const colours=['#e8a276','#63c9ed','#c1dbf0','#d9a2f4','#8ad19c','#f1cf82','#89dbca'];
 const palettes=colours.map(accent=>sheetPalette({palette:{accent,secondary:'#d4a6bc'}},{},fallback));
 assert.equal(new Set(palettes.map(p=>p.e3)).size,7);assert.equal(new Set(palettes.map(p=>p.e1)).size,7);
 const a=sheetPalette({element:'electro',palette:{accent:'#dfa2d8',secondary:'#719dea'}},{},fallback),b=sheetPalette({element:'electro',palette:{accent:'#8cbbdf',secondary:'#95dfb6'}},{},fallback);
 assert.notEqual(a.e3,b.e3);assert.notEqual(a.secondary,b.secondary);
});
test('une palette manuelle reste prioritaire et les thèmes très sombres deviennent lisibles',()=>{
 assert.deepEqual(sheetPalette({palette:{accent:'#edbd87'}},{element:'pyro'},fallback),fallback);
 const p=sheetPalette({palette:{accent:'#010101'}},{accent:'#9473ad'},fallback);assert.notEqual(p.e1,'#010101');assert.equal(p.secondary,'#af96c2');
 const dark=sheetPalette({palette:{accent:'#010101'}},{},fallback);assert.notEqual(dark.e1,'#010101');
});
test('le décor entier adopte la palette, sans remplacement en cascade des couleurs',()=>{
 const original={e1:'#aabbcc',e2:'#ddeeff',e3:'#111111',e4:'#222222'},next={e1:'#ddeeff',e2:'#123456',e3:'#654321',e4:'#777777'};
 assert.equal(recolorBackdrop('<g fill="#aabbcc" stroke="#ddeeff"/><rect fill="#111111"/><path fill="#222222"/>',original,next),'<g fill="#ddeeff" stroke="#123456"/><rect fill="#654321"/><path fill="#777777"/>');
});
