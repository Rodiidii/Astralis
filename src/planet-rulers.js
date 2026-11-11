import * as T from '../assets/vendor/three/three.module.js';
let sources;
function loadSources(){return sources ||= Promise.all(['death','time','life'].map(async name=>{
 const response=await fetch(new URL(`../assets/cosmos/rulers/${name}/shape.json`,import.meta.url));
 if(!response.ok)throw new Error('Silhouette indisponible : '+name);
 return {name,...await response.json()};
}));}
export function rulerGeometry(data){
 const shapes=data.shapes.map(source=>{
  const shape=new T.Shape(source.outline.map(p=>new T.Vector2(...p)));
  for(const hole of source.holes)shape.holes.push(new T.Path(hole.map(p=>new T.Vector2(...p))));
  return shape;
 });
 const geometry=new T.ExtrudeGeometry(shapes,{depth:.028,bevelEnabled:true,bevelSize:.004,bevelThickness:.004,bevelSegments:2,steps:1});
 const p=geometry.attributes.position,uv=geometry.attributes.uv;
 for(let i=0;i<p.count;i++)uv.setXY(i,p.getX(i)+.5,p.getY(i)/data.aspect+.5);
 geometry.translate(0,0,-.014);return geometry;
}
export async function addRulerSatellites(model){
 try{
  const data=await loadSources();if(model.disposed)return;
  for(let i=0;i<data.length;i++){
   const source=data[i],root=new T.Group();root.name='ruler-'+source.name;root.userData.satellite='ruler';root.visible=false;
   const texture=new T.TextureLoader().load(new URL(`../assets/cosmos/rulers/${source.name}/reference.png`,import.meta.url).href,()=>model.onReady?.());texture.colorSpace=T.SRGBColorSpace;
   const face=new T.MeshStandardMaterial({map:texture,color:'#ffffff',roughness:.38,metalness:.22,side:T.DoubleSide});
   const edge=new T.MeshStandardMaterial({color:model.rulerColors?.[source.name]||['#8b1830','#aaa0ff','#d8ae50'][i],roughness:.35,metalness:.6});
   const object=new T.Mesh(rulerGeometry(source),[face,edge]);object.scale.setScalar(.47/source.aspect);root.add(object);model.orbits.add(root);
   const plane=new T.Quaternion().setFromEuler(new T.Euler([.42,1.13,-.68][i],0,[.32,-.7,1.05][i]));
   model.animated.push(t=>{
    const a=t*[.29,-.23,.19][i]+i*2.094,r=1.55+i*.12;
    root.position.set(Math.cos(a)*r,0,Math.sin(a)*(r*.78)).applyQuaternion(plane);
    root.quaternion.copy(model.camera.quaternion);root.rotateZ(Math.sin(t*.4+i)*.16);object.rotation.y=Math.sin(t*.55+i)*.35;
   });
  }
  model.onReady?.();
 }catch(error){console.warn('Objets orbitaux indisponibles.',error);}
}

export function addCentralMoons(model){
 for(let i=0;i<3;i++){
  const group=new T.Group();group.name='central-moon';group.userData.satellite='moon';group.userData.moonIndex=i;model.orbits.add(group);
  const radius=.105+i*.014,geometry=new T.SphereGeometry(radius,28,20),p=geometry.attributes.position,colors=[];
  const base=new T.Color(['#ded8bc','#b9d5e3','#c7b5d4'][i]);
  for(let vertex=0;vertex<p.count;vertex++){
   const n=new T.Vector3().fromBufferAttribute(p,vertex).normalize();let crater=0;
   for(let c=0;c<9;c++){const a=c*2.399+i,lat=Math.sin(c*4+i)*1.1,axis=new T.Vector3(Math.sin(a)*Math.cos(lat),Math.sin(lat),Math.cos(a)*Math.cos(lat));crater+=Math.exp((n.dot(axis)-1)*(65+c%3*30));}
   const r=radius*(1-.08*Math.min(1,crater));p.setXYZ(vertex,n.x*r,n.y*r,n.z*r);const color=base.clone().multiplyScalar(1-.28*Math.min(1,crater));colors.push(color.r,color.g,color.b);
  }
  geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));geometry.computeVertexNormals();
  const moon=new T.Mesh(geometry,new T.MeshStandardMaterial({vertexColors:true,roughness:.96}));group.add(moon);
  const plane=new T.Quaternion().setFromEuler(new T.Euler([.4,1.12,-.72][i],0,[.35,-.6,.95][i]));
  model.animated.push(t=>{const a=t*[.22,-.17,.13][i]+i*2.094,r=1.44+i*.19;group.position.set(Math.cos(a)*r,0,Math.sin(a)*r*.85).applyQuaternion(plane);moon.rotation.y=t*(.25+i*.05);});
 }
}
