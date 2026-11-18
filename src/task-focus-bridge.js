const CATEGORY_MODE = new Map([
  ['farm', 'farm'], ['matériaux', 'farm'], ['reliques', 'farm'], ['arme', 'farm'],
  ['build', 'build'], ['équipe', 'team'], ['endgame', 'boss'], ['exploration', 'explore'],
]);

export function buildTaskFocusDraft(task, game = 'gi') {
  if (!task || typeof task !== 'object' || task.done) return null;
  const title = String(task.title || '').trim().slice(0, 80);
  if (!title || !['gi', 'hsr', 'ww'].includes(game)) return null;
  const category = String(task.category || '').trim().toLocaleLowerCase('fr');
  const rawSteps = Array.isArray(task.steps) ? task.steps : [];
  const pendingSteps = rawSteps
    .filter(step => step && typeof step === 'object' && !step.done)
    .map((step, index) => ({ id: String(step.id || `step-${index}`).slice(0, 100), title: String(step.title || '').trim().slice(0, 120) }))
    .filter(step => step.title)
    .slice(0, 12);
  return {
    id: String(task.id || ''), game,
    mode: CATEGORY_MODE.get(category) || 'free',
    title,
    characterId: String(task.character || '').slice(0, 100),
    characterName: String(task.characterName || '').slice(0, 80),
    tasks: pendingSteps.map(step => step.title),
    stepLinks: pendingSteps,
  };
}
