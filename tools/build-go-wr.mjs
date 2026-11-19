// Build original WR calculation data, excluding upstream React views.
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const root=path.resolve(import.meta.dirname,'..'),vendor=path.join(root,'vendor'),prefix='genshin-optimizer-source/';
const cache=path.join(process.env.TEMP,'astralis-npm-cache/_npx');
const findModule=name=>{const file=fs.readdirSync(cache).map(dir=>path.join(cache,dir,'node_modules',name)).find(file=>fs.existsSync(file));if(!file)throw new Error('Missing build dependency '+name);return createRequire(import.meta.url)(file);};
const {build}=findModule('esbuild/lib/main.js'),ts=findModule('typescript/lib/typescript.js');
const sourceRoot=path.join(vendor,prefix),tree=JSON.parse(fs.readFileSync(path.join(root,'data/lab-go-tree.json'),'utf8'));
const available=new Set(tree.paths),aliases=JSON.parse(fs.readFileSync(path.join(sourceRoot,'tsconfig.base.json'),'utf8')).compilerOptions.paths;
const sourceFile=file=>ts.createSourceFile(file,fs.readFileSync(path.join(sourceRoot,file),'utf8'),ts.ScriptTarget.Latest,true,file.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
const sheetFiles=tree.paths.filter(file=>/^libs\/gi\/sheets\/src\/(Characters|Weapons|Artifacts)\/.+\/index\.tsx$/.test(file));
sheetFiles.splice(sheetFiles.indexOf('libs/gi/sheets/src/Characters/Traveler/index.tsx'),1);
const printer=ts.createPrinter(),sheetKeys={};
function bindings(name){return ts.isIdentifier(name)?[name.text]:name.elements?.flatMap(element=>ts.isBindingElement(element)?bindings(element.name):[])||[];}
function references(node){const result=new Set();function visit(node){if(ts.isIdentifier(node)&&!(ts.isPropertyAccessExpression(node.parent)&&node.parent.name===node)&&!(ts.isPropertyAssignment(node.parent)&&node.parent.name===node))result.add(node.text);ts.forEachChild(node,visit);}visit(node);return result;}
function mathOnly(file,rootName='data'){
 let tree=sourceFile(file);
 if(rootName!=='data')tree=ts.createSourceFile(file,tree.text.replace(new RegExp('\\b'+rootName+'\\b','g'),'data').replace(/export \{\s*data\s+as\s+reactionData\s*\}/,'export { data }').replace(/export \{\s*data\s+as\s+resonanceData\s*\}/,'export { data }'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 if(!/\b(?:const|let)\s+data\b/.test(tree.text)&&/\b(?:const|let)\s+dataObj\b/.test(tree.text))tree=ts.createSourceFile(file,tree.text.replace(/\bdataObj\b/g,'data'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 const definitions=new Map(),other=[];
 for(const statement of tree.statements){
  if(ts.isVariableStatement(statement))for(const declaration of statement.declarationList.declarations)for(const name of bindings(declaration.name))definitions.set(name,{statement,declaration});
  else if((ts.isFunctionDeclaration(statement)||ts.isClassDeclaration(statement))&&statement.name)definitions.set(statement.name.text,{statement});
  else if(!ts.isImportDeclaration(statement)&&!ts.isExportAssignment(statement)&&!ts.isExportDeclaration(statement)&&!ts.isInterfaceDeclaration(statement)&&!ts.isTypeAliasDeclaration(statement))other.push(statement);
 }
 if(!definitions.has('data')){
  if(file.includes('/Traveler')){
   sheetKeys[file]=file.split('/').at(-2);
   return fs.readFileSync(path.join(sourceRoot,file),'utf8').replace(/export default (travelerSheet\([^\n]+\))/,'export const data = $1.data');
  }
  throw new Error('No calculation data export in '+file);
 }
 const key=definitions.get('key')?.declaration?.initializer;
 sheetKeys[file]=key&&ts.isStringLiteral(key)?key.text:file.split('/').at(-2);
 const needed=new Set(['data']),included=new Set();
 let changed=true;
 while(changed){changed=false;for(const name of [...needed]){
  const declaration=definitions.get(name);if(!declaration||included.has(declaration.declaration||declaration.statement))continue;
  included.add(declaration.declaration||declaration.statement);changed=true;
  for(const reference of references(declaration.declaration?.initializer||declaration.statement))needed.add(reference);
 }for(const statement of other){if(included.has(statement))continue;const refs=references(statement);if([...refs].some(name=>needed.has(name)&&definitions.has(name))){included.add(statement);changed=true;for(const ref of refs)needed.add(ref);}}}
 const statements=[];
 for(const statement of tree.statements){
  if(ts.isImportDeclaration(statement)){
   const clause=statement.importClause;if(!clause||clause.isTypeOnly)continue;
   const defaultName=clause.name&&needed.has(clause.name.text)?clause.name:undefined;
   let named;
   if(clause.namedBindings){if(ts.isNamespaceImport(clause.namedBindings)){if(needed.has(clause.namedBindings.name.text))named=clause.namedBindings;}else{const values=clause.namedBindings.elements.filter(element=>!element.isTypeOnly&&needed.has(element.name.text));if(values.length)named=ts.factory.updateNamedImports(clause.namedBindings,values);}}
   if(defaultName||named)statements.push(ts.factory.updateImportDeclaration(statement,statement.modifiers,ts.factory.updateImportClause(clause,false,defaultName,named),statement.moduleSpecifier,statement.attributes));
  }else if(ts.isVariableStatement(statement)){
   const declarations=statement.declarationList.declarations.filter(declaration=>included.has(declaration));
   if(declarations.length)statements.push(ts.factory.updateVariableStatement(statement,statement.modifiers,ts.factory.updateVariableDeclarationList(statement.declarationList,declarations)));
  }else if(included.has(statement))statements.push(statement);
 }
 const output=printer.printFile(ts.factory.updateSourceFile(tree,statements));
 const data=definitions.get('data').statement;
 return output+(data.modifiers?.some(mod=>mod.kind===ts.SyntaxKind.ExportKeyword)?'':'\nexport { data };\n');
}
// All roots are independently present before following their numerical helpers.
const transformed=new Map(sheetFiles.map(file=>[prefix+file,mathOnly(file)]));
for(const [file,key]of [['Reaction.tsx','reactionData'],['Resonance.tsx','resonanceData']])transformed.set(prefix+'libs/gi/sheets/src/'+file,mathOnly('libs/gi/sheets/src/'+file,key));
let entry="export * from './genshin-optimizer-source/libs/gi/wr/src/index.ts';\nexport {computeUIData,uiDataForTeam} from './genshin-optimizer-source/libs/gi/uidata/src/index.ts';\nexport {allStats,getCharStat,getCharEle} from './genshin-optimizer-source/libs/gi/stats/src/index.ts';\nexport {dataObjForCharacterNew,dataObjForWeapon,dataObjForArtifact} from './genshin-optimizer-source/libs/gi/wr/src/api.ts';\nexport {common,input,active,inactive1,inactive2,inactive3} from './genshin-optimizer-source/libs/gi/wr/src/formula.ts';\nexport {allArtifactSetKeys} from './genshin-optimizer-source/libs/gi/consts/src/index.ts';\n";
const registries={Characters:[],Weapons:[],Artifacts:[]};
sheetFiles.forEach((file,index)=>{entry+=`import {data as data${index}} from './${prefix+file}';\n`;registries[file.split('/')[4]].push(JSON.stringify(sheetKeys[file])+`:data${index}`);});
const sheetDatas={};
sheetFiles.forEach((file,index)=>{const kind={Characters:'characters',Weapons:'weapons',Artifacts:'artifacts'}[file.split('/')[4]],key=sheetKeys[file];sheetDatas[kind]??={};sheetDatas[kind][key]=`data${index}`;});
for(const [type,items]of Object.entries(registries))entry+=`export const ${type.toLowerCase()}={${items.join(',')}};\n`;
for(const [kind,items]of Object.entries(sheetDatas))for(const [key,data]of Object.entries(items))entry+=`Object.assign(${kind}[${JSON.stringify(key)}],{sheetData:${data}});\n`;
entry+="export const conditionalPaths={characters:{},weapons:{},artifacts:{}};for(const [groupName,group]of Object.entries({characters,weapons,artifacts})){for(const [key,item]of Object.entries(group)){const paths=new Set(),seen=new WeakSet(),visit=node=>{if(!node||typeof node!=='object'||seen.has(node))return;seen.add(node);if(node.operation==='read'&&node.path?.[0]==='conditional'&&node.path?.[1]===key)paths.add(node.path[2]);for(const child of Object.values(node))if(child&&typeof child==='object')visit(child);};visit(item.sheetData);if(paths.size)conditionalPaths[groupName][key]=[...paths];}}\n";
entry+="export function sourceDisplayMeta(data){const result={};const visit=(value,path)=>{if(!value||typeof value!=='object')return;if(value.operation==='data'&&value.data?.hit?.move?.value){result[path.join('.')]= {move:value.data.hit.move.value};}for(const [key,child]of Object.entries(value))if(key!=='operands'&&key!=='data')visit(child,[...path,key]);};visit(data?.display||{},[]);return result;}\n";
entry+="export function conditionOptions(key,path){const values=new Set(),seen=new WeakSet();const visit=node=>{if(!node||typeof node!=='object'||seen.has(node))return;seen.add(node);if(node.operation==='lookup'&&node.operands?.[0]?.operation==='read'&&node.operands[0].path?.[0]==='conditional'&&node.operands[0].path?.[1]===key&&node.operands[0].path?.[2]===path)Object.keys(node.table||{}).forEach(value=>values.add(value));for(const child of Object.values(node))if(child&&typeof child==='object')visit(child);};for(const group of [characters,weapons,artifacts]){const sheet=group[key]?.sheetData;if(sheet)visit(sheet);}return [...new Set(['off','on',...values])];}\n";
entry+="export {data as reactionData} from './genshin-optimizer-source/libs/gi/sheets/src/Reaction.tsx';\nexport {data as resonanceData} from './genshin-optimizer-source/libs/gi/sheets/src/Resonance.tsx';\n";
const missing=new Set();
const resolve=(name,importer)=>{
 const alias=aliases[name]?.[0];const file=alias?prefix+alias.replace(/^\.\//,''):name.startsWith('.')?path.posix.normalize(path.posix.join(path.posix.dirname(importer||''),name)):name;
 for(const suffix of ['','.ts','.tsx','.json','.js','/index.ts','/index.tsx'])if(file.startsWith(prefix)&&available.has(file.slice(prefix.length)+suffix))return file+suffix;
 return null;
};
const jsx=`export function jsx(type,props,...children){return {type:typeof type==='string'?type:'text',props,children}};export const Fragment='fragment';export const Translate=()=>null;export const Trans=()=>null;`;
const metadataProxy=`const proxy=new Proxy(function(){return proxy},{get(_,key){return key===Symbol.iterator?function*(){}:key==='then'?undefined:proxy}});export const charTemplates=()=>proxy;export default proxy;`;
try{
 const result=await build({stdin:{contents:entry,loader:'ts'},absWorkingDir:process.env.TEMP,tsconfigRaw:{compilerOptions:{target:'ES2022',jsxFactory:'jsx',jsxFragmentFactory:'Fragment'}},bundle:true,format:'esm',platform:'browser',target:'es2022',minify:true,write:false,metafile:true,logLevel:'silent',define:{'process.env.NODE_ENV':'"production"'},banner:{js:'/*! Genshin Optimizer WR — MIT, copyright 2020-present frzyc; pinned e7d56acb5cb0c165b0d54b35cbb8c779dea8e8ad. See lab-complete-engine.LICENSE.txt. */'},plugins:[{name:'math-data',setup(api){
  api.onResolve({filter:/.*/},args=>{
   if(args.path==='astralis-jsx')return {path:args.path,namespace:'stub'};
   if(/^(react(?:\/|$)|@mui\/|@genshin-optimizer\/(?:common\/(?:ui|svgicons)|gi\/(?:assets|svgicons))$)/.test(args.path)){
    const imported=sourceFile(args.importer.slice(prefix.length)).statements.filter(statement=>ts.isImportDeclaration(statement)&&statement.moduleSpecifier.text===args.path);
    const names=imported.flatMap(statement=>statement.importClause?.namedBindings?.elements?.map(element=>(element.propertyName||element.name).text)||[]);
    return {path:JSON.stringify([...new Set(names)]),namespace:'ui-stub',sideEffects:false};
   }
   if(args.path==='@genshin-optimizer/gi/i18n')return {path:'i18n',namespace:'stub'};
   const file=resolve(args.path,args.importer);
   if(file){if(file.endsWith('/Characters/CharacterSheet.tsx'))return {path:'CharacterSheet',namespace:'stub'};if(file.endsWith('/Characters/charTemplates.tsx'))return {path:'charTemplates',namespace:'stub'};if(!fs.existsSync(path.join(vendor,file))){missing.add(file.slice(prefix.length));return {errors:[{text:'Source missing: '+file}]};}return {path:file,namespace:'math',sideEffects:false};}
   if(/^(node:|zod$|fflate$|@nx\/devkit$)/.test(args.path))return {path:args.path,external:true,sideEffects:false};
   return {errors:[{text:'Unresolved numerical dependency '+args.path+' from '+args.importer}]};
  });
  api.onLoad({filter:/.*/,namespace:'stub'},args=>({contents:args.path==='CharacterSheet'?'export class CharacterSheet {constructor(sheet,data){this.data=data}}':args.path==='charTemplates'?metadataProxy:jsx,loader:'js'}));
  api.onLoad({filter:/.*/,namespace:'ui-stub'},args=>({contents:metadataProxy+JSON.parse(args.path).map(name=>`export const ${name}=proxy;`).join('\n'),loader:'js'}));
  api.onLoad({filter:/.*/,namespace:'math'},args=>{const contents=transformed.get(args.path)||fs.readFileSync(path.join(vendor,args.path),'utf8');return {contents:args.path.endsWith('.tsx')?"import {jsx,Fragment} from 'astralis-jsx';\n"+contents:contents,loader:args.path.endsWith('.json')?'json':args.path.endsWith('.tsx')?'tsx':'ts'};});
 }}]});
 const text=result.outputFiles[0].text;
 if(/\bfrom\s*["'](?:node:|zod|fflate|@nx)/.test(text))throw new Error('Retained build-only external dependency');
 fs.writeFileSync(path.join(root,'public/lab-wr-engine.js'),text);
 fs.writeFileSync(path.join(root,'vendor/legacy-engine-build.json'),JSON.stringify(result.metafile,null,2)+'\n');
 console.log(`${sheetFiles.length} original sheets, ${Object.keys(result.metafile.inputs).length} modules, ${text.length} bytes`);
}catch(error){
 fs.writeFileSync(path.join(root,'vendor/legacy-missing.json'),JSON.stringify([...missing],null,2)+'\n');
 if(missing.size)console.log(`${missing.size} numerical source dependencies need downloading`);
 else console.log((error.errors||[{text:error.message}]).slice(0,20).map(item=>item.text).join('\n'));
 process.exitCode=1;
}
