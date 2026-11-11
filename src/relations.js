import {enhanceRelations,showReport} from './relations-reading.js?v=20261110-relations-12';
import {relationRank,concentricRelations,proofsForMode} from './relation-ranks.js?v=20261110-relations-12';
import publicLoreEvidence from '../data/relations-official.json' with { type: 'json' };
import relationOverrides from '../assets/data/gi-relation-overrides.json' with { type: 'json' };
import loreFigures from '../assets/data/gi-relation-lore.json' with { type: 'json' };
import { previewPng } from './poster-export.js';

const key = 'astralis:relations:v1';
const defaults = { voiceLang:'en',volume:70,traveler:'aether',connectionMode:'voice',members:[], group:'region', lang:'fr', direction:'all', source:'all', min:1, played:[],
  region:'', element:'', version:'', owned:false, npc:true, spoilers:true, theme:'stars',
  palette:'element', opacity:25, thickness:1, curve:75, glow:8, radius:92, size:100,
  names:false, labels:true, view:'ring', shape:'circle', order:'name', team:'', zoom:1 };
const colors = { pyro:'#f47e74', hydro:'#61bfff', cryo:'#94e5ec', electro:'#c6a4ff',
  dendro:'#a1d475', anemo:'#76d9b8', geo:'#f5c77c' };
const groups = {force:'Réseau à forces',region:'Région',element:'Élément',weapon:'Arme',rarity:'Rareté',version:'Version',faction:'Faction'};
const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pair = (a,b) => [a,b].sort().join(':');
const regionOrder = ['Mondstadt','Liyue','Inazuma','Sumeru','Fontaine','Natlan','Snezhnaya','Nod-Krai','Khaenri’ah','Autres'];
const regionIcon = region => {
  const slug = normalize(region);
  return ['mondstadt','liyue','inazuma','sumeru','fontaine','natlan','nod-krai','snezhnaya'].includes(slug)
    ? './assets/relations/regions/' + slug + (slug==='inazuma'?'.webp':'.png') : '';
};

export function shortestRelationPath(edges, from, to) {
  if (!from || !to || from === to) return [];
  const neighbors = new Map();
  for (const edge of [...edges].sort((a,b)=>(b.weight||0)-(a.weight||0))) {
    for (const [a,b] of [[edge.a,edge.b],[edge.b,edge.a]]) {
      if (!neighbors.has(a)) neighbors.set(a,[]);
      neighbors.get(a).push(b);
    }
  }
  const previous = new Map([[from,null]]);
  const queue = [from];
  for (let i=0;i<queue.length;i++) {
    for (const next of neighbors.get(queue[i]) || []) {
      if (previous.has(next)) continue;
      previous.set(next,queue[i]);
      if (next === to) {
        const path = [to];
        for (let step=previous.get(to); step; step=previous.get(step)) path.push(step);
        return path.reverse();
      }
      queue.push(next);
    }
  }
  return [];
}

let context;
let snapshot;
let pending;
let lastView;

export function relationId(value) {
  const id = String(value);
  return /^(?:1000000[57](?:[-_].*)?|(?:aether|lumine|traveler|voyageur|voyageuse)(?:[-_].*)?)$/i.test(id) ? '10000005' : id;
}

export function isTravelerVariant(character) {
  return relationId(character.id ?? character._id) === '10000005' ||
    /^(?:traveler|voyageur|voyageuse|aether|lumine)(?:$|[ ·_-])/i.test(character._name || character.name || '') ||
    /^UI_AvatarIcon_Player(?:Boy|Girl)(?:$|_)/i.test(character.images?.filename_icon || '');
}
const images = new Map();

export function groupEvidence(evidence, ids) {
  const edges = new Map();
  for (const original of evidence || []) {
    const row = {...original, from:relationId(original.from), to:relationId(original.to)};
    if (!ids.has(row.from) || !ids.has(row.to) || row.from === row.to ||
        !row.id || !row.title || !row.quote?.trim() || !row.source || !['voice','story'].includes(row.kind)) continue;
    const id = pair(row.from,row.to);
    if (!edges.has(id)) edges.set(id,{a:row.from,b:row.to,proofs:[]});
    edges.get(id).proofs.push(row);
  }
  return [...edges.values()];
}

export async function documentedRelationPairs(ids) {
  const data = await getSnapshot();
  return new Set(groupEvidence(data.evidence, new Set(ids.map(relationId))).map(edge=>pair(edge.a,edge.b)));
}

function getSnapshot() {
  if (snapshot) return Promise.resolve(snapshot);
  pending ||= fetch('./data/relations.json').then(response => {
    if (!response.ok) throw Error('Le corpus est indisponible.');
    return response.json();
  }).then(data => snapshot = data).finally(() => { pending = null; });
  return pending;
}

export function renderRelations(data) {
  context = data;
  return '<astralis-relations></astralis-relations>';
}

function options(values, selected) {
  return Object.entries(values).map(([value,label]) =>
    '<option value="' + escape(value) + '"' + (String(selected) === value ? ' selected' : '') + '>' + escape(label) + '</option>').join('');
}

function picture(character) {
  const sources = [character.portrait, ...(character.portraitFallbacks || [character.image])].filter(Boolean);
  const key = sources[0];
  if (!key) return null;
  if (!images.has(key)) {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    const urls = [...new Set(sources.flatMap(source => {
      const url = new URL(source, location.href);
      if (url.origin === location.origin) return [url.href];
      const proxyHosts = ['enka.network','gi.yatta.moe','genshin.jmp.blue','api.ambr.top'];
      return proxyHosts.includes(url.hostname) ? ['/api/image?url=' + encodeURIComponent(url.href), url.href] : [url.href];
    }))];
    let index = 0;
    image.addEventListener('error', () => { if (++index < urls.length) image.src = urls[index]; });
    image.src = urls[0];
    images.set(key,image);
  }
  return images.get(key);
}

export function spreadRing(people, group, radius) {
  const groups = new Map();
  for (const character of people) {
    const label = group(character);
    if (!groups.has(label)) groups.set(label,[]);
    groups.get(label).push(character);
  }
  const tracks = Math.max(1, Math.min(5, Math.ceil(people.length / 28)));
  const gap = Math.min(.16,Math.PI/Math.max(1,groups.size));
  const step = (Math.PI * 2 - groups.size * gap) / Math.max(1, people.length);
  const points = [];
  let cursor = -Math.PI / 2;
  for (const [label, members] of groups) {
    const startAngle = cursor;
    const endAngle = cursor + members.length * step + gap;
    const middleAngle = (startAngle + endAngle) / 2;
    for (const [index, character] of members.entries()) {
      const angle = startAngle + gap/2 + (index+.5) * step;
      const track = radius - points.length % tracks * Math.min(46,radius*.105);
      const edgeAngle = Math.min(Math.PI / 2, angle-startAngle, endAngle-angle);
      points.push({c:character,angle,label,start:index===0,startAngle,endAngle,middleAngle,
        boundary:track*Math.sin(edgeAngle)-3,
        x:500+Math.cos(angle)*track,y:500+Math.sin(angle)*track});
    }
    cursor = endAngle;
  }
  return points;
}

class Relations extends (globalThis.HTMLElement || class {}) {
  connectedCallback() {
    if (this.initialized) return;
    this.initialized = true;
    this.context = context;
    this.innerHTML = '<div class="loading-panel" role="status"><span class="loader"></span>Lecture des répliques…</div>';
    try { this.settings = {...defaults,...JSON.parse(localStorage.getItem(key) || '{}')}; }
    catch { this.settings = {...defaults}; }
    this.selected = [];
    this.initialHash = location.hash;
    const hash = location.hash.slice(1);
    if (hash.startsWith('relations?')) {
      const params = new URLSearchParams(hash.slice(10));
      for (const [name,value] of params) {
        if (!(name in defaults) || ['members','played'].includes(name)) continue;
        const base = defaults[name];
        this.settings[name] = typeof base === 'boolean' ? value === 'true' : typeof base === 'number' ? Number(value) || base : value;
      }
      this.selected = [...new Set(params.getAll('id').map(relationId))].slice(0,2);
      this.sharedTeam = params.getAll('member').slice(0,4);
      if(params.has('quest')) this.settings.played = params.getAll('quest');
    }
    if (!localStorage.getItem(key+':lore-figures')) {
      if (!hash.includes('npc=')) this.settings.npc = true;
      localStorage.setItem(key+':lore-figures','1');
    }
    const camera=new URLSearchParams(location.hash.split('?')[1]||'');
    this.zoom=Math.max(.75,Math.min(3,Number(camera.get('cameraZoom'))||1));
    this.pan=[Number(camera.get('panX'))||0,Number(camera.get('panY'))||0];
    this.query = '';
    if (lastView?.hash === location.hash) {
      this.selected = lastView.selected;
      this.query = lastView.query;
      this.zoom = lastView.zoom;
      this.pan = lastView.pan;
      this.dismissedDuo = lastView.dismissedDuo;
    }
    this.composed = new Set((this.sharedTeam || this.settings.members || []).map(relationId));
    getSnapshot().then(data => {
      if (!this.isConnected) return;
      this.data = data;
      this.characters = new Map(this.context.people.map(person => [person.id,person]));
      for (const person of loreFigures) {
        const live = this.characters.get(person.id);
        this.characters.set(person.id,{...person,...live,portrait:person.portrait || live?.portrait,
          region:relationOverrides.regions?.[person.id]||person.region||live?.region,dossierPortrait:relationOverrides.dossierPortraits?.[person.id],npc:!live});
      }
      const traveler=this.characters.get('10000005');
      if(traveler){
        traveler.name='Voyageur & Paimon';traveler.region='Hors des sept nations';
        this.characters.delete('paimon');
      }
      const merged=[...data.evidence,...publicLoreEvidence].map(row=>({...row,originalFrom:row.from,originalTo:row.to,from:row.from==='paimon'?'10000005':row.from,to:row.to==='paimon'?'10000005':row.to}));
      this.edges = groupEvidence(merged,new Set(this.characters.keys()));
      this.setup();enhanceRelations(this);
    }).catch(error => {
      if (!this.isConnected) return;
      this.innerHTML = '<p role="alert">' + escape(error.message) + '</p><button type="button">Réessayer</button>';
      this.querySelector('button').onclick = () => { this.initialized = false; this.connectedCallback(); };
    });
  }

  setup() {
    this.className = 'relations-page';
    this.innerHTML = `
      <aside class="relations-sidebar">
        <div class="relations-sidebar-crest" aria-hidden="true">✧</div><span class="relations-kicker">ASTRALIS · ARCHIVES DE TEYVAT</span>
        <h2>Réseau des relations</h2>
        <p>Explore les mentions attestées entre personnages. Sélectionne deux portraits pour comparer leurs répliques.</p>
        <label>Rechercher un personnage<input type="search" data-rel-query placeholder="Nom ou alias"></label>
        <div data-rel-search></div>
        <div data-rel-info aria-live="polite"></div>
        <details class="relations-regions" open><summary>Atlas des régions</summary><div data-rel-regions></div></details>
        <label>Mon équipe<select data-rel-setting="team"></select></label>
        <details><summary>Composer une équipe</summary><div data-rel-compose></div></details>
      </aside>
      <div class="relations-workspace">
        <div class="relations-tools">
          <button type="button" class="relations-clear-selection" data-rel-action="clear" disabled>Effacer la sélection</button>
          <button type="button" data-rel-action="toggleConnection">Répliques / Connexions</button><button type="button" data-rel-action="list">Anneau / Liste</button>
          <button type="button" data-rel-action="share">Copier le lien</button>
          <button type="button" data-rel-action="png">PNG</button>
          <button type="button" data-rel-action="zoomOut" aria-label="Dézoomer">−</button><button type="button" data-rel-action="zoomIn" aria-label="Zoomer">+</button><button type="button" data-rel-action="resetView">Recentrer</button>
          <details class="relations-settings"><summary>Réglages</summary><div data-rel-settings></div></details>
          <details><summary>Aide</summary><p>Survole un portrait pour éclairer ses liens. Molette ou pincement pour zoomer. Glisse le fond pour déplacer la carte.</p></details>
          <button type="button" data-rel-action="report">Signaler une preuve</button>
        </div>
        <div class="relations-board"><canvas width="1000" height="1000" aria-label="Carte du réseau"></canvas><div class="relations-orbits" aria-hidden="true">
          <i style="--moon-color:#e9d6ac;--moon-angle:0deg;--moon-speed:44s"></i>
          <i style="--moon-color:#a9d7f4;--moon-angle:124deg;--moon-speed:59s"></i>
          <i style="--moon-color:#d6adef;--moon-angle:237deg;--moon-speed:72s"></i>
        </div><div data-rel-nodes></div></div>
        <div data-rel-list hidden></div>
        <p data-rel-message role="status"></p>
      </div>
      <dialog class="relations-association" aria-labelledby="relations-association-title">
        <header><div><span class="relations-kicker">ARCHIVES DE TEYVAT</span><h2 id="relations-association-title">Association</h2></div>
          <button type="button" data-rel-action="clear" aria-label="Fermer et effacer la sélection">×</button></header>
        <div data-rel-duo-content></div>
        <footer><button type="button" data-rel-action="clear">Retour sans sélection</button>
          <button type="button" data-rel-action="closeDuo">Voir la carte</button></footer>
      </dialog>`;
    this.querySelector('[data-rel-query]').value = this.query;
    this.canvas = this.querySelector('canvas');
    this.board = this.querySelector('.relations-board');
    this.duoDialog = this.querySelector('.relations-association');
    this.duoDialog.addEventListener('cancel', event => {
      event.preventDefault();
      this.clearSelection();
    });
    this.addEventListener('keydown', event => {
      if (event.key !== 'Escape' || this.duoDialog.open || !this.selected.length) return;
      event.preventDefault();
      event.stopPropagation();
      this.clearSelection();
    });
    const team = this.querySelector('[data-rel-setting=team]');
    team.innerHTML = options({'':'Aucune', custom:'Composition libre',...Object.fromEntries(this.context.teams.map(t=>[t.id,t.name]))},this.settings.team);
    this.querySelector('[data-rel-compose]').innerHTML = [...this.characters.values()].filter(c=>!c.npc).map(c=>
      `<label><input type="checkbox" data-rel-member="${escape(c.id)}" ${this.composed.has(c.id)?'checked':''}> ${escape(c.name)}</label>`).join('');
    this.renderSettings();
    this.addEventListener('input', event => {
      if (!event.target.matches('[data-rel-query]')) return;
      this.query = normalize(event.target.value.trim());
      this.rememberView();
      this.renderSearch();
      this.schedule();
    });
    this.addEventListener('change', event => {
      const field = event.target;
      const name = field.dataset.relSetting;
      if (field.dataset.relMember) {
        if (field.checked && this.composed.size >= 4) { field.checked = false; return; }
        if (field.checked) this.composed.add(field.dataset.relMember);
        else this.composed.delete(field.dataset.relMember);
        this.settings.team = 'custom';
        this.settings.members = [...this.composed];
        team.value = 'custom';
      } else if (name) {
        this.settings[name] = field.type === 'checkbox' ? field.checked : field.type === 'range' ? Number(field.value) : field.value;
        if(name==='region')this.settings.regions=field.value?[field.value]:[];
      } else return;
      this.update();
    });
    this.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (!button) return;
      if (button.dataset.relFocus) {this.selected=[button.dataset.relFocus];this.update();}
      else if (button.dataset.relSelect) this.select(button.dataset.relSelect);
      else if (button.dataset.relAction) this.action(button.dataset.relAction);
      else if (button.dataset.relDetail) this.context.openDetail(button.dataset.relDetail);
      else if (button.dataset.relLore) this.context.openLore(button.dataset.relLore);
      else if (button.hasAttribute('data-rel-region')) {
        const name=button.dataset.relRegion;this.settings.regions||=this.settings.region?[this.settings.region]:[];this.settings.regions=name?(this.settings.regions.includes(name)?this.settings.regions.filter(r=>r!==name):[...this.settings.regions,name]):[];this.settings.region='';
        this.querySelector('[data-rel-setting=region]').value = this.settings.region;
        this.update();
      } else if (button.dataset.relQuest) {
        this.settings.played = [...new Set([...this.settings.played, button.dataset.relQuest])];
        this.update();
      }
    });
    this.bindPointer();
    this.update();
  }

  renderSettings() {
    const unique = field => Object.fromEntries([...new Set([...this.characters.values()].map(c=>c[field]).filter(Boolean))].sort().map(v=>[v,v]));
    const selects = {
      group: ['Grouper par',groups], order:['Ordre',{name:'Alphabétique',weight:'Nombre de liens'}],
      voiceLang:['Langue des voix',{fr:'Français',en:'Anglais',zh:'Chinois',ja:'Japonais',ko:'Coréen'}],traveler:['Voyageur',{aether:'Aether',lumine:'Lumine'}],lang:['Langue',{fr:'Français',en:'Anglais',zh:'Chinois',ja:'Japonais',ko:'Coréen'}], direction:['Direction',{all:'Tous les liens',out:'Mentions émises',in:'Mentions reçues',mutual:'Réciproques'}],
      source:['Source',{all:'Toutes',voice:'Voix',story:'Histoire'}],
      region:['Région',{'':'Toutes',Autres:'Autres',...unique('region')}],element:['Élément',{'':'Tous',...unique('element')}],
      version:['Version',{'':'Toutes',...unique('version')}],theme:['Fond',{stars:'Nuit étoilée',dark:'Sombre uni',light:'Clair'}],
      palette:['Palette',{element:'Élément',region:'Région',mono:'Monochrome',accent:'Accent'}],
      shape:['Portraits',{circle:'Rond',hex:'Hexagone',portrait:'Carré'}]
    };
    const ranges = {volume:['Volume',0,100],min:['Poids minimum',1,10],opacity:['Opacité',5,100],thickness:['Épaisseur',1,5],curve:['Courbure',0,100],glow:['Lueur',0,20],radius:['Rayon',65,100],size:['Taille des nœuds',65,130]};
    const toggles = {owned:'Possédés seulement',npc:'Inclure les figures du lore',spoilers:'Masquer les quêtes non jouées',names:'Afficher les noms',labels:'Afficher les groupes'};
    this.querySelector('[data-rel-settings]').innerHTML =
      Object.entries(selects).map(([name,[label,values]])=>`<label>${label}<select data-rel-setting="${name}">${options(values,this.settings[name])}</select></label>`).join('') +
      Object.entries(ranges).map(([name,[label,min,max]])=>`<label>${label}<input type="range" data-rel-setting="${name}" min="${min}" max="${max}" value="${Number(this.settings[name])}"></label>`).join('') +
      Object.entries(toggles).map(([name,label])=>`<label><input type="checkbox" data-rel-setting="${name}" ${this.settings[name]?'checked':''}> ${label}</label>`).join('') +
      '<button type="button" data-rel-action="savePreset">Enregistrer un préréglage</button><button type="button" data-rel-action="loadPreset">Charger un préréglage</button><button type="button" data-rel-action="reset">Réinitialiser</button>';
  }

  update() {
    const s = this.settings;
    const traveler=this.characters.get('10000005');
    if(traveler)traveler.portrait='./assets/relations/team-portraits/'+(s.traveler==='lumine'?'10000007':'10000005')+'.webp';
    const people = [...this.characters.values()].filter(c => (!c.npc || s.npc) &&
      (!s.owned || c.owned) && ((s.regions?.length?s.regions:s.region?[s.region]:[]).length===0||(s.regions?.length?s.regions:[s.region]).includes(c.region||'Autres')) &&
      (!s.element || c.element === s.element) && (!s.version || c.version === s.version));
    const allowed = new Set(people.map(c=>c.id));
    this.selected = this.selected.filter(id => allowed.has(id));
    this.visibleEdges = this.edges.flatMap(edge => {
      if (!allowed.has(edge.a) || !allowed.has(edge.b)) return [];
      const proofs = edge.proofs.filter(row => (s.source === 'all' || row.kind === s.source) &&
        (row.kind !== 'story' || row.public || !s.spoilers || s.played?.includes(row.quest)));
      const dirs = new Set(proofs.map(row=>row.from));
      if (s.direction === 'mutual' && dirs.size < 2) return [];
      const first = this.selected[0];
      const matching = !first || s.direction === 'all' || s.direction === 'mutual' ? proofs :
        proofs.filter(row => row.from !== first && row.to !== first || (s.direction === 'out' ? row.from === first : row.to === first));
      const weight = new Set(matching.map(row=>row.id)).size;
      return weight >= s.min ? [{...edge,proofs:matching,weight}] : [];
    });
    const degree = new Map();
    for (const edge of this.visibleEdges) for (const id of [edge.a,edge.b]) degree.set(id,(degree.get(id)||0)+1);
    const group = c => s.group === 'force' ? 'Teyvat' : (s.group==='region'&&!regionOrder.slice(0,8).includes(c.region)?'Hors des sept nations':c[s.group]) || 'Non confirmé';
    const regionRank = name => regionOrder.includes(name) ? regionOrder.indexOf(name) : regionOrder.length;
    people.sort((a,b) => (s.group==='region' ? regionRank(group(a))-regionRank(group(b)) : 0) || group(a).localeCompare(group(b),'fr',{numeric:true}) ||
      (s.order === 'weight' ? (degree.get(b.id)||0)-(degree.get(a.id)||0) : 0) || a.name.localeCompare(b.name,'fr'));
    const radius = Math.max(65, Math.min(100, Number(s.radius) || 92)) * 4.55;
    const points = !s.region&&s.connectionMode==='connection'&&this.selected.length?concentricRelations(people,this.visibleEdges,this.selected[0],radius):spreadRing(people, s.region?()=>s.region:group, radius);
    this.points = new Map(points.map(point => {
      const nearest = Math.min(Infinity, ...points.filter(other => other !== point)
        .map(other => Math.hypot(point.x-other.x, point.y-other.y)));
      return [point.c.id,{...point, degree:degree.get(point.c.id)||0, clearance:Math.max(4,Math.min(point.boundary,(nearest-4)/2))}];
    }));
    const pathEdges = this.visibleEdges.filter(edge =>
      this.selected.includes('10000005') || (edge.a !== '10000005' && edge.b !== '10000005'));
    this.path = shortestRelationPath(pathEdges,...this.selected);
    this.pathEdges = new Set(this.path.slice(1).map((id,i)=>pair(this.path[i],id)));
    this.teamIds = s.team === 'custom' ? this.composed : new Set(this.context.teams.find(t=>t.id===s.team)?.members || []);
    this.dataset.theme = s.theme;
    this.board.hidden = s.view === 'list';
    this.querySelector('[data-rel-list]').hidden = s.view !== 'list';
    this.querySelector('.relations-clear-selection').disabled = this.selected.length === 0;
    this.renderNodes();
    this.calculateForces();
    this.renderSearch();
    this.renderInfo();
    this.renderRegions();
    for (const region of regionOrder) {
      const icon = regionIcon(region);
      const bitmap = icon ? picture({portrait:icon}) : null;
      if (bitmap && !bitmap.complete) bitmap.addEventListener('load',()=>this.schedule(),{once:true});
    }
    if (s.view === 'list') this.renderList();
    localStorage.setItem(key,JSON.stringify(s));
    this.schedule();
  }

  rememberView() {
    lastView = {hash:this.initialHash, selected:[...this.selected], query:this.query, zoom:this.zoom, pan:[...this.pan], dismissedDuo:this.dismissedDuo};
  }

  disconnectedCallback() {
    this.worker?.terminate();
    this.worker = null;
    if (this.frame) cancelAnimationFrame(this.frame);
    this.frame = 0;
  }

  calculateForces() {
    this.worker?.terminate();
    this.worker = null;
    if (this.settings.group !== 'force' || this.points.size < 2 || !globalThis.Worker) return;
    const worker = new Worker(new URL('./relations-worker.js', import.meta.url));
    this.worker = worker;
    worker.onmessage = ({data}) => {
      if (!this.isConnected || this.worker !== worker) return;
      for (const [id,x,y] of data.points) Object.assign(this.points.get(id),{x,y});
      this.positionButtons();
      this.schedule();
      worker.terminate();
      this.worker = null;
    };
    worker.postMessage({
      nodes:[...this.points.values()].map(p=>({id:p.c.id,x:p.x,y:p.y})),
      links:this.visibleEdges.map(e=>[e.a,e.b])
    });
  }

  renderNodes() {
    const host = this.querySelector('[data-rel-nodes]');
    const active = document.activeElement?.dataset.relSelect;
    host.innerHTML = [...this.points.values()].map(p=>`<button type="button" data-rel-select="${escape(p.c.id)}" aria-label="${escape(p.c.name)}" aria-pressed="${this.selected.includes(p.c.id)}" title="${escape(p.c.name)}"></button>`).join('');
    this.positionButtons();
    for (const button of host.children) {
      button.onmouseenter = () => { this.hover = button.dataset.relSelect; this.schedule(); };
      button.onmouseleave = () => { this.hover = ''; this.schedule(); };
      if (button.dataset.relSelect === active) button.focus({preventScroll:true});
      const image = picture(this.points.get(button.dataset.relSelect).c);
      if (image && !image.complete) image.addEventListener('load',()=>this.schedule(),{once:true});
    }
  }

  positionButtons(moving = null) {
    for (const button of this.querySelector('[data-rel-nodes]').children) {
      if (moving && !moving.has(button.dataset.relSelect)) continue;
      const point = this.points.get(button.dataset.relSelect);
      const [x,y] = this.transformed(this.focusPoint(point));
      const diameter = this.nodeRadius(point)*2*this.zoom/10;
      Object.assign(button.style,{left:x/10+'%',top:y/10+'%',width:diameter+'%',height:diameter+'%'});
    }
  }

  focusPoint(point) {
    const target = point.c?.id === this.selected[0] ? {x:500,y:500} : point;
    const old = this.focusMotion?.points.get(point.c?.id);
    if (!old) return target;
    const t = this.focusMotion.progress;
    return {x:old.x+(target.x-old.x)*t,y:old.y+(target.y-old.y)*t};
  }

  transformed(point) { return [(point.x-500)*this.zoom+500+this.pan[0],(point.y-500)*this.zoom+500+this.pan[1]]; }

  nodeRadius(point) {
    const target = this.targetRadius(point);
    const old = this.focusMotion?.points.get(point.c.id);
    return old ? old.r+(target-old.r)*this.focusMotion.progress : target;
  }

  targetRadius(point) {
    if (point.c.id===this.selected[0]) return 55;
    const radius = (21 + Math.min(3,Math.sqrt(point.degree)*.65) + (this.teamIds.has(point.c.id)?2:0)) *
      Math.max(.65,Math.min(1.3,this.settings.size/100));
    return this.settings.group==='force' ? radius : Math.min(radius,point.clearance);
  }

  color(point, forEdge = false) {
    if (forEdge && this.settings.palette === 'mono') return '#a9adc0';
    if (forEdge && this.settings.palette === 'accent') return '#cba5ff';
    if (forEdge && this.settings.palette === 'region') {
      return ['#f5b870','#7ed9c5','#c399e9','#93c9ff','#ed8c92'][[...point.label].reduce((sum,c)=>sum+c.charCodeAt(0),0)%5];
    }
    return colors[normalize(point.c.element)] || '#cbb79a';
  }

  startFocusMotion(next) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const points = new Map();
    for (const id of this.points.keys()) {
      const point = this.points.get(id);
      if (point) points.set(id,{...this.focusPoint(point),r:this.nodeRadius(point)});
    }
    this.focusMotion = {points,started:performance.now(),progress:0};
  }

  schedule() {
    if (this.frame) return;
    this.frame = requestAnimationFrame(now => {
      this.frame = 0;
      if (!this.isConnected) return;
      const motion = this.focusMotion;
      if (motion) {
        const time = Math.min(1,Math.max(0,(now-motion.started)/380));
        motion.progress = 1 - (1-time)**3;
        this.positionButtons(motion.points);
        if (time === 1) this.focusMotion = null;
      }
      if(matchMedia("(prefers-reduced-motion: reduce)").matches||motion||(!this.hover&&!this.selected[0])||this.duoDialog.open||!this.lastPaint||now-this.lastPaint>=28){this.draw(this.canvas);this.lastPaint=now;}
      if (this.focusMotion || ((this.hover || this.selected[0]) && !this.board.hidden && !this.duoDialog.open && !matchMedia("(prefers-reduced-motion: reduce)").matches)) this.schedule();
    });
  }

  draw(canvas, exported=false) {
    const ctx = canvas.getContext('2d'), s = this.settings;
    ctx.setTransform(canvas.width/1000,0,0,canvas.height/1000,0,0);
    ctx.clearRect(0,0,1000,1000);
    const light = s.theme === 'light', ink = light ? '#2c2940' : '#f6e9d2';
    ctx.fillStyle = light ? '#eee9e1' : s.theme === 'dark' ? '#11131b' : '#141a30';
    ctx.fillRect(0,0,1000,1000);
    if (s.theme === 'stars') {
      ctx.fillStyle = '#b8caff';
      for(let i=0;i<230;i++){ctx.globalAlpha=.12+(i%8)*.04;ctx.fillRect(((i*73.163+this.pan[0]*.14)%1000+1000)%1000,((i*143.71+this.pan[1]*.14)%1000+1000)%1000,i%7===0?2:1,i%7===0?2:1);}
    }
    ctx.globalAlpha=1;
    const concentric=s.connectionMode==='connection'&&this.selected.length;
    if(concentric){
      const [cx,cy]=this.transformed({x:500,y:500});
      for(const point of this.points.values()){
        if(!point.start)continue;
        const radius=point.ringRadius*this.zoom;
        ctx.beginPath();ctx.strokeStyle=light?'#8b703153':'#b8bbf039';ctx.lineWidth=1;
        ctx.arc(cx,cy,radius,0,2*Math.PI);ctx.stroke();
        ctx.fillStyle=ink;ctx.font='14px Georgia';ctx.textAlign='center';
        ctx.fillText(point.label,cx,cy-radius-9,200);
      }
    }
    if(!concentric&&s.group!=='force'){
      const [cx,cy] = this.transformed({x:500,y:500});
      const outer=(Math.max(65,Math.min(100,s.radius))*4.55+24)*this.zoom;
      for (const p of this.points.values()) {
        if (!p.start) continue;
        ctx.strokeStyle=light?'#8b70318c':'#dcc18d70';
        ctx.lineWidth=2;
        ctx.beginPath();
        ctx.arc(cx,cy,outer,p.startAngle+.013,p.endAngle-.013);
        ctx.stroke();
        ctx.lineWidth=1;
        ctx.strokeStyle=light?'#8b703135':'#dcc18d35';
        const angle=p.startAngle;
        ctx.beginPath();
        ctx.moveTo(cx+Math.cos(angle)*outer,cy+Math.sin(angle)*outer);
        ctx.lineTo(cx+Math.cos(angle)*outer*.54,cy+Math.sin(angle)*outer*.54);
        ctx.stroke();
      }

      const ring=Math.max(65,Math.min(100,s.radius))*4.55+25;
      const [x,y]=this.transformed({x:500,y:500});
      ctx.strokeStyle=light?'#8b7f6d55':'#ecd7b247';
      ctx.lineWidth=1;
      ctx.beginPath();ctx.arc(x,y,ring*this.zoom,0,Math.PI*2);ctx.stroke();
      for(let i=0;i<72;i++){
        const angle=i*Math.PI/36, c=Math.cos(angle)*this.zoom, t=Math.sin(angle)*this.zoom;
        ctx.beginPath();ctx.moveTo(x+c*ring,y+t*ring);ctx.lineTo(x+c*(ring+5),y+t*(ring+5));ctx.stroke();
      }
    }
    const first=this.selected[0] || this.hover;
    const second=this.selected[1];
    const related=new Set(first?[first]:[]);
    for (const edge of this.visibleEdges) {
      const a=this.points.get(edge.a), b=this.points.get(edge.b);
      const focusProofs=proofsForMode(edge.proofs,s.connectionMode);
      if (!focusProofs.length && !second) continue;
      if (!first && (edge.a==='10000005' || edge.b==='10000005')) continue;
      const highlight=second ? this.pathEdges.has(pair(edge.a,edge.b)) : first && [edge.a,edge.b].includes(first) && focusProofs.length>0;
      if (highlight) { related.add(edge.a); related.add(edge.b); }
      const [ax,ay]=this.transformed(this.focusPoint(a)), [bx,by]=this.transformed(this.focusPoint(b));
      const curve=Math.max(0,Math.min(1,s.curve/100));
      const [cx,cy]=this.transformed({x:500,y:500});
      const gradient=ctx.createLinearGradient(ax,ay,bx,by);
      gradient.addColorStop(0,this.color(a,true));gradient.addColorStop(1,this.color(b,true));
      ctx.strokeStyle=edge.proofs.some(p=>p.explicitRelation===true)?'#f5f0e5':gradient;
      ctx.lineWidth=Math.max(1,s.thickness)*(highlight?1.3+Math.min(1,Math.log1p(edge.weight)/4):.45);
      ctx.globalAlpha=highlight?.9:(first?.055:Math.max(.03,Math.min(1,s.opacity/100)));
      ctx.shadowBlur=highlight?Math.min(20,s.glow):0;
      ctx.shadowColor=this.color(a,true);
      const narrativeOnly = !edge.proofs.some(proof=>proof.kind==='voice'||proof.explicitRelation===true);
      ctx.setLineDash(second && highlight && this.path.length>2 ? [7,5] : a.c.npc||b.c.npc||narrativeOnly ? [2,5] : []);
      ctx.beginPath();ctx.moveTo(ax,ay);
      ctx.bezierCurveTo(ax+(cx-ax)*curve,ay+(cy-ay)*curve,bx+(cx-bx)*curve,by+(cy-by)*curve,bx,by);ctx.stroke();
      if(highlight&&!exported&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
        ctx.setLineDash([2,22]);ctx.lineDashOffset=-performance.now()/80;
        ctx.globalAlpha=.65;ctx.strokeStyle='#f9ebce';ctx.lineWidth=1.8;ctx.stroke();
        ctx.lineDashOffset=0;ctx.setLineDash([]);
      }
    }
    ctx.shadowBlur=0;ctx.setLineDash([]);
    const drawOrder=[...this.points.values()].sort((a,b)=>Number(a.c.id===this.selected[0])-Number(b.c.id===this.selected[0]));
    for (const p of drawOrder) {
      const [x,y]=this.transformed(this.focusPoint(p)), r=this.nodeRadius(p)*this.zoom;
      const bright=first?related.has(p.c.id):!this.teamIds.size||this.teamIds.has(p.c.id);
      const search=this.matches(p.c);
      ctx.globalAlpha=search ? (bright?.98:.33) : .16;
      if (p.c.id===this.selected[0]) {
        const fade = ctx.createRadialGradient(x,y,r*.6,x,y,r*1.9);
        fade.addColorStop(0,this.color(p)+'38');
        fade.addColorStop(1,this.color(p)+'00');
        ctx.fillStyle=fade;
        ctx.fillRect(x-r*2,y-r*2,r*4,r*4);
        ctx.strokeStyle=this.color(p);ctx.lineWidth=2;ctx.shadowColor=this.color(p);ctx.shadowBlur=22;
        ctx.beginPath();ctx.arc(x,y,r+8,0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0;
      }
      ctx.save();ctx.beginPath();
      if(s.shape==='hex'){
        for(let i=0;i<6;i++){const a=i*Math.PI/3;ctx.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r);}ctx.closePath();
      }else if(s.shape==='portrait')ctx.roundRect(x-r,y-r,r*2,r*2,r*.26);
      else ctx.arc(x,y,r,0,Math.PI*2);
      ctx.fillStyle=light?'#ddd2c3':'#293451';ctx.fill();ctx.clip();
      const image=picture(p.c);
      if(image?.complete && image.naturalWidth){
        const side=Math.min(image.naturalWidth,image.naturalHeight);
        ctx.drawImage(image,(image.naturalWidth-side)/2,(image.naturalHeight-side)*.12,side,side,x-r,y-r,r*2,r*2);
      }
      else{ctx.fillStyle=ink;ctx.font='bold '+Math.max(9,r)+'px system-ui';ctx.textAlign='center';ctx.fillText(p.c.name.slice(0,2),x,y+r*.35);}
      ctx.restore();
      ctx.strokeStyle=this.teamIds.has(p.c.id)?'#f9d996':this.color(p);
      ctx.lineWidth=this.selected.includes(p.c.id)||this.teamIds.has(p.c.id)?3:1.6;ctx.stroke();
      ctx.globalAlpha=bright?.95:.4;
      if(s.names||this.teamIds.has(p.c.id)||this.selected.includes(p.c.id)||this.path.includes(p.c.id)){
        ctx.fillStyle=ink;ctx.font='11px system-ui';ctx.textAlign='center';ctx.fillText(p.c.name,x,y+r+(p.c.id===this.selected[0]?22:13),145);
      }
      if(!concentric&&s.labels&&p.start&&s.group!=='force'){
        const outer=Math.min(475,Math.max(65,Math.min(100,s.radius))*4.55+47);
        const [rawX,rawY]=this.transformed({x:500+Math.cos(p.middleAngle)*outer,y:500+Math.sin(p.middleAngle)*outer});
        const lx=Math.max(54,Math.min(946,rawX)),ly=Math.max(33,Math.min(976,rawY));
        const icon=regionIcon(p.label);
        const symbol=icon?picture({portrait:icon}):null;
        if(symbol?.complete&&symbol.naturalWidth)ctx.drawImage(symbol,lx-13,ly-30,26,26);
        ctx.fillStyle=ink;ctx.font='15px Georgia';ctx.textAlign='center';ctx.fillText(p.label,lx,ly+8,150);
      }
    }
    ctx.globalAlpha=1;
    if(exported){
      ctx.fillStyle=light?'#eee9e1':'#141a30';ctx.fillRect(0,0,1000,52);ctx.fillRect(0,966,1000,34);
      ctx.fillStyle=ink;ctx.textAlign='left';ctx.font='24px Georgia';ctx.fillText('Astralis · Réseau des relations',20,34);
      ctx.font='14px system-ui';ctx.fillText('Contours · éléments   /   '+ (this.context.teams.find(t=>t.id===s.team)?.name || (s.team==='custom'?'Composition libre':'Vue générale')),20,988,960);
    }
  }

  matches(character) {
    return !this.query || normalize(character.name).includes(this.query) ||
      (character.id === '10000005' && ['aether','lumine','voyageur','voyageuse','traveler'].some(alias=>alias.includes(this.query))) ||
      Object.entries(this.data.aliases || {}).some(([alias,id])=>relationId(id)===character.id && alias.includes(this.query));
  }

  renderSearch() {
    const matches=[...this.points.values()].filter(p=>this.matches(p.c));
    this.querySelector('[data-rel-search]').innerHTML = !this.query ? '' : matches.length ?
      matches.slice(0,8).map(p=>`<button type="button" data-rel-select="${escape(p.c.id)}">${escape(p.c.name)}</button>`).join('') :
      '<p>Aucun personnage trouvé.</p>';
  }

  select(id) {
    const next = this.selected.includes(id) ? this.selected.filter(value=>value!==id) :
      this.selected.length===2?[id]:[...this.selected,id];
    this.startFocusMotion(next[0]);
    this.selected = next;
    this.dismissedDuo = '';
    this.rememberView();
    this.update();
  }

  localProofs(edge) {
    const ordered=[...edge.proofs].sort((a,b)=>Number(b.lang===this.settings.lang)-Number(a.lang===this.settings.lang));
    const localized = [...new Map(ordered.reverse().map(row=>[row.id,row])).values()];
    return localized.map(row=>{
      const versions=edge.proofs.filter(proof=>proof.id===row.id);
      const audioByLanguage=Object.assign({},...versions.map(proof=>proof.audioByLanguage||{}));
      const english=versions.find(proof=>proof.lang==='en'&&proof.audio);
      if(english&&!audioByLanguage.en)audioByLanguage.en=english.audio;
      return {...row,audioByLanguage};
    }).sort((a,b)=>a.from.localeCompare(b.from));
  }

  proof(row) {
    const source=/^https:\/\//.test(row.source)?row.source:'';
    const from=row.originalFrom==='paimon'?'Paimon':this.characters.get(row.from)?.name || row.from;
    const voice = row.audioByLanguage?.[this.settings.voiceLang] || (this.settings.voiceLang === 'en' ? row.audio : '');
    const audio = /^https:\/\/static\.wikia\.nocookie\.net\//.test(voice || '') ? voice : '';
    return `<figure><figcaption>${row.scope==='collective'?'Mention collective des Sept · ':row.summary?'Résumé sourcé · ':row.kind==='story'?'Scène · ':'Voix · '}${escape(from)} · ${escape(row.title)} · ${escape(row.lang.toUpperCase())}</figcaption><blockquote>${escape(row.quote)}</blockquote>${row.reply?`<blockquote><b>${escape(this.characters.get(row.to)?.name)}.</b> ${escape(row.reply)}</blockquote>`:''}${row.quest&&!this.settings.played.includes(row.quest)?`<button type="button" data-rel-quest="${escape(row.quest)}">Marquer la quête jouée</button>`:''}${audio?`<audio controls preload="none" src="${escape(audio)}" aria-label="Écouter la réplique originale"></audio>`:''}${source?`<a href="${escape(source)}" target="_blank" rel="noopener noreferrer">Source · ${escape(row.id)}</a>`:''}</figure>`;
  }

  avatar(character, className='') {
    const image=character?.portrait || character?.image;
    return image ? `<img class="${className}" src="${escape(image)}" alt="" loading="lazy">` :
      `<span class="relations-avatar-fallback" aria-hidden="true">${escape(character?.name?.slice(0,2)||'✧')}</span>`;
  }

  renderRegions() {
    const regions = new Map();
    for (const character of this.characters.values()) {
      if (character.npc&&!this.settings.npc) continue;
      const region = character.region || 'Autres';
      regions.set(region,(regions.get(region)||0)+1);
    }
    const host=this.querySelector('[data-rel-regions]');
    host.innerHTML = '<button type="button" data-rel-region="">✧ Toutes les régions</button>' +
      [...regions].sort(([a],[b]) => regionOrder.indexOf(a)-regionOrder.indexOf(b)).map(([name,count])=>{
        const icon=regionIcon(name);
        return `<button type="button" data-rel-region="${escape(name)}" aria-pressed="${(this.settings.regions||[this.settings.region]).includes(name)}">${icon?`<img src="${icon}" alt="">`:'<span aria-hidden="true">✧</span>'}<span>${escape(name)}</span><small>${count}</small></button>`;
      }).join('');
  }

  renderInfo() {
    const info=this.querySelector('[data-rel-info]');
    const [a,b]=this.selected;
    const allLinks=this.visibleEdges.filter(edge=>[edge.a,edge.b].includes(a));
    const links=allLinks.map(edge=>{
      const proofs=proofsForMode(edge.proofs,this.settings.connectionMode);
      return {...edge,proofs,weight:new Set(proofs.map(row=>row.id)).size};
    }).filter(edge=>edge.weight).sort((x,y)=>relationRank(y.proofs).rank-relationRank(x.proofs).rank||y.weight-x.weight);
    const dossier=id=>{
      const c=this.characters.get(id);
      const wiki=c.page?'https://genshin-impact.fandom.com/wiki/'+encodeURIComponent(c.page.replaceAll(' ','_')):'';
      return `<div class="relations-dossier">${this.avatar(c.dossierPortrait?{...c,portrait:c.dossierPortrait}:c)}<div><span class="relations-kicker">${c.npc?'FIGURE DU LORE':'PERSONNAGE'}</span><h3>${escape(c.name)}</h3><p>${escape([c.element,c.region||'Autres',c.faction].filter(Boolean).join(' · '))}</p>${c.page?`<a href="${escape(wiki)}" target="_blank" rel="noopener noreferrer">Dossier du lore ↗</a>`:`<button type="button" data-rel-detail="${escape(id)}">Fiche</button> <button type="button" data-rel-lore="${escape(id)}">Lore</button>`}</div></div>`;
    };
    const portraitButton=(id,label,extra='',hint='')=>{
      const c=this.characters.get(id);
      return `<button class="relations-person-link" title="${escape(hint)}" type="button" data-rel-select="${escape(id)}">${this.avatar(c)}<span>${escape(label||c?.name)}${extra?`<small>${escape(extra)}</small>`:''}</span></button>`;
    };
    let result='';
    let duo='';
    if(a)result='<button type="button" class="relations-back" data-rel-action="clear">← Toutes les relations</button>';
    if(a&&b){
      const edge=allLinks.find(e=>pair(e.a,e.b)===pair(a,b));
      duo+='<div class="relations-duo">'+dossier(a)+dossier(b)+'</div>';
      if(edge){
        const proofs=this.localProofs(edge);
        const columns = [
          [this.characters.get(a).name + ' → ' + this.characters.get(b).name, proofs.filter(row=>row.kind==='voice'&&row.from===a)],
          [this.characters.get(b).name + ' → ' + this.characters.get(a).name, proofs.filter(row=>row.kind==='voice'&&row.from===b)],
          ['Scènes et sources publiques',proofs.filter(row=>row.kind==='story')]
        ].filter(([,rows])=>rows.length);
        duo+=`<h3 class="relations-section-title">Relation directe <small>${edge.weight} preuves</small></h3>
          <div class="relations-duo-proofs">${columns.map(([title,rows])=>`<section><h4>${escape(title)}</h4>${rows.map(row=>this.proof(row)).join('')}</section>`).join('')}</div>`;
      }else if(this.path.length>2){
        duo+=`<h3 class="relations-section-title">Chemin le plus court <small>${this.path.length-1} liens</small></h3><p>Chaque étape correspond à une relation attestée.</p><ol class="relations-path">${this.path.map(id=>`<li>${portraitButton(id)}</li>`).join('')}</ol>`;
      }else duo+='<p>Aucun chemin attesté avec les filtres actuels.</p>';
      result+=dossier(a)+'<button type="button" data-rel-action="showDuo">Rouvrir l’association</button>';
    }else if(a){
      result+=dossier(a)+`<h3 class="relations-section-title">Relations visibles <small>${links.length}</small></h3>`+
        (links.length?`<div class="relations-link-list">${links.map(e=>{
          const id=e.a===a?e.b:e.a;
          return portraitButton(id,'',relationRank(e.proofs).diamonds+' · '+(e.proofs.find(p=>p.explicitRelation&&p.relationType)?.relationType||relationRank(e.proofs).label)+' · '+e.weight+' preuves',this.localProofs(e)[0]?.quote);
        }).join('')}</div>`:'<p>Aucun lien attesté avec ces filtres.</p>');
    }
    if(this.teamIds.size){
      const links=this.visibleEdges.filter(e=>this.teamIds.has(e.a)&&this.teamIds.has(e.b));
      const names=[...this.teamIds].map(id=>this.characters.get(id)?.name).filter(Boolean);
      const possible=names.length*(names.length-1)/2;
      result+=`<h3>Entente d’équipe</h3><p>${escape(names.join(' · '))}</p><p>${links.length}/${possible} duos documentés · ${links.reduce((n,e)=>n+e.weight,0)} preuves</p>${possible?`<p>Couverture des duos · ${Math.round(links.length/possible*100)} %</p>`:''}`+
        links.flatMap(e=>this.localProofs(e).slice(0,1)).map(row=>this.proof(row)).join('');
      for(const id of this.teamIds){
        const owned=this.visibleEdges.filter(e=>[e.a,e.b].includes(id)).map(e=>this.characters.get(e.a===id?e.b:e.a)).filter(c=>c?.owned);
        if(owned.length)result+=`<p>${escape(this.characters.get(id)?.name)} · ${escape(owned.map(c=>c.name).join(', '))}</p>`;
      }
    }
    info.innerHTML=result || '<p>Choisis un personnage pour consulter ses preuves.</p>';
    const duoKey = a && b ? pair(a,b) : '';
    const content = this.duoDialog.querySelector('[data-rel-duo-content]');
    content.innerHTML = duo;
    if (duoKey && this.dismissedDuo !== duoKey && !this.duoDialog.open) this.duoDialog.showModal();
    else if (!duoKey && this.duoDialog.open) this.duoDialog.close();
  }

  renderList() {
    const rows=this.visibleEdges.filter(e=>!this.selected.length||this.selected.includes(e.a)||this.selected.includes(e.b)).sort((a,b)=>this.listOrder==='name'?this.characters.get(a.a).name.localeCompare(this.characters.get(b.a).name,'fr'):b.weight-a.weight);
    this.querySelector('[data-rel-list]').innerHTML=rows.length?`<table><thead><tr><th><button type="button" data-rel-action="sortName">Personnage ↕</button></th><th>Relation</th><th><button type="button" data-rel-action="sortWeight">Preuves ↕</button></th></tr></thead><tbody>${rows.map(e=>`<tr><td><button type="button" data-rel-select="${escape(e.a)}">${escape(this.characters.get(e.a).name)}</button></td><td><button type="button" data-rel-select="${escape(e.b)}">${escape(this.characters.get(e.b).name)}</button></td><td>${e.weight}</td></tr>`).join('')}</tbody></table>`:'<p>Aucun lien pour ces filtres.</p>';
  }

  clearSelection() {
    this.startFocusMotion(undefined);
    this.selected = [];
    this.dismissedDuo = '';
    this.query = '';
    this.querySelector('[data-rel-query]').value = '';
    this.hover = '';
    if (location.hash.startsWith('#relations?')) {
      const params = new URLSearchParams(location.hash.slice(11));
      params.delete('id');
      history.replaceState(null,'','#relations?'+params);
      this.initialHash = location.hash;
    }
    this.rememberView();
    this.update();
    this.querySelector('[data-rel-query]').focus({preventScroll:true});
  }

  async action(name) {
    const message=this.querySelector('[data-rel-message]');
    if(name==='sortName'||name==='sortWeight'){this.listOrder=name==='sortName'?'name':'weight';this.renderList();}
    if(['connectionMode','voiceMode','loreMode','toggleConnection'].includes(name)){
      const mode=name==='toggleConnection'?(this.settings.connectionMode==='voice'?'connection':'voice'):name==='voiceMode'?'voice':name==='loreMode'?'lore':'connection';
      if(mode!==this.settings.connectionMode){this.startFocusMotion(this.selected[0]);this.settings.connectionMode=mode;this.update();}
    }
    if(name==='revealStory'){this.settings.spoilers=false;this.settings.source='all';this.renderSettings();this.update();}
    if(name==='clear') this.clearSelection();
    if(name==='closeDuo'){
      this.dismissedDuo=pair(...this.selected);
      this.duoDialog.close();
      this.rememberView();
      this.querySelector('.relations-clear-selection').focus({preventScroll:true});
    }
    if(name==='showDuo'){
      this.dismissedDuo='';
      this.renderInfo();
    }
    if(name==='list'){this.settings.view=this.settings.view==='list'?'ring':'list';this.update();}
    if(name==='zoomIn'||name==='zoomOut'){this.zoom=Math.max(.75,Math.min(3,this.zoom*(name==='zoomIn'?1.25:.8)));this.positionButtons();this.schedule();}
    if(name==='resetView'){this.zoom=1;this.pan=[0,0];this.positionButtons();this.schedule();}
    if(name==='reset'){this.settings={...defaults};this.composed.clear();this.querySelectorAll('[data-rel-member]').forEach(field=>field.checked=false);this.renderSettings();this.querySelector('[data-rel-setting=team]').value='';this.update();}
    if(name==='share'){
      const params=new URLSearchParams(Object.fromEntries(Object.entries(this.settings).map(([k,v])=>[k,String(v)])));
      params.set('cameraZoom',this.zoom);params.set('panX',this.pan[0]);params.set('panY',this.pan[1]);this.selected.forEach(id=>params.append('id',id));
      if(this.settings.team==='custom')this.composed.forEach(id=>params.append('member',id));
      this.settings.played.forEach(id=>params.append('quest',id));
      const url=new URL(location.href);url.hash='relations?'+params;
      history.replaceState(null,'',url);
      this.initialHash = location.hash;
      this.rememberView();
      try{await navigator.clipboard.writeText(url.href);message.textContent='Lien copié.';}
      catch{message.textContent='Lien disponible dans la barre d’adresse.';}
    }
    if(name==='png'){
      const render=()=>{const canvas=document.createElement('canvas');canvas.width=canvas.height=2000;this.draw(canvas,true);return canvas;};
      render.fixed=true;
      previewPng({title:'Astralis · Réseau des relations',render});
    }
    if(name==='report'){showReport(this);return;}
    if(name==='savePreset'||name==='loadPreset'){
      const label=prompt('Nom du préréglage');
      if(!label?.trim())return;
      let presets={};
      try{presets=JSON.parse(localStorage.getItem(key+':presets')||'{}');}catch{}
      if(name==='savePreset'){localStorage.setItem(key+':presets',JSON.stringify({...presets,[label]:this.settings}));message.textContent='Préréglage enregistré.';}
      else if(Object.hasOwn(presets,label)){this.settings={...defaults,...presets[label]};this.renderSettings();this.querySelector('[data-rel-setting=team]').value=this.settings.team;this.update();}
      else message.textContent='Préréglage introuvable.';
    }
  }

  bindPointer() {
    const board=this.board, pointers=new Map();
    let oldDistance=0;
    const refresh=()=>{this.positionButtons();this.schedule();};
    const zoom=factor=>{this.zoom=Math.max(.75,Math.min(3,this.zoom*factor));refresh();};
    board.addEventListener('wheel',event=>{event.preventDefault();zoom(Math.exp(-event.deltaY*.001));},{passive:false});
    board.addEventListener('pointerdown',event=>{
      if(event.target.closest('button'))return;
      board.setPointerCapture(event.pointerId);
      pointers.set(event.pointerId,[event.clientX,event.clientY]);
    });
    board.addEventListener('pointermove',event=>{
      const old=pointers.get(event.pointerId);if(!old)return;
      pointers.set(event.pointerId,[event.clientX,event.clientY]);
      if(pointers.size===2){
        const [[x,y],[xx,yy]]=[...pointers.values()],distance=Math.hypot(x-xx,y-yy);
        if(oldDistance)zoom(distance/oldDistance);
        oldDistance=distance;
      }else{
        const scale=1000/board.clientWidth;
        this.pan[0]+=(event.clientX-old[0])*scale;this.pan[1]+=(event.clientY-old[1])*scale;refresh();
      }
    });
    for(const name of ['pointerup','pointercancel','lostpointercapture'])board.addEventListener(name,event=>{pointers.delete(event.pointerId);oldDistance=0;});
  }
}

if (globalThis.customElements) customElements.define('astralis-relations',Relations);
