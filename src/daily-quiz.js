const STORAGE_KEY = 'astralis:daily-quiz:v1';
const GAME_LABELS = { gi: 'Genshin Impact', hsr: 'Honkai: Star Rail', ww: 'Wuthering Waves' };
const GAME_SYMBOLS = { gi: '✦', hsr: '✧', ww: '◈' };
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[char]);

function localDay(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
function readProgress() {
  try { const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); return data && typeof data === 'object' ? data : {}; }
  catch { return {}; }
}
function writeProgress(data) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {} }
function hashSeed(value) { let seed = 2166136261; for (const char of value) seed = Math.imul(seed ^ char.charCodeAt(0), 16777619); return seed >>> 0; }
function randomFor(seed) { let value = seed >>> 0; return () => { value += 0x6D2B79F5; let x=value; x=Math.imul(x^(x>>>15),x|1); x^=x+Math.imul(x^(x>>>7),x|61); return ((x^(x>>>14))>>>0)/4294967296; }; }
function shuffled(list, random) { const result=[...list]; for(let i=result.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]];} return result; }

function characterFacts(game, character) {
  const get = (...values) => values.map(value => String(value || '').trim()).find(value => value && !['—','-','unknown','none','aucun'].includes(value.toLowerCase())) || '';
  if (game === 'gi') return [
    ['Élément', get(character.elementText, character.vision, character.element)],
    ['Arme', get(character.weaponText, character.weaponType)],
    ['Région', get(character.region, character.nation)],
  ].filter(([,value]) => value);
  if (game === 'hsr') return [
    ['Type de combat', get(character.element, character.damageType)],
    ['Voie', get(character.path, character.baseType)],
  ].filter(([,value]) => value);
  return [['Attribut', get(character.element, character.attribute)]].filter(([,value]) => value);
}

function makeDailySet(game, characters, day) {
  const roster = (characters || []).filter(person => person?._name && person._name !== 'Sans nom');
  const random = randomFor(hashSeed(`${STORAGE_KEY}:${game}:${day}`));
  const candidates = [];
  for (const target of roster) {
    for (const [label, value] of characterFacts(game,target)) {
      const matches = roster.filter(person => characterFacts(game,person).some(([otherLabel,otherValue]) => label===otherLabel && otherValue.toLocaleLowerCase()===value.toLocaleLowerCase()));
      if (!matches.some(person => person._id === target._id)) continue;
      candidates.push({ target, label, value, matchingIds: new Set(matches.map(person=>person._id)) });
    }
  }
  const chosen = shuffled(candidates, random).slice(0,5);
  return chosen.map((question,index) => {
    const wrong = shuffled(roster.filter(person => person._id!==question.target._id && !question.matchingIds.has(person._id)), random).slice(0,3);
    const answers = shuffled([question.target,...wrong],random);
    return { id:`${day}-${index}-${question.target._id}`, label:question.label, value:question.value, targetId:String(question.target._id), options:answers.map(person=>({ id:String(person._id), name:person._name, image:person._quizImage || '', rarity:Number(person.rarity||person.qualityType?.match?.(/ORANGE|PURPLE/)?.[0] && 5)||0 })) };
  }).filter(question=>question.options.length===4);
}

function readState(game, characters) {
  const day=localDay(), progress=readProgress();
  if (!progress.games || typeof progress.games!=='object') progress.games={};
  if (!progress.records || typeof progress.records!=='object') progress.records={};
  if (!progress.records[game]) progress.records[game]={played:0,best:0,streak:0,lastDay:''};
  if (!progress.games[game]) progress.games[game]={};
  const gameProgress=progress.games[game];
  if (gameProgress.day!==day) {
    gameProgress.day=day; gameProgress.index=0; gameProgress.score=0; gameProgress.answers=[];
    gameProgress.questions=makeDailySet(game,characters,day);
    writeProgress(progress);
  } else if (!Array.isArray(gameProgress.questions)) {
    gameProgress.questions=makeDailySet(game,characters,day); writeProgress(progress);
  }
  return { progress, gameProgress, stats:progress.records[game] };
}

function formatDay(day) { try { return new Date(`${day}T12:00:00`).toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'}); } catch { return day; } }

export function renderDailyQuiz(game, characters) {
  const { gameProgress,stats }=readState(game,characters),questions=gameProgress.questions||[],done=questions.length>0&&gameProgress.index>=questions.length;
  const question=questions[gameProgress.index];
  const playedToday=gameProgress.answers?.length||0;
  const result=done?`<section class="quiz-result"><div class="quiz-result-seal">${gameProgress.score}/${questions.length}</div><div><span class="quiz-kicker">DÉFI DU JOUR TERMINÉ</span><h2>${gameProgress.score===questions.length?'Sans faute !':gameProgress.score>=3?'Belle exploration.':'La prochaine escale sera meilleure.'}</h2><p>${gameProgress.score} bonne(s) réponse(s), sur ${questions.length}. Le défi se renouvelle demain.</p></div><div class="quiz-result-best"><small>MEILLEUR SCORE</small><b>${Math.max(stats.best||0,gameProgress.score)}/${questions.length}</b></div></section>`:'';
  const questionView=question?`<section class="quiz-question" aria-live="polite"><div class="quiz-question-head"><div><span class="quiz-kicker">QUESTION ${gameProgress.index+1} / ${questions.length}</span><h2>Qui possède cette caractéristique ?</h2></div><div class="quiz-progress" aria-label="${playedToday} réponses sur ${questions.length}">${questions.map((_,i)=>`<i class="${i<gameProgress.index?'is-done':i===gameProgress.index?'is-current':''}"></i>`).join('')}</div></div><div class="quiz-clue"><span class="quiz-clue-symbol">${GAME_SYMBOLS[game]||'✦'}</span><span><small>${esc(question.label)}</small><b>${esc(question.value)}</b></span><span class="quiz-clue-mark">?</span></div><div class="quiz-options" role="group" aria-label="Choisir un personnage">${question.options.map((person,index)=>`<button class="quiz-option" type="button" data-quiz-answer="${esc(person.id)}" data-quiz-correct="${person.id===question.targetId}" aria-label="Réponse ${index+1}: ${esc(person.name)}"><span class="quiz-option-portrait">${person.image?`<img src="${esc(person.image)}" alt="" loading="lazy" decoding="async">`:`<i>${esc(person.name.slice(0,1))}</i>`}</span><span class="quiz-option-name">${esc(person.name)}</span><span class="quiz-option-check" aria-hidden="true">✦</span></button>`).join('')}</div><div class="quiz-feedback" data-quiz-feedback aria-live="polite">Choisis un portrait pour valider ta réponse.</div></section>`:'';
  const history=(gameProgress.answers||[]).map((answer,i)=>`<span class="${answer.correct?'quiz-history-hit':'quiz-history-miss'}" title="Question ${i+1} · ${answer.correct?'Bonne réponse':`Réponse : ${esc(answer.name)}`}">${answer.correct?'✦':'·'}</span>`).join('');
  const todayHistory=gameProgress.answers?.length?`<div class="quiz-answer-strip"><small>TES RÉPONSES</small><div>${history}</div></div>`:'';
  return `<main class="daily-quiz-page" data-daily-quiz data-quiz-game="${esc(game)}"><header class="quiz-hero"><div class="quiz-hero-glow"></div><div class="quiz-hero-copy"><span class="quiz-kicker">ASTRALIS · DÉFI QUOTIDIEN</span><h1>La cabine des<br><em>connaisseurs</em></h1><p>Un petit détour dans ton univers. Cinq indices, quatre portraits, une seule réponse.</p><div class="quiz-date">${GAME_SYMBOLS[game]||'✦'} <span>${esc(GAME_LABELS[game]||'Astralis')} · ${esc(formatDay(gameProgress.day))}</span></div></div><div class="quiz-hero-art" aria-hidden="true"><div class="quiz-orbit quiz-orbit-a"></div><div class="quiz-orbit quiz-orbit-b"></div><div class="quiz-hero-star">${GAME_SYMBOLS[game]||'✦'}</div><i>✧</i><i>✦</i><i>·</i></div><aside class="quiz-stats"><div><small>AUJOURD’HUI</small><b>${gameProgress.score||0}<span>/${questions.length}</span></b></div><div><small>MEILLEUR</small><b>${Math.max(stats.best||0,done?gameProgress.score:0)}<span>/${questions.length}</span></b></div><div><small>SÉRIE</small><b>${stats.streak||0}<span> jours</span></b></div></aside></header><section class="quiz-layout">${questionView}${result}<aside class="quiz-side"><div class="quiz-side-card"><span class="quiz-side-icon">✧</span><span class="quiz-kicker">PETIT RAPPEL</span><h3>La bonne réponse s’appuie sur le catalogue du jeu.</h3><p>Élément, arme, région ou Voie sont repris des données déjà présentes dans Astralis. Pas de lore inventé, pas de piège caché.</p><div class="quiz-side-rule"></div><small>${rosterCount(characters)} personnages dans ce roster</small></div>${todayHistory}<div class="quiz-side-tip"><span>✦</span><p>Chaque univers a son propre défi et son propre record.</p></div></aside></section></main>`;
}

function rosterCount(characters) { return (characters||[]).length; }

export function mountDailyQuiz(root, game, characters, notify=()=>{}) {
  if(!root||root.dataset.quizBound)return;
  root.dataset.quizBound='true';
  root.addEventListener('click',event=>{
    const button=event.target.closest('[data-quiz-answer]'); if(!button||button.disabled)return;
    const page=button.closest('[data-daily-quiz]'),currentGame=page?.dataset.quizGame||game;
    const {progress,gameProgress}=readState(currentGame,characters),question=gameProgress.questions?.[gameProgress.index];
    if(!question)return;
    const correct=button.dataset.quizAnswer===question.targetId,person=question.options.find(option=>option.id===question.targetId),buttons=[...page.querySelectorAll('[data-quiz-answer]')];
    for(const option of buttons){option.disabled=true;if(option.dataset.quizCorrect==='true')option.classList.add('is-correct');else if(option===button)option.classList.add('is-wrong');}
    const feedback=page.querySelector('[data-quiz-feedback]');if(feedback){feedback.classList.toggle('is-correct',correct);feedback.classList.toggle('is-wrong',!correct);feedback.innerHTML=correct?`Exact ! <b>${esc(person?.name||'')}</b> correspond à cet indice.`:`Pas cette fois. La réponse était <b>${esc(person?.name||'')}</b>.`;}
    gameProgress.answers||=[];gameProgress.answers.push({correct,name:person?.name||''});if(correct)gameProgress.score=(gameProgress.score||0)+1;gameProgress.index++;
    if(gameProgress.index>=gameProgress.questions.length){
      const stats=progress.records[currentGame],day=gameProgress.day;
      stats.played=(stats.played||0)+1;stats.best=Math.max(stats.best||0,gameProgress.score||0);
      const previous=new Date(`${stats.lastDay||'2000-01-01'}T12:00:00`),today=new Date(`${day}T12:00:00`),gap=Math.round((today-previous)/86400000);
      stats.streak=gap===1?(stats.streak||0)+1:stats.lastDay===day?(stats.streak||0):1;stats.lastDay=day;
    }
    writeProgress(progress);
    const next=page.querySelector('[data-quiz-next]');
    if(!next){const feedbackWrap=page.querySelector('[data-quiz-feedback]');if(feedbackWrap){const control=document.createElement('button');control.type='button';control.className='quiz-next-button';control.dataset.quizNext='';control.textContent=gameProgress.index>=gameProgress.questions.length?'Voir mon résultat':'Question suivante';feedbackWrap.insertAdjacentElement('afterend',control);}}
  });
  root.addEventListener('click',event=>{const next=event.target.closest('[data-quiz-next]');if(!next)return;const page=next.closest('[data-daily-quiz]'),activeGame=page?.dataset.quizGame||game,{gameProgress}=readState(activeGame,characters);if(gameProgress.index>=gameProgress.questions.length)notify('Défi terminé · ton résultat est enregistré sur cet appareil.');const holder=document.createElement('div');holder.innerHTML=renderDailyQuiz(activeGame,characters);const replacement=holder.firstElementChild;if(replacement){page.replaceWith(replacement);mountDailyQuiz(replacement,activeGame,characters,notify);}});
}
