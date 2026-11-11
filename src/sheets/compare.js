import {EL,ELC,G} from '../sheet-backdrop.js';
import {I,esc,fr,pct,act,shares,statRows,context} from './common.js';
export function template(data,el){
const {CH,IMG,asset}=context(data,el);

 const A=data.members.map((m,i)=>[String(i),m.before??null]),B=data.members.map((m,i)=>[String(i),m.after??null]);
 const sum=rows=>rows.every(x=>Number.isFinite(x[1]))?rows.reduce((s,x)=>s+Math.max(0,x[1]),0):null;const tA=sum(A),tB=sum(B),d=tA>0&&tB!=null?(tB/tA-1)*100:null;
 const bar=(v,m,col,l)=>`<div style="margin-top:20px"><div style="display:flex;justify-content:space-between;font:600 22px var(--sans)"><span>${l}</span><span class="num" style="font-size:40px;line-height:1">${fr(v)}</span></div><div style="margin-top:10px;height:24px;border-radius:12px;background:#ffffff12"><div style="width:${(Number(v)||0)/Math.max(1,m)*100}%;height:100%;border-radius:12px;background:linear-gradient(90deg,${col}99,${col});box-shadow:0 0 18px ${col}77"></div></div></div>`;
 return `<div class="in">
 <img class="art" src="${IMG.bennettHero}" style="right:0;top:0;width:900px;height:333px;-webkit-mask-image:linear-gradient(90deg,transparent,#000 45%),linear-gradient(180deg,#000 62%,transparent);-webkit-mask-composite:source-in;mask-image:linear-gradient(90deg,transparent,#000 45%),linear-gradient(180deg,#000 62%,transparent);mask-composite:intersect"/>
 <div style="position:absolute;left:78px;top:62px"><div class="kick"><b>Astralis</b> &nbsp;/&nbsp; Comparatif d'équipe</div>
  <div class="ttl" style="margin-top:14px">${esc(data.title||data.name||'Fiche personnelle')}</div><div class="sub" style="margin-top:16px">Rotation de ${fr(data.duration)} s · avant / après modification</div></div>

 <div style="position:absolute;left:78px;right:78px;top:372px"><div class="sl"><span class="dia"></span>Résultats<i></i></div></div>
 <div class="pn glow" style="position:absolute;left:78px;top:424px;width:900px;height:320px;padding:30px 36px">
  <div style="display:flex;justify-content:space-between;align-items:center"><span class="mut" style="font:600 20px var(--sans);letter-spacing:.18em;text-transform:uppercase">DPS d'équipe</span>
   <span style="padding:8px 20px;border-radius:999px;background:var(--e1);color:#10131a;font:800 28px var(--sans)">${d==null?'—':(d>=0?'+':'')+fr(d)+' %'}</span></div>
  ${bar(tA,tB,'#8d93a6','Équipe actuelle')}${bar(tB,tB,EL[el].e1,'Équipe modifiée')}</div>
 <div class="pn" style="position:absolute;left:1002px;top:424px;width:920px;height:320px;padding:30px 36px">
  <span class="mut" style="font:600 20px var(--sans);letter-spacing:.18em;text-transform:uppercase">Dégâts par rotation</span>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:30px;margin-top:26px">
   <div><div class="mut" style="font:600 20px var(--sans)">Actuelle</div><div class="num" style="font-size:78px;line-height:1.05;margin-top:6px">${fr(data.beforeDamage)}</div></div>
   <div><div style="font:600 20px var(--sans);color:var(--e1)">Modifiée</div><div class="num" style="font-size:78px;line-height:1.05;margin-top:6px;color:var(--e2)">${fr(data.afterDamage)}</div></div></div>
  <div style="margin-top:26px;font:500 21px/1.4 var(--sans);color:color-mix(in srgb,var(--e2) 75%,transparent)">${esc(data.explanation||'Comparaison des conditions et valeurs renseignées.')}</div></div>

 <div style="position:absolute;left:78px;right:78px;top:782px"><div class="sl"><span class="dia"></span>Répartition des dégâts<i></i><em>somme = 100 %</em></div></div>
 <div style="position:absolute;left:78px;right:78px;top:834px;display:grid;gap:18px">
 ${[['Actuelle',A,tA],['Modifiée',B,tB]].map(([l,T,t])=>`<div style="display:flex;align-items:center;gap:22px"><span style="width:150px;font:600 22px var(--sans)">${l}</span>
  <div style="flex:1;display:flex;height:50px;border-radius:14px;overflow:hidden;gap:4px">${T.map(([k,v])=>`<div style="width:${shares(T.map(r=>r[1]))[T.findIndex(r=>r[0]===k)]}%;background:linear-gradient(180deg,${ELC[CH[k].el]},${ELC[CH[k].el]}bb);display:flex;align-items:center;padding-left:14px;font:700 20px var(--sans);color:#0b0b12;border-radius:6px;white-space:nowrap;overflow:hidden">${v>0?fr(shares(T.map(r=>r[1]))[T.findIndex(r=>r[0]===k)])+' %':''}</div>`).join('')}</div></div>`).join('')}</div>

 <div style="position:absolute;left:78px;right:78px;top:1020px"><div class="sl"><span class="dia"></span>Détail par personnage<i></i></div></div>
 <div style="position:absolute;left:78px;right:78px;top:1070px;display:grid;grid-template-columns:repeat(4,1fr);gap:24px">
 ${A.map(([k,v],i)=>{const h=CH[k],col=ELC[h.el],w=B[i][1],dd=w-v,m=Math.max(v,w);return `<div class="pn" style="height:372px;border-color:${col}99;box-shadow:0 22px 44px #0007,0 0 30px ${col}33"><div style="position:relative;height:210px"><img class="art" src="${IMG[h.img]}" style="inset:0;width:100%;height:100%;object-position:${data.members[i]?.focalX||50}% 30%"/>
  <div style="position:absolute;inset:0;background:linear-gradient(180deg,#0000 40%,#0b0b12f2 100%)"></div>
  <div class="ico" style="position:absolute;left:14px;top:14px;width:50px;height:50px;background:#0b0b12cc;border:2.5px solid ${col}">${G(h.el,28,col,2)}</div>
  <div style="position:absolute;right:14px;top:16px;padding:6px 16px;border-radius:999px;font:800 22px var(--sans);background:${dd>=0?col:'#ff8a8a'};color:#0b0b12">${dd>=0?'+':'−'}${fr(Number.isFinite(v)&&Number.isFinite(w)?Math.abs(dd):null)} DPS</div>
  <div style="position:absolute;left:18px;bottom:8px;font:700 52px/1 var(--serif);text-shadow:0 3px 14px #000">${h.n}</div></div>
  <div style="padding:16px 20px;display:grid;gap:12px">
   <div style="display:grid;grid-template-columns:70px 1fr 64px;align-items:center;gap:12px;font:600 19px var(--sans)"><span class="mut">Avant</span><div style="height:12px;border-radius:6px;background:#ffffff16"><div style="width:${(Number(v)||0)/Math.max(1,m)*100}%;height:100%;border-radius:6px;background:#8d93a6"></div></div><b style="text-align:right">${fr(v)}</b></div>
   <div style="display:grid;grid-template-columns:70px 1fr 64px;align-items:center;gap:12px;font:600 19px var(--sans)"><span style="color:${col}">Après</span><div style="height:12px;border-radius:6px;background:#ffffff16"><div style="width:${Math.max(0,Number(w)||0)/Math.max(1,m)*100}%;height:100%;border-radius:6px;background:${col};box-shadow:0 0 12px ${col}88"></div></div><b style="text-align:right">${fr(w)}</b></div>
   <div class="mut" style="font:500 18px var(--sans)">Part de l'équipe : ${pct(v,tA)} % → ${pct(w,tB)} %</div></div></div>`}).join('')}</div>
 <div class="foot" style="bottom:30px"><span>Signé · <b>${esc(data.signature||'Astralis')}</b></span><span>Astralis · Comparatif</span></div></div>`
}
