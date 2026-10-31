// Checklist: headline plus every feature as a ticked list item, a hand-drawn accent check
// breaking out of each box. Device on the other side (Mac), or bleeding off the bottom (iPhone, iPad).
const id = 'checklist';

// Deterministic PRNG (mulberry32) so every tick wobbles the same way on every render.
const rng = seed => () => {
  seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// A tick that starts inside the box and overshoots its top-right corner, like a pen stroke.
function tick(i, size) {
  const r = rng(1013 + i * 7919);
  const j = n => (r() - 0.5) * n;
  const p = [[7 + j(2), 17 + j(2)], [13 + j(1.5), 24 + j(1.5)], [30 + j(2.5), 1 + j(2)]];
  const mid = [(p[1][0] + p[2][0]) / 2 + 1.5 + j(1.5), (p[1][1] + p[2][1]) / 2 + j(1.5)];
  const d = `M${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)} L${p[1][0].toFixed(1)} ${p[1][1].toFixed(1)} Q${mid[0].toFixed(1)} ${mid[1].toFixed(1)} ${p[2][0].toFixed(1)} ${p[2][1].toFixed(1)}`;
  return `<svg class="tick" width="${size}" height="${size}" viewBox="0 0 32 32" aria-hidden="true">` +
    `<rect x="2" y="7" width="22" height="22" rx="5" class="box"/>` +
    `<path d="${d}" class="mark"/></svg>`;
}

export default {
  id,
  name: 'Checklist',
  summary: 'Headline over a ticked checklist of every feature, hand-drawn accent checks breaking out of their boxes; device beside it on Mac, bleeding off the bottom on iPhone and iPad.',
  themes: ['light', 'dark'],
  fonts: { display: "'Instrument Sans'", text: "'Instrument Sans'" },
  palette: {
    light: { bg: '#F4F2ED', surface: '#FFFFFF', ink: '#14151A', muted: '#62666F', line: 'rgba(20,21,26,.13)', box: 'rgba(20,21,26,.30)' },
    dark: { bg: '#0F1013', surface: '#1A1C21', ink: '#F3F2EE', muted: '#9B9FA8', line: 'rgba(255,255,255,.13)', box: 'rgba(255,255,255,.34)' },
  },

  css: ({ u, platform }) => {
    const s = { mac: 1, iphone: 2.2, ipad: 1.45 }[platform];
    const k = n => u(n * s);
    return `
.sb-${id} { position: relative; }
.sb-${id} .head { display: block; }
.sb-${id} .kicker { display: flex; align-items: center; gap: ${k(.6)}px; font: 700 ${k(1.0)}px/1.2 var(--font-text); letter-spacing: .12em; text-transform: uppercase; color: var(--accent); }
.sb-${id} .kicker::before { content: ''; width: ${k(1.8)}px; height: ${Math.max(3, k(.16))}px; background: var(--accent); border-radius: 9px; }
.sb-${id} h1 { display: block; font: 700 ${k(3.6)}px/1.04 var(--font-display); letter-spacing: -.028em; margin-top: ${k(.9)}px; }
.sb-${id} .sub { display: block; font: 400 ${k(1.25)}px/1.38 var(--font-text); color: var(--muted); margin-top: ${k(1)}px; }
.sb-${id} ul { list-style: none; display: grid; column-gap: ${k(1.8)}px; }
.sb-${id} li { display: flex; align-items: center; gap: ${k(.8)}px; padding: ${k(.62)}px 0; border-bottom: ${Math.max(2, k(.07))}px solid var(--line); min-width: 0; }
.sb-${id} li span { display: block; flex: 1; min-width: 0; font: 600 ${k(1.12)}px/1.2 var(--font-text); letter-spacing: -.005em; }
.sb-${id} .tick { flex: none; overflow: visible; }
.sb-${id} .tick .box { fill: none; stroke: var(--box); stroke-width: 2; }
.sb-${id} .tick .mark { fill: none; stroke: var(--accent); stroke-width: 4.2; stroke-linecap: round; stroke-linejoin: round; }

.sb-${id}.sb-mac .col { position: absolute; left: ${u(5.2)}px; top: 0; bottom: 0; width: ${u(37)}px; display: flex; flex-direction: column; justify-content: center; }
.sb-${id}.sb-mac ul { grid-template-columns: 1fr 1fr; margin-top: ${k(2.6)}px; border-top: ${Math.max(2, k(.07))}px solid var(--line); }
.sb-${id}.sb-mac .stage { position: absolute; right: ${u(4.2)}px; top: 50%; transform: translateY(-50%); }

.sb-${id}.sb-iphone, .sb-${id}.sb-ipad { display: flex; flex-direction: column; }
.sb-${id}.sb-iphone { padding: ${u(8)}px ${u(7.3)}px 0; }
.sb-${id}.sb-iphone h1 { font-size: ${u(9.6)}px; }
.sb-${id}.sb-iphone ul { grid-template-columns: 1fr 1fr; column-gap: ${u(5)}px; margin-top: ${u(5.5)}px; border-top: 2px solid var(--line); }
.sb-${id}.sb-iphone li { padding: ${u(1.9)}px 0; gap: ${u(2)}px; }
.sb-${id}.sb-iphone li span { font-size: ${u(3.35)}px; }
.sb-${id}.sb-iphone .stage { flex: 1; position: relative; margin-top: ${u(7)}px; }
.sb-${id}.sb-iphone .stage > .sb-device { position: absolute; left: 50%; top: 0; transform: translateX(-50%); }

.sb-${id}.sb-ipad { padding: ${u(7)}px ${u(7)}px 0; }
.sb-${id}.sb-ipad h1 { font-size: ${u(6.9)}px; max-width: 94%; }
.sb-${id}.sb-ipad .sub { max-width: 80%; }
.sb-${id}.sb-ipad .body { flex: 1; display: flex; align-items: center; gap: ${u(4.5)}px; padding-bottom: ${u(7)}px; min-height: 0; }
.sb-${id}.sb-ipad ul { width: ${u(29)}px; flex: none; grid-template-columns: 1fr; border-top: 2px solid var(--line); }
.sb-${id}.sb-ipad li { padding: ${u(1.25)}px 0; gap: ${u(1.4)}px; }
.sb-${id}.sb-ipad li span { font-size: ${u(2.05)}px; }
.sb-${id}.sb-ipad .stage { flex: none; }
`;
  },

  render(ctx) {
    const { platform, slot, features, esc, u } = ctx;
    const tickSize = { mac: u(1.9), iphone: u(5.6), ipad: u(3.3) }[platform];
    const head = `<div class="head">
      <div class="kicker">${esc(slot.kicker)}</div>
      <h1 data-fit="3">${esc(slot.headline)}</h1>
      ${platform === 'iphone' ? '' : `<div class="sub" data-fit="2">${esc(slot.sub)}</div>`}
    </div>`;
    const list = `<ul>${features.map((f, i) => `<li>${tick(i, tickSize)}<span data-fit="2">${esc(f)}</span></li>`).join('')}</ul>`;

    if (platform === 'mac') {
      return `<div class="col">${head}${list}</div><div class="stage">${ctx.device({ width: u(51.5) })}</div>`;
    }
    if (platform === 'iphone') {
      return `${head}${list}<div class="stage">${ctx.device({ width: u(80) })}</div>`;
    }
    return `${head}<div class="body">${list}<div class="stage">${ctx.device({ width: u(52.5) })}</div></div>`;
  },
};
