// Spotlight: a black stage lit by one soft cone of light falling from the top onto a centred device,
// with a pool of light and a faint mirror reflection on the floor beneath it. The headline sits in the
// beam at the top in light, airy type.
const id = 'spotlight';

export default {
  id,
  name: 'Spotlight',
  summary: 'Black stage, one soft cone of light from the top onto a centred device, a pool of light and faint floor reflection beneath, light airy headline in the beam.',
  themes: ['dark'],
  fonts: { display: "'Inter Tight'", text: "'Inter Tight'" },
  palette: {
    dark: { bg: '#020203', ink: '#F5F3EF', muted: 'rgba(235,232,226,.58)', beam: '255,248,236' },
  },

  css: ({ u, platform }) => {
    const m = {
      mac: { h1: u(3.4), sub: u(1.3), k: u(0.95), blur: u(1.4) },
      iphone: { h1: u(9), sub: u(3.5), k: u(2.7), blur: u(3) },
      ipad: { h1: u(5.8), sub: u(2.2), k: u(1.7), blur: u(2) },
    }[platform];
    return `
.sb-${id} { background: radial-gradient(ellipse 80% 50% at 50% 100%, #0c0c0e, var(--bg) 70%); }
.sb-${id} .src { position: absolute; left: 50%; top: 0; transform: translate(-50%, -50%); border-radius: 50%;
  background: radial-gradient(closest-side, rgba(var(--beam), .55), rgba(var(--beam), .12) 45%, transparent); }
.sb-${id} .cone { position: absolute; filter: blur(${m.blur}px); }
.sb-${id} .cone > div { position: absolute; inset: 0; }
.sb-${id} .cone .outer { clip-path: polygon(38% 0, 62% 0, 100% 100%, 0 100%);
  background: linear-gradient(to bottom, rgba(var(--beam), .16), rgba(var(--beam), .07) 60%, rgba(var(--beam), .10)); }
.sb-${id} .cone .inner { clip-path: polygon(44% 0, 56% 0, 84% 100%, 16% 100%);
  background: linear-gradient(to bottom, rgba(var(--beam), .10), rgba(var(--beam), .04) 70%, rgba(var(--beam), .07)); }
.sb-${id} .pool { position: absolute; border-radius: 50%;
  background: radial-gradient(closest-side, rgba(var(--beam), .30), rgba(var(--beam), .10) 45%, color-mix(in srgb, var(--accent) 10%, transparent) 70%, transparent); }
.sb-${id} .dev { position: absolute; }
.sb-${id} .refl { position: absolute; transform: scaleY(-1); opacity: .22; pointer-events: none;
  -webkit-mask-image: linear-gradient(to top, #000 0%, transparent 22%); mask-image: linear-gradient(to top, #000 0%, transparent 22%); }
.sb-${id} .copy { position: absolute; left: 50%; transform: translateX(-50%); text-align: center; display: flex; flex-direction: column; align-items: center; }
.sb-${id} .kicker { font: 600 ${m.k}px/1.2 var(--font-text); letter-spacing: .24em; text-transform: uppercase; color: var(--accent);
  filter: brightness(1.35) saturate(1.1); }
.sb-${id}:lang(ja) .kicker { letter-spacing: .12em; }
.sb-${id} h1 { font: 400 ${m.h1}px/1.06 var(--font-display); letter-spacing: -.035em; color: var(--ink); margin-top: ${m.k * 1.1}px; width: 100%; text-wrap: balance; }
.sb-${id}:lang(ja) h1 { letter-spacing: 0; line-height: 1.24; }
.sb-${id} .sub { font: 400 ${m.sub}px/1.4 var(--font-text); color: var(--muted); margin-top: ${m.k * 1.0}px; width: 100%; text-wrap: balance; }
`;
  },

  render(ctx) {
    const { platform, slot, esc, u, v, W } = ctx;
    const L = {
      mac: { devW: u(54), top: v(29), textTop: v(7), textW: u(64), hl: 2, sl: 2 },
      iphone: { devW: u(58), top: v(28), textTop: u(10), textW: u(84), hl: 3, sl: 2 },
      ipad: { devW: u(60), top: v(25), textTop: u(6.5), textW: u(78), hl: 2, sl: 2 },
    }[platform];
    const devH = ctx.deviceHeight(L.devW);
    const left = (W - L.devW) / 2;
    const floorY = L.top + devH;
    const coneW = L.devW * 1.55;
    const shadow = platform === 'mac'
      ? 'drop-shadow(0 30px 50px rgba(0,0,0,.7))'
      : '0 30px 60px rgba(0,0,0,.7)';
    const dev = ctx.device({ width: L.devW, shadow });
    const refl = ctx.device({ width: L.devW, shadow: false });
    return `
      <div class="src" style="width:${L.devW * 0.9}px;height:${L.devW * 0.5}px"></div>
      <div class="cone" style="left:${(W - coneW) / 2}px;top:0;width:${coneW}px;height:${floorY + devH * 0.04}px"><div class="outer"></div><div class="inner"></div></div>
      <div class="pool" style="left:${(W - L.devW * 1.9) / 2}px;top:${floorY - L.devW * 0.11}px;width:${L.devW * 1.9}px;height:${L.devW * 0.22}px"></div>
      <div class="refl" style="left:${left}px;top:${floorY + L.devW * 0.012}px">${refl}</div>
      <div class="dev" style="left:${left}px;top:${L.top}px">${dev}</div>
      <div class="copy" style="top:${L.textTop}px;width:${L.textW}px">
        <div class="kicker">${esc(slot.kicker)}</div>
        <h1 data-fit="${L.hl}">${esc(slot.headline)}</h1>
        <div class="sub" data-fit="${L.sl}">${esc(slot.sub)}</div>
      </div>`;
  },
};
