// Swiss Grid: International Typographic Style. A visible column grid (hairlines at every column edge),
// a label row over a heavy rule, a huge slot index "01", accent rule bars, a flush-left ragged-right
// headline and the device placed exactly on a span of grid columns. Flat, no ornament.
const id = 'swiss-grid';

const pad2 = n => String(n).padStart(2, '0');

function grid(ctx) {
  const { u, W, platform } = ctx;
  const spec = { mac: [12, u(4), u(1.25)], iphone: [4, u(7), u(3)], ipad: [6, u(5), u(2)] }[platform];
  const [n, m, gut] = spec;
  const col = (W - 2 * m - (n - 1) * gut) / n;
  const x = i => m + i * (col + gut);              // left edge of column i (0-based)
  const span = (a, b) => (b - a + 1) * col + (b - a) * gut; // width of columns a..b inclusive
  return { n, m, gut, col, x, span };
}

export default {
  id,
  name: 'Swiss Grid',
  summary: 'International Typographic Style: visible column grid, label row over a heavy rule, huge slot index, accent rule bars, flush-left headline, device locked to grid columns.',
  themes: ['light', 'dark'],
  fonts: { display: "'Inter Tight'", text: "'Inter Tight'" },
  palette: {
    light: { bg: '#F3F3F0', ink: '#0B0B0B', muted: '#55565A', grid: 'rgba(11,11,11,.075)' },
    dark: { bg: '#0D0D0E', ink: '#F2F2EF', muted: '#9B9CA2', grid: 'rgba(242,242,239,.075)' },
  },

  css: (ctx) => {
    const { u, v, platform } = ctx;
    const t = {
      mac: { label: u(1), num: u(12.5), h1: u(4.2), sub: u(1.3), rule: u(.2), bar: u(.55) },
      iphone: { label: u(2.5), num: u(26), h1: u(8.8), sub: u(2.6), rule: u(.45), bar: u(1.2) },
      ipad: { label: u(1.6), num: u(15), h1: u(6.6), sub: u(1.95), rule: u(.3), bar: u(.8) },
    }[platform];
    return `
.sb-${id} .gl { position: absolute; top: 0; bottom: 0; width: 2px; background: var(--grid); }
.sb-${id} .abs { position: absolute; }
.sb-${id} .label { font: 600 ${t.label}px/1.2 var(--font-text); letter-spacing: .01em; color: var(--ink); white-space: nowrap; overflow: hidden; }
.sb-${id} .label.k { color: var(--accent); }
.sb-${id} .label.r { text-align: right; font-variant-numeric: tabular-nums; }
.sb-${id} .label.r span { color: var(--muted); }
.sb-${id} .rule { height: ${t.rule}px; background: var(--ink); }
.sb-${id} .num { font: 800 ${t.num}px/.74 var(--font-display); letter-spacing: -.06em; color: var(--ink); margin-left: -.04em; font-variant-numeric: tabular-nums; }
.sb-${id} .bar { height: ${t.bar}px; background: var(--accent); }
.sb-${id} h1 { font: 700 ${t.h1}px/1.0 var(--font-display); letter-spacing: -.028em; color: var(--ink); text-align: left; }
.sb-${id} .sub { font: 500 ${t.sub}px/1.34 var(--font-text); color: var(--muted); }
.sb-${id} .kick { font: 700 ${t.sub}px/1.2 var(--font-text); color: var(--ink); letter-spacing: -.005em; }
.sb-${id} .stack { display: flex; flex-direction: column; }
.sb-${id} h1.boxed { max-height: 100%; overflow: hidden; padding-bottom: .12em; margin-bottom: -.12em; }
.sb-${id}:lang(ja) h1 { letter-spacing: 0; line-height: 1.18; }
`;
  },

  render(ctx) {
    const { platform, slot, esc, u, v, W, H, index, count, app } = ctx;
    const g = grid(ctx);
    const lines = [];
    for (let i = 0; i < g.n; i++) lines.push(g.x(i), g.x(i) + g.col - 2);
    const gl = lines.map(x => `<div class="gl" style="left:${x}px"></div>`).join('');
    const at = (x, y, w, html, extra = '') => `<div class="abs" style="left:${x}px;top:${y}px;width:${w}px;${extra}">${html}</div>`;
    const folio = `${pad2(index + 1)}<span> / ${pad2(count)}</span>`;
    const full = g.span(0, g.n - 1);

    if (platform === 'mac') {
      const top = v(6);
      const ruleY = top + u(2.4);
      const bodyY = ruleY + u(3.6);
      const w = g.span(4, 11);
      const h = ctx.deviceHeight(w);
      const subY = bodyY + h + u(2.2);
      return gl +
        at(g.x(0), top, g.span(0, 3), `<div class="label" data-fit="1">${esc(app.name)}</div>`) +
        at(g.x(4), top, g.span(4, 9), `<div class="label k" data-fit="1">${esc(slot.kicker)}</div>`) +
        at(g.x(10), top, g.span(10, 11), `<div class="label r">${folio}</div>`) +
        at(g.x(0), ruleY, full, `<div class="rule"></div>`) +
        at(g.x(0), bodyY, g.span(0, 3), `<div class="stack" style="height:${h}px;justify-content:space-between">
            <div class="num">${pad2(index + 1)}</div>
            <div><div class="bar" style="width:${g.span(0, 1)}px;margin-bottom:${u(1.8)}px"></div><h1 data-fit="5">${esc(slot.headline)}</h1></div>
          </div>`) +
        at(g.x(4), bodyY, w, ctx.device({ width: w, shadow: 'drop-shadow(0 18px 30px rgba(0,0,0,.18))' })) +
        at(g.x(4), subY - u(1.2), g.span(4, 11), `<div class="rule" style="height:2px;opacity:.35"></div>`) +
        at(g.x(4), subY, g.span(4, 9), `<div class="sub" data-fit="2">${esc(slot.sub)}</div>`);
    }

    const phone = platform === 'iphone';
    const top = phone ? v(4.4) : v(3.8);
    const ruleY = top + (phone ? u(5.2) : u(3.4));
    const numY = ruleY + (phone ? u(6) : u(4.4));
    const devCols = phone ? [1, 3] : [2, 5];
    const w = g.span(devCols[0], devCols[1]);
    const h = ctx.deviceHeight(w);
    const devY = H - g.m - h;
    const numH = (phone ? u(26) : u(15)) * .74;
    const headY = numY + numH + (phone ? u(5) : u(3.4));
    const headH = devY - headY - (phone ? u(4.5) : u(3));
    const capW = g.span(0, devCols[0] - 1);
    const shadow = phone ? '0 30px 60px -20px rgba(0,0,0,.30)' : '0 30px 60px -20px rgba(0,0,0,.26)';
    return gl +
      at(g.x(0), top, g.span(0, 1), `<div class="label" data-fit="1">${esc(app.name)}</div>`) +
      at(g.x(g.n - 1), top, g.col, `<div class="label r">${folio}</div>`) +
      at(g.x(0), ruleY, full, `<div class="rule"></div>`) +
      at(g.x(0), numY, g.span(0, phone ? 2 : 3), `<div class="num">${pad2(index + 1)}</div>`) +
      at(g.x(phone ? 3 : 4), numY, g.span(phone ? 3 : 4, g.n - 1), `<div class="bar"></div>`) +
      at(g.x(0), headY, g.span(0, phone ? 3 : 4), `<h1 class="boxed" data-fit="">${esc(slot.headline)}</h1>`, `height:${headH}px;display:flex;align-items:flex-end`) +
      at(g.x(0), devY, capW, `<div class="stack" style="gap:${phone ? u(2.4) : u(1.4)}px">
          <div class="bar" style="width:${g.col}px"></div>
          <div class="kick" data-fit="3">${esc(slot.kicker)}</div>
          <div class="sub" data-fit="${phone ? 12 : 8}">${esc(slot.sub)}</div>
        </div>`) +
      at(g.x(devCols[0]), devY, w, ctx.device({ width: w, shadow }));
  },
};
