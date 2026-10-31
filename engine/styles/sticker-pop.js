// Sticker Pop: bright flat field, chunky Bricolage headline, the device, and die-cut stickers slapped
// over its edges: a scalloped seal carrying the kicker plus pills and tags with feature words.
// Thick white cut line, drop shadow, tilt derived from ctx.index.
const id = 'sticker-pop';

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
const hsl = (h, s, l) => `hsl(${(((h % 360) + 360) % 360).toFixed(1)} ${(s * 100).toFixed(1)}% ${(l * 100).toFixed(1)}%)`;
const lumHex = hex => {
  const n = parseInt(hex.slice(1), 16);
  return [n >> 16 & 255, n >> 8 & 255, n & 255]
    .map(c => { c /= 255; return c <= .03928 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4; })
    .reduce((a, c, i) => a + c * [.2126, .7152, .0722][i], 0);
};
const inkOn = hex => (lumHex(hex) > .32 ? '#17131F' : '#FFFFFF');

const TILT = [-9, 7, -5, 10, -7, 5, -11, 8];
const FILLS = ['#FFD43B', '#FF7EB9', '#5BE0B8', '#7CC4FF', '#1B1A22'];

// Scalloped seal outline as an SVG polygon (unit circle, 16 bumps).
function seal() {
  const pts = [];
  const n = 32;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 ? 44 : 50;
    pts.push(`${(50 + Math.cos(a) * r).toFixed(2)},${(50 + Math.sin(a) * r).toFixed(2)}`);
  }
  return pts.join(' ');
}

export default {
  id,
  name: 'Sticker Pop',
  summary: 'Bright flat field, chunky Bricolage Grotesque headline and the device covered in tilted die-cut stickers: a scalloped kicker seal plus feature pills and tags with thick white cut lines and drop shadows.',
  themes: ['light', 'dark'],
  fonts: { display: "'Bricolage Grotesque'", text: "'Bricolage Grotesque'" },
  palette: {
    light: { bg: '#BFF0E6', ink: '#17131F', muted: 'rgba(23,19,31,.72)' },
    dark: { bg: '#1E1730', ink: '#FFF8EE', muted: 'rgba(255,248,238,.74)' },
  },

  css: ({ u, platform }) => {
    const P = {
      mac: { head: u(4.6), sub: u(1.5), tag: u(1.75), cut: u(.55), seal: u(1.6) },
      iphone: { head: u(11.4), sub: u(3.9), tag: u(4.7), cut: u(1.3), seal: u(4.5) },
      ipad: { head: u(7.4), sub: u(2.5), tag: u(3.1), cut: u(.85), seal: u(2.9) },
    }[platform];
    return `
.sb-${id} .field { position: absolute; inset: 0; background: var(--field); }
.sb-${id} .copy { position: absolute; }
.sb-${id} h1 { display: block; font: 800 ${P.head}px/.98 var(--font-display); letter-spacing: -.03em; }
.sb-${id} .sub { display: block; margin-top: ${P.sub * .9}px; font: 600 ${P.sub}px/1.32 var(--font-text); color: var(--muted); }
.sb-${id} .dev { position: absolute; }
.sb-${id} .st { position: absolute; z-index: 2; }
.sb-${id} .tag { display: block; width: max-content; padding: ${P.tag * .42}px ${P.tag * .78}px ${P.tag * .5}px; font: 800 ${P.tag}px/1.08 var(--font-display); letter-spacing: -.01em; text-align: center;
  box-shadow: 0 0 0 ${P.cut}px #fff, 0 ${P.cut * 1.6}px ${P.cut * 3.2}px ${P.cut}px rgba(0,0,0,.26); }
.sb-${id} .tag.pill { border-radius: 999px; }
.sb-${id} .tag.rect { border-radius: ${P.tag * .38}px; }
.sb-${id} .seal { position: absolute; z-index: 3; filter: drop-shadow(0 ${P.cut * 1.6}px ${P.cut * 1.6}px rgba(0,0,0,.26)); }
.sb-${id} .seal svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.sb-${id} .seal polygon { stroke: #fff; stroke-width: 8; stroke-linejoin: round; }
.sb-${id} .seal span { position: absolute; left: 17%; top: 22%; width: 66%; height: 56%; display: flex; align-items: center; justify-content: center; text-align: center;
  font: 800 ${P.seal}px/1.02 var(--font-display); letter-spacing: -.01em; hyphens: manual; }
`;
  },

  render(ctx) {
    const { platform, slot, features, esc, u, v, index, accent, theme } = ctx;
    const [h0] = hexToHsl(accent);
    const field = theme === 'dark' ? hsl(h0 - 18, .55, .17) : hsl(h0 + 165, .78, .83);
    const tilt = j => TILT[(index * 3 + j) % TILT.length];
    const L = {
      mac: {
        copy: `left:${u(5)}px;top:${v(13)}px;width:${u(30)}px`, dev: `right:${u(4.5)}px;top:${v(18)}px`, devW: u(58.5),
        seal: { x: u(36.5), y: v(10), d: u(12.5) },
        tags: [`left:${u(31)}px;top:${v(70)}px`, `right:${u(2.6)}px;top:${v(82)}px`, `right:${u(6)}px;top:${v(9)}px`],
        max: u(22),
      },
      iphone: {
        copy: `left:${u(7.5)}px;top:${v(4.6)}px;width:${u(85)}px`, dev: `left:${u(13)}px;top:${v(34.5)}px`, devW: u(74),
        seal: { x: u(2.5), y: v(30), d: u(32) },
        tags: [`right:${u(2.5)}px;top:${v(57)}px`, `left:${u(2.5)}px;top:${v(82)}px`],
        max: u(58),
      },
      ipad: {
        copy: `left:${u(7)}px;top:${v(5.6)}px;width:${u(84)}px`, dev: `left:${u(18)}px;top:${v(32)}px`, devW: u(64),
        seal: { x: u(5), y: v(28), d: u(23) },
        tags: [`right:${u(3.5)}px;top:${v(55)}px`, `left:${u(4)}px;top:${v(80)}px`],
        max: u(46),
      },
    }[platform];

    const same = (a, b) => String(a).trim().toLowerCase() === String(b).trim().toLowerCase();
    const pool = features.filter(f => !same(f, slot.kicker));
    const n = pool.length;
    const picks = L.tags.map((_, j) => n > j ? pool[(index * L.tags.length + j) % n] : null);
    const tags = picks.map((f, j) => {
      if (!f) return '';
      const fill = FILLS[(index + j) % FILLS.length];
      const shape = (index + j) % 2 ? 'rect' : 'pill';
      return `<div class="st" style="${L.tags[j]};transform:rotate(${tilt(j + 1)}deg)">` +
        `<div class="tag ${shape}" data-fit="" data-overlap-ok style="max-width:${L.max}px;background:${fill};color:${inkOn(fill)}">${esc(f)}</div></div>`;
    }).join('');
    // Long kickers get a bigger seal (CJK counts double) so the text stays legible.
    const vlen = [...String(slot.kicker)].reduce((a, ch) => a + (ch.codePointAt(0) > 0x2E80 ? 2 : 1), 0);
    const grow = Math.min(1.4, 1 + Math.max(0, vlen - 11) * .03);
    const s = { ...L.seal, d: L.seal.d * grow, y: L.seal.y - L.seal.d * (grow - 1) * .5 };
    const sealEl = `<div class="seal" style="left:${s.x}px;top:${s.y}px;width:${s.d}px;height:${s.d}px;transform:rotate(${tilt(0)}deg);color:${inkOn(accent)}">` +
      `<svg viewBox="0 0 100 100" aria-hidden="true"><polygon points="${seal()}" fill="${accent}"/></svg>` +
      `<span data-fit="" data-overlap-ok>${esc(slot.kicker)}</span></div>`;

    return `<div class="field" style="--field:${field}"></div>
      <div class="copy" style="${L.copy}">
        <h1 data-fit="3">${esc(slot.headline)}</h1>
        <div class="sub" data-fit="2">${esc(slot.sub)}</div>
      </div>
      <div class="dev" style="${L.dev}">${ctx.device({ width: L.devW })}</div>
      ${sealEl}${tags}`;
  },
};
