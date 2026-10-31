import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toPrompt, parsePrompt, resolveSet } from '../engine/prompt.js';

test('toPrompt and parsePrompt round-trip every field', () => {
  const p = toPrompt({ style: 'swiss-grid', theme: 'light', accent: '#112233', platforms: ['iphone', 'ipad'], locales: ['en-US', 'ja'] }, 'A summary.');
  assert.equal(p, '/shot-butcher style=swiss-grid theme=light accent=#112233 platforms=iphone,ipad locales=en-US,ja\nA summary.');
  assert.deepEqual(parsePrompt(p), { style: 'swiss-grid', theme: 'light', accent: '#112233', platforms: ['iphone', 'ipad'], locales: ['en-US', 'ja'] });
});

test('parsePrompt finds the command line inside surrounding prose', () => {
  assert.deepEqual(parsePrompt('Make my shots like this:\n  /shot-butcher style=brutalist theme=dark accent=#FF0000\nthanks'),
    { style: 'brutalist', theme: 'dark', accent: '#FF0000' });
});

test('parsePrompt rejects bad input with a clear message', () => {
  assert.throws(() => parsePrompt('style=true-bento'), /no \/shot-butcher line/);
  assert.throws(() => parsePrompt('/shot-butcher theme=dark'), /no style=/);
  assert.throws(() => parsePrompt('/shot-butcher style=x theme=sepia'), /theme must be light or dark/);
  assert.throws(() => parsePrompt('/shot-butcher style=x accent=red'), /accent must be #rrggbb/);
  assert.throws(() => parsePrompt('/shot-butcher style=x colour=#fff'), /unknown prompt key "colour"/);
});

test('resolveSet falls back to the style default theme when the set theme is unsupported', () => {
  assert.equal(resolveSet({ theme: 'light' }, {}, ['dark']).theme, 'dark');
  assert.equal(resolveSet({ theme: 'light' }, {}, ['dark', 'light']).theme, 'light');
  assert.equal(resolveSet({ theme: 'light' }, { theme: 'dark' }, ['dark', 'light']).theme, 'dark');
});
