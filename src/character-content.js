const COLOR_TAG = /<color=(#[\da-f]{6}(?:[\da-f]{2})?)>|<\/color>|\n/ig;

function escapeText(value) {
  return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

export function renderGameText(value) {
  const text = String(value ?? '').replace(/\\n/g, '\n').replace(/\r\n?/g, '\n');
  let html = '', cursor = 0, openColors = 0;
  for (const match of text.matchAll(COLOR_TAG)) {
    html += escapeText(text.slice(cursor, match.index));
    const token = match[0];
    if (token === '\n') html += '<br>';
    else if (match[1]) { html += `<span style="color:${match[1]}">`; openColors++; }
    else if (openColors) { html += '</span>'; openColors--; }
    cursor = match.index + token.length;
  }
  html += escapeText(text.slice(cursor));
  while (openColors-- > 0) html += '</span>';
  return html;
}

function levelTen(value) {
  if (Array.isArray(value)) return value.length >= 10 ? value[9] : value.length === 1 ? value[0] : value.join(' / ');
  if (value && typeof value === 'object') {
    if (value[10] != null || value['10'] != null) return value[10] ?? value['10'];
    const levels = Object.keys(value).filter(key => /^\d+$/.test(key)).map(Number).sort((a, b) => a - b);
    const selected = levels.filter(level => level <= 10).at(-1) ?? levels.at(-1);
    return selected == null ? JSON.stringify(value) : value[selected] ?? value[String(selected)];
  }
  return value;
}

export function talentValuesAtLevel(multipliers, level = 10) {
  if (!multipliers || typeof multipliers !== 'object') return [];
  return Object.entries(multipliers).map(([label, raw]) => {
    const value = level === 10 ? levelTen(raw) : Array.isArray(raw) && raw.length >= level ? raw[level - 1] : raw;
    const shown = value == null ? '—' : Array.isArray(value) ? value.join(' / ') : String(value);
    return `${label} · Niv. ${level} : ${shown}`;
  });
}
