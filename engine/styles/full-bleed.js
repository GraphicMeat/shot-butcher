// Full Bleed: the capture is the whole canvas (no device frame), with the caption on a frosted
// glass bar: a floating bar along the bottom on Mac, a sheet hanging from the top edge on phones.
const id = 'full-bleed';

export default {
  id,
  name: 'Full Bleed',
  summary: 'The capture fills the canvas edge to edge; kicker, headline and sub sit on a frosted glass bar (bottom on Mac, top on iPhone and iPad).',
  themes: ['dark', 'light'],
  fonts: { display: "'Inter Tight'", text: "'Inter Tight'" },
  palette: {
    light: { bg: '#EEF0F3', ink: '#0B0C10', muted: '#3E4350', glass: 'rgba(250,250,252,.66)', edge: 'rgba(255,255,255,.85)', scrim: 'rgba(255,255,255,.0)' },
    dark: { bg: '#0A0B0E', ink: '#F6F7F9', muted: '#B9BECA', glass: 'rgba(16,17,22,.74)', edge: 'rgba(255,255,255,.16)', scrim: 'rgba(0,0,0,.0)' },
  },

  css: ({ u, W, H, platform }) => {
    const mac = platform === 'mac';
    const s = { mac: 1, iphone: 2.05, ipad: 1.32 }[platform];
    const k = n => u(n * s);
    return `
.sb-${id} .shot { position: absolute; max-width: none; }
.sb-${id} .glass { position: absolute; color: var(--ink);
  background: var(--glass); -webkit-backdrop-filter: blur(${k(1.6)}px) saturate(1.7); backdrop-filter: blur(${k(1.6)}px) saturate(1.7);
  box-shadow: inset 0 0 0 ${Math.max(2, k(.07))}px var(--edge), 0 ${k(1)}px ${k(3)}px rgba(0,0,0,.22); }
.sb-${id} .kicker { font: 700 ${k(.95)}px/1.15 var(--font-text); letter-spacing: .14em; text-transform: uppercase; color: var(--accent);
  display: flex; align-items: center; gap: ${k(.7)}px; white-space: nowrap; overflow: hidden; }
.sb-${id} .kicker::before { content: ''; flex: none; width: ${k(2.2)}px; height: ${Math.max(4, k(.2))}px; border-radius: 9px; background: var(--accent); }
.sb-${id}.sb-dark .kicker { filter: brightness(1.35) saturate(1.1); }
.sb-${id} h1 { font: 800 ${k(3.4)}px/1.02 var(--font-display); letter-spacing: -.03em; }
.sb-${id} .sub { font: 500 ${k(1.25)}px/1.32 var(--font-text); color: var(--muted); }
.sb-${id} .icon { flex: none; width: ${k(5.2)}px; height: ${k(5.2)}px; border-radius: 23%; box-shadow: 0 ${k(.3)}px ${k(1)}px rgba(0,0,0,.25); }
${mac ? `
.sb-${id} .glass { left: ${u(2.6)}px; right: ${u(2.6)}px; bottom: ${u(2.6)}px; height: ${H * 0.25}px; border-radius: ${u(1.7)}px;
  display: grid; grid-template-columns: auto 1fr ${u(25)}px; align-items: center; gap: ${u(2.4)}px; padding: 0 ${u(3)}px; }
.sb-${id} .head { min-width: 0; }
.sb-${id} h1 { margin-top: ${u(.7)}px; }
.sb-${id} .sub { border-left: ${Math.max(3, u(.1))}px solid var(--edge); padding-left: ${u(2)}px; height: ${H * 0.25 - u(5)}px; display: flex; align-items: center; }
` : `
.sb-${id} .glass { left: 0; right: 0; top: 0; border-radius: 0 0 ${k(3)}px ${k(3)}px;
  padding: ${platform === 'iphone' ? H * 0.062 : H * 0.045}px ${k(3)}px ${k(3)}px; }
.sb-${id} .row { display: flex; align-items: center; gap: ${k(1.4)}px; }
.sb-${id} .icon { width: ${k(3.4)}px; height: ${k(3.4)}px; }
.sb-${id} .kicker { font-size: ${k(1.2)}px; }
.sb-${id}.sb-iphone h1 { font-size: ${u(8.6)}px; }
.sb-${id}.sb-ipad h1 { font-size: ${u(5.6)}px; }
.sb-${id}.sb-iphone .sub { font-size: ${u(3)}px; }
.sb-${id}.sb-ipad .sub { font-size: ${u(1.95)}px; }
.sb-${id} h1 { margin-top: ${k(1.3)}px; }
.sb-${id} .sub { margin-top: ${k(1.1)}px; max-width: ${platform === 'iphone' ? 100 : 82}%; }
.sb-${id}.sb-ipad h1 { max-width: 88%; }
`}
`;
  },

  render(ctx) {
    const { platform, slot, app, esc, W, H, capture } = ctx;
    const icon = app.icon ? `<img class="icon" src="${app.icon}" alt="">` : '';
    let img;
    if (platform === 'mac') {
      // The capture is a window: overscale it so the rounded transparent corners and titlebar fall off-canvas.
      // Full width (the sidebar text sits close to the window edge, so no side crop); shifting up hides
      // the traffic-light strip and the top corners; the bottom corners are the only bg showing through.
      const s = 1;
      const w = W * s;
      const h = w * capture.h / capture.w;
      const left = (W - w) / 2;
      const top = H - h;
      img = `<img class="shot" src="${capture.src}" style="width:${w}px;height:${h}px;left:${left}px;top:${top}px" alt="">`;
      return `${img}
        <div class="glass">
          ${icon}
          <div class="head">
            <div class="kicker" data-fit="1">${esc(slot.kicker)}</div>
            <h1 data-fit="2">${esc(slot.headline)}</h1>
          </div>
          <div class="sub" data-fit="">${esc(slot.sub)}</div>
        </div>`;
    }
    // iPhone / iPad: cover-scale, anchored to the bottom so the content (not the status bar) survives under the sheet.
    const sc = Math.max(W / capture.w, H / capture.h);
    const w = capture.w * sc, h = capture.h * sc;
    img = `<img class="shot" src="${capture.src}" style="width:${w}px;height:${h}px;left:${(W - w) / 2}px;top:${H - h}px" alt="">`;
    return `${img}
      <div class="glass">
        <div class="row">${icon}<div class="kicker" data-fit="1">${esc(slot.kicker)}</div></div>
        <h1 data-fit="3">${esc(slot.headline)}</h1>
        <div class="sub" data-fit="2">${esc(slot.sub)}</div>
      </div>`;
  },
};
