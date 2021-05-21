/**
 * This module is just an async function that does the following:
 *   1. Grab chromedriver from the node_modules, as fetched by electron-chromedriver
 *   2. Spawn a process of it and waits for `ChromeDriver was started successfully.`
 *   3. Return successfully if this occurs, or promote the failure if it doesn't work
 */

const { spawn } = require('child_process')
const { resolve, join } = require('path')

const chromedriverPath = resolve(
  join(__dirname, '..', '..', '..', 'node_modules', '.bin', 'chromedriver')
)
module.exports = () =>
  new Promise((resolve, reject) => {
    const chromedriver = spawn(chromedriverPath, [], {
      env: process.env,
    })
    chromedriver.stdout.on('data', out => {
      const outStr = `${out}`
      console.log(outStr)
      const fullyStarted = outStr.includes(
        'ChromeDriver was started successfully.'
      )
      if (fullyStarted) {
        console.log('Continuing execution')
        resolve()
      }
    })
    chromedriver.stderr.on('data', err => {
      const errStr = `${err}`
      console.error(errStr)
    })
    chromedriver.on('close', code => {
      if (code) reject(code)
    })
  })
