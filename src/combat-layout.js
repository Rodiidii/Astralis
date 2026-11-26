// Move the existing controls, retaining their inputs, state and event handlers.
export function enhanceCombatLayout(native,page){
  if(!native||native.dataset.combatLayout)return;
  native.dataset.combatLayout='visual';
  if(page==='builds'){
    const editor=native.querySelector('.build-editor'),identity=native.querySelector('.build-character-select'),stats=editor?.querySelector('.build-derived-stats');
    if(editor&&identity&&stats){const stage=document.createElement('div');stage.className='cr-build-stage';editor.querySelector('.build-editor-heading')?.insertAdjacentElement('afterend',stage);stage.append(identity,stats);identity.classList.add('cr-build-identity');}
    native.querySelectorAll('.build-artifact-piece').forEach((piece,index)=>{
      const drawer=document.createElement('details');drawer.className='cr-piece-drawer';
      const summary=document.createElement('summary'),visual=document.createElement('span'),caption=document.createElement('span'),title=document.createElement('b'),value=document.createElement('small'),mark=document.createElement('i');
      visual.className='cr-piece-symbol';caption.className='cr-piece-caption';mark.className='cr-drawer-mark';mark.setAttribute('aria-hidden','true');
      const art=piece.querySelector('.build-piece-visual img');
      if(art){const image=art.cloneNode(true);image.removeAttribute('id');image.className='';image.alt='';visual.append(image);}else{const image=document.createElement('img');image.src='/assets/sheet-icons/artifact.svg';image.alt='';visual.append(image);}
      title.textContent=['Fleur','Plume','Sablier','Coupe','Couronne'][index]||'Artéfact';
      const update=()=>{const field=piece.querySelector('[data-piece-field="mainType"], [data-build-piece-field="mainType"], .build-piece-fields select'),text=field?.selectedOptions?.[0]?.textContent;value.textContent=text&&!/choisir|aucun/i.test(text)?text:'Configurer la pièce';};
      update();piece.addEventListener('change',update);caption.append(title,value);summary.append(visual,caption,mark);drawer.append(summary);piece.before(drawer);drawer.append(piece);if(index===0)drawer.open=true;
    });
  }
  if(page==='teams'){
    native.querySelector('.teams-switch-all')?.remove();
    const overview=native.querySelector('.teams-overview');if(overview)native.append(overview);
    const controls=native.querySelector('.teams-library-controls');
    if(controls){const drawer=document.createElement('details');drawer.className='cr-library-drawer';const summary=document.createElement('summary');summary.textContent='Rechercher, trier et comparer mes équipes';controls.before(drawer);drawer.append(summary,controls);const heading=native.querySelector('.teams-workbench-heading');if(heading){const toolbar=document.createElement('div');toolbar.className='cr-team-controls';heading.before(toolbar);toolbar.append(heading,drawer);}}
    native.querySelectorAll('.team-sheet').forEach(sheet=>{
    sheet.classList.add('cr-team-sheet');
    const statDrawer=sheet.querySelector('.team-stats-disclosure');if(statDrawer){const key='astralis:team-stats-open:'+sheet.dataset.teamId;try{const saved=localStorage.getItem(key);if(saved!==null)statDrawer.open=saved==='1';}catch{}statDrawer.addEventListener('toggle',()=>{try{localStorage.setItem(key,statDrawer.open?'1':'0');}catch{}});}
    const roster=sheet.querySelector('.team-compact-roster'),panels=sheet.querySelectorAll('.team-roster .unit-panel');if(!roster)return;roster.classList.add('cr-lineup');
    const rotation=sheet.querySelector('.rotation-panel');if(rotation)sheet.querySelector('.team-sheet-details')?.before(rotation);
    const stats=sheet.querySelector('.team-live-analysis');if(stats){stats.querySelectorAll('img').forEach(img=>img.loading='eager');const after=sheet.querySelector('.team-resonance-row')||roster;after.after(stats);}
    const heading=sheet.querySelector('.team-sheet-head>div:first-child'),meter=heading?.querySelector('.team-roster-meter');
    if(heading&&meter){const readiness=document.createElement('details');readiness.className='cr-readiness';const summary=document.createElement('summary');summary.textContent=(meter.querySelector('small')?.textContent||'Composition')+' · Préparation';readiness.append(summary);[...heading.children].filter(el=>el.matches('.team-roster-meter,.team-role-summary,.team-role-advice,p')).forEach(el=>readiness.append(el));heading.append(readiness);}
    [...roster.children].forEach((member,index)=>{const source=panels[index]?.querySelector('.unit-portrait'),old=member.querySelector('.team-compact-avatar'),tint=panels[index]?.querySelector('.unit-art')?.style.getPropertyValue('--unit-element');
      if(source&&old){const picture=source.tagName==='IMG'?source:old;if(picture.tagName==='IMG'){const art=picture.cloneNode(true);art.className='team-compact-avatar cr-team-illustration';art.alt=old.alt;art.loading='eager';art.fetchPriority='high';old.replaceWith(art);}}if(tint)member.style.setProperty('--member-tint',tint);
      const element=panels[index]?.querySelector('.unit-name small')?.textContent?.replace(/^\s*\d+\s*[·•]\s*/,'').trim();if(element&&old){const label=document.createElement('small');label.className='cr-lineup-element';label.textContent=element;member.append(label);}
      const slot=document.createElement('article');slot.className='cp-lineup-slot';if(tint)slot.style.setProperty('--member-tint',tint);member.before(slot);slot.append(member);
      const equipment=panels[index]?.querySelector('.unit-equipment');if(equipment){equipment.querySelectorAll('.equipment-name').forEach(name=>name.classList.remove('sr-only'));slot.append(equipment);}
      const skills=panels[index]?.querySelector('.unit-skills');if(skills){const drawer=document.createElement('details'),summary=document.createElement('summary');drawer.className='cp-lineup-skills';summary.textContent='Compétences';drawer.append(summary,skills);slot.append(drawer);}
    });
    // All useful controls are now under their large splash. Do not retain a
    // second character card, a second portrait or empty equipment containers.
    sheet.querySelector('.team-roster')?.remove();
    });
  }
  if(page==='lab'){
    const main=native.querySelector('.lab-main'),target=main?.querySelector('.lab-scenario-panel'),result=main?.querySelector('.lab-live-output'),tabs=native.querySelector('.lab-tabs');if(main&&target&&result){main.prepend(target);target.after(result);}if(tabs)native.querySelector('.lab-preparation')?.append(tabs);
    const roster=native.querySelector('.lab-buff-roster'),buffs=native.querySelector('#lab-view-buffs');if(roster&&buffs){const zone=document.createElement('section');zone.className='cp-lab-party';const heading=document.createElement('header');heading.innerHTML='<div><small>ÉQUIPE</small><h2>Personnages & buffs</h2></div>';zone.append(heading,roster,buffs);native.querySelector('.lab-preparation')?.after(zone);}
    const receipts=native.querySelector('[data-lab-received-buffs]');if(receipts)receipts.open=false;
    const compactTabs={overview:'Dégâts',buffs:'Équipe & buffs',optimizer:'Optimiser',rotation:'Rotation'};
    native.querySelectorAll('[data-lab-tab]').forEach(button=>{if(!Object.hasOwn(compactTabs,button.dataset.labTab)){button.hidden=true;return;}const icon=button.querySelector('svg');button.replaceChildren();if(icon)button.append(icon);button.append(document.createTextNode(compactTabs[button.dataset.labTab]));});
    native.querySelectorAll('.lab-portrait').forEach(p=>p.loading='eager');
  }
}
