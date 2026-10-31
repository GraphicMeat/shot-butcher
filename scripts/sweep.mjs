#!/usr/bin/env node
// Renders every style x theme x demo platform x locale x slot and prints the engine's warnings.
// Usage: node scripts/sweep.mjs [style-id ...]
import { join } from 'node:path';
import { startRenderer } from '../render/render.mjs';
import { ROOT } from '../render/serve.mjs';
import { STYLE_IDS, loadStyle } from '../engine/styles/index.js';

const ids = process.argv.slice(2).length ? process.argv.slice(2) : STYLE_IDS;
const DEMOS = [
  { set: 'demo/mailvault/set.json', platforms: ['mac'] },
  { set: 'demo/photobooks/set.json', platforms: ['iphone', 'ipad'] },
];
const r = await startRenderer({ jobs: 8 });
let count = 0;
let bad = 0;
try {
  for (const style of ids) {
    const { themes } = await loadStyle(style);
    const jobs = [];
    for (const theme of themes) for (const d of DEMOS) for (const platform of d.platforms) for (const locale of ['en-US', 'de-DE', 'ja']) for (let slot = 0; slot < 6; slot++) {
      jobs.push(r.renderOne({ setPath: join(ROOT, d.set), platform, locale, slot, style, theme })
        .then(res => { count++; for (const w of res.warnings ?? []) { bad++; console.log(`${style} ${theme} ${platform} ${locale} #${slot}: ${w}`); } })
        .catch(err => { bad++; console.log(`${style} ${theme} ${platform} ${locale} #${slot}: ERROR ${err.message.slice(0, 200)}`); }));
    }
    await Promise.all(jobs);
  }
} finally {
  await r.close();
}
console.log(`${count} renders, ${bad} problems`);
process.exit(bad ? 1 : 0);
