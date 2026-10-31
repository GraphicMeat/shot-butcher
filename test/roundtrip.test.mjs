// The prompt printed on the gallery reproduces the gallery render. Chromium's image resampling adds
// rare invisible noise (a few levels on scaled captures), so pixels may differ by at most 16 per
// channel on under 0.5% of the canvas; any real parameter change differs far beyond that.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import { startRenderer } from '../render/render.mjs';
import { ROOT } from '../render/serve.mjs';

const manifest = JSON.parse(await readFile(join(ROOT, 'site/gallery.json'), 'utf8'));
async function sameImage(a, b) {
  if (a.equals(b)) return true;
  const [x, y] = await Promise.all([a, b].map(buf => sharp(buf).raw().toBuffer()));
  if (x.length !== y.length) return false;
  let off = 0;
  for (let i = 0; i < x.length; i++) {
    const d = Math.abs(x[i] - y[i]);
    if (d > 16) return false;
    if (d) off++;
  }
  return off / x.length < 0.005;
}

let r;
before(async () => { r = await startRenderer({ jobs: 4 }); });
after(async () => { await r?.close(); });

for (const m of manifest) {
  test(`${m.style} / ${m.app}: prompt reproduces the gallery`, async () => {
    for (const platform of m.platforms) {
      const setPath = join(ROOT, m.set);
      const opts = { setPath, platform, locale: 'en-US', slot: 1 };
      const [gallery, fromPrompt] = await Promise.all([
        r.renderOne({ ...opts, style: m.style, theme: m.theme, accent: m.accent }),
        r.renderOne({ ...opts, prompt: m.prompt }),
      ]);
      assert.ok(await sameImage(gallery.buffer, fromPrompt.buffer), `${platform} differs`);
    }
  });
}
