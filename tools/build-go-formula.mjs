// Rebuild the browser graph from the pinned, attributed upstream sources.
// Virtual module resolution avoids walking inaccessible Windows parent folders.
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const root=path.resolve(import.meta.dirname,'..'),vendor=path.join(root,'vendor');
const cache=path.join(process.env.TEMP,'astralis-npm-cache','_npx');
const modulePath=fs.readdirSync(cache).map(name=>path.join(cache,name,'node_modules/esbuild/lib/main.js')).find(file=>fs.existsSync(file));
if(!modulePath)throw new Error('Install esbuild 0.25.0 in the task cache before rebuilding.');
const {build}=createRequire(import.meta.url)(modulePath);
const prefix='genshin-optimizer-source/';
const config=JSON.parse(fs.readFileSync(path.join(vendor,prefix,'tsconfig.base.json'),'utf8'));
const resolve=(name,importer='')=>{
 const alias=config.compilerOptions.paths[name]?.[0];
 const candidate=alias?prefix+alias.replace(/^\.\//,''):name.startsWith('.')?path.posix.join(path.posix.dirname(importer),name):name;
 for(const suffix of ['','.ts','.tsx','.json','.js','/index.ts','/index.tsx']){
  const file=path.posix.normalize(candidate+suffix);
  if(fs.existsSync(path.join(vendor,file))&&fs.statSync(path.join(vendor,file)).isFile())return file;
 }
 return null;
};
const result=await build({
 stdin:{contents:"export * from './astralis-go-entry.ts'",loader:'ts'},
 absWorkingDir:process.env.TEMP,tsconfigRaw:{compilerOptions:{target:'ES2022',useDefineForClassFields:true}},
 bundle:true,format:'esm',platform:'browser',target:'es2022',minify:true,write:false,metafile:true,
 banner:{js:'/*! Genshin Optimizer formula engine — MIT, copyright 2020-present frzyc. Source revision e7d56acb5cb0c165b0d54b35cbb8c779dea8e8ad. See lab-complete-engine.LICENSE.txt. */'},
 plugins:[{name:'pinned-source',setup(api){
  api.onResolve({filter:/.*/},args=>{
   const file=resolve(args.path,args.importer);
   if(file)return {path:file,namespace:'astralis'};
   if(/^(node:|zod$|fflate$|@nx\/devkit$)/.test(args.path))return {path:args.path,external:true,sideEffects:false};
   throw new Error('Unresolved formula import: '+args.path+' from '+args.importer);
  });
  api.onLoad({filter:/.*/,namespace:'astralis'},args=>({contents:fs.readFileSync(path.join(vendor,args.path),'utf8'),loader:args.path.endsWith('.json')?'json':args.path.endsWith('.tsx')?'tsx':'ts'}));
 }}],
});
const text=result.outputFiles[0].text;
fs.writeFileSync(path.join(root,'vendor/complete-engine-build.json'),JSON.stringify(result.metafile,null,2)+'\n');
console.log(Object.values(result.metafile.outputs).flatMap(output=>output.imports));
if(/\bfrom\s*["'](?:node:|zod|fflate|@nx)/.test(text))throw new Error('Browser bundle retained a build-only dependency.');
fs.writeFileSync(path.join(root,'public/lab-complete-engine.js'),text);
fs.copyFileSync(path.join(vendor,prefix,'LICENSE'),path.join(root,'public/lab-complete-engine.LICENSE.txt'));
fs.writeFileSync(path.join(root,'vendor/complete-engine-build.json'),JSON.stringify(result.metafile,null,2)+'\n');
console.log(`${Object.keys(result.metafile.inputs).length} modules bundled; ${text.length} bytes`);
