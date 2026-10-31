// Aurora Dark: a near-black night sky with aurora curtains built from the accent and its complementary
// hue (layered radial, arc and conic gradients, fully deterministic), a soft coloured glow pooled under
// the device, and light type set flush left. The device sits off-centre and runs off the bottom edge.
const id = 'aurora-dark';

// '#rrggbb' -> [h, s, l] (h in degrees, s/l in %)
function hsl(hex) {
  const n = parseInt(String(hex).replace('#', ''), 16);
  const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min;
  let h = 0;
  if (d) h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [Math.round((h * 60 + 360) % 360), d ? (d / (1 - Math.abs(2 * l - 1))) * 100 : 0, l * 100];
}

export default {
  id,
  name: 'Aurora Dark',
  summary: 'Near-black sky with aurora curtains in the accent and its complementary hue, a coloured glow pooled under an off-centre device, light flush-left type.',
  themes: ['dark'],
  fonts: { display: "'Bricolage Grotesque'", text: "'Inter Tight'" },
  palette: {
    dark: { bg: '#04050A', ink: '#F6F5FB', muted: 'rgba(232,232,244,.70)' },
  },

  css: ({ u, platform, accent }) => {
    const [h] = hsl(accent);
    const m = {
      mac: { h1: u(3.7), sub: u(1.35), k: u(1.0), blur: u(2.2) },
      iphone: { h1: u(9.4), sub: u(3.6), k: u(2.9), blur: u(4.5) },
      ipad: { h1: u(6.2), sub: u(2.3), k: u(1.85), blur: u(3) },
    }[platform];
    return `
.sb-${id} { --a: ${h}; --b: ${(h + 180) % 360}; --c: ${(h + 30) % 360}; background: var(--bg); }
.sb-${id} .sky { position: absolute; inset: -12%; filter: blur(${m.blur}px) saturate(1.15); }
.sb-${id} .arc { position: absolute; inset: -12%; mix-blend-mode: screen; filter: blur(${m.blur * 0.5}px); }
.sb-${id} .streaks { position: absolute; inset: 0; mix-blend-mode: soft-light; opacity: .32; filter: blur(${u(0.12)}px);
  background: repeating-linear-gradient(90deg, rgba(255,255,255,.22) 0 ${u(0.18)}px, transparent ${u(0.18)}px ${u(0.9)}px, rgba(255,255,255,.10) ${u(0.9)}px ${u(1.05)}px, transparent ${u(1.05)}px ${u(2.1)}px);
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, #000 18%, #000 38%, transparent 62%);
          mask-image: linear-gradient(to bottom, transparent 0%, #000 18%, #000 38%, transparent 62%); }
.sb-${id} .floor { position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 55%, rgba(4,5,10,.55)); }
.sb-${id} .glow { position: absolute; border-radius: 50%; filter: blur(${m.blur * 1.6}px);
  background: radial-gradient(closest-side, hsla(var(--a), 98%, 68%, .95), hsla(var(--a), 95%, 62%, .6) 45%, hsla(var(--b), 90%, 60%, .35) 70%, transparent); }
.sb-${id} .glow.halo { border-radius: 40%; filter: blur(${m.blur * 1.2}px);
  background: radial-gradient(closest-side, hsla(var(--a), 100%, 68%, .95) 68%, hsla(var(--b), 95%, 64%, .55) 84%, transparent); }
.sb-${id} .dev { position: absolute; }
.sb-${id} .copy { position: absolute; }
.sb-${id} .kicker { font: 600 ${m.k}px/1.2 var(--font-text); letter-spacing: .16em; text-transform: uppercase;
  color: hsl(var(--a), 95%, 80%); display: flex; align-items: center; gap: ${m.k * 0.6}px; }
.sb-${id}:lang(ja) .kicker { letter-spacing: .06em; }
.sb-${id} .kicker::before { content: ''; width: ${m.k * 1.6}px; height: ${Math.max(2, m.k * 0.09)}px; border-radius: 9px;
  background: linear-gradient(90deg, hsl(var(--a), 95%, 72%), hsl(var(--b), 90%, 70%)); }
.sb-${id} h1 { text-wrap: balance; font: 800 ${m.h1}px/1.0 var(--font-display); letter-spacing: -.035em; color: var(--ink); margin-top: ${m.k * 0.9}px;
  text-shadow: 0 0 ${m.h1 * 0.6}px rgba(4,5,10,.35); }
.sb-${id}:lang(ja) h1 { letter-spacing: 0; line-height: 1.18; }
.sb-${id} .sub { font: 400 ${m.sub}px/1.38 var(--font-text); color: var(--muted); margin-top: ${m.k * 1.1}px; }
`;
  },

  render(ctx) {
    const { platform, slot, esc, u, v, W, H, index } = ctx;
    // aurora drifts a little from slot to slot (deterministic, index-driven)
    const d = (index % 6) * 9;
    const X = n => ((n + d) % 100);
    const sky = `<div class="sky" style="background:
      radial-gradient(ellipse 42% 30% at ${X(18)}% 22%, hsla(var(--a), 92%, 62%, .80), transparent 70%),
      radial-gradient(ellipse 38% 26% at ${X(62)}% 14%, hsla(var(--b), 88%, 58%, .62), transparent 70%),
      radial-gradient(ellipse 34% 30% at ${X(88)}% 40%, hsla(var(--c), 85%, 56%, .50), transparent 70%),
      radial-gradient(ellipse 60% 22% at ${X(40)}% 58%, hsla(var(--a), 90%, 50%, .35), transparent 70%),
      conic-gradient(from ${200 + d}deg at 50% 0%, transparent, hsla(var(--b), 90%, 60%, .18), hsla(var(--a), 90%, 64%, .26), transparent 40%, hsla(var(--c), 85%, 60%, .16), transparent 70%)"></div>
      <div class="arc" style="background:
        radial-gradient(ellipse 120% 70% at ${X(30)}% 105%, transparent 52%, hsla(var(--b), 92%, 66%, .38) 57%, hsla(var(--a), 92%, 66%, .22) 61%, transparent 67%),
        radial-gradient(ellipse 110% 60% at ${X(75)}% 95%, transparent 54%, hsla(var(--a), 92%, 68%, .30) 58%, transparent 64%)"></div>
      <div class="streaks"></div><div class="floor"></div>`;
    const copy = (left, top, width, hl, sl) => `<div class="copy" style="left:${left}px;top:${top}px;width:${width}px">
        <div class="kicker">${esc(slot.kicker)}</div>
        <h1 data-fit="${hl}">${esc(slot.headline)}</h1>
        <div class="sub" data-fit="${sl}">${esc(slot.sub)}</div></div>`;
    const shadow = platform === 'mac'
      ? 'drop-shadow(0 24px 50px rgba(0,0,0,.35)) drop-shadow(0 4px 12px rgba(0,0,0,.3))'
      : '0 6px 20px rgba(0,0,0,.35)';
    const place = (left, top, width) => {
      const h = ctx.deviceHeight(width);
      const vis = Math.min(h, H - top);
      // mac: the glow pools under the window's bottom edge; phone/tablet run off the canvas, so the glow
      // becomes a bright halo rising along both sides of the device
      const glow = platform === 'mac'
        ? `<div class="glow" style="left:${left - width * 0.15}px;top:${top + h * 0.72}px;width:${width * 1.3}px;height:${h * 0.6}px"></div>`
        : `<div class="glow halo" style="left:${left - width * 0.3}px;top:${top + vis * 0.1}px;width:${width * 1.6}px;height:${vis * 1.2}px"></div>`;
      return `${glow}<div class="dev" style="left:${left}px;top:${top}px">${ctx.device({ width, shadow })}</div>`;
    };

    if (platform === 'mac') {
      const devW = u(58);
      return `${sky}${copy(u(5), v(26), u(31), 4, 4)}${place(W - devW - u(4), v(22), devW)}`;
    }
    if (platform === 'iphone') {
      const devW = u(72);
      return `${sky}${copy(u(8), u(10), u(84), 3, 3)}${place(W - devW - u(6), v(39), devW)}`;
    }
    const devW = u(74);
    return `${sky}${copy(u(7), u(7), u(80), 2, 2)}${place(W - devW - u(5), v(30), devW)}`;
  },
};
