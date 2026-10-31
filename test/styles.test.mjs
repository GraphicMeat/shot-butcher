// Every style renders on every platform and demo locale with no errors, no text overflow,
// at an accepted App Store size with no alpha channel.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { startRenderer, checkStorePng } from '../render/render.mjs';
import { ROOT } from '../render/serve.mjs';
import { STYLE_IDS, loadStyle } from '../engine/styles/index.js';

const DEMOS = [
  { set: 'demo/mailvault/set.json', platforms: ['mac'], slots: 6 },
  { set: 'demo/photobooks/set.json', platforms: ['iphone', 'ipad'], slots: 6 },
];
const LOCALES = ['en-US', 'de-DE', 'ja'];
let r;
before(async () => { r = await startRenderer({ jobs: 6 }); });
after(async () => { await r?.close(); });

for (const id of STYLE_IDS) {
  test(`style ${id} follows the contract`, async () => {
    const s = await loadStyle(id);
    assert.equal(s.id, id);
    assert.ok(s.name && s.summary, 'name and summary');
    assert.ok(s.themes?.length >= 1 && s.themes.every(t => ['light', 'dark'].includes(t)), 'themes');
    for (const t of s.themes) for (const k of ['bg', 'ink']) assert.ok(s.palette[t]?.[k], `palette.${t}.${k}`);
    assert.equal(typeof s.css, 'function');
    assert.equal(typeof s.render, 'function');
  });

  test(`style ${id} renders every platform, locale and slot cleanly`, async () => {
    const jobs = [];
    for (const d of DEMOS) for (const platform of d.platforms) for (const locale of LOCALES) for (let slot = 0; slot < d.slots; slot++) {
      jobs.push(r.renderOne({ setPath: join(ROOT, d.set), platform, locale, slot, style: id }).then(async res => {
        await checkStorePng(res.buffer, platform);
        assert.deepEqual(res.warnings, [], `${platform} ${locale} #${slot}`);
      }));
    }
    await Promise.all(jobs);
  });
}
