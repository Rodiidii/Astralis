export function rotationGroupRange(rotation, index) {
  if (!Array.isArray(rotation) || !Number.isInteger(index) || index < 0 || index >= rotation.length) return null;
  const action = rotation[index];
  if (action?.type === 'comboStart') {
    const end = rotation.findIndex((item, i) => i > index && item?.type === 'comboEnd' && item.comboId === action.comboId);
    return { start: index, end: end < 0 ? index : end };
  }
  if (action?.type === 'comboEnd') {
    let start = -1;
    for (let i = index - 1; i >= 0; i--) if (rotation[i]?.type === 'comboStart' && rotation[i].comboId === action.comboId) { start = i; break; }
    return start < 0 ? { start: index, end: index } : { start, end: index };
  }
  let open = null;
  for (let i = 0; i < index; i++) {
    if (rotation[i]?.type === 'comboStart') open = i;
    else if (rotation[i]?.type === 'comboEnd' && rotation[i].comboId === rotation[open]?.comboId) open = null;
  }
  if (open !== null) {
    const end = rotation.findIndex((item, i) => i > open && item?.type === 'comboEnd' && item.comboId === rotation[open].comboId);
    return { start: open, end: end < 0 ? index : end };
  }
  return { start: index, end: index };
}

export function moveRotationGroup(rotation, fromIndex, toIndex) {
  if (!Array.isArray(rotation) || !Number.isInteger(toIndex) || toIndex < 0 || toIndex >= rotation.length) return rotation;
  const from = rotationGroupRange(rotation, fromIndex);
  const to = rotationGroupRange(rotation, toIndex);
  if (!from || !to || from.start === to.start) return rotation;
  const moving = rotation.slice(from.start, from.end + 1);
  const target = rotation.slice(to.start, to.end + 1);
  const rest = rotation.slice();
  rest.splice(from.start, moving.length);
  const targetStart = from.end < to.start ? to.start - moving.length : to.start;
  const insertAt = from.start < to.start ? targetStart + target.length : targetStart;
  rest.splice(insertAt, 0, ...moving);
  return rest;
}
