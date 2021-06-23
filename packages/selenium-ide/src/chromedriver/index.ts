import { spawn } from 'child_process'
import { resolve, join } from 'path'
import { Config } from '../types'

const chromedriverPath = resolve(
  join(__dirname, '..', '..', '..', 'node_modules', '.bin', 'chromedriver')
)
const successMessage = 'ChromeDriver was started successfully.'

/**
 * This module is just an async function that does the following:
 *   1. Grab chromedriver from the node_modules, as fetched by electron-chromedriver
 *   2. Spawn a process of it and waits for `ChromeDriver was started successfully.`
 *   3. Return successfully if this occurs, or promote the failure if it doesn't work
 *   4. When Electron is quitting, close the child chromedriver process
 */
export default (app: Electron.App, config: Config) =>
  new Promise((resolve, reject) => {
    const chromedriver = spawn(chromedriverPath, [], {
      env: process.env,
    })
    chromedriver.stdout.on('data', (out: string) => {
      const outStr = `${out}`
      const fullyStarted = outStr.includes(successMessage)
      if (fullyStarted) {
        console.log(successMessage)
        resolve(chromedriver)
      } else {
        console.debug('Chromedriver:', outStr)
      }
    })
    chromedriver.stderr.on('data', (err: string) => {
      const errStr = `${err}`
      console.error(errStr)
    })
    chromedriver.on('close', (code: number) => {
      if (code) {
        console.warn('ChromeDriver has exited with code', code)
        reject(code)
      }
    })

    app.on('before-quit', () => {
      console.log('Killing chromedriver')
      chromedriver.kill()
    })
  })
