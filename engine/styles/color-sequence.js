// Color Sequence: one fixed, centred layout on every shot; each shot takes the next colour of a
// 6-step hue sequence derived from the accent. Flat saturated fields, ink picked per colour for contrast.
// The sequence is the same in both themes; the theme sets the device treatment (light: soft shadow,
// dark: dark captures on Mac plus a tinted glow and deep shadow behind the device).
const id = 'color-sequence';

const STEP = 36;   // degrees between neighbours in the sequence
const N = 6;

function hexToHsl(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16 & 255) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > .5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}
function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360 / 360;
  const f = t => {
    t = (t + 1) % 1;
    const q = l < .5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    return t < 1 / 6 ? p + (q - p) * 6 * t : t < .5 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p;
  };
  return [f(h + 1 / 3), f(h), f(h - 1 / 3)].map(x => Math.round(x * 255));
}
const hex = rgb => '#' + rgb.map(x => x.toString(16).padStart(2, '0')).join('');
const lum = rgb => {
  const [r, g, b] = rgb.map(c => { c /= 255; return c <= .03928 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4; });
  return .2126 * r + .7152 * g + .0722 * b;
};
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + .05) / (y + .05); };

// The sequence: same saturation band for every step so the set reads as one family.
function sequence(accent) {
  const [h0, s0] = hexToHsl(accent);
  return Array.from({ length: N }, (_, i) => {
    const h = h0 + i * STEP;
    const s = Math.min(.74, Math.max(.6, s0));
    const bg = hslToRgb(h, s, .56);
    const glow = hslToRgb(h, .95, .6);
    const dark = [17, 17, 20], light = [255, 255, 255];
    const ink = contrast(bg, dark) >= contrast(bg, light) ? dark : light;
    return { bg: hex(bg), glow: `rgba(${glow.join(',')},.55)`, ink: hex(ink), inkRgb: ink.join(',') };
  });
}

export default {
  id,
  name: 'Color Sequence',
  summary: 'Identical centred layout on every shot, each on the next flat colour of a six-step hue sequence from the accent, with a chip row marking its place; ink flips per colour for contrast; dark theme adds a tinted glow behind the device.',
  themes: ['light', 'dark'],
  fonts: { display: "'Inter Tight'", text: "'Inter Tight'" },
  palette: {
    light: { bg: '#F2F2F2', ink: '#111114', muted: 'rgba(17,17,20,.72)' },
    dark: { bg: '#121216', ink: '#FFFFFF', muted: 'rgba(255,255,255,.75)' },
  },

  css: ({ u, platform }) => {
    const P = {
      mac: { top: u(3.6), chip: u(1.1), head: u(4.3), sub: u(1.45), w: u(68), gap: u(1.4) },
      iphone: { top: u(9), chip: u(3.2), head: u(10.6), sub: u(3.7), w: u(88), gap: u(4) },
      ipad: { top: u(6.5), chip: u(2), head: u(7), sub: u(2.4), w: u(82), gap: u(2.6) },
    }[platform];
    return `
.sb-${id} .field { position: absolute; inset: 0; background: var(--c-bg); color: var(--c-ink); }
.sb-${id} .top { position: absolute; left: 50%; top: ${P.top}px; width: ${P.w}px; transform: translateX(-50%); text-align: center; }
.sb-${id} .chips { display: flex; justify-content: center; gap: ${P.chip * .45}px; }
.sb-${id} .chips i { display: block; width: ${P.chip}px; height: ${P.chip}px; border-radius: 99px; background: var(--chip); box-shadow: 0 0 0 ${Math.max(2, P.chip * .12)}px rgba(var(--c-ink-rgb), .28); }
.sb-${id} .chips i.on { width: ${P.chip * 3.2}px; box-shadow: 0 0 0 ${Math.max(3, P.chip * .16)}px var(--c-ink); }
.sb-${id} .kicker { display: block; margin-top: ${P.gap * 1.2}px; font: 700 ${P.sub * .78}px/1.2 var(--font-text); letter-spacing: .14em; text-transform: uppercase; opacity: .78; }
.sb-${id} h1 { display: block; margin-top: ${P.gap * .45}px; font: 900 ${P.head}px/1.0 var(--font-display); letter-spacing: -.022em; }
.sb-${id} .sub { display: block; margin: ${P.gap * .75}px auto 0; max-width: 88%; font: 500 ${P.sub}px/1.36 var(--font-text); opacity: .84; }
.sb-${id} .dev { position: absolute; left: 50%; transform: translateX(-50%); }
`;
  },

  render(ctx) {
    const { platform, slot, esc, u, v, index, accent, theme } = ctx;
    const seq = sequence(accent);
    const c = seq[index % N];
    const L = {
      mac: { w: u(68), top: v(39) },
      iphone: { w: u(84), top: v(38) },
      ipad: { w: u(76), top: v(37) },
    }[platform];
    const shadow = theme === 'dark'
      ? (platform === 'mac' ? `drop-shadow(0 0 ${u(4)}px ${c.glow}) drop-shadow(0 30px 60px rgba(0,0,0,.5))` : `0 0 ${u(9)}px ${c.glow}, 0 40px 90px rgba(0,0,0,.5)`)
      : undefined;
    const chips = Array.from({ length: ctx.count }, (_, i) => `<i class="${i === index ? 'on' : ''}" style="--chip:${seq[i % N].bg}"></i>`).join('');
    return `<div class="field" style="--c-bg:${c.bg};--c-ink:${c.ink};--c-ink-rgb:${c.inkRgb}">
      <div class="top">
        <div class="chips">${chips}</div>
        <div class="kicker">${esc(slot.kicker)}</div>
        <h1 data-fit="3">${esc(slot.headline)}</h1>
        <div class="sub" data-fit="2">${esc(slot.sub)}</div>
      </div>
      <div class="dev" style="top:${L.top}px">${ctx.device({ width: L.w, ...(shadow ? { shadow } : {}) })}</div>
    </div>`;
  },
};
