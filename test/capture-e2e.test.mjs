// Capture -> compose end to end, for a set that lives outside the repo: capture/web.mjs shoots a local
// page into a temp set, render/render.mjs composes it at the iPhone store size.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, mkdir, readdir } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';
import { serve, ROOT } from '../render/serve.mjs';
import { checkStorePng } from '../render/render.mjs';

const run = promisify(execFile);

test('web capture into an external set renders store-ready iPhone PNGs', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'shot-butcher-e2e-'));
  const server = await serve(0);
  try {
    const base = `http://127.0.0.1:${server.address().port}/test/fixtures/capture/page.html`;
    await writeFile(join(dir, 'shots.json'), JSON.stringify({
      baseUrl: base, viewport: { width: 440, height: 956 }, scale: 3, platform: 'iphone', themes: ['light'],
      shots: [{ id: 'list' }, { id: 'detail', steps: [{ click: '#first' }, { waitFor: '.detail' }] }],
    }));
    await run('node', [join(ROOT, 'capture/web.mjs'), join(dir, 'shots.json')]);
    const raw = await sharp(join(dir, 'raw/iphone/light/list.png')).metadata();
    assert.deepEqual([raw.width, raw.height], [1320, 2868]);

    await mkdir(join(dir, 'copy'));
    await writeFile(join(dir, 'copy/en-US.json'), JSON.stringify({
      tagline: 'Fixture app', features: ['Lists', 'Details'],
      slots: { list: { kicker: 'List', headline: 'Everything in one list', sub: 'A fixture screen.' },
        detail: { kicker: 'Detail', headline: 'Open any item', sub: 'The second fixture screen.' } },
    }));
    await writeFile(join(dir, 'set.json'), JSON.stringify({
      app: { name: 'Fixture' }, style: 'headline-top', accent: '#2266DD', theme: 'light',
      platforms: ['iphone'], locales: ['en-US'], capture: 'raw/{platform}/{theme}/{id}.png',
      slots: [{ id: 'list' }, { id: 'detail' }],
    }));
    await run('node', [join(ROOT, 'render/render.mjs'), join(dir, 'set.json'), '--out', join(dir, 'out')]);
    const files = (await readdir(join(dir, 'out/headline-top/iphone/en-US'))).sort();
    assert.deepEqual(files, ['01-list.png', '02-detail.png']);
    for (const f of files) await checkStorePng(await sharp(join(dir, 'out/headline-top/iphone/en-US', f)).toBuffer(), 'iphone');
  } finally {
    server.close();
  }
});
