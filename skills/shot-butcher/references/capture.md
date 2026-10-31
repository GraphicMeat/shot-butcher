# Capture recipes

Captures are the real app with demo data. Never mock UI. Capture at full device resolution;
the renderer scales down, never up.

| platform | capture size | how |
|---|---|---|
| iphone | 1320x2868 (iPhone 6.9" class simulator, portrait) | XCUITest |
| ipad | 2064x2752 (iPad Pro 13" simulator, portrait) | XCUITest |
| mac | Retina window, about 2880 px wide, transparent corners | window capture |
| web demo | 2x of the CSS viewport | Playwright |

## Demo data

Seed a deterministic demo account/library that the app loads in DEBUG builds behind a launch
argument (`-ShotButcher 1`). Same data in every locale, localised where the UI would be. Photos or
media in the demo must be licensed for publishing (for example Unsplash, credited in the repo).
Fixed clock: status bar 9:41, and in-app dates from the fixture, never "now".

## iOS / iPadOS

1. Copy `capture/ios/ScreenshotTests.swift` into the UI test target, fill `shots` with
   slot id -> launch arguments that open each screen.
2. Per device and locale:
   ```
   capture/ios/capture.sh --project App.xcodeproj --scheme App --test-target AppUITests \
     --device "iPhone 17 Pro Max" --locale de-DE --out store/shot-butcher/raw/iphone/de-DE
   ```
   The script boots the simulator, pins the status bar (`statusbar.sh`), runs the test with
   `-testLanguage/-testRegion`, exports attachments with `xcresulttool` and names them `<slot-id>.png`.
3. iPad shots must be portrait: lock orientation in the test (`XCUIDevice.shared.orientation = .portrait`)
   before launching. A landscape UI saved into a portrait image is a bug, recapture it.

Builds and UI tests go to the build box: `~/.claude/bin/testq ~/.claude/bin/minijob <cmd>`. The job
clone is deleted when the job ends, so the job command must copy the PNGs somewhere that survives it
before it exits; check how your queue returns artifacts first.

## macOS native

Run the app with demo data, size the window (about 1440x900 points), then for each screen in light
and dark appearance:

```
capture/mac/window.sh "MailVault" store/shot-butcher/raw/mac/dark/unified-inbox.png
```

The PNG keeps the window's rounded corners transparent so styles can float it. The terminal needs
Screen Recording permission. An XCUITest equivalent: `XCUIApplication().windows.firstMatch.screenshot()`.

## Web / Tauri / Electron demo builds

```
node capture/web.mjs store/shot-butcher/shots.json
```

See the header of `capture/web.mjs` for the JSON format (base URL, viewport, steps, themes).
A browser capture has no OS window chrome; for Mac store shots of a desktop app prefer a real window
capture.
