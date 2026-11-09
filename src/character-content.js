export { renderGameText } from './rich-text.js';
import { renderGameText } from './rich-text.js';

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

export function skillValuesAtLevel(skill, fallback = [], level = 10) {
  const attributes = skill?.attributes || skill?.combat?.attributes;
  const parameters = attributes?.parameters;
  if (Array.isArray(attributes?.labels) && parameters && typeof parameters === 'object') {
    const keys = Object.keys(parameters);
    const rows = attributes.labels.map((label, index) => {
      const key = parameters[`param${index + 1}`] != null ? `param${index + 1}`
        : parameters[`param${index}`] != null ? `param${index}` : keys[index];
      return key ? [label, parameters[key]] : null;
    }).filter(Boolean);
    if (rows.length) return talentValuesAtLevel(Object.fromEntries(rows), level);
  }
  if (skill?.multipliers && typeof skill.multipliers === 'object') return talentValuesAtLevel(skill.multipliers, level);
  if (Array.isArray(skill?.values) && skill.values.some(value => Array.isArray(value) || (value && typeof value === 'object'))) {
    return talentValuesAtLevel(Object.fromEntries(skill.values.map((value, index) => [value.label || `Valeur ${index + 1}`, value.values || value.value || value])), level);
  }
  if (Array.isArray(skill?.values) && skill.values.length) return skill.values;
  return Array.isArray(fallback) ? fallback : [];
}
