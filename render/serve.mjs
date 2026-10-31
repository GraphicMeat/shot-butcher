#!/usr/bin/env node
// Static file server over the repo root (engine, demo sets, node_modules fonts, site).
// Usage: node render/serve.mjs [port]   (default 4870)
import { createServer } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { join, normalize, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.txt': 'text/plain', '.xml': 'application/xml',
};

// mounts: Map id -> absolute dir, served at /@set/<id>/ (sets that live outside this repo).
export function serve(port = 4870, root = ROOT, mounts = new Map()) {
  const server = createServer((req, res) => {
    let path;
    try { path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)); } catch { res.writeHead(400).end(); return; }
    if (path.includes('..')) { res.writeHead(400).end(); return; }
    const m = path.match(/^\/@set\/(\d+)(\/.*)$/);
    let file = m && mounts.has(m[1]) ? join(mounts.get(m[1]), m[2]) : join(root, path);
    try { if (statSync(file).isDirectory()) file = join(file, 'index.html'); statSync(file); }
    catch { res.writeHead(404).end('not found'); return; }
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream', 'cache-control': 'no-store' });
    createReadStream(file).pipe(res);
  });
  return new Promise(resolve => server.listen(port, '127.0.0.1', () => resolve(server)));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const server = await serve(Number(process.argv[2] ?? 4870));
  const { port } = server.address();
  console.log(`shot-butcher: http://127.0.0.1:${port}/site/  (engine: /engine/?set=/demo/mailvault/set.json)`);
}
