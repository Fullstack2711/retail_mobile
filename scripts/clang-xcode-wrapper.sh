#!/bin/bash
# Autoconf-safe CC/CXX when Xcode is installed under a path with spaces.
set -euo pipefail
XCODE_DEV="${DEVELOPER_DIR:-/Applications/Xcode 2 20.08.05.app/Contents/Developer}"
TOOLCHAIN="$XCODE_DEV/Toolchains/XcodeDefault.xctoolchain/usr/bin"

use_cxx=0
for arg in "$@"; do
  case "$arg" in
    *.cpp|*.cc|*.cxx|*.CPP) use_cxx=1; break ;;
    -x|c++) [[ "${2:-}" == "c++" ]] && use_cxx=1 ;;
  esac
done

if [[ "$use_cxx" -eq 1 ]]; then
  CLANG="$TOOLCHAIN/clang++"
else
  CLANG="$TOOLCHAIN/clang"
fi

extra=()
if [[ -n "${GLOG_IOS_PLATFORM:-}" && -n "${GLOG_IOS_ARCH:-}" ]]; then
  SDK_PATH="$(xcrun -sdk "$GLOG_IOS_PLATFORM" --show-sdk-path)"
  extra=(-arch "$GLOG_IOS_ARCH" -isysroot "$SDK_PATH")
fi

exec "$CLANG" "${extra[@]}" "$@"
