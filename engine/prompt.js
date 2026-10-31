// The one-line prompt shown under every style. Generated from set + style data, parsed back by
// the skill and the renderer, so the gallery and the output can never drift apart.
const KEYS = ['style', 'theme', 'accent', 'platforms', 'locales'];

export function toPrompt({ style, theme, accent, platforms, locales }, summary) {
  const parts = [`/shot-butcher style=${style}`, `theme=${theme}`, `accent=${accent}`];
  if (platforms?.length) parts.push(`platforms=${platforms.join(',')}`);
  if (locales?.length) parts.push(`locales=${locales.join(',')}`);
  return summary ? `${parts.join(' ')}\n${summary}` : parts.join(' ');
}

export function parsePrompt(text) {
  const line = String(text).split('\n').find(l => l.trim().startsWith('/shot-butcher'));
  if (!line) throw new Error('no /shot-butcher line in prompt');
  const out = {};
  for (const token of line.trim().split(/\s+/).slice(1)) {
    const eq = token.indexOf('=');
    if (eq < 1) continue;
    const key = token.slice(0, eq);
    const value = token.slice(eq + 1);
    if (!KEYS.includes(key)) throw new Error(`unknown prompt key "${key}"`);
    out[key] = key === 'platforms' || key === 'locales' ? value.split(',').filter(Boolean) : value;
  }
  if (!out.style) throw new Error('prompt has no style=');
  if (out.theme && !['light', 'dark'].includes(out.theme)) throw new Error(`theme must be light or dark, got "${out.theme}"`);
  if (out.accent && !/^#[0-9a-fA-F]{6}$/.test(out.accent)) throw new Error(`accent must be #rrggbb, got "${out.accent}"`);
  return out;
}

// Merge prompt overrides into a set definition, resolving the theme against what the style supports.
export function resolveSet(set, overrides, styleThemes) {
  const merged = { ...set, ...overrides };
  merged.accent = normalizeAccent(merged.accent);
  if (styleThemes && !styleThemes.includes(merged.theme)) merged.theme = styleThemes[0];
  return merged;
}

// "#abc" -> "#aabbcc"; anything that is not a hex colour is an error, since styles derive hues from it.
export function normalizeAccent(accent) {
  const a = String(accent ?? '').trim();
  if (/^#[0-9a-fA-F]{6}$/.test(a)) return a;
  if (/^#[0-9a-fA-F]{3}$/.test(a)) return '#' + [...a.slice(1)].map(c => c + c).join('');
  throw new Error(`accent must be #rrggbb, got "${accent}"`);
}
