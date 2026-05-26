#!/usr/bin/env bash
# iOS Simulator / qurilma — Firebase bilan to‘g‘ri native build.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8
export RCT_USE_RN_DEP=0
export RCT_USE_PREBUILT_RNCORE=0

echo "=== CocoaPods (Firebase + RN source build) ==="
cd ios
if command -v bundle >/dev/null 2>&1 && [[ -f ../Gemfile ]]; then
  bundle exec pod install
else
  pod install
fi
cd "$ROOT"

echo "=== iOS run ==="
npx react-native run-ios "$@"
