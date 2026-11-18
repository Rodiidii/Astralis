import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {allStats,conditionals,formulas} from '../public/lab-complete-engine.js';
const root=path.resolve(import.meta.dirname,'..'),source=path.join(root,'vendor/genshin-optimizer-source');
const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const sourceJSON=file=>JSON.parse(fs.readFileSync(path.join(source,file),'utf8'));
const cache=path.join(process.env.TEMP,'astralis-npm-cache/_npx');
const tsPath=fs.readdirSync(cache).map(name=>path.join(cache,name,'node_modules/typescript/lib/typescript.js')).find(file=>fs.existsSync(file));
if(!tsPath)throw new Error('TypeScript parser missing from task cache.');
const ts=createRequire(import.meta.url)(tsPath);
const fold=text=>String(text||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const aliases=read('public/gi-name-aliases.json');
const ids={character:sourceJSON('libs/gi/dm/src/dm/character/AvatarExcelConfigData_idmap_gen.json'),weapon:sourceJSON('libs/gi/dm/src/dm/weapon/WeaponExcelConfigData_idmap_gen.json')};
const dictionaries={};
for(const folder of ['libs/gi/localization/assets/locales/fr','libs/gi/dm-localization/assets/locales/fr'])for(const name of fs.readdirSync(path.join(source,folder))){
 if(name.endsWith('.json'))dictionaries[name.slice(0,-5)]=sourceJSON(folder+'/'+name);
}
const get=(namespace,key)=>key.split('.').reduce((data,key)=>data?.[key],dictionaries[namespace]);
const flatten=value=>typeof value==='string'?value:Array.isArray(value)?value.map(flatten).join(' '):value&&typeof value==='object'?Object.values(value).map(flatten).join(' '):'';
const plain=value=>flatten(value).replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
function translation(node,sheet){
 if(!node)return '';
 if(ts.isStringLiteral(node)||ts.isNoSubstitutionTemplateLiteral(node))return node.text;
 if(!ts.isCallExpression(node))return '';
 const fn=node.expression.getText(),arg=node.arguments[0];if(!arg||!ts.isStringLiteral(arg))return '';
 const namespace=fn.endsWith('.chg')?'char_'+sheet+'_gen':fn.endsWith('.ch')?'char_'+sheet:fn==='st'?'sheet':fn==='stg'?'stat_gen':'';
 return namespace?plain(get(namespace,arg.text)):'';
}
const humanize=text=>String(text).replace(/([a-z])([A-Z])/g,'$1 $2').replace(/_/g,' ').replace(/^c(\d)/,'C$1').trim();
const ui={};
const sheetsFolder=path.join(source,'libs/gi/formula-ui/src/char/sheets');
for(const name of fs.readdirSync(sheetsFolder)){
 if(!name.endsWith('.tsx'))continue;
 const key=name.slice(0,-4),text=fs.readFileSync(path.join(sheetsFolder,name),'utf8');
 const tree=ts.createSourceFile(name,text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),entry={conditions:{},formulas:{}};
 function section(node){for(let p=node;p;p=p.parent)if(ts.isPropertyAssignment(p)){const key=p.name.getText().replace(/["']/g,'');if(/^(auto|skill|burst|passive\d|constellation\d)$/.test(key))return key;}return '';}
 function nearbyLabel(node){for(let p=node;p;p=p.parent){if(ts.isObjectLiteralExpression(p)){const label=p.properties.find(prop=>ts.isPropertyAssignment(prop)&&['label','title'].includes(prop.name.getText().replace(/["']/g,'')));if(label){const value=translation(label.initializer,key);if(value)return value;}}if(ts.isCallExpression(p)){for(const arg of p.arguments)if(ts.isObjectLiteralExpression(arg)){const label=arg.properties.find(prop=>ts.isPropertyAssignment(prop)&&prop.name.getText()==='label');if(label){const value=translation(label.initializer,key);if(value)return value;}}}if(ts.isPropertyAssignment(p)&&/^(auto|skill|burst|passive|constellation)/.test(p.name.getText()))break;}return '';}
 function visit(node){
  if(ts.isPropertyAccessExpression(node)&&ts.isIdentifier(node.expression)&&['cond','formula'].includes(node.expression.text)){
   const table=node.expression.text==='cond'?entry.conditions:entry.formulas;
   const name=node.name.text,group=section(node),label=nearbyLabel(node);
   if(!table[name]||label)table[name]={section:group,label};
  }
  ts.forEachChild(node,visit);
 }
 visit(tree);ui[key]=entry;
}
const basic={normal:'Attaque normale',charged:'Attaque chargée',plunging:'Attaque plongeante',skill:'Compétence élémentaire',burst:'Déchaînement élémentaire',elemental:'Coup supplémentaire'};
const catalog={revision:read('data/lab-source-snapshot.json').revision,characters:{},weapons:{},sets:{},sheets:{}};
for(const row of read('assets/data/gi-characters.json'))catalog.characters[String(row.id)]={key:ids.character[String(row.id)]||null,name:row.name,combat:!!allStats.char.data[ids.character[String(row.id)]]};
for(const row of read('assets/data/gi-weapons.json')){
 const key=ids.weapon[String(row.id)];catalog.weapons[String(row.id)]={key:key==='PrizedIsshinBlade'?'KagotsurubeIsshin':key,name:row.name,variant:key==='PrizedIsshinBlade'?String(row.id):null};
}
for(const row of aliases.artifacts){const key=Object.keys(allStats.art.data).find(key=>row.en.some(name=>fold(name)===fold(key)));catalog.sets[row.id]={key:key||null,name:row.fr[0]};}
const sourceNames=Object.fromEntries([...Object.values(catalog.characters),...Object.values(catalog.weapons),...Object.values(catalog.sets)].filter(row=>row.key).map(row=>[row.key,row.name]));
for(const key of new Set([...Object.keys(conditionals),...Object.keys(formulas)])){
 const isChar=!!allStats.char.skillParam[key],namespace=(isChar?'char_':allStats.weapon.data[key]?'weapon_':'artifact_')+key;
 const conditions=Object.entries(conditionals[key]||{}).map(([name,meta])=>{
  const info=ui[key]?.conditions[name]||{},section=info.section||(/^c\d/i.test(name)?'constellation'+name.match(/^c(\d)/i)[1]:'');
  const official=get(namespace+'_gen',section),sectionName=plain(official?.name)||basic[section]||'';
  const custom=plain(get(namespace,name))||plain(get(namespace,name+'.condName'))||plain(get(namespace,name+'.name'));
  const label=info.label||custom||(sectionName?(sectionName+' — '+(/stack|count|num/i.test(name)?'cumuls / nombre':'condition')):humanize(name));
  return {...meta,label,section,description:plain(official?.description),constellation:Number(section.match(/^constellation(\d)/)?.[1]||0)};
 });
 const attacks=Object.values(formulas[key]||{}).filter(row=>['dmg','trans','transCrit','swirl'].includes(row.tag.q)).map(row=>{
  const info=ui[key]?.formulas[row.name]||{},move=row.tag.move||'elemental';
  const normal=row.name.match(/^normal_(\d+)$/),fallback=normal?'Attaque normale — coup '+(Number(normal[1])+1):plain(get(namespace,row.name))||plain(get(namespace,row.name+'.name'))||basic[move]+' — '+humanize(row.name);
  return {sheet:key,name:row.name,tag:row.tag,label:info.label||fallback,kind:move==='plunging'?'plunge':move==='elemental'?'weapon':move};
 });
 catalog.sheets[key]={name:sourceNames[key]||plain(get(namespace+'_gen','name'))||key,conditions,attacks};
}
const missing={characters:Object.entries(catalog.characters).filter(([,row])=>!row.combat&&row.key!=='Traveler'),weapons:Object.entries(catalog.weapons).filter(([,row])=>!allStats.weapon.data[row.key]),sets:Object.entries(catalog.sets).filter(([,row])=>!row.key)};
fs.writeFileSync(path.join(root,'public/lab-complete-catalog.js'),'// Generated from pinned formula descriptors and French game text.\nexport default '+JSON.stringify(catalog)+';\n');
console.log(JSON.stringify({sheets:Object.keys(catalog.sheets).length,missing},null,2));
