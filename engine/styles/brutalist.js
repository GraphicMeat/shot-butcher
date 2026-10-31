// Brutalist: raw flat background, huge uppercase Archivo Black in thick-bordered blocks with hard
// zero-blur offset shadows, the capture in a square slab frame, and a tilted feature ticker band.
const id = 'brutalist';

export default {
  id,
  name: 'Brutalist',
  summary: 'Loud flat background, huge uppercase Archivo Black in thick-bordered blocks with hard offset shadows, square slab-framed capture and a tilted feature ticker.',
  themes: ['light', 'dark'],
  fonts: { display: "'Archivo Black'", text: "'Inter Tight'", mono: "'JetBrains Mono'" },
  palette: {
    // bg = loud canvas, ink = text set straight on it, block/blockInk = headline slab, edge = borders,
    // hard = offset-shadow colour, tag/tagInk = kicker label, band/bandInk = feature ticker.
    light: { bg: 'var(--accent)', ink: '#0A0A0A', block: '#FFFFFF', blockInk: '#0A0A0A', edge: '#0A0A0A', hard: '#0A0A0A', tag: '#0A0A0A', tagInk: '#FFFFFF', band: '#0A0A0A', bandInk: '#FFFFFF' },
    dark: { bg: '#0B0B0B', ink: '#F2EFE6', block: '#F2EFE6', blockInk: '#0B0B0B', edge: '#F2EFE6', hard: 'var(--accent)', tag: 'var(--accent)', tagInk: '#0B0B0B', band: 'var(--accent)', bandInk: '#0B0B0B' },
  },

  css: ({ u, platform }) => {
    // per-platform metrics: border, hard-shadow offset, headline size, sub size, padding
    const m = {
      mac: { b: u(0.95), o: u(1.25), h1: u(4.3), sub: u(1.55), tag: u(1.25), pad: u(1.5), band: u(1.6) },
      iphone: { b: u(1.35), o: u(2.3), h1: u(10.4), sub: u(3.7), tag: u(3.3), pad: u(3.6), band: u(3.9) },
      ipad: { b: u(1.2), o: u(1.9), h1: u(7), sub: u(2.65), tag: u(2.3), pad: u(2.5), band: u(2.7) },
    }[platform];
    return `
.sb-${id} { background: var(--bg); color: var(--ink); }
.sb-${id} .tag { display: inline-block; background: var(--tag); color: var(--tagInk); border: ${m.b}px solid var(--edge);
  font: 900 ${m.tag}px/1 var(--font-display); font-synthesis: none; text-transform: uppercase; letter-spacing: .04em;
  padding: ${m.tag * 0.42}px ${m.tag * 0.6}px ${m.tag * 0.36}px; white-space: nowrap; max-width: 100%; overflow: hidden; }
.sb-${id} .slab { background: var(--block); color: var(--blockInk); border: ${m.b}px solid var(--edge);
  box-shadow: ${m.o}px ${m.o}px 0 0 var(--hard); padding: ${m.pad}px ${m.pad * 1.1}px ${m.pad * 0.9}px; }
.sb-${id} h1 { text-wrap: balance; font: 900 ${m.h1}px/.95 var(--font-display); font-synthesis: none; text-transform: uppercase; letter-spacing: -.012em; overflow-wrap: normal; }
.sb-${id}:lang(ja) h1 { letter-spacing: 0; line-height: 1.08; }
.sb-${id} .sub { font: 600 ${m.sub}px/1.28 var(--font-text); letter-spacing: -.01em; color: var(--ink); }
.sb-${id} .frame { position: absolute; background: var(--edge); border: ${m.b}px solid var(--edge); box-shadow: ${m.o}px ${m.o}px 0 0 var(--hard); }
.sb-${id} .frame > .sb-device { display: block; }
.sb-${id} .band { position: absolute; left: -15%; width: 130%; background: var(--band); color: var(--bandInk);
  border-top: ${m.b}px solid var(--edge); border-bottom: ${m.b}px solid var(--edge); transform: rotate(-3deg);
  white-space: nowrap; overflow: hidden; padding: ${m.band * 0.5}px 0 ${m.band * 0.42}px; z-index: 3; }
.sb-${id} .band span { display: inline-block; font: 900 ${m.band}px/1 var(--font-display); font-synthesis: none; text-transform: uppercase; letter-spacing: .02em; vertical-align: middle; }
.sb-${id} .band i { display: inline-block; width: ${m.band * 0.42}px; height: ${m.band * 0.42}px; background: currentColor; margin: 0 ${m.band * 0.7}px; vertical-align: middle; }
.sb-${id} .col { position: absolute; display: flex; flex-direction: column; align-items: flex-start; }
.sb-${id} .col .slab { align-self: stretch; }
`;
  },

  render(ctx) {
    const { platform, slot, features, esc, u, v, W, H, index } = ctx;
    const n = features.length;
    // ticker: every feature, starting at a slot-dependent offset, repeated so the band always overfills
    const order = n ? features.map((_, i) => features[(i + index * 2) % n]) : [];
    const ticker = [...order, ...order].map(f => `<span>${esc(f)}</span><i></i>`).join('');

    const b = { mac: u(0.95), iphone: u(1.35), ipad: u(1.2) }[platform];
    const frame = (left, top, outer) => {
      const inner = outer - 2 * b;
      const dev = platform === 'mac'
        // square off the window's rounded transparent corners
        ? ctx.crop({ x: 0.01, y: 0.016, w: 0.98, h: 0.968, width: inner })
        : ctx.device({ width: inner, frame: false, shadow: false, style: 'border-radius:0' });
      return `<div class="frame" style="left:${left}px;top:${top}px;width:${outer}px">${dev}</div>`;
    };
    const text = (left, top, width, lines) => `
      <div class="col" style="left:${left}px;top:${top}px;width:${width}px;gap:${platform === 'mac' ? u(1.8) : platform === 'iphone' ? u(3.2) : u(2.2)}px">
        <div class="tag">${esc(slot.kicker)}</div>
        <div class="slab"><h1 data-fit="${lines}">${esc(slot.headline)}</h1></div>
        <div class="sub" data-fit="${platform === 'ipad' ? 2 : 3}">${esc(slot.sub)}</div>
      </div>`;

    if (platform === 'mac') {
      const P = u(4);
      const devW = u(53);
      return `${text(P, P, W - 2 * P - devW - u(4.5), 5)}
        ${frame(W - P - devW - u(1.25), v(11.5), devW)}
        ${n ? `<div class="band" style="top:${v(83)}px">${ticker}</div>` : ""}`;
    }
    if (platform === 'iphone') {
      const P = u(6);
      const devW = u(66);
      return `${text(P, P, W - 2 * P - u(2.3), 4)}
        ${frame((W - devW) / 2 - u(1.15), v(41.5), devW)}
        ${n ? `<div class="band" style="top:${v(84)}px">${ticker}</div>` : ""}`;
    }
    const P = u(5.5);
    const devW = u(68);
    return `${text(P, P, W - 2 * P - u(1.9), 3)}
      ${frame((W - devW) / 2 - u(0.95), v(40), devW)}
      ${n ? `<div class="band" style="top:${v(85)}px">${ticker}</div>` : ""}`;
  },
};
