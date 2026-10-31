// Headline Top: the classic store layout. Kicker, headline and sub centred at the top of a soft
// accent-tinted canvas; the device sits centred below and bleeds off the bottom edge.
const id = 'headline-top';

// Per platform: headline/sub sizes (in % of W), device width (% of W) and how much of the device
// is cut off by the bottom edge (fraction of its height). The device top follows from the cut.
const L = {
  mac: { h1: 4.2, sub: 1.45, kick: 1.0, dev: 71, cut: 0.2, pad: 5, textW: 64, subW: 48, lines: 2, subLines: 2 },
  iphone: { h1: 8.6, sub: 3.7, kick: 2.7, dev: 80, cut: 0.19, pad: 6.5, textW: 88, subW: 82, lines: 3, subLines: 3 },
  ipad: { h1: 5.6, sub: 2.35, kick: 1.75, dev: 74, cut: 0.19, pad: 5.2, textW: 84, subW: 72, lines: 2, subLines: 2 },
};

export default {
  id,
  name: 'Headline Top',
  summary: 'Centred kicker, headline and sub on a soft accent-tinted canvas; the device sits below and bleeds off the bottom edge.',
  themes: ['light', 'dark'],
  fonts: { display: "'Bricolage Grotesque'", text: "'Instrument Sans'" },
  palette: {
    light: { bg: '#F7F5F2', ink: '#14161B', muted: '#5D6370', tint: '#FFFFFF', line: 'rgba(20,22,27,.08)' },
    dark: { bg: '#0B0C10', ink: '#F5F5F7', muted: '#A2A8B4', tint: '#1A1C24', line: 'rgba(255,255,255,.08)' },
  },

  css: (ctx) => {
    const { u, platform, theme } = ctx;
    const p = L[platform];
    const devW = u(p.dev);
    const devH = ctx.deviceHeight(devW);
    const devTop = ctx.H - devH * (1 - p.cut);
    const dark = theme === 'dark';
    const tintA = dark ? 28 : 24;
    const tintB = dark ? 10 : 11;
    return `
.sb-${id} {
  background:
    radial-gradient(120% 70% at 50% ${devTop / ctx.H * 100 + 10}%, color-mix(in oklab, var(--accent) ${tintA}%, transparent) 0%, transparent 62%),
    linear-gradient(180deg, color-mix(in oklab, var(--accent) ${tintB}%, var(--bg)) 0%, color-mix(in oklab, var(--accent) ${tintA - 2}%, var(--bg)) 100%);
}
.sb-${id} .head { position: absolute; left: 0; right: 0; top: ${u(p.pad)}px; height: ${devTop - u(p.pad) - u(platform === 'mac' ? 2.6 : 4.5)}px;
  display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
.sb-${id} .kicker { display: inline-flex; align-items: center; gap: ${u(p.kick * 0.55)}px;
  font: 600 ${u(p.kick)}px/1.2 var(--font-text); letter-spacing: .14em; text-transform: uppercase; color: var(--accent); }
.sb-${id}.sb-dark .kicker { color: color-mix(in oklab, var(--accent) 70%, #fff); }
.sb-${id} .kicker::before, .sb-${id} .kicker::after { content: ''; width: ${u(p.kick * 1.8)}px; height: ${Math.max(2, u(p.kick * 0.1))}px; background: currentColor; opacity: .5; border-radius: 9px; }
.sb-${id} h1 { display: block; max-width: ${u(p.textW)}px; margin-top: ${u(p.kick * 1.1)}px;
  font: 800 ${u(p.h1)}px/1.02 var(--font-display); letter-spacing: -.03em; color: var(--ink); text-wrap: balance; }
.sb-${id}:lang(ja) h1 { font-weight: 900; letter-spacing: -.01em; line-height: 1.12; }
.sb-${id} .sub { display: block; max-width: ${u(p.subW)}px; margin-top: ${u(p.sub * 0.85)}px;
  font: 400 ${u(p.sub)}px/1.38 var(--font-text); color: var(--muted); text-wrap: balance; }
.sb-${id} .glow { position: absolute; left: 50%; top: ${devTop - devH * 0.05}px; width: ${devW * 1.15}px; height: ${devH * 0.6}px;
  transform: translateX(-50%); border-radius: 50%; background: color-mix(in oklab, var(--accent) ${dark ? 40 : 30}%, transparent); filter: blur(${u(6)}px); }
.sb-${id} .stage { position: absolute; left: 50%; top: ${devTop}px; transform: translateX(-50%); }
`;
  },

  render(ctx) {
    const { slot, esc, platform } = ctx;
    const p = L[platform];
    return `
      <div class="glow"></div>
      <div class="head">
        <div class="kicker">${esc(slot.kicker)}</div>
        <h1 data-fit="${p.lines}">${esc(slot.headline)}</h1>
        <div class="sub" data-fit="${p.subLines}">${esc(slot.sub)}</div>
      </div>
      <div class="stage">${ctx.device({ width: ctx.u(p.dev) })}</div>`;
  },
};
