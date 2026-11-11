
const palettes={mondstadt:['#207c90','#77bd8b'],liyue:['#8f7a55','#e6bd58'],inazuma:['#603c85','#b576a9'],sumeru:['#588a42','#d6b775'],fontaine:['#397e96','#99b7a0'],primordial:['#175773','#63bacb'],natlan:['#776944','#cb6745'],nodkrai:['#6b6481','#9aaea0'],snezhnaya:['#48768d','#e1e9e8']};
export function drawPlanetRelief(world,now){
 const region=world.getAttribute('region');if(!palettes[region])return;
 if(!world.relief){
  const canvas=document.createElement('canvas');canvas.className='planet-relief';canvas.width=canvas.height=world.size*1.6;canvas.setAttribute('aria-hidden','true');world.append(canvas);world.relief=canvas;
 }
 const canvas=world.relief,ctx=canvas.getContext('2d'),size=canvas.width,center=size/2,r=world.size/2;
 ctx.clearRect(0,0,size,size);
 const motion=!matchMedia('(prefers-reduced-motion: reduce)').matches,time=motion?now/1000:0;
 const project=(longitude,latitude,height=0)=>{
  const a=longitude+world.angle*2*Math.PI,z=Math.cos(latitude)*Math.cos(a),radius=r*(1+height);
  return {x:center+Math.sin(a)*Math.cos(latitude)*radius,y:center+Math.sin(latitude)*radius,z};
 };
 const feature=(lon,lat,height,color,width=.07)=>{
  const top=project(lon,lat,height),left=project(lon-width,lat+.035),right=project(lon+width,lat+.035);
  if(top.z<.02)return;
  ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(left.x,left.y);ctx.lineTo(top.x,top.y);ctx.lineTo(right.x,right.y);ctx.closePath();ctx.fill();
  ctx.fillStyle='#ffffff35';ctx.beginPath();ctx.moveTo(left.x,left.y);ctx.lineTo(top.x,top.y);ctx.lineTo((left.x+right.x)/2,right.y);ctx.fill();
  return top;
 };
 const [dark,light]=palettes[region];
 if(region!=='primordial'){
  const count=region==='fontaine'?7:region==='snezhnaya'?26:18;
  for(let i=0;i<count;i++){
   const lon=i*2.399,lat=Math.sin(i*7.1)*.65;
   feature(lon,lat,region==='snezhnaya'?.06:.12+(i%3)*.035,i%2?light:dark,region==='snezhnaya'?.18:.055);
  }
 }
 if(region==='sumeru'){feature(.5,-.35,.32,'#659851',.18);feature(2,.3,.22,'#d9b66a',.14);}
 if(region==='sumeru'){
  const tree=project(.5,-.35,.27);if(tree.z>0){ctx.fillStyle='#4d6541';ctx.fillRect(tree.x-r*.018,tree.y,r*.035,r*.13);for(let i=0;i<5;i++){ctx.fillStyle=i%2?'#8ebf6d':'#4e915a';ctx.beginPath();ctx.ellipse(tree.x+Math.cos(i*1.26)*r*.065,tree.y+Math.sin(i*1.26)*r*.035,r*.085,r*.05,0,0,7);ctx.fill();}}
  const storm=project(2,.3,.15);if(storm.z>0){ctx.strokeStyle='#eac88770';ctx.lineWidth=r*.018;for(let i=0;i<5;i++){ctx.beginPath();ctx.ellipse(storm.x+Math.sin(time+i)*r*.015,storm.y-i*r*.025,r*(.025+i*.009),r*.018,0,time+i,time+i+4.5);ctx.stroke();}}
 }
 if(region==='primordial'||region==='inazuma'){
  for(const lon of [.8,3.1]){const cloud=project(lon,-.55,.16);if(cloud.z<0)continue;for(let i=0;i<4;i++){ctx.fillStyle=region==='inazuma'?'#ae9ec085':'#b1d3df85';ctx.beginPath();ctx.ellipse(cloud.x+(i-1.5)*r*.045,cloud.y-Math.sin(i)*r*.025,r*.06,r*.035,0,0,7);ctx.fill();}}
 }
 if(region==='natlan'){
  const top=feature(.4,-.4,.3,'#6e3931',.19);
  if(top)for(let i=0;i<12;i++){const t=(time*.6+i/12)%1;ctx.fillStyle=i%2?'#ffb64c':'#e85b34';ctx.beginPath();ctx.arc(top.x+Math.sin(i*3)*t*r*.15,top.y-t*r*.4,Math.max(1,r*.025*(1-t)),0,7);ctx.fill();}
 }
 if(region==='inazuma'&&Math.sin(time*2.1)>.87){
  for(const lon of [.8,3.1]){const p=project(lon,-.5,.15);if(p.z<0)continue;ctx.strokeStyle='#e9d2ff';ctx.lineWidth=Math.max(1,r*.025);ctx.beginPath();ctx.moveTo(p.x,p.y-r*.18);ctx.lineTo(p.x-r*.035,p.y-r*.06);ctx.lineTo(p.x+r*.045,p.y-r*.08);ctx.lineTo(p.x,p.y+r*.12);ctx.stroke();}
 }
 if(['liyue','snezhnaya','nodkrai'].includes(region)){
  const count=region==='nodkrai'?3:14;
  for(let i=0;i<count;i++){
   const speed=region==='nodkrai'?(i%2?-1:1)*.17:.1;
   const angle=time*speed+i*6.28/count,tilt=i%3*.7;
   const x=Math.cos(angle)*r*1.27,y=Math.sin(angle)*r*(.35+i%3*.1);
   const z=Math.sin(angle);if(z<0&&Math.hypot(x,y)<r)continue;
   ctx.fillStyle=region==='liyue'?'#edc875':region==='snezhnaya'?'#eaf3fa':['#d6cfe7','#a5d3dc','#dfb8d7'][i];
   ctx.beginPath();ctx.arc(center+x*Math.cos(tilt)-y*Math.sin(tilt),center+x*Math.sin(tilt)+y*Math.cos(tilt),r*(region==='nodkrai'?.09:.025),0,7);ctx.fill();
  }
 }
 if(['mondstadt','fontaine','primordial'].includes(region)){
  const rings=region==='primordial'?3:2;
  ctx.lineWidth=Math.max(1,r*.018);
  for(let i=0;i<rings;i++){ctx.strokeStyle=region==='mondstadt'?'#b0f0d175':'#9fe4ed75';ctx.beginPath();ctx.ellipse(center,center,r*(1.1+i*.12),r*(.2+i*.04),-.25+i*.18,time*.2+i,time*.2+i+Math.PI*1.5);ctx.stroke();}
 }
 if(['sumeru','snezhnaya','primordial'].includes(region)){
  for(let i=0;i<16;i++){
   const p=project(i*2.399,-.7+(i%5)*.2,.12);
   if(p.z<0)continue;
   const y=p.y+((time*.2+i/16)%1)*r*.18;
   ctx.fillStyle=region==='sumeru'?'#e0ed8ca0':'#d8effab0';ctx.fillRect(p.x,y,Math.max(1,r*.018),region==='primordial'?r*.05:Math.max(1,r*.018));
  }
 }
}
