// Stack Cascade: this screen in front with the next two screens of the set stacked behind it, stepped
// and slightly rotated, to show breadth. Mac cascades up-right beside a left headline column; iPhone and
// iPad fan the three devices like cards under a left-aligned headline. A dot row marks the slot position.
const id = 'stack-cascade';

export default {
  id,
  name: 'Stack Cascade',
  summary: 'This screen in front, the next two screens stacked behind it, stepped and tilted like a fanned deck; headline beside (Mac) or above (iPhone, iPad) with a slot-position dot row.',
  themes: ['dark', 'light'],
  fonts: { display: "'Bricolage Grotesque'", text: "'Inter Tight'" },
  palette: {
    light: { bg: '#EEEBF3', bg2: '#FBFAFD', ink: '#121018', muted: '#5D5A68', dot: 'rgba(18,16,24,.16)', dim: 'brightness(.96) saturate(.85)' },
    dark: { bg: '#0D0C12', bg2: '#1C1A26', ink: '#F5F3FA', muted: '#A19DB0', dot: 'rgba(245,243,250,.18)', dim: 'brightness(.78) saturate(.9)' },
  },

  css: ({ u, v, platform }) => {
    const s = { mac: 1, iphone: 2.05, ipad: 1.32 }[platform];
    const k = n => u(n * s);
    return `
.sb-${id} { background: radial-gradient(90% 70% at ${platform === 'mac' ? '72% 55%' : '50% 72%'}, var(--bg2), var(--bg) 70%); }
.sb-${id} .copy { position: absolute; display: flex; flex-direction: column; }
.sb-${id} .kicker { font: 700 ${k(1)}px/1.2 var(--font-text); letter-spacing: .14em; text-transform: uppercase; color: var(--accent); white-space: nowrap; overflow: hidden; }
.sb-${id}.sb-dark .kicker { color: color-mix(in srgb, var(--accent) 72%, white); }
.sb-${id} h1 { font: 800 ${k(4)}px/1.0 var(--font-display); letter-spacing: -.035em; color: var(--ink); margin-top: ${k(1)}px; }
.sb-${id} .sub { font: 400 ${k(1.32)}px/1.38 var(--font-text); color: var(--muted); margin-top: ${k(1.2)}px; }
.sb-${id} .dots { display: flex; gap: ${k(.55)}px; margin-top: ${k(2)}px; }
.sb-${id} .dots i { width: ${k(.8)}px; height: ${k(.8)}px; border-radius: 99px; background: var(--dot); }
.sb-${id} .dots i.on { width: ${k(2.6)}px; background: var(--accent); }
.sb-${id}:lang(ja) h1 { letter-spacing: -.01em; line-height: 1.15; }
.sb-${id} .card { position: absolute; }
.sb-${id} .card.back { filter: var(--dim); }
.sb-${id}.sb-iphone h1 { font-size: ${u(8.8)}px; }
.sb-${id}.sb-iphone .sub { font-size: ${u(3.1)}px; }
.sb-${id}.sb-iphone .kicker { font-size: ${u(2.5)}px; }
.sb-${id}.sb-ipad h1 { font-size: ${u(6.4)}px; }
.sb-${id}.sb-ipad .sub { font-size: ${u(2.05)}px; }
`;
  },

  render(ctx) {
    const { platform, slot, slots, esc, u, v, W, H, index, count } = ctx;
    const next = d => slots[(index + d) % count].capture;
    const dots = `<div class="dots">${slots.map((_, i) => `<i class="${i === index ? 'on' : ''}"></i>`).join('')}</div>`;
    const copyInner = (lines) => `
      <div class="kicker" data-fit="1">${esc(slot.kicker)}</div>
      <h1 data-fit="${lines}">${esc(slot.headline)}</h1>
      <div class="sub" data-fit="${platform === 'ipad' ? 2 : 3}">${esc(slot.sub)}</div>
      ${dots}`;
    const card = (cls, x, y, w, transform, origin, html, z) =>
      `<div class="card ${cls}" style="left:${x}px;top:${y}px;width:${w}px;transform:${transform};transform-origin:${origin};z-index:${z}">${html}</div>`;

    if (platform === 'mac') {
      const w = u(51);
      const h = ctx.deviceHeight(w);
      const x = u(39);
      const y = v(93) - h;
      const sh = 'drop-shadow(0 30px 60px rgba(0,0,0,.35)) drop-shadow(0 6px 14px rgba(0,0,0,.22))';
      const steps = [
        { d: 2, dx: u(10), dy: -v(19), sc: .8, rot: 0 },
        { d: 1, dx: u(5), dy: -v(9.5), sc: .9, rot: 0 },
      ];
      const backs = steps.map((s, i) => card('back', x, y, w, `translate(${s.dx}px,${s.dy}px) scale(${s.sc}) rotate(${s.rot}deg)`, '50% 50%',
        ctx.device({ width: w, src: next(s.d), shadow: sh }), i + 1)).join('');
      return `<div class="copy" style="left:${u(5.5)}px;width:${u(31)}px;top:${v(10)}px;bottom:${v(10)}px;justify-content:center">${copyInner(4)}</div>
        ${backs}${card('front', x, y, w, 'none', '50% 50%', ctx.device({ width: w, shadow: sh }), 5)}`;
    }

    const phone = platform === 'iphone';
    const w = phone ? u(60) : u(62);
    const h = ctx.deviceHeight(w);
    const bottom = H - (phone ? v(4.5) : v(5));
    const y = bottom - h;
    const x = (W - w) / 2;
    const spread = phone ? u(11) : u(12);
    const rot = phone ? 6.5 : 5.5;
    const sc = phone ? .88 : .9;
    const backs =
      card('back', x, y, w, `translateX(${-spread}px) rotate(${-rot}deg) scale(${sc})`, '50% 100%', ctx.device({ width: w, src: next(1) }), 1) +
      card('back', x, y, w, `translateX(${spread}px) rotate(${rot}deg) scale(${sc})`, '50% 100%', ctx.device({ width: w, src: next(2) }), 2);
    const m = phone ? u(7.5) : u(7);
    return `<div class="copy" style="left:${m}px;right:${m}px;top:${phone ? v(5.5) : v(5)}px">${copyInner(phone ? 3 : 2)}</div>
      ${backs}${card('front', x, y, w, 'none', '50% 100%', ctx.device({ width: w }), 3)}`;
  },
};
