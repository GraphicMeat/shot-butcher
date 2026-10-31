#!/usr/bin/env node
// Downloads the demo photo set listed in demo/photos/unsplash.json and writes CREDITS.md.
// Usage: node scripts/fetch-unsplash.mjs <out-dir>
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = process.argv[2];
if (!out) { console.error('usage: fetch-unsplash.mjs <out-dir>'); process.exit(2); }
await mkdir(out, { recursive: true });

const photos = JSON.parse(await readFile(join(root, 'demo/photos/unsplash.json'), 'utf8'));
for (const [i, p] of photos.entries()) {
  const file = join(out, `unsplash_${String(i).padStart(2, '0')}.jpg`);
  if (existsSync(file)) continue;
  const res = await fetch(`${p.src}?w=2400&q=85&fm=jpg`);
  if (!res.ok) throw new Error(`${res.status} ${p.page}`);
  await writeFile(file, Buffer.from(await res.arrayBuffer()));
  console.log(file);
}

const rows = photos.map((p, i) =>
  `| unsplash_${String(i).padStart(2, '0')}.jpg | [${p.name}](https://unsplash.com/@${p.user}) | [photo](${p.page}) |`);
await writeFile(join(root, 'demo/photos/CREDITS.md'), `# Demo photo credits

Demo photo library for re-capturing the PhotoBooks demo screens, from [Unsplash](https://unsplash.com) under the
[Unsplash License](https://unsplash.com/license). Files are not stored in this repo;
\`node scripts/fetch-unsplash.mjs <dir>\` downloads them.

| File | Photographer | Source |
|---|---|---|
${rows.join('\n')}
`);
