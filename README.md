# shot-butcher

App Store screenshots for iPhone, iPad and Mac in 25 styles. One style holds across every screenshot,
device and locale of a set, and every style is reproducible from a one-line prompt:

```
shot-butcher style=true-bento theme=dark accent=#7C5CFF platforms=mac
```

Preview all 25 styles on real apps with the local gallery (below).

## Install the Claude Code skill

```
/plugin marketplace add GraphicMeat/shot-butcher
/plugin install shot-butcher@shot-butcher
```

Then ask Claude for App Store screenshots of your app, or paste a prompt from the gallery.
The skill captures your app (XCUITest, Mac window capture or Playwright), writes localised copy from your
product docs, and renders the set.

## Use it directly

```
npm install
npx playwright install chromium
node render/render.mjs demo/mailvault/set.json --style aurora-dark     # out/mailvault/aurora-dark/...
node render/render.mjs path/to/set.json --prompt "shot-butcher style=swiss-grid theme=light accent=#D93A1F"
```

Output is PNG at accepted App Store sizes (Mac 2880x1800, iPhone 6.9" 1320x2868, iPad 13" 2064x2752),
flattened with no alpha channel, up to 10 per device. Set format: [skills/shot-butcher/SKILL.md](skills/shot-butcher/SKILL.md).

## Preview site

```
npm run gallery          # renders all styles x demo sets x en-US/de-DE/ja into site/
npm run serve            # http://127.0.0.1:4870/site/
```

Deploying under another path: `SITE_BASE=/shot-butcher/ SITE_URL=https://graphicmeat.com npm run gallery`.

## Layout

| path | what |
|---|---|
| `engine/` | template page, device frames, prompt codec, `styles/<id>.js` (one file per style) |
| `render/` | Playwright renderer and static server |
| `capture/` | iOS (XCUITest), Mac window and web capture recipes |
| `demo/` | MailVault (Mac) and PhotoBooks (iPhone, iPad) demo sets: captures, copy, icons |
| `site/` | generated preview site |
| `skills/shot-butcher/` | the skill and its references (style contract, capture recipes, style list) |

Adding a style: [style contract](skills/shot-butcher/references/style-contract.md).

## Credits

Demo apps MailVault and PhotoBooks by [Graphic Meat](https://graphicmeat.com). The Unsplash photo set
for the PhotoBooks demo library is listed in [demo/photos/CREDITS.md](demo/photos/CREDITS.md). Fonts are
OFL, bundled through Fontsource.

## License

MIT
