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

import webdriver, {
  Capabilities,
  Condition as ConditionShape,
  WebDriver,
  WebElement as WebElementShape,
  WebElementCondition as WebElementConditionShape,
} from 'selenium-webdriver'
import { absolutifyUrl } from './utils'
import {
  composePreprocessors,
  preprocessArray,
  interpolateString,
  interpolateScript,
} from './preprocessors'
import { AssertionError, VerificationError } from './errors'
import Variables from './variables'
import { Fn } from '@seleniumhq/side-commons'
import { CommandShape } from '@seleniumhq/side-model'
import { PluginShape } from './types'

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
export type ExpandedCapabilities = Partial<Capabilities> & {
  browserName: string
  'goog:chromeOptions'?: Record<string, boolean | number | string | string[]>
}
const DEFAULT_CAPABILITIES: ExpandedCapabilities = {
  browserName: 'chrome',
}

const state = Symbol('state')

/**
 * This is a polyfill type to allow for unsupported electron
 * driver methods to override with their own custom implementations
 */
export interface WindowAPI {
  setWindowSize: (
    executor: WebDriverExecutor,
    width: number,
    height: number
  ) => Promise<void>
}

export interface WebDriverExecutorConstructorArgs {
  capabilities?: ExpandedCapabilities
  customCommands?: PluginShape['commands']
  disableCodeExportCompat?: boolean
  driver?: WebDriver
  hooks?: WebDriverExecutorHooks
  implicitWait?: number
  server?: string
  windowAPI?: WindowAPI
}

export interface WebDriverExecutorInitOptions {
  baseUrl: string
  logger: Console
  variables: Variables
}

export interface WebDriverExecutorCondEvalResult {
  value: boolean
}

export interface BeforePlayHookInput {
  driver: WebDriverExecutor
}

export interface CommandHookInput {
  command: CommandShape
}

export interface StoreWindowHandleHookInput {
  windowHandle: string
  windowHandleName: string
}

export interface WindowAppearedHookInput {
  command: CommandShape
  windowHandleName: CommandShape['windowHandleName']
  windowHandle?: string | Error
}

export interface WindowSwitchedHookInput {
  windowHandle?: string | Error
}

export interface WebDriverExecutorHooks {
  onBeforePlay?: (input: BeforePlayHookInput) => void
  onAfterCommand?: (input: CommandHookInput) => void
  onBeforeCommand?: (input: CommandHookInput) => void
  onStoreWindowHandle?: (input: StoreWindowHandleHookInput) => void
  onWindowAppeared?: (input: WindowAppearedHookInput) => void
  onWindowSwitched?: (input: WindowSwitchedHookInput) => void
}

export interface ElementEditableScriptResult {
  enabled: boolean
  readonly: boolean
}

export interface ScriptShape {
  script: string
  argv: any[]
}

const defaultWindowAPI: WindowAPI = {
  setWindowSize: async (executor: WebDriverExecutor, width, height) => {
    await executor.driver.manage().window().setRect({ width, height })
  },
}

export default class WebDriverExecutor {
  constructor({
    customCommands = {},
    disableCodeExportCompat = false,
    driver,
    capabilities,
    server,
    hooks = {},
    implicitWait,
    windowAPI = defaultWindowAPI,
  }: WebDriverExecutorConstructorArgs) {
    if (driver) {
      this.driver = driver
    } else {
      this.capabilities = capabilities || DEFAULT_CAPABILITIES
      this.server = server
    }
    this.disableCodeExportCompat = disableCodeExportCompat
    this.initialized = false
    this.implicitWait = implicitWait || 5 * 1000
    this.hooks = hooks
    this.waitForNewWindow = this.waitForNewWindow.bind(this)
    this.customCommands = customCommands
    this.windowAPI = windowAPI
  }
  baseUrl?: string
  // @ts-expect-error
  variables: Variables
  cancellable?: { cancel: () => void }
  capabilities?: ExpandedCapabilities
  customCommands: Required<PluginShape>['commands']
  disableCodeExportCompat: boolean
  // @ts-expect-error
  driver: WebDriver
  server?: string
  windowAPI: WindowAPI
  windowHandle?: string
  hooks: WebDriverExecutorHooks
  implicitWait: number
  initialized: boolean
  logger?: Console;
  [state]?: any

  async init({ baseUrl, logger, variables }: WebDriverExecutorInitOptions) {
    this.baseUrl = baseUrl
    this.logger = logger
    this.variables = variables
    this[state] = {}

    if (!this.driver) {
      const { browserName, ...capabilities } = this
        .capabilities as ExpandedCapabilities
      this.logger.info('Building driver for ' + browserName)
      this.driver = await new webdriver.Builder()
        .withCapabilities(capabilities)
        .usingServer(this.server as string)
        .forBrowser(browserName)
        .build()
      this.logger.info('Driver has been built for ' + browserName)
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
      // @ts-expect-error
      this.driver = undefined
      this.initialized = false
    }
  }

  isAlive() {
    // webdriver will throw for us, but not necessarily for all commands
    // TODO: check if there are commands that will succeed if we always return true
    return true
  }

  name(command: string) {
    if (!command) {
      return 'skip'
    }

    const upperCase = command.charAt(0).toUpperCase() + command.slice(1)
    const func = 'do' + upperCase
    // @ts-expect-error The functions can be overridden by custom commands and stuff
    if (!this[func]) {
      throw new Error(`Unknown command ${command}`)
    }
    return func
  }

  async executeHook<T extends keyof WebDriverExecutorHooks>(
    hook: T,
    ...args: Parameters<NonNullable<WebDriverExecutorHooks[T]>>
  ) {
    const fn = this.hooks[hook]
    if (!fn) return
    await fn.apply(this, args)
  }

  async beforeCommand(commandObject: CommandShape) {
    if (commandObject.opensWindow) {
      this[state].openedWindows = await this.driver.getAllWindowHandles()
    }
    await this.executeHook('onBeforeCommand', { command: commandObject })
  }

  async afterCommand(commandObject: CommandShape) {
    this.cancellable = undefined
    if (commandObject.opensWindow) {
      const handle = await this.wait<string | undefined>(
        this.waitForNewWindow(),
        commandObject.windowTimeout
      )
      this.variables.set(commandObject.windowHandleName as string, handle)

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
      (handle) => !this[state].openedWindows.includes(handle)
    )
  }

  registerCommand(commandName: string, fn: Fn) {
    // @ts-expect-error
    this['do' + commandName.charAt(0).toUpperCase() + commandName.slice(1)] = fn
  }

  // Commands go after this line
  async skip() {
    return Promise.resolve()
  }

  // window commands
  async doOpen(url: string) {
    await this.driver.get(absolutifyUrl(url, this.baseUrl as string))
  }

  async doSetWindowSize(widthXheight: string) {
    const [width, height] = widthXheight.split('x').map((v) => parseInt(v))
    await this.windowAPI.setWindowSize(this, width, height)
  }

  async doSelectWindow(handleLocator: string) {
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

  async doSelectFrame(locator: string) {
    // It's possible that for the browser and webdriver to index frames differently.
    // We can ask the browser for the URL of the underlying original index and use that in
    // webdriver to ensure we get the proper match.

    const targetLocator = this.driver.switchTo()
    if (locator === 'relative=top') {
      await targetLocator.defaultContent()
    } else if (locator === 'relative=parent') {
      await targetLocator.parentFrame()
    } else if (locator.startsWith('index=')) {
      const frameIndex = locator.substring('index='.length)
      const frameTargets = frameIndex.split('\\')
      for (let frameTarget of frameTargets) {
        if (frameTarget === '..') await targetLocator.parentFrame()
        else {
          if (this.disableCodeExportCompat) {
            const frameIndex = locator.substring('index='.length)
            // Delay for a second. Check too fast, and browser will think this iframe location is 'about:blank'
            await new Promise((f) => setTimeout(f, 1000))
            const frameUrl = await this.driver.executeScript(
              "return window.frames['" + frameIndex + "'].location.href"
            )
            const windowFrames = await this.driver.findElements(
              By.css('iframe')
            )
            let matchIndex = 0
            for (let frame of windowFrames) {
              let localFrameUrl = await frame.getAttribute('src')
              if (localFrameUrl === frameUrl) {
                break
              }
              matchIndex++
            }
            this.driver.switchTo().frame(matchIndex)
          } else {
            await targetLocator.frame(Number(frameTarget))
          }
        }
      }
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

  async doAddSelection(
    locator: string,
    optionLocator: string,
    commandObject: Partial<CommandShape> = {}
  ) {
    const element = await this.waitForElement(
      locator,
      commandObject.targetFallback
    )
    const option = await element.findElement(parseOptionLocator(optionLocator))
    const selections = (await this.driver.executeScript(
      'return arguments[0].selectedOptions',
      element
    )) as WebElementShape[]
    if (!(await findElement(selections, option))) {
      await option.click()
    }
  }

  async doRemoveSelection(
    locator: string,
    optionLocator: string,
    commandObject: Partial<CommandShape> = {}
  ) {
    const element = await this.waitForElement(
      locator,
      commandObject.targetFallback
    )

    if (!(await element.getAttribute('multiple'))) {
      throw new Error('Given element is not a multiple select type element')
    }

    const option = await element.findElement(parseOptionLocator(optionLocator))
    const selections = (await this.driver.executeScript(
      'return arguments[0].selectedOptions',
      element
    )) as WebElementShape[]
    if (await findElement(selections, option)) {
      await option.click()
    }
  }

  async doCheck(
    locator: string,
    _: string,
    commandObject: Partial<CommandShape> = {}
  ) {
    const element = await this.waitForElement(
      locator,
      commandObject.targetFallback
    )
    if (!(await element.isSelected())) {
      await element.click()
    }
  }

  async doUncheck(
    locator: string,
    _: string,
    commandObject: Partial<CommandShape> = {}
  ) {
    const element = await this.waitForElement(
      locator,
      commandObject.targetFallback
    )
    if (await element.isSelected()) {
      await element.click()
    }
  }

  async doClick(locator: string, _: string) {
    const element = await this.waitForElementVisible(locator, this.implicitWait)
    await element.click()
  }

  async doClickAt(
    locator: string,
    coordString: string,
    commandObject: Partial<CommandShape> = {}
  ) {
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

  async doDoubleClick(
    locator: string,
    _: string,
    commandObject: Partial<CommandShape> = {}
  ) {
    const element = await this.waitForElement(
      locator,
      commandObject.targetFallback
    )
    await this.driver.actions({ bridge: true }).doubleClick(element).perform()
  }

  async doDoubleClickAt(
    locator: string,
    coordString: string,
    commandObject: Partial<CommandShape> = {}
  ) {
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

  async doDragAndDropToObject(
    dragLocator: string,
    dropLocator: string,
    commandObject: Partial<CommandShape> = {}
  ) {
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

  async doMouseDown(
    locator: string,
    _: string,
    commandObject: Partial<CommandShape> = {}
  ) {
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

  async doMouseDownAt(
    locator: string,
    coordString: string,
    commandObject: Partial<CommandShape> = {}
  ) {
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

  async doMouseMoveAt(
    locator: string,
    coordString: string,
    commandObject: Partial<CommandShape> = {}
  ) {
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

  async doMouseOut(
    locator: string,
    _: string,
    commandObject: Partial<CommandShape> = {}
  ) {
    const element = await this.waitForElement(
      locator,
      commandObject.targetFallback
    )
    const [rect, vp]: [DOMRect, { height: number; width: number }] =
      await this.driver.executeScript(
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
      const x = -rect.right / 2
      return await this.driver
        .actions({ bridge: true })
        .move({ origin: element, x })
        .perform()
    }

    throw new Error(
      'Unable to perform mouse out as the element takes up the entire viewport'
    )
  }

  async doMouseOver(
    locator: string,
    _: string,
    commandObject: Partial<CommandShape> = {}
  ) {
    const element = await this.waitForElement(
      locator,
      commandObject.targetFallback
    )
    await this.driver
      .actions({ bridge: true })
      .move({ origin: element })
      .perform()
  }

  async doMouseUp(
    locator: string,
    _: string,
    commandObject: Partial<CommandShape> = {}
  ) {
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

  async doMouseUpAt(
    locator: string,
    coordString: string,
    commandObject: Partial<CommandShape> = {}
  ) {
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

  async doSelect(
    locator: string,
    optionLocator: string,
    commandObject: Partial<CommandShape> = {}
  ) {
    const element = await this.waitForElement(
      locator,
      commandObject.targetFallback
    )
    const option = await element.findElement(parseOptionLocator(optionLocator))
    await option.click()
  }

  // keyboard commands

  async doEditContent(
    locator: string,
    value: string,
    commandObject: Partial<CommandShape> = {}
  ) {
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

  async doType(
    locator: string,
    value: string,
    commandObject: Partial<CommandShape> = {}
  ) {
    const element = await this.waitForElement(
      locator,
      commandObject.targetFallback
    )
    await element.clear()
    await element.sendKeys(value)
  }

  async doSendKeys(
    locator: string,
    value: string,
    commandObject: Partial<CommandShape> = {}
  ) {
    const element = await this.waitForElement(
      locator,
      commandObject.targetFallback
    )
    await element.sendKeys(...value)
  }

  // wait commands

  async doWaitForElementEditable(locator: string, timeout: string) {
    const element = await this.driver.findElement(parseLocator(locator))
    await this.wait(
      this.isElementEditable(element),
      parseInt(timeout),
      'Timed out waiting for element to be editable'
    )
  }

  async doWaitForElementNotEditable(locator: string, timeout: string) {
    const element = await this.driver.findElement(parseLocator(locator))
    await this.wait(
      this.isElementEditable(element),
      parseInt(timeout),
      'Timed out waiting for element to not be editable'
    )
  }

  async doWaitForElementPresent(locator: string, timeout: string) {
    await this.wait(
      until.elementLocated(parseLocator(locator)),
      parseInt(timeout)
    )
  }

  async doWaitForElementNotPresent(locator: string, timeout: string) {
    const parsedLocator = parseLocator(locator)
    const elements = await this.driver.findElements(parsedLocator)
    if (elements.length !== 0) {
      await this.wait(until.stalenessOf(elements[0]), parseInt(timeout))
    }
  }

  async doWaitForElementVisible(locator: string, timeout: string) {
    await this.waitForElementVisible(locator, parseInt(timeout))
  }

  async doWaitForElementNotVisible(locator: string, timeout: string) {
    const parsedLocator = parseLocator(locator)
    const elements = await this.driver.findElements(parsedLocator)

    if (elements.length > 0) {
      await this.wait(until.elementIsNotVisible(elements[0]), parseInt(timeout))
    }
  }

  async doWaitForText(locator: string, text: string) {
    await this.waitForText(locator, text)
  }

  // script commands

  async doRunScript(script: ScriptShape) {
    await this.driver.executeScript(script.script, ...script.argv)
  }

  async doExecuteScript(script: ScriptShape, optionalVariable?: string) {
    const result = await this.driver.executeScript(
      script.script,
      ...script.argv
    )
    if (optionalVariable) {
      this.variables.set(optionalVariable, result)
    }
  }

  async doExecuteAsyncScript(script: ScriptShape, optionalVariable?: string) {
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
    await this.driver.switchTo().alert().accept()
  }

  async doAcceptConfirmation() {
    await this.driver.switchTo().alert().accept()
  }

  async doAnswerPrompt(optAnswer?: string) {
    const alert = await this.driver.switchTo().alert()
    if (optAnswer) {
      await alert.sendKeys(optAnswer)
    }
    await alert.accept()
  }

  async doDismissConfirmation() {
    await this.driver.switchTo().alert().dismiss()
  }

  async doDismissPrompt() {
    await this.driver.switchTo().alert().dismiss()
  }

  // store commands

  async doStore(string: string, variable: string) {
    this.variables.set(variable, string)
    return Promise.resolve()
  }

  async doStoreAttribute(attributeLocator: string, variable: string) {
    const attributePos = attributeLocator.lastIndexOf('@')
    const elementLocator = attributeLocator.slice(0, attributePos)
    const attributeName = attributeLocator.slice(attributePos + 1)

    const element = await this.waitForElement(elementLocator)
    const value = await element.getAttribute(attributeName)
    this.variables.set(variable, value)
  }

  async doStoreElementCount(locator: string, variable: string) {
    const elements = await this.driver.findElements(parseLocator(locator))
    this.variables.set(variable, elements.length)
  }

  async doStoreJson(json: string, variable: string) {
    this.variables.set(variable, JSON.parse(json))
    return Promise.resolve()
  }

  async doStoreText(
    locator: string,
    variable: string,
    commandObject: Partial<CommandShape> = {}
  ) {
    const element = await this.waitForElement(
      locator,
      commandObject.targetFallback
    )
    const text = await element.getText()
    this.variables.set(variable, text)
  }

  async doStoreTitle(variable: string) {
    const title = await this.driver.getTitle()
    this.variables.set(variable, title)
  }

  async doStoreValue(
    locator: string,
    variable: string,
    commandObject: Partial<CommandShape> = {}
  ) {
    const element = await this.waitForElement(
      locator,
      commandObject.targetFallback
    )
    const value = await element.getAttribute('value')
    this.variables.set(variable, value)
  }

  async doStoreWindowHandle(variable: string) {
    const handle = await this.driver.getWindowHandle()
    this.variables.set(variable, handle)
    await this.executeHook('onStoreWindowHandle', {
      windowHandle: handle,
      windowHandleName: variable,
    })
  }

  // assertions

  async doAssert(variableName: string, value: string) {
    const variable = `${this.variables.get(variableName)}`
    if (variable != value) {
      throw new AssertionError(
        "Actual value '" + variable + "' did not match '" + value + "'"
      )
    }
  }

  async doAssertAlert(expectedText: string) {
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

  async doAssertConfirmation(expectedText: string) {
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

  async doAssertEditable(
    locator: string,
    _: string,
    commandObject: Partial<CommandShape> = {}
  ) {
    const element = await this.waitForElement(
      locator,
      commandObject.targetFallback
    )
    if (!(await this.isElementEditable(element))) {
      throw new AssertionError('Element is not editable')
    }
  }

  async doAssertNotEditable(
    locator: string,
    _: string,
    commandObject: Partial<CommandShape> = {}
  ) {
    const element = await this.waitForElement(
      locator,
      commandObject.targetFallback
    )
    if (await this.isElementEditable(element)) {
      throw new AssertionError('Element is editable')
    }
  }

  async doAssertPrompt(expectedText: string) {
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

  async doAssertTitle(title: string) {
    const actualTitle = await this.driver.getTitle()
    if (title != actualTitle) {
      throw new AssertionError(
        "Actual value '" + actualTitle + "' did not match '" + title + "'"
      )
    }
  }

  async doAssertElementPresent(
    locator: string,
    _: string,
    commandObject: Partial<CommandShape> = {}
  ) {
    await this.waitForElement(locator, commandObject.targetFallback)
  }

  async doAssertElementNotPresent(locator: string) {
    const elements = await this.driver.findElements(parseLocator(locator))
    if (elements.length) {
      throw new AssertionError('Unexpected element was found in page')
    }
  }

  async doAssertText(
    locator: string,
    value: string,
    commandObject: Partial<CommandShape> = {}
  ) {
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

  async doAssertNotText(
    locator: string,
    value: string,
    commandObject: Partial<CommandShape> = {}
  ) {
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

  async doAssertValue(
    locator: string,
    value: string,
    commandObject: Partial<CommandShape> = {}
  ) {
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
  async doAssertNotValue(
    locator: string,
    value: string,
    commandObject: Partial<CommandShape> = {}
  ) {
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

  async doAssertChecked(
    locator: string,
    _: string,
    commandObject: Partial<CommandShape> = {}
  ) {
    const element = await this.waitForElement(
      locator,
      commandObject.targetFallback
    )
    if (!(await element.isSelected())) {
      throw new AssertionError('Element is not checked, expected to be checked')
    }
  }

  async doAssertNotChecked(
    locator: string,
    _: string,
    commandObject: Partial<CommandShape> = {}
  ) {
    const element = await this.waitForElement(
      locator,
      commandObject.targetFallback
    )
    if (await element.isSelected()) {
      throw new AssertionError('Element is checked, expected to be unchecked')
    }
  }

  async doAssertSelectedValue(
    locator: string,
    value: string,
    commandObject: Partial<CommandShape> = {}
  ) {
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

  async doAssertNotSelectedValue(
    locator: string,
    value: string,
    commandObject: Partial<CommandShape> = {}
  ) {
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

  async doAssertSelectedLabel(
    locator: string,
    label: string,
    commandObject: Partial<CommandShape> = {}
  ) {
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

  async doAssertNotSelectedLabel(
    locator: string,
    label: string,
    commandObject: Partial<CommandShape> = {}
  ) {
    const element = await this.waitForElement(
      locator,
      commandObject?.targetFallback
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

  async doEcho(string: string) {
    if (this.logger) {
      this.logger.info(`echo: ${string}`)
    }
  }

  async doPause(time: number) {
    await this.driver.sleep(time)
  }

  async doRun() {
    throw new Error('`run` is not supported in this run mode')
  }

  async doSetSpeed() {
    throw new Error('`set speed` is not supported in this run mode')
  }

  async evaluateConditional(
    script: ScriptShape
  ): Promise<WebDriverExecutorCondEvalResult> {
    const result = await this.driver.executeScript(
      `return (${script.script})`,
      ...script.argv
    )
    return {
      value: !!result,
    }
  }

  async waitForElement(
    locator: string,
    fallback: [string, string][] = []
  ): Promise<WebElementShape> {
    const elementLocator = parseLocator(locator)
    try {
      return (await this.wait<WebElementShape>(
        until.elementLocated(elementLocator),
        this.implicitWait
      )) as WebElementShape
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
  async isElementEditable(element: WebElementShape) {
    const { enabled, readonly } =
      await this.driver.executeScript<ElementEditableScriptResult>(
        'return { enabled: !arguments[0].disabled, readonly: arguments[0].readOnly };',
        element
      )
    return enabled && !readonly
  }

  async retryToAllowForIntermittency(locator: string, timeout: number) {
    const startTime = Date.now()
    const element = (await this.wait<WebElementShape>(
      until.elementLocated(parseLocator(locator)),
      timeout
    )) as WebElementShape
    const elapsed = Date.now() - startTime
    await this.wait(until.elementIsVisible(element), timeout - elapsed)
    return element
  }

  async waitForElementVisible(locator: string, timeout: number) {
    const startTime = Date.now()
    const element = (await this.wait<WebElementShape>(
      until.elementLocated(parseLocator(locator)),
      timeout
    )) as WebElementShape
    const elapsed = Date.now() - startTime
    await this.wait(until.elementIsVisible(element), timeout - elapsed)
    return element
  }

  async waitForText(locator: string, text: string) {
    const startTime = Date.now()
    const timeout = this.implicitWait
    const element = (await this.wait<WebElementShape>(
      until.elementLocated(parseLocator(locator)),
      timeout
    )) as WebElementShape
    const elapsed = Date.now() - startTime
    await this.wait(until.elementTextIs(element, text), timeout - elapsed)
  }

  async wait<T extends any>(
    condition: Promise<T> | ConditionShape<T> | WebElementConditionShape,
    timeout: number = 0,
    message: string = '',
    pollTimeout: number = POLL_TIMEOUT
  ): Promise<T | Error> {
    if (typeof timeout !== 'number' || timeout < 0) {
      throw TypeError('timeout must be a number >= 0: ' + timeout)
    }

    if (typeof pollTimeout !== 'number' || pollTimeout < 0) {
      throw TypeError('pollTimeout must be a number >= 0: ' + pollTimeout)
    }

    if (isConditionPromiseLike(condition)) {
      return new Promise((resolve, reject) => {
        if (!timeout) {
          resolve(condition)
          return
        }

        let start = Date.now()
        let timer: NodeJS.Timeout | null = setTimeout(function () {
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
          function (value: T) {
            clearTimer()
            resolve(value)
          },
          function (error: Error) {
            clearTimer()
            reject(error)
          }
        )
      })
    }

    // @ts-expect-error
    let fn: Fn = condition
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
      let resolveCancel: Fn
      const cancelPromise = new Promise((res) => {
        resolveCancel = res
      })
      this.cancellable = {
        cancel: () => {
          cancelled = true
          return cancelPromise
        },
      }
      const pollCondition = async () => {
        evaluateCondition().then((value) => {
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
        result.then(function (value) {
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
    return result as T
  }
}

function isConditionPromiseLike<T>(
  condition: ConditionShape<T> | Promise<T> | WebElementConditionShape
): condition is Promise<T> {
  return condition && typeof (condition as Promise<T>).then === 'function'
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
  interpolateString,
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

function createVerifyCommands(Executor: WebDriverExecutor) {
  // @ts-expect-error
  Object.getOwnPropertyNames(Executor.prototype)
    .filter((command) => /^doAssert/.test(command))
    .forEach((assertion) => {
      const verify = assertion.replace('doAssert', 'doVerify')
      // @ts-expect-error
      Executor.prototype[verify] = {
        // creating the function inside an object since function declared in an
        // object are named after the property, thus creating dyanmic named funcs
        // also in order to be able to call(this) the function has to be normal
        // declaration rather than arrow, as arrow will be bound to
        // createVerifyCommands context which is undefined
        [verify]: async function (...args: any[]) {
          try {
            // @ts-expect-error
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

// @ts-expect-error
createVerifyCommands(WebDriverExecutor)

function parseLocator(locator: string) {
  if (/^\/\//.test(locator)) {
    return By.xpath(locator)
  }
  const fragments = locator.split('=')
  const type = fragments.shift() as keyof typeof LOCATORS
  const selector = fragments.join('=')
  if (LOCATORS[type] && selector) {
    return LOCATORS[type](selector)
  } else {
    throw new Error(type ? `Unknown locator ${type}` : "Locator can't be empty")
  }
}

function parseOptionLocator(locator: string) {
  const fragments = locator.split('=')
  const type = fragments.shift() as keyof typeof OPTIONS_LOCATORS
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

function parseCoordString(coord: string) {
  const [x, y] = coord.split(',').map((n) => parseInt(n))
  return {
    x,
    y,
  }
}

function preprocessKeys(_str: string, variables: Variables) {
  const str = interpolateString(_str, variables)
  let keys = []
  let match = str.match(/\$\{\w+\}/g)
  if (!match) {
    keys.push(str)
  } else {
    let i = 0
    while (i < str.length) {
      let currentKey = match.shift() as string,
        currentKeyIndex = str.indexOf(currentKey, i)
      if (currentKeyIndex > i) {
        // push the string before the current key
        keys.push(str.substr(i, currentKeyIndex - i))
        i = currentKeyIndex
      }
      if (currentKey) {
        if (/^\$\{KEY_\w+\}/.test(currentKey)) {
          // is a key
          let keyName = (
            currentKey.match(/\$\{KEY_(\w+)\}/) as [string, string]
          )[1]
          // @ts-expect-error
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

const nbsp = String.fromCharCode(160)
const OPTIONS_LOCATORS = {
  id: (id: string) => By.css(`*[id="${id}"]`),
  value: (value: string) => By.css(`*[value="${value}"]`),
  label: (label: string) => {
    const labels = label.match(/^[\w|-]+(?=:)/)
    if (labels?.length) {
      const [type, ...labelParts] = label.split(':')
      const labelBody = labelParts.join(':')
      switch (type) {
        case 'mostly-equals':
          return By.xpath(
            `//option[normalize-space(translate(., '${nbsp}', ' ')) = '${labelBody}']`
          )
      }
    }
    return By.xpath(`//option[. = '${label}']`)
  },
  index: (index: string) => By.css(`*:nth-child(${index})`),
}

async function findElement(
  elements: WebElementShape[],
  element: WebElementShape
) {
  const id = await element.getId()
  for (let i = 0; i < elements.length; i++) {
    if ((await elements[i].getId()) === id) {
      return true
    }
  }
  return false
}
