// The prompt printed on the gallery reproduces the gallery render pixel for pixel.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { startRenderer } from '../render/render.mjs';
import { ROOT } from '../render/serve.mjs';

const manifest = JSON.parse(await readFile(join(ROOT, 'site/gallery.json'), 'utf8'));
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
      assert.ok(gallery.buffer.equals(fromPrompt.buffer), `${platform} differs`);
    }
  });
}
