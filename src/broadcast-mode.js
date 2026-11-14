const KEY='astralis:broadcast-mode:v1';
const DEFAULTS={privacy:false,clean:false,live:false};
let initialized=false;
function read(){try{return {...DEFAULTS,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return {...DEFAULTS}}}
function save(state){localStorage.setItem(KEY,JSON.stringify(state));apply(state)}
function apply(state){
  const frame=document.querySelector('.app-frame');if(!frame)return;
  frame.dataset.broadcastPrivacy=String(!!state.privacy);frame.dataset.broadcastClean=String(!!state.clean);frame.dataset.broadcastLive=String(!!state.live);
  const privateNodes=[...document.querySelectorAll('.topbar-profile,.topbar-resources,.rail-bottom,#gi-profile-uid,[data-account-uid]')];
  for(const node of privateNodes){if(state.privacy){if(!node.hasAttribute('data-broadcast-hidden'))node.setAttribute('data-broadcast-hidden','');node.setAttribute('aria-hidden','true')}else if(node.hasAttribute('data-broadcast-hidden')){node.removeAttribute('data-broadcast-hidden');node.removeAttribute('aria-hidden')}}
  document.querySelector('[data-broadcast-open]')?.setAttribute('aria-pressed',String(!!(state.privacy||state.clean||state.live)));
}
function content(state){return '<form method="dialog" class="broadcast-panel"><header><div><span>ASTRALIS · MODE DIFFUSION</span><h2 id="broadcast-title">Prépare ton écran</h2><p>Un espace net pour streamer, enregistrer ou partager une capture.</p></div><button class="broadcast-close" value="close" aria-label="Fermer">×</button></header><div class="broadcast-options"><label><span class="broadcast-option-icon">◉</span><span><b>Masquer mes infos</b><small>Nom, avatar, ressources et UID disparaissent de l’affichage.</small></span><input type="checkbox" data-broadcast-toggle="privacy" '+(state.privacy?'checked':'')+'></label><label><span class="broadcast-option-icon">▣</span><span><b>Scène épurée</b><small>Réduit les menus pour mettre la page au premier plan.</small></span><input type="checkbox" data-broadcast-toggle="clean" '+(state.clean?'checked':'')+'></label><label><span class="broadcast-option-icon">●</span><span><b>Indicateur « En direct »</b><small>Ajoute un petit repère visuel discret à l’écran.</small></span><input type="checkbox" data-broadcast-toggle="live" '+(state.live?'checked':'')+'></label></div><div class="broadcast-actions"><button type="button" data-broadcast-fullscreen>⛶ Plein écran</button><button type="button" data-broadcast-reset>Tout rétablir</button><span>Raccourci : Ctrl + Maj + B</span></div></form>'}
export function mountBroadcastMode(){
  const actions=document.querySelector('.topbar-actions');if(!actions)return;
  let button=actions.querySelector('[data-broadcast-open]');
  if(!button){button=document.createElement('button');button.type='button';button.className='quiet-btn broadcast-open';button.dataset.broadcastOpen='';button.title='Préparer une capture ou un direct';button.setAttribute('aria-label','Mode diffusion');button.setAttribute('aria-pressed','false');button.innerHTML='<span aria-hidden="true">◉</span><span>Diffusion</span>';actions.insertBefore(button,actions.querySelector('[data-action="music-toggle"]')||actions.firstChild)}
  let dialog=document.querySelector('.broadcast-dialog');if(!dialog){dialog=document.createElement('dialog');dialog.className='broadcast-dialog';dialog.setAttribute('aria-labelledby','broadcast-title');document.body.append(dialog)}
  if(!initialized){initialized=true;
    document.addEventListener('change',event=>{const input=event.target.closest?.('[data-broadcast-toggle]');if(!input)return;const state=read();state[input.dataset.broadcastToggle]=input.checked;save(state)});
    document.addEventListener('click',async event=>{const target=event.target.closest?.('[data-broadcast-open],[data-broadcast-fullscreen],[data-broadcast-reset]');if(!target)return;
      if(target.matches('[data-broadcast-open]')){const d=document.querySelector('.broadcast-dialog');if(d&&!d.open){d.innerHTML=content(read());d.showModal()}return}
      if(target.matches('[data-broadcast-fullscreen]')){try{if(!document.fullscreenElement)await document.documentElement.requestFullscreen();else await document.exitFullscreen()}catch{target.textContent='Plein écran indisponible'}return}
      if(target.matches('[data-broadcast-reset]')){save({...DEFAULTS});const d=document.querySelector('.broadcast-dialog');if(d?.open){d.close();d.innerHTML=content(read());d.showModal()}}
    });
    document.addEventListener('keydown',event=>{if(event.ctrlKey&&event.shiftKey&&event.key.toLowerCase()==='b'){event.preventDefault();const d=document.querySelector('.broadcast-dialog');if(d&&!d.open){d.innerHTML=content(read());d.showModal()}}});
  }
  apply(read());
}
