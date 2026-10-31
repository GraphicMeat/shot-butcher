// Device frames and capture crops, drawn in CSS (no Apple bezel artwork).
// Every helper returns an HTML string sized in canvas pixels.

export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const DEFAULT_SHADOW = {
  mac: 'drop-shadow(0 40px 80px rgba(0,0,0,.35)) drop-shadow(0 8px 20px rgba(0,0,0,.25))',
  iphone: '0 50px 120px rgba(0,0,0,.35), 0 10px 30px rgba(0,0,0,.25)',
  ipad: '0 50px 120px rgba(0,0,0,.30), 0 10px 30px rgba(0,0,0,.22)',
};

// device(ctx, { width, src, frame = true, shadow = true, className = '', style = '' })
// mac: the capture is already a window with transparent rounded corners, so it gets a drop-shadow only.
// iphone/ipad: a drawn bezel around the capture; frame:false gives a bare rounded screen.
export function device(ctx, opts = {}) {
  const { platform } = ctx;
  const width = opts.width ?? ctx.W * 0.7;
  const src = opts.src ?? ctx.capture.src;
  const cls = `sb-device sb-device-${platform} ${opts.className ?? ''}`;
  const extra = opts.style ?? '';
  if (platform === 'mac') {
    const shadow = opts.shadow === false ? 'none' : (typeof opts.shadow === 'string' ? opts.shadow : DEFAULT_SHADOW.mac);
    return `<div class="${cls}" style="width:${width}px;filter:${shadow};${extra}"><img src="${src}" style="width:100%;height:auto" alt=""></div>`;
  }
  const phone = platform === 'iphone';
  const shadow = opts.shadow === false ? 'none' : (typeof opts.shadow === 'string' ? opts.shadow : DEFAULT_SHADOW[platform]);
  if (opts.frame === false) {
    const r = width * (phone ? 0.13 : 0.035);
    return `<div class="${cls}" style="width:${width}px;border-radius:${r}px;overflow:hidden;box-shadow:${shadow};${extra}"><img src="${src}" style="width:100%;height:auto" alt=""></div>`;
  }
  const bezel = width * (phone ? 0.034 : 0.026);
  const outerR = width * (phone ? 0.165 : 0.06);
  const innerR = outerR - bezel;
  const ring = Math.max(2, width * 0.004);
  const island = phone
    ? `<div style="position:absolute;left:50%;top:${bezel + width * 0.028}px;width:${width * 0.27}px;height:${width * 0.078}px;transform:translateX(-50%);background:#000;border-radius:${width}px"></div>`
    : '';
  const shadows = [`inset 0 0 0 ${ring}px #3a3a3f`, `0 0 0 ${ring}px #8a8a90`, ...(shadow === 'none' ? [] : [shadow])].join(', ');
  return `<div class="${cls}" style="position:relative;width:${width}px;padding:${bezel}px;border-radius:${outerR}px;background:#0c0c0e;box-shadow:${shadows};${extra}">` +
    `<div style="border-radius:${innerR}px;overflow:hidden;background:#000"><img src="${src}" style="width:100%;height:auto" alt=""></div>${island}</div>`;
}

// Height in canvas pixels of device(ctx, { width }) for layout maths.
export function deviceHeight(ctx, width, opts = {}) {
  const { w, h } = opts.capture ?? ctx.capture;
  if (ctx.platform === 'mac' || opts.frame === false) return width * h / w;
  const bezel = width * (ctx.platform === 'iphone' ? 0.034 : 0.026);
  return (width - 2 * bezel) * h / w + 2 * bezel;
}

// Width that makes device(ctx) exactly `height` tall.
export function deviceWidthForHeight(ctx, height, opts = {}) {
  return height / deviceHeight(ctx, 1, opts);
}

// crop(ctx, { x, y, w, h, width, src, radius, shadow, className, style })
// x/y/w/h are fractions (0..1) of the capture. Renders that region at `width` canvas pixels.
export function crop(ctx, opts) {
  const { x = 0, y = 0, w = 1, h = 1 } = opts;
  const src = opts.src ?? ctx.capture.src;
  const cap = opts.capture ?? ctx.capture;
  const width = opts.width ?? ctx.W * 0.4;
  const height = width * (h * cap.h) / (w * cap.w);
  const px = w >= 1 ? 0 : (x / (1 - w)) * 100;
  const py = h >= 1 ? 0 : (y / (1 - h)) * 100;
  const radius = opts.radius ?? 0;
  const shadow = opts.shadow ?? 'none';
  return `<div class="sb-crop ${opts.className ?? ''}" style="width:${width}px;height:${height}px;border-radius:${radius}px;box-shadow:${shadow};` +
    `background:url('${src}') ${px}% ${py}% / ${100 / w}% auto no-repeat;${opts.style ?? ''}"></div>`;
}
