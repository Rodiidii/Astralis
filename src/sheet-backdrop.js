// Adapted from the visual reference supplied by the user.
const EL={
 pyro:{n:'Pyro',e1:'#ff7a45',e2:'#ffd6bd',e3:'#170a0a',e4:'#6a2616'},
 hydro:{n:'Hydro',e1:'#4aa8ff',e2:'#c4e3ff',e3:'#08111f',e4:'#17457a'},
 anemo:{n:'Anémo',e1:'#4fe0c0',e2:'#c8f7ec',e3:'#061617',e4:'#16584f'},
 electro:{n:'Électro',e1:'#b27dff',e2:'#e5d4ff',e3:'#110a21',e4:'#47307f'},
 dendro:{n:'Dendro',e1:'#93d443',e2:'#dcf2b7',e3:'#0a1409',e4:'#2f5c17'},
 cryo:{n:'Cryo',e1:'#7fd6ff',e2:'#dcf3ff',e3:'#081420',e4:'#25587a'},
 geo:{n:'Géo',e1:'#f2b73f',e2:'#ffe6a9',e3:'#161008',e4:'#65491a'}};
const GL={
 pyro:'<path d="M12 2c1 3.5 5.5 5.5 5.5 10.2a5.5 5.5 0 0 1-11 0c0-2.3 1.2-3.6 2.4-4.7.1 2 .9 3 2 3.2-.8-3 .2-6.4 1.1-8.7z"/>',
 hydro:'<path d="M12 2.5c4 5 7 8.2 7 12a7 7 0 0 1-14 0c0-3.800 3-7 7-12z"/>',
 anemo:'<path d="M3.500 9h10.500a3 3 0 1 0-3-3M2.500 14h15a3 3 0 1 1-3 3M6 19h6"/>',
 electro:'<path d="M13.500 2 5 14h6l-1 8 9-12.500h-6.200z"/>',
 dendro:'<path d="M4.500 19.500C4.500 10 10.500 4 20 4c0 9.500-5.500 15.500-15.500 15.500zM4.500 19.500l9-9"/>',
 cryo:'<path d="M12 2v20M3.500 7l17 10M3.500 17l17-10M9 3.500l3 2.500 3-2.500M9 20.500l3-2.500 3 2.500"/>',
 geo:'<path d="M12 2l8 7-8 13L4 9zM4 9h16M9 9l3 13M15 9l-3 13"/>'};
const G=(el,s=24,col='currentColor',sw=1.8)=>`<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${GL[el]}</svg>`;
const ICO={
 sword:'<path d="M5 19 19 5M14 5h5v5M5 19l-1.500 1.500M7 14l3 3"/>',
 star:'<path d="M12 3l2.600 5.700 6.200.700-4.600 4.200 1.300 6.100L12 16.600 6.500 19.700l1.300-6.100L3.200 9.400l6.200-.7z"/>',
 ring:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.500"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
 x2:'<path d="M5 6l6 6-6 6M13 8h6M13 12h6M13 16h6"/>',
 flag:'<path d="M6 21V4M6 5h11l-2 4 2 4H6"/>',
 arrow:'<path d="M12 4v13M6 12l6 6 6-6"/>',
 hp:'<path d="M12 20s-8-4.500-8-10.300A4.500 4.500 0 0 1 12 7a4.500 4.500 0 0 1 8 2.700C20 15.500 12 20 12 20z"/>',
 atk:'<path d="M5 19 19 5M14 5h5v5M5 19l-1.500 1.500M7 14l3 3"/>',
 def:'<path d="M12 3l8 3v6c0 4.500-3.300 7.800-8 9-4.700-1.200-8-4.500-8-9V6z"/>',
 em:'<path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3.500 2"/>',
 cr:'<circle cx="12" cy="12" r="8"/><path d="M12 4v4M12 16v4M4 12h4M16 12h4"/>',
 cd:'<path d="M4 20 20 4M9 4h11v11"/>',
 er:'<path d="M20 12a8 8 0 1 1-3-6.200M20 4v5h-5"/>',
 flower:'<circle cx="12" cy="12" r="2.500"/><path d="M12 9.500C10 6 10.500 3.500 12 3c1.500.500 2 3 0 6.500zM14.500 12c3.500-2 6-1.500 6.500 0-.500 1.500-3 2-6.500 0zM12 14.500c2 3.500 1.500 6-0 6.500-1.500-.500-2-3 0-6.500zM9.500 12C6 14 3.500 13.500 3 12c.500-1.500 3-2 6.500 0z"/>',
 plume:'<path d="M20 4C10 4 5 9 5 17l-1 3 3-1c8 0 13-5 13-15zM5 17l9-9"/>',
 sands:'<path d="M7 3h10M7 21h10M8 3c0 5 4 6 4 9s-4 4-4 9M16 3c0 5-4 6-4 9s4 4 4 9"/>',
 goblet:'<path d="M6 4h12c0 6-2 9-6 9S6 10 6 4zM12 13v6M8 21h8"/>',
 circlet:'<path d="M3 17l2-10 4.500 4L12 5l2.500 6L19 7l2 10zM3 20h18"/>',
 gem:'<path d="M6 3h12l4 6-10 12L2 9zM2 9h20M9 3l-2 6 5 12 5-12-2-6"/>',
 book:'<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zM5 17a3 3 0 0 1 3-3h11"/>',
 coin:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5.500"/><path d="M12 9v6M9.500 12h5"/>',
 leaf:'<path d="M4.500 19.500C4.500 10 10.500 4 20 4c0 9.500-5.500 15.500-15.500 15.500zM4.500 19.500l9-9"/>',
 cloth:'<path d="M5 4h14l-1 6c-1 3-3 4-6 4s-5-1-6-4zM9 14l-2 7M15 14l2 7"/>',
 shard:'<path d="M12 2l6 8-6 12-6-12zM6 10h12"/>'
};
const I=(k,s=24,col='currentColor',sw=1.8)=>`<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${ICO[k]}</svg>`;
const ELC={pyro:'#ff7a45',hydro:'#4aa8ff',anemo:'#4fe0c0',electro:'#b27dff',dendro:'#93d443',cryo:'#7fd6ff',geo:'#f2b73f'};

/* ------------ Fond généré : motifs UNIQUES (graine), jamais répétés ------------ */
function rng(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const hx=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const mixc=(a,b,t)=>{const A=hx(a),B=hx(b);return'#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('')};
function backdrop(W,H,el,seed){
 const P=EL[el],r=rng(seed),R=(a,b)=>a+(b-a)*r(),f=n=>(+n).toFixed(1);
 let s=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><defs>
 <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${mixc(P.e3,P.e4,.18)}"/><stop offset=".5" stop-color="${mixc(P.e3,P.e4,.5)}"/><stop offset="1" stop-color="${P.e3}"/></linearGradient>
 <radialGradient id="vg" cx=".5" cy=".5" r=".78"><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".62"/></radialGradient>
 <linearGradient id="ray" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="${P.e2}" stop-opacity=".09"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
 <filter id="bl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${W/22}"/></filter>
 <filter id="gl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"/></filter>
 <filter id="gr"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="${seed%97}"/><feColorMatrix type="saturate" values="0"/></filter></defs>
 <rect width="${W}" height="${H}" fill="url(#bg)"/>`;
 // lueurs douces décalées
 for(let i=0;i<3;i++)s+=`<ellipse cx="${f(R(.05,.95)*W)}" cy="${f(R(.05,.95)*H)}" rx="${f(R(.18,.34)*W)}" ry="${f(R(.12,.26)*H)}" fill="${i?P.e4:P.e1}" opacity="${i?.5:.26}" filter="url(#bl)" transform="rotate(${f(R(-30,30))} ${W/2} ${H/2})"/>`;
 // rayons de lumière
 for(let i=0;i<2;i++){const x=R(.1,.9)*W,w=R(.05,.12)*W;s+=`<polygon points="${f(x)},0 ${f(x+w)},0 ${f(x+w-R(.2,.5)*W)},${H} ${f(x-R(.2,.5)*W)},${H}" fill="url(#ray)"/>`}
 // astrolabe (coin tiré au sort)
 const cx=(r()<.5?R(-.04,.12):R(.88,1.04))*W,cy=(r()<.5?R(-.06,.2):R(.8,1.06))*H,u=Math.min(W,H)/1000;
 [150,230,310,410,520].forEach((rad,i)=>{const d=rad*u;s+=`<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(d)}" fill="none" stroke="${P.e2}" stroke-opacity="${[.22,.14,.18,.1,.08][i]}" stroke-width="${i%2?1.5:2.5}"/>`;
  if(i%2==0)s+=`<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(d+14*u)}" fill="none" stroke="${P.e1}" stroke-opacity=".28" stroke-width="${f(12*u)}" stroke-dasharray="${f(1.6*u)} ${f(11*u)}"/>`});
 s+=`<g stroke="${P.e2}" stroke-opacity=".14" stroke-width="1.5"><path d="M${f(cx-560*u)} ${f(cy)}H${f(cx+560*u)}M${f(cx)} ${f(cy-560*u)}V${f(cy+560*u)}"/></g>`;
 const a0=R(0,6.28),a1=a0+R(.9,1.8),rr=310*u;s+=`<path d="M${f(cx+rr*Math.cos(a0))} ${f(cy+rr*Math.sin(a0))}A${f(rr)} ${f(rr)} 0 0 1 ${f(cx+rr*Math.cos(a1))} ${f(cy+rr*Math.sin(a1))}" fill="none" stroke="${P.e1}" stroke-opacity=".7" stroke-width="${f(4*u)}" stroke-linecap="round"/>`;
 // glyphe filigrane géant
 const gs=Math.min(W,H)*R(.5,.75);s+=`<g transform="translate(${f(R(.1,.7)*W)} ${f(R(.15,.6)*H)}) rotate(${f(R(-18,18))}) scale(${f(gs/24)})" fill="none" stroke="${P.e2}" stroke-opacity=".055" stroke-width="${f(.55)}" stroke-linejoin="round">${GL[el]}</g>`;
 // motif propre à l'élément
 const M={
  pyro(){let o='';for(let i=0;i<46;i++){const x=R(0,W),y=R(.15,1)*H,q=R(1.5,6.5);o+=`<circle cx="${f(x)}" cy="${f(y)}" r="${f(q)}" fill="${i%5?P.e1:P.e2}" opacity="${f(R(.2,.8))}"/>`;if(q>4)o+=`<circle cx="${f(x)}" cy="${f(y)}" r="${f(q*3)}" fill="${P.e1}" opacity=".08"/>`}
   for(let i=0;i<5;i++){const x=R(0,W),y=R(.5,1)*H;o+=`<path d="M${f(x)} ${f(y)}c${f(R(-60,60))} ${f(-R(80,160))} ${f(R(-80,80))} ${f(-R(200,380))} ${f(R(-30,30))} ${f(-R(300,520))}" fill="none" stroke="${P.e1}" stroke-opacity=".16" stroke-width="${f(R(2,6))}" stroke-linecap="round"/>`}return o},
  hydro(){let o='';for(let k=0;k<3;k++){const x=R(0,W),y=R(.1,.95)*H;for(let i=1;i<=7;i++)o+=`<circle cx="${f(x)}" cy="${f(y)}" r="${f(i*R(38,52))}" fill="none" stroke="${P.e1}" stroke-opacity="${f(.2-i*.02)}" stroke-width="2"/>`}
   for(let i=0;i<22;i++){const x=R(0,W),y=R(0,H),q=R(4,18);o+=`<circle cx="${f(x)}" cy="${f(y)}" r="${f(q)}" fill="none" stroke="${P.e2}" stroke-opacity=".3" stroke-width="1.5"/><circle cx="${f(x-q*.3)}" cy="${f(y-q*.3)}" r="${f(q*.18)}" fill="${P.e2}" opacity=".5"/>`}return o},
  anemo(){let o='';for(let k=0;k<4;k++){const x=R(0,W),y=R(0,H),sc=R(8,18);let p='';for(let t=0;t<14;t+=.2)p+=(t?'L':'M')+f(x+Math.cos(t+k)*t*sc)+' '+f(y+Math.sin(t+k)*t*sc*.8);o+=`<path d="${p}" fill="none" stroke="${P.e1}" stroke-opacity=".2" stroke-width="${f(R(1.5,4))}" stroke-linecap="round"/>`}
   for(let i=0;i<7;i++){const x=R(0,W),y=R(0,H);o+=`<path d="M${f(x)} ${f(y)}h${f(R(160,420))}a40 40 0 1 0 -40 -40" fill="none" stroke="${P.e2}" stroke-opacity=".16" stroke-width="3" stroke-linecap="round"/>`}return o},
  electro(){let o='';for(let k=0;k<6;k++){let x=R(0,W),y=R(-.05,.2)*H,p='M'+f(x)+' '+f(y);const n=Math.floor(R(7,12));for(let i=0;i<n;i++){x+=R(-90,90);y+=R(60,130);p+='L'+f(x)+' '+f(y)}
    o+=`<path d="${p}" fill="none" stroke="${P.e1}" stroke-opacity=".5" stroke-width="${f(R(5,9))}" filter="url(#gl)"/><path d="${p}" fill="none" stroke="${P.e2}" stroke-opacity=".5" stroke-width="2"/>`}
   for(let i=0;i<30;i++)o+=`<circle cx="${f(R(0,W))}" cy="${f(R(0,H))}" r="${f(R(1,3.5))}" fill="${P.e2}" opacity=".5"/>`;return o},
  dendro(){let o='';for(let k=0;k<6;k++){const left=r()<.5,x0=left?R(-30,.15*W):R(.85*W,W+30),y0=R(.05,.95)*H,dx=(left?1:-1);let x=x0,y=y0,p=`M${f(x)} ${f(y)}`;
    for(let i=0;i<6;i++){const nx=x+dx*R(60,150),ny=y+R(-120,120);p+=`Q${f(x+dx*R(0,90))} ${f(y+R(-130,130))} ${f(nx)} ${f(ny)}`;
      o+=`<ellipse cx="${f(nx)}" cy="${f(ny)}" rx="${f(R(14,30))}" ry="${f(R(7,13))}" transform="rotate(${f(R(-80,80))} ${f(nx)} ${f(ny)})" fill="${P.e1}" opacity="${f(R(.12,.3))}" stroke="${P.e2}" stroke-opacity=".25"/>`;x=nx;y=ny}
    o=`<path d="${p}" fill="none" stroke="${P.e1}" stroke-opacity=".3" stroke-width="${f(R(2,4))}" stroke-linecap="round"/>`+o}
   for(let i=0;i<26;i++)o+=`<circle cx="${f(R(0,W))}" cy="${f(R(0,H))}" r="${f(R(1.5,4))}" fill="${P.e2}" opacity="${f(R(.2,.6))}"/>`;return o},
  cryo(){let o='';for(let k=0;k<11;k++){const x=R(0,W),y=R(0,H),q=R(30,120),a=R(0,60);let p='';for(let i=0;i<6;i++){const t=(a+i*60)*Math.PI/180;p+=(i?'L':'M')+f(x+Math.cos(t)*q)+' '+f(y+Math.sin(t)*q)}
    o+=`<path d="${p}Z" fill="${P.e1}" fill-opacity="${f(R(.03,.09))}" stroke="${P.e2}" stroke-opacity=".3" stroke-width="2"/><path d="M${f(x-q)} ${f(y)}H${f(x+q)}M${f(x)} ${f(y-q)}V${f(y+q)}" stroke="${P.e2}" stroke-opacity=".12"/>`}
   for(let i=0;i<40;i++)o+=`<circle cx="${f(R(0,W))}" cy="${f(R(0,H))}" r="${f(R(1,3.5))}" fill="#fff" opacity="${f(R(.2,.7))}"/>`;return o},
  geo(){let o='';const hx0=R(.1,.9)*W,hy0=R(.1,.9)*H,q=R(46,70);for(let a=-2;a<=2;a++)for(let b=-2;b<=2;b++){if(r()<.35)continue;const x=hx0+a*q*1.75+(b%2)*q*.87,y=hy0+b*q*1.5;let p='';for(let i=0;i<6;i++){const t=(60*i-30)*Math.PI/180;p+=(i?'L':'M')+f(x+Math.cos(t)*q*.9)+' '+f(y+Math.sin(t)*q*.9)}
    o+=`<path d="${p}Z" fill="${P.e1}" fill-opacity="${f(R(0,.1))}" stroke="${P.e2}" stroke-opacity=".2" stroke-width="2"/>`}
   for(let i=0;i<12;i++){const x=R(0,W),y=R(0,H),q2=R(40,160),a=R(0,6.28);o+=`<polygon points="${f(x)},${f(y)} ${f(x+Math.cos(a)*q2)},${f(y+Math.sin(a)*q2)} ${f(x+Math.cos(a+1.3)*q2*.7)},${f(y+Math.sin(a+1.3)*q2*.7)}" fill="${P.e1}" fill-opacity="${f(R(.04,.12))}" stroke="${P.e2}" stroke-opacity=".18"/>`}return o}
 };s+=M[el]();
 // constellation
 const pts=[];for(let i=0;i<24;i++)pts.push([R(0,W),R(0,H)]);
 pts.forEach((a,i)=>{let b=null,bd=1e9;pts.forEach((c,j)=>{if(j==i)return;const d=Math.hypot(a[0]-c[0],a[1]-c[1]);if(d<bd){bd=d;b=c}});if(b&&bd<Math.min(W,H)*.32)s+=`<line x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(b[0])}" y2="${f(b[1])}" stroke="${P.e2}" stroke-opacity=".16"/>`});
 pts.forEach(p=>{const q=R(1.5,4);s+=`<circle cx="${f(p[0])}" cy="${f(p[1])}" r="${f(q*3.2)}" fill="${P.e2}" opacity=".08"/><circle cx="${f(p[0])}" cy="${f(p[1])}" r="${f(q)}" fill="${P.e2}" opacity=".8"/>`});
 // grain, vignette, cadre
 s+=`<rect width="${W}" height="${H}" filter="url(#gr)" opacity=".075" style="mix-blend-mode:overlay"/><rect width="${W}" height="${H}" fill="url(#vg)"/>`;
 s+=`<rect x="22" y="22" width="${W-44}" height="${H-44}" rx="10" fill="none" stroke="${P.e1}" stroke-opacity=".5" stroke-width="2.5"/><rect x="36" y="36" width="${W-72}" height="${H-72}" rx="6" fill="none" stroke="${P.e2}" stroke-opacity=".14"/>`;
 [[22,22],[W-22,22],[22,H-22],[W-22,H-22]].forEach(([x,y])=>s+=`<rect x="${x-8}" y="${y-8}" width="16" height="16" transform="rotate(45 ${x} ${y})" fill="${P.e3}" stroke="${P.e1}" stroke-width="2.5"/>`);
 return s+'</svg>'}


export {EL,ELC,G,I,backdrop,mixc};
