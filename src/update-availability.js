let latest=null;
export function setUpdateAvailability(data){if(!data||!data.ok&&typeof data.available!=='boolean')return;latest=data;decorate();}
function decorate(){
 if(!latest)return;
 document.querySelectorAll('.side-rail [data-nav="customize"]').forEach(button=>{
  let badge=button.querySelector('[data-update-badge]');
  if(latest.available&&!badge){badge=document.createElement('span');badge.dataset.updateBadge='';badge.className='settings-update-badge';badge.textContent='MaJ';badge.title='Une mise à jour est disponible';button.append(badge);}
  if(!latest.available&&badge)badge.remove();
 });
 document.querySelectorAll('[data-settings-update-status]').forEach(el=>{const label=latest.available?'Une mise à jour est disponible':'Ton application est à jour';if(el.textContent!==label)el.textContent=label;});
}
export function initUpdateAvailability(){new MutationObserver(decorate).observe(document.documentElement,{childList:true,subtree:true});}
