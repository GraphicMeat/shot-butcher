// Panorama: the set is one continuous strip, count x W wide. Every slot renders the same strip
// (background, ribbon and devices placed in strip coordinates) offset by -index*W, so the seams
// are pixel-continuous. Odd slots push their device across the seam into the next slot; the
// headline of each slot always stays inside its own slot.
const id = 'panorama';

// Geometry in fractions of W (x, widths) and H (y). 'A' = device inside its slot, 'S' = device
// straddling the seam into the next slot. sliverGap: where an 'A' device starts when the previous
// slot's straddler pokes into this one.
const G = {
  mac: {
    devW: 0.56,
    A: { left: 0.22, leftAfterSliver: 0.31, top: 0.39, rot: 0 },
    S: { left: 0.63, top: 0.11, rot: 0 },
    headA: { top: 0.075, bottomGap: 0.035, width: 0.62 },
    headS: { left: 0.065, width: 0.5, top: 0.56, bottom: 0.93 },
    h1: 3.8, sub: 1.4, kick: 0.95, lines: 2, subLines: 2,
    band: { base: 0.56, amp: 0.15, thick: 0.13 },
  },
  iphone: {
    devW: 0.64,
    A: { left: 0.18, leftAfterSliver: 0.31, top: 0.385, rot: 0 },
    S: { left: 0.55, top: 0.36, rot: 5 },
    headA: { top: 0.06, width: 0.84 },
    h1: 8.2, sub: 3.6, kick: 2.6, lines: 3, subLines: 3,
    band: { base: 0.64, amp: 0.1, thick: 0.1 },
  },
  ipad: {
    devW: 0.6,
    A: { left: 0.2, leftAfterSliver: 0.31, top: 0.37, rot: 0 },
    S: { left: 0.58, top: 0.35, rot: 4 },
    headA: { top: 0.06, width: 0.84 },
    h1: 5.9, sub: 2.4, kick: 1.6, lines: 2, subLines: 2,
    band: { base: 0.63, amp: 0.1, thick: 0.1 },
  },
};

// Colour helpers (deterministic, from the set accent).
const hex2rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
const rgb2hex = c => '#' + c.map(v => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, '0')).join('');
function rgb2hsl([r, g, b]) {
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min, s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h / 6, s, l];
}
function hsl2rgb([h, s, l]) {
  if (!s) return [l, l, l];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
  const f = t => { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; };
  return [f(h + 1 / 3), f(h), f(h - 1 / 3)];
}
const shiftHue = (hex, deg, dl = 0) => { const [h, s, l] = rgb2hsl(hex2rgb(hex)); return rgb2hex(hsl2rgb([(h + deg / 360 + 1) % 1, s, Math.min(0.85, Math.max(0.2, l + dl))])); };

const straddles = (j, count) => j % 2 === 1 && j < count - 1;

// Device box for slot j in strip pixels.
function devBox(ctx, j) {
  const g = G[ctx.platform];
  const w = ctx.W * g.devW;
  const h = ctx.deviceHeight(w);
  const kind = straddles(j, ctx.count) ? 'S' : 'A';
  const k = g[kind];
  const left = kind === 'A' && j > 0 && straddles(j - 1, ctx.count) ? k.leftAfterSliver : k.left;
  return { x: j * ctx.W + left * ctx.W, y: k.top * ctx.H, w, h, rot: k.rot, kind };
}

// The ribbon: two offset sine bands across the whole strip, period 2W so the rhythm alternates per slot.
function ribbon(ctx, phase, thickMul) {
  const { W, H, count } = ctx;
  const b = G[ctx.platform].band;
  const total = W * count;
  const step = W / 48;
  const top = [], bot = [];
  for (let x = 0; x <= total + 0.5; x += step) {
    const t = Math.PI * x / W + phase;
    const yc = H * (b.base + b.amp * Math.sin(t));
    const th = H * b.thick * thickMul * (0.75 + 0.25 * Math.cos(t * 0.5));
    top.push(`${x.toFixed(1)},${(yc - th / 2).toFixed(1)}`);
    bot.push(`${x.toFixed(1)},${(yc + th / 2).toFixed(1)}`);
  }
  return `M${top.join(' L')} L${bot.reverse().join(' L')} Z`;
}

export default {
  id,
  name: 'Panorama',
  summary: 'One continuous strip across the set: a flowing accent ribbon runs through every seam and alternate devices straddle the seam into the next shot.',
  themes: ['dark', 'light'],
  fonts: { display: "'Space Grotesk'", text: "'Space Grotesk'" },
  palette: {
    light: { bg: '#F3F1EC', ink: '#121318', muted: '#555B66', line: 'rgba(18,19,24,.10)' },
    dark: { bg: '#0A0B0F', ink: '#F4F4F6', muted: '#A0A6B2', line: 'rgba(255,255,255,.10)' },
  },

  css: (ctx) => {
    const { u, platform, W, H, count, index } = ctx;
    const g = G[platform];
    const dark = ctx.theme === 'dark';
    return `
.sb-${id} .strip { position: absolute; top: 0; left: ${-index * W}px; width: ${W * count}px; height: ${H}px;
  background: linear-gradient(90deg, color-mix(in oklab, var(--accent) ${dark ? 9 : 7}%, var(--bg)), var(--bg) 50%, color-mix(in oklab, var(--accent) ${dark ? 9 : 7}%, var(--bg))); }
.sb-${id} .strip svg { position: absolute; left: 0; top: 0; }
.sb-${id} .dev { position: absolute; transform-origin: 50% 50%; }
.sb-${id} .head { position: absolute; display: flex; flex-direction: column; }
.sb-${id} .kicker { display: flex; align-items: center; gap: ${u(g.kick * 0.6)}px; font: 500 ${u(g.kick)}px/1.2 var(--font-text);
  letter-spacing: .12em; text-transform: uppercase; color: var(--ink); opacity: .78; }
.sb-${id} .kicker i { display: block; width: ${u(g.kick * 0.75)}px; height: ${u(g.kick * 0.75)}px; border-radius: 50%; background: var(--accent); flex: none; }
.sb-${id} h1 { display: block; margin-top: ${u(g.kick * 0.9)}px; font: 700 ${u(g.h1)}px/1.03 var(--font-display); letter-spacing: -.035em; color: var(--ink); text-wrap: balance; }
.sb-${id}:lang(ja) h1 { font-weight: 900; letter-spacing: -.01em; line-height: 1.12; }
.sb-${id} .sub { display: block; margin-top: ${u(g.sub * 0.8)}px; font: 400 ${u(g.sub)}px/1.38 var(--font-text); color: var(--muted); text-wrap: pretty; }
`;
  },

  render(ctx) {
    const { W, H, count, index, platform, slot, slots, esc, accent } = ctx;
    const g = G[platform];
    const dark = ctx.theme === 'dark';
    const total = W * count;
    const c2 = shiftHue(accent, 38, dark ? 0.04 : 0.06);
    const c3 = shiftHue(accent, -28, dark ? -0.04 : 0.1);

    // Background ribbon, identical in every slot.
    const svg = `<svg width="${total}" height="${H}" viewBox="0 0 ${total} ${H}">
      <defs>
        <linearGradient id="pf" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${total}" y2="0">
          <stop offset="0" stop-color="${accent}"/><stop offset=".5" stop-color="${c2}"/><stop offset="1" stop-color="${c3}"/>
        </linearGradient>
        <linearGradient id="pb" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${total}" y2="0">
          <stop offset="0" stop-color="${c3}"/><stop offset=".5" stop-color="${accent}"/><stop offset="1" stop-color="${c2}"/>
        </linearGradient>
      </defs>
      <path d="${ribbon(ctx, -0.08 * Math.PI + 0.55, 1.7)}" fill="url(#pb)" opacity="${dark ? 0.22 : 0.2}"/>
      <path d="${ribbon(ctx, -0.08 * Math.PI, 1)}" fill="url(#pf)" opacity="${dark ? 0.9 : 0.85}"/>
    </svg>`;

    // Devices of the neighbours that can reach into this slot, plus this slot's own.
    const devs = [index - 1, index, index + 1].filter(j => j >= 0 && j < count).map(j => {
      const b = devBox(ctx, j);
      const src = j === index ? ctx.capture.src : slots[j].capture;
      const tr = b.rot ? `transform:rotate(${b.rot}deg);` : '';
      return `<div class="dev" style="left:${b.x}px;top:${b.y}px;width:${b.w}px;${tr}">${ctx.device({ width: b.w, src })}</div>`;
    }).join('');

    // Headline block, inside this slot only.
    const own = devBox(ctx, index);
    const x0 = index * W;
    let box;
    if (platform === 'mac' && own.kind === 'S') {
      const h = g.headS;
      box = `left:${x0 + W * h.left}px;top:${H * h.top}px;width:${W * h.width}px;height:${H * (h.bottom - h.top)}px;justify-content:flex-end;`;
    } else if (platform === 'mac') {
      const h = g.headA;
      const left = own.x - x0;
      box = `left:${x0 + left}px;top:${H * h.top}px;width:${Math.min(W * h.width, W - left - W * 0.05)}px;height:${own.y - H * h.top - H * h.bottomGap}px;justify-content:flex-end;`;
    } else {
      const h = g.headA;
      const top = H * h.top;
      const devTop = Math.min(own.y, ...[index - 1, index + 1].filter(j => j >= 0 && j < count)
        .map(j => devBox(ctx, j)).filter(b => b.x < x0 + W && b.x + b.w > x0).map(b => b.y - b.w * 0.06));
      box = `left:${x0 + (W - W * h.width) / 2}px;top:${top}px;width:${W * h.width}px;height:${devTop - top - W * 0.05}px;justify-content:center;`;
    }
    const head = `<div class="head" style="${box}">
        <div class="kicker"><i></i>${esc(slot.kicker)}</div>
        <h1 data-fit="${g.lines}">${esc(slot.headline)}</h1>
        <div class="sub" data-fit="${g.subLines}">${esc(slot.sub)}</div>
      </div>`;

    return `<div class="strip">${svg}${devs}${head}</div>`;
  },
};
