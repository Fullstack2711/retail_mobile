const fs = require('fs')
const path = require('path')

const settingsPath = path.join(
  __dirname,
  '../node_modules/@react-native/gradle-plugin/settings.gradle.kts',
)

if (!fs.existsSync(settingsPath)) {
  process.exit(0)
}

const source = fs.readFileSync(settingsPath, 'utf8')
const next = source.replace(
  'id("org.gradle.toolchains.foojay-resolver-convention").version("0.5.0")',
  'id("org.gradle.toolchains.foojay-resolver-convention").version("1.0.0")',
)

if (source === next) {
  process.exit(0)
}

fs.writeFileSync(settingsPath, next)
console.log('Patched foojay-resolver-convention to 1.0.0 for Gradle 9 compatibility')
