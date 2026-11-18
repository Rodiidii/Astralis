import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const read=name=>JSON.parse(fs.readFileSync(path.join(root,name),'utf8'));
const snapshot=read('data/lab-source-snapshot.json');
const rows=read('assets/data/gi-weapons.json'),stats=read('data/lab-db-weapon-stats.json');
const ids=read('vendor/genshin-optimizer-source/libs/gi/dm/src/dm/weapon/WeaponExcelConfigData_idmap_gen.json');
const aliases=read('public/gi-name-aliases.json').weapons;
const fold=value=>String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/gi,'').toLowerCase();
const overrides={'11419':'prizedisshinblade','11420':'prizedisshinblade-01','11421':'prizedisshinblade-02'};
const types={FIGHT_PROP_CRITICAL:'critRate_',FIGHT_PROP_CRITICAL_HURT:'critDMG_',FIGHT_PROP_HP_PERCENT:'hp_',FIGHT_PROP_ATTACK_PERCENT:'atk_',FIGHT_PROP_DEFENSE_PERCENT:'def_',FIGHT_PROP_CHARGE_EFFICIENCY:'enerRech_',FIGHT_PROP_ELEMENT_MASTERY:'eleMas',FIGHT_PROP_PHYSICAL_ADD_HURT:'physical_dmg_'};
const result={},missing=[];
for(const weapon of rows){
 const id=String(weapon.id),names=[ids[id],...(aliases.find(row=>row.id===id)?.en||[])].filter(Boolean);
 const key=overrides[id]||Object.keys(stats).find(key=>names.some(name=>fold(key)===fold(name)));
 const row=stats[key];
 if(!row){missing.push({id,name:weapon.name});continue;}
 const entry={mainStat:{type:'atk',base:row.base.attack,curve:row.curve.attack},ascensionBonus:{atk:row.promotion.map(row=>row.attack)},source:'https://raw.githubusercontent.com/theBowja/genshin-db/8e5badd60b5d894284ccc927a56c9683529d2592/src/data/stats/weapons.json',sourceKey:key};
 if(row.specialized&&row.curve.specialized&&Number.isFinite(row.base.specialized))entry.subStat={type:types[row.specialized],base:row.base.specialized,curve:row.curve.specialized};
 // Some temporary quest blades have an explicitly absent secondary stat.
 if(!entry.subStat&&weapon.mainStatType)entry.subStat={type:types[weapon.mainStatType],base:0,curve:'GROW_CURVE_CRITICAL_201'};
 result[id]=entry;
}
if(missing.length)throw new Error('Exact weapon mappings missing: '+JSON.stringify(missing));
snapshot.weapons=result;
fs.writeFileSync(path.join(root,'data/lab-source-snapshot.json'),JSON.stringify(snapshot)+'\n');
console.log(Object.keys(result).length+' weapon baselines mapped by exact identity');
