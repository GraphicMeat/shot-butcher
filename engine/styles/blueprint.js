// Blueprint: the screen drawn as a technical drawing on a fine grid. The device gets a thin line outline
// with a dashed offset contour and a dash-dot centre line; dimension lines carry the slot kicker and
// the app name (never measurements), and leader lines label parts of the UI with real feature names.
const id = 'blueprint';

export default {
  id,
  name: 'Blueprint',
  summary: 'Technical drawing on a fine grid: outlined device with dashed contour and centre line, dimension lines labelled with the kicker and app name, mono leader-line callouts naming features.',
  themes: ['dark', 'light'],
  fonts: { display: "'Space Grotesk'", text: "'Space Grotesk'", mono: "'JetBrains Mono'" },
  palette: {
    light: { bg: '#F5F7FB', ink: '#0E2C63', muted: 'rgba(14,44,99,.72)', line: '#1E4FA3', minor: 'rgba(30,79,163,.11)', major: 'rgba(30,79,163,.22)', paper: '#F5F7FB' },
    dark: { bg: '#0F3B83', ink: '#FFFFFF', muted: 'rgba(255,255,255,.78)', line: '#FFFFFF', minor: 'rgba(255,255,255,.09)', major: 'rgba(255,255,255,.2)', paper: '#0F3B83' },
  },

  css: ({ u, platform }) => {
    const m = {
      mac: { g: u(0.75), h1: u(3.5), sub: u(1.3), lab: u(0.98), dim: u(0.95), sw: 2.2 },
      iphone: { g: u(2), h1: u(8.4), sub: u(3.2), lab: u(2.35), dim: u(2.3), sw: 2.4 },
      ipad: { g: u(1.3), h1: u(5.5), sub: u(2.1), lab: u(1.55), dim: u(1.5), sw: 2.4 },
    }[platform];
    const G = m.g;
    return `
.sb-${id} { background:
  repeating-linear-gradient(0deg, var(--major) 0 2px, transparent 2px ${G * 5}px),
  repeating-linear-gradient(90deg, var(--major) 0 2px, transparent 2px ${G * 5}px),
  repeating-linear-gradient(0deg, var(--minor) 0 1px, transparent 1px ${G}px),
  repeating-linear-gradient(90deg, var(--minor) 0 1px, transparent 1px ${G}px),
  var(--bg); }
.sb-${id}.sb-dark::after { content: ''; position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(ellipse 85% 75% at 50% 45%, transparent 55%, rgba(4,20,52,.45)); }
.sb-${id} svg.ov { position: absolute; left: 0; top: 0; overflow: visible; z-index: 2; }
.sb-${id} svg.ov * { stroke: var(--line); fill: none; stroke-width: ${m.sw}; vector-effect: non-scaling-stroke; }
.sb-${id} svg.ov .thin { stroke-width: ${m.sw * 0.6}; }
.sb-${id} svg.ov .ctr { stroke-width: ${m.sw * 0.6}; stroke-dasharray: ${G * 2.4} ${G * 0.6} ${G * 0.3} ${G * 0.6}; opacity: .7; }
.sb-${id} svg.ov .dot { fill: var(--paper); stroke-width: ${m.sw * 1.1}; }
.sb-${id} svg.ov .pin { fill: var(--line); stroke: none; }
.sb-${id} .contour { position: absolute; border: ${m.sw * 0.7}px dashed var(--line); opacity: .75; z-index: 1; }
.sb-${id} .dev { position: absolute; z-index: 1; }
.sb-${id} .head { position: absolute; z-index: 3; }
.sb-${id} h1 { text-wrap: balance; font: 700 ${m.h1}px/1.04 var(--font-display); letter-spacing: -.03em; color: var(--ink); }
.sb-${id}:lang(ja) h1 { letter-spacing: 0; line-height: 1.2; }
.sb-${id} .sub { font: 400 ${m.sub}px/1.38 var(--font-text); color: var(--muted); margin-top: ${m.sub * 0.6}px; }
.sb-${id} .dimlab { position: absolute; z-index: 3; transform: translate(-50%, -50%); background: var(--paper);
  padding: ${m.dim * 0.15}px ${m.dim * 0.7}px; width: max-content; overflow: hidden; white-space: nowrap;
  font: 700 ${m.dim}px/1.2 var(--font-mono); letter-spacing: .08em; text-transform: uppercase; color: var(--ink); }
.sb-${id} .vlab { position: absolute; z-index: 3; writing-mode: vertical-rl; transform: translate(-50%, -50%) rotate(180deg);
  background: var(--paper); padding: ${m.dim * 0.7}px ${m.dim * 0.15}px; white-space: nowrap;
  font: 700 ${m.dim}px/1.2 var(--font-mono); letter-spacing: .08em; text-transform: uppercase; color: var(--ink); }
.sb-${id} .lab { position: absolute; z-index: 3; font: 400 ${m.lab}px/1.22 var(--font-mono); letter-spacing: .04em;
  text-transform: uppercase; color: var(--ink); }
.sb-${id} .dimlab > div { overflow: hidden; white-space: nowrap; }
.sb-${id}:lang(ja) .lab, .sb-${id}:lang(ja) .dimlab, .sb-${id}:lang(ja) .vlab { letter-spacing: .02em; }
.sb-${id} .tb { position: absolute; z-index: 3; display: grid; grid-template-columns: auto 1fr; border: ${m.sw}px solid var(--line); background: var(--paper); }
.sb-${id} .tb > div { padding: ${m.lab * 0.55}px ${m.lab * 0.9}px; display: flex; align-items: center; }
.sb-${id} .tb > div + div { border-left: ${m.sw * 0.6}px solid var(--line); }
.sb-${id} .tb b { font: 700 ${m.lab * 1.35}px/1 var(--font-display); color: var(--ink); letter-spacing: -.01em; white-space: nowrap; }
.sb-${id} .tb span { font: 400 ${m.lab * 0.9}px/1.2 var(--font-mono); color: var(--muted); letter-spacing: .08em; text-transform: uppercase; white-space: nowrap; }
`;
  },

  render(ctx) {
    const { platform, slot, app, features, esc, u, v, W, H, index } = ctx;
    const mac = platform === 'mac';
    const L = {
      // device box, head box, leader label column, leader heights (fractions of the screen), title block
      mac: { devW: u(54), left: W - u(6) - u(54), top: v(36), head: [u(5), u(4.5), u(52)], hl: 2, sl: 2,
        side: 'left', labX: u(5), labW: u(27), pts: [[0.07, 0.2], [0.3, 0.47], [0.14, 0.72]], ext: u(2.4) },
      iphone: { devW: u(54), left: u(10), top: v(28.5), head: [u(7), u(8), u(86)], hl: 3, sl: 2,
        side: 'right', labX: u(10) + u(54) + u(3.5), labW: W - u(10) - u(54) - u(3.5) - u(5.5), pts: [[0.72, 0.2], [0.6, 0.5], [0.76, 0.8]], ext: u(4.2) },
      ipad: { devW: u(56), left: u(12), top: v(25), head: [u(6), u(6), u(84)], hl: 2, sl: 2,
        side: 'right', labX: u(12) + u(56) + u(3.2), labW: W - u(12) - u(56) - u(3.2) - u(6), pts: [[0.72, 0.2], [0.58, 0.5], [0.78, 0.8]], ext: u(2.8) },
    }[platform];
    const g = { mac: u(0.75), iphone: u(2), ipad: u(1.3) }[platform];
    const { devW, left, top } = L;
    const devH = ctx.deviceHeight(devW, { frame: false });
    const right = left + devW, bottom = top + devH, cx = left + devW / 2;
    const radius = mac ? devW * 0.0174 : devW * (platform === 'iphone' ? 0.13 : 0.035);
    const off = g * 1.2; // dashed contour offset

    // device: thin line outline drawn on the screen edge, dashed offset contour around it
    const dev = mac
      ? ctx.device({ width: devW, shadow: 'drop-shadow(2.5px 0 0 var(--line)) drop-shadow(-2.5px 0 0 var(--line)) drop-shadow(0 2.5px 0 var(--line)) drop-shadow(0 -2.5px 0 var(--line))' })
      : ctx.device({ width: devW, frame: false, shadow: '0 0 0 3px var(--line)' });
    const contour = `<div class="contour" style="left:${left - off}px;top:${top - off}px;width:${devW + 2 * off}px;height:${devH + 2 * off}px;border-radius:${radius + off}px"></div>`;

    // SVG: extension + dimension lines with 45deg ticks, centre lines, leaders
    const t = g * 0.7; // tick half-size
    const tick = (x, y) => `<line x1="${x - t}" y1="${y + t}" x2="${x + t}" y2="${y - t}"/>`;
    const parts = [];
    // horizontal dimension above the device (kicker)
    const dy = top - off - L.ext;
    parts.push(`<line class="thin" x1="${left}" y1="${top - off - g * 0.4}" x2="${left}" y2="${dy - g}"/>`,
      `<line class="thin" x1="${right}" y1="${top - off - g * 0.4}" x2="${right}" y2="${dy - g}"/>`,
      `<line x1="${left - g}" y1="${dy}" x2="${right + g}" y2="${dy}"/>`, tick(left, dy), tick(right, dy));
    // vertical dimension beside the device (app name)
    const dx = L.side === 'left' ? right + off + L.ext : left - off - L.ext;
    const ex0 = L.side === 'left' ? right + off + g * 0.4 : left - off - g * 0.4;
    const ex1 = L.side === 'left' ? dx + g : dx - g;
    parts.push(`<line class="thin" x1="${ex0}" y1="${top}" x2="${ex1}" y2="${top}"/>`,
      `<line class="thin" x1="${ex0}" y1="${bottom}" x2="${ex1}" y2="${bottom}"/>`,
      `<line x1="${dx}" y1="${top - g}" x2="${dx}" y2="${bottom + g}"/>`, tick(dx, top), tick(dx, bottom));
    // centre lines
    parts.push(`<line class="ctr" x1="${cx}" y1="${top - off - g * 2}" x2="${cx}" y2="${bottom + off + g * 2}"/>`,
      `<line class="ctr" x1="${left - off - g * 2}" y1="${top + devH / 2}" x2="${right + off + g * 2}" y2="${top + devH / 2}"/>`);

    // leaders: three real feature names, chosen by slot
    const n = features.length;
    const picks = n ? [0, 1, 2].slice(0, Math.min(3, n)).map(k => features[(index * 3 + k) % n]) : [];
    const labs = [];
    picks.forEach((f, k) => {
      const fy = L.pts[k][1];
      // leaders end on the screen outline, not on a specific control, so no label points at the wrong UI
      const px = L.side === 'left' ? left : right, py = top + fy * devH;
      const ly = py; // label baseline line at the same height
      if (L.side === 'left') {
        const x0 = L.labX, x1 = L.labX + L.labW, knee = left - off - g * 1.5;
        parts.push(`<polyline points="${x0},${ly} ${knee},${ly} ${px},${py}"/>`, `<circle class="dot" cx="${px}" cy="${py}" r="${g * 0.55}"/>`,
          `<circle class="pin" cx="${x0}" cy="${ly}" r="${g * 0.3}"/>`);
        labs.push(`<div class="lab" data-fit="2" style="left:${x0}px;bottom:${H - ly + g * 0.5}px;width:${x1 - x0}px">${esc(f)}</div>`);
      } else {
        const x0 = L.labX, x1 = L.labX + L.labW;
        parts.push(`<polyline points="${px},${py} ${x0},${ly} ${x1},${ly}"/>`, `<circle class="dot" cx="${px}" cy="${py}" r="${g * 0.55}"/>`,
          `<circle class="pin" cx="${x1}" cy="${ly}" r="${g * 0.3}"/>`);
        labs.push(`<div class="lab" data-fit="2" style="left:${x0}px;bottom:${H - ly + g * 0.5}px;width:${x1 - x0}px">${esc(f)}</div>`);
      }
    });

    const svg = `<svg class="ov" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${parts.join('')}</svg>`;
    const dimlab = `<div class="dimlab" style="left:${cx}px;top:${dy}px;max-width:${devW * 0.86}px"><div data-fit="1">${esc(slot.kicker)}</div></div>`;
    const vlab = `<div class="vlab" style="left:${dx}px;top:${top + devH / 2}px;max-height:${devH * 0.6}px">${esc(app.name)}</div>`;
    const [hx, hy, hw] = L.head;
    const head = `<div class="head" style="left:${hx}px;top:${hy}px;width:${hw}px"><h1 data-fit="${L.hl}">${esc(slot.headline)}</h1><div class="sub" data-fit="${L.sl}">${esc(slot.sub)}</div></div>`;

    // title block: app name and maker, like a drawing's title block
    const tbPos = mac
      ? `left:${u(5)}px;bottom:${H - bottom}px`
      : `right:${platform === 'iphone' ? u(5.5) : u(6)}px;bottom:${platform === 'iphone' ? u(7) : u(6)}px`;
    const tb = `<div class="tb" style="${tbPos}"><div><b>${esc(app.name)}</b></div><div><span>${esc(app.maker ?? '')}</span></div></div>`;

    return `${contour}<div class="dev" style="left:${left}px;top:${top}px">${dev}</div>${svg}${dimlab}${vlab}${labs.join('')}${head}${tb}`;
  },
};
