import * as T from '../assets/vendor/three/three.module.js';
import {mapPoint,mapHeight} from './planet-geography.js';

const UP=new T.Vector3(0,1,0);
function part(parent,geometry,color,x=0,y=0,z=0) {
 const object=new T.Mesh(geometry,new T.MeshStandardMaterial({color,roughness:.82,metalness:.08}));
 object.name='static-landmark';object.position.set(x,y,z);parent.add(object);return object;
}
const box=(parent,w,h,d,color,x=0,y=0,z=0)=>part(parent,new T.BoxGeometry(w,h,d),color,x,y+h/2,z);
function spire(parent,x,z,height,color='#c4d3df',roof='#456786') {
 part(parent,new T.CylinderGeometry(.012,.018,height,7),color,x,height/2,z);
 part(parent,new T.ConeGeometry(.023,height*.5,7),roof,x,height*1.2,z);
}
function house(parent,x,z,size,wall,roof) {
 box(parent,size,size*.8,size*.72,wall,x,0,z);
 const top=part(parent,new T.ConeGeometry(size*.86,size*.55,4),roof,x,size,z);
 top.rotation.y=Math.PI/4;
}
function district(parent,style,scale=1) {
 const colors={
  wind:['#e2d1ab','#a2523d'],harbor:['#dbc894','#a36337'],japan:['#e4d8c2','#4e5579'],
  fontaine:['#deded6','#4b758f'],north:['#b2c3c9','#657f83'],ice:['#d4e7ea','#476c7e']
 }[style]||['#d4c49b','#8d7550'];
 for(let row=0;row<4;row++)for(let col=0;col<5;col++){
  if(col===2)continue;
  const x=(col-2)*.036*scale,z=(row-1.5)*.035*scale;
  house(parent,x,z,(.018+(row+col)%3*.003)*scale,...colors);
 }
}
function wall(parent,radius,height,color,segments=28) {
 const ring=part(parent,new T.CylinderGeometry(radius,radius,height,segments,1,true),color,0,height/2,0);
 ring.material.side=T.DoubleSide;
 for(let i=0;i<10;i++){
  const a=i/10*Math.PI*2;
  spire(parent,Math.cos(a)*radius,Math.sin(a)*radius,height*1.8,color,'#637a8b');
 }
}
function peak(parent,height,color,snow=false) {
 const sides=20,rings=12,positions=[],colors=[],indices=[];
 const stone=new T.Color(color),base=stone.clone().multiplyScalar(.72),summit=stone.clone().lerp(new T.Color('#d4c8b2'),.25),white=new T.Color('#e6f1f0');
 for(let row=0;row<=rings;row++)for(let col=0;col<=sides;col++){
  const y=row/rings,a=col/sides*Math.PI*2;
  const ridge=1+.15*Math.sin(a*5+y*4)+.10*Math.cos(a*3-y*8);
  const r=height*.53*Math.pow(1-y,.90)*ridge;
  const bendX=Math.sin(y*3)*height*.09,bendZ=Math.sin(y*4)*height*.05;
  positions.push(Math.cos(a)*r+bendX,height*y*(1+.035*Math.sin(a*3)*Math.sin(y*Math.PI)),Math.sin(a)*r+bendZ);
  const c=base.clone().lerp(summit,.2+y*.7).multiplyScalar(.92+.08*Math.sin(a*5+y*7));
  if(snow){const snowline=.66+.07*Math.sin(a*5)+.035*Math.cos(a*9);c.lerp(white,Math.max(0,Math.min(1,(y-snowline)*13)));}
  colors.push(c.r,c.g,c.b);
  if(row<rings&&col<sides){const i=row*(sides+1)+col,j=i+sides+1;indices.push(i,j,i+1,i+1,j,j+1);}
 }
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));geometry.setIndex(indices);geometry.computeVertexNormals();
 const object=new T.Mesh(geometry,new T.MeshStandardMaterial({color:'#ffffff',vertexColors:true,roughness:.95,metalness:0}));object.name='static-landmark';parent.add(object);
}
function foliage(parent,radius,color,x,y,z,cherry=false){
 const geometry=new T.SphereGeometry(radius,14,10),p=geometry.attributes.position,colors=[];
 const dark=new T.Color(color).multiplyScalar(.68),light=new T.Color(color).lerp(new T.Color(cherry?'#ffe0ed':'#d1df8e'),.28);
 for(let i=0;i<p.count;i++){
  const a=p.getX(i)/radius,b=p.getY(i)/radius,c=p.getZ(i)/radius;
  const lobe=1+.10*Math.sin(a*7+c*3)*Math.cos(b*6)+.05*Math.cos(c*9-a*4);
  p.setXYZ(i,p.getX(i)*lobe,p.getY(i)*lobe,p.getZ(i)*lobe);
  const shade=dark.clone().lerp(light,Math.max(0,Math.min(1,.42+b*.36+a*.12)));colors.push(shade.r,shade.g,shade.b);
 }
 geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));geometry.computeVertexNormals();
 const leaf=new T.Mesh(geometry,new T.MeshStandardMaterial({color:'#ffffff',vertexColors:true,roughness:.9}));leaf.name='static-landmark';leaf.position.set(x,y,z);parent.add(leaf);return leaf;
}

function treeCity(parent,height) {
 const trunk=part(parent,new T.CylinderGeometry(.015,.04,height*.8,9),'#816b49',0,height*.4);
 trunk.rotation.z=-.12;
 for(let i=0;i<6;i++){
  const a=i*2.4,crown=foliage(parent,height*.35,i%2?'#549b60':'#72ad60',Math.sin(a)*height*.21,height*.75,Math.cos(a)*height*.2);
  crown.scale.y=.55;
 }
 for(let i=0;i<9;i++){
  const a=i/9*Math.PI*2;
  house(parent,Math.sin(a)*.08,Math.cos(a)*.08,.028,'#c3b17b','#8c9f58');
 }
}
function regionalTree(parent,size=1,cherry=false){
 const h=.14*size,bark=cherry?'#735569':'#756044';
 const trunk=part(parent,new T.TubeGeometry(new T.CatmullRomCurve3([new T.Vector3(0,0,0),new T.Vector3(-.005*size,h*.35,0),new T.Vector3(.008*size,h*.74,.003*size)]),10,.009*size,7,false),bark);
 for(let i=0;i<6;i++){
  const a=i*2.399,reach=(i===0?.012:.034)*size;
  const x=Math.sin(a)*reach,z=Math.cos(a)*reach,top=h*(.78+Math.cos(a)*.12);
  if(i>0)part(parent,new T.TubeGeometry(new T.CatmullRomCurve3([new T.Vector3(0,h*.40,0),new T.Vector3(x*.5,h*.63,z*.5),new T.Vector3(x,top,z)]),6,.0035*size,5,false),bark);
  const crown=foliage(parent,(i===0?.045:.035)*size,cherry?(i%2?'#df9fc5':'#efbad6'):(i%2?'#38814d':'#6ea85a'),x,top,z,cherry);crown.scale.set(1.08,cherry?.55:.78,1);
 }
}

function sakura(parent,model){
 const root=new T.Group();root.name='sakura-tree';root.position.set(.04,.01,.025);parent.add(root);regionalTree(root,1.5,true);
 const petals=new T.InstancedMesh(new T.SphereGeometry(.005,5,4),new T.MeshStandardMaterial({color:'#f1b9d6',roughness:.85}),26),dummy=new T.Object3D();petals.name='sakura-petals';root.add(petals);
 model.animated.push(t=>{for(let i=0;i<26;i++){const age=(t*.17+i/26)%1,a=i*2.399;dummy.position.set(Math.sin(a)*.055+age*.08,.18-age*.18,Math.cos(a)*.055+Math.sin(age*6+i)*.02);dummy.rotation.set(age*4,i,age*6);dummy.scale.set(1,.3,.6);dummy.updateMatrix();petals.setMatrixAt(i,dummy.matrix);}petals.instanceMatrix.needsUpdate=true;});
}
function fatuiBase(parent,height) {
 wall(parent,.12,.035,'#abb8c3',36);
 part(parent,new T.CylinderGeometry(.095,.11,.027,24),'#49596b',0,.018);
 part(parent,new T.CylinderGeometry(.044,.065,height*.36,12),'#8b9da9',0,height*.18);
 part(parent,new T.SphereGeometry(.046,16,10,0,Math.PI*2,0,Math.PI/2),'#8798ad',0,height*.36);
 for(let i=0;i<8;i++){
  const a=i/8*Math.PI*2,x=Math.cos(a)*.092,z=Math.sin(a)*.092;
  box(parent,.034,.065+(i%2)*.04,.03,'#657789',x,0,z);
  if(i%2===0)spire(parent,x,z,height*.72,'#c4cad3','#7a7fa5');
 }
 const gate=box(parent,.055,.045,.028,'#a1b1c2',0,0,.116);
 gate.name='fatui-gate';
 const beacon=part(parent,new T.OctahedronGeometry(.022),'#bb9edb',0,height*.7);
 beacon.name='kuuvahki-beacon';
 parent.userData.name='Bureau de conception expérimentale de kuuvahki';
}
function createLandmark(parent,site,model) {
 const h=site.height;
 switch(site.kind){
  case 'snow-peak': peak(parent,h,'#7f9baf',true);break;
  case 'stone-peak':peak(parent,h,'#a59b78');break;
  case 'thunder-peak':peak(parent,h,'#7d6592');break;
  case 'canyon':
   for(let i=0;i<5;i++)part(parent,new T.CylinderGeometry(.024,.04,h*(.5+i*.09),5),'#b67b51',(i-2)*.04,h*.3,Math.sin(i*2)*.02);
   break;
  case 'wind-city':{
   district(parent,'wind');wall(parent,.105,.025,'#b3b6ac');
   box(parent,.055,.055,.075,'#c3c5b8',0,0,-.04);
   spire(parent,-.026,-.055,.11);spire(parent,.026,-.055,.11);
   for(const x of [-.07,.065]){
    spire(parent,x,.01,.065,'#b6ab8a','#82513f');
    const blades=new T.Group();blades.position.set(x,.065,.026);parent.add(blades);
    for(let i=0;i<4;i++){
     const blade=box(blades,.005,.041,.004,'#e4dbba');
     blade.name='windmill-blade';blade.rotation.z=i*Math.PI/2;
    }
    model.animated.push(t=>blades.rotation.z=t*.3);
   }break;
  }
  case 'harbor':
   district(parent,'harbor');
   for(let i=0;i<4;i++)box(parent,.012,.006,.10,'#8e7755',(i-1.5)*.04,0,.105);
   break;
  case 'japan-city':
   district(parent,'japan');
   for(let i=0;i<4;i++){
    const w=.07-i*.012;
    box(parent,w,.023,w*.82,'#e5d8c5',0,i*.028,-.03);
    const roof=part(parent,new T.ConeGeometry(w*.84,.024,4),'#56516e',0,.026+i*.028,-.03);roof.rotation.y=Math.PI/4;
   }break;
  case 'shrine':
  case 'moon-shrine':
   part(parent,new T.CylinderGeometry(.075,.085,.012,16),'#a6a3b6',0,.006);
   spire(parent,0,0,h,'#d5d6dc',site.kind==='moon-shrine'?'#a6b1de':'#8e689c');
   if(site.kind==='shrine')sakura(parent,model);
   break;
  case 'coral-palace':
   for(let i=0;i<5;i++){const a=i*1.256;spire(parent,Math.sin(a)*.06,Math.cos(a)*.06,h*(.55+i%2*.2),'#e0c0dd','#a389c0');}
   part(parent,new T.SphereGeometry(.047,12,10,0,Math.PI*2,0,Math.PI/2),'#e4c7dd',0,h*.5);
   break;
  case 'fatui-base':fatuiBase(parent,h);break;
  case 'tree-city':treeCity(parent,h);break;
  case 'pyramid':{
   const pyramid=part(parent,new T.ConeGeometry(h*.7,h,4),'#d9b573',0,h/2);
   pyramid.rotation.y=Math.PI/4;parent.name='desert-pyramid';
   for(let i=0;i<3;i++)box(parent,h*(1.2-i*.2),.012,h*(1.2-i*.2),'#b98e55',0,i*.014);
   break;
  }
  case 'fontaine-city':
   district(parent,'fontaine');
   box(parent,.065,.12,.05,'#e0dfd1',0,0,0);
   for(const x of [-.04,.04])spire(parent,x,0,h,'#cbd3d4','#6594ae');
   spire(parent,0,-.03,h*1.2,'#dadbcd','#c9b681');
   break;
  case 'opera':
   part(parent,new T.CylinderGeometry(.07,.08,.025,18),'#d6e0d9',0,.012);
   part(parent,new T.SphereGeometry(.06,20,10,0,Math.PI*2,0,Math.PI/2),'#88b2c1',0,.04);
   for(let i=0;i<8;i++){const a=i*Math.PI/4;spire(parent,Math.cos(a)*.075,Math.sin(a)*.075,.055);}
   break;
  case 'water-tower':spire(parent,0,0,h,'#a5c0c9','#6a9da9');break;
  case 'stadium':
   part(parent,new T.CylinderGeometry(.11,.125,.055,22,1,true),'#bf9f6b',0,.027).material.side=T.DoubleSide;
   for(let i=0;i<7;i++){const a=i/7*Math.PI*2;spire(parent,Math.cos(a)*.115,Math.sin(a)*.115,.07,'#c59a64','#975e4e');}
   break;
  case 'volcano':
   part(parent,new T.CylinderGeometry(.045,.15,h*.8,16,6,true),'#815346',0,h*.4).material.side=T.DoubleSide;
   part(parent,new T.TorusGeometry(.045,.009,6,24),'#f3a15b',0,h*.8).rotation.x=Math.PI/2;
   parent.name='volcano';break;
  case 'ice-city':district(parent,'ice');wall(parent,.10,.035,'#d2e0df');spire(parent,0,0,h,'#d4e3e2','#aabbba');break;
  case 'northern-town':district(parent,'north');spire(parent,0,-.04,h,'#adb9c3','#7e8b9c');break;
  case 'lighthouse':spire(parent,0,0,h,'#d2d8cf','#768c99');break;
  case 'chasm':
   part(parent,new T.TorusGeometry(.08,.022,6,20),'#87745b',0,.01).rotation.x=Math.PI/2;
   break;
  case 'desert-vortex':peak(parent,h*.5,'#bb9863');break;
  case 'jade-chamber':{
   const palace=new T.Group();palace.position.y=.22;parent.add(palace);
   part(palace,new T.CylinderGeometry(.065,.035,.025,8),'#b5a875');
   house(palace,0,0,.055,'#cdd0af','#b49b58');break;
  }
  case 'forge':district(parent,'japan',.8);spire(parent,0,0,h,'#7b858c','#7e6b87');break;
  case 'ruined-tower':part(parent,new T.CylinderGeometry(.02,.035,h,9,2,true),'#b9b9a9',0,h/2).material.side=T.DoubleSide;break;
  default:district(parent,site.region==='inazuma'?'japan':'harbor',.7);
 }
}

export function buildGeographicLandmarks(model) {
 for(const site of model.geography.sites) {
  const {lon,lat}=mapPoint(model.geography,site.u,site.v);
  const axis=new T.Vector3(Math.sin(lon)*Math.cos(lat),Math.sin(lat),Math.cos(lon)*Math.cos(lat));
  const root=new T.Group();
  root.position.copy(axis).multiplyScalar(Math.max(1.008,mapHeight(model.geography,site.u,site.v)));
  root.quaternion.setFromUnitVectors(UP,axis);
  root.scale.setScalar((site.scale||1)*(/city|harbor|palace|stadium|fatui-base/.test(site.kind)?1.28:1));root.name=site.kind;root.userData.name=site.name;
  model.surface.add(root);createLandmark(root,site,model);
 }
 // Secondary ridges follow the identified massifs, rather than random continents.
 let reliefCount=0;
 const ranges=model.geography.sites.filter(site=>/peak|canyon/.test(site.kind));
 for(const site of ranges)for(let i=0,count=model.region==='liyue'?9:5;i<count;i++){
  const u=site.u+(i-(count-1)/2)*.016,v=site.v+Math.sin(i*1.6)*.018;
  if(mapHeight(model.geography,u,v)<1.005)continue;
  const {lon,lat}=mapPoint(model.geography,u,v),axis=new T.Vector3(Math.sin(lon)*Math.cos(lat),Math.sin(lat),Math.cos(lon)*Math.cos(lat));
  const root=new T.Group();root.name='secondary-mountain';root.position.copy(axis).multiplyScalar(mapHeight(model.geography,u,v));root.quaternion.setFromUnitVectors(UP,axis);root.scale.setScalar(site.scale||1);model.surface.add(root);
  peak(root,Math.max(.035,site.height*(.20+(i%3)*.12)),model.palette.rock,/snow/.test(site.kind));reliefCount++;
 }
 const hills={liyue:[[.28,.31],[.33,.38],[.40,.37],[.46,.29],[.42,.49],[.29,.49]],sumeru:[[.80,.40],[.85,.47],[.72,.62]],fontaine:[[.26,.30],[.32,.25],[.77,.50],[.79,.54]],nodkrai:[[.46,.22],[.54,.26],[.38,.78]]}[model.region]||[];
 for(const [i,[u,v]] of hills.entries()){
  if(mapHeight(model.geography,u,v)<1.005)continue;
  const {lon,lat}=mapPoint(model.geography,u,v),axis=new T.Vector3(Math.sin(lon)*Math.cos(lat),Math.sin(lat),Math.cos(lon)*Math.cos(lat));
  const root=new T.Group();root.name='secondary-mountain';root.position.copy(axis).multiplyScalar(mapHeight(model.geography,u,v));root.quaternion.setFromUnitVectors(UP,axis);model.surface.add(root);
  peak(root,.065+(i%3)*.035,model.palette.rock,false);reliefCount++;
 }
 if(model.region==='sumeru'){
  const grove=new T.Group();grove.name='tropical-grove';model.surface.add(grove);
  for(const [cx,cy] of [[.81,.40],[.78,.54],[.73,.57],[.86,.46]])for(let i=0;i<9;i++){
   const u=cx+Math.sin(i*2.4)*.021,v=cy+Math.cos(i*2.4)*.021;
   if(mapHeight(model.geography,u,v)<1.005)continue;
   const {lon,lat}=mapPoint(model.geography,u,v),axis=new T.Vector3(Math.sin(lon)*Math.cos(lat),Math.sin(lat),Math.cos(lon)*Math.cos(lat)),root=new T.Group();
   root.position.copy(axis).multiplyScalar(mapHeight(model.geography,u,v));root.quaternion.setFromUnitVectors(UP,axis);grove.add(root);regionalTree(root,.40+(i%4)*.13,false);
  }
 }
 model.secondaryMountains=reliefCount;
 model.namedLandmarks=model.geography.sites.map(site=>site.name);
}
