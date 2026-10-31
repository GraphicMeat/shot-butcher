// True Bento: the capture in a large tile, surrounded by tiles for app identity, one measured stat,
// and every feature as its own small tile. Same grid on every shot; only the big tile changes.
const id = 'true-bento';

export default {
  id,
  name: 'True Bento',
  summary: 'Rounded tile grid: capture in the big tile, app identity and stat tiles, every feature as its own small tile.',
  themes: ['dark', 'light'],
  fonts: { display: "'Inter Tight'", text: "'Inter Tight'" },
  palette: {
    light: { bg: '#E9EBEF', surface: '#FFFFFF', ink: '#0E1116', muted: '#5B6472', line: 'rgba(0,0,0,.06)' },
    dark: { bg: '#08090C', surface: '#15171D', ink: '#F3F4F6', muted: '#9AA3B2', line: 'rgba(255,255,255,.07)' },
  },

  css: ({ u, platform }) => {
    const s = { mac: 1, iphone: 2.05, ipad: 1.32 }[platform];
    const k = n => u(n * s);
    return `
.sb-${id} { padding: ${k(2.2)}px; display: grid; gap: ${k(1)}px; }
.sb-${id}.sb-mac { grid-template-columns: 1.7fr 1fr; }
.sb-${id}.sb-iphone { grid-template-rows: 1fr auto auto; }
.sb-${id}.sb-ipad { grid-template-rows: 1fr auto auto; }
.sb-${id} .tile { background: var(--surface); border-radius: ${k(1.6)}px; box-shadow: inset 0 0 0 1px var(--line); overflow: hidden; position: relative; }
.sb-${id} .big { display: flex; flex-direction: column; padding: ${k(2.4)}px ${k(2.4)}px 0; }
.sb-${id} .kicker { font: 600 ${k(1.05)}px/1.2 var(--font-text); letter-spacing: .02em; color: var(--accent); text-transform: uppercase; }
.sb-${id} h1 { font: 800 ${k(2.9)}px/1.04 var(--font-display); letter-spacing: -.025em; margin-top: ${k(.7)}px; max-width: 92%; }
.sb-${id}.sb-iphone h1 { font-size: ${u(7)}px; }
.sb-${id} .sub { font: 400 ${k(1.2)}px/1.35 var(--font-text); color: var(--muted); margin-top: ${k(.8)}px; max-width: 88%; }
.sb-${id} .stage { flex: 1; position: relative; margin-top: ${k(1.8)}px; }
.sb-${id} .stage > .sb-device { position: absolute; left: 50%; top: 0; transform: translateX(-50%); }
.sb-${id} .side { display: grid; gap: ${k(1)}px; grid-template-rows: auto auto 1fr; min-height: 0; }
.sb-${id} .ident { padding: ${k(1.8)}px; display: flex; align-items: center; gap: ${k(1.2)}px; }
.sb-${id} .ident img { width: ${k(4.4)}px; height: ${k(4.4)}px; border-radius: 22%; }
.sb-${id} .ident b { font: 800 ${k(1.7)}px/1.1 var(--font-display); display: block; letter-spacing: -.01em; }
.sb-${id} .ident span { font: 400 ${k(1.05)}px/1.3 var(--font-text); color: var(--muted); display: block; margin-top: ${k(.3)}px; }
.sb-${id} .stat { padding: ${k(1.6)}px ${k(1.8)}px; background: var(--accent); color: #fff; box-shadow: none; }
.sb-${id} .stat b { font: 800 ${k(3.6)}px/1 var(--font-display); letter-spacing: -.03em; display: block; }
.sb-${id} .stat span { font: 500 ${k(1.05)}px/1.3 var(--font-text); opacity: .88; display: block; margin-top: ${k(.4)}px; }
.sb-${id} .feats { display: grid; gap: ${k(.8)}px; min-height: 0; }
.sb-${id}.sb-mac .feats { grid-template-columns: 1fr 1fr; grid-auto-rows: 1fr; }
.sb-${id}.sb-iphone .feats { grid-template-columns: 1fr 1fr 1fr; }
.sb-${id}.sb-ipad .feats { grid-template-columns: repeat(4, 1fr); }
.sb-${id} .feat { padding: ${k(.9)}px ${k(1)}px; display: flex; flex-direction: column; justify-content: space-between; gap: ${k(.5)}px; min-height: ${k(4.2)}px; }
.sb-${id} .feat i { width: ${k(.7)}px; height: ${k(.7)}px; border-radius: 50%; background: var(--accent); display: block; }
.sb-${id} .feat span { font: 600 ${k(.98)}px/1.18 var(--font-text); letter-spacing: -.005em; overflow: hidden; }
.sb-${id}.sb-mac .feat:last-child:nth-child(2n+1) { grid-column: span 2; }
.sb-${id}.sb-iphone .feat:last-child:nth-child(3n+1) { grid-column: span 3; }
.sb-${id}.sb-iphone .feat:last-child:nth-child(3n+2) { grid-column: span 2; }
.sb-${id}.sb-ipad .feat:last-child:nth-child(4n+1) { grid-column: span 4; }
.sb-${id}.sb-ipad .feat:last-child:nth-child(4n+2) { grid-column: span 3; }
.sb-${id}.sb-ipad .feat:last-child:nth-child(4n+3) { grid-column: span 2; }
.sb-${id} .row > :only-child { grid-column: span 2; }
.sb-${id} .row { display: grid; gap: ${k(1)}px; grid-template-columns: 1fr 1fr; }
`;
  },

  render(ctx) {
    const { platform, slot, app, features, stat, tagline, esc } = ctx;
    const big = (stageWidth) => `
      <div class="tile big">
        <div class="kicker">${esc(slot.kicker)}</div>
        <h1 data-fit="2">${esc(slot.headline)}</h1>
        <div class="sub" data-fit="2">${esc(slot.sub)}</div>
        <div class="stage">${ctx.device({ width: stageWidth })}</div>
      </div>`;
    const ident = `<div class="tile ident">${app.icon ? `<img src="${app.icon}" alt="">` : ''}<div><b>${esc(app.name)}</b><span>${esc(tagline)}</span></div></div>`;
    const statTile = stat ? `<div class="tile stat"><b>${esc(stat.value)}</b><span>${esc(stat.label)}</span></div>` : '';
    const feats = `<div class="feats">${features.map(f => `<div class="tile feat"><i></i><span data-fit="2">${esc(f)}</span></div>`).join('')}</div>`;

    if (platform === 'mac') {
      return `${big(ctx.u(56))}<div class="side"${stat ? '' : ' style="grid-template-rows:auto 1fr"'}>${ident}${statTile}${feats}</div>`;
    }
    if (platform === 'iphone') {
      return `${big(ctx.u(66))}${feats}<div class="row">${ident}${statTile}</div>`;
    }
    return `${big(ctx.u(58))}<div class="row">${ident}${statTile}</div>${feats}`;
  },
};
