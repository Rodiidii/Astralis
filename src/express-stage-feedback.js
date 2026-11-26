import { playCharacterClick, characterAnimation } from './express-character-effects.js?v=20261124-expedition-3';
import { dialogueFor } from './express-progression.js?v=20261124-expedition-3';

export function companionMoment(stage,s,p,key,{kind='resonance',image='',strong=false}={}){
 if(!stage?.isConnected||!p)return;
 const descriptor=characterAnimation(p,key,s.world),scene=playCharacterClick(stage,p,key,s.world,{reduced:s.reducedMotion,amplified:true});
 const effect=[...stage.querySelectorAll('.cx-character-scene')].at(-1);effect?.classList.add(strong?'cx-foreground-power':'cx-companion-resonance');
 stage.style.setProperty('--cx-resonance-color',descriptor.color||'#b8e7d0');stage.classList.remove('cx-core-awakened');void stage.offsetWidth;stage.classList.add('cx-core-awakened');clearTimeout(stage._coreTimer);stage._coreTimer=setTimeout(()=>stage.classList.remove('cx-core-awakened'),2200);
 stage.querySelector('.cx-companion-dialogue')?.remove();const bubble=document.createElement('aside');bubble.className='cx-companion-dialogue';bubble.setAttribute('role','status');
 if(image){const icon=document.createElement('img');icon.src=image;icon.alt='';bubble.append(icon);}
 const body=document.createElement('span'),name=document.createElement('b'),text=document.createElement('q'),label=document.createElement('small');name.textContent=p._name||p.name||p.en||key;text.textContent=dialogueFor(p,key,s.world,kind);label.textContent=kind==='recruit'?'NOUVEAU COMPAGNON':kind==='level'?'NOUVEAU NIVEAU':kind==='skill'?'COMPÉTENCE':kind==='burst'?'ULTIME':kind==='charged'?'ATTAQUE CHARGÉE':'RÉSONANCE';body.append(label,name,text);bubble.append(body);stage.append(bubble);setTimeout(()=>bubble.remove(),5200);
 if(s.clicker?.readDialogue&&!s.clicker?.mediaMuted&&kind!=='burst'&&typeof speechSynthesis!=='undefined'){speechSynthesis.cancel();const voice=new SpeechSynthesisUtterance(text.textContent);voice.lang='fr-FR';voice.rate=1.04;voice.volume=.65;speechSynthesis.speak(voice);}
 return scene;
}
