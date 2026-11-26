export const escapeHTML=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function todayISO(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
export function shiftDay(date,offset){const d=new Date(date+'T12:00:00');d.setDate(d.getDate()+offset);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
export function validDate(value){if(!/^\d{4}-\d{2}-\d{2}$/.test(value||''))return false;const d=new Date(value+'T12:00:00');return !isNaN(d)&&shiftDay(value,0)===value;}
export function shortDate(value){return validDate(value)?new Date(value+'T12:00:00').toLocaleDateString('fr-FR',{day:'numeric',month:'short'}):'Sans date';}
export function downloadFile(name,text,type='application/json'){const url=URL.createObjectURL(new Blob([text],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);}
export function readJSON(key,fallback){try{return JSON.parse(localStorage.getItem(key))??structuredClone(fallback);}catch{return structuredClone(fallback);}}
export function workspaceDialog({title,body,submit='Enregistrer',onSubmit,wide=false}){
 document.querySelector('#workspace-dialog')?.close();document.querySelector('#workspace-dialog')?.remove();
 const d=document.createElement('dialog');d.id='workspace-dialog';d.className=`ws-dialog ${wide?'is-wide':''}`;
 d.innerHTML=`<form><header><div><span class="ws-kicker">ASTRALIS · ATELIER</span><h2>${escapeHTML(title)}</h2></div><button type="button" data-ws-close aria-label="Fermer">×</button></header><div class="ws-dialog-content">${body}</div><p class="ws-form-error" role="alert" hidden></p><footer><button type="button" data-ws-close>Annuler</button>${submit?`<button type="submit" class="ws-primary">${escapeHTML(submit)}</button>`:''}</footer></form>`;document.body.append(d);
 d.addEventListener('click',e=>{if(e.target===d||e.target.closest('[data-ws-close]'))d.close();});d.addEventListener('close',()=>d.remove(),{once:true});
 d.querySelector('form').addEventListener('submit',async e=>{e.preventDefault();const button=d.querySelector('[type=submit]'),error=d.querySelector('.ws-form-error');error.hidden=true;if(button)button.disabled=true;try{const result=await onSubmit?.(new FormData(e.target),d);if(result!==false)d.close();}catch(err){error.textContent=err.message||'Impossible d’enregistrer.';error.hidden=false;}finally{if(button)button.disabled=false;}});
 d.showModal();return d;
}
export function csvText(rows){return '\ufeff'+rows.map(row=>row.map(v=>'"'+String(v??'').replaceAll('"','""')+'"').join(';')).join('\r\n');}
export function textTags(text){return [...new Set(String(text||'').split(',').map(t=>t.trim().slice(0,35)).filter(Boolean))].slice(0,20);}
export function safeWebURL(value){try{const u=new URL(value,location.origin);return ['https:','http:'].includes(u.protocol)?u.href:'';}catch{return '';}}

// Undo only the action's changes. Preserve subsequent edits made on other pages.
export function rollbackWorkspaceValue(before,after,current){
 const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 if(equal(before,after))return current;
 if(equal(current,after))return before===undefined?undefined:structuredClone(before);
 const object=v=>v&&typeof v==='object'&&!Array.isArray(v);
 if(object(before)&&object(after)&&object(current)){
  const result={...current};for(const key of new Set([...Object.keys(before),...Object.keys(after)])){if(['__proto__','constructor','prototype'].includes(key))continue;const value=rollbackWorkspaceValue(before[key],after[key],current[key]);if(value===undefined)delete result[key];else result[key]=value;}return result;
 }
 if(Array.isArray(before)&&Array.isArray(after)&&Array.isArray(current)){
  const rows=[...before,...after,...current];
  if(rows.every(r=>object(r)&&typeof r.id==='string')){
   const key=r=>`${r.game||''}:${r.id}`,b=new Map(before.map(r=>[key(r),r])),a=new Map(after.map(r=>[key(r),r])),c=new Map(current.map(r=>[key(r),r]));
   for(const k of new Set([...b.keys(),...a.keys()])){const value=rollbackWorkspaceValue(b.get(k),a.get(k),c.get(k));if(value===undefined)c.delete(k);else c.set(k,value);}
   return [...c.values()];
  }
 }
 return current;
}
