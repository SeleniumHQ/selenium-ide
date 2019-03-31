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

const { By } = webdriver

jest.setTimeout(300000)

describe('recorder e2e', () => {
  let driver
  let server
  let extSocket
  beforeAll(async () => {
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
  afterAll(async () => {
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
    const elem = await driver.findElement(By.linkText('Checkboxes'))
    await elem.click()
    await driver.sleep(1000)
    expect(recording.length).toBe(2)
    expect(recording[0].command).toBe('open')
    expect(recording[1].command).toBe('click')
  })
})

const psend = (socket, ...args) =>
  new Promise(res => {
    socket.send(...args, res)
  })
