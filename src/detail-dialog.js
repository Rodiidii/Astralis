/* Catalog detail navigation: scoped tabs and a focus trap within the open dialog. */
export function enhanceDetailDialog(dialog){
 if(!dialog)return;
 dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');
 const title=dialog.querySelector('.detail-title h2');if(title){title.id='catalog-detail-title';dialog.setAttribute('aria-labelledby',title.id);}
 const close=dialog.querySelector('.modal-close');if(close)close.setAttribute('aria-label','Fermer la fiche');
 const tabs=[...dialog.querySelectorAll('[data-detail-tab]')],list=dialog.querySelector('.detail-tabs');
 if(list){list.setAttribute('role','tablist');list.setAttribute('aria-label','Rubriques de la fiche');}
 for(const tab of tabs){const key=tab.dataset.detailTab,panel=dialog.querySelector('[data-detail-content="'+key+'"]');tab.id='detail-tab-'+key;tab.setAttribute('role','tab');tab.setAttribute('aria-controls','detail-panel-'+key);tab.setAttribute('aria-selected',String(tab.classList.contains('active')));tab.tabIndex=tab.classList.contains('active')?0:-1;if(panel){panel.id='detail-panel-'+key;panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby',tab.id);panel.tabIndex=0;}}
 dialog.addEventListener('keydown',event=>{
  const tab=event.target.closest('[role=tab]');
  if(tab&&['ArrowRight','ArrowLeft','Home','End'].includes(event.key)){event.preventDefault();const index=tabs.indexOf(tab),next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[next].click();tabs[next].focus();return;}
  if(event.key!=='Tab')return;
  const stops=[...dialog.querySelectorAll('button,input,select,textarea,a[href],[tabindex]')].filter(node=>!node.disabled&&node.tabIndex>=0&&node.getClientRects().length&&!node.closest('[hidden]'));
  const first=stops[0],last=stops.at(-1);if(event.shiftKey&&event.target===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&event.target===last){event.preventDefault();first?.focus();}
 });
}
