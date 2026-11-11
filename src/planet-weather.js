import * as T from '../assets/vendor/three/three.module.js';
import {mapPoint,mapHeight} from './planet-geography.js';

const UP=new T.Vector3(0,1,0);
const axis=(lon,lat)=>new T.Vector3(Math.sin(lon)*Math.cos(lat),Math.sin(lat),Math.cos(lon)*Math.cos(lat));
function localRoot(model,lon,lat,radius=1.15){
 const root=new T.Group(),n=axis(lon,lat);root.position.copy(n).multiplyScalar(radius);
 root.quaternion.setFromUnitVectors(UP,n);model.surface.add(root);return root;
}
function tube(parent,points,color,width=.02,opacity=1){
 const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));
 const object=new T.Mesh(new T.TubeGeometry(curve,32,width,5,false),
  new T.MeshBasicMaterial({color,transparent:true,opacity,depthWrite:false,blending:T.AdditiveBlending}));
 parent.add(object);return object;
}
function cloud(parent,dark=false,scale=1){
 const group=new T.Group();parent.add(group);
 const material=new T.MeshStandardMaterial({color:dark?'#737691':'#dbe9ef',roughness:1});
 const puffs=new T.InstancedMesh(new T.SphereGeometry(1,12,8),material,7),dummy=new T.Object3D();
 for(let i=0;i<7;i++){
  const radius=.10+(i%3)*.018;
  dummy.position.set((i-3)*.067,Math.sin(i*2)*.035,Math.cos(i*1.6)*.05);
  dummy.scale.set(radius,radius*.64,radius);dummy.updateMatrix();puffs.setMatrixAt(i,dummy.matrix);
 }
 group.add(puffs);
 group.scale.setScalar(scale);group.name='weather-cloud';return group;
}

export function windGusts(model,color='#d1ffed',count=110,speed=.48,name='wind-gusts'){
 const segments=7,positions=new Float32Array(count*segments*18),colors=new Float32Array(positions.length);
 const geometry=new T.BufferGeometry();
 const seeds=Array.from({length:count},()=>[model.random()*6.28,(model.random()-.5)*1.85,1.04+model.random()*.68,.4+model.random()]);
 for(let i=0;i<count;i++)for(let s=0;s<segments;s++){
  const strength=Math.sin((s+.5)/segments*Math.PI);
  for(let vertex=0;vertex<6;vertex++)colors.set([strength,strength,strength],(i*segments+s)*18+vertex*3);
 }
 geometry.setAttribute('position',new T.BufferAttribute(positions,3));geometry.setAttribute('color',new T.BufferAttribute(colors,3));
 const object=new T.Mesh(geometry,new T.MeshBasicMaterial({color,vertexColors:true,transparent:true,opacity:.96,
  side:T.DoubleSide,depthWrite:false,blending:T.AdditiveBlending}));
 object.name=name;model.orbits.add(object);
 model.animated.push(time=>{
  let at=0;
  for(const [phase,latitude,radius,pace] of seeds)for(let s=0;s<segments;s++){
   const points=[];
   for(const f of [s/segments,(s+1)/segments]){
    const a=phase+time*speed*pace-f*.62,lat=latitude+Math.sin(a*2+phase)*.045;
    const p=axis(a,lat).multiplyScalar(radius+Math.sin(time*.25+phase)*.025);
    points.push(p);
   }
   const width=.022+Math.sin((s+.5)/segments*Math.PI)*.012;
   for(const [point,sign] of [[points[0],-1],[points[0],1],[points[1],1],[points[0],-1],[points[1],1],[points[1],-1]]){
    positions.set([point.x,point.y+sign*width,point.z],at);at+=3;
   }
  }
  geometry.attributes.position.needsUpdate=true;
 });
 return object;
}

function precipitation(model,type){
 const thunder=type==='thunder',snow=type==='snow';
 if(snow){
  const count=1100,positions=new Float32Array(count*3),seeds=Array.from({length:count},()=>[model.random(),model.random(),model.random()]);
  const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(positions,3));
  const shader=new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{tint:{value:new T.Color('#ebf9ff')}},
   vertexShader:'varying float fade;void main(){vec4 p=modelViewMatrix*vec4(position,1.);fade=.9;gl_PointSize=5.+3.*sin(position.x*13.);gl_Position=projectionMatrix*p;}',
   fragmentShader:'uniform vec3 tint;varying float fade;void main(){float d=length(gl_PointCoord-.5);float alpha=1.-smoothstep(.14,.5,d);float core=1.-smoothstep(0.,.2,d);gl_FragColor=vec4(mix(tint,vec3(1.),core*.55),alpha*fade);}'});
  const flakes=new T.Points(g,shader);flakes.name='snow-blizzard';model.orbits.add(flakes);
  model.animated.push(t=>{
   for(let i=0;i<count;i++){
    const [a,b,c]=seeds[i],latitude=(((b-t*.20)%1+1)%1-.5)*Math.PI;
    const n=axis(a*Math.PI*2+t*1.25,latitude).multiplyScalar(1.12+c*.68);
    positions.set([n.x,n.y,n.z],i*3);
   }
   g.attributes.position.needsUpdate=true;
  });
  windGusts(model,'#c7e7ff',38,.65,'blizzard-gusts');
  for(let i=0;i<3;i++)cloud(localRoot(model,i*2.1,.65,1.28),true,1.1);
  return;
 }
 for(let j=0;j<(thunder?12:8);j++){
  const root=localRoot(model,thunder?-.6+j*2.399:j*2.399,thunder?Math.sin(j*2.4)*.68:.65-(j%3)*.55,thunder?1.18:1.13);
  const clouds=cloud(root,thunder,thunder?1.55:2.05);clouds.position.y=thunder?.15:.32;
  const drops=thunder?64:82,segments=new Float32Array(drops*6),g=new T.BufferGeometry();
  g.setAttribute('position',new T.BufferAttribute(segments,3));
  const rain=new T.LineSegments(g,new T.LineBasicMaterial({color:thunder?'#c3c8ff':'#acdcff',transparent:true,opacity:.60,depthWrite:false}));
  rain.name='rain-shower';root.add(rain);
  model.animated.push(t=>{
   for(let i=0;i<drops;i++){
    const x=Math.sin(i*32.71)*.25,z=Math.cos(i*17.73)*.19;
    const y=.33-((t*(thunder?1.3:1.05)+i*.034)%1)*.60;
    segments.set([x,y,z,x-.075,y-.16,z+.012],i*6);
   }
   g.attributes.position.needsUpdate=true;
   clouds.position.x=Math.sin(t*.3+j)*.045;
  });
  if(thunder){
   const points=[[0,.12,0],[-.035,.03,.01],[.02,.035,0],[-.04,-.13,.015]];
   const bolt=tube(root,points,'#ead7ff',.026);bolt.name='lightning-bolt';bolt.scale.set(2.35,1.8,2.35);
   const light=new T.PointLight('#cda0ff',0,1.8);light.position.y=.1;root.add(light);
   model.animated.push(t=>{
    const phase=(t+j*.67)%6,flash=phase<.2||phase>.32&&phase<.45||phase>.58&&phase<.7;
    bolt.visible=flash;light.intensity=flash?4.5:0;
   });
  }
 }

}

function sandstorm(model){
 const site=model.geography?.sites.find(site=>site.kind==='desert-vortex');
 const point=site?mapPoint(model.geography,site.u,site.v):{lon:.8,lat:-.25};
 const root=localRoot(model,point.lon,point.lat,site?mapHeight(model.geography,site.u,site.v):1.05);
 root.name='sandstorm-traveler';
 const material=new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,
  uniforms:{time:{value:0}},vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'varying vec2 v;uniform float time;void main(){float bands=.5+.5*sin(v.y*70.+v.x*18.-time*4.);float a=(.12+bands*.35)*sin(v.y*3.14159);gl_FragColor=vec4(.84,.65,.36,a);}'});
 const funnel=new T.Mesh(new T.CylinderGeometry(.25,.035,.74,36,16,true),material);
 funnel.position.y=.36;root.add(funnel);
 const positions=new Float32Array(180*3),g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(positions,3));
 const grains=new T.Points(g,new T.PointsMaterial({color:'#f1d09a',size:.013,transparent:true,opacity:.95,depthWrite:false}));root.add(grains);
 model.animated.push(t=>{
  if(site){const u=Math.max(.03,Math.min(.97,site.u+Math.sin(t*.12)*.075)),v=Math.max(.03,Math.min(.97,site.v+Math.sin(t*.085+1)*.035)),moved=mapPoint(model.geography,u,v),n=axis(moved.lon,moved.lat);root.position.copy(n).multiplyScalar(Math.max(1.005,mapHeight(model.geography,u,v)));root.quaternion.setFromUnitVectors(UP,n);}
  else{const lon=point.lon+Math.sin(t*.16)*.42,lat=point.lat+Math.sin(t*.11+1.1)*.14,n=axis(lon,lat);root.position.copy(n).multiplyScalar(1.05);root.quaternion.setFromUnitVectors(UP,n);}
  material.uniforms.time.value=t;funnel.rotation.y=t*.8;
  for(let i=0;i<180;i++){
   const h=(i/180+t*.19)%1,a=h*16+i*2.3+t*2,r=.035+h*.26;
   positions.set([Math.cos(a)*r,.02+h*.75,Math.sin(a)*r],i*3);
  }
  g.attributes.position.needsUpdate=true;
 });
}
function tidalWaves(model){
 windGusts(model,'#84f3f0',65,.45,'ocean-currents');
 for(let wave=0;wave<4;wave++){
  const geometry=new T.PlaneGeometry(1,1,72,12),p=geometry.attributes.position,colors=new Float32Array(p.count*3);
  const material=new T.MeshStandardMaterial({color:'#ffffff',vertexColors:true,side:T.DoubleSide,roughness:.22,metalness:.12,transparent:true,opacity:.92});
  const object=new T.Mesh(geometry,material);object.name='tidal-wave';model.orbits.add(object);
  const sea=new T.Color('#279baf'),foam=new T.Color('#e5fffa');
  for(let i=0;i<p.count;i++){
   const v=Math.floor(i/73)/12,color=sea.clone().lerp(foam,Math.pow(Math.sin(v*Math.PI),8));
   colors.set([color.r,color.g,color.b],i*3);
  }
  geometry.setAttribute('color',new T.BufferAttribute(colors,3));
  model.animated.push(t=>{
   for(let row=0;row<=12;row++)for(let col=0;col<=72;col++){
    const u=col/72,v=row/12,lon=(u-.5)*2.0+wave*2.1+t*(.22+wave*.035);
    const lat=(wave-1)*.32+(v-.5)*.33+Math.sin(u*6+t*.3)*.075;
    const rise=Math.pow(Math.sin(v*Math.PI),3)*(.32+Math.sin(u*Math.PI)*.20);
    const n=axis(lon+rise*.32,lat).multiplyScalar(1.015+rise);
    p.setXYZ(row*73+col,n.x,n.y,n.z);
   }
   p.needsUpdate=true;geometry.computeVertexNormals();
  });
 }
 precipitation(model,'rain');
}

export function addRegionalWeather(model){
 const region=model.region;
 if(region==='mondstadt')windGusts(model);
 if(region==='inazuma')precipitation(model,'thunder');
 if(region==='fontaine')precipitation(model,'rain');
 if(region==='primordial')tidalWaves(model);
 if(region==='snezhnaya')precipitation(model,'snow');
 if(region==='nodkrai'){
  windGusts(model,'#d6f4ed',110,.62,'northern-wind');
 }
 if(region==='sumeru')sandstorm(model);
 if(region==='natlan'){
  const volcano=model.surface.getObjectByName('volcano');
  if(volcano){
   const g=new T.BufferGeometry(),p=new Float32Array(320*3);g.setAttribute('position',new T.BufferAttribute(p,3));
   const sparks=new T.Points(g,new T.PointsMaterial({color:'#ffbe5a',size:.026,transparent:true,opacity:.98,depthWrite:false}));sparks.name='volcanic-ejecta';volcano.add(sparks);
   const glow=new T.PointLight('#ff641e',2.5,2.1);glow.position.y=.5;volcano.add(glow);
   for(let i=0;i<12;i++){
    const smoke=cloud(volcano,true,1);smoke.name='volcanic-smoke';
    const mat=smoke.children[0].material;mat.transparent=true;mat.depthWrite=false;mat.roughness=1;
    model.animated.push(t=>{
     const age=(t*.125+i/12)%1;
     smoke.position.set(Math.sin(age*3.5)*.12+age*.27,.45+age*1.25,Math.cos(age*5+i)*.045);
     smoke.scale.setScalar(.38+age*1.28);smoke.rotation.y=age*2+i;
     mat.color.set(age<.22?'#794e42':'#555462');mat.opacity=Math.min(.94,(1-age)*1.5);
    });
   }
   const lava=tube(volcano,[[0,.45,0],[.025,.68,.005],[-.01,.92,.02],[.01,1.12,.01]],'#ff9b31',.045,.9);lava.name='eruption-column';
   const ashGeometry=new T.BufferGeometry(),ashPositions=new Float32Array(600*3);ashGeometry.setAttribute('position',new T.BufferAttribute(ashPositions,3));
   const ash=new T.Points(ashGeometry,new T.PointsMaterial({color:'#a59a91',size:.012,transparent:true,opacity:.7,depthWrite:false}));ash.name='volcanic-ash';volcano.add(ash);
   model.animated.push(t=>{
    const burst=.65+.35*Math.pow(Math.max(0,Math.sin(t*1.4)),4);
    glow.intensity=2+burst*3;lava.scale.y=.65+burst*.5;lava.material.opacity=.65+burst*.3;
    for(let i=0;i<320;i++){
     const age=(t*(.23+(i%7)*.018)+i/320)%1,a=i*2.399;
     p.set([Math.cos(a)*age*(.32+i%5*.045),.47+Math.sin(age*Math.PI)*( .65+burst*.55),Math.sin(a)*age*(.32+i%5*.045)],i*3);
    }
    for(let i=0;i<600;i++){
     const age=(t*.13+i/600)%1,a=i*2.399,r=age*.6;
     ashPositions.set([Math.cos(a)*r+age*.3,.5+age*1.4,Math.sin(a)*r],i*3);
    }
    g.attributes.position.needsUpdate=true;ashGeometry.attributes.position.needsUpdate=true;
   });
  }
 }
 if(region==='nodkrai')for(let i=0;i<3;i++){
  const plane=new T.Group();plane.rotation.set(.4+i*.65,0,-.4+i*.55);model.orbits.add(plane);
  const moon=new T.Mesh(new T.IcosahedronGeometry(.12-i*.013,3),new T.MeshStandardMaterial({color:['#ded4ef','#a5d8d8','#d5aecd'][i],roughness:.9}));moon.name='orbital-moon';plane.add(moon);
  model.animated.push(t=>{const a=t*[.25,-.19,.14][i]+i*2.1;moon.position.set(Math.cos(a)*(1.5+i*.1),0,Math.sin(a)*(1.5+i*.1));moon.rotation.y=t*.3;});
 }
}
