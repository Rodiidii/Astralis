const safeParse=value=>{try{return JSON.parse(value||'[]')}catch{return []}};
const clamp=(value,min,max)=>Math.max(min,Math.min(max,Number(value)||min));

class RotationRehearsal extends (globalThis.HTMLElement||class {}){
 connectedCallback(){
  if(this.dataset.ready)return;this.dataset.ready='true';
  this.steps=safeParse(this.dataset.steps).filter(step=>step&&typeof step==='object').slice(0,180);
  this.tabIndex=0;this.setAttribute('role','group');this.setAttribute('aria-label','Répétition guidée de la rotation');this.index=0;this.playing=false;this.completed=false;this.startedAt=0;this.elapsedBefore=0;this.tempo=Number(localStorage.getItem('astralis:rotation-tempo'))||1.5;this.frame=0;
  this.render();this.addEventListener('click',event=>this.onClick(event));this.addEventListener('change',event=>this.onChange(event));
  this.addEventListener('keydown',event=>this.onKey(event));
 }
 disconnectedCallback(){this.pause();}
 render(){
  this.innerHTML=`<section class="rotation-rehearsal-card" aria-label="Répétition guidée de la rotation">
   <header><div><span class="eyebrow">ENTRAÎNEMENT · ${this.steps.length} ACTION${this.steps.length===1?'':'S'}</span><b>Répéter la rotation</b><small>Avance étape par étape ou laisse le tempo guider la séquence.</small></div><label>Tempo<select data-tempo aria-label="Durée de chaque étape">${[.5,.75,1,1.25,1.5,2,2.5,3,4].map(value=>`<option value="${value}" ${value===this.tempo?'selected':''}>${value.toLocaleString('fr-FR')} s / action</option>`).join('')}</select></label></header>
   <div class="rotation-rehearsal-stage" data-stage aria-live="polite"><span class="rotation-rehearsal-avatar" data-avatar></span><div><small data-step-count>${this.steps.length?'Prêt':'Aucune action à répéter'}</small><b data-step-name>${this.steps.length?'Lance la répétition de ton équipe':'Ajoute des compétences à la rotation'}</b><span data-step-character></span></div><strong><img data-skill-icon alt=""><span data-step-code>—</span></strong></div>
   <div class="rotation-rehearsal-progress" role="progressbar" aria-label="Progression de la répétition" aria-valuemin="0" aria-valuemax="${this.steps.length}" aria-valuenow="0"><i data-progress></i></div>
   <div class="rotation-rehearsal-controls"><button type="button" data-command="previous" aria-label="Étape précédente" ${this.steps.length?'':'disabled'}>←</button><button type="button" class="button-primary" data-command="toggle" ${this.steps.length?'':'disabled'}>${this.steps.length?'▶ Commencer':'Rotation vide'}</button><button type="button" data-command="next" aria-label="Étape suivante" ${this.steps.length?'':'disabled'}>→</button><button type="button" data-command="reset" ${this.steps.length?'':'disabled'}>Recommencer</button><span data-run-status role="status">Espace : suivant · ←/→ : naviguer · Échap : pause</span></div>
  </section>`;
  this.paint();
 }
 onClick(event){const button=event.target.closest('[data-command]');if(!button)return;const command=button.dataset.command;if(command==='toggle'){this.playing?this.pause():this.play();}else if(command==='next')this.advance(1);else if(command==='previous')this.advance(-1);else if(command==='reset')this.reset();}
 onChange(event){if(!event.target.matches('[data-tempo]'))return;const elapsed=this.playing?this.elapsedBefore+performance.now()-this.startedAt:this.elapsedBefore,fraction=Math.min(.999,elapsed/Math.max(1,this.tempo*1000));this.tempo=clamp(event.target.value,.5,4);localStorage.setItem('astralis:rotation-tempo',String(this.tempo));if(this.playing){this.elapsedBefore=fraction*this.tempo*1000;this.startedAt=performance.now();}this.paint();}
 onKey(event){if(event.altKey||event.ctrlKey||event.metaKey)return;const target=event.target,key=event.key;if(key==='Escape'){event.preventDefault();this.pause();return;}if(target.closest('button,input,select,textarea'))return;if(![' ','ArrowRight','ArrowLeft'].includes(key))return;event.preventDefault();if(key==='ArrowLeft')this.advance(-1);else this.advance(1);}
 play(){if(!this.steps.length)return;if(this.completed){this.index=0;this.elapsedBefore=0;this.completed=false;}this.playing=true;this.startedAt=performance.now();this.tick();this.frame=requestAnimationFrame(()=>this.loop());this.paint();}
 pause(){if(!this.playing)return;this.elapsedBefore+=performance.now()-this.startedAt;this.playing=false;if(this.frame)cancelAnimationFrame(this.frame);this.frame=0;this.paint();}
 advance(amount){if(!this.steps.length)return;this.completed=false;const next=this.index+amount;if(next<0)this.index=0;else if(next>=this.steps.length)this.index=this.steps.length-1;else this.index=next;this.elapsedBefore=0;if(this.playing)this.startedAt=performance.now();this.paint();}
 reset(){this.pause();this.index=0;this.elapsedBefore=0;this.completed=false;this.paint();}
 loop(){if(!this.playing)return;this.tick();if(this.playing)this.frame=requestAnimationFrame(()=>this.loop());}
 tick(){if(!this.playing)return;const elapsed=this.elapsedBefore+performance.now()-this.startedAt;if(elapsed>=this.tempo*1000){const crossed=Math.floor(elapsed/(this.tempo*1000));if(this.index+crossed>=this.steps.length){this.index=this.steps.length-1;this.completed=true;this.pause();const status=this.querySelector('[data-run-status]');if(status)status.textContent='Rotation terminée · appuie sur Rejouer pour la refaire.';this.updateProgress(1);return;}this.index+=crossed;this.elapsedBefore=elapsed-crossed*this.tempo*1000;this.startedAt=performance.now();this.paint();}else this.updateProgress(elapsed/(this.tempo*1000));}
 updateProgress(partial=0){const count=this.steps.length,value=this.completed?1:(this.index+partial)/Math.max(1,count),bar=this.querySelector('.rotation-rehearsal-progress'),progress=this.querySelector('[data-progress]');if(bar)bar.setAttribute('aria-valuenow',String(value*count));if(progress)progress.style.width=`${Math.max(0,Math.min(100,value*100))}%`;}
 paint(announce=true,partial=0){
  const step=this.steps[this.index],count=this.steps.length,progress=this.querySelector('[data-progress]'),bar=this.querySelector('.rotation-rehearsal-progress'),name=this.querySelector('[data-step-name]'),character=this.querySelector('[data-step-character]'),code=this.querySelector('[data-step-code]'),skillIcon=this.querySelector('[data-skill-icon]'),avatar=this.querySelector('[data-avatar]'),stepCount=this.querySelector('[data-step-count]'),toggle=this.querySelector('[data-command="toggle"]'),status=this.querySelector('[data-run-status]');
  if(!step){if(name)name.textContent=count?'Lance la répétition de ton équipe':'Ajoute des compétences à la rotation';if(character)character.textContent='';if(code)code.textContent='—';if(skillIcon)skillIcon.removeAttribute('src');if(avatar)avatar.replaceChildren();return;}
  if(name)name.textContent=step.name||step.label||'Action';if(character)character.textContent=step.characterName||'Personnage non renseigné';if(code)code.textContent=(step.code||'F')+(Number(step.count)>1?' ×'+step.count:'');if(skillIcon){skillIcon.src=step.skillImage||'';skillIcon.alt=step.name||step.code||'Icône de compétence';skillIcon.hidden=!step.skillImage;skillIcon.onerror=()=>{skillIcon.hidden=true;};}if(stepCount)stepCount.textContent=`ÉTAPE ${this.index+1} / ${count}`;
  if(avatar){avatar.replaceChildren();if(step.avatar){const image=document.createElement('img');image.src=step.avatar;image.alt='';image.onerror=()=>{image.remove();avatar.textContent='✦';};avatar.append(image);}else avatar.textContent='✦';}
  if(bar)bar.setAttribute('aria-valuenow',String(this.completed?count:this.index+(this.playing?partial:0)));if(progress)progress.style.width=`${Math.max(0,Math.min(100,(this.completed?count:this.index+partial)/Math.max(1,count)*100))}%`;
  this.querySelectorAll('[data-command="previous"]').forEach(button=>button.disabled=this.index===0&&!this.playing);
  if(toggle)toggle.textContent=this.playing?'Ⅱ Pause':this.completed?'↻ Rejouer':'▶ Continuer';
  if(status&&announce&&this.playing)status.textContent=`Étape ${this.index+1} sur ${count} · ${this.tempo.toLocaleString('fr-FR')} secondes par action.`;
  this.querySelector('.rotation-rehearsal-stage')?.classList.toggle('is-playing',this.playing);
 }
}
if(globalThis.customElements&&!customElements.get('rotation-rehearsal'))customElements.define('rotation-rehearsal',RotationRehearsal);
