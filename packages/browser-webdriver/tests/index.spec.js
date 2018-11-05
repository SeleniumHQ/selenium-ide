// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

import fs from 'fs'
import path from 'path'
import webdriver from 'selenium-webdriver'

const SERVER = process.env.SELENIUM_SERVER || 'http://localhost:4444/wd/hub'

describe('browser webdriver', () => {
  jest.setTimeout(30000)
  let driver
  beforeAll(() => {
    if (!fs.existsSync(path.join(__dirname, '../build/webdriver.js')))
      throw new Error(
        'Please run `yarn build:webdriver` or `yarn build:webdriver:dev` prior to running tests!'
      )
  })
  beforeEach(async () => {
    driver = new webdriver.Builder()
      .forBrowser('chrome')
      .usingServer(SERVER)
      .build()
    const clientScript = fs
      .readFileSync(path.join(__dirname, '../build/webdriver.js'))
      .toString()
    await driver.executeScript(clientScript)
  })
  afterEach(async () => {
    await driver.quit()
  })
  it('should get web page title', async () => {
    let result = await driver.executeAsyncScript((...args) => {
      const SERVER = args[0]
      let done = args[args.length - 1]
      let d = new window.browserWebdriver.Builder()
        .forBrowser('chrome')
        .usingServer(SERVER)
        .build()
      d.get('https://google.com')
      d.getTitle().then(title => {
        d.quit()
        done(title)
      })
    }, SERVER)

    expect(result).toBe('Google')
  })
  it.skip('should perform the cheese test', async () => {
    let result = await driver.executeAsyncScript((...args) => {
      const SERVER = args[0]
      let done = args[args.length - 1]
      let d = new window.browserWebdriver.Builder()
        .forBrowser('chrome')
        .usingServer(SERVER)
        .build()
      const By = window.browserWebdriver.By
      const Key = window.browserWebdriver.Key
      const until = window.browserWebdriver.until
      d.get('https://google.com')
      let searchInput = d.findElement(By.name('q'))
      searchInput.sendKeys('cheese')
      searchInput.sendKeys(Key.ENTER)
      // TODO: Fix and un-skip. Seems to fail here.
      // Adding console.log statement adds enough delay to cause the test to pass with regularity
      // e.g.,
      // console.log("for posterity")
      d.wait(until.elementLocated(By.linkText('Cheese - Wikipedia')), 15000)
      let link = d.findElement(By.linkText('Cheese - Wikipedia'))
      link.click()
      d.wait(until.titleIs('Cheese - Wikipedia'), 15000)

      d.getTitle().then(title => {
        d.quit()
        done(title)
      })
    }, SERVER)

    expect(result).toBe('Cheese - Wikipedia')
  })
  it.skip('should perform file uploads', async () => {
    const script = fs
      .readFileSync(path.join(__dirname, 'fixtures/file.js'))
      .toString()
    const filePath = path.join(__dirname, 'fixtures/file.txt')
    const file = fs.readFileSync(filePath).toString()
    let result = await driver.executeAsyncScript(
      (...args) => {
        const SERVER = args[0]
        const script = args[1]
        const filePath = args[2]
        let done = args[args.length - 1]
        let d = new window.browserWebdriver.Builder()
          .forBrowser('chrome')
          .usingServer(SERVER)
          .build()
        const By = window.browserWebdriver.By
      d.get('data:text/html,<input id="f" type="file" /><div id="r"></div>'); // eslint-disable-line
        d.executeScript(script)
        let up = d.findElement(By.id('f'))
        up.sendKeys(filePath)
        let result = d.findElement(By.id('r'))
        result.getText().then(text => {
          d.quit()
          done(text)
        })
      },
      SERVER,
      script,
      filePath
    )

    expect(result).toBe(file.substr(0, file.length - 1)) // remove new line character
  })
})
