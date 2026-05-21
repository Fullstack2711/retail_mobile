const fs = require('fs');
const path = require('path');

const pkgPath = path.join(
  __dirname,
  '../node_modules/react-native-gesture-handler/package.json',
);

if (!fs.existsSync(pkgPath)) {
  process.exit(0);
}

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const ios = pkg.codegenConfig?.ios ?? {};

if (ios.modulesProvider?.RNGestureHandlerModule) {
  process.exit(0);
}

pkg.codegenConfig = pkg.codegenConfig ?? { name: 'rngesturehandler_codegen', type: 'all' };
pkg.codegenConfig.ios = {
  ...ios,
  modulesProvider: {
    ...(ios.modulesProvider ?? {}),
    RNGestureHandlerModule: 'RNGestureHandlerModule',
  },
};

fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
console.log('Patched react-native-gesture-handler modulesProvider for New Architecture');
