import {EL,ELC,G} from '../sheet-backdrop.js';
import {I,esc,fr,pct,act,shares,statRows,context} from './common.js';
export function template(data,el){
const {CH,IMG,asset}=context(data,el);

 const m=(data.materials||[]).map(m=>['gem',esc(m.name),m.total]);
 return `<div class="in">
 <div style="position:absolute;left:44px;right:44px;top:112px;height:318px;border-radius:30px;overflow:hidden;border:2px solid color-mix(in srgb,var(--e1) 55%,transparent);box-shadow:0 0 60px color-mix(in srgb,var(--e1) 30%,transparent),inset 0 0 0 1px #ffffff14;background:radial-gradient(70% 90% at 70% 40%,color-mix(in srgb,var(--e1) 40%,transparent),transparent 70%),linear-gradient(160deg,var(--e4),var(--e3))">
  <!-- EMPLACEMENT DU SPLASH ART : <img> du personnage, object-fit:cover, object-position: centre-haut -->
  <svg viewBox="0 0 400 320" style="position:absolute;right:30px;bottom:-4px;height:330px;opacity:.9"><defs><linearGradient id="si" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${EL[el].e2}" stop-opacity=".95"/><stop offset="1" stop-color="${EL[el].e1}" stop-opacity=".25"/></linearGradient></defs><path d="M200 20c34 0 52 26 52 56 0 18-6 30-16 40 40 14 76 40 86 204H78C88 156 124 130 164 116c-10-10-16-22-16-40 0-30 18-56 52-56z" fill="url(#si)"/></svg>
  <div style="position:absolute;inset:0;background:linear-gradient(180deg,#0000 55%,#0a0d12e6 100%),linear-gradient(90deg,#0a0d1299,#0000 45%)"></div>
  <div style="position:absolute;left:24px;top:22px;display:flex;gap:10px"><span class="chip" style="height:40px;font-size:19px;letter-spacing:.1em;background:#0b0b12cc">NIV. ${esc(data.level??'—')}</span><span class="chip" style="height:40px;font-size:19px;letter-spacing:.1em;background:#0b0b12cc">TALENTS ${esc((data.talents||[]).join('/')||'—')}</span></div>
  <div style="position:absolute;right:24px;top:22px" class="ico"><span class="ico" style="width:52px;height:52px;background:#0b0b12cc;border:2px solid var(--e1);color:var(--e1)">${G(el,28,'currentColor',2)}</span></div></div>

 <div style="position:absolute;left:44px;right:44px;top:446px"><div class="kick" style="font-size:20px;letter-spacing:.3em;color:var(--e1)">Plan de farm · ${EL[el].n}</div>
  <div class="ttl" style="font-size:112px;margin-top:8px">${esc(data.name||data.title)}</div></div>

 <div class="pn" style="position:absolute;left:44px;right:44px;top:586px;height:96px;border-radius:24px;padding:20px 28px">
  <div style="display:flex;justify-content:space-between;align-items:baseline;font:500 25px var(--sans)"><span><b class="num" style="font-size:38px">0</b> <span class="mut">/ 15 matériaux au complet</span></span><b style="color:var(--e1);font-size:23px">0 %</b></div>
  <div style="margin-top:10px;height:9px;border-radius:5px;background:#ffffff18"><div style="width:2%;height:100%;border-radius:5px;background:var(--e1);box-shadow:0 0 12px var(--e1)"></div></div></div>

 <div style="position:absolute;left:44px;right:44px;top:704px;display:grid;grid-template-columns:1fr 1fr;gap:12px 14px">
  ${m.map(([ic,n,q],index)=>`<div class="pn" style="height:100px;border-radius:20px;display:flex;align-items:center;gap:14px;padding:0 20px 0 12px">
   <span class="ico" style="width:80px;height:80px;border-radius:18px;background:radial-gradient(circle at 30% 25%,color-mix(in srgb,var(--e1) 38%,transparent),#0b0b12 78%);border:1.5px solid color-mix(in srgb,var(--e1) 45%,transparent);color:var(--e2)">${asset(data.materials[index]?.image,el,ic)}</span>
   <div style="flex:1;min-width:0"><div style="font:600 22px/1.15 var(--sans)">${n}</div><div class="mut" style="font:500 17px var(--sans);margin-top:5px">Possédé ${fr(data.materials[index]?.owned??0)} / ${fr(q)}</div></div>
   <b class="num" style="font-size:${q>9999?34:46}px;color:var(--e1);white-space:nowrap">×${fr(Math.max(0,q-(data.materials[index]?.owned||0)))}</b></div>`).join('')}</div>
 <div class="foot" style="left:44px;right:44px;bottom:30px;justify-content:center;font-size:18px"><span>Astralis · Plan de farm</span></div></div>`
}
