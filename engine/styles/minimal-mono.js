// Minimal Mono: a quiet monochrome field, a small device floating in generous whitespace and one
// short caption in Instrument Sans. The accent appears only as a single tiny dot beside the kicker.
const id = 'minimal-mono';

export default {
  id,
  name: 'Minimal Mono',
  summary: 'Monochrome field with lots of whitespace, a small floating device and one short Instrument Sans caption; the accent is only a tiny dot.',
  themes: ['light', 'dark'],
  fonts: { display: "'Instrument Sans'", text: "'Instrument Sans'", mono: "'JetBrains Mono'" },
  palette: {
    light: { bg: '#F3F3F1', ink: '#161616', muted: '#8C8C88', line: 'rgba(0,0,0,.09)', shade: 'rgba(0,0,0,.10)' },
    dark: { bg: '#111112', ink: '#ECECEA', muted: '#7E7E7B', line: 'rgba(255,255,255,.10)', shade: 'rgba(0,0,0,.55)' },
  },

  css: ({ u, platform }) => {
    const m = {
      mac: { h1: u(2.9), k: u(0.9), gap: u(3.2), dot: u(0.32), w: u(46) },
      iphone: { h1: u(7.4), k: u(2.3), gap: u(8.5), dot: u(0.8), w: u(80) },
      ipad: { h1: u(5), k: u(1.55), gap: u(5.5), dot: u(0.55), w: u(66) },
    }[platform];
    return `
.sb-${id} .stage { position: absolute; left: 0; right: 0; display: flex; justify-content: center; }
.sb-${id} .cap { position: absolute; left: 50%; transform: translateX(-50%); width: ${m.w}px; text-align: center; display: flex; flex-direction: column; align-items: center; }
.sb-${id} .kicker { display: flex; align-items: center; gap: ${m.k * 0.7}px; font: 600 ${m.k}px/1.2 var(--font-text);
  letter-spacing: .14em; text-transform: uppercase; color: var(--muted); }
.sb-${id}:lang(ja) .kicker { letter-spacing: .08em; }
.sb-${id} .kicker i { width: ${m.dot}px; height: ${m.dot}px; border-radius: 50%; background: var(--accent); flex: none; }
.sb-${id} h1 { margin-top: ${m.k * 1.1}px; font: 400 ${m.h1}px/1.14 var(--font-display); letter-spacing: -.022em; color: var(--ink); width: 100%; text-wrap: balance; }
.sb-${id}:lang(ja) h1 { letter-spacing: 0; line-height: 1.3; font-weight: 400; }
`;
  },

  render(ctx) {
    const { platform, slot, esc, u, v } = ctx;
    // the device is deliberately small: ~55-60% of the usual hero width
    const width = { mac: u(41), iphone: u(40), ipad: u(42) }[platform];
    const ring = platform === 'mac' ? '' : 'border:1px solid var(--line);';
    const shadow = platform === 'mac'
      ? 'drop-shadow(0 18px 40px var(--shade)) drop-shadow(0 2px 6px var(--shade))'
      : '0 24px 60px var(--shade), 0 3px 10px var(--shade)';
    const dev = ctx.device({ width, frame: false, shadow, style: ring });
    // fixed positions (same on every slot): the group is centred for a two-line caption, lifted a little
    // above optical centre; a one-line caption simply leaves more air below.
    const devH = ctx.deviceHeight(width, { frame: false });
    const gap = { mac: u(3.2), iphone: u(8.5), ipad: u(5.5) }[platform];
    const k = { mac: u(0.9), iphone: u(2.3), ipad: u(1.55) }[platform];
    const h1 = { mac: u(2.9), iphone: u(7.4), ipad: u(5) }[platform];
    const capH = k * 1.2 + k * 1.1 + 2 * h1 * 1.14;
    const top = (ctx.H - devH - gap - capH) / 2 - { mac: v(2), iphone: v(2.5), ipad: v(2) }[platform];
    return `
      <div class="stage" style="top:${top}px">${dev}</div>
      <div class="cap" style="top:${top + devH + gap}px">
        <div class="kicker"><i></i><span>${esc(slot.kicker)}</span></div>
        <h1 data-fit="2">${esc(slot.headline)}</h1>
      </div>`;
  },
};
