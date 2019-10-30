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
import { By, WebElement } from 'selenium-webdriver'
import {
  createHeadlessChrome,
  createHeadlessFirefox,
} from '@seleniumhq/webdriver-testkit'
import { createStaticSite } from '@seleniumhq/side-testkit'
import { Commands } from '@seleniumhq/side-model'
import { ControlFlowCommandNames } from '../src/playback-tree/commands'
import Variables from '../src/Variables'
import WebDriverExecutor from '../src/webdriver'

jest.setTimeout(30000)

describe('webdriver executor', () => {
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
  describe.each([
    ['chrome', createHeadlessChrome],
    ['firefox', createHeadlessFirefox],
  ])('commands on %s', (_browserName, createDriver) => {
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
    afterAll(async () => {
      await close()
    })
    beforeAll(async () => {
      variables = new Variables()
      driver = await createDriver()
      executor = new WebDriverExecutor({ driver })
      await executor.init({ variables })
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
        await driver.sleep(10)
        expect(await driver.getTitle()).toBe('hello')
        await element.click()
        await executor.doAnswerPrompt('world')
        await driver.sleep(10)
        expect(await driver.getTitle()).toBe('world')
        await element.click()
        await executor.doAnswerPrompt('')
        await driver.sleep(10)
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
    describe('double click and double click at', () => {
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
    describe.skip('drag and drop', () => {
      // skip until webdriver implements html5 dnd
      it('should drag and drop an element', async () => {
        await driver.get(`http://localhost:${port}/dnd.html`)
        await executor.doDragAndDropToObject('id=p1', 'id=target')
        const r = await driver.findElement(By.id('target'))
        expect(await r.getText()).toBe('dropped')
      })
    })
    describe('edit content', () => {
      it('should set the content of a content editable element', async () => {
        await driver.get(`http://localhost:${port}/contenteditable.html`)
        await executor.doEditContent('id=c', 'hello world')
        const r = await driver.findElement(By.id('c'))
        expect(await r.getText()).toBe('hello world')
      })
      it('should escape HTML when put into a content editable element', async () => {
        await driver.get(`http://localhost:${port}/contenteditable.html`)
        await executor.doEditContent('id=c', '<b>hello world</b>')
        const r = await driver.findElement(By.id('c'))
        expect(await r.getText()).toBe('<b>hello world</b>')
      })
      it('should throw if trying to set the content of a non-content editable element', async () => {
        await driver.get(`http://localhost:${port}/editable.html`)
        await expect(
          executor.doEditContent('id=e', 'hello world')
        ).rejects.toThrow('Element is not content editable')
      })
    })
    describe('mouse down and mouse down at', () => {
      it('it should move and press the left mouse button on an element', async () => {
        await driver.get(`http://localhost:${port}/mouse/updown.html`)
        await executor.doMouseDown('id=a')
        const r = await driver.findElement(By.id('a'))
        expect(await r.getText()).toMatch(/^down/)
      })
      it('it should move and press the left mouse button on an element (using mouse down at)', async () => {
        await driver.get(`http://localhost:${port}/mouse/updown.html`)
        await executor.doMouseDownAt('id=a', '100,50')
        const r = await driver.findElement(By.id('a'))
        expect(await r.getText()).toMatch(/^down/)
      })
      it.skip('it should move and press the left mouse button on an element at a specific point', async () => {
        // decide wether coordinates are relative to center or to the top-left corner
        await driver.get(`http://localhost:${port}/mouse/updown.html`)
        await executor.doMouseDownAt('id=a', '100,5')
        const r = await driver.findElement(By.id('a'))
        expect(await r.getText()).toBe('down 10,5')
      })
    })
    describe('mouse move at', () => {
      it('it should move to a specific point in an element', async () => {
        // decide wether coordinates are relative to center or to the top-left corner
        await driver.get(`http://localhost:${port}/mouse/move.html`)
        await executor.doMouseMoveAt('id=a', '100,5')
        const r = await driver.findElement(By.id('a'))
        expect(await r.getText()).toBe('move 350,255')
      })
    })
    describe('mouse out', () => {
      it('should move out of an element through the top', async () => {
        await driver.get(`http://localhost:${port}/mouse/out.html?y=1`)
        const r = await driver.findElement(By.id('cont'))
        await driver
          .actions({ bridge: true })
          .move({ origin: r })
          .perform()
        await executor.doMouseOut('id=cont')
        expect(await r.getText()).toBe('out 250,-1')
      })
      it('should move out of an element through the right', async () => {
        await driver
          .manage()
          .window()
          .setRect({ height: 1000, width: 1000 })
        await driver.get(`http://localhost:${port}/mouse/out.html?x=0&y=0`)
        const r = await driver.findElement(By.id('cont'))
        await driver
          .actions({ bridge: true })
          .move({ origin: r })
          .perform()
        await executor.doMouseOut('id=cont')
        expect(await r.getText()).toBe('out 501,250')
      })
      it('should move out of an element through the bottom', async () => {
        await driver
          .manage()
          .window()
          .setRect({ height: 1000, width: 1000 })
        await driver.get(
          `http://localhost:${port}/mouse/out.html?x=0&y=0&w=1000`
        )
        const r = await driver.findElement(By.id('cont'))
        await driver
          .actions({ bridge: true })
          .move({ origin: r })
          .perform()
        await executor.doMouseOut('id=cont')
        expect(await r.getText()).toBe('out 500,501')
      })
      it('should move out of an element through the left', async () => {
        await driver
          .manage()
          .window()
          .setRect({ height: 400, width: 1000 })
        await driver.get(
          `http://localhost:${port}/mouse/out.html?x=1&y=0&w=1000&h=400`
        )
        const r = await driver.findElement(By.id('cont'))
        await driver
          .actions({ bridge: true })
          .move({ origin: r })
          .perform()
        await executor.doMouseOut('id=cont')
        expect(await r.getText()).toMatch(/^out -1,/)
      })
      it('should throw if the element takes up the entire viewport', async () => {
        await driver
          .manage()
          .window()
          .setRect({ height: 400, width: 400 })
        await driver.get(
          `http://localhost:${port}/mouse/out.html?x=0&y=0&w=500&h=500`
        )
        await expect(executor.doMouseOut('id=cont')).rejects.toThrow(
          'Unable to perform mouse out as the element takes up the entire viewport'
        )
      })
    })
    describe('mouse over', () => {
      it('should be able to move the pointer over an element', async () => {
        await driver.get(`http://localhost:${port}/mouse/over.html`)
        await executor.doMouseOver('id=a')
        const r = await driver.findElement(By.id('a'))
        expect(await r.getText()).toMatch(/^over/)
      })
    })
    describe('mouse up and mouse up at', () => {
      it('it should move and release the left mouse button on an element', async () => {
        await driver.get(`http://localhost:${port}/mouse/updown.html`)
        const r = await driver.findElement(By.id('a'))
        await driver
          .actions({ bridge: true })
          .move({ origin: r })
          .press()
          .perform()
        await executor.doMouseUp('id=a')
        expect(await r.getText()).toMatch(/^up/)
      })
      it('it should move and press the release mouse button on an element (using mouse up at)', async () => {
        await driver.get(`http://localhost:${port}/mouse/updown.html`)

        const r = await driver.findElement(By.id('a'))
        await driver
          .actions({ bridge: true })
          .move({ origin: r })
          .press()
          .perform()
        await executor.doMouseUpAt('id=a', '100,50')
        expect(await r.getText()).toMatch(/^up/)
      })
      it.skip('it should move and release the left mouse button on an element at a specific point', async () => {
        // decide wether coordinates are relative to center or to the top-left corner
        await driver.get(`http://localhost:${port}/mouse/updown.html`)
        const r = await driver.findElement(By.id('a'))
        await driver
          .actions({ bridge: true })
          .move({ origin: r })
          .press()
          .perform()
        await executor.doMouseUpAt('id=a', '100,5')
        expect(await r.getText()).toBe('up 10,5')
      })
    })
    describe('remove selection', () => {
      it('should throw when trying to use with a single item select', async () => {
        await driver.get(`http://localhost:${port}/select.html`)
        await expect(
          executor.doRemoveSelection('css=select', 'label=Two')
        ).rejects.toThrow('Given element is not a multiple select type element')
      })
      it('should remove from a multi select element', async () => {
        await driver.get(`http://localhost:${port}/select.html`)
        const element = await driver.findElement(By.id('mult'))
        const opt1 = await element.findElement(By.css('option:nth-child(1)'))
        const opt4 = await element.findElement(By.css('option:nth-child(4)'))
        await opt1.click()
        await opt4.click()
        expect(
          (await driver.executeScript(
            'return arguments[0].selectedOptions',
            element
          )).length
        ).toBe(2)
        await executor.doRemoveSelection('id=mult', 'label=Volvo')
        const selections = await driver.executeScript(
          'return arguments[0].selectedOptions',
          element
        )
        expect(selections.length).toBe(1)
        await executor.doRemoveSelection('id=mult', 'value=volvo')
        // no selections by mistake
        expect(
          (await driver.executeScript(
            'return arguments[0].selectedOptions',
            element
          )).length
        ).toBe(1)
        await executor.doRemoveSelection('id=mult', 'value=audi')
        expect(
          (await driver.executeScript(
            'return arguments[0].selectedOptions',
            element
          )).length
        ).toBe(0)
      })
    })
    describe('store json', () => {
      it('should the JSON string as an object', async () => {
        const varName = 'blah'
        await executor.doStoreJson('{"blah":"blah"}', varName)
        const result = executor.variables.get(varName)
        expect(typeof result).toMatch('object')
        expect(result.blah).toMatch('blah')
      })
    })
    describe('store attribute', () => {
      it('should store the attribute of an element', async () => {
        await driver.get(`http://localhost:${port}/store/attributes.html`)
        await executor.doStoreAttribute('id=disabled@disabled', 'd')
        expect(executor.variables.get('d')).toBe('true')
        await executor.doStoreAttribute('id=disabled@type', 't')
        expect(executor.variables.get('t')).toBe('text')
        await executor.doStoreAttribute('id=disabled@nan', 'n')
        expect(executor.variables.get('n')).toBe(null)
      })
    })
    describe('store title', () => {
      it('should store the title of a page', async () => {
        await driver.get(`http://localhost:${port}/title.html`)
        await executor.doStoreTitle('t')
        expect(executor.variables.get('t')).toBe('test title')
      })
    })
    describe('store element count', () => {
      it('should store the number of elements in a page', async () => {
        await driver.get(`http://localhost:${port}/store/nodes.html`)
        await executor.doStoreElementCount('css=.testclass', 'n')
        expect(executor.variables.get('n')).toBe(6)
        await executor.doStoreElementCount('css=.nan', 'n')
        expect(executor.variables.get('n')).toBe(0)
      })
    })
    describe('wait for element editable', () => {
      it('should wait for an element to be editable', async () => {
        await driver.get(`http://localhost:${port}/wait/editable.html`)
        const button = await driver.findElement(By.id('b'))
        await button.click()
        await executor.doWaitForElementEditable('id=t', '500')
        const input = await driver.findElement(By.id('t'))
        await input.sendKeys('hey')
        expect(await input.getAttribute('value')).toBe('hey')
      })
      it('should timeout trying to wait for an element to be editable', async () => {
        await driver.get(`http://localhost:${port}/wait/editable.html`)
        await expect(
          executor.doWaitForElementEditable('id=t', '100')
        ).rejects.toThrow()
      })
      it('should wait for an element to be not editable', async () => {
        await driver.get(`http://localhost:${port}/wait/not-editable.html`)
        const button = await driver.findElement(By.id('b'))
        await button.click()
        await executor.doWaitForElementNotEditable('id=t', '500')
        const input = await driver.findElement(By.id('t'))
        await expect(input.sendKeys('hey')).rejects.toThrow()
      })
      it('should timeout trying to wait for an element to be not editable', async () => {
        await driver.get(`http://localhost:${port}/wait/not-editable.html`)
        await expect(
          executor.doWaitForElementNotEditable('id=t', '100')
        ).rejects.toThrow()
      })
    })
    describe('wait for element present', () => {
      it('should wait for an element to appear', async () => {
        await driver.get(`http://localhost:${port}/wait/present.html`)
        const button = await driver.findElement(By.id('b'))
        await button.click()
        await executor.doWaitForElementPresent('id=t', '500')
        expect(await driver.findElement(By.id('t'))).toBeInstanceOf(WebElement)
      })
      it('should timeout trying to wait for an element to appear', async () => {
        await driver.get(`http://localhost:${port}/wait/present.html`)
        await expect(
          executor.doWaitForElementPresent('id=t', '100')
        ).rejects.toThrow()
      })
      it('should wait for an element to disappear', async () => {
        await driver.get(`http://localhost:${port}/wait/not-present.html`)
        expect(await driver.findElement(By.id('t'))).toBeInstanceOf(WebElement)
        const button = await driver.findElement(By.id('b'))
        await button.click()
        await executor.doWaitForElementNotPresent('id=t', '500')
        await expect(driver.findElement(By.id('t'))).rejects.toThrow()
      })
      it('should timeout trying to wait for an element to disappear', async () => {
        await driver.get(`http://localhost:${port}/wait/not-present.html`)
        await expect(
          executor.doWaitForElementNotPresent('id=t', '100')
        ).rejects.toThrow()
      })
    })
    describe('wait for element visible', () => {
      it('should wait for an element to be visible', async () => {
        await driver.get(`http://localhost:${port}/wait/visible.html`)
        const button = await driver.findElement(By.id('b'))
        await button.click()
        await executor.doWaitForElementVisible('id=t', '500')
        expect(await driver.findElement(By.id('t'))).toBeInstanceOf(WebElement)
      })
      it('should timeout trying to wait for an element to be visible', async () => {
        await driver.get(`http://localhost:${port}/wait/visible.html`)
        await expect(
          executor.doWaitForElementVisible('id=t', '100')
        ).rejects.toThrow()
      })
      it('should wait for an element to be invisible', async () => {
        await driver.get(`http://localhost:${port}/wait/not-visible.html`)
        const elem = await driver.findElement(By.id('t'))
        expect(await elem.isDisplayed()).toBeTruthy()
        const button = await driver.findElement(By.id('b'))
        await button.click()
        await executor.doWaitForElementNotVisible('id=t', '500')
        expect(await elem.isDisplayed()).toBeFalsy()
      })
      it('should timeout trying to wait for an element to be invisible', async () => {
        await driver.get(`http://localhost:${port}/wait/not-visible.html`)
        await expect(
          executor.doWaitForElementNotVisible('id=t', '100')
        ).rejects.toThrow()
      })
    })
  })
})
