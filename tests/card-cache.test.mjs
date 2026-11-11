import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../sw.js',import.meta.url),'utf8');
async function offlineRequest(path){
 const handlers={},matches=[];
 const context={URL,Response,location:{origin:'http://localhost:8766'},
  self:{addEventListener(name,callback){handlers[name]=callback;}},
  fetch:async()=>{throw Error('offline')},
  caches:{match:async(request,options)=>{matches.push({request,options});return options?.ignoreSearch?new Response('old cached asset'):undefined;}}};
 vm.runInNewContext(source,context);
 let response;
 handlers.fetch({request:{method:'GET',mode:'cors',url:'http://localhost:8766'+path},respondWith(promise){response=promise;}});
 return {response:await response,matches};
}
test('une illustration avec une nouvelle empreinte ne récupère jamais une ancienne image hors ligne',async()=>{
 const {response,matches}=await offlineRequest('/assets/card-art/gi/furina-1.webp?v=new-hash');
 assert.equal(response.status,404);
 assert.ok(matches.every(match=>!match.options?.ignoreSearch));
});
test('les styles gardent leur repli hors ligne sans paramètre de version',async()=>{
 const {response,matches}=await offlineRequest('/styles/styles.css?v=new-version');
 assert.equal(await response.text(),'old cached asset');
 assert.ok(matches.some(match=>match.options?.ignoreSearch));
});
