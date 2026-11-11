import * as T from '../assets/vendor/three/three.module.js';
import {loadPlanetGeography,regionalGeography,geographicalSample} from './planet-geography.js';
import {buildGeographicLandmarks} from './planet-landmarks.js';
import {addRegionalWeather} from './planet-weather.js';
import {addRulerSatellites,addCentralMoons} from './planet-rulers.js';

// One GPU context shared by every DOM planet. Models contain geometry, never AI images.
export const REGIONAL_WORLDS={
 mondstadt:{sea:'#246c87',land:'#60ae78',high:'#b5d798',rock:'#96b5a4',light:'#98f3ce'},
 liyue:{sea:'#334f61',land:'#828b83',high:'#d4bc76',rock:'#747b85',light:'#ffd177'},
 inazuma:{sea:'#473f77',land:'#728c78',high:'#e4a5d1',rock:'#8e6baf',light:'#df9fff'},
 sumeru:{sea:'#286d70',land:'#39885a',high:'#b7d683',rock:'#d7ac63',light:'#d8ee8c'},
 fontaine:{sea:'#397eae',land:'#8dbd91',high:'#d2c6e1',rock:'#9a99b9',light:'#abedff'},
 primordial:{sea:'#16758c',land:'#328ca8',high:'#87dfdf',rock:'#b8e8e9',light:'#a1ffff'},
 natlan:{sea:'#337b73',land:'#bbae60',high:'#72ad70',rock:'#ae604a',light:'#ffb56f'},
 nodkrai:{sea:'#535c80',land:'#729788',high:'#c1bad8',rock:'#9696ac',light:'#c6e5e1'},
 snezhnaya:{sea:'#264b6c',land:'#b6d6e1',high:'#edf4f4',rock:'#8fa7be',light:'#d5efff'}
};
let renderer,failed=false,software=false,frameBucket=-1,frameDraws=0;const pendingWorlds=new Set();
const Y=new T.Vector3(0,1,0),V=new T.Vector3();
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
function rand(seed){let state=seed|0;return ()=>{state=Math.imul(1664525,state)+1013904223|0;return (state>>>0)/4294967296;};}
function normal(lon,lat){return new T.Vector3(Math.sin(lon)*Math.cos(lat),Math.sin(lat),Math.cos(lon)*Math.cos(lat));}
function material(color,extra={}){return new T.MeshStandardMaterial({color,roughness:.86,metalness:.03,...extra});}
function mesh(parent,geometry,mat,position){const object=new T.Mesh(geometry,mat);object.castShadow=!!mat.isMeshStandardMaterial;object.receiveShadow=!!mat.isMeshStandardMaterial;if(position)object.position.copy(position);parent.add(object);return object;}
function anchor(parent,lon,lat,radius=1){const group=new T.Group(),axis=normal(lon,lat);group.position.copy(axis.multiplyScalar(radius));group.quaternion.setFromUnitVectors(Y,axis.normalize());parent.add(group);return group;}
function line(parent,points,color,radius=.009){return mesh(parent,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),Math.max(16,points.length*4),radius,5,false),new T.MeshBasicMaterial({color,transparent:true,opacity:.8}));}
function landField(x,y,z,region){
 const blob=(lon,lat,width)=>{const n=normal(lon,lat);return Math.exp((x*n.x+y*n.y+z*n.z-1)/width);};
 const ridge=(Math.sin(x*17+y*11+Math.sin(z*9))*.5+.5)*(Math.cos(z*15-x*8)*.5+.5);
 const edge=Math.sin(x*29+Math.cos(y*18))*Math.cos(z*26+y*17)*.045+Math.sin(x*11-y*13+z*9)*.035;
 let mass=blob(-.65,.45,.28)+blob(2.1,.1,.3)*.9+blob(-2,-.55,.17)*.65,threshold=.45;
 if(region==='liyue'){mass=blob(-.4,.2,.5)+blob(2.2,-.2,.4);threshold=.45;}
 if(region==='inazuma'){mass=0;for(let i=0;i<8;i++)mass+=blob(i*.86,Math.sin(i*2.8)*.55,.022+i%3*.008);threshold=.42;}
 if(region==='sumeru'){mass=blob(0,.1,.75)+blob(3,-.3,.2);threshold=.41;}
 if(region==='fontaine'){mass=blob(-.65,.55,.16)+blob(1.9,.25,.14)+blob(3.3,.35,.13);threshold=.47;}
 if(region==='natlan'){mass=blob(-.5,.35,.5)+blob(2.6,-.15,.3);threshold=.4;}
 if(region==='nodkrai'){mass=blob(-.5,.55,.23)+blob(2,.1,.25)+blob(-2.2,-.5,.08);threshold=.43;}
 if(region==='snezhnaya'){mass=blob(-.4,.2,.75)+blob(2.7,-.3,.5);threshold=.5;}
 if(region==='primordial')return {height:.976,land:false,sand:false,ridge};
 const value=mass-threshold+edge,isLand=value>0;
 return {height:isLand?.995+Math.pow(clamp(value),1.4)*.16+ridge*.025:.96,land:isLand,sand:region==='sumeru'&&x>.02,ridge};
}

function terrain(model,tint){
 const region=model.region,p=model.palette,g=new T.SphereGeometry(1,160,96),positions=g.attributes.position,colors=[];
 const sea=new T.Color(p.sea),land=new T.Color(p.land),high=new T.Color(p.high),sand=new T.Color('#dbb675'),rock=new T.Color(p.rock),shift=/^#[a-f0-9]{6}$/i.test(tint||'')?new T.Color(tint):null;
 for(let i=0;i<positions.count;i++){
  V.fromBufferAttribute(positions,i).normalize();const sample=model.geography?geographicalSample(model.geography,V.x,V.y,V.z):landField(V.x,V.y,V.z,region),height=sample.height;
  const color=sample.land?(sample.sand?sand:land).clone().lerp(sample.sand?rock:high,clamp((height-1)*5)):sea.clone();
  if(region==='snezhnaya'&&sample.land)color.lerp(high,.65);
  if(sample.land)color.multiplyScalar(.88+sample.ridge*.19);
  if(shift)color.lerp(shift,.28);
  colors.push(model.geography?1:color.r,model.geography?1:color.g,model.geography?1:color.b);if(model.geography){const uv=g.attributes.uv;const inside=sample.u>=0&&sample.u<=1&&sample.v>=0&&sample.v<=1;uv.setXY(i,inside?sample.u:0,inside?1-sample.v:1);}positions.setXYZ(i,V.x*height,V.y*height,V.z*height);
 }
 g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.computeVertexNormals();
 model.terrain=mesh(model.surface,g,material('#ffffff',{vertexColors:true,roughness:.94}));model.terrain.name='relief-terrain';
 if(model.geography&&typeof document!=='undefined'){const tex=new T.TextureLoader().load(new URL("../"+model.geography.image,import.meta.url).href,()=>{model.textureReady=true;model.onReady?.();});tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=4;model.terrain.material.map=tex;model.terrain.material.needsUpdate=true;}
 const ocean=mesh(model.surface,new T.SphereGeometry(.984,80,48),material(p.sea,{roughness:.38,metalness:.12}));ocean.name='ocean';ocean.castShadow=false;model.ocean=ocean;
 const clock={value:0};ocean.material.onBeforeCompile=shader=>{shader.uniforms.waterTime=clock;shader.vertexShader='uniform float waterTime; varying vec3 waterPosition;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nwaterPosition=position; transformed += normal*.003*sin(position.x*21.+waterTime)*cos(position.z*18.-waterTime*.7);');shader.fragmentShader='uniform float waterTime; varying vec3 waterPosition;\n'+shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nfloat ripple=sin(waterPosition.y*18.+sin(waterPosition.x*8.+waterPosition.z*7.+waterTime*.35)); diffuseColor.rgb *= .97 + .045*ripple;');};model.animated.push(time=>clock.value=time);

}
function mountain(parent,height=.5,width=.18,color='#a4b5c6',snow=false){
 const base=mesh(parent,new T.ConeGeometry(width,height,7,3),material(color));base.name='static-landmark';base.position.y=height*.5;base.rotation.y=.25;
 // Contrasting ridges have physical faces rather than painted highlights.
 for(let i=0;i<3;i++){const shard=mesh(parent,new T.ConeGeometry(width*.36,height*.7,5,2),material(i%2?color:'#d2c7b0'));shard.name='static-landmark';shard.position.set(Math.cos(i*2.1)*width*.52,height*.32,Math.sin(i*2.1)*width*.4);shard.rotation.z=(i-1)*.12;}
 if(snow){const cap=mesh(parent,new T.ConeGeometry(width*.36,height*.32,7),material('#eef0f2'));cap.name='static-landmark';cap.position.y=height*.88;}
 return base;
}
function tree(parent,size=1,color='#64a778',pine=false){
 const trunk=mesh(parent,new T.CylinderGeometry(.018*size,.033*size,.22*size,7),material('#867158'));trunk.name='static-landmark';trunk.position.y=.1*size;
 if(pine){for(let i=0;i<3;i++){const crown=mesh(parent,new T.ConeGeometry((.12-i*.023)*size,.19*size,7),material(i===2?'#bbcfc3':color));crown.name='static-landmark';crown.position.y=(.17+i*.07)*size;}}
 else for(let i=0;i<5;i++){const crown=mesh(parent,new T.IcosahedronGeometry((i===0?.14:.095)*size,1),material(i%2?color:'#8ac18b'));crown.name='static-landmark';crown.scale.y=.67;crown.position.set(Math.sin(i*2.4)*.09*size,(.27+Math.cos(i*1.7)*.035)*size,Math.cos(i*2.4)*.07*size);}
}
function cloud(parent,size=1,dark=false){
 const group=new T.Group();parent.add(group);const mat=material(dark?'#a096bc':'#e0ebed',{roughness:1});
 for(let i=0;i<5;i++){const puff=mesh(group,new T.SphereGeometry((.1+i%2*.025)*size,12,8),mat);puff.position.set((i-2)*.075*size,Math.sin(i*2)*.022*size,Math.cos(i*2)*.03*size);puff.scale.y=.6;}
 return group;
}
function arc(parent,radius,color,tilt=0,opacity=.5){
 const points=Array.from({length:101},(_,i)=>{const a=i/100*Math.PI*2;return [Math.cos(a)*radius,0,Math.sin(a)*radius];});
 const ring=line(parent,points,color,.012);ring.rotation.x=tilt;ring.material.opacity=opacity;return ring;
}
function motes(parent,count,color,size,random){
 const geometry=new T.BufferGeometry(),positions=new Float32Array(count*3),seeds=[];
 for(let i=0;i<count;i++){seeds.push([random()*Math.PI*2,random()*Math.PI*2,.98+random()*.6,random()]);}
 geometry.setAttribute('position',new T.BufferAttribute(positions,3));
 const mat=new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{color:{value:new T.Color(color)},size:{value:size}},vertexShader:'uniform float size; void main(){vec4 mv=modelViewMatrix*vec4(position,1.); gl_PointSize=size; gl_Position=projectionMatrix*mv;}',fragmentShader:'uniform vec3 color; void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,.12,d);gl_FragColor=vec4(color,a*.8);}',blending:T.AdditiveBlending});
 const points=new T.Points(geometry,mat);parent.add(points);return {object:points,positions,seeds};
}
function asteroidBelt(model,snow=false){
 const group=new T.Group();model.orbits.add(group);group.rotation.z=.25;group.rotation.x=.55;
 const geometry=new T.DodecahedronGeometry(.05,0),mat=material(snow?'#e5f3f7':'#d3b25e',{metalness:snow?.08:.42,roughness:.55});
 const rocks=new T.InstancedMesh(geometry,mat,23),dummy=new T.Object3D();
 for(let i=0;i<23;i++){const a=i/23*Math.PI*2,r=1.35+model.random()*.28;dummy.position.set(Math.cos(a)*r,(model.random()-.5)*.09,Math.sin(a)*r);dummy.rotation.set(i*.7,i*1.3,i*.3);dummy.scale.setScalar(.45+model.random()*.9);dummy.updateMatrix();rocks.setMatrixAt(i,dummy.matrix);}
 group.add(rocks);model.animated.push(t=>group.rotation.y=t*.075);rocks.name=snow?'snow-asteroids':'gold-asteroids';
}
function weather(model,type){
 const random=model.random,region=model.region;
 if(type==='wind'){
  for(let j=0;j<3;j++){const group=new T.Group();model.orbits.add(group);group.rotation.set(.2+j*.6,0,.3-j*.4);const path=Array.from({length:45},(_,i)=>{const a=i/44*Math.PI*1.45;return [Math.cos(a)*(1.2+j*.07),Math.sin(a*2)*.05,Math.sin(a)*(1.2+j*.07)];});const ribbon=line(group,path,'#c0f4d1',.008+j*.002);ribbon.material.opacity=.45;model.animated.push(t=>group.rotation.y=t*(.2+j*.05)+j*2);}
 }
 if(type==='snow'||type==='fireflies'){
  const particles=motes(model.orbits,type==='snow'?210:65,type==='snow'?'#e4f9ff':'#e3f5a3',type==='snow'?4:3.5,random);
  model.animated.push(t=>{for(let i=0;i<particles.seeds.length;i++){const [a,b,r,s]=particles.seeds[i],v=normal(a+t*(type==='snow'?.25:.08),Math.sin(b+t*.1)*.8).multiplyScalar(r);particles.positions.set([v.x,v.y+(type==='snow'?((s-t*.17)%1+1)%1-.5:Math.sin(t*1.1+a)*.04),v.z],i*3);}particles.object.geometry.attributes.position.needsUpdate=true;});
 }
 if(type==='rain'||type==='thunder'){
  for(let j=0;j<3;j++){
   const root=anchor(model.surface,-.6+j*2.2,.55-j*.12,1.18);const clouds=cloud(root,1.05,type==='thunder');clouds.position.y=.15;clouds.name='weather-cloud';
   const segments=new Float32Array(36*6),g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(segments,3));const rain=new T.LineSegments(g,new T.LineBasicMaterial({color:type==='rain'?'#8fe0ff':'#bc9bff',transparent:true,opacity:.4}));root.add(rain);
   model.animated.push(t=>{for(let i=0;i<36;i++){const x=(Math.sin(i*32.7)*.5)*.3,z=Math.cos(i*13.4)*.13,y=.1-((t*.55+i*.023)%1)*.26;segments.set([x,y,z,x-.006,y-.045,z],i*6);}g.attributes.position.needsUpdate=true;clouds.position.x=Math.sin(t*.35+j)*.025;});
   if(type==='thunder'){
    const bolt=line(root,[[0,.12,0],[-.035,.03,.01],[.02,.035,0],[-.04,-.13,.015]],'#ead7ff',.012);bolt.name='lightning-bolt';const light=new T.PointLight('#cda0ff',0,1.2);light.position.y=.1;root.add(light);
    model.animated.push(t=>{const phase=(t+j*2.1)%6,flash=phase<.2||phase>.32&&phase<.45||phase>.58&&phase<.7;bolt.visible=flash;light.intensity=flash?2.5:0;});
   }
  }
 }
}
function buildLandmarks(model){
 const {region,palette:p,random}=model;
 const terrainAnchor=(lon,lat)=>{const n=normal(lon,lat);return anchor(model.surface,lon,lat,Math.max(1.006,landField(n.x,n.y,n.z,region).height));};
 if(region==='mondstadt'){
  for(const [lon,lat,h] of [[-.75,.63,.62],[1.6,.1,.42],[3,.5,.5]])mountain(terrainAnchor(lon,lat),h,.2,'#a4b6a1',true);
  for(let i=0;i<28;i++){const lon=i*2.4,lat=Math.sin(i*7)*.6,n=normal(lon,lat);if(landField(n.x,n.y,n.z,region).land)tree(terrainAnchor(lon,lat),.48+random()*.23,'#62a47c');}
  weather(model,'wind');
 }
 if(region==='liyue'){
  for(let i=0;i<12;i++){const root=terrainAnchor(i*2.4,Math.sin(i*4)*.55),height=.28+(i%4)*.13;const pillar=mesh(root,new T.CylinderGeometry(.07,.14,height,6,4),material(i%2?'#a89e7c':'#858e92'));pillar.position.y=height/2;const crown=mesh(root,new T.ConeGeometry(.08,.1,6),material('#dfc46d'));crown.position.y=height+.02;
   for(let j=0;j<3;j++){const crystal=mesh(root,new T.OctahedronGeometry(.035),material('#f2cb6b',{emissive:'#c59224',emissiveIntensity:.2,metalness:.4}));crystal.position.set(Math.sin(j*2)*.11,height*.5+j*.06,Math.cos(j*2)*.1);model.animated.push(t=>crystal.material.emissiveIntensity=.12+Math.pow(Math.max(0,Math.sin(t*.7+i)),14)*1.2);}}
  asteroidBelt(model);
 }
 if(region==='inazuma'){
  for(let i=0;i<9;i++){const root=terrainAnchor(i*2.4,Math.sin(i*5)*.65);mountain(root,.23+(i%3)*.09,.15,'#8570a9');tree(root,.64,'#d7a2c7');}
  weather(model,'thunder');
 }
 if(region==='sumeru'){
  // Huge rainforest crown and a sharply stepped pyramid on opposite biomes.
  for(const lon of [-.65,2.6])tree(terrainAnchor(lon,.66),2.5,'#338c63');
  for(const lon of [.75,3.8]){const root=terrainAnchor(lon,-.1);const pyramid=mesh(root,new T.ConeGeometry(.33,.57,4),material('#d8ac65'));pyramid.position.y=.29;pyramid.rotation.y=Math.PI/4;pyramid.name='desert-pyramid';for(let i=0;i<3;i++){const tier=mesh(root,new T.CylinderGeometry(.27-i*.045,.31-i*.045,.08,4),material(i%2?'#e0bb79':'#bb8e52'));tier.rotation.y=Math.PI/4;tier.position.y=.015+i*.045;}}
  for(let i=0;i<24;i++){const lon=-.4-i*.21,lat=Math.sin(i*2)*.55;tree(terrainAnchor(lon,lat),.5,'#4c9d63');}
  const storm=terrainAnchor(.9,-.25),vortex=new T.Group();storm.add(vortex);vortex.name='sandstorm';const helix=Array.from({length:121},(_,i)=>{const h=i/120,a=h*Math.PI*7,r=.035+h*.08;return [Math.cos(a)*r,.02+h*.36,Math.sin(a)*r];});const spiral=line(vortex,helix,'#ddb978',.007);spiral.material.opacity=.32;
  const grains=new T.InstancedMesh(new T.IcosahedronGeometry(.005,0),material('#e4c58b'),60),dummy=new T.Object3D();vortex.add(grains);model.animated.push(t=>{vortex.rotation.y=t*.7;for(let i=0;i<60;i++){const h=(i/60+t*.23)%1,a=h*Math.PI*7+i*.2,r=.035+h*.09;dummy.position.set(Math.cos(a)*r,.02+h*.36,Math.sin(a)*r);dummy.updateMatrix();grains.setMatrixAt(i,dummy.matrix);}grains.instanceMatrix.needsUpdate=true;});
  weather(model,'fireflies');
 }
 if(region==='fontaine'){
  for(const [lon,lat,h] of [[-.65,.63,.8],[1.8,.25,.6],[3.3,.35,.7]]){const root=terrainAnchor(lon,lat);mountain(root,h,.23,'#a4a5be',true);const waterfall=line(root,[[.09,h*.65,.07],[.12,h*.3,.1],[.2,.02,.14]],'#99dbef',.018);waterfall.name='waterfall';for(let d=0;d<6;d++){const drop=mesh(root,new T.SphereGeometry(.013,6,5),new T.MeshBasicMaterial({color:'#c6f6ff'}));drop.scale.y=2.2;model.animated.push(t=>{const age=(t*.45+d/6)%1;drop.position.set(.09+age*.11,h*.65*(1-age),.07+age*.07);});}model.animated.push(t=>waterfall.material.opacity=.45+Math.sin(t*1.5)*.15);}
  for(let i=0;i<4;i++){const c=cloud(anchor(model.surface,i*1.7,.6,1.2),.65);model.animated.push(t=>c.position.x=Math.sin(t*.2+i)*.05);}
 }
 if(region==='primordial'){
  for(let i=0;i<3;i++){const ring=arc(model.orbits,1.18+i*.2,['#6ac9e1','#a1eeea','#479ecb'][i],.12+i*.13,.63-i*.1);ring.rotation.z=.25-i*.16;ring.name='water-ring';const band=mesh(ring,new T.TorusGeometry(1.18+i*.2,.024,8,120),material(['#64c5dc','#9be5e3','#4a96c6'][i],{transparent:true,opacity:.48,roughness:.25,metalness:.2}));band.rotation.x=Math.PI/2;model.animated.push(t=>{ring.rotation.y=t*(.08+i*.025);ring.scale.setScalar(1+Math.sin(t*.65+i)*.018);});}
  weather(model,'rain');
 }
 if(region==='natlan'){
  for(const lon of [-.65,2.8]){
   const root=terrainAnchor(lon,.62),volcano=mesh(root,new T.CylinderGeometry(.105,.34,.61,14,6,true),material('#874b40'));volcano.position.y=.29;volcano.name='volcano';
   const crater=mesh(root,new T.TorusGeometry(.1,.023,8,28),material('#e57638',{emissive:'#d14b22',emissiveIntensity:.5}));crater.rotation.x=Math.PI/2;crater.position.y=.6;
   const lava=mesh(root,new T.CircleGeometry(.096,28),material('#ffc16a',{emissive:'#ff761e',emissiveIntensity:1.1,side:T.DoubleSide}));lava.rotation.x=-Math.PI/2;lava.position.y=.595;
   for(let i=0;i<5;i++)line(root,[[Math.cos(i*1.4)*.09,.6,Math.sin(i*1.4)*.09],[Math.cos(i*1.4)*.19,.25,Math.sin(i*1.4)*.19],[Math.cos(i*1.4)*.33,.015,Math.sin(i*1.4)*.33]],'#e77836',.013);
   const embers=new T.InstancedMesh(new T.IcosahedronGeometry(.017,0),new T.MeshBasicMaterial({color:'#ffb853'}),35);root.add(embers);const dummy=new T.Object3D();model.animated.push(t=>{for(let i=0;i<35;i++){const age=(t*.32+i/35)%1;dummy.position.set(Math.cos(i*2.4)*age*.26,.6+Math.sin(age*Math.PI)*.5,Math.sin(i*2.4)*age*.26);dummy.scale.setScalar(1-age*.7);dummy.updateMatrix();embers.setMatrixAt(i,dummy.matrix);}embers.instanceMatrix.needsUpdate=true;});
   for(let i=0;i<4;i++){const smoke=cloud(root,.48,true);smoke.name='volcanic-smoke';model.animated.push(t=>{const age=(t*.13+i/4)%1;smoke.position.set(age*.12,.67+age*.4,0);smoke.scale.setScalar(.5+age*.7);smoke.visible=age<.94;});}
  }
  for(let i=0;i<8;i++){const root=terrainAnchor(i*.7,-.35);const mesa=mesh(root,new T.CylinderGeometry(.09,.13,.16+i%3*.055,6),material(i%2?'#bc8251':'#d0a764'));mesa.position.y=.1;tree(root,.55,'#6eaa75');}
 }
 if(region==='nodkrai'){
  for(let i=0;i<23;i++)tree(terrainAnchor(i*2.4,Math.sin(i*7)*.65),1.05,'#638f84',true);
  for(let i=0;i<5;i++)mountain(terrainAnchor(i*1.5,.3),.4,.17,'#a8a4be',true);
  for(let i=0;i<3;i++){const orbit=new T.Group();model.orbits.add(orbit);orbit.rotation.set(.35+i*.7,0,-.45+i*.6);const moon=mesh(orbit,new T.IcosahedronGeometry(.15-i*.018,3),material(['#ddd4f0','#9cced6','#d3accc'][i]));moon.name='orbital-moon';model.animated.push(t=>{const angle=t*[.25,-.17,.12][i]+i*2.1;moon.position.set(Math.cos(angle)*(1.44+i*.09),0,Math.sin(angle)*(1.44+i*.09));moon.rotation.y=t*.3;});}
 }
 if(region==='snezhnaya'){
  for(let i=0;i<15;i++){const root=terrainAnchor(i*2.4,Math.sin(i*7)*.65);const slab=mesh(root,new T.CylinderGeometry(.11,.18,.1,5),material('#d5e7ee',{roughness:.3,metalness:.15}));slab.position.y=.035;if(i%3===0)mountain(root,.38,.18,'#b0c9dc',true);}
  asteroidBelt(model,true);weather(model,'snow');
 }
}
function batchLandmarks(model){
 model.scene.updateMatrixWorld(true);const inverse=model.surface.matrixWorld.clone().invert(),nodes=[];
 model.surface.traverse(object=>{if(object.isMesh&&object.name==='static-landmark')nodes.push(object);});
 if(!nodes.length)return;
 const positions=[],normals=[],colors=[];
 for(const object of nodes){const geometry=object.geometry.index?object.geometry.toNonIndexed():object.geometry.clone();geometry.applyMatrix4(new T.Matrix4().multiplyMatrices(inverse,object.matrixWorld));const p=geometry.attributes.position,n=geometry.attributes.normal,c=object.material.color;
  for(let i=0;i<p.count;i++){positions.push(p.getX(i),p.getY(i),p.getZ(i));normals.push(n.getX(i),n.getY(i),n.getZ(i));const shade=geometry.attributes.color;colors.push(c.r*(shade?shade.getX(i):1),c.g*(shade?shade.getY(i):1),c.b*(shade?shade.getZ(i):1));}geometry.dispose();object.removeFromParent();object.geometry.dispose();object.material.dispose();
 }
 const combined=new T.BufferGeometry();combined.setAttribute('position',new T.Float32BufferAttribute(positions,3));combined.setAttribute('normal',new T.Float32BufferAttribute(normals,3));combined.setAttribute('color',new T.Float32BufferAttribute(colors,3));const mesh= new T.Mesh(combined,material('#ffffff',{vertexColors:true}));mesh.name='batched-landmarks';mesh.castShadow=mesh.receiveShadow=true;model.surface.add(mesh);model.batchedObjects=nodes.length;
}
export function createRegionalModel(region,tint,geography=regionalGeography(region)){
 if(region==='teyvat'&&!REGIONAL_WORLDS.teyvat)REGIONAL_WORLDS.teyvat={...REGIONAL_WORLDS.mondstadt,sea:'#20638c'};
 if(!REGIONAL_WORLDS[region])throw new Error('Unknown regional planet: '+region);
 const model={region,geography,palette:REGIONAL_WORLDS[region],random:rand([...region].reduce((n,c)=>n*31+c.charCodeAt(0)|0,17)),scene:new T.Scene(),surface:new T.Group(),orbits:new T.Group(),animated:[]};
 model.scene.add(model.surface,model.orbits);model.surface.rotation.z=-.13;
 model.scene.add(new T.HemisphereLight('#dceeff','#29364c',1.35));const key=new T.DirectionalLight('#fff0d6',2.5);key.position.set(-3,4,5);key.shadow.mapSize.set(512,512);Object.assign(key.shadow.camera,{left:-2,right:2,top:2,bottom:-2,near:1,far:12});key.shadow.bias=-.0004;key.shadow.normalBias=.018;model.key=key;model.scene.add(key);const rim=new T.DirectionalLight(model.palette.light,1.5);rim.position.set(3,1,-3);model.scene.add(rim);
 terrain(model,tint);if(geography){buildGeographicLandmarks(model);addRegionalWeather(model);if(region==='liyue')asteroidBelt(model);if(region==='snezhnaya')asteroidBelt(model,true);}else if(region==='primordial'){addRegionalWeather(model);}else buildLandmarks(model);batchLandmarks(model);if(region==='teyvat'){addCentralMoons(model);if(typeof window!=='undefined')addRulerSatellites(model);}
 model.camera=new T.OrthographicCamera(-2.35,2.35,2.35,-2.35,.1,20);model.camera.position.set(0,0,6);model.camera.lookAt(0,0,0);
 model.update=(time,angle)=>{model.surface.rotation.y=angle*Math.PI*2;for(const animate of model.animated)animate(time);};
 model.dispose=()=>{model.disposed=true;const geometries=new Set(),materials=new Set();model.scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m));});geometries.forEach(g=>g.dispose());materials.forEach(m=>{m.map?.dispose();m.dispose();});};
 return model;
}
function fallback(world){
 if(world.dataset.engine==='local-fallback')return false;
 world.diorama?.dispose();world.diorama=null;world.canvas.classList.remove('regional-diorama');world.canvas.width=world.canvas.height=world.size;world.ctx=world.canvas.getContext('2d');world.relief=null;world.dataset.engine='local-fallback';return false;
}
export function drawRegionalModel(world,now){
 if(failed)return fallback(world);
 try{
  if(!renderer){renderer=new T.WebGLRenderer({alpha:true,antialias:true,premultipliedAlpha:true,powerPreference:'low-power'});const gl=renderer.getContext(),extension=gl.getExtension("WEBGL_debug_renderer_info");software=!!extension&&/swiftshader|llvmpipe|software/i.test(gl.getParameter(extension.UNMASKED_RENDERER_WEBGL));renderer.setClearColor(0,0);renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;}
  if(!world.geographyRequested){world.geographyRequested=true;loadPlanetGeography().then(data=>{const firstFailure=!data&&!world.geographyFailed;if(!data)world.geographyFailed=true;const available=data&&!world.diorama?.geography&&regionalGeography(world.getAttribute('region'));if(world.isConnected&&(firstFailure||available)){world.painted=false;world.draw(performance.now());}});}
  const map=regionalGeography(world.getAttribute('region'));if(!map&&world.getAttribute('region')!=='primordial'&&!world.geographyFailed)return true;if(world.diorama&&!world.diorama.geography&&map){world.diorama.dispose();world.diorama=null;}
  if(!world.diorama){world.diorama=createRegionalModel(world.getAttribute('region'),world.getAttribute('color-shift'));world.diorama.rulerColors=Object.fromEntries(['death','time','life'].map(name=>[name,world.getAttribute(name+'-color')]));world.canvas.classList.add('regional-diorama');world.relief?.remove();world.dataset.engine='webgl-diorama';world.dataset.geography=world.diorama.geography?.coverage||'procedural';world.canvas.width=world.canvas.height=world.hasAttribute('detail')?(software?640:1024):world.getAttribute('region')==='teyvat'?(software?320:640):(software?192:320);world.ctx=world.canvas.getContext('2d');world.diorama.onReady=()=>{if(world.isConnected){world.painted=false;world.draw(performance.now());}};}
  const paused=world.closest('.dashboard-studio')?.dataset.cosmosMotion==='off'||matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(world.gpuLast&&now-world.gpuLast<(world.hasAttribute('detail')?(software?90:32):(software?90:58))&&!paused)return true;
  const bucket=Math.floor(now/16);if(bucket!==frameBucket){frameBucket=bucket;frameDraws=0;}pendingWorlds.add(world);for(const candidate of pendingWorlds)if(!candidate.isConnected)pendingWorlds.delete(candidate);if(!paused&&software){const candidates=[...pendingWorlds].filter(w=>w.diorama&&w.visible&&w.getClientRects().length&&(!w.painted||w.closest('.dashboard-studio')?.dataset.cosmosMotion!=='off')).sort((a,b)=>(a.gpuLast||0)-(b.gpuLast||0));if(candidates[0]!==world||frameDraws>=2)return true;}else if(!paused&&!world.hasAttribute('detail')&&frameDraws>=4)return true;frameDraws++;
  world.gpuLast=now;world.effectTime=(world.effectTime||0)+(paused?0:(world.effectLast?Math.min(100,now-world.effectLast)/1000:0));world.effectLast=now;
  world.diorama.update(world.effectTime,world.angle);world.diorama.orbits.visible=world.getAttribute('satellites')!=='off';if(world.getAttribute('region')==='teyvat')for(const child of world.diorama.orbits.children){if(child.userData.satellite==='moon'){child.visible=world.getAttribute('moons')!=='off';const tint=world.getAttribute(['life-color','time-color','death-color'][child.userData.moonIndex]);if(/^#[a-f0-9]{6}$/i.test(tint||'')&&child.userData.appliedTint!==tint){child.children[0].material.color.set(tint);child.userData.appliedTint=tint;}}if(child.userData.satellite==='ruler')child.visible=world.getAttribute('rulers')==='on';}if(world.diorama.textureReady)world.dataset.mapReady='true';
  const size=world.canvas.width;if(renderer.domElement.width!==size)renderer.setSize(size,size,false);
  renderer.shadowMap.enabled=world.hasAttribute('detail');world.diorama.key.castShadow=world.hasAttribute('detail');renderer.render(world.diorama.scene,world.diorama.camera);world.ctx.clearRect(0,0,size,size);world.ctx.drawImage(renderer.domElement,0,0,size,size);return true;
 }catch(error){failed=true;console.warn('Regional 3D planets unavailable; using the local fallback.',error);return fallback(world);}
}
