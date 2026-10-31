// Annotated Sketch: a designer's notebook page. Dot-grid paper (or chalk slate in dark), a clean
// Fraunces headline, the device on the right and handwritten Caveat margin notes on the left with
// wobbly hand-drawn accent arrows pointing into the UI. All wobble is seeded from ctx.index.
const id = 'annotated-sketch';

const rng = seed => () => {
  seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const f1 = n => n.toFixed(1);

// A hand-drawn arrow from (x0,y0) to (x1,y1): a jittered cubic, traced twice like a quick pen stroke,
// with a two-stroke arrowhead. Returns SVG path data strings.
function arrow(r, x0, y0, x1, y1, bend, head) {
  const j = n => (r() - 0.5) * 2 * n;
  const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy);
  const nx = -dy / len, ny = dx / len; // normal
  const c1 = [x0 + dx * .3 + nx * bend + j(len * .03), y0 + dy * .3 + ny * bend + j(len * .03)];
  const c2 = [x0 + dx * .72 + nx * bend * .55 + j(len * .03), y0 + dy * .72 + ny * bend * .55 + j(len * .03)];
  const main = `M${f1(x0)} ${f1(y0)} C${f1(c1[0])} ${f1(c1[1])} ${f1(c2[0])} ${f1(c2[1])} ${f1(x1)} ${f1(y1)}`;
  const o = len * .008;
  const ghost = `M${f1(x0 + j(o) + o)} ${f1(y0 + j(o))} C${f1(c1[0] + j(o * 2))} ${f1(c1[1] + j(o * 2))} ${f1(c2[0] + j(o * 2))} ${f1(c2[1] + j(o * 2))} ${f1(x1 + j(o))} ${f1(y1 + j(o))}`;
  // Arrowhead follows the curve's end tangent (c2 -> end).
  const a = Math.atan2(y1 - c2[1], x1 - c2[0]);
  const wing = s => {
    const ang = a + Math.PI + s * (0.48 + j(.08));
    const l = head * (1 + j(.12));
    return `M${f1(x1 + Math.cos(ang) * l)} ${f1(y1 + Math.sin(ang) * l)} Q${f1(x1 + Math.cos(ang) * l * .45 + j(head * .06))} ${f1(y1 + Math.sin(ang) * l * .45 + j(head * .06))} ${f1(x1)} ${f1(y1)}`;
  };
  return { main, ghost, head: `${wing(1)} ${wing(-1)}` };
}

// A loose hand-drawn underline.
function underline(r, w, h) {
  const j = n => (r() - 0.5) * 2 * n;
  return `M${f1(2)} ${f1(h * .55 + j(h * .1))} C${f1(w * .3)} ${f1(h * .2 + j(h * .1))} ${f1(w * .62)} ${f1(h * .75 + j(h * .1))} ${f1(w - 2)} ${f1(h * .35 + j(h * .1))}`;
}

export default {
  id,
  name: 'Annotated Sketch',
  summary: 'Dot-grid notebook paper, clean Fraunces headline, device on the right and handwritten Caveat margin notes on the left with wobbly hand-drawn accent arrows pointing into the UI.',
  themes: ['light', 'dark'],
  fonts: { display: "'Fraunces'", text: "'Inter Tight'" },
  palette: {
    light: { bg: '#FAF6EC', ink: '#1E1C19', muted: '#6E675C', pen: '#2C2A27', dot: 'rgba(70,80,110,.16)' },
    dark: { bg: '#1C2024', ink: '#F3EFE6', muted: '#A7A49C', pen: '#EDE9DF', dot: 'rgba(255,255,255,.09)' },
  },

  css: ({ u, platform }) => {
    const P = {
      mac: { head: u(3.7), sub: u(1.35), kick: u(1.05), note: u(2.6), grid: u(1.5) },
      iphone: { head: u(9.8), sub: u(3.6), kick: u(2.9), note: u(5.6), grid: u(4) },
      ipad: { head: u(6.4), sub: u(2.3), kick: u(1.8), note: u(3.7), grid: u(2.6) },
    }[platform];
    return `
.sb-${id} .paper { position: absolute; inset: 0; background-image: radial-gradient(circle, var(--dot) ${Math.max(1.6, P.grid * .07)}px, transparent ${Math.max(2.2, P.grid * .09)}px); background-size: ${P.grid}px ${P.grid}px; background-position: ${P.grid / 2}px ${P.grid / 2}px; }
.sb-${id} .copy { position: absolute; }
.sb-${id} .kicker { display: block; font: 600 ${P.kick}px/1.2 var(--font-text); letter-spacing: .14em; text-transform: uppercase; color: var(--muted); }
.sb-${id} h1 { display: block; font: 700 ${P.head}px/1.04 var(--font-display); letter-spacing: -.022em; font-optical-sizing: auto; }
.sb-${id} .uline { display: block; margin-top: ${P.kick * .45}px; overflow: visible; }
.sb-${id} .uline path { fill: none; stroke: var(--accent); stroke-width: ${Math.max(4, P.head * .07)}; stroke-linecap: round; }
.sb-${id} .sub { display: block; margin-top: ${P.sub * .6}px; font: 400 ${P.sub}px/1.4 var(--font-text); color: var(--muted); }
.sb-${id} .dev { position: absolute; }
.sb-${id} .ink { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none; z-index: 2; }
.sb-${id} .ink path { fill: none; stroke: var(--accent); stroke-linecap: round; stroke-linejoin: round; }
.sb-${id} .ink .ghost { opacity: .45; }
.sb-${id} .note { position: absolute; z-index: 3; display: flex; align-items: center; justify-content: flex-end; }
.sb-${id} .note span { display: flex; flex-direction: column; justify-content: center; width: 100%; height: 100%; text-align: right; font: 700 ${P.note}px/1.12 'Caveat', 'Noto Sans JP', cursive; color: var(--pen); }
.sb-${id} .note span:lang(ja), .sb-${id}:lang(ja) .note span { font-weight: 700; font-size: ${P.note * .74}px; line-height: 1.22; }
`;
  },

  render(ctx) {
    const { platform, slot, features, esc, u, v, W, H, index } = ctx;
    const r = rng(4243 + index * 977);
    const L = {
      mac: { copy: [u(4.6), v(9), u(32.5)], devW: u(58), devR: u(4), devTop: v(23), notes: [u(3.5), u(28.5)], noteH: v(14), ys: [.36, .62, .86], stroke: u(.24), head: u(1.15), sub: true },
      iphone: { copy: [u(7), v(4.6), u(86)], devW: u(63), devR: u(4.5), devTop: v(24.5), notes: [u(3.5), u(27.5)], noteH: v(10), ys: [.2, .5, .8], stroke: u(.62), head: u(3), sub: false },
      ipad: { copy: [u(6), v(5), u(86)], devW: u(60), devR: u(5), devTop: v(29), notes: [u(4), u(27)], noteH: v(10), ys: [.2, .5, .8], stroke: u(.4), head: u(2), sub: true },
    }[platform];

    const dw = L.devW, dh = ctx.deviceHeight(dw);
    const dx = W - L.devR - dw, dy = L.devTop;
    const same = (a, b) => String(a).trim().toLowerCase() === String(b).trim().toLowerCase();
    const pool = features.filter(f => !same(f, slot.kicker));
    const n = pool.length;
    const notes = [slot.kicker, ...(n ? [pool[(index * 2) % n], pool[(index * 2 + 1) % n]] : [])].filter(Boolean);

    const arrows = [];
    const noteEls = notes.map((text, i) => {
      const fy = L.ys[i];
      const cy = Math.min(dy + dh * fy, H - L.noteH * .6);
      const [nx, nw] = L.notes;
      const tilt = ((index + i) % 3 - 1) * 2.2 + (r() - .5) * 1.5;
      // Arrow: from just right of the note to a point inside the left half of the screen.
      const x0 = nx + nw + u(platform === 'mac' ? .8 : 1.6);
      const tx = dx + dw * (.2 + r() * .22);
      const ty = Math.min(cy + dh * ((r() - .5) * .08) + (i - 1) * dh * .02, H - u(4));
      const bend = -(Math.hypot(tx - x0, ty - cy) * (.16 + r() * .1)) * (i % 2 ? -1 : 1);
      arrows.push(arrow(r, x0, cy + (r() - .5) * L.head * .4, tx, ty, bend, L.head));
      return `<div class="note" style="left:${nx}px;top:${cy - L.noteH / 2}px;width:${nw}px;height:${L.noteH}px;transform:rotate(${tilt.toFixed(2)}deg)"><span data-fit="">${esc(text)}</span></div>`;
    }).join('');

    const ink = `<svg class="ink" viewBox="0 0 ${W} ${H}" aria-hidden="true">${arrows.map(a =>
      `<path d="${a.main}" stroke-width="${f1(L.stroke)}"/><path class="ghost" d="${a.ghost}" stroke-width="${f1(L.stroke * .55)}"/><path d="${a.head}" stroke-width="${f1(L.stroke)}"/>`).join('')}</svg>`;

    const [cx, cy, cw] = L.copy;
    const ulW = cw * .34, ulH = u(platform === 'mac' ? 1 : platform === 'iphone' ? 2.6 : 1.7);
    return `<div class="paper"></div>
      <div class="copy" style="left:${cx}px;top:${cy}px;width:${cw}px">
        <h1 data-fit="3">${esc(slot.headline)}</h1>
        <svg class="uline" width="${ulW}" height="${ulH}" viewBox="0 0 ${f1(ulW)} ${f1(ulH)}" aria-hidden="true"><path d="${underline(r, ulW, ulH)}"/></svg>
        ${L.sub ? `<div class="sub" data-fit="2">${esc(slot.sub)}</div>` : ''}
      </div>
      <div class="dev" style="left:${dx}px;top:${dy}px">${ctx.device({ width: dw })}</div>
      ${ink}${noteEls}`;
  },
};
