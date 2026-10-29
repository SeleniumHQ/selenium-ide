import * as os from 'os'
import * as path from 'node:path'
import { Capabilities } from 'selenium-webdriver'
import { getBinaryPaths } from 'selenium-webdriver/common/driverFinder'

/**
 * selenium-webdriver looks for Selenium Manager next to its own files, which
 * moves when webpack bundles it, and the packaged app can't run a binary
 * from inside app.asar. Point it at the unpacked binary instead.
 */
const useUnpackedSeleniumManager = () => {
  if (process.env.SE_MANAGER_PATH) return
  const folder =
    os.platform() === 'win32'
      ? 'windows'
      : os.platform() === 'darwin'
      ? 'macos'
      : os.arch() === 'arm64'
      ? 'linux-arm64'
      : 'linux-x86_64'
  const binary =
    os.platform() === 'win32' ? 'selenium-manager.exe' : 'selenium-manager'
  const seleniumDir = path.dirname(
    __non_webpack_require__.resolve('selenium-webdriver/package.json')
  )
  process.env.SE_MANAGER_PATH = path
    .join(seleniumDir, 'bin', folder, binary)
    .replace('app.asar', 'app.asar.unpacked')
}

/**
 * Path to a chromedriver for the installed Chrome. Selenium Manager downloads
 * it if needed. Returns null if Chrome isn't installed.
 */
export const findChromeDriver = (): string | null => {
  useUnpackedSeleniumManager()
  try {
    return getBinaryPaths(Capabilities.chrome()).driverPath
  } catch (e) {
    console.warn('Selenium Manager could not find Chrome', e)
    return null
  }
}
