#!/bin/zsh
# Clean, fixed status bar on a booted simulator (9:41, full battery, full signal).
# Usage: capture/ios/statusbar.sh [device-udid|booted]   |  capture/ios/statusbar.sh --clear [device]
set -euo pipefail
if [[ "${1:-}" == --clear ]]; then xcrun simctl status_bar "${2:-booted}" clear; exit 0; fi
xcrun simctl status_bar "${1:-booted}" override \
  --time 9:41 --dataNetwork wifi --wifiMode active --wifiBars 3 \
  --cellularMode active --cellularBars 4 --operatorName "" \
  --batteryState charged --batteryLevel 100
