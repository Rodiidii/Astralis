import {EL,ELC,G} from '../sheet-backdrop.js';
import {I,esc,fr,pct,act,shares,statRows,context} from './common.js';
export function template(data,el){
const {CH,IMG,asset}=context(data,el);

 const stats=statRows(data.stats);
 const arts=Array.from({length:5},(_,i)=>{const p=data.artifacts?.[i]||{};return [['flower','plume','sands','goblet','circlet'][i],['Fleur','Plume','Sablier','Coupe','Diadème'][i],esc(p.mainLabel||'—'),fr(p.mainValue)+(p.mainPercent?' %':''),Array.from({length:4},(_,j)=>{const sub=p.substats?.[j]||{};return [esc(sub.label||'—'),fr(sub.value)+(sub.percent?' %':''),sub.value==null||sub.rolls==null?-1:Math.max(0,(sub.rolls||1)-1)]})]});
 return `<div class="in">
 <div style="position:absolute;left:0;top:0;bottom:0;width:690px;overflow:hidden"><img class="art" src="${IMG.ayaka}" style="left:0;top:0;width:690px;height:1420px;object-position:50% 0;filter:brightness(2) contrast(1.08) saturate(1.2)"/>
  <div style="position:absolute;inset:0;background:linear-gradient(90deg,#0000 55%,${EL[el].e3} 100%),linear-gradient(180deg,${EL[el].e3}aa 0%,#0000 24%,#0000 66%,${EL[el].e3}f0 100%)"></div></div>
 <div style="position:absolute;left:70px;top:62px"><div class="kick"><b>Astralis</b> &nbsp;/&nbsp; Build</div>
  <div class="ttl" style="margin-top:12px;font-size:122px">${esc(data.title||'Build personnel')}</div>
  <div class="sub" style="margin-top:14px;color:#fff">${esc(data.name||'')}</div>
  <div style="display:flex;gap:12px;margin-top:18px"><span class="chip">${G(el,24,'currentColor',2)}${EL[el].n}</span><span class="chip" style="background:#0b0b12cc;border-color:#ffffff30;color:#f3eee4">Niv. ${esc(data.level??'—')}</span></div></div>
 <div style="position:absolute;left:70px;bottom:118px"><div class="mut" style="font:600 18px var(--sans);letter-spacing:.24em;text-transform:uppercase;margin-bottom:12px">Constellation · C${data.constellation||0}</div>
  <div style="display:flex;gap:12px">${[0,1,2,3,4,5].map(i=>`<span style="width:40px;height:40px;transform:rotate(45deg);border:2.5px solid var(--e1);background:${i<Number(data.constellation||0)?'var(--e1)':'#0b0b12bb'};border-radius:6px"></span>`).join('')}</div></div>
 <div class="foot" style="left:70px;right:auto;width:560px;bottom:44px"><span>Signé · <b>${esc(data.signature||'Astralis')}</b></span></div>

 <div style="position:absolute;left:740px;right:70px;top:62px;display:grid;grid-template-columns:1.25fr 1fr 1fr 1fr;gap:18px">
  <div class="pn glow" style="height:178px;padding:22px;display:flex;gap:18px;align-items:center"><span class="ico" style="width:98px;height:98px;border-radius:22px;background:radial-gradient(circle at 30% 25%,color-mix(in srgb,var(--e1) 55%,transparent),#0b0b12 75%);border:2px solid var(--e1);color:#fff">${asset(data.weapon?.image,el,'sword')}</span>
   <div><div class="mut" style="font:600 17px var(--sans);letter-spacing:.2em;text-transform:uppercase">Arme</div><div style="font:700 36px/1.1 var(--serif);margin-top:6px">${esc(data.weapon?.name||'—')}</div><div style="font:600 21px var(--sans);margin-top:8px;color:var(--e2)">${esc(data.weapon?.detail||'—')}</div></div></div>
  ${['Attaque normale','Compétence','Déchaînement'].map((name,i)=>[name,data.talents?.[i]??'—']).map(([l,n])=>`<div class="pn" style="height:178px;padding:22px;text-align:center"><div style="width:84px;height:84px;margin:0 auto;border-radius:50%;background:conic-gradient(var(--e1) ${(Number(n)||0)*10}%,#ffffff18 0);display:grid;place-items:center"><div style="width:68px;height:68px;border-radius:50%;background:#0d0d14;display:grid;place-items:center;font:800 32px var(--sans)">${n}</div></div><div style="font:600 21px/1.2 var(--sans);margin-top:14px">${l}</div></div>`).join('')}</div>

 <div style="position:absolute;left:740px;right:70px;top:268px"><div class="sl"><span class="dia"></span>Statistiques finales<i></i></div></div>
 <div style="position:absolute;left:740px;right:70px;top:318px;display:grid;grid-template-columns:repeat(4,1fr);gap:16px">
  ${stats.map(([k,l,v])=>`<div class="pn" style="height:112px;border-radius:18px;padding:16px 20px"><div style="display:flex;align-items:center;gap:10px;color:var(--e1)">${I(k,24)}<span class="mut" style="font:600 19px var(--sans)">${l}</span></div><div style="font:700 40px/1.2 var(--sans);margin-top:8px">${v}</div></div>`).join('')}</div>

 <div style="position:absolute;left:740px;right:70px;top:590px"><div class="sl"><span class="dia"></span>Artéfacts<i></i><em>${esc(data.setLabel||'Sets équipés')}</em></div></div>
 <div style="position:absolute;left:740px;right:70px;top:640px;display:grid;grid-template-columns:repeat(5,1fr);gap:14px">
  ${arts.map(([ic,l,ms,mv,sb])=>`<div class="pn" style="height:446px;border-radius:20px;border-color:color-mix(in srgb,var(--e1) 40%,transparent)">
   <div style="height:118px;position:relative;background:radial-gradient(circle at 50% 100%,color-mix(in srgb,var(--e1) 38%,transparent),transparent 72%);display:grid;place-items:center;color:var(--e2)">${asset(data.artifacts?.[arts.findIndex(a=>a[0]===ic)]?.image,el,ic)}
    <span style="position:absolute;left:12px;top:10px;font:700 18px var(--sans);color:var(--e1)">${l}</span><span style="position:absolute;right:12px;top:8px;font:800 18px var(--sans);padding:2px 10px;border-radius:999px;background:var(--e1);color:#10131a">+${esc(data.artifacts?.[arts.findIndex(a=>a[0]===ic)]?.level??'—')}</span>
    <span style="position:absolute;left:0;right:0;bottom:8px;text-align:center;color:#ffd777;font-size:17px;letter-spacing:3px">${'★'.repeat(Math.max(0,Math.min(5,Number(data.artifacts?.[arts.findIndex(a=>a[0]===ic)]?.rarity)||0)))}</span></div>
   <div style="padding:12px 16px 0"><div class="mut" style="font:600 17px var(--sans)">${ms}</div><div class="num" style="font-size:46px;line-height:1.05;color:#fff">${mv}</div></div>
   <div style="margin:10px 16px 0;height:1px;background:linear-gradient(90deg,var(--e1),transparent)"></div>
   <div style="padding:12px 16px;display:grid;gap:13px">${sb.map(([a,b,p])=>`<div><div style="display:flex;justify-content:space-between;font:600 17px var(--sans)"><span class="mut">${a}</span><b>${b}</b></div><div style="display:flex;gap:3px;margin-top:3px">${[1,2,3,4,5].map(j=>`<i style="height:4px;flex:1;border-radius:2px;background:${j<=p+1?'var(--e1)':'#ffffff18'}"></i>`).join('')}</div></div>`).join('')}</div></div>`).join('')}</div>

 <div style="position:absolute;left:740px;right:70px;top:1110px;display:grid;grid-template-columns:1fr 1fr;gap:16px">
  ${(data.setBonuses||[]).map(row=>[esc(row.label),esc(row.text)]).map(([a,b])=>`<div class="pn" style="padding:16px 22px;display:flex;gap:18px;align-items:center;border-radius:18px"><span class="chip" style="height:42px;font-size:20px;flex:none">${a}</span><span style="font:500 21px/1.3 var(--sans);color:#f4efe6">${b}</span></div>`).join('')}</div>
 <div style="position:absolute;left:740px;right:70px;top:1262px;height:126px" class="pn glow">
  <div style="position:absolute;left:30px;top:16px"><div class="mut" style="font:600 17px var(--sans);letter-spacing:.2em;text-transform:uppercase">Dégâts théoriques · cible niv. ${esc(data.enemy?.level??'—')}</div><div style="font:600 24px var(--sans);margin-top:6px;color:var(--e2)">${esc(data.attack||'Attaque sélectionnée')}</div></div>
  <div style="position:absolute;right:30px;top:12px;display:flex;gap:26px;align-items:flex-end">${[['Sans crit',fr(data.damage?.nonCrit)],['Moyen',fr(data.damage?.average)],['Crit',fr(data.damage?.crit)]].map(([l,v],i)=>`<div style="text-align:right"><div class="mut" style="font:600 16px var(--sans)">${l}</div><div class="num" style="font-size:${i==1?60:44}px;line-height:1.1;color:${i==1?'#fff':'var(--e2)'}">${v}</div></div>`).join('')}</div></div>
 </div>`
}
