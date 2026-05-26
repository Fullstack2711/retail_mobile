#!/usr/bin/env bash
# iOS release arxivi (Mac + Xcode + Apple Developer kerak).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ "$(uname)" != "Darwin" ]]; then
  echo "iOS build faqat macOS da ishlaydi."
  exit 1
fi

echo "=== CocoaPods ==="
cd ios
if command -v bundle >/dev/null 2>&1 && [[ -f ../Gemfile ]]; then
  bundle install --quiet 2>/dev/null || true
  bundle exec pod install
else
  pod install
fi

WORKSPACE="$ROOT/ios/retail.xcworkspace"
SCHEME="retail"
ARCHIVE_PATH="$ROOT/ios/build/retail.xcarchive"
EXPORT_PATH="$ROOT/ios/build/export"
EXPORT_OPTIONS="$ROOT/ios/ExportOptions.plist"

mkdir -p "$ROOT/ios/build"

echo "=== Archive ==="
xcodebuild \
  -workspace "$WORKSPACE" \
  -scheme "$SCHEME" \
  -configuration Release \
  -destination "generic/platform=iOS" \
  -archivePath "$ARCHIVE_PATH" \
  archive \
  CODE_SIGN_STYLE=Automatic \
  DEVELOPMENT_TEAM="${APPLE_TEAM_ID:-}"

if [[ ! -f "$EXPORT_OPTIONS" ]]; then
  echo ""
  echo "Arxiv tayyor: $ARCHIVE_PATH"
  echo ""
  echo "IPA uchun Xcode oching:"
  echo "  Window → Organizer → Archives → Distribute App"
  echo ""
  echo "Yoki ios/ExportOptions.plist yarating (team ID bilan) va qayta:"
  echo "  APPLE_TEAM_ID=XXXXXXXX npm run build:ios"
  exit 0
fi

echo "=== Export IPA ==="
rm -rf "$EXPORT_PATH"
xcodebuild -exportArchive \
  -archivePath "$ARCHIVE_PATH" \
  -exportPath "$EXPORT_PATH" \
  -exportOptionsPlist "$EXPORT_OPTIONS"

echo ""
echo "IPA: $EXPORT_PATH"
