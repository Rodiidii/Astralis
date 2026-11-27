const hex=value=>/^#[a-f0-9]{6}$/i.test(String(value||''))?value.toLowerCase():null;
export function blend(a,b,weight=.5){const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));return '#'+rgb(a).map((v,i)=>Math.round(v*(1-weight)+rgb(b)[i]*weight).toString(16).padStart(2,'0')).join('');}
function richShade(colour,lightness){
 const rgb=[1,3,5].map(i=>parseInt(colour.slice(i,i+2),16)/255),max=Math.max(...rgb),min=Math.min(...rgb),delta=max-min;
 if(delta<.015)return blend(colour,'#080d16',.8);
 const hue=((max===rgb[0]?(rgb[1]-rgb[2])/delta+(rgb[1]<rgb[2]?6:0):max===rgb[1]?(rgb[2]-rgb[0])/delta+2:(rgb[0]-rgb[1])/delta+4)/6),l=(max+min)/2,saturation=Math.max(.48,Math.min(.8,delta/(1-Math.abs(2*l-1))));
 const a=saturation*Math.min(lightness,1-lightness),f=n=>{const k=(n+hue*12)%12;return Math.round(255*(lightness-a*Math.max(-1,Math.min(k-3,9-k,1)))).toString(16).padStart(2,'0')};
 return '#'+f(0)+f(8)+f(4);
}
export function sheetPalette(data={},options={},fallback={}){
 const themed=!options.element,primary=hex(options.accent)||hex(themed&&(data.palette?.accent||data.accent||data.identity?.accent)),secondary=hex(themed&&(data.palette?.secondary||data.identity?.secondary));
 if(!primary)return {...fallback};
 const base=richShade(primary,.12),contrast=colour=>{const lum=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((n,v,i)=>n+v*[.2126,.7152,.0722][i],0);return (Math.max(lum(colour),lum(base))+.05)/(Math.min(lum(colour),lum(base))+.05);};let accent=primary;for(let i=0;i<15&&contrast(accent)<4.5;i++)accent=blend(accent,'#ffffff',.1);
 return {n:fallback.n,e1:accent,e2:blend(secondary||primary,'#ffffff',.6),e3:base,e4:richShade(primary,.25),secondary:secondary||blend(primary,'#ffffff',.25)};
}
export function recolorBackdrop(svg,original,palette){const map=Object.fromEntries(['e1','e2','e3','e4'].map(k=>[original[k].toLowerCase(),palette[k]]));return svg.replace(/#[a-f0-9]{6}/gi,c=>map[c.toLowerCase()]||c);}
