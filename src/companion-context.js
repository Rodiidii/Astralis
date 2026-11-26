import {contextualDialogue} from './companion-dialogues.js?v=20261126-personal-workshop-6';
const KEY='astralis:companion-context:v1';
let behaviorProvider,wired=false;
export function connectCompanionBehavior(provider){
 behaviorProvider=provider;if(wired||!globalThis.document)return;wired=true;
 document.addEventListener('click',event=>{
  const b=event.target.closest?.('button');if(!b||b.closest('.assistant-page'))return;
  const action=b.dataset.action||b.dataset.cc||'',context=b.hasAttribute('data-save-team')?'rotation':b.hasAttribute('data-save-note')?'notes':/build-save/.test(action)?'build':/export|poster|png/.test(action)?'export':/recalculate|snapshot|baseline|sum/.test(action)?'lab':b.hasAttribute('data-wd-save')?'decision':b.hasAttribute('data-ar-done')?'explore':null;
  if(!context)return;setTimeout(()=>{const ctx=behaviorProvider?.();if(!ctx?.profile?.enabled||!ctx.profile.proactive||!ctx.character||ctx.quiet)return;let s;try{s=JSON.parse(localStorage.getItem(KEY)||'{}')}catch{s={}}const now=Date.now();if(now-(s.spoken||0)<Math.max(120000,(Number(ctx.profile.proactiveInterval)||5)*60000))return;s.spoken=now;s.actions=(s.actions||0)+1;localStorage.setItem(KEY,JSON.stringify(s));ctx.show(contextualDialogue(ctx.character,context,s.actions-1),context);},700);
 },true);
}
export function companionContextTransition(state={},section,now=Date.now()) {
 const next={last:'',at:0,spoken:0,counts:{},...state,counts:{...state.counts}};
 if(next.last===section&&now-next.at<90000)return {state:next,context:null};
 const previous=next.last;next.last=section;next.at=now;next.counts[section]=(next.counts[section]||0)+1;
 const map={farming:'farm',builds:'build',teams:'rotation',calc:'rotation',lab:'lab',wishes:'wish',atlas:'explore',lore:'lore',notes:'notes',media:'media',journey:'journey',tasks:'tasks',focus:'session'};
 return {state:next,context:previous&&next.counts[section]%4===0?'repeat':map[section]||null};
}
export function observeCompanionContext(section,{profile,character,quiet,show},now=Date.now()) {
 if(!profile?.enabled||!profile.proactive||!character||quiet)return;
 let stored;try{stored=JSON.parse(localStorage.getItem(KEY)||'{}')}catch{stored={}}
 const {state,context}=companionContextTransition(stored,section,now),cooldown=Math.max(120000,(Number(profile.proactiveInterval)||5)*60000);
 if(context&&stored.last&&now-(stored.spoken||now)<cooldown){localStorage.setItem(KEY,JSON.stringify(state));return;}
 if(context&&stored.last){state.spoken=now;const n=(state.counts[section]||1)-1;show(contextualDialogue(character,context,n),context);}
 if(!state.spoken)state.spoken=now;localStorage.setItem(KEY,JSON.stringify(state));
}
