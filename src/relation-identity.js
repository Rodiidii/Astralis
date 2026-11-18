export function relationId(value) {
  const id = String(value);
  return /^(?:1000000[57](?:[-_].*)?|(?:aether|lumine|traveler|voyageur|voyageuse)(?:[-_].*)?)$/i.test(id) ? '10000005' : id;
}

export function isTravelerVariant(character = {}) {
  return relationId(character.id ?? character._id) === '10000005' ||
    /^(?:traveler|voyageur|voyageuse|aether|lumine)(?:$|[ ·_-])/i.test(character._name || character.name || '') ||
    /^UI_AvatarIcon_Player(?:Boy|Girl)(?:$|_)/i.test(character.images?.filename_icon || '');
}
