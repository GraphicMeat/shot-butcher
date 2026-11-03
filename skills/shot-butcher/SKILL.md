---
name: shot-butcher
description: Capture and compose App Store screenshots for iPhone, iPad and Mac in one of 25 named styles (true-bento, panorama, editorial-serif, aurora-dark, ...), locked across every shot, device and locale. Use when the user wants App Store / Mac App Store screenshots, store marketing images, a screenshot style from the shot-butcher gallery, or pastes a "shot-butcher style=..." prompt line.
---

# shot-butcher

Renders store-ready PNGs (exact App Store sizes, flattened, no alpha) from real app captures plus
localised copy, in one style that stays identical across the whole set.

Repo root (`ROOT`) is two levels above this file. Run everything from `ROOT`. First use: `npm install`
in `ROOT` (Playwright Chromium: `npx playwright install chromium`).

## Inputs you need

1. **Style prompt** (optional). A line like
   `shot-butcher style=true-bento theme=dark accent=#7C5CFF platforms=mac` (a leading `/` is accepted too).
   Parse it with `engine/prompt.js` `parsePrompt()`. Keys: `style theme accent platforms locales`.
   No prompt: send the user to https://graphicmeat.com/shot-butcher or list `references/styles.md` and
   let them pick. Never invent a style id; the list is `engine/styles/index.js` `STYLE_IDS`.
2. **The app's facts.** Read the app's PRODUCT.md / README / store metadata. Feature labels and
   claims come only from there, using the app's own terms. Numbers only if measured and documented.
   No testimonials, ratings, download counts or awards unless the user supplies the real source.
3. **Captures** (see Capture). Up to 10 per device. Real UI only, never mocked.

## Set layout (in the app repo, e.g. `store/shot-butcher/`)

```
set.json
icon.png                      app icon, 512+ px
copy/<locale>.json            one per store locale
raw/<platform>/<theme|locale>/<slot-id>.png|webp
```

`set.json`:

```json
{
  "app": { "name": "MailVault", "icon": "icon.png", "maker": "Graphic Meat" },
  "style": "true-bento", "accent": "#7C5CFF", "theme": "dark",
  "platforms": ["mac"], "locales": ["en-US", "de-DE"],
  "capture": "raw/{platform}/{theme}/{id}.webp",
  "slots": [ { "id": "unified-inbox", "role": "hero" }, { "id": "chat-view", "role": "feature" }, { "id": "safety", "role": "closer" } ]
}
```

`capture` is a path template: `{platform} {theme} {locale} {id}`. Use `{theme}` when you captured light
and dark (Mac apps; enables split-duo), `{locale}` when the UI is localised per store locale.
Roles: first slot `hero`, last `closer`, the rest `feature` (derived by position when omitted).
For zoom-callout and exploded-ui, add `"zoom": {"x","y","w","h"}` / `"regions": [...]` (fractions of the
capture) to each slot so the magnified parts land on the UI that matters; the built-in defaults are
tuned to the demo apps only.

`copy/<locale>.json`:

```json
{
  "tagline": "Read your mail. Keep your mail.",
  "slots": { "unified-inbox": { "kicker": "Unified inbox", "headline": "Read your mail. Keep your mail.", "sub": "One plain sentence." } },
  "features": ["Unified inbox", "Chat view", "..."],
  "stat": { "value": "15 ms", "label": "to search 50,000 messages, offline" }
}
```

Copy rules: headline 3-7 words, sub one sentence, plain and concrete (name the mechanism, not the
benefit). `stat` is optional and must be a documented measurement; omit it otherwise. Translate every
locale; keep product terms and numbers invariant.

## Capture

Pick by app type (details and scripts in `references/capture.md`):

- **iOS / iPadOS (SwiftUI/UIKit):** XCUITest screenshots with a fixed status bar
  (`capture/ios/statusbar.sh`, `capture/ios/ScreenshotTests.swift` template, `capture/ios/capture.sh`).
  Simulators: iPhone 6.9" class (1320x2868) and iPad 13" (2064x2752), portrait.
- **macOS native:** window capture with transparent rounded corners (`capture/mac/window.sh`),
  light and dark.
- **Web / Tauri / Electron with a browser demo build:** `capture/web.mjs` with a JSON shot list.

Builds and UI tests run on the build box through the job queue, never on this machine:
`~/.claude/bin/testq ~/.claude/bin/minijob <cmd>` for macOS/iOS jobs.

## Render

```
node render/render.mjs <path/to/set.json>                       # style/theme/accent from set.json
node render/render.mjs <set.json> --prompt "<prompt line>"      # style from the user's prompt
node render/render.mjs <set.json> --style aurora-dark --platform iphone --locale de-DE
```

Output: `out/<set-dir>/<style>/<platform>/<locale>/NN-<slot>.png`, validated (accepted size, no alpha).
Any `WARN ... text overflow` means copy is too long for that style: shorten the copy, do not hack CSS.

## Verify before handing over

1. `node scripts/contact-sheet.mjs <style>` style check on the demo sets if you changed a style.
2. Open a few output PNGs (Read tool) per platform and locale: headline readable, nothing clipped,
   UI recognisable, same style on every shot.
3. Report the output folder and the exact prompt line that reproduces the set
   (`engine/prompt.js` `toPrompt()`), so the user can regenerate it later.

## Adding or changing a style

Follow `references/style-contract.md`. Register the id in `engine/styles/index.js`, run the contact
sheets for en-US, de-DE and ja plus both themes, then rebuild the gallery (`npm run gallery`).
