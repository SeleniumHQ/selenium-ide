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

import { promisify } from 'util'
import { By } from 'selenium-webdriver'
import { createHeadlessChrome } from '@seleniumhq/webdriver-testkit'
import { createStaticSite } from '@seleniumhq/side-testkit'
import Playback from '../../src/playback'
import Variables from '../../src/Variables'
import WebDriverExecutor from '../../src/webdriver'

jest.setTimeout(30000)

describe('Playback using webdriver', () => {
  const app = createStaticSite()
  let port, close, driver, executor, variables
  beforeAll(async () => {
    await new Promise(res => {
      const server = app.listen(() => {
        port = server.address().port
        close = promisify(server.close.bind(server))
        res()
      })
    })
  })
  afterEach(() => {
    executor.hooks = undefined
  })
  afterAll(async () => {
    await close()
  })
  beforeAll(async () => {
    variables = new Variables()
    driver = await createHeadlessChrome()
    executor = new WebDriverExecutor({ driver, implicitWait: 50 })
  })
  afterAll(async () => {
    await driver.quit()
  })
  afterEach(async () => {
    try {
      await driver.actions({ bridge: true }).clear()
    } catch (err) {
      // chromedriver doesn't support clear()
    }
  })
  it('should run a test using WebDriverExecutor', async () => {
    const test = {
      id: 1,
      commands: [
        {
          command: 'open',
          target: '/check.html',
          value: '',
        },
        {
          command: 'uncheck',
          target: 'id=t',
          value: '',
        },
        {
          command: 'check',
          target: 'id=f',
          value: '',
        },
      ],
    }
    const playback = new Playback({
      executor,
      variables,
      baseUrl: `http://localhost:${port}/`,
    })
    await (await playback.play(test))()
    const element = await driver.findElement(By.id('f'))
    expect(await element.isSelected()).toBeTruthy()
  })
  it('should utilize before and after commands', async () => {
    const test = {
      id: 1,
      commands: [
        {
          command: 'open',
          target: '/check.html',
          value: '',
        },
        {
          command: 'uncheck',
          target: 'id=t',
          value: '',
        },
        {
          command: 'check',
          target: 'id=f',
          value: '',
        },
      ],
    }
    const playback = new Playback({
      executor,
      variables,
      baseUrl: `http://localhost:${port}/`,
    })
    executor.hooks = {
      onAfterCommand: jest.fn(),
      onBeforeCommand: jest.fn(),
    }
    await (await playback.play(test))()
    expect(executor.hooks.onBeforeCommand).toHaveBeenCalledTimes(3)
    expect(executor.hooks.onAfterCommand).toHaveBeenCalledTimes(3)
    expect(executor.hooks.onBeforeCommand.mock.calls[0]).toEqual([
      {
        command: test.commands[0],
      },
    ])
    expect(executor.hooks.onAfterCommand.mock.calls[0]).toEqual([
      {
        command: test.commands[0],
      },
    ])
  })
  it('should inform of a new window', async () => {
    const test = {
      id: 1,
      commands: [
        {
          command: 'open',
          target: '/windows.html',
          value: '',
        },
        {
          command: 'click',
          target: 'css=a',
          value: '',
          opensWindow: true,
          windowHandleName: 'new',
          windowTimeout: 200,
        },
      ],
    }
    const playback = new Playback({
      executor,
      variables,
      baseUrl: `http://localhost:${port}/`,
    })
    executor.hooks = {
      onWindowAppeared: jest.fn(),
    }
    await (await playback.play(test))()
    expect(executor.hooks.onWindowAppeared).toHaveBeenCalledTimes(1)
    expect(executor.hooks.onWindowAppeared.mock.calls[0]).toMatchObject([
      {
        command: test.commands[1],
        windowHandleName: test.commands[1].windowHandleName,
        windowHandle: expect.stringMatching(/^CDwindow-/),
      },
    ])
  })
  it('should wait for hook execution to complete', async () => {
    let didExecute = false
    const test = {
      id: 1,
      commands: [
        {
          command: 'open',
          target: '/windows.html',
          value: '',
        },
        {
          command: 'click',
          target: 'css=a',
          value: '',
          opensWindow: true,
          windowHandleName: 'new',
          windowTimeout: 200,
        },
      ],
    }
    const playback = new Playback({
      executor,
      variables,
      baseUrl: `http://localhost:${port}/`,
    })
    executor.hooks = {
      onWindowAppeared: () => {
        return new Promise(res => {
          setTimeout(() => {
            didExecute = true
            res()
          }, 10)
        })
      },
    }
    await (await playback.play(test))()
    expect(didExecute).toBeTruthy()
  })
  it('should perform locator fallback', async () => {
    const test = {
      id: 1,
      commands: [
        {
          command: 'open',
          target: '/check.html',
          value: '',
        },
        {
          command: 'uncheck',
          target: 'id=nan',
          value: '',
          targetFallback: [
            ['id=stillnan', 'id'],
            ['id=t', 'id'],
            ['id=broken', 'id'],
          ],
        },
      ],
    }
    const playback = new Playback({
      executor,
      variables,
      baseUrl: `http://localhost:${port}/`,
    })
    await (await playback.play(test))()
    const element = await driver.findElement(By.id('t'))
    expect(await element.isSelected()).toBeFalsy()
  })
})
