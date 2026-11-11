import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {farmArtwork,FARM_ART} from '../src/farm-art.js';
import {imageSet} from '../src/data.js';
const root=new URL('../',import.meta.url),read=p=>readFileSync(new URL(p,root)),json=p=>JSON.parse(read(p));
test('tous les matériaux de niveaux et talents ont une image locale originale vérifiable',()=>{
 const ids=new Set(['202','104001','104002','104003']);
 for(const c of json('assets/data/gi-characters.json'))for(const rows of Object.values(c.costs||{}))for(const row of rows)ids.add(String(row.id));
 for(const c of Object.values(json('data/gi-talent-costs.json')))for(const rows of Object.values(c.costs||{}))for(const row of rows)ids.add(String(row.id));
 const catalog=json('assets/data/gi-materials.json');for(const id of ids){const item=catalog.find(m=>String(m.id)===id);assert.ok(item,id);assert.ok(farmArtwork(item.images.filename_icon),id);assert.equal(imageSet('gi',item,'material')[0],farmArtwork(item.images.filename_icon));}
 const report=json('assets/genshin/farm-materials/sources.json');assert.equal(report.missing.length,0);assert.equal(report.files.length,Object.keys(FARM_ART).length);
 for(const row of report.files){const bytes=read(row.path);assert.deepEqual([...bytes.subarray(0,8)],[137,80,78,71,13,10,26,10]);assert.equal(createHash('sha256').update(bytes).digest('hex'),row.sha256);assert.ok(Math.min(...row.size)>=96);assert.match(row.url,/^https:\/\/(?:enka.network|gi.yatta.moe)\//);}
 assert.equal(farmArtwork('inconnu'),null);
});
