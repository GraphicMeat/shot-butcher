// Risograph: a two-ink print on warm paper. Ink 1 is the accent, ink 2 a dark riso ink picked to sit
// far from it on the colour wheel. Grain from inline SVG noise, halftone dot fields that step in size,
// a misregistered accent overprint of the headline, and the device printed over an offset accent plate.
const id = 'risograph';

// Dark riso-style second inks (readable on paper). The one furthest in hue from the accent wins.
const INKS = [
  { hex: '#22306B', h: 229 }, // federal blue
  { hex: '#0D5257', h: 184 }, // deep teal
  { hex: '#7A1F3D', h: 340 }, // burgundy
  { hex: '#1E5130', h: 141 }, // forest
];
function hue(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16 & 255) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  if (!d) return 0;
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return h * 60;
}
function secondInk(accent) {
  const h = hue(accent);
  const dist = x => { const d = Math.abs(x - h) % 360; return d > 180 ? 360 - d : d; };
  return INKS.reduce((best, ink) => (dist(ink.h) > dist(best.h) ? ink : best)).hex;
}

// Halftone field: horizontal bands whose dots grow from `from` to `to` (fraction of the cell).
function halftone({ x, y, w, h, cell, from, to, bands = 9, round = false, angle = 0 }) {
  const bh = h / bands;
  const strips = Array.from({ length: bands }, (_, i) => {
    const r = from + (to - from) * (i / (bands - 1));
    return `<div style="position:absolute;left:0;right:0;top:${(i * bh).toFixed(1)}px;height:${(bh + 1).toFixed(1)}px;` +
      `background:radial-gradient(circle, var(--ink1) ${(r * 50).toFixed(1)}%, transparent ${(r * 50 + 3).toFixed(1)}%) 0 ${(-i * bh).toFixed(1)}px / ${cell}px ${cell}px"></div>`;
  }).join('');
  return `<div class="ht" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;${round ? 'border-radius:50%;' : ''}transform:rotate(${angle}deg)">${strips}</div>`;
}

const grain = `<svg class="grain" aria-hidden="true"><defs>
  <filter id="rg-n" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="7" stitchTiles="stitch"/>
  <feColorMatrix values="0 0 0 0 .16  0 0 0 0 .12  0 0 0 0 .08  0 0 0 1.1 -.42"/></filter>
  <pattern id="rg-p" width="256" height="256" patternUnits="userSpaceOnUse"><rect width="256" height="256" filter="url(#rg-n)"/></pattern>
</defs><rect width="100%" height="100%" fill="url(#rg-p)"/></svg>`;

const mark = (x, y, s) => `<svg class="reg" style="left:${x - s / 2}px;top:${y - s / 2}px;width:${s}px;height:${s}px" viewBox="0 0 20 20" aria-hidden="true">` +
  `<circle cx="10" cy="10" r="5.5"/><path d="M10 0V20M0 10H20"/></svg>`;

export default {
  id,
  name: 'Risograph',
  summary: 'Two-ink riso print on warm paper: accent plus a dark second ink, grain, stepped halftone dot fields, an off-register accent overprint on the poster headline and the device on an offset accent plate.',
  themes: ['light'],
  fonts: { display: "'Archivo Black'", text: "'Space Grotesk'", mono: "'JetBrains Mono'" },
  palette: {
    light: { bg: '#F1EBDC', ink: '#22306B', muted: '#4A4A55' },
  },

  css: ({ u, platform }) => {
    const P = {
      mac: { head: u(4.7), sub: u(1.45), kick: u(1), off: u(.22), plate: u(1.1) },
      iphone: { head: u(11.2), sub: u(3.7), kick: u(2.7), off: u(.6), plate: u(2.6) },
      ipad: { head: u(7.6), sub: u(2.35), kick: u(1.7), off: u(.4), plate: u(1.8) },
    }[platform];
    return `
.sb-${id} .sheet { position: absolute; inset: 0; color: var(--ink2); }
.sb-${id} .ht { position: absolute; overflow: hidden; mix-blend-mode: multiply; }
.sb-${id} .copy { position: absolute; z-index: 2; }
.sb-${id} .kicker { display: inline-block; padding: ${P.kick * .35}px ${P.kick * .6}px ${P.kick * .3}px; border: ${Math.max(3, P.kick * .12)}px solid var(--ink2); font: 700 ${P.kick}px/1.15 var(--font-mono); letter-spacing: .08em; text-transform: uppercase; }
.sb-${id} h1 { position: relative; display: block; margin-top: ${P.kick * .9}px; font: 400 ${P.head}px/.94 var(--font-display); letter-spacing: -.01em; text-transform: uppercase; color: var(--ink2); }
.sb-${id}:lang(ja) h1 { font-family: 'Noto Sans JP', sans-serif; font-weight: 900; line-height: 1.08; letter-spacing: 0; }
.sb-${id} h1::after { content: attr(data-t); position: absolute; inset: 0; color: var(--ink1); mix-blend-mode: multiply; opacity: .92; transform: translate(${-P.off}px, ${-P.off * .8}px); pointer-events: none; }
.sb-${id} .sub { display: block; margin-top: ${P.sub * .9}px; font: 500 ${P.sub}px/1.34 var(--font-text); color: var(--ink2); opacity: .86; }
.sb-${id} .dev { position: absolute; z-index: 1; }
.sb-${id} .plate { position: absolute; background: var(--ink1); mix-blend-mode: multiply; }
.sb-${id} .dev .sb-device { position: relative; }
.sb-${id} .grain { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 5; mix-blend-mode: multiply; opacity: .55; pointer-events: none; }
.sb-${id} .reg { position: absolute; z-index: 4; overflow: visible; }
.sb-${id} .reg circle, .sb-${id} .reg path { fill: none; stroke: var(--ink2); stroke-width: 1.4; }
`;
  },

  render(ctx) {
    const { platform, slot, esc, u, v, W, H, index, accent } = ctx;
    const ink2 = secondInk(accent);
    const P = { mac: { plate: u(1.1) }, iphone: { plate: u(2.6) }, ipad: { plate: u(1.8) } }[platform].plate;
    // Index-driven rhythm: the halftone field drifts and the plate swaps sides on alternate shots.
    const flip = index % 2 ? -1 : 1;
    const L = {
      mac: {
        copy: `left:${u(4.6)}px;top:${v(11)}px;width:${u(34.5)}px`, devW: u(55), dev: [W - u(4.5) - u(55), v(25)], frame: undefined, radius: u(.9),
        ht: { x: u(52) + flip * u(4), y: -v(8), w: u(46), h: u(46), cell: u(.7), round: true },
        ht2: { x: -u(4), y: v(78), w: u(40), h: v(30), cell: u(.55) },
        reg: [[W - u(2), u(2)], [u(2), H - u(2)]], regS: u(1.4),
      },
      iphone: {
        copy: `left:${u(7.5)}px;top:${v(4.6)}px;width:${u(85)}px`, devW: u(72), dev: [u(14), v(36.5)], frame: false, radius: u(72) * .13,
        ht: { x: u(30) + flip * u(6), y: v(30), w: u(96), h: u(96), cell: u(1.9), round: true },
        ht2: { x: -u(10), y: v(84), w: u(60), h: v(20), cell: u(1.5) },
        reg: [[W - u(4.5), u(4.5)]], regS: u(4),
      },
      ipad: {
        copy: `left:${u(7)}px;top:${v(5)}px;width:${u(86)}px`, devW: u(72), dev: [u(12), v(37)], frame: false, radius: u(72) * .035,
        ht: { x: u(34) + flip * u(5), y: v(30), w: u(80), h: u(80), cell: u(1.25), round: true },
        ht2: { x: -u(8), y: v(84), w: u(50), h: v(20), cell: u(1) },
        reg: [[W - u(3.5), u(3.5)]], regS: u(2.6),
      },
    }[platform];

    const devH = ctx.deviceHeight(L.devW, { frame: L.frame });
    const [dx, dy] = L.dev;
    const plate = `<div class="plate" style="left:${dx + flip * P}px;top:${dy + P}px;width:${L.devW}px;height:${devH}px;border-radius:${L.radius}px"></div>`;
    const device = ctx.device({ width: L.devW, frame: L.frame, shadow: false });

    return `<div class="sheet" style="--ink1:${accent};--ink2:${ink2}">
      ${halftone({ ...L.ht, from: .12, to: .9 })}
      ${halftone({ ...L.ht2, from: .85, to: .1, bands: 7, angle: 0 })}
      ${plate}
      <div class="dev" style="left:${dx}px;top:${dy}px">${device}</div>
      <div class="copy" style="${L.copy}">
        <div class="kicker">${esc(slot.kicker)}</div>
        <h1 data-fit="4" data-t="${esc(slot.headline)}">${esc(slot.headline)}</h1>
        <div class="sub" data-fit="2">${esc(slot.sub)}</div>
      </div>
      ${L.reg.map(([x, y]) => mark(x, y, L.regS)).join('')}
      ${grain}
    </div>`;
  },
};
