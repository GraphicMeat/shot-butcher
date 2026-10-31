// Liquid Glass: the canvas is the capture itself, enlarged and heavily blurred, so the app's own colours
// tint the whole background. The caption sits on a frosted glass card (backdrop blur, light fill,
// highlight edge) and the device floats on top, overlapping the card's edge.
const id = 'liquid-glass';

export default {
  id,
  name: 'Liquid Glass',
  summary: "Background is the capture itself, enlarged and heavily blurred; caption on a frosted translucent glass card with a bright highlight edge; device floats on top overlapping the card.",
  themes: ['light', 'dark'],
  fonts: { display: "'Inter Tight'", text: "'Inter Tight'" },
  palette: {
    light: {
      bg: '#E9ECF2', ink: '#0D1016', muted: 'rgba(13,16,22,.66)', veil: 'rgba(255,255,255,.16)', bgf: 'saturate(2) contrast(1.06)',
      glass: 'linear-gradient(140deg, rgba(255,255,255,.62), rgba(255,255,255,.30) 55%, rgba(255,255,255,.40))',
      rim: 'rgba(255,255,255,.85)', rimSoft: 'rgba(255,255,255,.35)', drop: 'rgba(20,24,40,.16)', chip: 'rgba(255,255,255,.55)',
    },
    dark: {
      bg: '#0B0D12', ink: '#F4F6FA', muted: 'rgba(244,246,250,.70)', veil: 'rgba(6,8,14,.38)', bgf: 'saturate(2.3) brightness(1.12)',
      glass: 'linear-gradient(140deg, rgba(34,38,50,.62), rgba(16,18,26,.50) 55%, rgba(26,30,40,.56))',
      rim: 'rgba(255,255,255,.34)', rimSoft: 'rgba(255,255,255,.10)', drop: 'rgba(0,0,0,.40)', chip: 'rgba(255,255,255,.10)',
    },
  },

  css: ({ u, platform }) => {
    const m = {
      mac: { blur: u(3.2), r: u(2.2), pad: u(2.6), h1: u(3.5), sub: u(1.3), k: u(1.05), icon: u(2.6) },
      iphone: { blur: u(6), r: u(6.5), pad: u(6.4), h1: u(8.6), sub: u(3.5), k: u(3.1), icon: u(7.6) },
      ipad: { blur: u(4.2), r: u(4), pad: u(4.4), h1: u(5.6), sub: u(2.2), k: u(2), icon: u(4.8) },
    }[platform];
    return `
.sb-${id} .bg { position: absolute; inset: 0; overflow: hidden; }
.sb-${id} .bg img { position: absolute; left: -20%; top: -20%; width: 140%; height: 140%; object-fit: cover;
  filter: blur(${m.blur}px) var(--bgf); transform: scale(1.35); }
.sb-${id} .veil { position: absolute; inset: 0; background:
  radial-gradient(ellipse 70% 50% at 0% 0%, color-mix(in srgb, var(--accent) 38%, transparent), transparent 70%),
  radial-gradient(ellipse 60% 45% at 100% 100%, color-mix(in srgb, var(--accent) 30%, transparent), transparent 70%),
  var(--veil); }
.sb-${id} .glass { position: absolute; border-radius: ${m.r}px; background: var(--glass);
  backdrop-filter: blur(${m.blur * 0.6}px) saturate(1.6); -webkit-backdrop-filter: blur(${m.blur * 0.6}px) saturate(1.6);
  box-shadow: inset 0 ${Math.max(2, m.r * 0.04)}px 0 var(--rim), inset 0 0 0 ${Math.max(1.5, m.r * 0.022)}px var(--rimSoft),
    0 ${m.r * 0.5}px ${m.r * 1.6}px var(--drop); }
.sb-${id} .glass .in { position: absolute; inset: 0; padding: ${m.pad}px; display: flex; flex-direction: column; }
.sb-${id} .chip { align-self: flex-start; display: flex; align-items: center; gap: ${m.k * 0.6}px; padding: ${m.k * 0.4}px ${m.k * 0.9}px ${m.k * 0.4}px ${m.k * 0.4}px;
  border-radius: ${m.icon}px; background: var(--chip); box-shadow: inset 0 1px 0 var(--rim), inset 0 0 0 1px var(--rimSoft); }
.sb-${id} .chip img { width: ${m.icon * 0.72}px; height: ${m.icon * 0.72}px; border-radius: 24%; }
.sb-${id} .chip span { font: 600 ${m.k}px/1.15 var(--font-text); color: var(--ink); letter-spacing: -.005em; white-space: nowrap; }
.sb-${id} h1 { text-wrap: balance; font: 700 ${m.h1}px/1.04 var(--font-display); letter-spacing: -.032em; color: var(--ink); margin-top: ${m.pad * 0.55}px; }
.sb-${id}:lang(ja) h1 { letter-spacing: 0; line-height: 1.22; }
.sb-${id} .sub { font: 500 ${m.sub}px/1.36 var(--font-text); color: var(--muted); margin-top: ${m.pad * 0.32}px; letter-spacing: -.005em; }
.sb-${id} .dev { position: absolute; z-index: 2; }
`;
  },

  render(ctx) {
    const { platform, slot, app, esc, u, v, W, H, index } = ctx;
    // the blurred background samples a different region of the capture on every slot
    const spots = [[30, 25], [70, 60], [45, 80], [80, 30], [20, 65], [60, 45]];
    const [px, py] = spots[index % spots.length];
    const bg = `<div class="bg"><img src="${ctx.capture.src}" alt="" style="object-position:${px}% ${py}%"></div><div class="veil"></div>`;
    const chip = `<div class="chip">${app.icon ? `<img src="${app.icon}" alt="">` : ''}<span>${esc(slot.kicker)}</span></div>`;
    const copy = (hl, sl) => `${chip}<h1 data-fit="${hl}">${esc(slot.headline)}</h1><div class="sub" data-fit="${sl}">${esc(slot.sub)}</div>`;
    const shadow = platform === 'mac'
      ? 'drop-shadow(0 40px 70px rgba(0,0,0,.30)) drop-shadow(0 8px 18px rgba(0,0,0,.18))'
      : '0 50px 110px rgba(0,0,0,.30), 0 10px 26px rgba(0,0,0,.18)';

    if (platform === 'mac') {
      const devW = u(56);
      const devH = ctx.deviceHeight(devW);
      const cardW = u(39);
      const overlap = u(4);
      return `${bg}
        <div class="glass" style="left:${u(4)}px;top:${v(13)}px;width:${cardW}px;height:${v(74)}px">
          <div class="in" style="padding-right:${overlap + u(2.6)}px;justify-content:center">${copy(4, 4)}</div></div>
        <div class="dev" style="left:${u(4) + cardW - overlap}px;top:${(H - devH) / 2}px">${ctx.device({ width: devW, shadow })}</div>`;
    }
    if (platform === 'iphone') {
      const devW = u(62);
      const top = v(35);
      return `${bg}
        <div class="glass" style="left:${u(6)}px;top:${u(6)}px;width:${W - u(12)}px;height:${top + u(10) - u(6)}px">
          <div class="in" style="padding-bottom:${u(16)}px">${copy(3, 3)}</div></div>
        <div class="dev" style="left:${(W - devW) / 2}px;top:${top}px">${ctx.device({ width: devW, frame: false, shadow })}</div>`;
    }
    const devW = u(62);
    const top = v(33);
    return `${bg}
      <div class="glass" style="left:${u(5)}px;top:${u(5)}px;width:${W - u(10)}px;height:${top + u(7) - u(5)}px">
        <div class="in" style="padding-bottom:${u(11)}px">${copy(2, 2)}</div></div>
      <div class="dev" style="left:${(W - devW) / 2}px;top:${top}px">${ctx.device({ width: devW, frame: false, shadow })}</div>`;
  },
};
