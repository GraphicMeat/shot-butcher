#!/bin/zsh
# Captures the front window of a running Mac app as PNG with transparent rounded corners, no shadow.
# Usage: capture/mac/window.sh "<App Name>" <out.png>
# Needs Screen Recording permission for the terminal. Resize the window to 16:10-ish first
# (for example 1440x900 points) so it sits well in Mac styles.
set -euo pipefail
app="$1"; out="$2"
id=$(swift -e '
import CoreGraphics
let name = CommandLine.arguments[1]
let list = CGWindowListCopyWindowInfo([.optionOnScreenOnly, .excludeDesktopElements], kCGNullWindowID) as! [[String: Any]]
if let w = list.first(where: { ($0[kCGWindowOwnerName as String] as? String) == name && ($0[kCGWindowLayer as String] as? Int) == 0 }) {
  print(w[kCGWindowNumber as String] as! Int)
}' "$app")
[[ -n "$id" ]] || { print -u2 "No on-screen window for $app"; exit 1; }
mkdir -p "$(dirname "$out")"
screencapture -o -x -l"$id" "$out"
print "$out"
