import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const cache=path.join(process.env.TEMP,'astralis-npm-cache/_npx');
const modulePath=fs.readdirSync(cache).map(dir=>path.join(cache,dir,'node_modules/typescript/lib/typescript.js')).find(file=>fs.existsSync(file));
const ts=createRequire(import.meta.url)(modulePath);
const normalize=value=>value.replace(/^cond(?=[A-Z])/,'').toLowerCase();
export function formulaProvenance(character,conditions){
 const key=character.replace(/^(Traveler.+)[MF]$/,'$1');
 const filename=`vendor/genshin-optimizer-source/libs/gi/formula/src/data/char/${key}.ts`;
 if(!fs.existsSync(filename))return {};
 const source=ts.createSourceFile(filename,fs.readFileSync(filename,'utf8'),ts.ScriptTarget.Latest,true),definitions=new Map(),seeds=new Map();
 const talentName=id=>id==='normal'||id==='charged'||id==='plunging'?'combat1':id==='skill'?'combat2':id==='burst'?'combat3':id.replace(/^constellation/,'c');
 for(const statement of source.statements){if(!ts.isVariableStatement(statement))continue;
  for(const decl of statement.declarationList.declarations){
   if(!decl.initializer)continue;
   const text=decl.initializer.getText(source);
   if(ts.isObjectBindingPattern(decl.name)&&/all\w*Conditionals\(/.test(text))for(const field of decl.name.elements){
    const name=field.name.getText(source),original=field.propertyName?.getText(source)||name;
    const matched=conditions.find(value=>normalize(value)===normalize(original));if(matched)seeds.set(name,new Set([matched]));
   }
   if(ts.isIdentifier(decl.name))definitions.set(decl.name.text,decl.initializer);
  }
 }
 const memo=new Map(),expand=(name,visiting=new Set())=>{
  if(memo.has(name))return memo.get(name);
  const result={conditions:new Set(seeds.get(name)||[]),talents:new Set()};if(visiting.has(name))return result;
  const node=definitions.get(name);if(!node)return result;
  const next=new Set(visiting).add(name);
  const walk=part=>{
   if(ts.isPropertyAccessExpression(part)&&ts.isIdentifier(part.expression)&&part.expression.text==='dm')result.talents.add(talentName(part.name.text));
   if(ts.isIdentifier(part)&&!(ts.isPropertyAccessExpression(part.parent)&&part.parent.name===part)&&!(ts.isPropertyAssignment(part.parent)&&part.parent.name===part)){
    const child=expand(part.text,next);for(const value of child.conditions)result.conditions.add(value);for(const value of child.talents)result.talents.add(value);
   }
   ts.forEachChild(part,walk);
  };walk(node);memo.set(name,result);return result;
 };
 const out={};for(const name of definitions.keys()){
  const result=expand(name);for(const condition of result.conditions){out[condition]??=new Set();for(const talent of result.talents)if(/^(combat[123]|passive[123]|lockedPassive|c[1-6])$/.test(talent))out[condition].add(talent);}
 }
 return Object.fromEntries(Object.entries(out).map(([condition,talents])=>[condition,[...talents]]));
}
