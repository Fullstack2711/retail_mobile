#!/usr/bin/env bash
# Play Market (AAB) va test uchun APK.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f android/keystore.properties ]]; then
  echo "Xato: android/keystore.properties yo‘q."
  echo "Avval ishga tushiring: npm run keystore:android"
  exit 1
fi

echo "=== Release build (Android) ==="
# applicationId o‘zgarganda eski autolinking.json BuildConfig ni noto‘g‘ri qoldiradi
rm -rf "$ROOT/android/build/generated/autolinking"
cd android
chmod +x gradlew
./gradlew clean bundleRelease assembleRelease --no-daemon

AAB="$ROOT/android/app/build/outputs/bundle/release/app-release.aab"
APK="$ROOT/android/app/build/outputs/apk/release/app-release.apk"

echo ""
echo "Tayyor:"
echo "  Play Market uchun (AAB): $AAB"
echo "  Telefonga o‘rnatish (APK): $APK"
