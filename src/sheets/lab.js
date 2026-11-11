import {EL,ELC,G} from '../sheet-backdrop.js';
import {I,esc,fr,pct,act,shares,statRows,context} from './common.js';
export function template(data,el){
const {CH,IMG,asset}=context(data,el);

 const r=data.result||{};const ch=[['Base',r.base,'×'],['Bonus de dégâts',r.bonusMultiplier,'×'],['Crit moyen',r.critMultiplier,'×'],['DEF ennemie',r.defenseMultiplier,'×'],['RES ennemie',r.resistanceMultiplier,'×'],['Réaction',r.reactionMultiplier,'']];
 const st=statRows(data.stats).slice(0,7).map(row=>[...row,.65]);
 const sens=data.sensitivity||[['+1 % Taux CRIT',null],['+1 % DGT CRIT',null],['+10 Maîtrise',null],["+1 roll d’ATQ %",null]];
 return `<div class="in">
 <img class="art" src="${IMG.skirk}" style="right:0;top:0;width:1180px;height:500px;filter:saturate(1.15) contrast(1.05);-webkit-mask-image:linear-gradient(90deg,transparent,#000 50%),linear-gradient(180deg,#000 55%,transparent);-webkit-mask-composite:source-in;mask-image:linear-gradient(90deg,transparent,#000 50%),linear-gradient(180deg,#000 55%,transparent);mask-composite:intersect"/>
 <div style="position:absolute;left:90px;top:80px"><div class="kick"><b>Astralis</b> &nbsp;/&nbsp; Laboratoire de dégâts</div>
  <div class="ttl" style="margin-top:16px;font-size:150px">${esc(data.name||data.title)}</div>
  <div style="display:flex;gap:14px;margin-top:22px"><span class="chip">${G(el,24,'currentColor',2)}${EL[el].n}</span><span class="chip" style="background:#ffffff0d;border-color:#ffffff30;color:#f3eee4">Niveau ${esc(data.level??'—')} · C${data.constellation||0}</span></div></div>

 <div style="position:absolute;left:90px;right:90px;top:560px"><div class="sl"><span class="dia"></span>Résultat · dégâts moyens<i></i></div></div>
 <div class="pn glow" style="position:absolute;left:90px;right:90px;top:614px;height:476px;padding:44px 56px">
  <div style="font:600 26px var(--sans);color:var(--e2)">${esc(data.attack||'Attaque sélectionnée')}</div>
  <div class="num" style="font-size:210px;line-height:1;margin-top:18px;text-shadow:0 0 50px color-mix(in srgb,var(--e1) 55%,transparent)">${fr(data.result?.total??data.damage?.average)} <span style="font:700 52px var(--sans);color:var(--e1);letter-spacing:.06em">DGT</span></div>
  <div style="position:absolute;right:56px;top:46px;width:640px"><div class="mut" style="font:600 18px var(--sans);letter-spacing:.18em;text-transform:uppercase;margin-bottom:16px">Autres attaques du kit</div>
   ${(data.otherAttacks||[]).slice(0,4).map(a=>[esc(a.name),a.value,Math.min(1,(a.value||0)/Math.max(1,...data.otherAttacks.map(x=>x.value||0)))]).map(([l,v,b])=>`<div style="margin-bottom:15px"><div style="display:flex;justify-content:space-between;font:600 21px var(--sans)"><span>${l}</span><b>${fr(v)}</b></div><div style="margin-top:7px;height:10px;border-radius:5px;background:#ffffff14"><div style="width:${b*100}%;height:100%;border-radius:5px;background:linear-gradient(90deg,var(--e4),var(--e1))"></div></div></div>`).join('')}</div>
  <div style="display:flex;gap:18px;margin-top:34px">
   ${[['Sans crit',data.damage?.nonCrit],['Moyen',data.damage?.average??data.result?.total],['Crit',data.damage?.crit]].map(([l,v],i)=>`<div style="flex:1;border-radius:16px;padding:16px 22px;background:${i==1?'color-mix(in srgb,var(--e1) 22%,#0b0b12)':'#ffffff0c'};border:1.5px solid ${i==1?'var(--e1)':'#ffffff22'}"><div class="mut" style="font:600 19px var(--sans);letter-spacing:.14em;text-transform:uppercase">${l}</div><div class="num" style="font-size:46px;line-height:1.1">${fr(v)}</div></div>`).join('')}</div></div>

 <div style="position:absolute;left:90px;right:90px;top:1126px"><div class="sl"><span class="dia"></span>Décomposition du calcul<i></i><em>chaque terme est vérifiable</em></div></div>
 <div style="position:absolute;left:90px;right:90px;top:1180px;display:flex;align-items:center;gap:12px">
  ${ch.map(([l,v,o],i)=>`<div class="pn" style="flex:1;border-radius:16px;padding:16px 8px;text-align:center"><div class="mut" style="font:600 16px var(--sans);letter-spacing:.06em;text-transform:uppercase">${l}</div><div class="num" style="font-size:44px;line-height:1.15;margin-top:4px">${i==0?fr(v):fr(v)}</div></div>${o?`<span style="font:700 34px var(--sans);color:var(--e1)">${o}</span>`:''}`).join('')}</div>

 <div style="position:absolute;left:90px;right:90px;top:1368px"><div class="sl"><span class="dia"></span>Statistiques du calcul<i></i></div></div>
 <div style="position:absolute;left:90px;right:90px;top:1420px;display:grid;grid-template-columns:repeat(4,1fr);gap:18px">
  ${st.map(([k,l,v,b])=>`<div class="pn" style="height:132px;border-radius:18px;padding:18px 22px"><div style="display:flex;align-items:center;gap:12px;color:var(--e1)">${I(k,26)}<span class="mut" style="font:600 20px var(--sans);letter-spacing:.04em">${l}</span></div>
   <div style="font:700 42px/1.15 var(--sans);margin-top:8px">${v}</div><div style="margin-top:8px;height:6px;border-radius:3px;background:#ffffff14"><div style="width:${b*100}%;height:100%;border-radius:3px;background:var(--e1)"></div></div></div>`).join('')}
  <div class="pn" style="height:132px;border-radius:18px;display:grid;place-items:center;border-style:dashed;color:color-mix(in srgb,var(--e2) 55%,transparent);font:500 19px var(--sans)">Cible niv. ${esc(data.enemy?.level??'—')} · RES ${fr(data.enemy?.resistance)} %</div></div>

 <div style="position:absolute;left:90px;right:90px;top:1736px"><div class="sl"><span class="dia"></span>Sensibilité<i></i><em>gain moyen pour chaque amélioration</em></div></div>
 <div style="position:absolute;left:90px;right:90px;top:1788px;display:grid;grid-template-columns:repeat(4,1fr);gap:18px">
  ${sens.map(([l,v])=>`<div><div style="display:flex;justify-content:space-between;font:600 21px var(--sans)"><span>${l}</span><b style="color:var(--e1)">${v==null?'—':(v>=0?'+':'')+fr(v)+' %'}</b></div><div style="margin-top:10px;height:12px;border-radius:6px;background:#ffffff14"><div style="width:${Math.min(100,Math.max(0,Number(v)||0)/1.1*100)}%;height:100%;border-radius:6px;background:linear-gradient(90deg,var(--e4),var(--e1))"></div></div></div>`).join('')}</div>
 <div class="foot" style="left:90px;right:90px;bottom:38px"><span><b>Astralis</b></span><span>Laboratoire de dégâts</span></div></div>`
}
