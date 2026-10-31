#!/usr/bin/env node
// Renders App Store PNGs (flattened, no alpha) from a set.json.
// Usage:
//   node render/render.mjs <set.json> [--style ID|all] [--platform P|all] [--locale L|all] [--slot N]
//                          [--theme light|dark] [--accent #rrggbb] [--prompt "<prompt text>"] [--out DIR] [--jobs N]
import { readFile, mkdir } from 'node:fs/promises';
import { join, relative, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import sharp from 'sharp';
import { serve, ROOT } from './serve.mjs';
import { PLATFORMS, MAX_SLOTS } from '../engine/platforms.js';
import { STYLE_IDS } from '../engine/styles/index.js';
import { parsePrompt } from '../engine/prompt.js';

export async function startRenderer({ jobs = 4 } = {}) {
  const server = await serve(0);
  const browser = await chromium.launch();
  const context = await browser.newContext({ deviceScaleFactor: 1 });
  const base = `http://127.0.0.1:${server.address().port}`;
  const pages = await Promise.all(Array.from({ length: jobs }, () => context.newPage()));
  const free = [...pages];
  const waiters = [];
  const take = () => free.length ? Promise.resolve(free.pop()) : new Promise(r => waiters.push(r));
  const give = p => waiters.length ? waiters.shift()(p) : free.push(p);

  // Renders one screenshot; returns { buffer (flattened PNG), meta, warnings }.
  // One retry: under heavy parallel load Chromium occasionally drops an image load or stalls.
  async function renderOne(job) {
    try { return await renderAttempt(job); } catch { return renderAttempt(job); }
  }

  async function renderAttempt({ setPath, platform, locale, slot, style, theme, accent, prompt }) {
    const page = await take();
    try {
      const { W, H } = PLATFORMS[platform];
      await page.setViewportSize({ width: W, height: H });
      const params = new URLSearchParams({ set: '/' + relative(ROOT, setPath), platform, locale, slot: String(slot) });
      if (prompt) params.set('prompt', prompt);
      if (style) params.set('style', style);
      if (theme) params.set('theme', theme);
      if (accent) params.set('accent', accent);
      await page.goto(`${base}/engine/index.html?${params}`);
      await page.waitForFunction(() => window.__ready || window.__error, null, { timeout: 60000 });
      const error = await page.evaluate(() => window.__error);
      if (error) throw new Error(`${style ?? ''} ${platform} ${locale} #${slot}: ${error}`);
      const [meta, warnings] = await page.evaluate(() => [window.__meta, window.__warnings]);
      const shot = await page.locator('#canvas').screenshot({ type: 'png' });
      const buffer = await sharp(shot).flatten({ background: '#000000' }).removeAlpha().png({ compressionLevel: 9 }).toBuffer();
      return { buffer, meta, warnings };
    } finally {
      give(page);
    }
  }

  async function close() { await browser.close(); server.close(); }
  return { renderOne, close, base };
}

// Throws unless the PNG is an accepted App Store size with no alpha channel.
export async function checkStorePng(buffer, platform) {
  const m = await sharp(buffer).metadata();
  const ok = PLATFORMS[platform].accepted.some(([w, h]) => w === m.width && h === m.height);
  if (!ok) throw new Error(`${platform}: ${m.width}x${m.height} is not an accepted App Store size`);
  if (m.hasAlpha || m.channels !== 3) throw new Error(`${platform}: PNG has an alpha channel`);
  return m;
}

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const setPath = process.argv[2];
  if (!setPath || setPath.startsWith('--')) { console.error('usage: render.mjs <set.json> [options]'); process.exit(2); }
  const set = JSON.parse(await readFile(setPath, 'utf8'));
  const prompt = arg('--prompt');
  const fromPrompt = prompt ? parsePrompt(prompt) : {};
  const pick = (flag, all, fallback) => { const v = arg(flag); return v === 'all' ? all : v ? v.split(',') : fallback; };
  const styles = pick('--style', STYLE_IDS, [fromPrompt.style ?? set.style]);
  if (styles.some(s => !s)) { console.error('no style: pass --style, --prompt, or set "style" in set.json'); process.exit(2); }
  const platforms = pick('--platform', set.platforms, fromPrompt.platforms ?? set.platforms);
  const locales = pick('--locale', set.locales, fromPrompt.locales ?? set.locales);
  const slots = arg('--slot') ? [Number(arg('--slot'))] : set.slots.map((_, i) => i);
  if (set.slots.length > MAX_SLOTS) throw new Error(`App Store allows ${MAX_SLOTS} screenshots per device`);
  const out = arg('--out', join(ROOT, 'out', basename(dirname(setPath))));
  const r = await startRenderer({ jobs: Number(arg('--jobs', 4)) });
  const tasks = [];
  let warned = 0;
  for (const style of styles) for (const platform of platforms) for (const locale of locales) for (const slot of slots) {
    tasks.push((async () => {
      const res = await r.renderOne({ setPath, platform, locale, slot, style, prompt, theme: arg('--theme'), accent: arg('--accent') });
      await checkStorePng(res.buffer, platform);
      const file = join(out, style, platform, locale, `${String(slot + 1).padStart(2, '0')}-${set.slots[slot].id}.png`);
      await mkdir(dirname(file), { recursive: true });
      await sharp(res.buffer).toFile(file);
      for (const w of res.warnings ?? []) { warned++; console.warn(`WARN ${relative(ROOT, file)}: ${w}`); }
      console.log(relative(ROOT, file));
    })());
  }
  const results = await Promise.allSettled(tasks);
  await r.close();
  const failed = results.filter(x => x.status === 'rejected');
  for (const f of failed) console.error(`FAIL ${f.reason.message}`);
  // Warnings mean a shot is not store-ready (overflow, tiny headline, text over the app): fail the run.
  process.exit(failed.length || warned ? 1 : 0);
}
