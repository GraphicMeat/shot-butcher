// Kinetic Type: the headline set as giant, tightly-leaded display type that fills the upper canvas;
// the device rises from the bottom edge and overlaps the last line. Words alternate between solid ink,
// outlined ink and solid accent (pattern shifts with the slot index). Kicker and sub sit small at the top.
const id = 'kinetic-type';

// Words for Latin scripts; for unspaced scripts (ja) segment into short phrases so lines break cleanly.
function chunks(text, locale) {
  const t = String(text ?? '').trim();
  if (/\s/.test(t) || typeof Intl === 'undefined' || !Intl.Segmenter) return t.split(/\s+/).filter(Boolean);
  const hira = /[\u3040-\u309F\u3000-\u303F\uFF01-\uFF0F]/;
  const out = [];
  for (const { segment: s } of new Intl.Segmenter(locale, { granularity: 'word' }).segment(t)) {
    const prev = out[out.length - 1];
    // a new phrase starts where a non-kana word follows a kana ending (particle / okurigana)
    if (!prev || (hira.test(prev.slice(-1)) && !hira.test(s[0]))) out.push(s);
    else out[out.length - 1] = prev + s;
  }
  return out;
}

export default {
  id,
  name: 'Kinetic Type',
  summary: 'Giant, tightly-leaded uppercase headline fills the canvas behind the device, which rises from the bottom edge over the last line; words alternate solid ink, outline and accent.',
  themes: ['dark', 'light'],
  fonts: { display: "'Archivo Black'", text: "'Inter Tight'" },
  palette: {
    light: { bg: '#F2F0EB', ink: '#0E0E10', muted: '#55565C', stroke: '#0E0E10' },
    dark: { bg: '#0C0C0E', ink: '#F5F3EE', muted: '#A3A3AA', stroke: '#F5F3EE' },
  },

  css: ({ u, v, platform }) => {
    const g = {
      mac: { pad: u(4), top: v(5.5), boxTop: v(13.5), boxH: v(40.5), font: u(13), stroke: u(.16), kick: u(1.15), sub: u(1.35), subW: u(42) },
      iphone: { pad: u(7), top: v(5.2), boxTop: v(17.5), boxH: v(38), font: u(22), stroke: u(.34), kick: u(2.7), sub: u(3.2), subW: u(86) },
      ipad: { pad: u(6), top: v(5), boxTop: v(15), boxH: v(38), font: u(17), stroke: u(.24), kick: u(1.75), sub: u(2.1), subW: u(70) },
    }[platform];
    return `
.sb-${id} .top { position: absolute; left: ${g.pad}px; right: ${g.pad}px; top: ${g.top}px; display: flex; ${platform === 'mac' ? 'align-items: flex-start; justify-content: space-between; gap: 6%;' : 'flex-direction: column; gap: ' + g.kick * .8 + 'px;'} }
.sb-${id} .kicker { font: 700 ${g.kick}px/1.2 var(--font-text); letter-spacing: .16em; text-transform: uppercase; color: var(--accent);
  white-space: nowrap; overflow: hidden; display: flex; align-items: center; gap: ${g.kick * .7}px; flex: none; max-width: ${platform === 'mac' ? '40%' : '100%'}; }
.sb-${id} .kicker i { flex: none; width: ${g.kick * .62}px; height: ${g.kick * .62}px; border-radius: 50%; background: var(--accent); }
.sb-${id} .sub { font: 500 ${g.sub}px/1.32 var(--font-text); color: var(--muted); max-width: ${g.subW}px; ${platform === 'mac' ? 'text-align: right;' : ''} }
.sb-${id} .type { position: absolute; left: ${g.pad}px; right: ${g.pad}px; top: ${g.boxTop}px; height: ${g.boxH}px;
  display: flex; flex-direction: column; justify-content: flex-end; }
.sb-${id} h1 { font: 400 ${g.font}px/.86 var(--font-display); letter-spacing: -.02em; text-transform: uppercase; color: var(--ink);
  max-height: 100%; overflow: hidden; display: flex; flex-wrap: wrap; column-gap: .22em; padding: .08em 0 .14em; }
.sb-${id} h1 span { display: inline-block; white-space: nowrap; }
.sb-${id} h1 .out { color: transparent; -webkit-text-stroke: ${g.stroke}px var(--stroke); }
.sb-${id} h1 .acc { color: var(--accent); }
.sb-${id}:lang(ja) h1 { font-family: 'Noto Sans JP', sans-serif; font-weight: 900; letter-spacing: -.04em; line-height: 1.1; column-gap: 0; padding-bottom: .24em; }
.sb-${id}:lang(ja) h1 .out { color: var(--muted); -webkit-text-stroke: 0; }
.sb-${id}::before { content: ''; position: absolute; left: 0; right: 0; bottom: 0; height: 60%;
  background: radial-gradient(60% 70% at 50% 100%, color-mix(in srgb, var(--accent) 26%, transparent), transparent 70%); }
.sb-${id} .dev { position: absolute; left: 50%; transform: translateX(-50%); z-index: 2; }
`;
  },

  render(ctx) {
    const { platform, slot, esc, u, v, index, locale } = ctx;
    const words = chunks(slot.headline, locale);
    const n = words.length;
    const h1 = words.map((w, i) => {
      const cls = i === n - 1 ? 'acc' : (n > 2 && (i + index) % 3 === 1 ? 'out' : '');
      return `<span class="${cls}">${esc(w)}</span>`;
    }).join('');
    const g = {
      mac: { w: u(60), top: v(49.5) },
      iphone: { w: u(68), top: v(54) },
      ipad: { w: u(62), top: v(51) },
    }[platform];
    return `
      <div class="top">
        <div class="kicker" data-fit="1"><i></i>${esc(slot.kicker)}</div>
        <div class="sub" data-fit="2">${esc(slot.sub)}</div>
      </div>
      <div class="type" data-overlap-ok><h1 data-fit="">${h1}</h1></div>
      <div class="dev" style="top:${g.top}px">${ctx.device({ width: g.w })}</div>`;
  },
};
