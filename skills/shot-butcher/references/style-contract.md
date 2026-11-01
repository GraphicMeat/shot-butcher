# Style contract

A style is one ES module, `engine/styles/<id>.js`, default-exporting:

```js
export default {
  id: 'true-bento',                 // matches the filename and STYLE_IDS in engine/styles/index.js
  name: 'True Bento',               // gallery title
  summary: 'One sentence.',         // printed under the prompt; describes the look precisely enough to recognise it
  themes: ['dark', 'light'],        // supported canvas themes, default first. One entry = theme-locked style.
  fonts: { display: "'Inter Tight'", text: "'Inter Tight'", mono: "'JetBrains Mono'" }, // mono optional
  palette: {                        // one object per supported theme; every key becomes a CSS var --<key>
    light: { bg: '#..', surface: '#..', ink: '#..', muted: '#..', line: '..' },
    dark:  { ... },
  },
  css: (ctx) => `...`,              // CSS string; every selector starts with .sb-<id>
  render: (ctx) => `...`,           // inner HTML of the canvas
};
```

## Canvas

`#canvas` is exactly `ctx.W x ctx.H` px with classes `sb sb-<id> sb-<platform> sb-<theme> sb-role-<role>`.
CSS vars on it: every palette key (`--bg`, `--ink`, ...), `--accent` (from the set, `#rrggbb`),
`--font-display`, `--font-text`, `--font-mono` (Noto Sans JP is appended as CJK fallback automatically).

| platform | W x H | shape |
|---|---|---|
| mac | 2880 x 1800 | landscape 16:10 |
| iphone | 1320 x 2868 | tall portrait |
| ipad | 2064 x 2752 | portrait 3:4 |
| ipad landscape | 2752 x 2064 | drawn with the `mac` layout: `ctx.platform` is `mac`, `ctx.devicePlatform` is `ipad` |

Design each platform's layout on purpose. Never stretch one layout across shapes.

## ctx

| field | meaning |
|---|---|
| `platform` | layout to draw: `mac` / `iphone` / `ipad` (landscape iPad sets get `mac`) |
| `devicePlatform`, `orientation` | real device (frame, store size) and `portrait` / `landscape` |
| `W`, `H`, `u(n)`, `v(n)` | canvas px; `u(n)` = n% of width, `v(n)` = n% of height |
| `theme`, `accent`, `locale` | resolved values (`locale` en-US, de-DE, ja, ...) |
| `index`, `count`, `role` | slot position; role is `hero` (first), `feature`, `closer` (last) |
| `slot` | `{ id, kicker, headline, sub, capture }` for this shot (copy already localised) |
| `slots` | all slots of the set with the same fields (for styles that show neighbours or continuity) |
| `app` | `{ name, icon (url or null), maker }` |
| `features` | array of short feature labels (the full list, localised) |
| `stat` | `{ value, label }` or null - a measured fact; never invent numbers |
| `tagline` | app tagline |
| `capture` | `{ src, w, h }` of this slot's capture (mac: a window with transparent rounded corners) |
| `captureAlt` | the same screen in the other theme `{ src, w, h }`, or null (mac only) |
| `device(opts)` | framed capture HTML. opts: `width`, `src`, `frame` (false = bare rounded screen), `shadow` (false / CSS string), `className`, `style` |
| `deviceHeight(width)` / `deviceWidthForHeight(height)` | layout maths for `device()` |
| `crop(opts)` | a region of the capture: `x, y, w, h` as fractions 0..1, `width` px, `radius`, `shadow`, `src`, `capture`, `className`, `style` |
| `esc(s)` | HTML-escape. Wrap every piece of copy in it. |

## Text fitting

Add `data-fit="N"` to a text element to cap it at N lines; the engine shrinks its font until it fits
(down to 40%). `data-fit=""` fits the element's own fixed box. Every headline and sub must carry one,
because German runs ~30% longer and Japanese wraps differently. Leftover overflow is reported as a WARN.

## Layout checks (engine, automatic)

After fitting, the engine adds a WARN when:
- an `<h1>` ends below the thumbnail floor (Mac 75px, iPhone 86px, iPad 72px);
- `[data-fit]` text leaves the canvas;
- `[data-fit]` text overlaps the visible part of a `.sb-device` (clipping ancestors respected).
  Intentional overlap (stickers, type behind a device): put `data-overlap-ok` on the text or an ancestor.

`node render/render.mjs` exits non-zero on any WARN. `node scripts/sweep.mjs [id]` renders every theme,
platform, locale and slot and lists all warnings.

Notes: `ctx.slots[i].capture` is a URL string (only `ctx.capture` / `ctx.captureAlt` carry `w`/`h`);
role defaults to hero/feature/closer by position when set.json omits it; optional per-slot hints
`slot.zoom {x,y,w,h}` (zoom-callout) and `slot.regions [{x,y,w,h}]` (exploded-ui) are fractions of the
capture. Background images in style CSS are awaited before the screenshot.

## Rules

- Copy only from ctx. No invented text, numbers, ratings, testimonials or user counts.
- No Apple trade dress, no retro-OS chrome, no Apple bezel artwork. Use `ctx.device()`.
- No external URLs: fonts are the bundled families in `engine/fonts.css`, images are ctx assets,
  decoration is CSS/SVG inline.
- Deterministic: no `Math.random()`, no time. Derive any variation from `ctx.index`.
- The style must look like one family across all slots and platforms of a set ("persistent"):
  same palette, type, frame and composition logic; only copy and capture change (plus any
  deliberate index-driven rhythm the style defines, e.g. colour sequence or panorama offset).
- Headline must stay readable at App Store thumbnail size: on iPhone the headline is at least ~6.5% of
  canvas width tall, on Mac ~2.6%.
- Keep the capture large enough that the UI is recognisable; the app is the hero, not the decoration.

## Checking a style

```
node scripts/contact-sheet.mjs <id> --locale en-US      # out/sheets/<id>-en-US.png
node scripts/contact-sheet.mjs <id> --locale de-DE
node scripts/contact-sheet.mjs <id> --locale ja
node scripts/contact-sheet.mjs <id> --theme light        # if the style supports both themes
```

Look at every sheet. Rows: Mac (MailVault, dark captures), iPhone and iPad (PhotoBooks, light captures).
WARN lines must be zero.
