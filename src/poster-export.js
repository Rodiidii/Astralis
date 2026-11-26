import {renderSheet} from './sheet-renderer.js?v=20261126-personal-workshop-6';
const formats = { square: [1080, 1080], portrait: [960, 1280], landscape: [1440, 960] };
const models = { atelier: 'Atelier', atlas: 'Atlas', eclipse: 'Éclipse' };

const posterBitmapCache = new Map();
function exportImageCandidates(source) {
  if (!source) return [];
  if (Array.isArray(source)) return source.flatMap(exportImageCandidates);
  if (typeof source === 'string') return [source];
  return [];
}
export async function posterBitmap(sources) {
  for (const src of [...new Set(exportImageCandidates(sources))]) {
    if (!src) continue;
    if (posterBitmapCache.has(src)) {
      const cached = await posterBitmapCache.get(src).catch(() => null);
      if (cached) return cached;
      continue;
    }
    const pending = (async () => {
      let blob;
      if (/^(data:|blob:)/i.test(src) || new URL(src, location.href).origin === location.origin) {
        const response = await fetch(src, {signal:AbortSignal.timeout(9000)});
        if (!response.ok) throw new Error('HTTP ' + response.status);
        blob = await response.blob();
      } else {
        const response = await fetch(`/api/image?url=${encodeURIComponent(src)}`, { cache: 'force-cache', signal: AbortSignal.timeout(9000) });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        blob = await response.blob();
      }
      if (!blob.type.startsWith('image/')) throw new Error('Source non-image');
      return await createImageBitmap(blob);
    })();
    posterBitmapCache.set(src, pending);
    try { const bitmap = await pending; if (bitmap) return bitmap; }
    catch { posterBitmapCache.delete(src); }
  }
  return null;
}
export async function drawPoster(data, options={}, loadImage=posterBitmap) {
 const type=({'Équipe':'team','Comparatif d’équipe':'compare','Laboratoire de dégâts':'lab','Build':'build','Plan de farm':'farm'})[data.kind];if(type)return renderSheet(type,data,{...options,loadImage});
  const [width, height] = formats[options.format] || formats.landscape;
  const light = options.theme === 'light';
  const ink = light ? '#232030' : '#fff8ed';
  const muted = light ? '#554d62' : '#d4c9db';
  const paper = /^#[a-f\d]{6}$/i.test(options.background||'') ? options.background : light ? '#f8f2e9' : '#171420';
  const preferredAccent=options.accent||data.accent;
  const accent = /^#[a-f\d]{6}$/i.test(preferredAccent || '') ? preferredAccent : '#bda0ed';
  const canvas = document.createElement('canvas');
  canvas.width = width * 2;
  canvas.height = height * 2;
  const ctx = canvas.getContext('2d');
  ctx.scale(2, 2);
  const assets = await Promise.all([loadImage(options.artwork||data.image), loadImage(data.emblem), ...data.sections.map(section =>
    Promise.all(section.tiles.map(tile => loadImage(tile.image))))]);
  const [hero, emblem, ...sectionImages] = assets;

  function text(value, x, y, max, size, color = ink, font = 'system-ui', weight = 600) {
    ctx.font = weight + ' ' + size + 'px ' + font;
    ctx.fillStyle = color;
    const label = String(value ?? '');
    let shortened = label;
    while (shortened && ctx.measureText(shortened + (shortened === label ? '' : '…')).width > max) {
      shortened = shortened.slice(0, -1);
    }
    ctx.fillText(shortened === label ? label : shortened + '…', x, y);
  }
  function picture(image, x, y, w, h, cover = false) {
    if (!image) return;
    const scale = (cover ? Math.max : Math.min)(w / image.width, h / image.height);
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.drawImage(image, x + (w - image.width * scale) / 2,
      y + (h - image.height * scale) * (cover ? Number(options.focal ?? .2) : .5), image.width * scale, image.height * scale);
    ctx.restore();
  }
  function box(x, y, w, h, color, radius) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
    ctx.fill();
  }

  const editorial = data.kind !== 'Équipe';
  const margin = editorial ? 52 : 44;
  const side = options.model === 'atlas' && width > height && hero;
  const heroW = side ? width * .36 : width;
  const heroH = side ? height : height * (data.kind === 'Équipe' ? .17 : options.model === 'eclipse' ? .32 : options.model === 'atlas' ? .29 : .25);
  const contentX = side ? heroW + margin : margin;
  const contentW = width - contentX - margin;
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, width, height);
  const glow = ctx.createLinearGradient(0, 0, width, height);
  glow.addColorStop(0, accent + '60');
  glow.addColorStop(1, paper);
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);
  const artworkX = side || (editorial && options.model === 'eclipse') ? 0 : width * (editorial ? .40 : .38);
  picture(hero, artworkX, 0, side ? heroW : width - artworkX, heroH, options.crop!=='contain');
  if(editorial && options.model==='eclipse'){
    const halo=ctx.createRadialGradient(width*.72,heroH*.45,12,width*.72,heroH*.45,heroH*.7);
    halo.addColorStop(0,accent+'2b');
    halo.addColorStop(1,accent+'00');
    ctx.fillStyle=halo;
    ctx.fillRect(0,0,width,heroH);
  }
  const shade = ctx.createLinearGradient(0, 0, side ? heroW : width, 0);
  shade.addColorStop(0, paper);
  shade.addColorStop(.4, paper + 'ef');
  shade.addColorStop(1, paper + '21');
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, heroW, heroH);
  ctx.strokeStyle = accent;
  ctx.lineWidth = options.model === 'eclipse' ? 3 : 1;
  ctx.strokeRect(16, 16, width - 32, height - 32);
  if (options.model === 'atlas') {
    ctx.fillStyle = accent + 'aa';
    ctx.fillRect(16, 16, 5, height - 32);
    for (let y = 30; y < height - 20; y += 30) ctx.fillRect(24, y, 8, 1);
  }
  if (options.model === 'eclipse') {
    ctx.beginPath();
    ctx.arc(width - 110, 52, 138, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (editorial) {
    ctx.strokeStyle = accent + '6a';
    ctx.beginPath();
    ctx.arc(heroW - 122, 90, 88, 0, Math.PI * 2);
    ctx.arc(heroW - 122, 90, 70, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = accent;
    ctx.fillRect(margin, 69, 42, 2);
  }
  text('A S T R A L I S   /   ' + data.kind.toUpperCase(), margin, 58, heroW - 76, 16, muted);
  text(data.title, margin, 113, heroW - 76, width > 1000 ? 47 : 39, ink, ({serif:'Georgia',modern:'system-ui',mono:'monospace'})[options.font]||'Georgia', 650);
  text(data.subtitle, margin, 147, heroW - 76, 17, muted);

  picture(emblem, margin, 156, 28, 28);

  let y = side ? 52 : Math.max(173, heroH + 12);
  const columnsFor = section => Math.min((width < height && section.portraitColumns) || section.columns || 4, section.tiles.length || 1);
  const totalWeight = data.sections.reduce((sum, section) =>
    sum + Math.ceil(section.tiles.length / columnsFor(section)) * (section.weight || 1), 0);
  const unitHeight = (height - y - 58 - data.sections.length * 31) / Math.max(1, totalWeight);
  for (const [index, section] of data.sections.entries()) {
    if (!section.tiles.length) continue;
    text(section.title.toUpperCase(), contentX, y + 16, contentW, 15, muted);
    y += 31;
    const columns = columnsFor(section);
    const rowHeight = Math.min(380, unitHeight * (section.weight || 1));
    const gap = 10;
    const tileW = (contentW - gap * (columns - 1)) / columns;
    for (const [i, tile] of section.tiles.entries()) {
      const x = contentX + (i % columns) * (tileW + gap);
      const top = y + Math.floor(i / columns) * rowHeight;
      const image = sectionImages[index][i];
      const tileH = rowHeight - 8;
      const big = section.art && tileH > 125;
      const icon = image && !big ? Math.min(38, tileH * .4) : 0;
      box(x, top, tileW, tileH, light ? '#fffaf2' : '#272233', options.model === 'atelier' ? 13 : 3);
      if (editorial) {
        ctx.fillStyle = accent + '7d';
        ctx.fillRect(x + 8, top + tileH - 4, tileW - 16, 1);
      }
      const imageFraction=editorial ? .42 : .58;
      if (big) picture(image, x + 4, top + 4, tileW - 8, tileH * imageFraction, true);
      if (section.weight > 1 && !big && image) {
        ctx.save();
        ctx.globalAlpha = .24;
        picture(image, x + tileW * .45, top + 4, tileW * .55, tileH - 8);
        ctx.restore();
      }
      if (icon) picture(image, x + 8, top + 6, icon, icon);
      const tx = x + 10 + (icon ? icon + 6 : 0);
      const max = x + tileW - tx - 8;
      const titleY = top + (big ? tileH * (imageFraction+.02) + 15 : 18);
      text(tile.title, tx, titleY, max, Math.min(18, tileW / 10));
      const lines = (tile.lines || []).filter(Boolean);
      const spacing = Math.min(17, (top + tileH - titleY - 5) / Math.max(1, lines.length));
      lines.forEach((line, lineIndex) => text(line, tx, titleY + spacing * (lineIndex + 1), max, Math.max(8, Math.min(14, spacing - 1)), muted));
    }
    y += Math.ceil(section.tiles.length / columns) * rowHeight;
  }
  text(data.signature ? 'Signé · ' + data.signature : 'Astralis', margin, height - 27, width - 88, 15, muted);
  return canvas;
}

export function previewPng({title,render,notify,defaultFormat='landscape',defaultCrop='cover',artworks=[],lockedLayout=false,defaultAccent='#bda0ed',defaultBackground,extraOptions=[],helpText=''}){
 if(!document.querySelector('link[data-png-styles]')){const link=document.createElement('link');link.rel='stylesheet';link.dataset.pngStyles='1';link.href=new URL('../styles/png-export.css?v=20261126-reading-studio-2',import.meta.url).href;document.head.append(link);}
 const dialog=document.createElement('dialog');dialog.className='astralis-png-preview';
 dialog.innerHTML='<header class="png-head"><div><small>ASTRALIS · PARTAGER UNE IMAGE</small><h2></h2></div><button type="button" class="png-close" aria-label="Fermer">×</button></header><div class="png-workspace"><aside class="png-settings"><h3>À ton image</h3><p>Un aperçu fidèle au fichier exporté.</p><div data-options></div></aside><main class="png-stage"><div class="png-frame" data-preview><span class="png-loading">Composition de l’image…</span></div><span class="png-dimensions" data-dimensions></span></main></div><footer class="png-actions"><p role="status" aria-live="polite"></p><button type="button" data-copy-only disabled>Copier l’image</button><button type="button" data-save disabled>Télécharger le PNG</button></footer>';
 dialog.querySelector('h2').textContent=title||'Mon image';
 const status=dialog.querySelector('[role=status]'),preview=dialog.querySelector('[data-preview]'),save=dialog.querySelector('[data-save]'),copy=dialog.querySelector('[data-copy-only]'),controls=dialog.querySelector('[data-options]');
 const options={model:'atelier',format:defaultFormat,theme:'dark',font:'serif',crop:defaultCrop,focal:'.2'};
 let revision=0,canvas,encoded;
 const selectControl=(key,label,values)=>{const field=document.createElement('label'),caption=document.createElement('span'),select=document.createElement('select');caption.textContent=label;select.setAttribute('aria-label',label);for(const[value,name]of Object.entries(values))select.add(new Option(name,value));select.value=options[key]??'';select.onchange=()=>{options[key]=select.value;refresh();};field.append(caption,select);controls.append(field);return select;};
 if(helpText){const help=document.createElement('p');help.className='png-priority-help';help.textContent=helpText;controls.before(help);}
 if(!render.fixed){
  for(const extra of extraOptions)selectControl(extra.key,extra.label,extra.values);
  if(!lockedLayout){selectControl('format','Format',{square:'Carré',portrait:'Portrait',landscape:'Paysage'});selectControl('model','Modèle',models);selectControl('theme','Ambiance',{dark:'Sombre',light:'Claire'});selectControl('font','Typographie',{serif:'Éditoriale',modern:'Moderne',mono:'Technique'});}
  if(lockedLayout)selectControl('element','Palette',{'':'Couleur du personnage',anemo:'Anémo',geo:'Géo',electro:'Électro',dendro:'Dendro',hydro:'Hydro',pyro:'Pyro',cryo:'Cryo'});
  selectControl('crop','Cadrage',{cover:'Plein cadre',contain:'Illustration entière'});selectControl('focal','Position de l’illustration',{'.2':'Vers le haut','.5':'Centrée','.85':'Vers le bas'});
  if(!lockedLayout)for(const[key,label,value]of[['background','Fond',defaultBackground||'#171420'],['accent','Accent',defaultAccent]]){const field=document.createElement('label'),caption=document.createElement('span'),input=document.createElement('input');caption.textContent=label;input.type='color';input.value=value;input.setAttribute('aria-label',label);input.onchange=()=>{options[key]=input.value;refresh();};field.append(caption,input);controls.append(field);}
  if(artworks.length){const select=selectControl('artworkChoice','Illustration',{'':'Illustration d’origine',...Object.fromEntries(artworks.map((art,i)=>[i,art.label]))});select.onchange=()=>{options.artwork=select.value===''?undefined:artworks[Number(select.value)].image;refresh();};}
  const field=document.createElement('label'),caption=document.createElement('span'),file=document.createElement('input');field.className='png-upload';caption.textContent='Choisir une image personnelle';file.type='file';file.accept='image/png,image/jpeg,image/webp';file.setAttribute('aria-label','Illustration personnelle');file.onchange=()=>{const f=file.files?.[0];if(!f)return;if(f.size>10000000){status.textContent='Image limitée à 10 Mo.';return;}const reader=new FileReader();reader.onload=()=>{options.artwork=String(reader.result);refresh();};reader.readAsDataURL(f);};field.append(caption,file);controls.append(field);
  const reset=document.createElement('button');reset.type='button';reset.className='png-reset';reset.textContent='Rétablir l’illustration';reset.onclick=()=>{delete options.artwork;file.value='';const select=controls.querySelector('[aria-label=Illustration]');if(select)select.value='';refresh();};controls.append(reset);
 }
 async function refresh(){const current=++revision;save.disabled=copy.disabled=true;preview.setAttribute('aria-busy','true');status.textContent='Composition de l’image…';try{const next=await render({...options});if(current!==revision||!dialog.open)return;canvas=next;canvas.setAttribute('aria-label','Aperçu du PNG');canvas.style.cssText='display:block;width:auto;height:auto;max-width:100%;max-height:100%;object-fit:contain';preview.replaceChildren(canvas);encoded=new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(Error('Encodage PNG impossible.')),'image/png'));encoded.catch(()=>{});dialog.querySelector('[data-dimensions]').textContent=canvas.width+' × '+canvas.height+' px · PNG';status.textContent='Prête à partager';save.disabled=copy.disabled=false;}catch(error){if(current===revision)status.textContent=error.message||'Aperçu indisponible.';}finally{if(current===revision)preview.removeAttribute('aria-busy');}}
 copy.onclick=async()=>{if(!encoded||copy.disabled)return;if(!navigator.clipboard?.write||!globalThis.ClipboardItem){status.textContent='La copie d’image est indisponible dans cette fenêtre.';return;}copy.disabled=true;try{await navigator.clipboard.write([new ClipboardItem({'image/png':encoded})]);status.textContent='Image copiée. Tu peux la coller directement.';notify?.('Image copiée dans le presse-papiers.');}catch{status.textContent='Copie refusée par le navigateur. Aucun fichier téléchargé.';}finally{copy.disabled=false;}};
 save.onclick=async()=>{if(!encoded||save.disabled)return;save.disabled=true;try{const url=URL.createObjectURL(await encoded),link=document.createElement('a');link.href=url;link.download=(title||'Astralis').replace(/[^\p{L}\p{N}._-]+/gu,'-')+'.png';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);status.textContent='PNG téléchargé.';notify?.(status.textContent);}catch(error){status.textContent=error.message;}finally{save.disabled=false;}};
 dialog.querySelector('.png-close').onclick=()=>dialog.close();dialog.addEventListener('close',()=>{revision++;dialog.remove();});document.body.append(dialog);dialog.showModal();refresh();return dialog;
}
