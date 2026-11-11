// Decorative vector constellations; no imported or generated imagery.
const patterns=[
 [[8,8],[24,18],[37,10],[50,30],[40,47],[24,42],[24,18]],
 [[4,35],[18,17],[36,8],[52,20],[47,40],[31,52],[18,38],[18,17]],
 [[3,20],[17,6],[35,18],[48,39],[29,47],[12,36],[3,20]],
 [[5,40],[21,27],[19,10],[37,5],[49,20],[38,36],[54,49]],
 [[4,8],[22,20],[42,12],[52,28],[38,43],[21,38],[22,20]]
];
export function createSpaceEffects(){
 const root=document.createElement('div');root.className='voyage-space-effects';root.setAttribute('aria-hidden','true');
 root.innerHTML=patterns.map((points,i)=>`<svg class="space-constellation constellation-${i}" viewBox="0 0 60 60" style="--const-delay:-${i*1.7}s"><polyline points="${points.map(p=>p.join(',')).join(' ')}"/>${points.map(([x,y],j)=>`<circle cx="${x}" cy="${y}" r="${j%3===0?.85:.5}" style="--star-delay:-${j*.9+i}s"/>`).join('')}</svg>`).join('')+
 Array.from({length:42},(_,i)=>`<i class="space-dust" style="left:${(i*37.17)%100}%;top:${(i*19.73)%100}%;--dust-delay:-${i*1.3}s;--dust-speed:${18+i%8*4}s"></i>`).join('')+
 '<i class="space-aurora"></i><i class="space-aurora space-aurora-far"></i>'+
 Array.from({length:3},(_,i)=>`<i class="space-comet" style="top:${22+i*27}%;left:${4+i*16}%;--comet-delay:-${i*14}s"></i>`).join('');
 return root;
}
