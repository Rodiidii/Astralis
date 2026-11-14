let active=null;

function focusTitle(widget){return widget.querySelector('h2,h3,h4')?.textContent?.trim()||'Widget Astralis';}
function focusKey(widget){return widget.dataset.dashboardWidget||widget.dataset.cosmosWidget||[...widget.classList].find(name=>name.startsWith('orbit-panel-'))||'widget';}
function enhanceWidgets(){
 document.querySelectorAll('#page-content [data-dashboard-widget]').forEach(widget=>{
  if(widget.querySelector('[data-widget-focus-trigger]'))return;
  widget.classList.add('dashboard-focus-host');
  const button=document.createElement('button');button.type='button';button.className='dashboard-focus-trigger';button.dataset.widgetFocusTrigger='';button.setAttribute('aria-label',`Agrandir : ${focusTitle(widget)}`);button.title='Ouvrir en mode focus';button.innerHTML='<span aria-hidden="true">⛶</span>';
  widget.prepend(button);
 });
}
function close(){
 if(!active)return;
 const {widget,placeholder,overlay,returnFocus}=active;
 if(placeholder.parentNode){placeholder.replaceWith(widget);widget.classList.remove('dashboard-focus-active')}
 overlay.remove();document.documentElement.classList.remove('dashboard-focus-open');active=null;
 if(returnFocus?.isConnected)returnFocus.focus();
}
function open(widget,trigger){
 if(active)close();
 const title=focusTitle(widget),key=focusKey(widget),safe=value=>value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const placeholder=document.createComment(`focus-widget:${key}`);widget.before(placeholder);
 const overlay=document.createElement('div');overlay.className='dashboard-focus-backdrop';overlay.innerHTML=`<section class="dashboard-focus-dialog" role="dialog" aria-modal="true" aria-label="Mode focus · ${safe(title)}"><header class="dashboard-focus-toolbar"><span><small>MODE FOCUS · ${safe(key.replace(/^orbit-panel-/,'').replaceAll('-',' ').toUpperCase())}</small><b>${safe(title)}</b></span><button type="button" class="dashboard-focus-close" data-widget-focus-close aria-label="Fermer le mode focus">× <kbd>Échap</kbd></button></header><div class="dashboard-focus-body"></div></section>`;
 overlay.addEventListener('click',event=>{if(event.target===overlay||event.target.closest('[data-widget-focus-close]'))close()});
 document.body.append(overlay);overlay.querySelector('.dashboard-focus-body').append(widget);widget.classList.add('dashboard-focus-active');document.documentElement.classList.add('dashboard-focus-open');active={widget,placeholder,overlay,returnFocus:trigger};overlay.querySelector('[data-widget-focus-close]').focus();
}
document.addEventListener('click',event=>{
 const trigger=event.target.closest?.('[data-widget-focus-trigger]');
 if(trigger){const widget=trigger.closest('[data-dashboard-widget]');if(widget)open(widget,trigger);return}
 if(active&&event.target.closest?.('[data-nav],[data-game]'))close();
},true);
document.addEventListener('keydown',event=>{
 if(!active)return;
 if(event.key==='Escape'){event.preventDefault();close();return}
 if(event.key==='Tab'){
  const controls=[...active.overlay.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')];
  if(!controls.length){event.preventDefault();return}
  const first=controls[0],last=controls.at(-1);
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
 }
});
const observer=new MutationObserver(enhanceWidgets);observer.observe(document.documentElement,{subtree:true,childList:true});
enhanceWidgets();
