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
import engine from 'engine.io'

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
      chromeOptions: {
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
    await driver.get('http://the-internet.herokuapp.com/')
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
    expect(recording.length).toBe(4)
    expect(recording[0].command).toBe('open')
    expect(recording[1].command).toBe('click')
    expect(recording[2].command).toBe('click')
    expect(recording[3].command).toBe('assertAlert')
  })
  it('should record a new window', async () => {
    const recording = []
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
    await driver.get('http://the-internet.herokuapp.com/')
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
    await driver.executeScript('window.__setWindowHandle("root", "aab")')
    const handles = await driver.getAllWindowHandles()
    const elem = await driver.findElement(By.linkText('Elemental Selenium'))
    await elem.click()
    await driver.sleep(2000)
    const handle = await getNewWindowHandle(driver, handles)
    await driver.switchTo().window(handle)
    await driver.executeScript('window.__setWindowHandle("newWin", "aab")')
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
    expect(recording[0].targets[0][0]).toBe('handle=${root}')
    expect(recording[1].command).toBe('selectWindow')
    expect(recording[1].targets[0][0]).toBe('handle=${newWin}')
    expect(recording.length).toBe(2)
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
