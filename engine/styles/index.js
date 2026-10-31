// The 25 styles, in gallery order. Each id has a module ./<id>.js (see README "Style contract").
export const STYLE_IDS = [
  'true-bento', 'headline-top', 'bleed-top', 'panorama', 'tilted-3d',
  'zoom-callout', 'exploded-ui', 'full-bleed', 'split-duo', 'kinetic-type',
  'editorial-serif', 'swiss-grid', 'brutalist', 'minimal-mono', 'liquid-glass',
  'aurora-dark', 'spotlight', 'blueprint', 'annotated-sketch', 'checklist',
  'color-sequence', 'risograph', 'stat-hero', 'sticker-pop', 'stack-cascade',
];

export async function loadStyle(id) {
  if (!STYLE_IDS.includes(id)) throw new Error(`unknown style "${id}". Known: ${STYLE_IDS.join(', ')}`);
  return (await import(`./${id}.js`)).default;
}
