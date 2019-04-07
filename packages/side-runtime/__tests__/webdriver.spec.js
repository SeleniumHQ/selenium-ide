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
import webdriver, { By } from 'selenium-webdriver'
import { createStaticSite } from '@seleniumhq/side-testkit'
import { Commands } from '@seleniumhq/side-model'
import WebDriverExecutor from '../src/webdriver'

jest.setTimeout(30000)

describe.skip('webdriver executor', () => {
  it('should implement all the Selenium commands', () => {
    Object.keys(Commands).forEach(command => {
      expect(() => {
        if (
          !WebDriverExecutor.prototype[
            `do${command.charAt(0).toUpperCase() + command.slice(1)}`
          ]
        ) {
          throw new Error(`${command} is not implemented!`)
        }
      }).not.toThrow()
    })
  })
  describe('commands', () => {
    const app = createStaticSite()
    let port, close, driver, executor
    beforeAll(async () => {
      await new Promise(res => {
        const server = app.listen(() => {
          port = server.address().port
          close = promisify(server.close.bind(server))
          res()
        })
      })
    })
    afterAll(async () => {
      await close()
    })
    beforeAll(async () => {
      const builder = new webdriver.Builder().withCapabilities({
        browserName: 'chrome',
        chromeOptions: {
          args: ['headless'],
        },
      })
      driver = await builder.build()
      executor = new WebDriverExecutor(driver)
      await executor.init({})
    })
    afterAll(async () => {
      await driver.quit()
    })
    describe('accept alert', () => {
      it('should dismiss an alert', async () => {
        await driver.get(`http://localhost:${port}/popup/alert.html`)
        const element = await driver.findElement(By.css('button'))
        await element.click()
        await executor.doAcceptAlert()
        await element.click()
        // accepting twice to make sure that we can interact with the page
        // after accepting initially
        await executor.doAcceptAlert()
      })
    })
    describe('add selection', () => {
      it('should select a single select item', async () => {
        await driver.get(`http://localhost:${port}/select.html`)
        const element = await driver.findElement(By.css('select'))
        expect(await element.getAttribute('value')).toBe('1')
        await executor.doAddSelection('css=select', 'label=Two')
        expect(await element.getAttribute('value')).toBe('2')
      })
      it('should add to a multi select element', async () => {
        await driver.get(`http://localhost:${port}/select.html`)
        const element = await driver.findElement(By.id('mult'))
        expect(
          (await driver.executeScript(
            'return arguments[0].selectedOptions',
            element
          )).length
        ).toBe(0)
        await executor.doAddSelection('id=mult', 'label=Volvo')
        const selections = await driver.executeScript(
          'return arguments[0].selectedOptions',
          element
        )
        expect(selections.length).toBe(1)
        expect(await selections[0].getAttribute('value')).toBe('volvo')
        await executor.doAddSelection('id=mult', 'value=volvo')
        // no deselections by mistake
        expect(
          (await driver.executeScript(
            'return arguments[0].selectedOptions',
            element
          )).length
        ).toBe(1)
        await executor.doAddSelection('id=mult', 'value=audi')
        expect(
          (await driver.executeScript(
            'return arguments[0].selectedOptions',
            element
          )).length
        ).toBe(2)
      })
    })
    describe('answer prompt', () => {
      it('should answer prompt', async () => {
        await driver.get(`http://localhost:${port}/popup/prompt.html`)
        const element = await driver.findElement(By.css('button'))
        await element.click()
        await executor.doAnswerPrompt('hello')
        expect(await driver.getTitle()).toBe('hello')
        await element.click()
        await executor.doAnswerPrompt('world')
        expect(await driver.getTitle()).toBe('world')
        await element.click()
        await executor.doAnswerPrompt('')
        expect(await driver.getTitle()).toBe('empty')
      })
    })
    describe('assert alert', () => {
      it('should dismiss an alert', async () => {
        expect.assertions(1)
        await driver.get(`http://localhost:${port}/popup/alert.html`)
        const element = await driver.findElement(By.css('button'))
        await element.click()
        await executor.doAssertAlert('test')
        await expect(executor.doAssertAlert('wat')).rejects.toThrow(
          "Actual alert text 'test' did not match 'wat'"
        )
        await driver
          .switchTo()
          .alert()
          .accept()
      })
    })
    describe('assert confirmation', () => {
      it('should assert confirmation visibility', async () => {
        expect.assertions(1)
        await driver.get(`http://localhost:${port}/popup/confirm.html`)
        const element = await driver.findElement(By.css('button'))
        await element.click()
        await executor.doAssertConfirmation('test')
        await expect(executor.doAssertConfirmation('wat')).rejects.toThrow(
          "Actual confirm text 'test' did not match 'wat'"
        )
        await driver
          .switchTo()
          .alert()
          .dismiss()
      })
    })
  })
})
