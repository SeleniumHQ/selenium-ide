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

import webdriver from 'browser-webdriver'
import { absolutifyUrl } from './utils'
import { Logger, Channels } from '../../stores/view/Logs'
import PlaybackState from '../../stores/view/PlaybackState'

const By = webdriver.By
const until = webdriver.until
const Key = webdriver.Key

const IMPLICIT_WAIT = 30 * 1000
const DEFAULT_CAPABILITIES = {
  browserName: 'chrome',
}
const DEFAULT_SERVER = 'http://localhost:4444/wd/hub'

export default class WebDriverExecutor {
  constructor(capabilities, server) {
    this.capabilities = capabilities || DEFAULT_CAPABILITIES
    this.server = server || DEFAULT_SERVER
    this.logger = new Logger(Channels.PLAYBACK)
  }

  async init({ baseUrl, variables }) {
    this.baseUrl = baseUrl
    this.variables = variables
    this.driver = await new webdriver.Builder()
      .withCapabilities(this.capabilities)
      .usingServer(this.server)
      .build()
  }

  async cleanup() {
    await this.driver.quit()
  }

  isWebDriverCommand() {
    return true
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
    const func = ('do' + upperCase).replace('Verify', 'Assert')
    if (!this[func]) {
      throw new Error(`Unknown command ${command}`)
    }
    return func
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
  // doSelectWindow
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

  async doSelectFrame(locator) {
    const targetLocator = this.driver.switchTo()
    if (locator === 'relative=top') {
      await targetLocator.defaultContent()
    } else if (locator === 'relative=parent') {
      await targetLocator.parentFrame()
    } else if (locator.startsWith('index=')) {
      await targetLocator.frame(+locator.substr('index='.length))
    } else {
      const element = await waitForElement(locator, this.driver)
      await targetLocator.frame(element)
    }
  }

  async doSubmit(locator) {
    const element = await waitForElement(locator, this.driver)
    await element.submit()
  }

  // mouse commands

  async doClick(locator) {
    const element = await waitForElement(locator, this.driver)
    await element.click()
  }

  async doClickAt(locator, coordString) {
    const coords = coordString.split(',')
    const element = await waitForElement(locator, this.driver)
    await this.driver
      .actions()
      .mouseMove(element, { x: coords[0], y: coords[1] })
      .click()
      .perform()
  }

  async doDoubleClick(locator) {
    const element = await waitForElement(locator, this.driver)
    await this.driver
      .actions()
      .doubleClick(element)
      .perform()
  }

  async doCheck(locator) {
    const element = await waitForElement(locator, this.driver)
    if (!(await element.isSelected())) {
      await element.click()
    }
  }

  async doUncheck(locator) {
    const element = await waitForElement(locator, this.driver)
    if (await element.isSelected()) {
      await element.click()
    }
  }

  async doSelect(locator, optionLocator) {
    const element = await waitForElement(locator, this.driver)
    const option = await element.findElement(parseOptionLocator(optionLocator))
    await option.click()
  }

  // keyboard commands

  async doType(locator, value) {
    const element = await waitForElement(locator, this.driver)
    await element.clear()
    await element.sendKeys(value)
  }

  async doSendKeys(locator, value) {
    const element = await waitForElement(locator, this.driver)
    await element.sendKeys(...preprocessKeys(value))
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
    const element = await waitForElement(locator, this.driver)
    const text = await element.getText()
    this.variables.set(variable, text)
  }

  async doStoreValue(locator, variable) {
    const element = await waitForElement(locator, this.driver)
    const value = await element.getAttribute('value')
    this.variables.set(variable, value)
  }

  // assertions

  async doAssert(variableName, value) {
    const variable = `${this.variables.get(variableName)}`
    if (variable != value) {
      throw new Error(
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
      throw new Error(
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
      throw new Error(
        "Actual value '" + actualTitle + "' did not match '" + title + "'"
      )
    }
  }

  async doAssertElementPresent(locator) {
    await waitForElement(locator, this.driver)
  }

  async doAssertElementNotPresent(locator) {
    const elements = await this.driver.findElements(parseLocator(locator))
    if (elements.length) {
      throw new Error('Unexpected element was found in page')
    }
  }

  async doAssertText(locator, value) {
    const element = await waitForElement(locator, this.driver)
    const text = await element.getText()
    if (text !== value) {
      throw new Error(
        "Actual value '" + text + "' did not match '" + value + "'"
      )
    }
  }

  async doAssertNotText(locator, value) {
    const element = await waitForElement(locator, this.driver)
    const text = await element.getText()
    if (text === value) {
      throw new Error("Actual value '" + text + "' did match '" + value + "'")
    }
  }

  async doAssertValue(locator, value) {
    const element = await waitForElement(locator, this.driver)
    const elementValue = await element.getAttribute('value')
    if (elementValue !== value) {
      throw new Error(
        "Actual value '" + elementValue + "' did not match '" + value + "'"
      )
    }
  }

  // not generally implemented
  async doAssertNotValue(locator, value) {
    const element = await waitForElement(locator, this.driver)
    const elementValue = await element.getAttribute('value')
    if (elementValue === value) {
      throw new Error(
        "Actual value '" + elementValue + "' did match '" + value + "'"
      )
    }
  }

  async doAssertChecked(locator) {
    const element = await waitForElement(locator, this.driver)
    if (!(await element.isSelected())) {
      throw new Error('Element is not checked, expected to be checked')
    }
  }

  async doAssertNotChecked(locator) {
    const element = await waitForElement(locator, this.driver)
    if (await element.isSelected()) {
      throw new Error('Element is checked, expected to be unchecked')
    }
  }

  async doAssertSelectedValue(locator, value) {
    const element = await waitForElement(locator, this.driver)
    const elementValue = await element.getAttribute('value')
    if (elementValue !== value) {
      throw new Error(
        "Actual value '" + elementValue + "' did not match '" + value + "'"
      )
    }
  }

  async doAssertNotSelectedValue(locator, value) {
    const element = await waitForElement(locator, this.driver)
    const elementValue = await element.getAttribute('value')
    if (elementValue === value) {
      throw new Error(
        "Actual value '" + elementValue + "' did match '" + value + "'"
      )
    }
  }

  async doAssertSelectedLabel(locator, label) {
    const element = await waitForElement(locator, this.driver)
    const selectedValue = await element.getAttribute('value')
    const selectedOption = await element.findElement(
      By.xpath(`option[@value="${selectedValue}"]`)
    )
    const selectedOptionLabel = await selectedOption.getText()
    if (selectedOptionLabel !== label) {
      throw new Error(
        "Actual value '" +
          selectedOptionLabel +
          "' did not match '" +
          label +
          "'"
      )
    }
  }

  async doAssertNotSelectedLabel(locator, label) {
    const element = await waitForElement(locator, this.driver)
    const selectedValue = await element.getAttribute('value')
    const selectedOption = await element.findElement(
      By.xpath(`option[@value="${selectedValue}"]`)
    )
    const selectedOptionLabel = await selectedOption.getText()
    if (selectedOptionLabel === label) {
      throw new Error(
        "Actual value '" + selectedOptionLabel + "' not match '" + label + "'"
      )
    }
  }

  // other commands

  async doEcho(string) {
    this.logger.log(`echo: ${string}`)
    return Promise.resolve()
  }

  async doPause(time) {
    await this.driver.sleep(time)
  }

  async evaluateConditional(script) {
    try {
      const result = await this.driver.executeScript(
        `return (${script.script})`,
        ...script.argv
      )
      return Promise.resolve({
        result: 'success',
        value: !!result,
      })
    } catch (error) {
      return Promise.resolve({
        result: error.message,
      })
    }
  }

  async doRun(target) {
    return Promise.resolve(PlaybackState.callTestCase(target))
  }
}

async function waitForElement(locator, driver) {
  const elementLocator = parseLocator(locator)
  await driver.wait(until.elementLocated(elementLocator), IMPLICIT_WAIT)
  const element = await driver.findElement(elementLocator)

  return element
}

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

function preprocessKeys(str) {
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
