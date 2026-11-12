import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {buildCardCatalog,SPECIAL_ROSTERS} from '../src/card-catalog.js';

const {cards,catalogs}=JSON.parse(await readFile(new URL('../public/card-catalog.json',import.meta.url),'utf8'));
test('les listes de rareté fournies sont respectées',()=>{
 for(const [rarity,expected] of Object.entries({full:90,group:30,secret:20,legend:30,gold:22,astral:20,eternal:17}))assert.equal(cards.filter(card=>card.rarity===rarity).length,expected,rarity);
 assert.ok(!cards.some(card=>/lauma/i.test(card.name)));
 assert.ok(cards.some(card=>card.name==='Huohuo'&&card.rarity==='gold'));
 assert.ok(cards.some(card=>card.name==='The Herta'&&card.rarity==='gold'));
 assert.ok(cards.some(card=>card.name==='The Herta'&&card.rarity==='eternal'));
 assert.ok(cards.some(card=>card.name==='Aha (forme Nihilux)'&&card.rarity==='eternal'));
 assert.equal(Object.values(SPECIAL_ROSTERS.astral).flat().length,20,'la liste nomme 20 Astrales; une 21e entrée manque dans la demande');
 const people=rarity=>new Set(Object.entries(SPECIAL_ROSTERS[rarity]).flatMap(([game,names])=>names.map(name=>game+':'+name)));
 const excluded=new Set([...people('gold'),...people('astral'),...people('legend')]);
 assert.ok([...people('secret')].every(name=>!excluded.has(name)));
 assert.ok([...people('legend')].every(name=>!people('gold').has(name)&&!people('astral').has(name)));
});
test('chaque variante de personnage possède sa propre identité d’illustration',()=>{
 const keys=cards.map(card=>`${card.game}:${card.artSlug}:${card.rarity}`);
 assert.equal(new Set(keys).size,keys.length);
 assert.equal(new Set(cards.map(card=>card.id)).size,cards.length);
 assert.ok(!cards.some(card=>card.name==='{NICKNAME}'));
 assert.deepEqual(buildCardCatalog(catalogs,[]).filter(c=>c.kind==='group').map(c=>c.members.length>1).every(Boolean),true);
});
test('le fichier de référence fourni est conservé octet pour octet',async()=>{
 const reference=JSON.parse(await readFile(new URL('../assets/card-design/reference.json',import.meta.url),'utf8'));
 const bytes=await readFile(new URL('../docs/reference/cards.html',import.meta.url));
 assert.equal(createHash('sha256').update(bytes).digest('hex'),reference.sha256);
 assert.equal(new Set(reference.cards.map(card=>card.rarity)).size,10);
});
test('aucune illustration canonique ne sert à deux cartes',async()=>{
 const manifest=JSON.parse(await readFile(new URL('../public/card-artworks.json',import.meta.url),'utf8'));
 const seen=new Set();
 for(const [key,path] of Object.entries(manifest.assignments)){
  const artwork=manifest.artworks[path];assert.ok(artwork);assert.match(path,/^assets\/card-art\/(gi|hsr|ww)\/[a-z0-9-]+-\d+\.webp$/);
  assert.ok(!seen.has(artwork.sourcePixelSha256||artwork.pixelSha256));seen.add(artwork.sourcePixelSha256||artwork.pixelSha256);
  assert.ok(artwork.width>=500&&artwork.height>=500);
  if(['secret','gold','legend','group','astral','eternal','aeon'].includes(key.split(':').at(-1))){
   assert.ok(!['official-character-poster','official-character-promo','splash-art'].includes(artwork.artType),`${key} ne doit pas utiliser un splash art`);
   assert.doesNotMatch(artwork.title||'',/\b(?:splash(?:\s*art)?|character\s*poster|character\s*promo)\b/i,`${key} titre de splash art interdit`);
  }
 }
});
