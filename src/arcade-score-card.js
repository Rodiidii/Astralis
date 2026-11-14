const GAME_LABELS={gi:'GENSHIN IMPACT · ÉCHO DE TEYVAT',hsr:'HONKAI: STAR RAIL · ASTRAL EXPRESS',ww:'WUTHERING WAVES · RÉSONANCE TIDÉALE'};
const GAME_ACCENTS={gi:['#e9c986','#70b88e'],hsr:['#d4a8ff','#7b68d8'],ww:['#8be3cd','#328c98']};

function roundedRect(ctx,x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);}
function drawStars(ctx,seed){let n=seed>>>0;const random=()=>{n=(n*1664525+1013904223)>>>0;return n/4294967296};for(let i=0;i<150;i++){const x=random()*1200,y=random()*1600,r=.5+random()*1.7;ctx.globalAlpha=.15+random()*.55;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1;}
function drawCard({game,score,accuracy,combo,date,title='DÉFI QUOTIDIEN · PULSE DE L’ULTIME',scoreLabel='POINTS',accuracyLabel='PRÉCISION',statOneLabel='MEILLEUR COMBO',statOneValue,statTwoLabel='PULSATIONS',statTwoValue='18 / 18'}){
 const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=1600;const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Le rendu de la carte est indisponible.');
 const [accent,secondary]=GAME_ACCENTS[game]||GAME_ACCENTS.gi;
 const bg=ctx.createLinearGradient(0,0,1100,1600);bg.addColorStop(0,'#101322');bg.addColorStop(.5,'#1a1730');bg.addColorStop(1,'#0b101a');ctx.fillStyle=bg;ctx.fillRect(0,0,1200,1600);
 const glow=ctx.createRadialGradient(760,560,5,760,560,720);glow.addColorStop(0,`${secondary}66`);glow.addColorStop(1,'transparent');ctx.fillStyle=glow;ctx.fillRect(0,0,1200,1300);drawStars(ctx,`${date}:${game}:${score}`.split('').reduce((a,c)=>Math.imul(a^c.charCodeAt(0),16777619),2166136261));
 ctx.strokeStyle=`${accent}88`;ctx.lineWidth=2;roundedRect(ctx,54,54,1092,1492,36);ctx.stroke();
 ctx.textAlign='left';ctx.fillStyle=accent;ctx.font='700 25px system-ui';ctx.letterSpacing='5px';ctx.fillText('ASTRALIS   /   ARCADE',100,145);ctx.letterSpacing='0px';
 ctx.fillStyle='#f6f1e8';ctx.font='600 31px system-ui';ctx.fillText(GAME_LABELS[game]||GAME_LABELS.gi,100,232);
 ctx.fillStyle=accent;ctx.font='700 24px system-ui';ctx.fillText(String(title).toLocaleUpperCase('fr-FR').slice(0,42),100,365);
 ctx.fillStyle='#fff';ctx.font='700 164px system-ui';ctx.fillText(Number(score).toLocaleString('fr-FR'),92,624);
 ctx.fillStyle='#b9b7c6';ctx.font='500 30px system-ui';ctx.fillText(String(scoreLabel).toLocaleUpperCase('fr-FR'),105,682);
 const ringX=600,ringY=925,r=178;ctx.lineWidth=24;ctx.strokeStyle='#ffffff18';ctx.beginPath();ctx.arc(ringX,ringY,r,-Math.PI/2,Math.PI*1.5);ctx.stroke();ctx.strokeStyle=accent;ctx.lineCap='round';ctx.beginPath();ctx.arc(ringX,ringY,r,-Math.PI/2,-Math.PI/2+Math.PI*2*Math.max(0,Math.min(100,Number(accuracy)||0))/100);ctx.stroke();ctx.lineCap='butt';
 ctx.textAlign='center';ctx.fillStyle='#fff';ctx.font='700 91px system-ui';ctx.fillText(`${Math.round(accuracy)}%`,ringX,ringY+20);ctx.fillStyle='#b9b7c6';ctx.font='600 24px system-ui';ctx.fillText(String(accuracyLabel).toLocaleUpperCase('fr-FR'),ringX,ringY+65);
 const boxes=[{x:110,label:statOneLabel,value:statOneValue??`×${combo}`},{x:625,label:statTwoLabel,value:statTwoValue}];for(const box of boxes){ctx.fillStyle='#ffffff0d';roundedRect(ctx,box.x,1205,465,160,22);ctx.fill();ctx.strokeStyle='#ffffff20';ctx.stroke();ctx.textAlign='left';ctx.fillStyle='#a8a6b5';ctx.font='600 21px system-ui';ctx.fillText(String(box.label).toLocaleUpperCase('fr-FR'),box.x+28,1253);ctx.fillStyle='#fff';ctx.font='700 51px system-ui';ctx.fillText(String(box.value),box.x+28,1323)}
 ctx.textAlign='center';ctx.fillStyle='#a8a6b5';ctx.font='500 22px system-ui';ctx.fillText(`${date}   ·   Défi terminé`,600,1450);ctx.fillStyle=accent;ctx.font='600 18px system-ui';ctx.letterSpacing='4px';ctx.fillText('TON TEMPO. TON UNIVERS.',600,1500);ctx.letterSpacing='0px';return canvas;
}

export async function exportArcadeScoreCard(data){
 const canvas=drawCard(data);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw new Error('La carte PNG n’a pas pu être générée.');
 const url=URL.createObjectURL(blob),anchor=document.createElement('a');anchor.href=url;anchor.download=`astralis-${(data.title||'pulse').toLocaleLowerCase('fr-FR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}-${data.game}-${data.date.replaceAll('/','-')}.png`;anchor.click();setTimeout(()=>URL.revokeObjectURL(url),5000);
 let copied=false;try{if(navigator.clipboard?.write&&window.ClipboardItem){await navigator.clipboard.write([new ClipboardItem({'image/png':blob})]);copied=true}}catch{}
 return copied?'Carte téléchargée et copiée dans le presse-papiers.':'Carte PNG téléchargée.';
}
