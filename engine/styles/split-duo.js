// Split Duo: two devices side by side, one stepped down from the other, under a centred headline.
// Mac shows the same screen in both themes (capture + captureAlt); iPhone/iPad show this screen and the
// next one in the set. The pair sits on a rounded plinth; the stagger flips sides on every other slot.
const id = 'split-duo';

const SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/></svg>';
const MOON = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 14.6A8.5 8.5 0 0 1 9.4 3.5a8.5 8.5 0 1 0 11.1 11.1z"/></svg>';

export default {
  id,
  name: 'Split Duo',
  summary: 'Centred headline over two staggered, overlapping devices on a rounded plinth: Mac pairs the dark and light versions of one screen, iPhone and iPad pair this screen with the next.',
  themes: ['dark', 'light'],
  fonts: { display: "'Inter Tight'", text: "'Inter Tight'" },
  palette: {
    light: { bg: '#F3F1EE', plinth: '#E4E1DC', ink: '#111214', muted: '#5C6068', chip: '#FFFFFF', chipInk: '#111214' },
    dark: { bg: '#0B0C0F', plinth: '#17191F', ink: '#F4F5F7', muted: '#9EA4B0', chip: '#23262E', chipInk: '#F4F5F7' },
  },

  css: ({ u, v, platform }) => {
    const s = { mac: 1, iphone: 2.05, ipad: 1.32 }[platform];
    const k = n => u(n * s);
    const top = { mac: v(6.5), iphone: v(6), ipad: v(5.2) }[platform];
    const plinthTop = { mac: v(38), iphone: v(34), ipad: v(33) }[platform];
    return `
.sb-${id} .plinth { position: absolute; left: ${k(2.2)}px; right: ${k(2.2)}px; top: ${plinthTop}px; bottom: ${k(2.2)}px;
  border-radius: ${k(2.4)}px; background: var(--plinth);
  background-image: radial-gradient(120% 90% at 50% 0%, color-mix(in srgb, var(--accent) 22%, transparent), transparent 62%); }
.sb-${id} .copy { position: absolute; left: 0; right: 0; top: ${top}px; text-align: center; display: flex; flex-direction: column; align-items: center; }
.sb-${id} .kicker { font: 700 ${k(1)}px/1.2 var(--font-text); letter-spacing: .16em; text-transform: uppercase; color: var(--accent);
  padding: ${k(.45)}px ${k(1.1)}px; border-radius: 999px; background: color-mix(in srgb, var(--accent) 14%, transparent); max-width: 70%; }
.sb-${id} .kicker span { display: block; white-space: nowrap; overflow: hidden; }
.sb-${id}.sb-dark .kicker { color: color-mix(in srgb, var(--accent) 70%, white); }
.sb-${id} h1 { font: 800 ${k(3.3)}px/1.03 var(--font-display); letter-spacing: -.03em; margin-top: ${k(1)}px; text-wrap: balance; }
.sb-${id} .sub { font: 400 ${k(1.3)}px/1.35 var(--font-text); color: var(--muted); margin-top: ${k(.9)}px; text-wrap: balance; }
.sb-${id}.sb-mac h1 { max-width: ${u(78)}px; }
.sb-${id}.sb-mac .sub { max-width: ${u(52)}px; }
.sb-${id}.sb-iphone h1 { font-size: ${u(8.4)}px; max-width: ${u(88)}px; }
.sb-${id}.sb-iphone .sub { font-size: ${u(3.1)}px; max-width: ${u(84)}px; }
.sb-${id}.sb-iphone .kicker { font-size: ${u(2.4)}px; }
.sb-${id}.sb-ipad h1 { font-size: ${u(5.4)}px; max-width: ${u(84)}px; }
.sb-${id}.sb-ipad .sub { font-size: ${u(2.05)}px; max-width: ${u(70)}px; }
.sb-${id} .dev { position: absolute; }
.sb-${id} .chip { position: absolute; width: ${k(3.2)}px; height: ${k(3.2)}px; border-radius: 50%; background: var(--chip); color: var(--chipInk);
  display: grid; place-items: center; box-shadow: 0 ${k(.3)}px ${k(1)}px rgba(0,0,0,.28), inset 0 0 0 2px rgba(127,127,127,.18); }
.sb-${id} .chip svg { width: 46%; height: 46%; }
.sb-${id} .chip.dark { background: #1B1D23; color: #F4F5F7; }
.sb-${id} .chip.light { background: #FFFFFF; color: #F2A400; }
`;
  },

  render(ctx) {
    const { platform, slot, slots, index, count, esc, u, v, W, theme } = ctx;
    const flip = index % 2 === 1;
    const copy = `
      <div class="copy">
        <div class="kicker"><span data-fit="1">${esc(slot.kicker)}</span></div>
        <h1 data-fit="${platform === 'mac' ? 1 : 2}">${esc(slot.headline)}</h1>
        <div class="sub" data-fit="2">${esc(slot.sub)}</div>
      </div>`;
    const place = (html, x, y, z) => `<div class="dev" style="left:${x}px;top:${y}px;z-index:${z}">${html}</div>`;

    // geometry per platform: width of each device, back (high) and front (low) positions
    const g = {
      mac: { w: u(56), backX: u(5.5), frontX: u(38.5), backY: v(28), frontY: v(37.5) },
      iphone: { w: u(58), backX: u(4), frontX: u(38), backY: v(26.5), frontY: v(35.5) },
      ipad: { w: u(52), backX: u(5), frontX: u(43), backY: v(26), frontY: v(39) },
    }[platform];
    const mirror = x => W - x - g.w;
    const bx = flip ? mirror(g.backX) : g.backX;
    const fx = flip ? mirror(g.frontX) : g.frontX;

    let backSrc, chips = '';
    if (platform === 'mac' && ctx.captureAlt) {
      backSrc = ctx.captureAlt.src;
      const other = theme === 'dark' ? 'light' : 'dark';
      const c = u(3.2);
      const chip = (t, x, y) => `<div class="chip ${t}" style="left:${x}px;top:${y}px;z-index:5">${t === 'dark' ? MOON : SUN}</div>`;
      // chips sit on each window's outer top corner
      chips = chip(other, flip ? bx + g.w - c * 0.6 : bx - c * 0.4, g.backY - c * 0.4) +
        chip(theme, flip ? fx - c * 0.4 : fx + g.w - c * 0.6, g.frontY - c * 0.4);
    } else {
      backSrc = slots[(index + 1) % count].capture;
    }
    const back = backSrc === ctx.capture.src ? '' : place(ctx.device({ width: g.w, src: backSrc }), bx, g.backY, 1);
    const front = place(ctx.device({ width: g.w }), fx, g.frontY, 2);
    return `<div class="plinth"></div>${copy}${back}${front}${chips}`;
  },
};
