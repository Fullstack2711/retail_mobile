#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SOURCE="${1:-${ROOT}/assets/app.jpg}"
SQUARE="${ROOT}/.icon-square-temp.png"

if [[ ! -f "$SOURCE" ]]; then
  echo "Missing source icon: $SOURCE"
  exit 1
fi

echo "Preparing square icon from $(basename "$SOURCE")..."

width=$(sips -g pixelWidth "$SOURCE" | awk '/pixelWidth/{print $2}')
height=$(sips -g pixelHeight "$SOURCE" | awk '/pixelHeight/{print $2}')
max=$(( width > height ? width : height ))

sips --padToHeightWidth "$max" "$max" --padColor FFFFFF "$SOURCE" --out "$SQUARE" >/dev/null
sips -z 1024 1024 "$SQUARE" --out "$SQUARE" >/dev/null
# JPEG manbadan sips ba'zan .png kengaytmasiga JPEG yozadi — Android faqat PNG qabul qiladi.
sips -s format png "$SQUARE" --out "$SQUARE" >/dev/null

resize() {
  local size="$1"
  local out="$2"
  local strip_alpha="${3:-}"
  sips -z "$size" "$size" "$SQUARE" -s format png --out "$out" >/dev/null
  if [[ "$strip_alpha" == "ios" ]]; then
    sips -s format jpeg "$out" --out "${out%.png}.jpg" >/dev/null
    sips -s format png "${out%.png}.jpg" --out "$out" >/dev/null
    rm -f "${out%.png}.jpg"
  fi
}

echo "Generating Android icons..."

ANDROID_RES="${ROOT}/android/app/src/main/res"
for spec in "48:mdpi" "72:hdpi" "96:xhdpi" "144:xxhdpi" "192:xxxhdpi"; do
  size="${spec%%:*}"
  density="${spec##*:}"
  dir="${ANDROID_RES}/mipmap-${density}"
  mkdir -p "$dir"
  resize "$size" "${dir}/ic_launcher.png" ""
  cp "${dir}/ic_launcher.png" "${dir}/ic_launcher_round.png"
done

echo "Generating iOS icons..."

IOS_ICONSET="${ROOT}/ios/retail/Images.xcassets/AppIcon.appiconset"
mkdir -p "$IOS_ICONSET"

declare -a IOS_ICONS=(
  "40:Icon-App-20x20@2x.png:20x20:iphone:2x"
  "60:Icon-App-20x20@3x.png:20x20:iphone:3x"
  "58:Icon-App-29x29@2x.png:29x29:iphone:2x"
  "87:Icon-App-29x29@3x.png:29x29:iphone:3x"
  "80:Icon-App-40x40@2x.png:40x40:iphone:2x"
  "120:Icon-App-40x40@3x.png:40x40:iphone:3x"
  "120:Icon-App-60x60@2x.png:60x60:iphone:2x"
  "180:Icon-App-60x60@3x.png:60x60:iphone:3x"
  "20:Icon-App-20x20@1x.png:20x20:ipad:1x"
  "40:Icon-App-20x20@2x-ipad.png:20x20:ipad:2x"
  "29:Icon-App-29x29@1x.png:29x29:ipad:1x"
  "58:Icon-App-29x29@2x-ipad.png:29x29:ipad:2x"
  "40:Icon-App-40x40@1x.png:40x40:ipad:1x"
  "80:Icon-App-40x40@2x-ipad.png:40x40:ipad:2x"
  "76:Icon-App-76x76@1x.png:76x76:ipad:1x"
  "152:Icon-App-76x76@2x.png:76x76:ipad:2x"
  "167:Icon-App-83.5x83.5@2x.png:83.5x83.5:ipad:2x"
  "1024:Icon-App-1024x1024@1x.png:1024x1024:ios-marketing:1x"
)

json='{"images":['
first=true
for entry in "${IOS_ICONS[@]}"; do
  IFS=':' read -r px filename size idiom scale <<< "$entry"
  resize "$px" "${IOS_ICONSET}/${filename}" ios
  if [[ "$first" == true ]]; then first=false; else json+=','; fi
  json+="{\"filename\":\"${filename}\",\"idiom\":\"${idiom}\",\"scale\":\"${scale}\",\"size\":\"${size}\"}"
done
json+='],"info":{"author":"xcode","version":1}}'

printf '%s\n' "$json" > "${IOS_ICONSET}/Contents.json"
rm -f "$SQUARE"

echo "Done. Icons generated from $(basename "$SOURCE")"
