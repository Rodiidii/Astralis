const clone = value => JSON.parse(JSON.stringify(Array.isArray(value) ? value : []));

export function saveRotationVariant(team, name, id = '') {
  if (!team || typeof team !== 'object') return null;
  const label = String(name || '').trim().slice(0, 48);
  if (!label) return null;
  team.rotationVariants = Array.isArray(team.rotationVariants) ? team.rotationVariants : [];
  const active = team.rotationVariants.find(row => String(row.id) === String(team.activeRotationVariantId || ''));
  if (active && String(active.id) !== String(id || '')) active.actions = clone(team.rotation);
  else if (!active && !id) team.rotationManualDraft = clone(team.rotation);
  let variant = id ? team.rotationVariants.find(row => String(row.id) === String(id)) : null;
  if (!variant) {
    variant = { id: `rotation-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`, name: label, actions: [] };
    team.rotationVariants.push(variant);
  }
  variant.name = label;
  variant.actions = clone(team.rotation);
  variant.updatedAt = Date.now();
  team.activeRotationVariantId = variant.id;
  return variant;
}

export function selectRotationVariant(team, id = '') {
  if (!team || typeof team !== 'object') return false;
  const variants = Array.isArray(team.rotationVariants) ? team.rotationVariants : [];
  const currentId = String(team.activeRotationVariantId || '');
  const nextId = String(id || '');
  if (currentId === nextId) return false;
  const target = nextId ? variants.find(row => String(row.id) === nextId) : null;
  if (nextId && !target) return false;
  if (currentId) {
    const current = variants.find(row => String(row.id) === currentId);
    if (current) current.actions = clone(team.rotation);
  } else team.rotationManualDraft = clone(team.rotation);
  if (!nextId) {
    team.activeRotationVariantId = '';
    team.rotation = clone(team.rotationManualDraft);
    return true;
  }
  team.activeRotationVariantId = target.id;
  team.rotation = clone(target.actions);
  return true;
}

export function deleteRotationVariant(team, id = '') {
  if (!team || !Array.isArray(team.rotationVariants)) return false;
  const index = team.rotationVariants.findIndex(row => String(row.id) === String(id));
  if (index < 0) return false;
  const wasActive = String(team.activeRotationVariantId || '') === String(id);
  team.rotationVariants.splice(index, 1);
  if (wasActive) {
    team.activeRotationVariantId = '';
    team.rotation = clone(team.rotationManualDraft);
  }
  return true;
}
