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

import webdriver from 'selenium-webdriver'
import { absolutifyUrl } from './utils'
import {
  composePreprocessors,
  preprocessArray,
  interpolateString,
  interpolateScript,
} from './preprocessors'
import { AssertionError, VerificationError } from './errors'

const {
  By,
  Condition,
  until,
  Key,
  WebElement,
  WebElementCondition,
  WebElementPromise,
} = webdriver
const { TimeoutError } = webdriver.error

const POLL_TIMEOUT = 50
const DEFAULT_CAPABILITIES = {
  browserName: 'chrome',
}

const state = Symbol('state')

export default class WebDriverExecutor {
  constructor({ driver, capabilities, server, hooks, implicitWait }) {
    if (driver) {
      this.driver = driver
    } else {
      this.capabilities = capabilities || DEFAULT_CAPABILITIES
      this.server = server
    }

    this.implicitWait = implicitWait || 5 * 1000
    this.hooks = hooks

    this.waitForNewWindow = this.waitForNewWindow.bind(this)
  }

  async init({ baseUrl, logger, variables }) {
    this.baseUrl = baseUrl
    this.variables = variables
    this.logger = logger
    this[state] = {}

    if (!this.driver) {
      this.driver = await new webdriver.Builder()
        .withCapabilities(this.capabilities)
        .usingServer(this.server)
        .build()
    }
    this.initialized = true
  }

  async cancel() {
    if (this.cancellable) {
      await this.cancellable.cancel()
    }
  }

  async cleanup() {
    if (this.initialized) {
      await this.driver.quit()
      this.driver = undefined
      this.initialized = false
    }
  }

  isAlive() {
    // webdriver will throw for us, but not necessarily for all commands
    // TODO: check if there are commands that will succeed if we always return true
    return true
  }

  name(command) {
    if (!command) {
      return 'skip'
    }

    const upperCase = command.charAt(0).toUpperCase() + command.slice(1)
    const func = 'do' + upperCase
    if (!this[func]) {
      throw new Error(`Unknown command ${command}`)
    }
    return func
  }

  async executeHook(hook, ...args) {
    if (this.hooks && this.hooks[hook]) {
      await this.hooks[hook].apply(this, args)
    }
  }

  async beforeCommand(commandObject) {
    if (commandObject.opensWindow) {
      this[state].openedWindows = await this.driver.getAllWindowHandles()
    }

    await this.executeHook('onBeforeCommand', { command: commandObject })
  }

  async afterCommand(commandObject) {
    this.cancellable = undefined
    if (commandObject.opensWindow) {
      const handle = await this.wait(
        this.waitForNewWindow,
        commandObject.windowTimeout
      )
      this.variables.set(commandObject.windowHandleName, handle)

      await this.executeHook('onWindowAppeared', {
        command: commandObject,
        windowHandleName: commandObject.windowHandleName,
        windowHandle: handle,
      })
    }

    await this.executeHook('onAfterCommand', { command: commandObject })
  }

  async waitForNewWindow() {
    const currentHandles = await this.driver.getAllWindowHandles()
    return currentHandles.find(
      handle => !this[state].openedWindows.includes(handle)
    )
  }

  registerCommand(commandName, fn) {
    this['do' + commandName.charAt(0).toUpperCase() + commandName.slice(1)] = fn
  }

  // Commands go after this line

  async skip() {
    return Promise.resolve()
  }

  // window commands

  async doOpen(url) {
    await this.driver.get(absolutifyUrl(url, this.baseUrl))
  }

  async doSetWindowSize(widthXheight) {
    const [width, height] = widthXheight.split('x')
    await this.driver
      .manage()
      .window()
      .setSize(parseInt(width), parseInt(height))
  }

  async doSelectWindow(handleLocator) {
    const prefix = 'handle='
    if (handleLocator.startsWith(prefix)) {
      const handle = handleLocator.substr(prefix.length)
      await this.driver.switchTo().window(handle)
      await this.executeHook('onWindowSwitched', {
        windowHandle: handle,
      })
    } else {
      throw new Error(
        'Invalid window handle given (e.g. handle=${handleVariable})'
      )
    }
  }

  async doClose() {
    await this.driver.close()
  }

  async doSelectFrame(locator) {
    const targetLocator = this.driver.switchTo()
    if (locator === 'relative=top') {
      await targetLocator.defaultContent()
    } else if (locator === 'relative=parent') {
      await targetLocator.parentFrame()
    } else if (locator.startsWith('index=')) {
      await targetLocator.frame(+locator.substr('index='.length))
    } else {
      const element = await this.waitForElement(locator)
      await targetLocator.frame(element)
    }
  }

  async doSubmit() {
    throw new Error(
      '"submit" is not a supported command in Selenium WebDriver. Please re-record the step.'
    )
  }

  // mouse commands

  async doAddSelection(locator, optionLocator, commandObject = {}) {
    const element = await this.waitForElement(
      locator,
      commandObject.targetFallback
    )
    const option = await element.findElement(parseOptionLocator(optionLocator))
    const selections = await this.driver.executeScript(
      'return arguments[0].selectedOptions',
      element
    )
    if (!(await findElement(selections, option))) {
      await option.click()
    }
  }

  async doRemoveSelection(locator, optionLocator, commandObject = {}) {
    const element = await this.waitForElement(
      locator,
      commandObject.targetFallback
    )

    if (!(await element.getAttribute('multiple'))) {
      throw new Error('Given element is not a multiple select type element')
    }

    const option = await element.findElement(parseOptionLocator(optionLocator))
    const selections = await this.driver.executeScript(
      'return arguments[0].selectedOptions',
      element
    )
    if (await findElement(selections, option)) {
      await option.click()
    }
  }

  async doCheck(locator, _, commandObject = {}) {
    const element = await this.waitForElement(
      locator,
      commandObject.targetFallback
    )
    if (!(await element.isSelected())) {
      await element.click()
    }
  }

  async doUncheck(locator, _, commandObject = {}) {
    const element = await this.waitForElement(
      locator,
      commandObject.targetFallback
    )
    if (await element.isSelected()) {
      await element.click()
    }
  }

  async doClick(locator, _, commandObject = {}) {
    const element = await this.waitForElement(
      locator,
      commandObject.targetFallback
    )
    await element.click()
  }

  async doClickAt(locator, coordString, commandObject = {}) {
    const coords = parseCoordString(coordString)
    const element = await this.waitForElement(
      locator,
      commandObject.targetFallback
    )
    await this.driver
      .actions({ bridge: true })
      .move({ origin: element, ...coords })
      .click()
      .perform()
  }

  async doDoubleClick(locator, _, commandObject = {}) {
    const element = await this.waitForElement(
      locator,
      commandObject.targetFallback
    )
    await this.driver
      .actions({ bridge: true })
      .doubleClick(element)
      .perform()
  }

  async doDoubleClickAt(locator, coordString, commandObject = {}) {
    const coords = parseCoordString(coordString)
    const element = await this.waitForElement(
      locator,
      commandObject.targetFallback
    )
    await this.driver
      .actions({ bridge: true })
      .move({ origin: element, ...coords })
      .doubleClick()
      .perform()
  }

  async doDragAndDropToObject(dragLocator, dropLocator, commandObject = {}) {
    const drag = await this.waitForElement(
      dragLocator,
      commandObject.targetFallback
    )
    const drop = await this.waitForElement(
      dropLocator,
      commandObject.valueFallback
    )
    await this.driver
      .actions({ bridge: true })
      .dragAndDrop(drag, drop)
      .perform()
  }

  async doMouseDown(locator, _, commandObject = {}) {
    const element = await this.waitForElement(
      locator,
      commandObject.targetFallback
    )
    await this.driver
      .actions({ bridge: true })
      .move({ origin: element })
      .press()
      .perform()
  }

  async doMouseDownAt(locator, coordString, commandObject = {}) {
    const coords = parseCoordString(coordString)
    const element = await this.waitForElement(
      locator,
      commandObject.targetFallback
    )
    await this.driver
      .actions({ bridge: true })
      .move({ origin: element, ...coords })
      .press()
      .perform()
  }

  async doMouseMoveAt(locator, coordString, commandObject = {}) {
    const coords = parseCoordString(coordString)
    const element = await this.waitForElement(
      locator,
      commandObject.targetFallback
    )
    await this.driver
      .actions({ bridge: true })
      .move({ origin: element, ...coords })
      .perform()
  }

  async doMouseOut(locator, _, commandObject = {}) {
    const element = await this.waitForElement(
      locator,
      commandObject.targetFallback
    )
    const [rect, vp] = await this.driver.executeScript(
      'return [arguments[0].getBoundingClientRect(), {height: window.innerHeight, width: window.innerWidth}];',
      element
    )

    // try top
    if (rect.top > 0) {
      const y = -(rect.height / 2 + 1)
      return await this.driver
        .actions({ bridge: true })
        .move({ origin: element, y })
        .perform()
    }
    // try right
    else if (vp.width > rect.right) {
      const x = rect.right / 2 + 1
      return await this.driver
        .actions({ bridge: true })
        .move({ origin: element, x })
        .perform()
    }
    // try bottom
    else if (vp.height > rect.bottom) {
      const y = rect.height / 2 + 1
      return await this.driver
        .actions({ bridge: true })
        .move({ origin: element, y })
        .perform()
    }
    // try left
    else if (rect.left > 0) {
      const x = parseInt(-(rect.right / 2))
      return await this.driver
        .actions({ bridge: true })
        .move({ origin: element, x })
        .perform()
    }

    throw new Error(
      'Unable to perform mouse out as the element takes up the entire viewport'
    )
  }

  async doMouseOver(locator, _, commandObject = {}) {
    const element = await this.waitForElement(
      locator,
      commandObject.targetFallback
    )
    await this.driver
      .actions({ bridge: true })
      .move({ origin: element })
      .perform()
  }

  async doMouseUp(locator, _, commandObject = {}) {
    const element = await this.waitForElement(
      locator,
      commandObject.targetFallback
    )
    await this.driver
      .actions({ bridge: true })
      .move({ origin: element })
      .release()
      .perform()
  }

  async doMouseUpAt(locator, coordString, commandObject = {}) {
    const coords = parseCoordString(coordString)
    const element = await this.waitForElement(
      locator,
      commandObject.targetFallback
    )
    await this.driver
      .actions({ bridge: true })
      .move({ origin: element, ...coords })
      .release()
      .perform()
  }

  async doSelect(locator, optionLocator, commandObject = {}) {
    const element = await this.waitForElement(
      locator,
      commandObject.targetFallback
    )
    const option = await element.findElement(parseOptionLocator(optionLocator))
    await option.click()
  }

  // keyboard commands

  async doEditContent(locator, value, commandObject = {}) {
    const element = await this.waitForElement(
      locator,
      commandObject.targetFallback
    )
    await this.driver.executeScript(
      "if(arguments[0].contentEditable === 'true') {arguments[0].innerText = arguments[1]} else {throw new Error('Element is not content editable')}",
      element,
      value
    )
  }

  async doType(locator, value, commandObject = {}) {
    const element = await this.waitForElement(
      locator,
      commandObject.targetFallback
    )
    await element.clear()
    await element.sendKeys(value)
  }

  async doSendKeys(locator, value, commandObject = {}) {
    const element = await this.waitForElement(
      locator,
      commandObject.targetFallback
    )
    await element.sendKeys(...value)
  }

  // wait commands

  async doWaitForElementEditable(locator, timeout) {
    const element = await this.driver.findElement(parseLocator(locator))
    await this.wait(
      async () => await this.isElementEditable(element),
      parseInt(timeout),
      'Timed out waiting for element to be editable'
    )
  }

  async doWaitForElementNotEditable(locator, timeout) {
    const element = await this.driver.findElement(parseLocator(locator))
    await this.wait(
      async () => !(await this.isElementEditable(element)),
      parseInt(timeout),
      'Timed out waiting for element to not be editable'
    )
  }

  async doWaitForElementPresent(locator, timeout) {
    await this.wait(
      until.elementLocated(parseLocator(locator)),
      parseInt(timeout)
    )
  }

  async doWaitForElementNotPresent(locator, timeout) {
    const parsedLocator = parseLocator(locator)
    const elements = await this.driver.findElements(parsedLocator)
    if (elements.length !== 0) {
      await this.wait(until.stalenessOf(elements[0]), parseInt(timeout))
    }
  }

  async doWaitForElementVisible(locator, timeout) {
    const startTime = new Date()
    const element = await this.wait(
      until.elementLocated(parseLocator(locator)),
      parseInt(timeout)
    )
    const elapsed = new Date() - startTime
    await this.wait(until.elementIsVisible(element), timeout - elapsed)
  }

  async doWaitForElementNotVisible(locator, timeout) {
    const parsedLocator = parseLocator(locator)
    const elements = await this.driver.findElements(parsedLocator)

    if (elements.length > 0) {
      await this.wait(until.elementIsNotVisible(elements[0]), parseInt(timeout))
    }
  }

  // script commands

  async doRunScript(script) {
    await this.driver.executeScript(script.script, ...script.argv)
  }

  async doExecuteScript(script, optionalVariable) {
    const result = await this.driver.executeScript(
      script.script,
      ...script.argv
    )
    if (optionalVariable) {
      this.variables.set(optionalVariable, result)
    }
  }

  async doExecuteAsyncScript(script, optionalVariable) {
    const result = await this.driver.executeAsyncScript(
      `var callback = arguments[arguments.length - 1];${script.script}.then(callback).catch(callback);`,
      ...script.argv
    )
    if (optionalVariable) {
      this.variables.set(optionalVariable, result)
    }
  }

  // alert commands

  async doAcceptAlert() {
    await this.driver
      .switchTo()
      .alert()
      .accept()
  }

  async doAcceptConfirmation() {
    await this.driver
      .switchTo()
      .alert()
      .accept()
  }

  async doAnswerPrompt(optAnswer) {
    const alert = await this.driver.switchTo().alert()
    if (optAnswer) {
      await alert.sendKeys(optAnswer)
    }
    await alert.accept()
  }

  async doDismissConfirmation() {
    await this.driver
      .switchTo()
      .alert()
      .dismiss()
  }

  async doDismissPrompt() {
    await this.driver
      .switchTo()
      .alert()
      .dismiss()
  }

  // store commands

  async doStore(string, variable) {
    this.variables.set(variable, string)
    return Promise.resolve()
  }

  async doStoreAttribute(attributeLocator, variable) {
    const attributePos = attributeLocator.lastIndexOf('@')
    const elementLocator = attributeLocator.slice(0, attributePos)
    const attributeName = attributeLocator.slice(attributePos + 1)

    const element = await this.waitForElement(elementLocator)
    const value = await element.getAttribute(attributeName)
    this.variables.set(variable, value)
  }

  async doStoreElementCount(locator, variable) {
    const elements = await this.driver.findElements(parseLocator(locator))
    this.variables.set(variable, elements.length)
  }

  async doStoreJson(json, variable) {
    this.variables.set(variable, JSON.parse(json))
    return Promise.resolve()
  }

  async doStoreText(locator, variable, commandObject = {}) {
    const element = await this.waitForElement(
      locator,
      commandObject.targetFallback
    )
    const text = await element.getText()
    this.variables.set(variable, text)
  }

  async doStoreTitle(variable) {
    const title = await this.driver.getTitle()
    this.variables.set(variable, title)
  }

  async doStoreValue(locator, variable, commandObject = {}) {
    const element = await this.waitForElement(
      locator,
      commandObject.targetFallback
    )
    const value = await element.getAttribute('value')
    this.variables.set(variable, value)
  }

  async doStoreWindowHandle(variable) {
    const handle = await this.driver.getWindowHandle()
    this.variables.set(variable, handle)
    await this.executeHook('onStoreWindowHandle', {
      windowHandle: handle,
      windowHandleName: variable,
    })
  }

  // assertions

  async doAssert(variableName, value) {
    const variable = `${this.variables.get(variableName)}`
    if (variable != value) {
      throw new AssertionError(
        "Actual value '" + variable + "' did not match '" + value + "'"
      )
    }
  }

  async doAssertAlert(expectedText) {
    const alert = await this.driver.switchTo().alert()
    const actualText = await alert.getText()
    if (actualText !== expectedText) {
      throw new AssertionError(
        "Actual alert text '" +
          actualText +
          "' did not match '" +
          expectedText +
          "'"
      )
    }
  }

  async doAssertConfirmation(expectedText) {
    const alert = await this.driver.switchTo().alert()
    const actualText = await alert.getText()
    if (actualText !== expectedText) {
      throw new AssertionError(
        "Actual confirm text '" +
          actualText +
          "' did not match '" +
          expectedText +
          "'"
      )
    }
  }

  async doAssertEditable(locator, _, commandObject = {}) {
    const element = await this.waitForElement(
      locator,
      commandObject.targetFallback
    )
    if (!(await this.isElementEditable(element))) {
      throw new AssertionError('Element is not editable')
    }
  }

  async doAssertNotEditable(locator, _, commandObject = {}) {
    const element = await this.waitForElement(
      locator,
      commandObject.targetFallback
    )
    if (await this.isElementEditable(element)) {
      throw new AssertionError('Element is editable')
    }
  }

  async doAssertPrompt(expectedText) {
    const alert = await this.driver.switchTo().alert()
    const actualText = await alert.getText()
    if (actualText !== expectedText) {
      throw new AssertionError(
        "Actual prompt text '" +
          actualText +
          "' did not match '" +
          expectedText +
          "'"
      )
    }
  }

  async doAssertTitle(title) {
    const actualTitle = await this.driver.getTitle()
    if (title != actualTitle) {
      throw new AssertionError(
        "Actual value '" + actualTitle + "' did not match '" + title + "'"
      )
    }
  }

  async doAssertElementPresent(locator, _, commandObject = {}) {
    await this.waitForElement(locator, commandObject.targetFallback)
  }

  async doAssertElementNotPresent(locator) {
    const elements = await this.driver.findElements(parseLocator(locator))
    if (elements.length) {
      throw new AssertionError('Unexpected element was found in page')
    }
  }

  async doAssertText(locator, value, commandObject = {}) {
    const element = await this.waitForElement(
      locator,
      commandObject.targetFallback
    )
    const text = await element.getText()
    if (text !== value) {
      throw new AssertionError(
        "Actual value '" + text + "' did not match '" + value + "'"
      )
    }
  }

  async doAssertNotText(locator, value, commandObject = {}) {
    const element = await this.waitForElement(
      locator,
      commandObject.targetFallback
    )
    const text = await element.getText()
    if (text === value) {
      throw new AssertionError(
        "Actual value '" + text + "' did match '" + value + "'"
      )
    }
  }

  async doAssertValue(locator, value, commandObject = {}) {
    const element = await this.waitForElement(
      locator,
      commandObject.targetFallback
    )
    const elementValue = await element.getAttribute('value')
    if (elementValue !== value) {
      throw new AssertionError(
        "Actual value '" + elementValue + "' did not match '" + value + "'"
      )
    }
  }

  // not generally implemented
  async doAssertNotValue(locator, value, commandObject = {}) {
    const element = await this.waitForElement(
      locator,
      commandObject.targetFallback
    )
    const elementValue = await element.getAttribute('value')
    if (elementValue === value) {
      throw new AssertionError(
        "Actual value '" + elementValue + "' did match '" + value + "'"
      )
    }
  }

  async doAssertChecked(locator, _, commandObject = {}) {
    const element = await this.waitForElement(
      locator,
      commandObject.targetFallback
    )
    if (!(await element.isSelected())) {
      throw new AssertionError('Element is not checked, expected to be checked')
    }
  }

  async doAssertNotChecked(locator, _, commandObject = {}) {
    const element = await this.waitForElement(
      locator,
      commandObject.targetFallback
    )
    if (await element.isSelected()) {
      throw new AssertionError('Element is checked, expected to be unchecked')
    }
  }

  async doAssertSelectedValue(locator, value, commandObject = {}) {
    const element = await this.waitForElement(
      locator,
      commandObject.targetFallback
    )
    const elementValue = await element.getAttribute('value')
    if (elementValue !== value) {
      throw new AssertionError(
        "Actual value '" + elementValue + "' did not match '" + value + "'"
      )
    }
  }

  async doAssertNotSelectedValue(locator, value, commandObject = {}) {
    const element = await this.waitForElement(
      locator,
      commandObject.targetFallback
    )
    const elementValue = await element.getAttribute('value')
    if (elementValue === value) {
      throw new AssertionError(
        "Actual value '" + elementValue + "' did match '" + value + "'"
      )
    }
  }

  async doAssertSelectedLabel(locator, label, commandObject = {}) {
    const element = await this.waitForElement(
      locator,
      commandObject.targetFallback
    )
    const selectedValue = await element.getAttribute('value')
    const selectedOption = await element.findElement(
      By.xpath(`option[@value="${selectedValue}"]`)
    )
    const selectedOptionLabel = await selectedOption.getText()
    if (selectedOptionLabel !== label) {
      throw new AssertionError(
        "Actual value '" +
          selectedOptionLabel +
          "' did not match '" +
          label +
          "'"
      )
    }
  }

  async doAssertNotSelectedLabel(locator, label, commandObject = {}) {
    const element = await this.waitForElement(
      locator,
      commandObject.targetFallback
    )
    const selectedValue = await element.getAttribute('value')
    const selectedOption = await element.findElement(
      By.xpath(`option[@value="${selectedValue}"]`)
    )
    const selectedOptionLabel = await selectedOption.getText()
    if (selectedOptionLabel === label) {
      throw new AssertionError(
        "Actual value '" + selectedOptionLabel + "' not match '" + label + "'"
      )
    }
  }

  // other commands

  async doDebugger() {
    throw new Error('`debugger` is not supported in this run mode')
  }

  async doEcho(string) {
    if (this.logger) {
      this.logger.log(`echo: ${string}`)
    }
  }

  async doPause(time) {
    await this.driver.sleep(time)
  }

  async doRun() {
    throw new Error('`run` is not supported in this run mode')
  }

  async doSetSpeed() {
    throw new Error('`set speed` is not supported in this run mode')
  }

  async evaluateConditional(script) {
    const result = await this.driver.executeScript(
      `return (${script.script})`,
      ...script.argv
    )
    return {
      value: !!result,
    }
  }

  async waitForElement(locator, fallback) {
    const elementLocator = parseLocator(locator)
    try {
      return await this.wait(
        until.elementLocated(elementLocator),
        this.implicitWait
      )
    } catch (err) {
      if (fallback) {
        for (let i = 0; i < fallback.length; i++) {
          try {
            let loc = parseLocator(fallback[i][0])
            return await this.driver.findElement(loc)
          } catch (e) {
            // try the next one
          }
        }
      }
      throw err
    }
  }

  async isElementEditable(element) {
    const { enabled, readonly } = await this.driver.executeScript(
      'return { enabled: !arguments[0].disabled, readonly: arguments[0].readOnly };',
      element
    )
    return enabled && !readonly
  }

  async wait(
    condition,
    timeout = 0,
    message = undefined,
    pollTimeout = POLL_TIMEOUT
  ) {
    if (typeof timeout !== 'number' || timeout < 0) {
      throw TypeError('timeout must be a number >= 0: ' + timeout)
    }

    if (typeof pollTimeout !== 'number' || pollTimeout < 0) {
      throw TypeError('pollTimeout must be a number >= 0: ' + pollTimeout)
    }

    if (condition && typeof condition.then === 'function') {
      return new Promise((resolve, reject) => {
        if (!timeout) {
          resolve(condition)
          return
        }

        let start = Date.now()
        let timer = setTimeout(function() {
          timer = null
          reject(
            new TimeoutError(
              (message ? `${message}\n` : '') +
                'Timed out waiting for promise to resolve after ' +
                (Date.now() - start) +
                'ms'
            )
          )
        }, timeout)
        const clearTimer = () => timer && clearTimeout(timer)

        condition.then(
          function(value) {
            clearTimer()
            resolve(value)
          },
          function(error) {
            clearTimer()
            reject(error)
          }
        )
      })
    }

    let fn = condition
    if (condition instanceof Condition) {
      message = message || condition.description()
      fn = condition.fn
    }

    if (typeof fn !== 'function') {
      throw TypeError(
        'Wait condition must be a promise-like object, function, or a ' +
          'Condition object'
      )
    }

    const { driver } = this
    function evaluateCondition() {
      return new Promise((resolve, reject) => {
        try {
          resolve(fn(driver))
        } catch (ex) {
          reject(ex)
        }
      })
    }

    let result = new Promise((resolve, reject) => {
      const startTime = Date.now()
      let cancelled = false
      let resolveCancel
      const cancelPromise = new Promise(res => {
        resolveCancel = res
      })
      this.cancellable = {
        cancel: () => {
          cancelled = true
          return cancelPromise
        },
      }
      const pollCondition = async () => {
        evaluateCondition().then(value => {
          const elapsed = Date.now() - startTime
          if (cancelled) {
            resolveCancel()
            reject(new Error('Aborted by user'))
            this.cancellable = undefined
          } else if (value) {
            resolve(value)
            this.cancellable = undefined
          } else if (timeout && elapsed >= timeout) {
            reject(
              new TimeoutError(
                (message ? `${message}\n` : '') +
                  `Wait timed out after ${elapsed}ms`
              )
            )
            this.cancellable = undefined
          } else {
            setTimeout(pollCondition, pollTimeout)
          }
        }, reject)
      }
      pollCondition()
    })

    if (condition instanceof WebElementCondition) {
      result = new WebElementPromise(
        driver,
        result.then(function(value) {
          if (!(value instanceof WebElement)) {
            throw TypeError(
              'WebElementCondition did not resolve to a WebElement: ' +
                Object.prototype.toString.call(value)
            )
          }
          return value
        })
      )
    }
    return result
  }
}

WebDriverExecutor.prototype.doOpen = composePreprocessors(
  interpolateString,
  WebDriverExecutor.prototype.doOpen
)

WebDriverExecutor.prototype.doSetWindowSize = composePreprocessors(
  interpolateString,
  WebDriverExecutor.prototype.doSetWindowSize
)

WebDriverExecutor.prototype.doSelectWindow = composePreprocessors(
  interpolateString,
  WebDriverExecutor.prototype.doSelectWindow
)

WebDriverExecutor.prototype.doSelectFrame = composePreprocessors(
  interpolateString,
  WebDriverExecutor.prototype.doSelectFrame
)

WebDriverExecutor.prototype.doAnswerPrompt = composePreprocessors(
  interpolateString,
  null,
  WebDriverExecutor.prototype.doAnswerPrompt
)

WebDriverExecutor.prototype.doAddSelection = composePreprocessors(
  interpolateString,
  interpolateString,
  {
    targetFallback: preprocessArray(interpolateString),
    valueFallback: preprocessArray(interpolateString),
  },
  WebDriverExecutor.prototype.doAddSelection
)

WebDriverExecutor.prototype.doRemoveSelection = composePreprocessors(
  interpolateString,
  interpolateString,
  {
    targetFallback: preprocessArray(interpolateString),
    valueFallback: preprocessArray(interpolateString),
  },
  WebDriverExecutor.prototype.doRemoveSelection
)

WebDriverExecutor.prototype.doCheck = composePreprocessors(
  interpolateString,
  null,
  { targetFallback: preprocessArray(interpolateString) },
  WebDriverExecutor.prototype.doCheck
)

WebDriverExecutor.prototype.doUncheck = composePreprocessors(
  interpolateString,
  null,
  { targetFallback: preprocessArray(interpolateString) },
  WebDriverExecutor.prototype.doUncheck
)

WebDriverExecutor.prototype.doClick = composePreprocessors(
  interpolateString,
  null,
  { targetFallback: preprocessArray(interpolateString) },
  WebDriverExecutor.prototype.doClick
)

WebDriverExecutor.prototype.doClickAt = composePreprocessors(
  interpolateString,
  interpolateString,
  { targetFallback: preprocessArray(interpolateString) },
  WebDriverExecutor.prototype.doClickAt
)

WebDriverExecutor.prototype.doDoubleClick = composePreprocessors(
  interpolateString,
  null,
  { targetFallback: preprocessArray(interpolateString) },
  WebDriverExecutor.prototype.doDoubleClick
)

WebDriverExecutor.prototype.doDoubleClickAt = composePreprocessors(
  interpolateString,
  interpolateString,
  { targetFallback: preprocessArray(interpolateString) },
  WebDriverExecutor.prototype.doDoubleClickAt
)

WebDriverExecutor.prototype.doDragAndDropToObject = composePreprocessors(
  interpolateString,
  interpolateString,
  {
    targetFallback: preprocessArray(interpolateString),
    valueFallback: preprocessArray(interpolateString),
  },
  WebDriverExecutor.prototype.doDragAndDropToObject
)

WebDriverExecutor.prototype.doMouseDown = composePreprocessors(
  interpolateString,
  null,
  {
    targetFallback: preprocessArray(interpolateString),
  },
  WebDriverExecutor.prototype.doMouseDown
)

WebDriverExecutor.prototype.doMouseDownAt = composePreprocessors(
  interpolateString,
  interpolateString,
  {
    targetFallback: preprocessArray(interpolateString),
  },
  WebDriverExecutor.prototype.doMouseDownAt
)

WebDriverExecutor.prototype.doMouseMoveAt = composePreprocessors(
  interpolateString,
  interpolateString,
  {
    targetFallback: preprocessArray(interpolateString),
  },
  WebDriverExecutor.prototype.doMouseMoveAt
)

WebDriverExecutor.prototype.doMouseOut = composePreprocessors(
  interpolateString,
  null,
  {
    targetFallback: preprocessArray(interpolateString),
  },
  WebDriverExecutor.prototype.doMouseOut
)

WebDriverExecutor.prototype.doMouseOver = composePreprocessors(
  interpolateString,
  null,
  {
    targetFallback: preprocessArray(interpolateString),
  },
  WebDriverExecutor.prototype.doMouseOver
)

WebDriverExecutor.prototype.doMouseUp = composePreprocessors(
  interpolateString,
  null,
  {
    targetFallback: preprocessArray(interpolateString),
  },
  WebDriverExecutor.prototype.doMouseUp
)

WebDriverExecutor.prototype.doMouseUpAt = composePreprocessors(
  interpolateString,
  interpolateString,
  {
    targetFallback: preprocessArray(interpolateString),
  },
  WebDriverExecutor.prototype.doMouseUpAt
)

WebDriverExecutor.prototype.doSelect = composePreprocessors(
  interpolateString,
  interpolateString,
  {
    targetFallback: preprocessArray(interpolateString),
    valueFallback: preprocessArray(interpolateString),
  },
  WebDriverExecutor.prototype.doSelect
)

WebDriverExecutor.prototype.doEditContent = composePreprocessors(
  interpolateString,
  interpolateString,
  {
    targetFallback: preprocessArray(interpolateString),
  },
  WebDriverExecutor.prototype.doEditContent
)

WebDriverExecutor.prototype.doType = composePreprocessors(
  interpolateString,
  interpolateString,
  { targetFallback: preprocessArray(interpolateString) },
  WebDriverExecutor.prototype.doType
)

WebDriverExecutor.prototype.doSendKeys = composePreprocessors(
  interpolateString,
  preprocessKeys,
  { targetFallback: preprocessArray(interpolateString) },
  WebDriverExecutor.prototype.doSendKeys
)

WebDriverExecutor.prototype.doRunScript = composePreprocessors(
  interpolateScript,
  WebDriverExecutor.prototype.doRunScript
)

WebDriverExecutor.prototype.doExecuteScript = composePreprocessors(
  interpolateScript,
  null,
  WebDriverExecutor.prototype.doExecuteScript
)

WebDriverExecutor.prototype.doExecuteAsyncScript = composePreprocessors(
  interpolateScript,
  null,
  WebDriverExecutor.prototype.doExecuteAsyncScript
)

WebDriverExecutor.prototype.doStore = composePreprocessors(
  interpolateString,
  null,
  WebDriverExecutor.prototype.doStore
)

WebDriverExecutor.prototype.doStoreAttribute = composePreprocessors(
  interpolateString,
  null,
  { targetFallback: preprocessArray(interpolateString) },
  WebDriverExecutor.prototype.doStoreAttribute
)

WebDriverExecutor.prototype.doStoreElementCount = composePreprocessors(
  interpolateString,
  null,
  { targetFallback: preprocessArray(interpolateString) },
  WebDriverExecutor.prototype.doStoreElementCount
)

WebDriverExecutor.prototype.doStoreJson = composePreprocessors(
  interpolateString,
  null,
  WebDriverExecutor.prototype.doStoreJson
)

WebDriverExecutor.prototype.doStoreText = composePreprocessors(
  interpolateString,
  null,
  { targetFallback: preprocessArray(interpolateString) },
  WebDriverExecutor.prototype.doStoreText
)

WebDriverExecutor.prototype.doStoreValue = composePreprocessors(
  interpolateString,
  null,
  { targetFallback: preprocessArray(interpolateString) },
  WebDriverExecutor.prototype.doStoreValue
)

WebDriverExecutor.prototype.doAssert = composePreprocessors(
  null,
  interpolateString,
  WebDriverExecutor.prototype.doAssert
)

WebDriverExecutor.prototype.doAssertAlert = composePreprocessors(
  interpolateString,
  null,
  WebDriverExecutor.prototype.doAssertAlert
)

WebDriverExecutor.prototype.doAssertConfirmation = composePreprocessors(
  interpolateString,
  null,
  WebDriverExecutor.prototype.doAssertConfirmation
)

WebDriverExecutor.prototype.doAssertEditable = composePreprocessors(
  interpolateString,
  null,
  { targetFallback: preprocessArray(interpolateString) },
  WebDriverExecutor.prototype.doAssertEditable
)

WebDriverExecutor.prototype.doAssertNotEditable = composePreprocessors(
  interpolateString,
  null,
  { targetFallback: preprocessArray(interpolateString) },
  WebDriverExecutor.prototype.doAssertNotEditable
)

WebDriverExecutor.prototype.doAssertPrompt = composePreprocessors(
  interpolateString,
  null,
  WebDriverExecutor.prototype.doAssertPrompt
)

WebDriverExecutor.prototype.doAssertText = composePreprocessors(
  interpolateString,
  interpolateString,
  WebDriverExecutor.prototype.doAssertText
)

WebDriverExecutor.prototype.doEcho = composePreprocessors(
  interpolateString,
  WebDriverExecutor.prototype.doEcho
)

function createVerifyCommands(Executor) {
  Object.getOwnPropertyNames(Executor.prototype)
    .filter(command => /^doAssert/.test(command))
    .forEach(assertion => {
      const verify = assertion.replace('doAssert', 'doVerify')
      Executor.prototype[verify] = {
        // creating the function inside an object since function declared in an
        // object are named after the property, thus creating dyanmic named funcs
        // also in order to be able to call(this) the function has to be normal
        // declaration rather than arrow, as arrow will be bound to
        // createVerifyCommands context which is undefined
        [verify]: async function(...args) {
          try {
            return await Executor.prototype[assertion].call(this, ...args)
          } catch (err) {
            if (err instanceof AssertionError) {
              throw new VerificationError(err.message)
            }
            throw err
          }
        },
      }[verify]
    })
}

createVerifyCommands(WebDriverExecutor)

function parseLocator(locator) {
  if (/^\/\//.test(locator)) {
    return By.xpath(locator)
  }
  const fragments = locator.split('=')
  const type = fragments.shift()
  const selector = fragments.join('=')
  if (LOCATORS[type] && selector) {
    return LOCATORS[type](selector)
  } else {
    throw new Error(type ? `Unknown locator ${type}` : "Locator can't be empty")
  }
}

function parseOptionLocator(locator) {
  const fragments = locator.split('=')
  const type = fragments.shift()
  const selector = fragments.join('=')
  if (OPTIONS_LOCATORS[type] && selector) {
    return OPTIONS_LOCATORS[type](selector)
  } else if (!selector) {
    // no selector strategy given, assuming label
    return OPTIONS_LOCATORS['label'](type)
  } else {
    throw new Error(
      type ? `Unknown selection locator ${type}` : "Locator can't be empty"
    )
  }
}

function parseCoordString(coord) {
  const [x, y] = coord.split(',').map(n => parseInt(n))

  return {
    x,
    y,
  }
}

function preprocessKeys(_str, variables) {
  const str = interpolateString(_str, variables)
  let keys = []
  let match = str.match(/\$\{\w+\}/g)
  if (!match) {
    keys.push(str)
  } else {
    let i = 0
    while (i < str.length) {
      let currentKey = match.shift(),
        currentKeyIndex = str.indexOf(currentKey, i)
      if (currentKeyIndex > i) {
        // push the string before the current key
        keys.push(str.substr(i, currentKeyIndex - i))
        i = currentKeyIndex
      }
      if (currentKey) {
        if (/^\$\{KEY_\w+\}/.test(currentKey)) {
          // is a key
          let keyName = currentKey.match(/\$\{KEY_(\w+)\}/)[1]
          let key = Key[keyName]
          if (key) {
            keys.push(key)
          } else {
            throw new Error(`Unrecognised key ${keyName}`)
          }
        } else {
          // not a key, and not a stored variable, push it as-is
          keys.push(currentKey)
        }
        i += currentKey.length
      } else if (i < str.length) {
        // push the rest of the string
        keys.push(str.substr(i, str.length))
        i = str.length
      }
    }
  }
  return keys
}

const LOCATORS = {
  id: By.id,
  name: By.name,
  link: By.linkText,
  linkText: By.linkText,
  partialLinkText: By.partialLinkText,
  css: By.css,
  xpath: By.xpath,
}

const OPTIONS_LOCATORS = {
  id: id => By.css(`*[id="${id}"]`),
  value: value => By.css(`*[value="${value}"]`),
  label: label => By.xpath(`//option[. = '${label}']`),
  index: index => By.css(`*:nth-child(${index})`),
}

async function findElement(elements, element) {
  const id = await element.getId()
  for (let i = 0; i < elements.length; i++) {
    if ((await elements[i].getId()) === id) {
      return true
    }
  }
  return false
}
