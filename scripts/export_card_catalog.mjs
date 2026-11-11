import {readFile,writeFile} from 'node:fs/promises';
import {buildCardCatalog,cardSlug} from '../src/card-catalog.js';
import {BINDER_CARDS} from '../src/collection-data.js';
const root=new URL('../',import.meta.url);
const read=async name=>JSON.parse(await readFile(new URL(name,root),'utf8'));
const gi=await read('assets/data/gi-characters.json');
const aliases=await read('public/gi-name-aliases.json');
const hsr=await read('assets/data/hsr-nanoka-character.json');
let ww=[];try{ww=await read('assets/data/ww-characters.json')}catch{}
const catalogs={
 'gi:character':gi.map(row=>({...row,enName:aliases.characters.find(alias=>String(alias.id)===String(row.id))?.en?.[0]||row.name,_id:cardSlug(row.name),_name:row.name})),
 'hsr:character':Object.entries(hsr).map(([id,row])=>({...row,id,_id:id,_name:row.fr||row.en,name:row.fr||row.en})),
 'ww:character':ww.map(row=>({...row,_id:String(row.id),_name:row.name||row.en})),
};
const cards=buildCardCatalog(catalogs,BINDER_CARDS.filter(card=>card.kind==='equipment'));
await writeFile(new URL('public/card-catalog.json',root),JSON.stringify({catalogs,cards},null,2));
console.log(`${cards.length} cartes exportées.`);
