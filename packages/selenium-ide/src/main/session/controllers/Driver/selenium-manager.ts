import { execFile } from 'child_process'
import * as os from 'os'
import * as path from 'node:path'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)

export interface ChromeInstall {
  browserPath: string
  driverPath: string
  version: string
}

interface SeleniumManagerOutput {
  logs: { level: string; message: string }[]
  result: { driver_path: string; browser_path: string }
}

/**
 * Path to the Selenium Manager binary that ships with selenium-webdriver.
 * In the packaged app it is unpacked from app.asar so it can run.
 */
const getSeleniumManagerPath = () => {
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
  return path
    .join(seleniumDir, 'bin', folder, binary)
    .replace('app.asar', 'app.asar.unpacked')
}

/**
 * Asks Selenium Manager for the installed Chrome and a matching chromedriver,
 * which it downloads if needed. Returns null if Chrome isn't installed.
 */
export const findChrome = async (): Promise<ChromeInstall | null> => {
  try {
    const { stdout } = await execFileAsync(getSeleniumManagerPath(), [
      '--browser',
      'chrome',
      '--language-binding',
      'javascript',
      '--output',
      'json',
      // The debug logs include the detected browser version
      '--debug',
    ])
    const output: SeleniumManagerOutput = JSON.parse(stdout)
    const detected = output.logs
      .map(({ message }) => message.match(/^Detected browser: chrome (\S+)/))
      .find(Boolean)
    return {
      browserPath: output.result.browser_path,
      driverPath: output.result.driver_path,
      version: detected?.[1] ?? '',
    }
  } catch (e) {
    console.warn('Selenium Manager could not find Chrome', e)
    return null
  }
}
