// Exploded UI: the device plus two or three pieces of its own screen lifted out as floating cards.
// Each card keeps its height on screen, grows a little, and slides out over the nearest frame edge,
// leaving a tinted socket where it came from. Regions: slot.regions [{x,y,w,h}] (fractions of the
// capture) when present, else per-platform defaults per index that land on real UI.
const id = 'exploded-ui';

// Default regions per index, [x, y, w, h] fractions of the capture.
// iPad defaults are deliberately generic: the current iPad captures are being re-shot.
const REGIONS = {
  mac: [
    [[0.51, 0.04, 0.48, 0.12], [0.18, 0.225, 0.32, 0.17], [0.78, 0.905, 0.21, 0.075]],      // open message header, top rows, migration toast
    [[0.25, 0.095, 0.68, 0.245], [0.005, 0.3, 0.17, 0.2], [0.78, 0.905, 0.21, 0.075]],      // conversation rows, accounts, toast
    [[0.765, 0.855, 0.225, 0.13], [0.18, 0.045, 0.32, 0.085], [0.18, 0.225, 0.32, 0.165]],  // downloading card, inbox header, rows
    [[0.765, 0.825, 0.225, 0.16], [0.005, 0.52, 0.17, 0.28], [0.18, 0.225, 0.32, 0.165]],   // operation complete, vault folders, rows
    [[0.28, 0.235, 0.6, 0.2], [0.075, 0.345, 0.15, 0.315], [0.245, 0.16, 0.37, 0.04]],      // snapshots, settings nav, account pills
    [[0.36, 0.43, 0.28, 0.095], [0.36, 0.535, 0.28, 0.12], [0.36, 0.67, 0.28, 0.06]],       // link text, real address, buttons
  ],
  iphone: [
    [[0.15, 0.16, 0.7, 0.25], [0.05, 0.72, 0.88, 0.07], [0.05, 0.45, 0.85, 0.14]],
    [[0.07, 0.19, 0.83, 0.13], [0.07, 0.47, 0.88, 0.2], [0.45, 0.895, 0.5, 0.04]],
    [[0.03, 0.11, 0.95, 0.065], [0.1, 0.23, 0.81, 0.14], [0.1, 0.37, 0.81, 0.26]],
    [[0, 0.385, 0.6, 0.05], [0.1, 0.225, 0.4, 0.145], [0.1, 0.45, 0.81, 0.18]],
    [[0.03, 0.19, 0.94, 0.23], [0.03, 0.115, 0.94, 0.05], [0.1, 0.6, 0.81, 0.26]],
    [[0.44, 0.12, 0.53, 0.43], [0.05, 0.45, 0.42, 0.16], [0.1, 0.6, 0.81, 0.26]],
  ],
  ipad: Array.from({ length: 6 }, () => [[0.3, 0.2, 0.42, 0.18], [0.3, 0.47, 0.42, 0.2], [0.32, 0.74, 0.38, 0.14]]),
};

// Layout per platform: device width/top (% of W / % of H), header box, card scale and limits.
const L = {
  mac: { dev: 59, devT: 31, grow: 1.42, maxW: 0.6, out: 0.3, h1: 3.6, sub: 1.4, kick: 0.9, lines: 2, subLines: 3 },
  iphone: { dev: 62, devT: 30, grow: 1.22, maxW: 0.8, out: 0.24, h1: 8.4, sub: 3.6, kick: 2.5, lines: 3, subLines: 3 },
  ipad: { dev: 58, devT: 29, grow: 1.25, maxW: 0.7, out: 0.26, h1: 5.6, sub: 2.3, kick: 1.5, lines: 2, subLines: 2 },
};

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

function geometry(ctx) {
  const { platform, W, H, index, capture: cap, slot } = ctx;
  const p = L[platform];
  const u = n => n * W / 100, v = n => n * H / 100;
  const devW = u(p.dev);
  const devH = ctx.deviceHeight(devW);
  const devL = (W - devW) / 2;
  const devT = v(p.devT);
  const bezel = platform === 'mac' ? 0 : devW * (platform === 'iphone' ? 0.034 : 0.026);
  const scr = { x: devL + bezel, y: devT + bezel, w: devW - 2 * bezel };
  scr.h = scr.w * cap.h / cap.w;

  const ok = r => r && [r.x, r.y, r.w, r.h].every(Number.isFinite) && r.w > 0 && r.h > 0;
  const custom = Array.isArray(slot.regions) ? slot.regions.filter(ok).slice(0, 3) : [];
  const clamped = custom.map(r => ({
    x: clamp(r.x, 0, 1), y: clamp(r.y, 0, 1), w: Math.min(r.w, 1 - clamp(r.x, 0, 1)), h: Math.min(r.h, 1 - clamp(r.y, 0, 1)),
  })).filter(ok);
  const regions = clamped.length ? clamped : REGIONS[platform][index % 6].map(([x, y, w, h]) => ({ x, y, w, h }));

  const top = v(platform === 'mac' ? 30 : 27);
  const bottom = H - u(platform === 'mac' ? 2.5 : 4);
  const gap = u(platform === 'mac' ? 1 : 2);
  const cards = regions.map((r, k) => {
    const s = { x: scr.x + r.x * scr.w, y: scr.y + r.y * scr.h, w: r.w * scr.w, h: r.h * scr.h };
    const c = r.x + r.w / 2;
    const side = Math.abs(c - 0.5) < 0.04 ? (k % 2 === 0 ? -1 : 1) : (c < 0.5 ? -1 : 1);
    const cw = Math.min(s.w * p.grow, devW * p.maxW);
    const ch = cw * s.h / s.w;
    const x = side < 0 ? devL - cw * p.out : devL + devW - cw * (1 - p.out);
    return { r, s, side, w: cw, h: ch, x: clamp(x, u(3), W - u(3) - cw), y: s.y + s.h / 2 - ch / 2 - u(platform === 'mac' ? 0.6 : 1.2) };
  });
  // Keep cards on each side from overlapping and inside the canvas below the header.
  for (const side of [-1, 1]) {
    const list = cards.filter(c => c.side === side).sort((a, b) => a.y - b.y);
    let y = top;
    for (const c of list) { c.y = Math.max(c.y, y); y = c.y + c.h + gap; }
    let lim = bottom;
    for (const c of list.reverse()) { c.y = Math.min(c.y, lim - c.h); lim = c.y - gap; }
  }
  return { devW, devH, devL, devT, scr, cards };
}

export default {
  id,
  name: 'Exploded UI',
  summary: 'Device with two or three pieces of its own screen lifted out as floating, shadowed cards that slide over the frame edge, leaving tinted sockets behind.',
  themes: ['dark', 'light'],
  fonts: { display: "'Inter Tight'", text: "'Inter Tight'", mono: "'JetBrains Mono'" },
  palette: {
    light: { bg: '#ECEEF2', ink: '#0F1115', muted: '#5A606C', card: 'rgba(15,17,21,.10)', frame: '#FFFFFF' },
    dark: { bg: '#0A0B0F', ink: '#F3F4F6', muted: '#9CA3AF', card: 'rgba(255,255,255,.16)', frame: '#24262D' },
  },

  css: (ctx) => {
    const { u, v, platform, W } = ctx;
    const p = L[platform];
    const g = geometry(ctx);
    const mac = platform === 'mac';
    const dark = ctx.theme === 'dark';
    const rad = u(mac ? 0.55 : 1.6);
    const pad = u(mac ? 0.28 : 0.9);
    return `
.sb-${id} { background:
  radial-gradient(60% 55% at 50% ${(g.devT + g.devH * 0.45) / ctx.H * 100}%, color-mix(in oklab, var(--accent) ${dark ? 26 : 18}%, transparent), transparent 70%),
  linear-gradient(180deg, var(--bg), color-mix(in oklab, var(--accent) ${dark ? 6 : 5}%, var(--bg))); }
.sb-${id} .stage { position: absolute; left: ${g.devL}px; top: ${g.devT}px; }
.sb-${id} .socket { position: absolute; border-radius: ${rad * 0.6}px;
  background: color-mix(in oklab, var(--accent) ${dark ? 22 : 16}%, rgba(0,0,0,${dark ? 0.45 : 0.18}));
  box-shadow: inset 0 0 0 ${Math.max(2, u(mac ? 0.09 : 0.2))}px color-mix(in oklab, var(--accent) 80%, transparent); }
.sb-${id} .card { position: absolute; padding: ${pad}px; margin: ${-pad}px 0 0 ${-pad}px; border-radius: ${rad + pad}px; background: var(--frame);
  box-shadow: 0 0 0 ${Math.max(1.5, u(mac ? 0.05 : 0.12))}px var(--card),
  0 ${u(mac ? 1.4 : 3)}px ${u(mac ? 3.2 : 7)}px rgba(0,0,0,${dark ? 0.6 : 0.3}), 0 ${u(mac ? 0.3 : 0.7)}px ${u(mac ? 0.8 : 1.6)}px rgba(0,0,0,${dark ? 0.45 : 0.18}); }
.sb-${id} .card .sb-crop { box-shadow: 0 0 0 1px var(--card); }
.sb-${id} .card i { position: absolute; top: ${-u(mac ? 0.45 : 1) }px; width: ${u(mac ? 0.9 : 2)}px; height: ${u(mac ? 0.9 : 2)}px; border-radius: 50%;
  background: var(--accent); box-shadow: 0 0 0 ${u(mac ? 0.22 : 0.5)}px var(--bg); }
.sb-${id} .head { position: absolute; }
.sb-${id}.sb-mac .head { left: ${u(6)}px; right: ${u(6)}px; top: ${v(7)}px; height: ${v(21)}px; display: grid; grid-template-columns: 1.6fr 1fr; column-gap: ${u(5)}px; align-content: end; align-items: end; }
.sb-${id}:not(.sb-mac) .head { left: ${u(8)}px; right: ${u(8)}px; top: ${u(platform === 'iphone' ? 11 : 6)}px; height: ${g.devT - u(platform === 'iphone' ? 15 : 9)}px;
  display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
.sb-${id} .kicker { font: 400 ${u(p.kick)}px/1.2 var(--font-mono); letter-spacing: .06em; text-transform: uppercase; color: var(--accent); }
.sb-${id}.sb-dark .kicker { color: color-mix(in oklab, var(--accent) 60%, #fff); }
.sb-${id}.sb-mac .kicker { grid-column: 1 / -1; }
.sb-${id} .kicker::before { content: '[ '; opacity: .6; } .sb-${id} .kicker::after { content: ' ]'; opacity: .6; }
.sb-${id} h1 { display: block; margin-top: ${u(p.kick * 1.0)}px; font: 800 ${u(p.h1)}px/1.03 var(--font-display); letter-spacing: -.03em; color: var(--ink); text-wrap: balance; }
.sb-${id}:lang(ja) h1 { font-family: 'Noto Sans JP', sans-serif; font-weight: 900; line-height: 1.14; letter-spacing: 0; }
.sb-${id} .sub { display: block; margin-top: ${u(mac ? 0 : p.sub * 0.85)}px; font: 400 ${u(p.sub)}px/1.4 var(--font-text); color: var(--muted); text-wrap: pretty; }
.sb-${id}.sb-mac .sub { margin-bottom: ${u(0.35)}px; }
.sb-${id}:not(.sb-mac) .sub { max-width: ${u(platform === 'iphone' ? 80 : 70)}px; text-wrap: balance; }
`;
  },

  render(ctx) {
    const { slot, esc, platform } = ctx;
    const p = L[platform];
    const g = geometry(ctx);
    const mac = platform === 'mac';
    const rad = ctx.u(mac ? 0.55 : 1.6);
    const sockets = g.cards.map(c => `<div class="socket" style="left:${c.s.x}px;top:${c.s.y}px;width:${c.s.w}px;height:${c.s.h}px"></div>`).join('');
    const cards = g.cards.map(c => `<div class="card" style="left:${c.x}px;top:${c.y}px">${ctx.crop({ ...c.r, width: c.w, radius: rad })}` +
      `<i style="${c.side < 0 ? `right:${ctx.u(mac ? 0.8 : 1.8)}px` : `left:${ctx.u(mac ? 0.8 : 1.8)}px`}"></i></div>`).join('');
    return `
      <div class="stage">${ctx.device({ width: g.devW })}</div>
      ${sockets}${cards}
      <div class="head">
        <div class="kicker">${esc(slot.kicker)}</div>
        <h1 data-fit="${p.lines}">${esc(slot.headline)}</h1>
        <div class="sub" data-fit="${p.subLines}">${esc(slot.sub)}</div>
      </div>`;
  },
};
