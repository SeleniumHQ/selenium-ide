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

const IMPLICIT_WAIT = 5 * 1000
const POLL_TIMEOUT = 50
const DEFAULT_CAPABILITIES = {
  browserName: 'chrome',
}
const DEFAULT_SERVER = 'http://localhost:4444/wd/hub'

const state = Symbol('state')

export default class WebDriverExecutor {
  constructor(capabilities, server) {
    if (capabilities && typeof capabilities.get === 'function') {
      this.driver = capabilities
    } else {
      this.capabilities = capabilities || DEFAULT_CAPABILITIES
      this.server = server || DEFAULT_SERVER
    }

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
    if (this[state].cancellable) {
      await this[state].cancellable.cancel()
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

  async beforeCommand(commandObject) {
    if (commandObject.opensWindow) {
      this[state].openedWindows = await this.driver.getAllWindowHandles()
    }
  }

  async afterCommand(commandObject) {
    if (commandObject.opensWindow) {
      const handle = await this.wait(
        this.waitForNewWindow,
        commandObject.windowTimeout
      )
      this.variables.set(commandObject.windowHandleName, handle)
    }
  }

  async waitForNewWindow() {
    const currentHandles = await this.driver.getAllWindowHandles()
    return currentHandles.find(
      handle => !this[state].openedWindows.includes(handle)
    )
  }

  // Commands go after this line

  // TODO
  // doAssertConfirmation
  // doAssertEditable
  // doAssertNotEditable
  // doAssertPrompt
  // doVerify
  // doVerifyChecked
  // doVerifyNotChecked
  // doVerifyEditable
  // doVerifyNotEditable
  // doVerifyElementPresent
  // doVerifyElementNotPresent
  // doVerifySelectedValue
  // doVerifyNotSelectedValue
  // doVerifyText
  // doVerifyNotText
  // doVerifyTitle
  // doVerifyValue
  // doVerifySelectedLabel
  // doDoubleClickAt
  // doDragAndDropToObject
  // doEditContent
  // doMouseMoveAt
  // doMouseDownAt
  // doMouseOut
  // doMouseOver
  // doMouseUpAt
  // doRemoveSelection
  // setSpeed
  // doStoreAttribute
  // doStoreTitle
  // doStoreXpathCount
  // doWebDriverChooseOkOnVisibleConfirmation
  // doChooseCancelOnNextConfirmation
  // doChooseCancelOnNextPrompt

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
      const element = await this.waitForElement(locator, this.driver)
      await targetLocator.frame(element)
    }
  }

  async doSubmit() {
    throw new Error(
      '"submit" is not a supported command in Selenium WebDriver. Please re-record the step.'
    )
  }

  // mouse commands

  async doClick(locator) {
    const element = await this.waitForElement(locator, this.driver)
    await element.click()
  }

  async doClickAt(locator, coordString) {
    const coords = coordString.split(',')
    const element = await this.waitForElement(locator, this.driver)
    await this.driver
      .actions()
      .mouseMove(element, { x: coords[0], y: coords[1] })
      .click()
      .perform()
  }

  async doDoubleClick(locator) {
    const element = await this.waitForElement(locator, this.driver)
    await this.driver
      .actions()
      .doubleClick(element)
      .perform()
  }

  async doCheck(locator) {
    const element = await this.waitForElement(locator, this.driver)
    if (!(await element.isSelected())) {
      await element.click()
    }
  }

  async doUncheck(locator) {
    const element = await this.waitForElement(locator, this.driver)
    if (await element.isSelected()) {
      await element.click()
    }
  }

  async doSelect(locator, optionLocator) {
    const element = await this.waitForElement(locator, this.driver)
    const option = await element.findElement(parseOptionLocator(optionLocator))
    await option.click()
  }

  // keyboard commands

  async doType(locator, value) {
    const element = await this.waitForElement(locator, this.driver)
    await element.clear()
    await element.sendKeys(value)
  }

  async doSendKeys(locator, value) {
    const element = await this.waitForElement(locator, this.driver)
    await element.sendKeys(...value)
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
      `var callback = arguments[arguments.length - 1];${
        script.script
      }.then(callback).catch(callback);`,
      ...script.argv
    )
    if (optionalVariable) {
      this.variables.set(optionalVariable, result)
    }
  }

  // store commands

  async doStore(string, variable) {
    this.variables.set(variable, string)
    return Promise.resolve()
  }

  async doStoreText(locator, variable) {
    const element = await this.waitForElement(locator, this.driver)
    const text = await element.getText()
    this.variables.set(variable, text)
  }

  async doStoreValue(locator, variable) {
    const element = await this.waitForElement(locator, this.driver)
    const value = await element.getAttribute('value')
    this.variables.set(variable, value)
  }

  async doStoreWindowHandle(variable) {
    const handle = await this.driver.getWindowHandle()
    this.variables.set(variable, handle)
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
    const actualText = await this.driver
      .switchTo()
      .alert()
      .getText()
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

  async doAssertTitle(title) {
    const actualTitle = await this.driver.getTitle()
    if (title != actualTitle) {
      throw new AssertionError(
        "Actual value '" + actualTitle + "' did not match '" + title + "'"
      )
    }
  }

  async doAssertElementPresent(locator) {
    await this.waitForElement(locator, this.driver)
  }

  async doAssertElementNotPresent(locator) {
    const elements = await this.driver.findElements(parseLocator(locator))
    if (elements.length) {
      throw new AssertionError('Unexpected element was found in page')
    }
  }

  async doAssertText(locator, value) {
    const element = await this.waitForElement(locator, this.driver)
    const text = await element.getText()
    if (text !== value) {
      throw new AssertionError(
        "Actual value '" + text + "' did not match '" + value + "'"
      )
    }
  }

  async doAssertNotText(locator, value) {
    const element = await this.waitForElement(locator, this.driver)
    const text = await element.getText()
    if (text === value) {
      throw new AssertionError(
        "Actual value '" + text + "' did match '" + value + "'"
      )
    }
  }

  async doAssertValue(locator, value) {
    const element = await this.waitForElement(locator, this.driver)
    const elementValue = await element.getAttribute('value')
    if (elementValue !== value) {
      throw new AssertionError(
        "Actual value '" + elementValue + "' did not match '" + value + "'"
      )
    }
  }

  // not generally implemented
  async doAssertNotValue(locator, value) {
    const element = await this.waitForElement(locator, this.driver)
    const elementValue = await element.getAttribute('value')
    if (elementValue === value) {
      throw new AssertionError(
        "Actual value '" + elementValue + "' did match '" + value + "'"
      )
    }
  }

  async doAssertChecked(locator) {
    const element = await this.waitForElement(locator, this.driver)
    if (!(await element.isSelected())) {
      throw new AssertionError('Element is not checked, expected to be checked')
    }
  }

  async doAssertNotChecked(locator) {
    const element = await this.waitForElement(locator, this.driver)
    if (await element.isSelected()) {
      throw new AssertionError('Element is checked, expected to be unchecked')
    }
  }

  async doAssertSelectedValue(locator, value) {
    const element = await this.waitForElement(locator, this.driver)
    const elementValue = await element.getAttribute('value')
    if (elementValue !== value) {
      throw new AssertionError(
        "Actual value '" + elementValue + "' did not match '" + value + "'"
      )
    }
  }

  async doAssertNotSelectedValue(locator, value) {
    const element = await this.waitForElement(locator, this.driver)
    const elementValue = await element.getAttribute('value')
    if (elementValue === value) {
      throw new AssertionError(
        "Actual value '" + elementValue + "' did match '" + value + "'"
      )
    }
  }

  async doAssertSelectedLabel(locator, label) {
    const element = await this.waitForElement(locator, this.driver)
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

  async doAssertNotSelectedLabel(locator, label) {
    const element = await this.waitForElement(locator, this.driver)
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

  async doEcho(string) {
    if (this.logger) {
      this.logger.log(`echo: ${string}`)
    }
  }

  async doPause(time) {
    await this.driver.sleep(time)
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

  async waitForElement(locator) {
    const elementLocator = parseLocator(locator)
    return await this.wait(until.elementLocated(elementLocator), IMPLICIT_WAIT)
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
      this[state].cancellable = {
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
            this[state].cancellable = undefined
          } else if (value) {
            resolve(value)
            this[state].cancellable = undefined
          } else if (timeout && elapsed >= timeout) {
            reject(
              new TimeoutError(
                (message ? `${message}\n` : '') +
                  `Wait timed out after ${elapsed}ms`
              )
            )
            this[state].cancellable = undefined
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

WebDriverExecutor.prototype.doCheck = composePreprocessors(
  interpolateString,
  null,
  { targetFallback: preprocessArray(interpolateString) },
  WebDriverExecutor.prototype.doCheck
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

WebDriverExecutor.prototype.doSelect = composePreprocessors(
  interpolateString,
  interpolateString,
  {
    targetFallback: preprocessArray(interpolateString),
    valueFallback: preprocessArray(interpolateString),
  },
  WebDriverExecutor.prototype.doSelect
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
