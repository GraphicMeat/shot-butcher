// Stat Hero: the measured fact (ctx.stat) is the hero, set huge in the accent with its label beneath.
// Feature slots keep the composition and promote the slot headline to the big element, so the set
// reads as one family. No stat: the hero falls back to the headline. Device sits bottom-right.
const id = 'stat-hero';

export default {
  id,
  name: 'Stat Hero',
  summary: 'One huge measured number in the accent with its label beneath dominates the hero; feature shots make the headline the giant element in the same spot, device smaller in the bottom-right corner.',
  themes: ['light', 'dark'],
  fonts: { display: "'Space Grotesk'", text: "'Inter Tight'" },
  palette: {
    light: { bg: '#EDECE7', ink: '#0F1013', muted: '#5D6169', line: 'rgba(15,16,19,.16)' },
    dark: { bg: '#0A0B0D', ink: '#F4F4F1', muted: '#8F949D', line: 'rgba(255,255,255,.16)' },
  },

  css: ({ u, v, platform }) => {
    const P = {
      mac: { pad: u(4.5), col: u(33.5), value: u(12.2), label: u(1.75), head2: u(3.2), big: u(4.8), sub: u(1.45), kick: u(1.05), bar: u(4.5) },
      iphone: { pad: u(8), col: u(84), value: u(27), label: u(4.4), head2: u(7.2), big: u(11.6), sub: u(3.7), kick: u(2.9), bar: u(11) },
      ipad: { pad: u(6.5), col: u(80), value: u(17), label: u(2.9), head2: u(4.6), big: u(8.6), sub: u(2.25), kick: u(1.75), bar: u(7) },
    }[platform];
    return `
.sb-${id} .col { position: absolute; left: ${P.pad}px; top: ${P.pad * 1.15}px; width: ${P.col}px; }
.sb-${id} .bar { width: ${P.bar}px; height: ${Math.max(6, P.bar * .09)}px; background: var(--accent); border-radius: 99px; }
.sb-${id} .kicker { display: block; margin-top: ${P.kick * 1.6}px; font: 600 ${P.kick}px/1.2 var(--font-text); letter-spacing: .1em; text-transform: uppercase; color: var(--muted); }
.sb-${id} .value { display: block; margin-top: ${P.kick * .9}px; font: 700 ${P.value}px/.92 var(--font-display); letter-spacing: -.045em; color: var(--accent); white-space: nowrap; }
.sb-${id} .label { display: block; margin-top: ${P.label * .55}px; font: 500 ${P.label}px/1.22 var(--font-text); letter-spacing: -.01em; color: var(--ink); max-width: 96%; }
.sb-${id} .rule { height: 2px; background: var(--line); margin: ${P.label * 1.3}px 0 ${P.label * 1.1}px; }
.sb-${id} .head2 { display: block; font: 700 ${P.head2}px/1.05 var(--font-display); letter-spacing: -.03em; }
.sb-${id} .big { display: block; margin-top: ${P.kick * 1.1}px; font: 700 ${P.big}px/.98 var(--font-display); letter-spacing: -.04em; }
.sb-${id} .sub { display: block; margin-top: ${P.sub * 1.1}px; font: 400 ${P.sub}px/1.38 var(--font-text); color: var(--muted); max-width: 94%; }
.sb-${id} .dev { position: absolute; }
.sb-${id}.sb-mac .dev { right: ${u(4.5)}px; bottom: ${u(4.5)}px; }
.sb-${id}.sb-iphone .dev { left: 50%; transform: translateX(-50%); top: ${v(43)}px; }
.sb-${id}.sb-ipad .dev { left: 50%; transform: translateX(-50%); top: ${v(42)}px; }
`;
  },

  render(ctx) {
    const { platform, slot, stat, role, esc, u } = ctx;
    const statHero = role === 'hero' && stat;
    const text = statHero
      ? `<div class="bar"></div>
         <div class="kicker">${esc(slot.kicker)}</div>
         <div class="value" data-fit="1">${esc(stat.value)}</div>
         <div class="label" data-fit="2">${esc(stat.label)}</div>
         <div class="rule"></div>
         <h1 class="head2" data-fit="2">${esc(slot.headline)}</h1>`
      : `<div class="bar"></div>
         <div class="kicker">${esc(slot.kicker)}</div>
         <h1 class="big" data-fit="4">${esc(slot.headline)}</h1>
         <div class="sub" data-fit="3">${esc(slot.sub)}</div>`;
    const width = { mac: u(55), iphone: u(66), ipad: u(70) }[platform];
    return `<div class="col">${text}</div><div class="dev">${ctx.device({ width })}</div>`;
  },
};
