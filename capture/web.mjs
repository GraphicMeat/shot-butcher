#!/usr/bin/env node
// Captures a web / Tauri / Electron demo build with Playwright from a JSON shot list.
// Usage: node capture/web.mjs <shots.json> [--out <dir>]
//
// shots.json:
// {
//   "baseUrl": "http://127.0.0.1:5173/demo/",
//   "viewport": { "width": 1440, "height": 900 },   // CSS px
//   "scale": 2,                                      // device pixel ratio (iPhone 6.9": 440x956 at 3 = 1320x2868)
//   "platform": "mac",
//   "themes": ["dark", "light"],                     // optional; sets prefers-color-scheme per pass
//   "shots": [
//     { "id": "unified-inbox", "path": "#/inbox", "steps": [ { "click": "text=All Inboxes" }, { "wait": 500 } ] }
//   ]
// }
// Steps: { "click": selector } { "fill": selector, "text": "..." } { "press": "Meta+K" } { "wait": ms } { "waitFor": selector }
// Output: <out>/<platform>/<theme>/<id>.png (out defaults to ./raw next to shots.json)
import { readFile, mkdir } from 'node:fs/promises';
import { join, dirname, resolve } from 'node:path';
import { chromium } from 'playwright';

const file = process.argv[2];
if (!file) { console.error('usage: capture/web.mjs <shots.json> [--out dir]'); process.exit(2); }
const cfg = JSON.parse(await readFile(file, 'utf8'));
const outIdx = process.argv.indexOf('--out');
const out = outIdx > 0 ? process.argv[outIdx + 1] : join(dirname(resolve(file)), 'raw');

const browser = await chromium.launch();
try {
  for (const theme of cfg.themes ?? ['light']) {
    const ctx = await browser.newContext({ viewport: cfg.viewport, deviceScaleFactor: cfg.scale ?? 2, colorScheme: theme, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    for (const shot of cfg.shots) {
      await page.goto(new URL(shot.path ?? '', cfg.baseUrl).href, { waitUntil: 'networkidle' });
      for (const step of shot.steps ?? []) {
        if (step.click) await page.click(step.click);
        else if (step.fill) await page.fill(step.fill, step.text ?? '');
        else if (step.press) await page.keyboard.press(step.press);
        else if (step.waitFor) await page.waitForSelector(step.waitFor);
        else if (step.wait) await page.waitForTimeout(step.wait);
      }
      await page.evaluate(() => document.fonts.ready);
      const dest = join(out, cfg.platform ?? 'mac', theme, `${shot.id}.png`);
      await mkdir(dirname(dest), { recursive: true });
      await page.screenshot({ path: dest });
      console.log(dest);
    }
    await ctx.close();
  }
} finally {
  await browser.close();
}
