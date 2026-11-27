import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import vm from 'node:vm';
const html=await readFile(new URL('../index.html',import.meta.url),'utf8'),scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]),script=scripts.find(s=>s.includes('Filet de sécurité'));
function page(storage=new Map()){
 const listeners={},timers=[],app={children:[],innerHTML:''};let reloads=0;
 vm.runInNewContext(script,{document:{documentElement:{dataset:{}},getElementById:id=>id==='app'?app:{remove(){}}},window:{addEventListener:(t,f)=>listeners[t]=f},sessionStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},location:{reload:()=>reloads++},setTimeout:(fn,delay)=>timers.push({fn,delay})});
 return {listeners,timers,app,storage,flush:()=>{for(const t of timers.splice(0))t.fn()},reloads:()=>reloads};
}
test('un refus de module relance une seule fois le chargement, les erreurs suivantes restent consultables',()=>{
 const a=page();a.listeners.error({target:{tagName:'SCRIPT',src:'/src/app.js'}});a.flush();assert.equal(a.reloads(),1);
 const b=page(a.storage);b.listeners.error({target:{tagName:'SCRIPT',src:'/src/app.js'}});b.flush();assert.equal(b.reloads(),0);assert.match(b.app.innerHTML,/Réessayer/);assert.match(b.app.innerHTML,/app.js/);
});
test('une erreur de programmation ne crée pas de boucle et le diagnostic échappe le HTML',()=>{
 const a=page();a.listeners.error({target:null,message:'Unexpected <script>',filename:'/src/app.js',lineno:3,colno:2});a.flush();assert.equal(a.reloads(),0);assert.match(a.app.innerHTML,/&lt;script>/);
});
test('les deux modules de décoration sont facultatifs',()=>{
 for(const name of ['motion-library','design-system']){assert.ok(scripts.some(s=>s.includes('import("./src/'+name+'.js')&&s.includes('.catch(')));assert.doesNotMatch(html,new RegExp('<script[^>]+src="[^" ]*'+name+'\\.js'));}
});
