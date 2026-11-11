const SEEN='astralis:releases:last-seen';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function validReleases(data){
 if(data?.schemaVersion!==1||!Array.isArray(data.releases))return [];
 const ids=new Set();return data.releases.filter(row=>typeof row.id==='string'&&!ids.has(row.id)&&ids.add(row.id)&&/^\d{4}-\d{2}-\d{2}$/.test(row.date)&&typeof row.title==='string'&&Array.isArray(row.changes)).sort((a,b)=>b.date.localeCompare(a.date));
}
export async function showReleaseNotes({automatic=false,storage=localStorage,load=()=>fetch(new URL('../changelog.json',import.meta.url),{cache:'no-cache'}).then(r=>{if(!r.ok)throw new Error('Journal indisponible');return r.json();})}={}){
 if(document.querySelector('.release-notes-dialog'))return false;
 let rows;try{rows=validReleases(await load());}catch{if(automatic)return false;rows=[];}
 if(automatic&&(!rows.length||storage.getItem(SEEN)===rows[0].id||document.querySelector('dialog[open],.modal-backdrop')))return false;
 if(automatic){
  if(document.querySelector('.release-notes-notice'))return false;
  const notice=document.createElement('aside');notice.className='release-notes-notice';notice.setAttribute('aria-label','Nouveautés disponibles');notice.innerHTML='<span>Des nouveautés sont disponibles</span><button type="button">Les découvrir</button><button type="button" aria-label="Masquer cette annonce">×</button>';const buttons=notice.querySelectorAll('button');buttons[0].onclick=()=>{notice.remove();showReleaseNotes({storage,load});};buttons[1].onclick=()=>notice.remove();document.body.append(notice);return true;
 }
 document.querySelector('.release-notes-notice')?.remove();
 const previous=document.activeElement,dialog=document.createElement('dialog');dialog.className='release-notes-dialog';dialog.setAttribute('aria-labelledby','release-notes-title');
 dialog.innerHTML='<header><div><span class="eyebrow">ASTRALIS · JOURNAL DE L’APPLICATION</span><h2 id="release-notes-title">Quoi de neuf ?</h2></div><button type="button" aria-label="Fermer les nouveautés">×</button></header><div>'+rows.map((row,index)=>'<section><time>'+esc(row.date)+'</time><h3>'+esc(row.title)+'</h3><p>'+esc(row.summary)+'</p><ul>'+row.changes.map(change=>'<li><b>'+esc(change.area)+'</b><p>'+esc(change.text)+'</p></li>').join('')+'</ul>'+(row.limits?.length?'<details><summary>Travaux encore ouverts</summary><ul>'+row.limits.map(text=>'<li>'+esc(text)+'</li>').join('')+'</ul></details>':'')+'</section>').join('')+(!rows.length?'<p>Le journal des nouveautés est temporairement indisponible. Tu peux le rouvrir depuis le menu latéral, sous « Journal des nouveautés ».</p>':'')+'</div><footer><button type="button" data-release-done>Compris</button></footer>';
 const close=()=>dialog.close();dialog.querySelector('header>button').onclick=close;dialog.querySelector('[data-release-done]').onclick=close;
 dialog.onclose=()=>{if(rows.length)storage.setItem(SEEN,rows[0].id);dialog.remove();if(previous?.isConnected)previous.focus({preventScroll:true});};document.body.append(dialog);dialog.showModal();return true;
}
