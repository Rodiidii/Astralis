const ESCAPE = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const escapeText = value => String(value).replace(/[&<>"']/g, character => ESCAPE[character]);
const COLOR = /^#(?:[\da-f]{6}|[\da-f]{8})$/i;
const INLINE_TOKEN = /\{LINK#[^}]+\}|\{\/LINK\}|<\/?(?:color(?:=[^>]+)?|b|i|u|size(?:=[^>]+)?|br|sprite(?:\s+name=|=)[^>]+|sprite)\s*\/?\s*>|\{[A-Za-z_$][\w$]*(?::[A-Za-z0-9]+)?\}|\\n|\r\n?|\n/gi;

function resolveValue(key, values, level) {
  if (!values || typeof values !== 'object') return undefined;
  const raw = values[key];
  if (Array.isArray(raw)) return raw[Math.min(Math.max(level - 1, 0), raw.length - 1)];
  if (raw && typeof raw === 'object') return raw[level] ?? raw[String(level)] ?? raw.value;
  return raw;
}

function formatParameter(value, format) {
  if (value == null || value === '') return '—';
  const raw = String(value);
  const alreadyPercent = /%$/.test(raw);
  const numeric = Number(raw.replace(/%$/, ''));
  if (!Number.isFinite(numeric) || !format) return String(value);
  const percent = /P$/i.test(format);
  const decimals = Number((format.match(/F(\d+)/i) || [])[1] ?? 0);
  const amount = percent && !alreadyPercent ? numeric * 100 : numeric;
  return `${amount.toLocaleString('fr-FR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${percent ? '%' : ''}`;
}

/** Renders game-sourced text with a strict tag allowlist; never parses source HTML. */
export function renderGameText(value, options = {}) {
  const text = String(value ?? '').replace(/\\n/g, '\n').replace(/\r\n?/g, '\n');
  const values = options.parameters ?? options.params ?? {};
  const level = Math.max(1, Number(options.level) || 10);
  let html = '', cursor = 0;
  const stack = [];
  const closeTag = tag => {
    const index = stack.lastIndexOf(tag);
    if (index >= 0) html += stack.splice(index, 1)[0];
  };
  for (const match of text.matchAll(INLINE_TOKEN)) {
    html += escapeText(text.slice(cursor, match.index));
    const token = match[0];
    const lower = token.toLowerCase();
    if (token === '\\n' || token === '\n' || token === '\r' || token === '\r\n') html += '<br>';
    else if (lower === '<br>' || lower === '<br/>' || lower === '<br />') html += '<br>';
    else if (/^\{LINK#/i.test(token) || lower === '{/link}') { /* source link labels are retained as plain text */ }
    else if (/^\{[A-Za-z_$]/.test(token)) {
      const [, key, format] = token.match(/^\{([\w$]+)(?::([A-Za-z0-9]+))?\}$/) || [];
      html += escapeText(key ? formatParameter(resolveValue(key, values, level), format) : '—');
    } else if (/^<color=/i.test(token)) {
      const color = token.slice(7, -1).trim();
      if (COLOR.test(color)) { html += `<span style="color:${color}">`; stack.push('</span>'); }
      else html += escapeText(token);
    } else if (lower === '</color>') closeTag('</span>');
    else if (/^<(b|i|u)>$/i.test(token)) {
      const tag = lower.slice(1, -1); html += `<${tag}>`; stack.push(`</${tag}>`);
    } else if (/^<\/(b|i|u)>$/i.test(token)) {
      const tag = lower.slice(2, -1); const at = stack.lastIndexOf(`</${tag}>`);
      if (at >= 0) { html += stack.splice(at, 1)[0]; }
    } else if (/^<size=/i.test(token)) {
      const amount = Number(token.slice(6, -1));
      if (Number.isFinite(amount)) { html += `<span style="font-size:${Math.min(48, Math.max(8, amount))}px">`; stack.push('</span>'); }
      else html += escapeText(token);
    } else if (lower === '</size>') closeTag('</span>');
    else if (/^<sprite/i.test(token)) {
      const sprite = token.match(/^<sprite(?:=|\s+name=)([\w.-]+)\s*\/?\s*>$/i)?.[1];
      html += sprite ? `<span class="game-sprite" role="img" aria-label="${escapeText(sprite)}">✦</span>` : escapeText(token);
    } else html += escapeText(token);
    cursor = match.index + token.length;
  }
  html += escapeText(text.slice(cursor));
  while (stack.length) html += stack.pop();
  return html.replace(/(?:<br>){3,}/g, '<br><br>');
}
