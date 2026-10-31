// Sets the demos never exercise: one slot, no role, no stat, no features, no icon, a #rgb accent,
// markup in copy, and only light captures under a {theme} template (theme-locked styles fall back).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { startRenderer, checkStorePng } from '../render/render.mjs';
import { ROOT } from '../render/serve.mjs';
import { STYLE_IDS } from '../engine/styles/index.js';
import { normalizeAccent } from '../engine/prompt.js';

const setPath = join(ROOT, 'test/fixtures/edge/set.json');
let r;
before(async () => { r = await startRenderer({ jobs: 6 }); });
after(async () => { await r?.close(); });

test('normalizeAccent expands #rgb and rejects non-hex', () => {
  assert.equal(normalizeAccent('#3a7'), '#33aa77');
  assert.equal(normalizeAccent('#33AA77'), '#33AA77');
  assert.throws(() => normalizeAccent('teal'), /accent must be #rrggbb/);
});

test('every style renders a minimal one-slot set without errors or warnings', async () => {
  await Promise.all(STYLE_IDS.map(async style => {
    const res = await r.renderOne({ setPath, platform: 'mac', locale: 'en-US', slot: 0, style });
    await checkStorePng(res.buffer, 'mac');
    assert.deepEqual(res.warnings, [], style);
  }));
});

test('a slot missing from the copy file is an error, not a blank screenshot', async () => {
  await assert.rejects(
    r.renderOne({ setPath: join(ROOT, 'test/fixtures/edge/missing-copy.json'), platform: 'mac', locale: 'en-US', slot: 0, style: 'true-bento' }),
    /no entry for slot "not-in-copy"/);
});
