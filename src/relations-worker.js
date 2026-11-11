self.onmessage = ({data:{token,nodes,links}}) => {
  const count = nodes.length;
  const index = new Map(nodes.map((node,i) => [node.id,i]));
  const points = nodes.map(node => [node.x,node.y]);
  const edges = links.map(([a,b])=>[index.get(a),index.get(b)]);
  const velocity = points.map(()=>[0,0]);
  for (let step=0;step<100;step++) {
    for (let a=0;a<count;a++) for (let b=a+1;b<count;b++) {
      const x=points[b][0]-points[a][0], y=points[b][1]-points[a][1];
      const d2=Math.max(64,x*x+y*y);
      const force=Math.min(2.8,650/d2);
      velocity[a][0]-=x*force;velocity[a][1]-=y*force;
      velocity[b][0]+=x*force;velocity[b][1]+=y*force;
    }
    for (const [a,b] of edges) {
      const x=points[b][0]-points[a][0],y=points[b][1]-points[a][1];
      const d=Math.max(1,Math.hypot(x,y)), force=(d-120)*.018/d;
      velocity[a][0]+=x*force;velocity[a][1]+=y*force;
      velocity[b][0]-=x*force;velocity[b][1]-=y*force;
    }
    for(let i=0;i<count;i++){
      const p=points[i], v=velocity[i];
      for(let dim=0;dim<2;dim++){
        v[dim]=(v[dim]+(500-p[dim])*.025)*.55;
        p[dim]=Math.min(929,Math.max(71,p[dim]+Math.min(18,Math.max(-18,v[dim]))));
      }
    }
  }
  self.postMessage({token, points:nodes.map((node,i)=>[node.id,...points[i]])});
};
