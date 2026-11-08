export function wishPullPresentation(row = {}) {
  const banner = row.banner === 'weapon' ? 'weapon' : row.banner === 'permanent' ? 'permanent' : 'character';
  const result = String(row.result || '').toLowerCase();
  const cap = banner === 'weapon' ? 80 : 90;
  const pity = Math.max(0, Number(row.pity) || 0);
  const kind = result === 'radiance'
    ? 'radiance'
    : result === 'lost' || (banner !== 'permanent' && result === 'permanent')
      ? 'lost'
      : result === 'permanent' || banner === 'permanent'
        ? 'standard'
        : 'won';
  return { kind, cap, shade: Math.max(.12, Math.min(.74, pity / cap * .74)) };
}
