#!/usr/bin/env bash
# iOS Simulator / qurilma — Firebase bilan to‘g‘ri native build.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Node 22+ (package.json engines); Homebrew node@22 if default is older
if [[ -x /usr/local/opt/node@22/bin/node ]]; then
  export PATH="/usr/local/opt/node@22/bin:$PATH"
elif [[ -x /opt/homebrew/opt/node@22/bin/node ]]; then
  export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
fi

export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8
export RCT_USE_RN_DEP=0
export RCT_USE_PREBUILT_RNCORE=0

echo "=== CocoaPods (Firebase + RN source build) ==="
cd ios
if command -v bundle >/dev/null 2>&1 && [[ -f ../Gemfile ]] && bundle check >/dev/null 2>&1; then
  bundle exec pod install
else
  pod install
fi
cd "$ROOT"

echo "=== iOS run ==="
npx react-native run-ios "$@"
