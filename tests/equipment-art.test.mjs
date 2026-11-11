import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {EQUIPMENT_ART,equipmentArtwork} from '../src/equipment-art.js';
import {imageSet} from '../src/data.js';
const root=new URL('../',import.meta.url),read=p=>readFileSync(new URL(p,root));
test('toutes les armes et pièces référencées ont leur PNG local valide et leur source tracée',()=>{
 const report=JSON.parse(read('assets/genshin/equipment/sources.json'));assert.equal(report.missing.length,0);assert.equal(report.files.length,Object.keys(EQUIPMENT_ART).length);
 for(const file of report.files){const raw=read(file.path);assert.deepEqual([...raw.subarray(0,8)],[137,80,78,71,13,10,26,10]);assert.equal(createHash('sha256').update(raw).digest('hex'),file.sha256);assert.ok(Math.min(...file.size)>=96);assert.equal(equipmentArtwork(file.filename),file.path);}
 for(const kind of ['weapons','artifacts'])for(const row of JSON.parse(read('assets/data/gi-'+kind+'.json'))){const keys=kind==='weapons'?['filename_icon']:['filename_flower','filename_plume','filename_sands','filename_goblet','filename_circlet'];for(const key of keys)if(row.images[key])assert.ok(equipmentArtwork(row.images[key]),row.id+':'+key);}
});
test('le catalogue priorise les illustrations locales, y compris les sets à diadème seul',()=>{
 for(const row of JSON.parse(read('assets/data/gi-weapons.json')))assert.equal(imageSet('gi',row,'weapon')[0],equipmentArtwork(row.images.filename_icon));
 for(const row of JSON.parse(read('assets/data/gi-artifacts.json')))assert.equal(imageSet('gi',row,'artifact')[0],equipmentArtwork(row.images.filename_flower||row.images.filename_circlet));
 assert.equal(equipmentArtwork('visuel-inconnu'),null);
});

test('une pièce Enka utilise le fichier local et une image personnelle garde la priorité',()=>{
 const source=read('src/app.js').toString(),context={equipmentArtwork,imageSet};vm.createContext(context);
 for(const name of ['giArtifactPieceImage','giBuildPieceImages']){const a=source.indexOf('function '+name+'(');vm.runInContext(source.slice(a,source.indexOf('\nfunction ',a+12)),context);}
 const set=JSON.parse(read('assets/data/gi-artifacts.json')).find(set=>set.id===15040),image='https://enka.network/ui/'+set.images.filename_goblet+'.png';
 assert.equal(context.giBuildPieceImages({image},set,3)[0],equipmentArtwork(set.images.filename_goblet));
 assert.equal(context.giBuildPieceImages({image:'data:image/png;base64,personnelle'},set,3)[0],'data:image/png;base64,personnelle');
});
