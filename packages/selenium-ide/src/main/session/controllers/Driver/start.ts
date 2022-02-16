import { resolveDriverName } from '@seleniumhq/get-driver'
import { ChildProcess, spawn } from 'child_process'
import * as fs from 'fs-extra'
import { BrowserInfo, Session } from 'main/types'
import * as path from 'path'
import * as os from 'os'

const successMessage = 'was started successfully.'
export interface DriverStartSuccess {
  driver: ChildProcess
  success: true
}
export interface DriverStartFailure {
  error: string
  success: false
}

/**
 * This module is just an async function that does the following:
 *   1. Grab driver from the node_modules, as fetched by electron-driver
 *   2. Spawn a process of it and waits for `driver was started successfully.`
 *   3. Return successfully if this occurs, or promote the failure if it doesn't work
 *   4. When Electron is quitting, close the child driver process
 */

export type StartDriver = (
  session: Session
) => (info: BrowserInfo) => Promise<DriverStartSuccess | DriverStartFailure>
const startDriver: StartDriver =
  ({ app, store }) =>
  ({ browser, version }) =>
    new Promise((resolve, reject) => {
      let initialized = false
      const logDriver = store.get('config.logDriver')
      const args = logDriver ? ['--verbose'] : []
      const driverPath =
        browser === 'electron'
          ? path.resolve(
              path.join(
                __dirname,
                '..',
                '..',
                '..',
                'node_modules',
                'electron-chromedriver',
                'bin',
                'chromedriver'
              )
            )
          : path.resolve(
              path
                .join(
                  __dirname,
                  '..',
                  'files',
                  resolveDriverName({
                    browser: browser,
                    platform: os.platform(),
                    version: version,
                  })
                )
                .replace('app.asar', 'app.asar.unpacked')
            )
      if (fs.existsSync(driverPath)) {
        const driver = spawn(driverPath, args, {
          env: {},
          shell: true,
        })
        driver.stdout.on('data', (out: string) => {
          const outStr = `${out}`
          const fullyStarted = outStr.includes(successMessage)
          if (fullyStarted) {
            initialized = true
            console.log('Driver has initialized!')
            resolve({ success: true, driver: driver })
          }
          if (logDriver) {
            console.log('Driver (stdout):', outStr)
          }
        })
        driver.stderr.on('data', (err: string) => {
          const errStr = `${err}`
          if (logDriver || !initialized) {
            console.log('Driver (stderr):', errStr)
            resolve({ success: false, error: errStr })
          }
        })
        driver.on('close', (code: number) => {
          if (code) {
            console.warn('driver has exited with code', code)
            if (!initialized) {
              reject(code)
            }
          }
        })
        app.on('before-quit', () => {
          console.log('Killing driver')
          driver.kill()
        })
      } else {
        resolve({
          success: false,
          error: `Missing executable at path ${driverPath}`,
        })
      }
    })

export default startDriver
