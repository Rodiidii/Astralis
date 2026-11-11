const STORAGE = 'astralis:gi:lab-configurations';
const MAX_BYTES = 2_000_000;

export function parseLabConfiguration(text) {
  if (typeof text !== 'string' || text.length > MAX_BYTES) throw new Error('Fichier trop volumineux.');
  const original = JSON.parse(text.replace(/^\uFEFF/, ''));
  const isTarget = target => Array.isArray(target?.path) && target.path.length > 0 &&
    target.path.every(part => typeof part === 'string' || Number.isFinite(part)) &&
    (target.weight == null || Number.isFinite(target.weight));
  const isTargetGroup = group => Array.isArray(group?.targets) && group.targets.length > 0 && group.targets.every(isTarget);
  if (!original || typeof original.name !== 'string' || !original.name.trim()) throw new Error('Nom de configuration absent.');
  if(original.format==='astralis-team'&&Array.isArray(original.team?.members)&&original.team.members.length>=1&&original.team.members.length<=4)return {kind:'astralis-team',original};
  if (isTargetGroup(original)) return {kind:'multi-target', original};
  if (Array.isArray(original.loadoutData) && original.loadoutData.length >= 1 && original.loadoutData.length <= 4 &&
      original.loadoutData.some(member => member != null) &&
      original.loadoutData.every(member => member == null || (typeof member.key === 'string' &&
        Array.isArray(member.customMultiTargets ?? []) && (member.customMultiTargets ?? []).every(isTargetGroup)))) {
    return {kind:'team', original};
  }
  throw new Error('Format attendu : cible multiple ou équipe Genshin Optimizer.');
}

export function labConfigurations() {
  try { return JSON.parse(localStorage.getItem(STORAGE) || '[]'); } catch { return []; }
}

class LabConfigurations extends (globalThis.HTMLElement || class {}) {
  connectedCallback() {
    this.innerHTML = '<details><summary>Configurations JSON et équipes importées</summary><label>Importer depuis Genshin Optimizer ou Celestia<input type="file" accept=".json,application/json" multiple></label><button type="button" data-celestia-list>Parcourir les exports Celestia locaux</button><div data-celestia-choices></div><p role="status"></p><div data-config-list></div></details>';
    this.querySelector('input').addEventListener('change', async event => {
      const status = this.querySelector('[role=status]'), messages = [], saved = labConfigurations();
      for (const file of event.target.files) {
        try {
          if (file.size > MAX_BYTES) throw new Error('Fichier trop volumineux.');
          const config = parseLabConfiguration(await file.text());
          const identical = saved.some(row => JSON.stringify(row.original) === JSON.stringify(config.original));
          if (!identical) saved.push({...config, id:crypto.randomUUID()});
          messages.push(file.name + (identical ? ' · déjà enregistré' : ' · enregistré'));
        } catch (error) { messages.push(file.name + ' · ' + error.message); }
      }
      try { localStorage.setItem(STORAGE, JSON.stringify(saved)); }
      catch { messages.push('Enregistrement impossible : stockage local plein.'); }
      status.textContent = messages.join(' / ');
      event.target.value = '';
      this.renderList();
    });
    this.querySelector('[data-celestia-list]').addEventListener('click', () => this.loadCelestia());
    this.renderList();
  }

  async loadCelestia() {
    const host = this.querySelector('[data-celestia-choices]');
    host.textContent = 'Chargement de l’index local…';
    try {
      const base = './data/celestia-exports/';
      const response = await fetch(base + 'manifest.json', {cache:'no-store'});
      if (!response.ok) throw new Error('Exécute le script de collecte Celestia dans le projet.');
      const manifest = await response.json();
      const aliases = await fetch('./public/gi-name-aliases.json').then(reply=>reply.ok?reply.json():{}).catch(()=>({}));
      const setNames = new Map((aliases.artifacts || []).map(set=>[String(set.id),set.fr?.[0] || set.en?.[0]]));
      const seenKey = 'astralis:gi:celestia-seen';
      const seen = JSON.parse(localStorage.getItem(seenKey) || '{}');
      const exports = [];
      for (const row of manifest.entries || []) {
        for (const entry of [row, ...(row.variants || [])]) {
          for (const [kind, result] of Object.entries(entry.exports || {})) {
            if (!['config','team'].includes(kind) || !/^(config|team)\/[a-z0-9-]+\.json$/.test(result.file || '')) continue;
            const set = entry.setId == null ? '' : ' · ' + (setNames.get(String(entry.setId)) || ('Set ' + entry.setId));
            exports.push({label:String(row.slug||row.name||entry.slug||'Classement').replaceAll('-', ' ') + set, kind, file:result.file, revision:result.sha256 || 'initial'});
          }
        }
      }
      if (!exports.length) throw new Error('Aucun export disponible dans l’index.');
      const search = document.createElement('input'),list = document.createElement('div');
      search.type = 'search';
      search.placeholder = 'Chercher un classement';
      search.setAttribute('aria-label','Chercher un classement Celestia');
      list.className = 'celestia-export-list';
      const visible = {team:40, config:40};
      const draw = () => {
        list.replaceChildren();
        const query = search.value.trim().toLowerCase();
        for(const kind of ['team','config']){
          const rows=exports.filter(row=>row.kind===kind && row.label.toLocaleLowerCase('fr').includes(query));
          const heading=document.createElement('h4');
          const unread=rows.filter(row=>seen[row.file]!==row.revision).length;
          heading.textContent=(kind==='team'?'Teams':'Configs')+' · '+rows.length+(unread?' · '+unread+' nouveaux':'');
          list.append(heading);
          for (const row of rows.slice(0,visible[kind])) {
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = row.label;
            if(seen[row.file]!==row.revision){
              const badge=document.createElement('span');
              badge.className='celestia-new';
              badge.textContent='Nouveau';
              button.append(badge);
            }
            button.addEventListener('click', async () => {
              const status = this.querySelector('[role=status]');
              button.disabled=true;
              try {
                const response = await fetch(base + row.file, {cache:'no-store'});
                if (!response.ok) throw new Error('Export local introuvable.');
                const config = parseLabConfiguration(await response.text());
                const saved = labConfigurations();
                if (!saved.some(item => JSON.stringify(item.original) === JSON.stringify(config.original))) {
                  saved.push({...config,id:crypto.randomUUID()});
                  localStorage.setItem(STORAGE, JSON.stringify(saved));
                }
                seen[row.file]=row.revision;
                localStorage.setItem(seenKey, JSON.stringify(seen));
                status.textContent = config.original.name + ' · enregistré';
                this.renderList();
                draw();
              } catch (error) { status.textContent = error.message; }
              finally {button.disabled=false;}
            });
            list.append(button);
          }
          if (visible[kind] < rows.length) {
            const more = document.createElement('button');
            more.type = 'button';
            more.textContent = 'Afficher plus · ' + (kind === 'team' ? 'Teams' : 'Configs');
            more.addEventListener('click', () => { visible[kind] += 40; draw(); });
            list.append(more);
          }
        }
      };
      search.addEventListener('input',()=>{visible.team=visible.config=40;draw();});
      host.replaceChildren(search,list);
      draw();
    } catch (error) { host.textContent = error.message; }
  }

  renderList() {
    const list = this.querySelector('[data-config-list]');
    list.replaceChildren();
    const select=document.createElement('select');select.setAttribute('aria-label','Équipe ou configuration enregistrée');select.add(new Option('Choisir une équipe ou configuration…',''));
    const choices=new Map();
    select.addEventListener('change',()=>{for(const [id,details] of choices){details.hidden=!!select.value&&id!==select.value;details.open=id===select.value;}});
    if(labConfigurations().length)list.append(select);
    for (const row of labConfigurations()) {
      const details = document.createElement('details');
      choices.set(String(row.id),details);select.add(new Option(row.original.name,String(row.id)));
      const title = document.createElement('summary');
      title.textContent = row.original.name + (row.kind === 'team'||row.kind==='astralis-team' ? ' · équipe' : ' · ' + row.original.targets.length + ' cibles');
      details.append(title);
      if(row.kind==='astralis-team'){
        const button=document.createElement('button');button.type='button';button.textContent='Charger cette équipe dans le laboratoire';
        button.addEventListener('click',()=>this.dispatchEvent(new CustomEvent('astralis:lab-native-team',{bubbles:true,detail:row.original})));
        details.append(button);list.append(details);continue;
      }
      if (row.kind === 'team') {
        const open = document.createElement('button');
        open.type = 'button';
        open.textContent = 'Ouvrir dans Équipes';
        open.addEventListener('click', () => {
          const current = labConfigurations().find(item => item.id === row.id);
          if (current) this.dispatchEvent(new CustomEvent('astralis:open-imported-team', {bubbles:true,detail:current}));
        });
        details.append(open);
        for (const [index, member] of row.original.loadoutData.entries()) {
          if (!member) continue;
          const label = document.createElement('label');
          label.textContent = (member.name || member.key) + ' · arme de référence';
          const field = document.createElement('input');
          field.value = row.weaponOverrides?.[index] ?? member.buildTcs?.[0]?.weapon?.key ?? '';
          field.addEventListener('change', () => {
            const saved = labConfigurations(), config = saved.find(item => item.id === row.id);
            if (!config) return;
            (config.weaponOverrides ||= {})[index] = field.value.trim();
            localStorage.setItem(STORAGE, JSON.stringify(saved));
          });
          label.append(field);
          details.append(label);
        }
      }
      const info = document.createElement('p');
      info.textContent = 'Archive réutilisable dans Genshin Optimizer. Pour calculer une cible ici, associe ses chemins aux coups du kit chargé.';
      details.append(info);
      const groups = row.kind === 'team'
        ? row.original.loadoutData.flatMap(member => (member?.customMultiTargets || []).map(group => ({...group, member:member.key, memberBonusStats:member.bonusStats, conditions:member.conditional, enemy:row.original.enemyOverride})))
        : [row.original];
      for (const [index, group] of groups.entries()) {
        const use = document.createElement('button');
        use.type = 'button';
        use.textContent = 'Calculer · ' + group.name;
        use.addEventListener('click', () => {
          const host = details.querySelector('[data-config-mapping]') || document.createElement('div');
          host.dataset.configMapping = '';
          details.append(host);
          this.dispatchEvent(new CustomEvent('astralis:lab-config-map', {
            bubbles:true, detail:{host, group, key:row.id + ':' + index}
          }));
        });
        details.append(use);
      }

      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = 'Télécharger la configuration';
      button.addEventListener('click', () => {
        const current = labConfigurations().find(item => item.id === row.id);
        if (!current) return;
        const output = structuredClone(current.original);
        for (const [index,key] of Object.entries(current.weaponOverrides || {})) {
          const weapon = output.loadoutData?.[index]?.buildTcs?.[0]?.weapon;
          if (weapon && key) weapon.key = key;
        }
        const url = URL.createObjectURL(new Blob([JSON.stringify(output,null,2)],{type:'application/json'}));
        const link = document.createElement('a');
        link.href = url;
        link.download = output.name.replace(/[<>:"/\\|?*]/g,'-') + '.json';
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      });
      details.append(button);
      list.append(details);
    }
  }
}
if (globalThis.customElements && !customElements.get('lab-configurations')) customElements.define('lab-configurations', LabConfigurations);
