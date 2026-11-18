const STORAGE_KEY = 'astralis:daily-quiz:v1';
const GAME_LABELS = { gi: 'Genshin Impact', hsr: 'Honkai: Star Rail', ww: 'Wuthering Waves' };
const GAME_SYMBOLS = { gi: '✦', hsr: '✧', ww: '◈' };
const GAME_ART = { gi: './assets/ui/game-genshin.png', hsr: './assets/ui/game-starrail.png', ww: './assets/ui/game-wuthering.png' };
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
export function quizExplanationFacts(game,character,excludedLabel=''){
  return character?characterFacts(game,character).filter(([label])=>label!==excludedLabel).slice(0,3):[];
}

export function chooseQuizHint(game, targetId, options = [], characters = [], excludedLabel = '') {
  const byId = new Map((characters || []).map(person => [String(person?._id ?? person?.id), person]));
  const target = byId.get(String(targetId));
  if (!target) return null;
  const candidates = (Array.isArray(options) ? options : []).map(option => byId.get(String(option?.id))).filter(Boolean);
  const facts = characterFacts(game, target).filter(([label]) => label !== excludedLabel);
  const ranked = facts.map(([label, value]) => {
    const matching = candidates.filter(person => characterFacts(game, person).some(([candidateLabel, candidateValue]) => candidateLabel === label && candidateValue.toLocaleLowerCase() === value.toLocaleLowerCase())).length;
    return { label, value, remaining: Math.max(1, matching) };
  }).sort((a, b) => a.remaining - b.remaining || a.label.localeCompare(b.label));
  if (ranked.length) return ranked[0];
  const name = String(target?._name || target?.name || '');
  return name ? { label: 'Nom', value: `${name.slice(0, 1)} · ${name.length} lettres`, remaining: 1 } : null;
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
  if (!progress.records[game]) progress.records[game]={played:0,best:0,bestRun:0,streak:0,lastDay:'',mistakes:[]};
  if(!Array.isArray(progress.records[game].mistakes))progress.records[game].mistakes=[];
  if (!progress.games[game]) progress.games[game]={};
  const gameProgress=progress.games[game];
  if (gameProgress.day!==day) {
    gameProgress.day=day; gameProgress.index=0; gameProgress.score=0; gameProgress.answers=[]; gameProgress.hints={};
    gameProgress.questions=makeDailySet(game,characters,day);
    writeProgress(progress);
  } else if (!Array.isArray(gameProgress.questions)) {
    gameProgress.questions=makeDailySet(game,characters,day); writeProgress(progress);
  }
  if(!gameProgress.hints||typeof gameProgress.hints!=='object'||Array.isArray(gameProgress.hints))gameProgress.hints={};
  return { progress, gameProgress, stats:progress.records[game] };
}

function formatDay(day) { try { return new Date(`${day}T12:00:00`).toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'}); } catch { return day; } }

export function buildQuizWeek(day, history = [], todayProgress = {}) {
  const byDay = new Map((Array.isArray(history) ? history : []).map(item => [item.day, item]));
  const end = new Date(`${day}T12:00:00`);
  return Array.from({length:7},(_,index)=>{
    const date = new Date(end);
    date.setDate(date.getDate() - (6-index));
    const key = localDay(date), record = byDay.get(key);
    const today = key === day;
    const played = Boolean(record) || (today && Number(todayProgress.answered) > 0);
    const score = record ? `${Number(record.score)||0}/${Number(record.total)||5}` : today && played ? `${Number(todayProgress.score)||0}/${Number(todayProgress.total)||5}` : '—';
    return {day:key,label:new Intl.DateTimeFormat('fr-FR',{weekday:'short'}).format(date).replace(/\.$/,''),score,state:record?'played':today?'today':'empty',played};
  });
}

export function quizStreakProgress(stats={},day=localDay()){
  const streak=Math.max(0,Math.floor(Number(stats?.streak)||0)),lastDay=String(stats?.lastDay||''),today=new Date(`${day}T12:00:00`),last=new Date(`${lastDay}T12:00:00`),gap=lastDay&&Number.isFinite(last.getTime())?Math.round((today-last)/86400000):Infinity,active=gap===0||gap===1,current=active?streak:0,milestones=[3,7,14,30,60,100,365],target=milestones.find(value=>value>current)||Math.ceil((current+1)/365)*365,previous=[0,...milestones.filter(value=>value<target)].at(-1)||0;
  return {current,target,remaining:Math.max(0,target-current),progress:Math.max(0,Math.min(100,Math.round((current-previous)/(target-previous)*100))),status:current===0?'Commence une nouvelle série aujourd’hui.':gap===0?'Défi du jour terminé · ta série est à jour.':'Joue aujourd’hui pour prolonger ta série.'};
}

export function quizComboStats(answers=[],bestRecord=0){
 const rows=Array.isArray(answers)?answers:[];let current=0,best=0;
 for(const answer of rows){current=answer?.correct?current+1:0;best=Math.max(best,current);}
 const record=Math.max(0,Math.floor(Number(bestRecord)||0),best),target=current>=3?5:3;
 return {current,best:record,target,remaining:Math.max(0,target-current),progress:Math.max(0,Math.min(100,Math.round(current/target*100))),milestone:current>=5?5:current>=3?3:0};
}

export function quizTopicMastery(stats={},game='gi'){
 const labels=game==='hsr'?['Type de combat','Voie']:game==='ww'?['Attribut']:['Élément','Arme','Région'];
 const source=stats?.topicStats&&typeof stats.topicStats==='object'?stats.topicStats:{};
 return labels.map(label=>{const row=source[label]||{},attempts=Math.max(0,Math.floor(Number(row.attempts)||0)),correct=Math.max(0,Math.min(attempts,Math.floor(Number(row.correct)||0)));return {label,attempts,correct,accuracy:attempts?Math.round(correct/attempts*100):0};});
}

export function buildQuizReview(questions = [], answers = []) {
  return (Array.isArray(questions) ? questions : []).slice(0, (Array.isArray(answers) ? answers : []).length).map((question,index)=>{
    const answer=answers[index]||{},target=(question.options||[]).find(person=>String(person.id)===String(question.targetId));
    const chosen=(question.options||[]).find(person=>String(person.id)===String(answer.selectedId));
    return {label:String(question.label||''),value:String(question.value||''),correct:Boolean(answer.correct),targetName:String(target?.name||answer.name||'Personnage inconnu'),targetImage:String(target?.image||''),chosenName:String(chosen?.name||answer.selectedName||(answer.correct?target?.name:'Réponse non mémorisée'))};
  });
}

export function buildQuizMistake(question,answer,day){
 if(!question||answer?.correct)return null;
 return {id:String(question.id||`${day}-${question.targetId}`),day:String(day||''),label:String(question.label||''),value:String(question.value||''),targetId:String(question.targetId||''),options:(Array.isArray(question.options)?question.options:[]).map(option=>({id:String(option.id||''),name:String(option.name||''),image:String(option.image||'')}))};
}

export function resolveQuizMistake(mistakes,questionId,correct){
 const rows=Array.isArray(mistakes)?mistakes:[];
 return correct?rows.filter(item=>String(item?.id)!==String(questionId)):rows;
}

export function quizTopicMistakes(mistakes,topic){
 const label=String(topic||'').trim();
 return (Array.isArray(mistakes)?mistakes:[]).filter(item=>String(item?.label||'').trim()===label);
}

export function buildQuizShareText({ game = 'gi', day = localDay(), score = 0, total = 5, streak = 0 } = {}) {
  const marks = Array.from({ length: Math.max(0, Math.min(20, Number(total) || 0)) }, (_, index) => index < Number(score) ? '✦' : '·').join('');
  return `✦ Astralis · Défi quotidien\n${GAME_LABELS[game] || 'Astralis'} · ${formatDay(day)}\n${marks} ${Number(score) || 0}/${Number(total) || 0}\nSérie : ${Math.max(0, Number(streak) || 0)} jour(s)`;
}

export function renderDailyQuiz(game, characters) {
  const { gameProgress,stats }=readState(game,characters),dailyQuestions=gameProgress.questions||[],practice=gameProgress.practice?.day===gameProgress.day?gameProgress.practice:null,practiceActive=Boolean(practice&&Array.isArray(practice.questions)&&practice.index<practice.questions.length),questions=practiceActive?practice.questions:dailyQuestions,index=practiceActive?practice.index:gameProgress.index,score=practiceActive?practice.score:gameProgress.score,answers=practiceActive?practice.answers:gameProgress.answers,done=!practiceActive&&dailyQuestions.length>0&&gameProgress.index>=dailyQuestions.length;
  const question=questions[index];
  const playedToday=answers?.length||0;
  const combo=quizComboStats(answers,stats.bestRun);
  const review=done?buildQuizReview(dailyQuestions,gameProgress.answers):[];
  const result=done?`<section class="quiz-result"><div class="quiz-result-seal">${gameProgress.score}/${dailyQuestions.length}</div><div><span class="quiz-kicker">DÉFI DU JOUR TERMINÉ</span><h2>${gameProgress.score===dailyQuestions.length?'Sans faute !':gameProgress.score>=3?'Belle exploration.':'La prochaine escale sera meilleure.'}</h2><p>${gameProgress.score} bonne(s) réponse(s), sur ${dailyQuestions.length}. Le défi se renouvelle demain.</p></div><div class="quiz-result-best"><small>MEILLEUR SCORE</small><b>${Math.max(stats.best||0,gameProgress.score)}/${dailyQuestions.length}</b><small>MEILLEURE CHAÎNE · ${Math.max(stats.bestRun||0,quizComboStats(gameProgress.answers).best)}</small></div><button type="button" class="quiz-share-button" data-quiz-share>Copier mon résultat</button>${stats.mistakes.length?`<button type="button" class="quiz-practice-button" data-quiz-practice>✧ Réviser mes erreurs <b>${stats.mistakes.length}</b><small>Sans modifier ton record ni ta série</small></button>`:''}<details class="quiz-review"><summary>Revoir mes ${review.length} réponses</summary><ol>${review.map((item,index)=>`<li class="${item.correct?'is-correct':'is-wrong'}"><span class="quiz-review-mark" aria-hidden="true">${item.correct?'✓':'↺'}</span><div class="quiz-review-clue"><small>${index+1} · ${esc(item.label)}</small><b>${esc(item.value)}</b></div><div class="quiz-review-answer">${item.targetImage?`<img src="${esc(item.targetImage)}" alt="" loading="lazy" decoding="async">`:''}<span><b>${esc(item.targetName)}</b><small>${item.correct?'Bonne réponse':`Tu as choisi ${esc(item.chosenName)}`}</small></span></div></li>`).join('')}</ol></details></section>`:'';
  const practiceResult=practice&&!practiceActive?`<aside class="quiz-practice-result" role="status"><b>Révision terminée · ${practice.score}/${practice.questions.length}</b><span>${stats.mistakes.length?`${stats.mistakes.length} erreur(s) à revoir encore`:'Toutes les erreurs sont maîtrisées !'}</span></aside>`:'';
  const savedHint=(practiceActive?practice.hints:gameProgress.hints)?.[String(index)];
  const hintView=savedHint?`<aside class="quiz-hint-revealed" aria-live="polite"><span>✧</span><div><small>INDICE BONUS · ${Math.min(4,Number(savedHint.remaining)||4)}/4 portraits compatibles</small><b>${esc(savedHint.label)} · ${esc(savedHint.value)}</b></div></aside>`:`<button type="button" class="quiz-hint-button" data-quiz-hint aria-label="Révéler un indice supplémentaire">✧ Révéler un indice supplémentaire</button>`;
  const practiceBanner=practiceActive?'<div class="quiz-practice-banner"><span>✧ '+(practice?.topic?'RÉVISION · '+esc(practice.topic).toLocaleUpperCase("fr"):'RÉVISION DES ERREURS')+'</span><small>Réponds juste pour maîtriser cette erreur · sans impact sur ton record</small></div>':'';
  const questionView=question?`<section class="quiz-question${practiceActive?' is-practice':''}" aria-live="polite">${practiceBanner}<div class="quiz-question-head"><div><span class="quiz-kicker">${practiceActive?'ERREUR À REVOIR':'QUESTION'} ${index+1} / ${questions.length}</span><h2>Qui possède cette caractéristique ?</h2></div><div class="quiz-progress" aria-label="${playedToday} réponses sur ${questions.length}">${questions.map((_,i)=>`<i class="${i<index?'is-done':i===index?'is-current':''}"></i>`).join('')}</div></div><div class="quiz-combo" data-quiz-combo="${combo.current}" aria-live="polite"><span class="quiz-combo-mark" aria-hidden="true">${combo.milestone===5?'✦':combo.milestone===3?'✧':'·'}</span><div><small>CHAÎNE DE CONNAISSANCES</small><b>${combo.current?`${combo.current} bonne(s) réponse(s) d’affilée`:'À toi de lancer la série'}</b></div><div class="quiz-combo-track" role="progressbar" aria-label="Progression de la chaîne de réponses justes" aria-valuemin="0" aria-valuemax="${combo.target}" aria-valuenow="${combo.current}"><i style="width:${combo.progress}%"></i></div><span class="quiz-combo-record" title="Meilleure chaîne personnelle">Record <b>${combo.best}</b></span></div><div class="quiz-clue"><span class="quiz-clue-symbol"><img src="${GAME_ART[game]||GAME_ART.gi}" alt="${esc(GAME_LABELS[game]||'Astralis')}" decoding="async"></span><span><small>${esc(question.label)}</small><b>${esc(question.value)}</b></span><span class="quiz-clue-mark">?</span></div>${hintView}<div class="quiz-options" role="group" aria-label="Choisir un personnage · touches 1 à 4">${question.options.map((person,index)=>`<button class="quiz-option" type="button" data-quiz-answer="${esc(person.id)}" data-quiz-correct="${person.id===question.targetId}" aria-keyshortcuts="${index+1}" aria-label="Réponse ${index+1}: ${esc(person.name)}"><span class="quiz-option-portrait">${person.image?`<img src="${esc(person.image)}" alt="" loading="lazy" decoding="async">`:`<i>${esc(person.name.slice(0,1))}</i>`}</span><span class="quiz-option-name">${esc(person.name)}</span><kbd class="quiz-option-key">${index+1}</kbd><span class="quiz-option-check" aria-hidden="true">✦</span></button>`).join('')}</div><div class="quiz-feedback" data-quiz-feedback aria-live="polite">Choisis un portrait pour valider ta réponse. <small>Raccourci : touche 1, 2, 3 ou 4.</small></div></section>`:'';
  const history=(gameProgress.answers||[]).map((answer,i)=>`<span class="${answer.correct?'quiz-history-hit':'quiz-history-miss'}" title="Question ${i+1} · ${answer.correct?'Bonne réponse':`Réponse : ${esc(answer.name)}`}">${answer.correct?'✦':'·'}</span>`).join('');
  const todayHistory=gameProgress.answers?.length?`<div class="quiz-answer-strip"><small>TES RÉPONSES</small><div>${history}</div></div>`:'';
  const week=buildQuizWeek(gameProgress.day,stats.history,{answered:gameProgress.answers?.length||0,score:gameProgress.score,total:dailyQuestions.length}),streak=quizStreakProgress(stats,gameProgress.day),mastery=quizTopicMastery(stats,game),masteryAttempts=mastery.reduce((sum,row)=>sum+row.attempts,0);
  const masteryView=`<section class="quiz-mastery" aria-label="Maîtrise des thèmes"><header><div><span class="quiz-kicker">TES REPÈRES</span><b>Maîtrise par thème</b></div><small>${masteryAttempts} réponse${masteryAttempts===1?'':'s'} comptabilisée${masteryAttempts===1?'':'s'}</small></header>${mastery.map(row=>{const topicMistakes=quizTopicMistakes(stats.mistakes,row.label);return `<div class="quiz-mastery-row"><span><b>${esc(row.label)}</b><small>${row.attempts?`${row.correct}/${row.attempts} justes`:'À découvrir'}</small></span><i role="progressbar" aria-label="Précision sur ${esc(row.label)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${row.accuracy}"><b style="width:${row.accuracy}%"></b></i><strong>${row.attempts?`${row.accuracy}%`:'—'}</strong>${topicMistakes.length?`<button type="button" class="quiz-topic-practice" data-quiz-practice data-quiz-practice-topic="${esc(row.label)}" aria-label="Réviser ${topicMistakes.length} erreur(s) sur ${esc(row.label)}">Réviser · ${topicMistakes.length}</button>`:''}</div>`}).join('')}<p>Les erreurs peuvent être retravaillées par thème, sans toucher au score du défi quotidien ni à ta série.</p></section>`;
  const weekView=`<section class="quiz-week" aria-label="Défis des sept derniers jours"><header><div><span class="quiz-kicker">TON RYTHME</span><b>Les 7 derniers jours</b></div><small>${week.filter(item=>item.played).length} / 7 jours actifs</small></header><div class="quiz-week-days">${week.map(item=>`<div class="quiz-week-day is-${item.state}" aria-label="${esc(formatDay(item.day))} · ${item.played?`score ${item.score}`:item.state==='today'?'défi du jour':'aucun défi'}"><span>${esc(item.label)}</span><b>${esc(item.score)}</b><i>${item.state==='played'?'✦':item.state==='today'?'•':'·'}</i></div>`).join('')}</div><p>Les scores restent séparés pour chaque univers et sont conservés sur cet appareil.</p></section><section class="quiz-streak-goal" aria-label="Progression de la série"><header><span class="quiz-streak-emblem" aria-hidden="true">✦</span><div><small>PROCHAIN JALON</small><b>${streak.target} jours de série</b><p>${esc(streak.status)}</p></div><strong>${streak.remaining}<small>jour${streak.remaining===1?'':'s'}</small></strong></header><div class="quiz-streak-track" role="progressbar" aria-label="Progression vers le prochain jalon de série" aria-valuemin="0" aria-valuemax="${streak.target}" aria-valuenow="${streak.current}"><i style="--quiz-streak-progress:${streak.progress}%"></i></div><small class="quiz-streak-foot">${streak.current} / ${streak.target} défis quotidiens · chaque univers garde sa propre série</small></section>`;
  return `<main class="daily-quiz-page" data-daily-quiz data-quiz-game="${esc(game)}"><header class="quiz-hero"><div class="quiz-hero-glow"></div><div class="quiz-hero-copy"><span class="quiz-kicker">ASTRALIS · DÉFI QUOTIDIEN</span><h1>La cabine des<br><em>connaisseurs</em></h1><p>Un petit détour dans ton univers. Cinq indices, quatre portraits, une seule réponse.</p><div class="quiz-date"><img class="quiz-game-mark" src="${GAME_ART[game]||GAME_ART.gi}" alt="" decoding="async"><span>${esc(GAME_LABELS[game]||'Astralis')} · ${esc(formatDay(gameProgress.day))}</span></div></div><div class="quiz-hero-art" aria-hidden="true"><div class="quiz-orbit quiz-orbit-a"></div><div class="quiz-orbit quiz-orbit-b"></div><div class="quiz-hero-star"><img src="${GAME_ART[game]||GAME_ART.gi}" alt=""></div><i>✧</i><i>✦</i><i>·</i></div><aside class="quiz-stats"><div><small>${practiceActive?'RÉVISION':'AUJOURD’HUI'}</small><b>${practiceActive?score:gameProgress.score||0}<span>/${practiceActive?questions.length:dailyQuestions.length}</span></b></div><div><small>MEILLEUR</small><b>${Math.max(stats.best||0,done?gameProgress.score:0)}<span>/${dailyQuestions.length}</span></b></div><div><small>SÉRIE</small><b>${streak.current}<span> jours</span></b></div></aside></header><section class="quiz-layout">${questionView}${result}${practiceResult}<aside class="quiz-side"><div class="quiz-side-card"><span class="quiz-side-icon">✧</span><span class="quiz-kicker">PETIT RAPPEL</span><h3>La bonne réponse s’appuie sur le catalogue du jeu.</h3><p>Élément, arme, région ou Voie sont repris des données déjà présentes dans Astralis. Pas de lore inventé, pas de piège caché.</p><div class="quiz-side-rule"></div><small>${rosterCount(characters)} personnages dans ce roster</small></div>${masteryView}${weekView}${todayHistory}<div class="quiz-side-tip"><span>✦</span><p>Chaque univers a son propre défi et son propre record.</p></div></aside></section></main>`;
}

function rosterCount(characters) { return (characters||[]).length; }

export function mountDailyQuiz(root, game, characters, notify=()=>{}) {
  if(!root||root.dataset.quizBound)return;
  root.dataset.quizBound='true';
  root.addEventListener('click',event=>{const button=event.target.closest('[data-quiz-practice]');if(!button)return;const page=button.closest('[data-daily-quiz]'),activeGame=page?.dataset.quizGame||game,{progress,gameProgress,stats}=readState(activeGame,characters),mistakes=stats.mistakes||[],topic=button.dataset.quizPracticeTopic||``,queue=topic?quizTopicMistakes(mistakes,topic):mistakes;if(!queue.length)return;const questions=shuffled(queue,randomFor(hashSeed(`practice:${activeGame}:${gameProgress.day}:${topic}`)));gameProgress.practice={day:gameProgress.day,topic,questions,index:0,score:0,answers:[],hints:{}};writeProgress(progress);const holder=document.createElement('div');holder.innerHTML=renderDailyQuiz(activeGame,characters);const replacement=holder.firstElementChild;if(replacement){page.classList.add('is-leaving');const delay=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches?0:150;setTimeout(()=>{if(!page.isConnected)return;page.replaceWith(replacement);mountDailyQuiz(replacement,activeGame,characters,notify);},delay);}});
  root.addEventListener('click',event=>{
    const hintButton=event.target.closest('[data-quiz-hint]');if(!hintButton)return;
    const page=hintButton.closest('[data-daily-quiz]'),currentGame=page?.dataset.quizGame||game,{progress,gameProgress}=readState(currentGame,characters),practice=gameProgress.practice?.day===gameProgress.day&&gameProgress.practice.index<gameProgress.practice.questions?.length,session=practice?gameProgress.practice:gameProgress,question=session.questions?.[session.index];session.hints||={};if(!question||session.hints[String(session.index)])return;
    const hint=chooseQuizHint(currentGame,question.targetId,question.options,characters,question.label);if(!hint)return;
    session.hints[String(session.index)]=hint;writeProgress(progress);const revealed=document.createElement('aside');revealed.className='quiz-hint-revealed';revealed.setAttribute('aria-live','polite');revealed.innerHTML=`<span>✧</span><div><small>INDICE BONUS · ${Math.min(4,Number(hint.remaining)||4)}/4 portraits compatibles</small><b>${esc(hint.label)} · ${esc(hint.value)}</b></div>`;hintButton.replaceWith(revealed);return;
  });
  root.addEventListener('keydown',event=>{
    if(event.altKey||event.ctrlKey||event.metaKey||event.target?.closest('input,textarea,select,[contenteditable="true"]'))return;
    const digit=/^[1-4]$/.test(event.key)?Number(event.key):Number(String(event.code||'').match(/(?:Digit|Numpad)([1-4])$/)?.[1]);
    const index=digit-1;if(!Number.isInteger(index)||index<0||index>3)return;
    const page=event.target.closest('[data-daily-quiz]')||root,option=[...page.querySelectorAll('[data-quiz-answer]:not(:disabled)')][index];
    if(option){event.preventDefault();option.click();}
  });
  root.addEventListener('click',event=>{
    const button=event.target.closest('[data-quiz-answer]'); if(!button||button.disabled)return;
    const page=button.closest('[data-daily-quiz]'),currentGame=page?.dataset.quizGame||game;
    const {progress,gameProgress,stats}=readState(currentGame,characters),practice=gameProgress.practice?.day===gameProgress.day&&gameProgress.practice.index<gameProgress.practice.questions?.length,session=practice?gameProgress.practice:gameProgress,question=session.questions?.[session.index];
    if(!question)return;
    const correct=button.dataset.quizAnswer===question.targetId,person=question.options.find(option=>option.id===question.targetId),profile=(characters||[]).find(item=>String(item?._id??item?.id)===String(question.targetId)),explanation=quizExplanationFacts(currentGame,profile,question.label),buttons=[...page.querySelectorAll('[data-quiz-answer]')];
    for(const option of buttons){option.disabled=true;if(option.dataset.quizCorrect==='true')option.classList.add('is-correct');else if(option===button)option.classList.add('is-wrong');}
    const feedback=page.querySelector('[data-quiz-feedback]');if(feedback){feedback.classList.toggle('is-correct',correct);feedback.classList.toggle('is-wrong',!correct);const extra=explanation.length?`<small class="quiz-answer-context"><b>À retenir</b>${explanation.map(([label,value])=>`<span>${esc(label)} · ${esc(value)}</span>`).join('')}</small>`:'';feedback.innerHTML=(correct?`Exact ! <b>${esc(person?.name||'')}</b> correspond à cet indice.`:`Pas cette fois. La réponse était <b>${esc(person?.name||'')}</b>.`)+extra;}
    session.answers||=[];const selectedOption=question.options.find(option=>option.id===button.dataset.quizAnswer);session.answers.push({correct,name:person?.name||'',selectedId:button.dataset.quizAnswer,selectedName:selectedOption?.name||''});if(correct)session.score=(session.score||0)+1;if(!practice){stats.bestRun=Math.max(Number(stats.bestRun)||0,quizComboStats(session.answers).best);stats.topicStats||={};const topic=String(question.label||'').trim().slice(0,40);if(topic){const row=stats.topicStats[topic]||{attempts:0,correct:0};row.attempts=Math.max(0,Number(row.attempts)||0)+1;row.correct=Math.max(0,Number(row.correct)||0)+(correct?1:0);stats.topicStats[topic]=row;}}session.index++;
    if(practice){stats.mistakes=resolveQuizMistake(stats.mistakes,question.id,correct);}else if(!correct){const mistake=buildQuizMistake(question,{correct:false},gameProgress.day);if(mistake){stats.mistakes=[...(stats.mistakes||[]).filter(item=>String(item?.id)!==mistake.id),mistake].slice(-40);}}
    if(!practice&&gameProgress.index>=gameProgress.questions.length){
      const stats=progress.records[currentGame],day=gameProgress.day;
      stats.played=(stats.played||0)+1;stats.best=Math.max(stats.best||0,gameProgress.score||0);
      stats.history=Array.isArray(stats.history)?stats.history.filter(item=>item?.day!==day):[];
      stats.history.push({day,score:Number(gameProgress.score)||0,total:gameProgress.questions.length});stats.history=stats.history.slice(-90);
      const previous=new Date(`${stats.lastDay||'2000-01-01'}T12:00:00`),today=new Date(`${day}T12:00:00`),gap=Math.round((today-previous)/86400000);
      stats.streak=gap===1?(stats.streak||0)+1:stats.lastDay===day?(stats.streak||0):1;stats.lastDay=day;
    }
    writeProgress(progress);
    const next=page.querySelector('[data-quiz-next]');
    if(!next){const feedbackWrap=page.querySelector('[data-quiz-feedback]');if(feedbackWrap){const control=document.createElement('button');control.type='button';control.className='quiz-next-button';control.dataset.quizNext='';control.textContent=practice?(session.index>=session.questions.length?'Voir le bilan':'Question suivante'):(gameProgress.index>=gameProgress.questions.length?'Voir mon résultat':'Question suivante');feedbackWrap.insertAdjacentElement('afterend',control);}}
  });
  root.addEventListener('click', async event=>{
    const button=event.target.closest('[data-quiz-share]');if(!button)return;
    const page=button.closest('[data-daily-quiz]'),activeGame=page?.dataset.quizGame||game,{gameProgress,stats}=readState(activeGame,characters);
    const text=buildQuizShareText({game:activeGame,day:gameProgress.day,score:gameProgress.score,total:gameProgress.questions?.length||5,streak:stats.streak});
    try {
      if(navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
      else { const field=document.createElement('textarea');field.value=text;field.setAttribute('readonly','');field.style.position='fixed';field.style.opacity='0';document.body.append(field);field.select();const copied=document.execCommand('copy');field.remove();if(!copied)throw new Error('Clipboard unavailable'); }
      button.textContent='Résultat copié ✓';button.classList.add('is-copied');notify('Résultat prêt à partager · copié dans le presse-papiers.');
      setTimeout(()=>{if(button.isConnected){button.textContent='Copier mon résultat';button.classList.remove('is-copied');}},2200);
    } catch { notify('La copie automatique est indisponible sur cet appareil.'); }
  });
  root.addEventListener('click',event=>{const next=event.target.closest('[data-quiz-next]');if(!next)return;const page=next.closest('[data-daily-quiz]'),activeGame=page?.dataset.quizGame||game,{gameProgress}=readState(activeGame,characters),practiceSession=gameProgress.practice?.day===gameProgress.day,practiceActive=practiceSession&&gameProgress.practice.index<gameProgress.practice.questions?.length;if(!practiceSession&&!practiceActive&&gameProgress.index>=gameProgress.questions.length)notify('Défi terminé · ton résultat est enregistré sur cet appareil.');const holder=document.createElement('div');holder.innerHTML=renderDailyQuiz(activeGame,characters);const replacement=holder.firstElementChild;if(replacement){page.classList.add('is-leaving');const delay=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches?0:150;setTimeout(()=>{if(!page.isConnected)return;page.replaceWith(replacement);mountDailyQuiz(replacement,activeGame,characters,notify);},delay);}});
}
