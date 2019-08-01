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

import path from 'path'
import webdriver from 'selenium-webdriver'
import 'chromedriver'
import engine from 'engine.io'
import RecordPostprocessor from '@seleniumhq/side-recorder-postprocessor'

const { By, until } = webdriver

jest.setTimeout(300000)

describe('recorder e2e', () => {
  let driver
  let server
  let extSocket
  beforeEach(async () => {
    server = engine.listen(4445)
    server.on('connection', socket => {
      extSocket = socket
    })
    const builder = new webdriver.Builder().withCapabilities({
      browserName: 'chrome',
      // vendor prefix required as of ChromeDriver 75
      // https://groups.google.com/d/msg/chromedriver-users/ZnGlzYfsgt4/IbEHKSW8AQAJ
      'goog:chromeOptions': {
        // Don't set it to headless as extensions dont work in general
        // when used in headless mode
        // https://pptr.dev/#?product=Puppeteer&version=v1.12.2&show=api-working-with-chrome-extensions
        // in production it really doesn't matter as recording in headless mode doesn't make sense
        args: [`load-extension=${path.join(__dirname + '../../../build')}`],
      },
    })
    driver = await builder.build()
  })
  afterEach(async () => {
    await server.httpServer.close()
    await server.close()
    await driver.quit()
  })
  it('should record a command', async () => {
    const recording = []
    await driver.get('http://the-internet.herokuapp.com/')
    await driver.sleep(1000)
    extSocket.on('message', data => {
      const message = JSON.parse(data)
      if (message.type === 'record') {
        recording.push(message.payload)
      }
    })
    psend(
      extSocket,
      JSON.stringify({
        type: 'attach',
        payload: {
          sessionId: 'aaa',
        },
      })
    )
    const elem = await driver.findElement(By.linkText('JavaScript Alerts'))
    await elem.click()
    const alertButton = await driver.wait(
      until.elementLocated(By.css('.example li:first-child button'))
    )
    await alertButton.click()
    await driver
      .switchTo()
      .alert()
      .accept()
    await driver.sleep(100)
    psend(
      extSocket,
      JSON.stringify({
        type: 'detach',
      })
    )
    extSocket.removeAllListeners('message')
    await driver.sleep(100)
    expect(recording.length).toBe(5)
    expect(recording[0].command).toBe('open')
    expect(recording[1].command).toBe('click')
    expect(recording[2].command).toBe('click')
    expect(recording[3].command).toBe('assertAlert')
    expect(recording[4].command).toBe('acceptAlert')
  })
  it('should record a new window', async () => {
    const recording = []
    await driver.get('http://the-internet.herokuapp.com/')
    await driver.sleep(1000)
    extSocket.on('message', data => {
      const message = JSON.parse(data)
      if (message.type === 'record') {
        recording.push(message.payload)
      }
    })
    psend(
      extSocket,
      JSON.stringify({
        type: 'attach',
        payload: {
          sessionId: 'aaa',
        },
      })
    )
    const handles = await driver.getAllWindowHandles()
    const elem = await driver.findElement(By.linkText('Elemental Selenium'))
    await elem.click()
    await driver.sleep(100)
    const handle = await getNewWindowHandle(driver, handles)
    await driver.switchTo().window(handle)
    await driver.sleep(100)
    psend(
      extSocket,
      JSON.stringify({
        type: 'detach',
      })
    )
    await driver.sleep(100)
    expect(recording.length).toBe(3)
    expect(recording[0].command).toBe('open')
    expect(recording[1].command).toBe('click')
    expect(recording[2].command).toBe('selectWindow')
  })
  it('should record switching to an existing window', async () => {
    const recording = []
    await driver.sleep(1000)
    extSocket.on('message', data => {
      const message = JSON.parse(data)
      if (message.type === 'record') {
        recording.push(message.payload)
      }
    })
    await driver.get('http://the-internet.herokuapp.com/')
    await driver.executeScript('window.__side.setWindowHandle("root", "aab")')
    const handles = await driver.getAllWindowHandles()
    const elem = await driver.findElement(By.linkText('Elemental Selenium'))
    await elem.click()
    await driver.sleep(2000)
    const handle = await getNewWindowHandle(driver, handles)
    await driver.switchTo().window(handle)
    await driver.executeScript('window.__side.setWindowHandle("newWin", "aab")')
    await driver.sleep(100)
    psend(
      extSocket,
      JSON.stringify({
        type: 'attach',
        payload: {
          sessionId: 'aab',
          hasRecorded: true,
        },
      })
    )
    await driver.sleep(1000)
    await driver.switchTo().window(handles[0])
    await driver.sleep(100)
    await driver.switchTo().window(handle)
    await driver.sleep(1000)
    psend(
      extSocket,
      JSON.stringify({
        type: 'detach',
      })
    )
    await driver.sleep(100)
    expect(recording[0].command).toBe('selectWindow')
    expect(recording[0].target[0][0]).toBe('handle=${root}')
    expect(recording[1].command).toBe('selectWindow')
    expect(recording[1].target[0][0]).toBe('handle=${newWin}')
    expect(recording.length).toBe(2)
  })
  it('should postprocess the recording', async () => {
    const prc = new RecordPostprocessor()
    await driver.get('http://the-internet.herokuapp.com/')
    await driver.sleep(1000)
    extSocket.on('message', data => {
      const message = JSON.parse(data)
      if (message.type === 'record') {
        prc.record(prc.commands.length, message.payload)
      }
    })
    psend(
      extSocket,
      JSON.stringify({
        type: 'attach',
        payload: {
          sessionId: 'aaa',
        },
      })
    )
    const elem = await driver.findElement(By.linkText('JavaScript Alerts'))
    await elem.click()
    const alertButton = await driver.wait(
      until.elementLocated(By.css('.example li:first-child button'))
    )
    await alertButton.click()
    await driver
      .switchTo()
      .alert()
      .accept()
    await driver.sleep(100)
    psend(
      extSocket,
      JSON.stringify({
        type: 'detach',
      })
    )
    extSocket.removeAllListeners('message')
    await driver.sleep(100)
    expect(prc.commands.length).toBe(5)
    expect(prc.commands[0].command).toBe('open')
    expect(prc.commands[1].command).toBe('click')
    expect(prc.commands[1].target).toBeDefined()
    expect(prc.commands[1].targetFallback).toBeDefined()
    expect(prc.commands[2].command).toBe('click')
    expect(prc.commands[3].command).toBe('assertAlert')
    expect(prc.commands[4].command).toBe('acceptAlert')
  })
  it('should select an element', async () => {
    await driver.sleep(1000)
    let result
    extSocket.on('message', data => {
      const message = JSON.parse(data)
      if (message.type === 'select') {
        result = message.payload.result
      }
    })
    await driver.get('http://the-internet.herokuapp.com/')
    await driver.executeScript('window.__side.setWindowHandle("root", "aab")')
    psend(
      extSocket,
      JSON.stringify({
        type: 'select',
        payload: {
          sessionId: 'aab',
          windowName: 'root',
        },
      })
    )
    await driver.sleep(1000)
    const elem = await driver.findElement(By.linkText('Frames'))
    await driver
      .actions({ bridge: true })
      .move({ origin: elem, x: 100, y: 100, duration: 500 })
      .pause(500)
      .move({ origin: elem, duration: 1000 })
      .click()
      .perform()
    await driver.sleep(500)
    expect(result).toBeDefined()
  })
})

const psend = (socket, ...args) =>
  new Promise(res => {
    socket.send(...args, res)
  })

function getNewWindowHandle(driver, originalHandles) {
  // Note: this assumes there's just one new window.
  return driver.getAllWindowHandles().then(function(currentHandles) {
    return currentHandles.filter(function(i) {
      return originalHandles.indexOf(i) < 0
    })[0]
  })
}
