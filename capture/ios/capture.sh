#!/bin/zsh
# Runs ShotButcherTests on a simulator for one locale and exports the screenshots as <slot-id>.png.
# Usage:
#   capture/ios/capture.sh --scheme App --device "iPhone 17 Pro Max" --locale de-DE --out raw/iphone/de-DE \
#     [--project App.xcodeproj | --workspace App.xcworkspace] [--test-target AppUITests] [--landscape-left|--landscape-right]
# A screenshot taken while the device is in landscape is saved in portrait pixel orientation; the
# landscape flag turns the exported PNGs upright.
# Run it on the build box: ~/.claude/bin/testq ~/.claude/bin/minijob capture/ios/capture.sh ...
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
scheme="" device="" locale="en-US" out="" container=() target="" rotate=0
while (( $# > 0 )); do
  case "$1" in
    --scheme) scheme="$2"; shift 2 ;;
    --device) device="$2"; shift 2 ;;
    --locale) locale="$2"; shift 2 ;;
    --out) out="$2"; shift 2 ;;
    --project) container=(-project "$2"); shift 2 ;;
    --workspace) container=(-workspace "$2"); shift 2 ;;
    --test-target) target="$2"; shift 2 ;;
    --landscape-left) rotate=270; shift ;;
    --landscape-right) rotate=90; shift ;;
    *) print -u2 "unknown option $1"; exit 2 ;;
  esac
done
[[ -n "$scheme" && -n "$device" && -n "$out" ]] || { print -u2 "need --scheme --device --out"; exit 2; }
lang="${locale%%-*}"; region="${locale#*-}"; [[ "$region" == "$locale" ]] && region=""
work="$(mktemp -d)"; trap 'rm -rf "$work"' EXIT

udid=$(xcrun simctl list devices available -j | python3 -c "
import json,sys; name=sys.argv[1]
devs=[d for r in json.load(sys.stdin)['devices'].values() for d in r if d['name']==name]
print(devs[-1]['udid'] if devs else '')" "$device")
[[ -n "$udid" ]] || { print -u2 "No simulator named $device"; exit 1; }
xcrun simctl boot "$udid" 2>/dev/null || true
xcrun simctl bootstatus "$udid" -b >/dev/null
"$here/statusbar.sh" "$udid"

only=(); [[ -n "$target" ]] && only=(-only-testing:"$target/ShotButcherTests")
args=(test "${container[@]}" -scheme "$scheme" -destination "id=$udid" -testLanguage "$lang" -resultBundlePath "$work/run.xcresult" "${only[@]}")
[[ -n "$region" ]] && args+=(-testRegion "$region")
xcodebuild "${args[@]}" | tail -20

xcrun xcresulttool export attachments --path "$work/run.xcresult" --output-path "$work/att"
mkdir -p "$out"
python3 - "$work/att" "$out" <<'PY'
import json, os, re, shutil, sys
src, out = sys.argv[1], sys.argv[2]
for test in json.load(open(os.path.join(src, 'manifest.json'))):
    for a in test.get('attachments', []):
        m = re.match(r'^(.*?)_\d+_[0-9A-Fa-f-]+\.\w+$', a['suggestedHumanReadableName'])
        name = (m.group(1) if m else os.path.splitext(a['suggestedHumanReadableName'])[0]) + '.png'
        shutil.copy(os.path.join(src, a['exportedFileName']), os.path.join(out, name))
        print(os.path.join(out, name))
PY
if (( rotate )); then for f in "$out"/*.png; do sips -r "$rotate" "$f" >/dev/null; done; fi
"$here/statusbar.sh" --clear "$udid"
