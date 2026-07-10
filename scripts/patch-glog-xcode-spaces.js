#!/usr/bin/env node
/**
 * Xcode in a folder name with spaces breaks glog's configure script.
 * Use a wrapper CC/CXX and fix broken CXX default expansion in RN's script.
 */
const fs = require('fs');
const path = require('path');

const scriptPath = path.join(
  __dirname,
  '..',
  'node_modules',
  'react-native',
  'scripts',
  'ios-configure-glog.sh',
);

if (!fs.existsSync(scriptPath)) {
  console.log('skip patch-glog-xcode-spaces: react-native not installed');
  process.exit(0);
}

const wrapperPath = path.join(__dirname, 'clang-xcode-wrapper.sh');
fs.chmodSync(wrapperPath, 0o755);

let content = fs.readFileSync(scriptPath, 'utf8');
const marker = 'GLOG_CC_WRAPPER=';

if (content.includes(marker)) {
  if (content.includes('export CXX="${CXX:-$CC}"')) {
    console.log('glog Xcode spaces patch already applied');
    process.exit(0);
  }
  content = content.replace(/export CXX="\$CXX:-\$CC"/g, 'export CXX="${CXX:-$CC}"');
  fs.writeFileSync(scriptPath, content);
  console.log('Fixed CXX export in ios-configure-glog.sh');
  process.exit(0);
}

const oldBlock = `XCRUN="$(which xcrun || true)"
if [ -n "$XCRUN" ]; then
  export CC="$(xcrun -find -sdk $PLATFORM_NAME cc) -arch $CURRENT_ARCH -isysroot $(xcrun -sdk $PLATFORM_NAME --show-sdk-path)"
  export CXX="$CC"
else
  export CC="$CC:-$(which gcc)"
  export CXX="$CXX:-$(which g++ || true)"
fi
export CXX="$CXX:-$CC"`;

const newBlock = `GLOG_CC_WRAPPER="${wrapperPath}"
XCRUN="$(which xcrun || true)"
if [ -n "$XCRUN" ]; then
  SDK_PATH="$(xcrun -sdk "$PLATFORM_NAME" --show-sdk-path)"
  if [[ -x "$GLOG_CC_WRAPPER" ]]; then
    export CC="$GLOG_CC_WRAPPER"
    export CXX="$CC"
    export GLOG_IOS_PLATFORM="$PLATFORM_NAME"
    export GLOG_IOS_ARCH="$CURRENT_ARCH"
  else
    CC_BIN="$(xcrun -find -sdk "$PLATFORM_NAME" cc)"
    export CC="\\"$CC_BIN\\" -arch $CURRENT_ARCH -isysroot \\"$SDK_PATH\\""
    export CXX="$CC"
  fi
else
  export CC="$CC:-$(which gcc)"
  export CXX="$CXX:-$(which g++ || true)"
fi
export CXX="\${CXX:-$CC}"`;

if (!content.includes(oldBlock)) {
  console.warn('patch-glog-xcode-spaces: expected block not found, skipping');
  process.exit(0);
}

content = content.replace(oldBlock, newBlock);
fs.writeFileSync(scriptPath, content);
console.log('Patched ios-configure-glog.sh for Xcode paths with spaces');
