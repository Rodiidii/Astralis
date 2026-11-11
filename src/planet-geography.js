let geography;
let request;let retryAfter=0;

export function loadPlanetGeography() {
 if (typeof window === 'undefined'||Date.now()<retryAfter) return Promise.resolve(null);
 return request ||= fetch(new URL('../assets/cosmos/map/geography.json',import.meta.url)).then(response => {
  if (!response.ok) throw new Error('Carte locale indisponible.');
  return response.json();
 }).then(data => { geography=data;return data; }).catch(error => {
  request=null;retryAfter=Date.now()+30000;
  console.warn(error.message);
  return null;
 });
}

export function regionalGeography(region) {
 return geography?.regions?.[region] || null;
}

export function mapPoint(map, u, v) {
 if(map.projection==='stereographic'){
  const px=(u-map.centerU)*map.projectionScale,py=(map.centerV-v)*map.projectionScale*map.height/map.width;
  const d=1+px*px+py*py;return {lon:Math.atan2(2*px/d,(2-d)/d),lat:Math.asin(2*py/d)};
 }
 const lon=(u-(map.centerU??.5))*map.lonSpan, lat=((map.centerV??.5)-v)*map.latSpan;
 return {lon,lat};
}

export function mapHeight(map, u, v) {
 if (u<0 || u>1 || v<0 || v>1) return .988;
 const size=Math.round(Math.sqrt(map.heights.length));
 const x=Math.min(size-1,u*(size-1)),y=Math.min(size-1,v*(size-1));
 const x0=Math.floor(x),y0=Math.floor(y),x1=Math.min(size-1,x0+1),y1=Math.min(size-1,y0+1);
 const ax=x-x0,ay=y-y0;
 const h=(map.heights[y0*size+x0]*(1-ax)+map.heights[y0*size+x1]*ax)*(1-ay)+
  (map.heights[y1*size+x0]*(1-ax)+map.heights[y1*size+x1]*ax)*ay;
 if(h<5)return .988;
 let elevation=1.005+h*.0006;
 for(const site of map.sites) {
  if(!/peak|canyon|volcano|pyramid/.test(site.kind))continue;
  const distance=(u-site.u)**2+(v-site.v)**2;
  elevation+=site.height*.3*Math.exp(-distance/.003);
 }
 return elevation;
}

export function geographicalSample(map, x, y, z) {
 const lon=Math.atan2(x,z),lat=Math.asin(Math.max(-1,Math.min(1,y)));
 let u,v;if(map.projection==='stereographic'){const denominator=Math.max(.000001,1+z);u=x/denominator/map.projectionScale+map.centerU;v=map.centerV-y/denominator/map.projectionScale*map.width/map.height;}else{u=lon/map.lonSpan+(map.centerU??.5);v=(map.centerV??.5)-lat/map.latSpan;}
 const height=mapHeight(map,u,v);
 return {height,land:height>.99,u,v};
}
