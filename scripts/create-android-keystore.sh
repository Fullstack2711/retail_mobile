#!/usr/bin/env bash
# Play Market uchun release imzo kaliti (bir marta).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
KEYSTORE="$ROOT/android/app/retail-release.keystore"
PROPS="$ROOT/android/keystore.properties"

if [[ -f "$KEYSTORE" ]]; then
  echo "Keystore allaqachon mavjud: $KEYSTORE"
  exit 0
fi

echo "=== Android release keystore ==="
echo "Parolni eslab qoling — Play Market yangilanishlarida kerak bo‘ladi."
read -rsp "Store parol: " STORE_PASS
echo
read -rsp "Key parol (Enter = store bilan bir xil): " KEY_PASS
echo
KEY_PASS="${KEY_PASS:-$STORE_PASS}"

keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore "$KEYSTORE" \
  -alias retail-release \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass "$STORE_PASS" \
  -keypass "$KEY_PASS" \
  -dname "CN=Retail Solution, OU=Mobile, O=Eman Materials, L=Tashkent, ST=Tashkent, C=UZ"

cat > "$PROPS" <<EOF
storeFile=retail-release.keystore
storePassword=$STORE_PASS
keyAlias=retail-release
keyPassword=$KEY_PASS
EOF

echo ""
echo "Tayyor:"
echo "  Keystore: $KEYSTORE"
echo "  Config:   $PROPS"
echo "Keyingi qadam: npm run build:android"
