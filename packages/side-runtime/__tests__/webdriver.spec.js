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
import { ControlFlowCommandNames } from '../src/playback-tree/commands'
import WebDriverExecutor from '../src/webdriver'

jest.setTimeout(30000)

describe.skip('webdriver executor', () => {
  it('should implement all the Selenium commands', () => {
    Object.keys(Commands).forEach(command => {
      if (!ControlFlowCommandNames[command]) {
        expect(() => {
          if (
            !WebDriverExecutor.prototype[
              `do${command.charAt(0).toUpperCase() + command.slice(1)}`
            ]
          ) {
            throw new Error(`${command} is not implemented!`)
          }
        }).not.toThrow()
      }
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
    describe('plugins', () => {
      it('should be able to register a command', async () => {
        expect.assertions(3)
        executor.registerCommand('commandName', async function(target, value) {
          expect(this).toBe(executor)
          expect(target).toBe('target')
          expect(value).toBe('value')
        })
        await executor.doCommandName('target', 'value')
      })
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
      it('should assert alert visibility', async () => {
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
    describe('assert editable', () => {
      it('should assert wether different inputs are editable', async () => {
        await driver.get(`http://localhost:${port}/editable.html`)
        await executor.doAssertEditable('id=e')
        await expect(executor.doAssertEditable('id=d')).rejects.toThrow(
          'Element is not editable'
        )
        await expect(executor.doAssertEditable('id=r')).rejects.toThrow(
          'Element is not editable'
        )
      })
      it('should assert wether different inputs are not editable', async () => {
        await driver.get(`http://localhost:${port}/editable.html`)
        await executor.doAssertNotEditable('id=d')
        await executor.doAssertNotEditable('id=r')
        await expect(executor.doAssertNotEditable('id=e')).rejects.toThrow(
          'Element is editable'
        )
      })
    })
    describe('assert prompt', () => {
      it('should assert prompt visibility', async () => {
        expect.assertions(1)
        await driver.get(`http://localhost:${port}/popup/prompt.html`)
        const element = await driver.findElement(By.css('button'))
        await element.click()
        await executor.doAssertPrompt('test')
        await expect(executor.doAssertPrompt('wat')).rejects.toThrow(
          "Actual prompt text 'test' did not match 'wat'"
        )
        await driver
          .switchTo()
          .alert()
          .dismiss()
      })
    })
    describe('click and click at', () => {
      it('should click', async () => {
        await driver.get(`http://localhost:${port}/click.html`)
        await executor.doClick('id=c')
        const r = await driver.findElement(By.id('r'))
        expect(await r.getText()).toMatch(/^click/)
      })
      it('should click (using click at)', async () => {
        await driver.get(`http://localhost:${port}/click.html`)
        await executor.doClickAt('id=c', '10,5')
        const r = await driver.findElement(By.id('r'))
        expect(await r.getText()).toMatch(/^click/)
      })
      it.skip('should click at a specific coordinate', async () => {
        // skip until chromedriver implements actions api correctly
        await driver.get(`http://localhost:${port}/click.html`)
        await executor.doClickAt('id=c', '10,5')
        const r = await driver.findElement(By.id('r'))
        expect(await r.getText()).toBe('click 58,13')
      })
    })
    describe('dismiss confirmation', () => {
      it('should dismiss a confirmation', async () => {
        await driver.get(`http://localhost:${port}/popup/confirm.html`)
        const element = await driver.findElement(By.css('button'))
        await element.click()
        await executor.doDismissConfirmation()
        await element.click()
        // accepting twice to make sure that we can interact with the page
        // after accepting initially
        await executor.doDismissConfirmation()
      })
    })
    describe('dismiss prompt', () => {
      it('should dismiss a prompt', async () => {
        await driver.get(`http://localhost:${port}/popup/prompt.html`)
        const element = await driver.findElement(By.css('button'))
        await element.click()
        await executor.doDismissPrompt()
        await element.click()
        // accepting twice to make sure that we can interact with the page
        // after accepting initially
        await executor.doDismissPrompt()
      })
    })
    describe('double click at', () => {
      it('should double click', async () => {
        await driver.get(`http://localhost:${port}/click.html`)
        await executor.doDoubleClick('id=d')
        const r = await driver.findElement(By.id('r'))
        expect(await r.getText()).toMatch(/^double/)
      })
      it('should double click (using double click at)', async () => {
        await driver.get(`http://localhost:${port}/click.html`)
        await executor.doDoubleClickAt('id=d', '10,5')
        const r = await driver.findElement(By.id('r'))
        expect(await r.getText()).toMatch(/^double/)
      })
      it.skip('should double click at a specific coordinate', async () => {
        // skip until chromedriver implements actions api correctly
        await driver.get(`http://localhost:${port}/click.html`)
        await executor.doDoubleClickAt('id=d', '10,5')
        const r = await driver.findElement(By.id('r'))
        expect(await r.getText()).toBe('double 58,13')
      })
    })
  })
})
