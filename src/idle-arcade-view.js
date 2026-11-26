import {renderGenshinIdle,mountGenshinIdle,stopGenshinIdle} from './genshin-idle.js?v=20261126-portal-play-1';
let rosterPromise;
export async function idleRoster(){
 if(!rosterPromise)rosterPromise=fetch('/public/card-catalog.json').then(r=>{if(!r.ok)throw Error('Le catalogue Genshin est indisponible.');return r.json()}).then(data=>{
  const rows=Array.isArray(data)?data:(data.catalogs?.['gi:character']||data.games?.gi?.characters||data.gi?.characters||data.gi||data.characters||data.cards||[]);
  return rows.filter(c=>Boolean(data.catalogs?.['gi:character'])||(String(c.game||c.gameId||c.world||'gi')==='gi'&&String(c.kind||c.category||c.type||'character').includes('character'))).map(c=>{const id=String(c.id||c._id||'').replace(/^gi[-:]/,'');return {...c,_id:id,_name:c.name||c._name||id,_idleImage:'/assets/character-portraits/gi-'+id+'.webp'}}).filter(c=>c._id);
 }).catch(error=>{rosterPromise=null;throw error});
 return rosterPromise;
}
export async function openIdleArcade(host,back){
 host.hidden=false;const generation=host.dataset.generation=String(Number(host.dataset.generation||0)+1);
 host.innerHTML='<header class="idle-arcade-back"><button type="button" data-idle-arcade-back>← Tous les jeux</button><span>GENSHIN IDLE · UNE AUTRE FAÇON DE VOYAGER</span></header><div role="status" class="idle-arcade-loading">Ton équipe prépare le départ…</div>';
 host.querySelector('[data-idle-arcade-back]').onclick=back;
 try{const people=await idleRoster();if(host.hidden||!host.isConnected||host.dataset.generation!==generation)return;if(!people.length)throw Error('Aucun personnage Genshin dans le catalogue local.');const content=document.createElement('div');content.innerHTML=renderGenshinIdle('gi',people);host.querySelector('.idle-arcade-loading').replaceWith(content);mountGenshinIdle(content.querySelector('[data-genshin-idle]'),'gi',people,message=>{let status=host.querySelector('.idle-arcade-status');if(!status){status=document.createElement('p');status.className='idle-arcade-status';status.setAttribute('role','status');host.append(status)}status.textContent=message;});}catch(error){if(host.hidden||host.dataset.generation!==generation)return;const status=host.querySelector('.idle-arcade-loading');status.textContent=error.message;const retry=document.createElement('button');retry.type='button';retry.textContent='Réessayer';retry.onclick=()=>openIdleArcade(host,back);status.append(retry);}
}
export function closeIdleArcade(host){stopGenshinIdle();host.dataset.generation=String(Number(host.dataset.generation||0)+1);host.hidden=true;host.replaceChildren();}
