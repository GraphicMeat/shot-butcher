// Zoom Callout: the device at a moderate size plus a circular loupe that magnifies one region of
// the capture, tied to that region by a soft tangent cone. Region: slot.zoom {x,y,w,h} (fractions of
// the capture) when the slot has one, else a per-platform default per index that lands on real UI.
const id = 'zoom-callout';

// Default regions per index: centre (cx, cy) and side s, all fractions (s of capture width).
// iPad defaults are deliberately central: the current iPad captures are being re-shot.
const ZOOM = {
  mac: [
    { cx: 0.62, cy: 0.2, s: 0.17 },  // unified inbox: open message header, "Saved in your vault"
    { cx: 0.37, cy: 0.18, s: 0.18 }, // chat view: conversation rows
    { cx: 0.87, cy: 0.9, s: 0.17 },  // archive: Downloading / migrating card
    { cx: 0.27, cy: 0.19, s: 0.15 }, // vault: "In your vault" counter + green vault rows
    { cx: 0.37, cy: 0.33, s: 0.17 }, // time capsule: Mailbox Snapshots card + snapshot entry
    { cx: 0.45, cy: 0.52, s: 0.2 },  // link safety: the two addresses
  ],
  iphone: [
    { cx: 0.5, cy: 0.72, s: 0.6 },  // welcome: headline + Create button
    { cx: 0.62, cy: 0.56, s: 0.42 }, // selection grid with checkmarks
    { cx: 0.5, cy: 0.27, s: 0.42 },  // layout: film + gradient photos
    { cx: 0.3, cy: 0.41, s: 0.42 },  // photo tools: toolbar under selection
    { cx: 0.5, cy: 0.29, s: 0.45 },  // cover photos
    { cx: 0.7, cy: 0.43, s: 0.45 },  // export menu: Export + Blurb / PDF options
  ],
  ipad: [
    { cx: 0.5, cy: 0.45, s: 0.3 }, { cx: 0.5, cy: 0.42, s: 0.3 }, { cx: 0.55, cy: 0.5, s: 0.3 },
    { cx: 0.55, cy: 0.45, s: 0.3 }, { cx: 0.5, cy: 0.5, s: 0.3 }, { cx: 0.5, cy: 0.5, s: 0.3 },
  ],
};

// Layout per platform (% of W for x/sizes, % of H for y).
const L = {
  mac: { dev: 56, devL: 39, devT: 22, loupe: 27, h1: 3.5, sub: 1.38, kick: 0.95, lines: 3, subLines: 3 },
  iphone: { dev: 62, devT: 30, loupe: 54, h1: 8.4, sub: 3.6, kick: 2.6, lines: 3, subLines: 3 },
  ipad: { dev: 60, devT: 30, loupe: 38, h1: 5.6, sub: 2.3, kick: 1.6, lines: 2, subLines: 2 },
};

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

function geometry(ctx) {
  const { platform, W, H, index, capture: cap, slot } = ctx;
  const p = L[platform];
  const u = n => n * W / 100, v = n => n * H / 100;
  const devW = u(p.dev);
  const devH = ctx.deviceHeight(devW);
  const flip = index % 2 === 1;
  let devL, devT;
  if (platform === 'mac') { devL = u(p.devL); devT = v(p.devT); }
  else { devL = flip ? W - devW - u(9) : u(9); devT = v(p.devT); }
  const bezel = platform === 'mac' ? 0 : devW * (platform === 'iphone' ? 0.034 : 0.026);
  const scr = { x: devL + bezel, y: devT + bezel, w: devW - 2 * bezel };
  scr.h = scr.w * cap.h / cap.w;

  // Region: square in capture pixels.
  let cx, cy, side;
  const z = slot.zoom;
  if (z && [z.x, z.y, z.w, z.h].every(Number.isFinite)) {
    cx = z.x + z.w / 2; cy = z.y + z.h / 2; side = Math.max(z.w * cap.w, z.h * cap.h);
  } else {
    const d = ZOOM[platform][index % ZOOM[platform].length];
    cx = d.cx; cy = d.cy; side = d.s * cap.w;
  }
  side = Math.min(side, cap.w, cap.h);
  const wf = side / cap.w, hf = side / cap.h;
  const rx = clamp(cx - wf / 2, 0, 1 - wf), ry = clamp(cy - hf / 2, 0, 1 - hf);
  const m = { x: scr.x + (rx + wf / 2) * scr.w, y: scr.y + (ry + hf / 2) * scr.h, r: wf * scr.w / 2 };

  // Loupe placement.
  const D = u(p.loupe);
  let lx, ly;
  if (platform === 'mac') { lx = u(25); ly = v(72); }
  else {
    const low = (m.y - devT) / devH < 0.5;
    lx = flip ? devL + u(3) : devL + devW - u(3);
    lx = clamp(lx, D / 2 + u(3), W - D / 2 - u(3));
    ly = low ? devT + devH * 0.74 : devT + devH * 0.36;
  }
  return { devW, devH, devL, devT, region: { x: rx, y: ry, w: wf, h: hf }, m, loupe: { x: lx, y: ly, r: D / 2, D }, flip };
}

// External tangent lines between the marker circle and the loupe circle.
function cone(c1, c2) {
  const dx = c2.x - c1.x, dy = c2.y - c1.y, d = Math.hypot(dx, dy);
  if (d <= Math.abs(c2.r - c1.r) + 1) return null;
  const th = Math.atan2(dy, dx), a = Math.acos((c1.r - c2.r) / d);
  const pts = [th + a, th - a].map(f => {
    const n = [Math.cos(f), Math.sin(f)];
    return [[c1.x + c1.r * n[0], c1.y + c1.r * n[1]], [c2.x + c2.r * n[0], c2.y + c2.r * n[1]]];
  });
  return pts;
}

export default {
  id,
  name: 'Zoom Callout',
  summary: 'Device at a moderate size with a circular loupe magnifying one region of the screen, joined to it by a soft tangent cone; serif headline.',
  themes: ['light', 'dark'],
  fonts: { display: "'DM Serif Display'", text: "'Instrument Sans'" },
  palette: {
    light: { bg: '#F4F2EE', ink: '#15161A', muted: '#5A5E68', ring: '#FFFFFF', dot: 'rgba(21,22,26,.07)' },
    dark: { bg: '#0D0E12', ink: '#F4F3F0', muted: '#A2A6B0', ring: '#F4F3F0', dot: 'rgba(255,255,255,.06)' },
  },

  css: (ctx) => {
    const { u, v, platform, W, H } = ctx;
    const p = L[platform];
    const g = geometry(ctx);
    const mac = platform === 'mac';
    const ringW = Math.max(4, u(mac ? 0.32 : 0.75));
    const dark = ctx.theme === 'dark';
    return `
.sb-${id} { background:
  radial-gradient(circle at ${g.loupe.x}px ${g.loupe.y}px, color-mix(in oklab, var(--accent) ${dark ? 30 : 22}%, transparent) 0, transparent ${g.loupe.r * 2.2}px),
  radial-gradient(var(--dot) ${Math.max(1.5, u(mac ? 0.09 : 0.2))}px, transparent ${Math.max(2, u(mac ? 0.1 : 0.22))}px) 0 0 / ${u(mac ? 1.25 : 2.8)}px ${u(mac ? 1.25 : 2.8)}px,
  var(--bg); }
.sb-${id} .stage { position: absolute; left: ${g.devL}px; top: ${g.devT}px; }
.sb-${id} svg.cone { position: absolute; left: 0; top: 0; width: ${W}px; height: ${H}px; pointer-events: none; }
.sb-${id} .mark { position: absolute; left: ${g.m.x - g.m.r}px; top: ${g.m.y - g.m.r}px; width: ${g.m.r * 2}px; height: ${g.m.r * 2}px; border-radius: 50%;
  box-shadow: 0 0 0 ${Math.max(3, ringW * 0.6)}px var(--accent), 0 0 0 ${Math.max(5, ringW * 1.3)}px color-mix(in oklab, var(--accent) 30%, transparent), 0 0 ${u(mac ? 2 : 4)}px color-mix(in oklab, var(--accent) 50%, transparent); }
.sb-${id} .loupe { position: absolute; left: ${g.loupe.x - g.loupe.r}px; top: ${g.loupe.y - g.loupe.r}px; width: ${g.loupe.D}px; height: ${g.loupe.D}px; border-radius: 50%;
  box-shadow: 0 0 0 ${ringW}px var(--ring), 0 0 0 ${ringW * 1.6}px var(--accent), 0 ${u(mac ? 1.6 : 3.2)}px ${u(mac ? 4 : 8)}px rgba(0,0,0,${dark ? 0.55 : 0.28}); overflow: hidden; background: var(--bg); }
.sb-${id} .loupe .sb-crop { position: absolute; left: 0; top: 0; }
.sb-${id} .head { position: absolute; display: flex; flex-direction: column; }
.sb-${id}.sb-mac .head { left: ${u(6)}px; top: ${v(9)}px; width: ${u(30)}px; height: ${g.loupe.y - g.loupe.r - u(2.5) - v(9)}px; justify-content: center; }
.sb-${id}:not(.sb-mac) .head { left: ${u(8)}px; right: ${u(8)}px; top: ${u(platform === 'iphone' ? 11 : 6)}px; height: ${g.devT - u(platform === 'iphone' ? 15 : 9)}px; align-items: center; text-align: center; justify-content: center; }
.sb-${id} .kicker { display: inline-flex; align-items: center; gap: ${u(p.kick * 0.6)}px; font: 600 ${u(p.kick)}px/1.2 var(--font-text); letter-spacing: .14em; text-transform: uppercase; color: var(--muted); }
.sb-${id} .kicker::before { content: ''; width: ${u(p.kick * 0.8)}px; height: ${u(p.kick * 0.8)}px; border-radius: 50%; box-shadow: inset 0 0 0 ${Math.max(2, u(p.kick * 0.16))}px var(--accent); flex: none; }
.sb-${id} h1 { display: block; margin-top: ${u(p.kick * 1.0)}px; font: 400 ${u(p.h1)}px/1.04 var(--font-display); letter-spacing: -.01em; color: var(--ink); text-wrap: balance; }
.sb-${id}:lang(ja) h1 { font-family: 'Noto Sans JP', sans-serif; font-weight: 700; line-height: 1.16; letter-spacing: 0; }
.sb-${id} .sub { display: block; margin-top: ${u(p.sub * 0.85)}px; font: 400 ${u(p.sub)}px/1.42 var(--font-text); color: var(--muted); text-wrap: pretty; }
.sb-${id}:not(.sb-mac) .sub { max-width: ${u(platform === 'iphone' ? 80 : 70)}px; text-wrap: balance; }
`;
  },

  render(ctx) {
    const { slot, esc, platform, W, H } = ctx;
    const p = L[platform];
    const g = geometry(ctx);
    const t = cone(g.m, g.loupe);
    const sw = Math.max(2, ctx.u(platform === 'mac' ? 0.1 : 0.22));
    const svg = t ? `<svg class="cone" viewBox="0 0 ${W} ${H}">
        <defs><mask id="zc-m" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}">
          <rect width="${W}" height="${H}" fill="#fff"/>
          <circle cx="${g.m.x}" cy="${g.m.y}" r="${g.m.r}" fill="#000"/><circle cx="${g.loupe.x}" cy="${g.loupe.y}" r="${g.loupe.r}" fill="#000"/>
        </mask></defs>
        <g mask="url(#zc-m)"><polygon points="${t[0][0].join(',')} ${t[0][1].join(',')} ${t[1][1].join(',')} ${t[1][0].join(',')}" fill="var(--accent)" fill-opacity=".14"/>
        <line x1="${t[0][0][0]}" y1="${t[0][0][1]}" x2="${t[0][1][0]}" y2="${t[0][1][1]}" stroke="var(--accent)" stroke-width="${sw}" stroke-linecap="round"/>
        <line x1="${t[1][0][0]}" y1="${t[1][0][1]}" x2="${t[1][1][0]}" y2="${t[1][1][1]}" stroke="var(--accent)" stroke-width="${sw}" stroke-linecap="round"/></g>
      </svg>` : '';
    const crop = ctx.crop({ ...g.region, width: g.loupe.D });
    return `
      <div class="stage">${ctx.device({ width: g.devW })}</div>
      ${svg}
      <div class="mark"></div>
      <div class="loupe">${crop}</div>
      <div class="head">
        <div class="kicker">${esc(slot.kicker)}</div>
        <h1 data-fit="${p.lines}">${esc(slot.headline)}</h1>
        <div class="sub" data-fit="${p.subLines}">${esc(slot.sub)}</div>
      </div>`;
  },
};
