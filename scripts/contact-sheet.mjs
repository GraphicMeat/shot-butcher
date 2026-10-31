#!/usr/bin/env node
// Renders one style across both demo sets and writes a downscaled contact sheet for eyeballing.
// Usage: node scripts/contact-sheet.mjs <style-id> [--locale en-US] [--theme light|dark]
// Output: out/sheets/<style>-<locale>[-<theme>].png  (rows: Mac x6, iPhone x6, iPad x6)
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import { startRenderer } from '../render/render.mjs';
import { ROOT } from '../render/serve.mjs';

const style = process.argv[2];
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const locale = arg('--locale', 'en-US');
const theme = arg('--theme');
if (!style) { console.error('usage: contact-sheet.mjs <style-id> [--locale L] [--theme T]'); process.exit(2); }

const ROW_H = 420;
const GAP = 16;
const rows = [
  { set: 'demo/mailvault/set.json', platform: 'mac' },
  { set: 'demo/photobooks/set.json', platform: 'iphone' },
  { set: 'demo/photobooks/set.json', platform: 'ipad' },
];

const r = await startRenderer({ jobs: 6 });
const warnings = [];
const tiles = [];
try {
  let y = GAP;
  let width = 0;
  for (const row of rows) {
    let x = GAP;
    const shots = await Promise.all([0, 1, 2, 3, 4, 5].map(slot =>
      r.renderOne({ setPath: join(ROOT, row.set), platform: row.platform, locale, slot, style, theme })));
    for (const [i, s] of shots.entries()) {
      for (const w of s.warnings ?? []) warnings.push(`${row.platform} #${i}: ${w}`);
      const input = await sharp(s.buffer).resize({ height: ROW_H }).png().toBuffer();
      const { width: w } = await sharp(input).metadata();
      tiles.push({ input, left: x, top: y });
      x += w + GAP;
    }
    width = Math.max(width, x);
    y += ROW_H + GAP;
  }
  const out = join(ROOT, 'out/sheets', `${style}-${locale}${theme ? '-' + theme : ''}.png`);
  await mkdir(join(ROOT, 'out/sheets'), { recursive: true });
  await sharp({ create: { width, height: y, channels: 3, background: '#808080' } }).composite(tiles).png().toFile(out);
  console.log(out);
  for (const w of warnings) console.warn('WARN', w);
} finally {
  await r.close();
}
