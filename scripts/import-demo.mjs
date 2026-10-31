#!/usr/bin/env node
// Copies demo captures from the MailVault and PhotoBooks checkouts into demo/<app>/raw as webp.
// Usage: node scripts/import-demo.mjs [--mailvault DIR] [--photobooks DIR]
import { mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const mailvault = arg('--mailvault', join(homedir(), 'Repos/mail-vault-app/website/screenshots'));
const photobooks = arg('--photobooks', join(homedir(), 'Repos/AppStore/PhotoBooks/store-screenshots'));

export const MAILVAULT_SHOTS = ['unified-inbox', 'chat-view-chat', 'archive-progress', 'local-vault', 'premium-time-capsule', 'link-safety-modal'];
export const PHOTOBOOKS_SHOTS = ['01-welcome', '03-refine-selection', '04-smart-layout', '05-photo-tools', '08-cover', '10-export'];
const LOCALES = ['en-US', 'de-DE', 'ja'];

async function toWebp(src, dest) {
  if (!existsSync(src)) throw new Error(`missing ${src}`);
  await mkdir(dirname(dest), { recursive: true });
  await sharp(src).webp({ quality: 92, alphaQuality: 100 }).toFile(dest);
  console.log(dest);
}

for (const n of MAILVAULT_SHOTS) {
  await toWebp(join(mailvault, `${n}.png`), join(root, `demo/mailvault/raw/mac/dark/${n}.webp`));
  await toWebp(join(mailvault, `${n}-light-2880.webp`), join(root, `demo/mailvault/raw/mac/light/${n}.webp`));
}
for (const [platform, dir] of [['iphone', 'raw-ios'], ['ipad', 'raw-ipad']]) {
  for (const locale of LOCALES) {
    for (const n of PHOTOBOOKS_SHOTS) {
      await toWebp(join(photobooks, dir, locale, `${n}.png`), join(root, `demo/photobooks/raw/${platform}/${locale}/${n}.webp`));
    }
  }
}
