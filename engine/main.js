// Renders one App Store screenshot into #canvas from URL params:
//   set=<url of set.json>  platform  locale  slot  [style theme accent | prompt=<prompt text>]
// Signals completion with window.__ready = true (or window.__error).
import { PLATFORMS } from './platforms.js';
import { parsePrompt, resolveSet } from './prompt.js';
import { loadStyle } from './styles/index.js';
import { device, deviceHeight, deviceWidthForHeight, crop, esc } from './frames.js';

const q = new URLSearchParams(location.search);

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ src, w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => reject(new Error(`image failed: ${src}`));
    img.src = src;
  });
}

const fill = (tpl, vars) => tpl.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);

export async function buildContext() {
  const setUrl = q.get('set');
  if (!setUrl) throw new Error('missing ?set=');
  const base = setUrl.slice(0, setUrl.lastIndexOf('/') + 1);
  const raw = await getJson(setUrl);
  const overrides = q.get('prompt') ? parsePrompt(q.get('prompt')) : {};
  for (const k of ['style', 'theme', 'accent']) if (q.get(k)) overrides[k] = q.get(k);
  const style = await loadStyle(overrides.style ?? raw.style);
  const set = resolveSet(raw, overrides, style.themes);
  const platform = q.get('platform') ?? set.platforms[0];
  const locale = q.get('locale') ?? set.locales[0];
  const index = Number(q.get('slot') ?? 0);
  if (!PLATFORMS[platform]) throw new Error(`unknown platform ${platform}`);
  if (!set.slots[index]) throw new Error(`no slot ${index}`);
  const { W, H } = PLATFORMS[platform];
  const copy = await getJson(`${base}copy/${locale}.json`);
  const otherTheme = set.theme === 'dark' ? 'light' : 'dark';
  const captureUrl = (id, theme = set.theme) => base + fill(set.capture, { platform, locale, theme, id });
  const slots = set.slots.map((s, i) => ({ ...s, index: i, ...(copy.slots[s.id] ?? {}), capture: captureUrl(s.id) }));
  const slot = slots[index];
  const capture = await loadImage(slot.capture);
  const captureAlt = set.capture.includes('{theme}') ? await loadImage(captureUrl(slot.id, otherTheme)).catch(() => null) : null;

  const ctx = {
    style, set, platform, locale, W, H, index, count: slots.length,
    theme: set.theme, accent: set.accent, role: slot.role, slot, slots,
    app: { ...set.app, icon: set.app.icon ? base + set.app.icon : null },
    features: copy.features ?? [], stat: copy.stat ?? null, tagline: copy.tagline ?? '',
    capture, captureAlt,
    u: n => n * W / 100, // percent of canvas width, in px
    v: n => n * H / 100, // percent of canvas height, in px
    esc,
  };
  ctx.device = (opts) => device(ctx, opts);
  ctx.deviceHeight = (width, opts) => deviceHeight(ctx, width, opts);
  ctx.deviceWidthForHeight = (height, opts) => deviceWidthForHeight(ctx, height, opts);
  ctx.crop = (opts) => crop(ctx, opts);
  return ctx;
}

// Shrinks [data-fit] text until it fits: data-fit="N" caps it at N lines, data-fit="" fits its box.
function fitText(root) {
  const warnings = [];
  for (const el of root.querySelectorAll('[data-fit]')) {
    const cs = getComputedStyle(el);
    let size = parseFloat(cs.fontSize);
    const min = size * 0.4;
    const lines = Number(el.dataset.fit);
    const lineH = () => { const lh = parseFloat(getComputedStyle(el).lineHeight); return Number.isFinite(lh) ? lh : size * 1.2; };
    const over = () => lines
      ? el.getBoundingClientRect().height > lineH() * lines + 1 || el.scrollWidth > el.clientWidth + 1
      : el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1;
    while (over() && size > min) { size *= 0.96; el.style.fontSize = `${size}px`; }
    if (over()) warnings.push(`text overflow: "${el.textContent.slice(0, 40)}"`);
  }
  return warnings;
}

async function settle(root) {
  await document.fonts.ready;
  const imgs = [...root.querySelectorAll('img')].map(i => i.complete ? null : new Promise(r => { i.onload = i.onerror = r; }));
  const bgs = [...root.querySelectorAll('[style*="url("]')]
    .map(el => el.style.backgroundImage.match(/url\("?(.*?)"?\)/)?.[1]).filter(Boolean)
    .map(src => loadImage(src).catch(() => null));
  await Promise.all([...imgs, ...bgs]);
}

async function main() {
  const canvas = document.getElementById('canvas');
  try {
    const ctx = await buildContext();
    const { style, W, H, theme, accent } = ctx;
    const pal = style.palette[theme];
    const fonts = style.fonts;
    const stack = f => `${f}, 'Noto Sans JP', sans-serif`;
    canvas.className = `sb sb-${style.id} sb-${ctx.platform} sb-${theme} sb-role-${ctx.role}`;
    canvas.lang = ctx.locale;
    canvas.style.cssText = `width:${W}px;height:${H}px;` +
      Object.entries(pal).map(([k, val]) => `--${k}:${val};`).join('') +
      `--accent:${accent};--font-display:${stack(fonts.display)};--font-text:${stack(fonts.text)};--font-mono:${stack(fonts.mono ?? "'JetBrains Mono'")};`;
    document.getElementById('style-css').textContent =
      `#canvas:lang(ja) { word-break: auto-phrase; line-break: strict; }\n` + style.css(ctx);
    canvas.innerHTML = style.render(ctx);
    await settle(canvas);
    window.__warnings = fitText(canvas);
    await document.fonts.ready;
    window.__meta = { style: style.id, theme, accent, platform: ctx.platform, locale: ctx.locale, slot: ctx.index, W, H };
    window.__ready = true;
  } catch (err) {
    window.__error = String(err.stack ?? err);
    canvas.outerHTML = `<pre id="error">${esc(window.__error)}</pre>`;
  }
}

main();
