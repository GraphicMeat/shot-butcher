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

// Shrinks [data-fit] text until it fits: data-fit="N" caps it at N lines (content box, padding excluded),
// data-fit="" fits its own box. Glyph overhang from tight line-heights is tolerated.
function fitText(root) {
  const warnings = [];
  for (const el of root.querySelectorAll('[data-fit]')) {
    let size = parseFloat(getComputedStyle(el).fontSize);
    const min = size * 0.4;
    const lines = Number(el.dataset.fit);
    const over = () => {
      const cs = getComputedStyle(el);
      const fs = parseFloat(cs.fontSize);
      const slack = Math.max(1, fs * 0.12);
      if (el.scrollWidth > el.clientWidth + 1) return true;
      if (lines) {
        const lh = parseFloat(cs.lineHeight);
        const lineH = Number.isFinite(lh) ? lh : fs * 1.2;
        const pad = ['paddingTop', 'paddingBottom', 'borderTopWidth', 'borderBottomWidth'].reduce((n, k) => n + parseFloat(cs[k]), 0);
        return el.getBoundingClientRect().height - pad > lineH * lines + slack;
      }
      return el.scrollHeight > el.clientHeight + slack;
    };
    while (over() && size > min) { size *= 0.96; el.style.fontSize = `${size}px`; }
    if (over()) warnings.push(`text overflow: "${el.textContent.slice(0, 40)}"`);
  }
  return warnings;
}

// Minimum headline size that stays readable as an App Store thumbnail (px on the canvas).
const HEADLINE_FLOOR = { mac: 75, iphone: 86, ipad: 72 };

// Layout checks that zero overflow warnings cannot catch: headline shrunk below the thumbnail floor,
// text off the canvas, text over a device. Mark intentional overlaps with data-overlap-ok on the text
// or an ancestor.
function checkLayout(root, platform) {
  const warnings = [];
  const box = root.getBoundingClientRect();
  const label = el => `"${el.textContent.trim().slice(0, 30)}"`;
  for (const h of root.querySelectorAll('h1')) {
    const fs = parseFloat(getComputedStyle(h).fontSize);
    if (fs < HEADLINE_FLOOR[platform]) warnings.push(`headline too small: ${Math.round(fs)}px < ${HEADLINE_FLOOR[platform]}px ${label(h)}`);
  }
  // A device's visible area: its box clipped by every overflow-hiding ancestor up to the canvas.
  const visible = el => {
    let { left, top, right, bottom } = el.getBoundingClientRect();
    for (let p = el.parentElement; p && p !== root.parentElement; p = p.parentElement) {
      if (getComputedStyle(p).overflow === 'visible') continue;
      const c = p.getBoundingClientRect();
      left = Math.max(left, c.left); top = Math.max(top, c.top); right = Math.min(right, c.right); bottom = Math.min(bottom, c.bottom);
    }
    return { left, top, right, bottom };
  };
  const devices = [...root.querySelectorAll('.sb-device')].map(visible).filter(d => d.right > d.left && d.bottom > d.top);
  for (const t of root.querySelectorAll('[data-fit]')) {
    if (!t.textContent.trim()) continue;
    const a = t.getBoundingClientRect();
    if (a.left < box.left - 1 || a.top < box.top - 1 || a.right > box.right + 1 || a.bottom > box.bottom + 1) warnings.push(`text off canvas: ${label(t)}`);
    if (t.closest('[data-overlap-ok]')) continue;
    if (devices.some(d => a.right > d.left + 2 && a.left < d.right - 2 && a.bottom > d.top + 2 && a.top < d.bottom - 2)) warnings.push(`text over device: ${label(t)}`);
  }
  return warnings;
}

async function settle(root) {
  await document.fonts.ready;
  const imgs = [...root.querySelectorAll('img')].map(i => i.complete ? null : new Promise(r => { i.onload = i.onerror = r; }));
  const urls = new Set();
  for (const el of [root, ...root.querySelectorAll('*')]) {
    for (const m of getComputedStyle(el).backgroundImage.matchAll(/url\("?(.*?)"?\)/g)) urls.add(m[1]);
  }
  await Promise.all([...imgs, ...[...urls].map(src => loadImage(src).catch(() => null))]);
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
    window.__warnings.push(...checkLayout(canvas, ctx.platform));
    window.__meta = { style: style.id, theme, accent, platform: ctx.platform, locale: ctx.locale, slot: ctx.index, W, H };
    window.__ready = true;
  } catch (err) {
    window.__error = String(err.stack ?? err);
    canvas.outerHTML = `<pre id="error">${esc(window.__error)}</pre>`;
  }
}

main();
