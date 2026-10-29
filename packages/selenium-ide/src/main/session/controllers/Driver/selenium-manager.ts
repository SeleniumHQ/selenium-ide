import { Capabilities } from 'selenium-webdriver'
import type * as DriverFinder from 'selenium-webdriver/common/driverFinder'

/**
 * selenium-webdriver finds Selenium Manager next to its own files. Load its
 * wrapper from node_modules instead of the webpack bundle, so that lookup
 * works. In the packaged app, load the copy unpacked from app.asar, because a
 * binary can't run from inside it.
 */
const { getBinaryPaths }: typeof DriverFinder = __non_webpack_require__(
  __non_webpack_require__
    .resolve('selenium-webdriver/common/driverFinder')
    .replace('app.asar', 'app.asar.unpacked')
)

/**
 * Paths to Chrome and a matching chromedriver. Selenium Manager downloads the
 * driver, and Chrome for Testing if Chrome isn't installed. Throws if it fails.
 */
export const findChrome = (): { browserPath: string; driverPath: string } =>
  getBinaryPaths(Capabilities.chrome())
