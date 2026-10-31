// Bleed Top: the mirror of Headline Top. The device drops in from the top edge (its top is cut off)
// over a solid accent panel, and a heavy, left-aligned caption block sits anchored to the bottom.
const id = 'bleed-top';

// Device width (% of W) and the fraction of its height cut off by the top edge. Panel height is a
// fraction of the device's visible height. Caption sizes in % of W.
const L = {
  mac: { dev: 75, cut: 0.2, panel: 0.6, side: 4.2, h1: 4.4, sub: 1.45, kick: 0.95, lines: 2, subLines: 3, padB: 6.5 },
  iphone: { dev: 82, cut: 0.2, panel: 0.6, side: 7, h1: 9.6, sub: 3.9, kick: 2.6, lines: 3, subLines: 3, padB: 9 },
  ipad: { dev: 76, cut: 0.2, panel: 0.6, side: 6, h1: 6.6, sub: 2.4, kick: 1.6, lines: 2, subLines: 2, padB: 6.5 },
};

export default {
  id,
  name: 'Bleed Top',
  summary: 'Device drops in from the top edge over a solid accent panel; a heavy left-aligned caption block is anchored to the bottom.',
  themes: ['light', 'dark'],
  fonts: { display: "'Archivo Black'", text: "'Inter Tight'" },
  palette: {
    light: { bg: '#F1EEE8', ink: '#111214', muted: '#575B63', rule: '#111214' },
    dark: { bg: '#0D0D10', ink: '#F6F5F2', muted: '#A3A6AD', rule: '#F6F5F2' },
  },

  css: (ctx) => {
    const { u, platform, W, H } = ctx;
    const p = L[platform];
    const devW = u(p.dev);
    const devH = ctx.deviceHeight(devW);
    const devTop = -devH * p.cut;
    const devBottom = devTop + devH;
    const panelH = devBottom * p.panel;
    const capTop = devBottom + u(platform === 'mac' ? 3 : 5.5);
    const mac = platform === 'mac';
    return `
.sb-${id} .panel { position: absolute; left: 0; right: 0; top: 0; height: ${panelH}px; background: var(--accent); overflow: hidden; }
.sb-${id} .panel::after { content: ''; position: absolute; inset: 0;
  background: radial-gradient(90% 120% at 50% 0%, rgba(255,255,255,.22), transparent 60%), linear-gradient(180deg, transparent 50%, rgba(0,0,0,.14)); }
.sb-${id} .stage { position: absolute; left: 50%; top: ${devTop}px; transform: translateX(-50%); }
.sb-${id} .cap { position: absolute; left: ${u(p.side)}px; right: ${u(p.side)}px; top: ${capTop}px; bottom: ${u(p.padB) * (mac ? 0.6 : 0.55)}px;
  display: flex; flex-direction: column; justify-content: flex-end; }
.sb-${id}.sb-mac .cap { display: grid; grid-template-columns: 1.75fr 1fr; column-gap: ${u(4)}px; align-items: end; align-content: end; }
.sb-${id} .kicker { display: flex; align-items: center; gap: ${u(p.kick * 0.8)}px; font: 700 ${u(p.kick)}px/1.2 var(--font-text);
  letter-spacing: .16em; text-transform: uppercase; color: var(--ink); }
.sb-${id}.sb-mac .kicker { grid-column: 1 / -1; }
.sb-${id} .kicker::before { content: ''; width: ${u(p.kick * 2.6)}px; height: ${u(p.kick * 0.32)}px; background: var(--accent); flex: none; }
.sb-${id} h1 { display: block; margin-top: ${u(p.kick * 1.1)}px; font: 400 ${u(p.h1)}px/1.0 var(--font-display); letter-spacing: -.02em; color: var(--ink); text-wrap: balance; }
.sb-${id}:lang(ja) h1 { font-family: 'Noto Sans JP', sans-serif; font-weight: 900; line-height: 1.12; letter-spacing: 0; }
.sb-${id} .sub { display: block; margin-top: ${u(mac ? 0 : p.sub * 0.9)}px; font: 500 ${u(p.sub)}px/1.36 var(--font-text); color: var(--muted); text-wrap: pretty; }
.sb-${id}.sb-mac .sub { padding-left: ${u(1.6)}px; border-left: ${u(0.18)}px solid var(--accent); margin-bottom: ${u(0.5)}px; }
`;
  },

  render(ctx) {
    const { slot, esc, platform } = ctx;
    const p = L[platform];
    return `
      <div class="panel"></div>
      <div class="stage">${ctx.device({ width: ctx.u(p.dev) })}</div>
      <div class="cap">
        <div class="kicker">${esc(slot.kicker)}</div>
        <h1 data-fit="${p.lines}">${esc(slot.headline)}</h1>
        <div class="sub" data-fit="${p.subLines}">${esc(slot.sub)}</div>
      </div>`;
  },
};
