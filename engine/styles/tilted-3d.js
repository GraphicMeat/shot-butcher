// Tilted 3D: the device stands in CSS perspective on a floor plane and casts a long, soft shadow
// across it. Headline in a left column on Mac, on top on iPhone/iPad. The tilt (and the shadow
// with it) flips direction on every other slot.
const id = 'tilted-3d';

// x/y/w in % of W (x, w) and % of H (y). horizon: where wall meets floor. base: where the device
// stands. ry/rx: rotation in degrees (ry sign flips with the index).
const L = {
  mac: { dev: 55, cx: 66, base: 84, horizon: 64, ry: 24, rx: 4, h1: 3.7, sub: 1.4, kick: 0.95, lines: 4, subLines: 4 },
  iphone: { dev: 63, cx: 50, base: 88, horizon: 74, ry: 20, rx: 5, h1: 8.4, sub: 3.7, kick: 2.6, lines: 3, subLines: 3 },
  ipad: { dev: 62, cx: 50, base: 88, horizon: 73, ry: 20, rx: 5, h1: 5.6, sub: 2.3, kick: 1.6, lines: 2, subLines: 2 },
};

export default {
  id,
  name: 'Tilted 3D',
  summary: 'Device standing in perspective on a floor plane with a long soft cast shadow; serif headline left on Mac, on top on iPhone and iPad; tilt alternates per shot.',
  themes: ['dark', 'light'],
  fonts: { display: "'Fraunces'", text: "'Inter Tight'" },
  palette: {
    light: { bg: '#ECEAE6', floor: '#DEDBD5', ink: '#16161A', muted: '#5C5E66', shade: 'rgba(40,32,24,.42)', line: 'rgba(0,0,0,.08)' },
    dark: { bg: '#0E0F13', floor: '#272833', ink: '#F3F2EF', muted: '#A1A4AE', shade: 'rgba(0,0,0,.85)', line: 'rgba(255,255,255,.06)' },
  },

  css: (ctx) => {
    const { u, v, platform, index, W, H } = ctx;
    const p = L[platform];
    const mac = platform === 'mac';
    const dir = index % 2 === 0 ? 1 : -1; // +1: device turns its face to the left
    const devW = u(p.dev);
    const devH = ctx.deviceHeight(devW);
    const baseY = v(p.base);
    const top = baseY - devH;
    const left = u(p.cx) - devW / 2;
    const persp = devW * 3.4;
    const dark = ctx.theme === 'dark';
    return `
.sb-${id} { background: linear-gradient(180deg, color-mix(in oklab, var(--accent) ${dark ? 10 : 8}%, var(--bg)) 0%, var(--bg) ${p.horizon}%, var(--floor) ${p.horizon}%, color-mix(in oklab, var(--floor) 70%, var(--bg)) 100%); }
.sb-${id} .halo { position: absolute; left: ${u(p.cx) - devW * 0.85}px; top: ${top - devH * 0.15}px; width: ${devW * 1.7}px; height: ${devH * 1.05}px; border-radius: 50%;
  background: radial-gradient(closest-side, color-mix(in oklab, var(--accent) ${dark ? 42 : 34}%, transparent), transparent); filter: blur(${u(2)}px); }
.sb-${id} .horizon { position: absolute; left: 0; right: 0; top: ${v(p.horizon)}px; height: ${Math.max(2, u(0.08))}px; background: var(--line); }
.sb-${id} .floorglow { position: absolute; left: ${u(p.cx) - devW}px; top: ${v(p.horizon)}px; width: ${devW * 2}px; height: ${H - v(p.horizon)}px;
  background: radial-gradient(50% 60% at 50% 0%, color-mix(in oklab, var(--accent) ${dark ? 24 : 14}%, transparent), transparent); }
.sb-${id} .shadow { position: absolute; left: ${left + devW * 0.06}px; top: ${baseY - devW * 0.02}px; width: ${devW * 0.88}px; height: ${devH * 0.5}px;
  transform-origin: 50% 0; transform: skewX(${-dir * 58}deg) scaleY(.5);
  background: linear-gradient(180deg, var(--shade), transparent 85%); filter: blur(${u(mac ? 0.9 : 1.6)}px); border-radius: ${devW * 0.05}px; }
.sb-${id} .contact { position: absolute; left: ${left + devW * 0.04}px; top: ${baseY - devW * 0.035}px; width: ${devW * 0.92}px; height: ${devW * 0.07}px;
  border-radius: 50%; background: var(--shade); filter: blur(${u(mac ? 0.6 : 1.1)}px); }
.sb-${id} .scene { position: absolute; left: ${left}px; top: ${top}px; width: ${devW}px; height: ${devH}px; perspective: ${persp}px; perspective-origin: 50% 40%; }
.sb-${id} .tilt { transform-origin: 50% 100%; transform: rotateY(${dir * p.ry}deg) rotateX(${p.rx}deg); transform-style: preserve-3d; }
.sb-${id} .head { position: absolute; display: flex; flex-direction: column; }
.sb-${id}.sb-mac .head { left: ${u(6)}px; top: ${v(10)}px; width: ${u(31)}px; height: ${v(p.horizon) - v(10)}px; justify-content: center; }
.sb-${id}:not(.sb-mac) .head { left: ${u(8)}px; right: ${u(8)}px; top: ${u(platform === 'iphone' ? 13 : 7)}px; height: ${top - u(platform === 'iphone' ? 17 : 10)}px; align-items: center; text-align: center; justify-content: center; }
.sb-${id} .kicker { font: 600 ${u(p.kick)}px/1.2 var(--font-text); letter-spacing: .16em; text-transform: uppercase; color: var(--accent); }
.sb-${id}.sb-dark .kicker { color: color-mix(in oklab, var(--accent) 65%, #fff); }
.sb-${id} h1 { display: block; margin-top: ${u(p.kick * 1.1)}px; font: 700 ${u(p.h1)}px/1.04 var(--font-display); letter-spacing: -.02em; color: var(--ink); text-wrap: balance; }
.sb-${id}:lang(ja) h1 { font-family: 'Noto Sans JP', sans-serif; font-weight: 900; line-height: 1.14; letter-spacing: 0; }
.sb-${id} .sub { display: block; margin-top: ${u(p.sub * 0.9)}px; font: 400 ${u(p.sub)}px/1.4 var(--font-text); color: var(--muted); text-wrap: pretty; }
.sb-${id}:not(.sb-mac) .sub { max-width: ${u(platform === 'iphone' ? 80 : 70)}px; text-wrap: balance; }
`;
  },

  render(ctx) {
    const { slot, esc, platform } = ctx;
    const p = L[platform];
    const devW = ctx.u(p.dev);
    return `
      <div class="halo"></div>
      <div class="horizon"></div>
      <div class="floorglow"></div>
      <div class="shadow"></div>
      <div class="contact"></div>
      <div class="scene"><div class="tilt">${ctx.device({ width: devW, shadow: platform === 'mac' ? `drop-shadow(0 0 ${Math.max(1.5, devW * 0.0012)}px ${ctx.theme === 'dark' ? 'rgba(255,255,255,.4)' : 'rgba(0,0,0,.28)'})` : '0 0 0 transparent' })}</div></div>
      <div class="head">
        <div class="kicker">${esc(slot.kicker)}</div>
        <h1 data-fit="${p.lines}">${esc(slot.headline)}</h1>
        <div class="sub" data-fit="${p.subLines}">${esc(slot.sub)}</div>
      </div>`;
  },
};
