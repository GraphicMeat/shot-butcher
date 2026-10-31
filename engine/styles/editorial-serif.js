// Editorial Serif: a magazine spread. Paper ground (ink-black in dark), a running head of tracked
// uppercase kicker + hairline rule + folio "01 / 06", a large serif headline whose last phrase is set in
// accent italic, and the capture placed like a photo plate with a thin keyline and a restrained shadow.
const id = 'editorial-serif';

// Split off the last word (Latin) or last phrase (unspaced scripts) for the italic accent.
function splitLast(text, locale) {
  const t = String(text ?? '').trim();
  if (/\s/.test(t)) { const i = t.lastIndexOf(' '); return [t.slice(0, i + 1), t.slice(i + 1)]; }
  if (typeof Intl === 'undefined' || !Intl.Segmenter) return [t, ''];
  const hira = /[぀-ゟ　-〿！-／]/;
  const out = [];
  for (const { segment: s } of new Intl.Segmenter(locale, { granularity: 'word' }).segment(t)) {
    const prev = out[out.length - 1];
    if (!prev || (hira.test(prev.slice(-1)) && !hira.test(s[0]))) out.push(s);
    else out[out.length - 1] = prev + s;
  }
  if (out.length < 2) return [t, ''];
  return [out.slice(0, -1).join(''), out[out.length - 1]];
}

const pad2 = n => String(n).padStart(2, '0');

export default {
  id,
  name: 'Editorial Serif',
  summary: 'Magazine spread: paper ground, tracked kicker with a hairline rule and a "01 / 06" folio, big serif headline ending in accent italic, capture as a keylined photo plate.',
  themes: ['light', 'dark'],
  fonts: { display: "'Instrument Serif'", text: "'Instrument Sans'" },
  palette: {
    light: { bg: '#F4F0E7', ink: '#1A1712', muted: '#6E665A', rule: 'rgba(26,23,18,.55)', key: 'rgba(26,23,18,.28)' },
    dark: { bg: '#0F0E0C', ink: '#F1ECE2', muted: '#A39B8E', rule: 'rgba(241,236,226,.45)', key: 'rgba(241,236,226,.22)' },
  },

  css: ({ u, v, platform }) => {
    const g = {
      mac: { m: u(5), top: v(7), kick: u(.95), h1: u(6.1), sub: u(1.45), hair: 3 },
      iphone: { m: u(7.5), top: v(4.6), kick: u(2.5), h1: u(11.6), sub: u(3.4), hair: 3 },
      ipad: { m: u(6.5), top: v(4.6), kick: u(1.55), h1: u(9.4), sub: u(2.15), hair: 3 },
    }[platform];
    return `
.sb-${id} { background: var(--bg); }
.sb-${id}::after { content: ''; position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(130% 90% at 30% 0%, rgba(255,255,255,.05), transparent 60%); }
.sb-${id} .head { position: absolute; left: ${g.m}px; right: ${g.m}px; top: ${g.top}px; display: flex; align-items: center; gap: ${g.kick * 1.1}px; }
.sb-${id} .kicker { font: 600 ${g.kick}px/1.2 var(--font-text); letter-spacing: .24em; text-transform: uppercase; color: var(--accent);
  white-space: nowrap; overflow: hidden; flex: 0 1 auto; max-width: 62%; }
.sb-${id} .rule { flex: 1; height: ${g.hair}px; background: var(--rule); min-width: ${g.kick * 2}px; }
.sb-${id} .folio { font: 400 ${g.kick * 1.35}px/1 var(--font-display); color: var(--ink); white-space: nowrap; letter-spacing: .02em; font-variant-numeric: lining-nums; }
.sb-${id} .folio em { color: var(--muted); font-style: normal; padding: 0 .25em; }
.sb-${id} h1 { font: 400 ${g.h1}px/.98 var(--font-display); letter-spacing: -.012em; color: var(--ink); text-wrap: balance; }
.sb-${id} h1 em { font-style: italic; color: var(--accent); }
.sb-${id} .sub { font: 400 ${g.sub}px/1.42 var(--font-text); color: var(--muted); }
.sb-${id}:lang(ja) h1 { font-family: 'Noto Sans JP', serif; font-weight: 700; letter-spacing: .01em; line-height: 1.15; }
.sb-${id}:lang(ja) h1 em { font-style: normal; }
.sb-${id}:lang(ja) .kicker { letter-spacing: .12em; }
.sb-${id} .plate { position: absolute; }
.sb-${id} .foot { position: absolute; left: ${g.m}px; right: ${g.m}px; bottom: ${v(4.5)}px; display: flex; justify-content: space-between; align-items: baseline;
  border-top: ${g.hair}px solid var(--rule); padding-top: ${g.kick * .9}px; }
.sb-${id} .foot b, .sb-${id} .foot span { display: block; white-space: nowrap; overflow: hidden; max-width: 48%; }
.sb-${id} .foot b { font: 400 italic ${g.kick * 1.45}px/1 var(--font-display); color: var(--ink); }
.sb-${id} .foot span { font: 600 ${g.kick * .9}px/1 var(--font-text); letter-spacing: .24em; text-transform: uppercase; color: var(--muted); }
${platform === 'mac' ? `
.sb-${id} .col { position: absolute; left: ${g.m}px; width: ${u(32)}px; top: ${v(17)}px; bottom: ${v(15)}px; display: flex; flex-direction: column; justify-content: center; }
.sb-${id} .sub { margin-top: ${u(2)}px; padding-top: ${u(1.6)}px; border-top: ${g.hair}px solid var(--rule); width: 78%; }
` : platform === 'iphone' ? `
.sb-${id} .col { position: absolute; left: ${g.m}px; right: ${g.m}px; top: ${v(8.8)}px; display: flex; flex-direction: column; }
.sb-${id} .sub { margin-top: ${u(3.4)}px; max-width: 94%; flex: 1 1 0; min-height: 0; overflow: hidden; }
` : `
.sb-${id} .col { position: absolute; left: ${g.m}px; right: ${u(12)}px; top: ${v(9.2)}px; }
.sb-${id} .caption { position: absolute; left: ${g.m}px; width: ${u(28)}px; bottom: ${v(10)}px; }
.sb-${id} .caption .sub { padding-top: ${u(1.4)}px; border-top: ${g.hair}px solid var(--rule); }
`}
`;
  },

  render(ctx) {
    const { platform, slot, esc, u, v, W, H, index, count, app, locale } = ctx;
    const [lead, last] = splitLast(slot.headline, locale);
    const h1 = `<h1 data-fit="${platform === 'mac' ? 4 : 3}">${esc(lead)}${last ? `<em>${esc(last)}</em>` : ''}</h1>`;
    const head = `<div class="head"><div class="kicker" data-fit="1">${esc(slot.kicker)}</div><div class="rule"></div>` +
      `<div class="folio">${pad2(index + 1)}<em>/</em>${pad2(count)}</div></div>`;
    const sub = `<div class="sub" data-fit="${platform === 'iphone' ? 3 : 5}">${esc(slot.sub)}</div>`;

    if (platform === 'mac') {
      const w = u(56);
      const h = ctx.deviceHeight(w);
      const top = v(15.5) + (v(80) - v(15.5) - h) / 2;
      const shadow = 'drop-shadow(0 0 1.2px var(--key)) drop-shadow(0 0 1.2px var(--key)) drop-shadow(0 30px 40px rgba(0,0,0,.18))';
      return `${head}
        <div class="col">${h1}${sub}</div>
        <div class="plate" style="left:${W - u(5) - w}px;top:${top}px">${ctx.device({ width: w, shadow })}</div>
        <div class="foot"><b data-fit="1">${esc(app.name)}</b><span data-fit="1">${esc(app.maker)}</span></div>`;
    }
    const shadow = `0 0 0 3px var(--key), 0 ${u(3)}px ${u(6)}px -${u(2)}px rgba(0,0,0,.28)`;
    if (platform === 'iphone') {
      const w = u(58);
      const h = ctx.deviceHeight(w, { frame: false });
      const top = H - v(5.2) - h;
      const colTop = v(8.8);
      // the column is boxed to end above the plate; the sub fits whatever room the headline leaves
      return `${head}<div class="col" style="height:${top - u(5) - colTop}px">${h1}<div class="sub" data-fit="">${esc(slot.sub)}</div></div>
        <div class="plate" style="left:${(W - w) / 2}px;top:${top}px">${ctx.device({ width: w, frame: false, shadow })}</div>`;
    }
    // iPad: plate on the right, sub as a caption in the left margin aligned to the plate's foot
    const w = u(54);
    const h = ctx.deviceHeight(w, { frame: false });
    const top = H - v(10) - h;
    return `${head}<div class="col">${h1}</div>
      <div class="caption">${sub}</div>
      <div class="plate" style="left:${W - u(6.5) - w}px;top:${top}px">${ctx.device({ width: w, frame: false, shadow })}</div>`;
  },
};
