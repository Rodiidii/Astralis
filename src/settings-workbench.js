export function initSettingsWorkbench(){
 function select(panel,id){
  if(!['application','appearance','audio','advanced'].includes(id))id='application';
  panel.querySelectorAll('[data-settings-tab]').forEach(button=>{const on=button.dataset.settingsTab===id;button.setAttribute('aria-selected',String(on));button.tabIndex=on?0:-1;});
  panel.querySelectorAll('[data-settings-panel]').forEach(section=>section.hidden=section.dataset.settingsPanel!==id);
  sessionStorage.setItem('astralis:settings:tab',id);
 }
 document.addEventListener('click',event=>{const button=event.target.closest('[data-settings-tab]');if(button)select(button.closest('[data-settings-workbench]'),button.dataset.settingsTab);});
 document.addEventListener('keydown',event=>{const button=event.target.closest('[data-settings-tab]');if(!button||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const panel=button.closest('[data-settings-workbench]'),buttons=[...panel.querySelectorAll('[data-settings-tab]')];let index=buttons.indexOf(button);index=event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(event.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;select(panel,buttons[index].dataset.settingsTab);buttons[index].focus();});
 const mounted=new WeakSet();function mount(){document.querySelectorAll('[data-settings-workbench]').forEach(panel=>{if(mounted.has(panel))return;mounted.add(panel);select(panel,sessionStorage.getItem('astralis:settings:tab'));});}
 new MutationObserver(mount).observe(document.documentElement,{childList:true,subtree:true});mount();
}
