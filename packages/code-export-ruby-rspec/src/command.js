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

import { codeExport as exporter } from '@seleniumhq/side-utils'
import location from './location'
import selection from './selection'

export const emitters = {
  addSelection: emitSelect,
  answerOnNextPrompt: skip,
  assert: emitAssert,
  assertAlert: emitAssertAlert,
  assertChecked: emitVerifyChecked,
  assertConfirmation: emitAssertAlert,
  assertEditable: emitVerifyEditable,
  assertElementPresent: emitVerifyElementPresent,
  assertElementNotPresent: emitVerifyElementNotPresent,
  assertNotChecked: emitVerifyNotChecked,
  assertNotEditable: emitVerifyNotEditable,
  assertNotSelectedValue: emitVerifyNotSelectedValue,
  assertNotText: emitVerifyNotText,
  assertPrompt: emitAssertAlert,
  assertSelectedLabel: emitVerifySelectedLabel,
  assertSelectedValue: emitVerifyValue,
  assertValue: emitVerifyValue,
  assertText: emitVerifyText,
  assertTitle: emitVerifyTitle,
  check: emitCheck,
  chooseCancelOnNextConfirmation: skip,
  chooseCancelOnNextPrompt: skip,
  chooseOkOnNextConfirmation: skip,
  click: emitClick,
  clickAt: emitClick,
  close: emitClose,
  debugger: skip,
  do: emitControlFlowDo,
  doubleClick: emitDoubleClick,
  doubleClickAt: emitDoubleClick,
  dragAndDropToObject: emitDragAndDrop,
  echo: emitEcho,
  editContent: emitEditContent,
  else: emitControlFlowElse,
  elseIf: emitControlFlowElseIf,
  end: emitControlFlowEnd,
  executeScript: emitExecuteScript,
  executeAsyncScript: emitExecuteAsyncScript,
  forEach: emitControlFlowForEach,
  if: emitControlFlowIf,
  mouseDown: emitMouseDown,
  mouseDownAt: emitMouseDown,
  mouseMove: emitMouseMove,
  mouseMoveAt: emitMouseMove,
  mouseOver: emitMouseMove,
  mouseOut: emitMouseOut,
  mouseUp: emitMouseUp,
  mouseUpAt: emitMouseUp,
  open: emitOpen,
  pause: emitPause,
  removeSelection: emitSelect,
  repeatIf: emitControlFlowRepeatIf,
  run: emitRun,
  runScript: emitRunScript,
  select: emitSelect,
  selectFrame: emitSelectFrame,
  selectWindow: emitSelectWindow,
  sendKeys: emitSendKeys,
  setSpeed: emitSetSpeed,
  setWindowSize: emitSetWindowSize,
  store: emitStore,
  storeAttribute: emitStoreAttribute,
  storeJson: emitStoreJson,
  storeText: emitStoreText,
  storeTitle: emitStoreTitle,
  storeValue: emitStoreValue,
  storeWindowHandle: emitStoreWindowHandle,
  storeXpathCount: emitStoreXpathCount,
  submit: emitSubmit,
  times: emitControlFlowTimes,
  type: emitType,
  uncheck: emitUncheck,
  verify: emitAssert,
  verifyChecked: emitVerifyChecked,
  verifyEditable: emitVerifyEditable,
  verifyElementPresent: emitVerifyElementPresent,
  verifyElementNotPresent: emitVerifyElementNotPresent,
  verifyNotChecked: emitVerifyNotChecked,
  verifyNotEditable: emitVerifyNotEditable,
  verifyNotSelectedValue: emitVerifyNotSelectedValue,
  verifyNotText: emitVerifyNotText,
  verifySelectedLabel: emitVerifySelectedLabel,
  verifySelectedValue: emitVerifyValue,
  verifyText: emitVerifyText,
  verifyTitle: emitVerifyTitle,
  verifyValue: emitVerifyValue,
  waitForElementEditable: emitWaitForElementEditable,
  waitForElementPresent: emitWaitForElementPresent,
  waitForElementVisible: emitWaitForElementVisible,
  waitForElementNotEditable: emitWaitForElementNotEditable,
  waitForElementNotPresent: emitWaitForElementNotPresent,
  waitForElementNotVisible: emitWaitForElementNotVisible,
  webdriverAnswerOnVisiblePrompt: emitAnswerOnNextPrompt,
  waitForText: emitWaitForText,
  webdriverChooseCancelOnVisibleConfirmation: emitChooseCancelOnNextConfirmation,
  webdriverChooseCancelOnVisiblePrompt: emitChooseCancelOnNextConfirmation,
  webdriverChooseOkOnVisibleConfirmation: emitChooseOkOnNextConfirmation,
  while: emitControlFlowWhile,
}

exporter.register.preprocessors(emitters)

function register(command, emitter) {
  exporter.register.emitter({ command, emitter, emitters })
}

function emit(command) {
  return exporter.emit.command(command, emitters[command.command], {
    variableLookup,
    emitNewWindowHandling,
  })
}

function canEmit(commandName) {
  return !!emitters[commandName]
}

function variableLookup(varName) {
  return `@vars['${varName}']`
}

function variableSetter(varName, value) {
  return varName ? `@vars['${varName}'] = ${value}` : ''
}

function emitWaitForWindow() {
  const generateMethodDeclaration = name => {
    return `def ${name}(self, timeout = 2):`
  }
  const commands = [
    { level: 0, statement: 'sleep(round(timeout / 1000))' },
    { level: 0, statement: 'wh_now = @driver.window_handles' },
    {
      level: 0,
      statement: `wh_then = @vars['window_handles']`,
    },
    { level: 0, statement: 'wh_now.find { |window| window != wh_then.first' },
  ]
  return Promise.resolve({
    name: 'wait_for_window',
    commands,
    generateMethodDeclaration,
  })
}

async function emitNewWindowHandling(command, emittedCommand) {
  return Promise.resolve(
    `@vars['window_handles'] = @driver.window_handles\n${await emittedCommand}\n@vars['${
      command.windowHandleName
    }'] = wait_for_window(${command.windowTimeout})`
  )
}

function emitAssert(varName, value) {
  let _value
  if (value === 'true' || value === 'false') {
    _value = value
  } else if (value === '0' || !!Number(value)) {
    _value = value
  }
  const result = _value
    ? `expect(@vars['${varName}']).to eq(${_value})`
    : `expect(@vars['${varName}']).to eq('${value}')`
  return Promise.resolve(result)
}

function emitAssertAlert(alertText) {
  return Promise.resolve(
    `expect(@driver.switch_to.alert.text).to eq('${alertText}')`
  )
}

function emitAnswerOnNextPrompt(textToSend) {
  const commands = [
    { level: 0, statement: 'alert = @driver.switch_to.alert' },
    { level: 0, statement: `alert.send_keys('${textToSend}')` },
    { level: 0, statement: 'alert.accept()' },
  ]
  return Promise.resolve({ commands })
}

async function emitCheck(locator) {
  const commands = [
    {
      level: 0,
      statement: `element = @driver.find_element(${await location.emit(
        locator
      )})`,
    },
    {
      level: 0,
      statement: 'element.click if !element.selected?',
    },
  ]
  return Promise.resolve({ commands })
}

function emitChooseCancelOnNextConfirmation() {
  return Promise.resolve(`@driver.switch_to.alert.dismiss`)
}

function emitChooseOkOnNextConfirmation() {
  return Promise.resolve(`@driver.switch_to.alert.accept`)
}

async function emitClick(target) {
  return Promise.resolve(
    `@driver.find_element(${await location.emit(target)}).click`
  )
}

async function emitClose() {
  return Promise.resolve(`@driver.close`)
}

function generateExpressionScript(script) {
  return `@driver.execute_script("return (${
    script.script
  })"${generateScriptArguments(script)})`
}

function generateScriptArguments(script) {
  return `${script.argv.length ? ', ' : ''}${script.argv
    .map(varName => `@vars['${varName}']`)
    .join(',')}`
}

function emitControlFlowDo() {
  return Promise.resolve({
    commands: [{ level: 0, statement: 'loop do' }],
    endingLevelAdjustment: 1,
  })
}

function emitControlFlowElse() {
  return Promise.resolve({
    commands: [{ level: 0, statement: 'else' }],
    startingLevelAdjustment: -1,
    endingLevelAdjustment: +1,
  })
}

function emitControlFlowElseIf(script) {
  return Promise.resolve({
    commands: [
      {
        level: 0,
        statement: `elsif ${generateExpressionScript(script)}`,
      },
    ],
    startingLevelAdjustment: -1,
    endingLevelAdjustment: +1,
  })
}

function emitControlFlowEnd() {
  return Promise.resolve({
    commands: [{ level: 0, statement: `end` }],
    startingLevelAdjustment: -1,
  })
}

function emitControlFlowIf(script) {
  return Promise.resolve({
    commands: [
      { level: 0, statement: `if ${generateExpressionScript(script)}` },
    ],
    endingLevelAdjustment: 1,
  })
}

function emitControlFlowForEach(collectionVarName, iteratorVarName) {
  return Promise.resolve({
    commands: [
      {
        level: 0,
        statement: `collection = @vars['${collectionVarName}']`,
      },
      {
        level: 0,
        statement: `collection.each do |item|`,
      },
      {
        level: 1,
        statement: `@vars['${iteratorVarName}'] = item`,
      },
    ],
  })
}

function emitControlFlowRepeatIf(script) {
  return Promise.resolve({
    commands: [
      {
        level: 0,
        statement: `break if !${generateExpressionScript(script)}`,
      },
      {
        level: -1,
        statement: `end`,
      },
    ],
  })
}

function emitControlFlowTimes(target) {
  const commands = [{ level: 0, statement: `${target}.times do` }]
  return Promise.resolve({ commands, endingLevelAdjustment: 1 })
}

function emitControlFlowWhile(script) {
  return Promise.resolve({
    commands: [
      { level: 0, statement: `while ${generateExpressionScript(script)} do` },
    ],
    endingLevelAdjustment: 1,
  })
}

async function emitDoubleClick(target) {
  const commands = [
    {
      level: 0,
      statement: `element = @driver.find_element(${await location.emit(
        target
      )})`,
    },
    { level: 0, statement: '@driver.action.double_click(element).perform' },
  ]
  return Promise.resolve({ commands })
}

async function emitDragAndDrop(dragged, dropped) {
  const commands = [
    {
      level: 0,
      statement: `dragged = @driver.find_element(${await location.emit(
        dragged
      )})`,
    },
    {
      level: 0,
      statement: `dropped = @driver.find_element(${await location.emit(
        dropped
      )})`,
    },
    {
      level: 0,
      statement: '@driver.action.drag_and_drop(dragged, dropped).perform',
    },
  ]
  return Promise.resolve({ commands })
}

async function emitEcho(message) {
  const _message = message.startsWith('@vars[') ? message : `'${message}'`
  return Promise.resolve(`puts(${_message})`)
}

async function emitEditContent(locator, content) {
  const commands = [
    {
      level: 0,
      statement: `element = @driver.find_element(${await location.emit(
        locator
      )})`,
    },
    {
      level: 0,
      statement: `@driver.execute_script("if(arguments[0].contentEditable === 'true') {arguments[0].innerText = '${content}'}", element)`,
    },
  ]
  return Promise.resolve({ commands })
}

async function emitExecuteScript(script, varName) {
  const scriptString = script.script.replace(/'/g, "\\'")
  const result = `@driver.execute_script('${scriptString}'${generateScriptArguments(
    script
  )})`
  return Promise.resolve(variableSetter(varName, result))
}

async function emitExecuteAsyncScript(script, varName) {
  const result = `@driver.execute_async_script("var callback = arguments[arguments.length - 1];${
    script.script
  }.then(callback).catch(callback);${generateScriptArguments(script)}")`
  return Promise.resolve(variableSetter(varName, result))
}

async function emitMouseDown(locator) {
  const commands = [
    {
      level: 0,
      statement: `element = @driver.find_element(${await location.emit(
        locator
      )})`,
    },
    {
      level: 0,
      statement:
        '@driver.action.move_to_element(element).click_and_hold.perform',
    },
  ]
  return Promise.resolve({ commands })
}

async function emitMouseMove(locator) {
  const commands = [
    {
      level: 0,
      statement: `element = @driver.find_element(${await location.emit(
        locator
      )})`,
    },
    { level: 0, statement: '@driver.action.move_to_element(element).perform' },
  ]
  return Promise.resolve({ commands })
}

async function emitMouseOut() {
  const commands = [
    {
      level: 0,
      statement: `element = @driver.find_element(By.CSS_SELECTOR, 'body')`,
    },
    {
      level: 0,
      statement: '@driver.action.move_to_element(element, 0, 0).perform',
    },
  ]
  return Promise.resolve({ commands })
}

async function emitMouseUp(locator) {
  const commands = [
    {
      level: 0,
      statement: `element = @driver.find_element(${await location.emit(
        locator
      )})`,
    },
    {
      level: 0,
      statement: '@driver.action.move_to_element(element).release.perform',
    },
  ]
  return Promise.resolve({ commands })
}

function emitOpen(target) {
  const url = /^(file|http|https):\/\//.test(target)
    ? `'${target}'`
    : `'${global.baseUrl}${target}'`
  return Promise.resolve(`@driver.get(${url})`)
}

async function emitPause(time) {
  const commands = [{ level: 0, statement: `sleep(${time})` }]
  return Promise.resolve({ commands })
}

async function emitRun(testName) {
  return Promise.resolve(`${exporter.parsers.sanitizeName(testName)}()`)
}

async function emitRunScript(script) {
  return Promise.resolve(
    `@driver.execute_script("${script.script}${generateScriptArguments(
      script
    )}")`
  )
}

async function emitSetWindowSize(size) {
  const [width, height] = size.split('x')
  return Promise.resolve(`@driver.manage.resize_to(${width}, ${height})`)
}

async function emitSelect(selectElement, option) {
  const commands = [
    {
      level: 0,
      statement: `dropdown = @driver.find_element(${await location.emit(
        selectElement
      )})`,
    },
    {
      level: 0,
      statement: `dropdown.find_element(${await selection.emit(option)}).click`,
    },
  ]
  return Promise.resolve({ commands })
}

async function emitSelectFrame(frameLocation) {
  if (frameLocation === 'relative=top' || frameLocation === 'relative=parent') {
    return Promise.resolve('@driver.switch_to.default_content')
  } else if (/^index=/.test(frameLocation)) {
    return Promise.resolve(
      `@driver.switch_to.frame(${Math.floor(frameLocation.split('index=')[1])})`
    )
  } else {
    return Promise.resolve({
      commands: [
        {
          level: 0,
          statement: `element = @driver.find_element(${await location.emit(
            frameLocation
          )})`,
        },
        { level: 0, statement: '@driver.switch_to.frame(element)' },
      ],
    })
  }
}

async function emitSelectWindow(windowLocation) {
  if (/^handle=/.test(windowLocation)) {
    return Promise.resolve(
      `@driver.switch_to.window(${windowLocation.split('handle=')[1]})`
    )
  } else if (/^name=/.test(windowLocation)) {
    return Promise.resolve(
      `@driver.switch_to.window('${windowLocation.split('name=')[1]}')`
    )
  } else if (/^win_ser_/.test(windowLocation)) {
    if (windowLocation === 'win_ser_local') {
      return Promise.resolve({
        commands: [
          {
            level: 0,
            statement: '@driver.switch_to.window(@driver.window_handles[0])',
          },
        ],
      })
    } else {
      const index = parseInt(windowLocation.substr('win_ser_'.length))
      return Promise.resolve({
        commands: [
          {
            level: 0,
            statement: `@driver.switch_to.window(@driver.window_handles[${index}])`,
          },
        ],
      })
    }
  } else {
    return Promise.reject(
      new Error('Can only emit `select window` using handles')
    )
  }
}

function generateSendKeysInput(value) {
  if (typeof value === 'object') {
    return value
      .map(s => {
        if (s.startsWith('@vars[')) {
          return s
        } else if (s.startsWith('Key[')) {
          const key = s.match(/\['(.*)'\]/)[1]
          return `:${key.toLowerCase()}`
        } else {
          return `'${s}'`
        }
      })
      .join(', ')
  } else {
    if (value.startsWith('@vars[')) {
      return value
    } else {
      return `'${value}'`
    }
  }
}

async function emitSendKeys(target, value) {
  return Promise.resolve(
    `@driver.find_element(${await location.emit(
      target
    )}).send_keys(${generateSendKeysInput(value)})`
  )
}

function emitSetSpeed() {
  return Promise.resolve(
    'print("`set speed` is a no-op in code export, use `pause` instead")'
  )
}

async function emitStore(value, varName) {
  return Promise.resolve(variableSetter(varName, `'${value}'`))
}

async function emitStoreAttribute(locator, varName) {
  const attributePos = locator.lastIndexOf('@')
  const elementLocator = locator.slice(0, attributePos)
  const attributeName = locator.slice(attributePos + 1)
  const commands = [
    {
      level: 0,
      statement: `attribute = @driver.find_element(${await location.emit(
        elementLocator
      )}).attribute('${attributeName}')`,
    },
    { level: 0, statement: `${variableSetter(varName, 'attribute')}` },
  ]
  return Promise.resolve({ commands })
}

async function emitStoreJson(json, varName) {
  return Promise.resolve(variableSetter(varName, `JSON.parse('${json}')`))
}

async function emitStoreText(locator, varName) {
  const result = `@driver.find_element(${await location.emit(locator)}).text`
  return Promise.resolve(variableSetter(varName, result))
}

async function emitStoreTitle(_, varName) {
  return Promise.resolve(variableSetter(varName, '@driver.title'))
}

async function emitStoreValue(locator, varName) {
  const result = `@driver.find_element(${await location.emit(
    locator
  )}).attribute('value')`
  return Promise.resolve(variableSetter(varName, result))
}

async function emitStoreWindowHandle(varName) {
  return Promise.resolve(variableSetter(varName, '@driver.window_handle'))
}

async function emitStoreXpathCount(locator, varName) {
  const result = `@driver.find_elements(${await location.emit(locator)}).length`
  return Promise.resolve(variableSetter(varName, result))
}

async function emitSubmit(_locator) {
  return Promise.resolve(
    `raise "'submit' is not a supported command in Selenium WebDriver. Please re-record the step in the IDE."`
  )
}

async function emitType(target, value) {
  return Promise.resolve(
    `@driver.find_element(${await location.emit(
      target
    )}).send_keys(${generateSendKeysInput(value)})`
  )
}

async function emitUncheck(locator) {
  const commands = [
    {
      level: 0,
      statement: `element = @driver.find_element(${await location.emit(
        locator
      )})`,
    },
    { level: 0, statement: 'element.click if element.selected?' },
  ]
  return Promise.resolve({ commands })
}

async function emitVerifyChecked(locator) {
  return Promise.resolve(
    `expect(@driver.find_element(${await location.emit(
      locator
    )}).selected?).to be_truthy`
  )
}

async function emitVerifyEditable(locator) {
  const commands = [
    {
      level: 0,
      statement: `element = @driver.find_element(${await location.emit(
        locator
      )})`,
    },
    { level: 0, statement: 'expect(element.enabled?).to be_truthy' },
  ]
  return Promise.resolve({ commands })
}

async function emitVerifyElementPresent(locator) {
  const commands = [
    {
      level: 0,
      statement: `elements = @driver.find_elements(${await location.emit(
        locator
      )})`,
    },
    { level: 0, statement: 'expect(elements.length).to be > 0' },
  ]
  return Promise.resolve({ commands })
}

async function emitVerifyElementNotPresent(locator) {
  const commands = [
    {
      level: 0,
      statement: `elements = @driver.find_elements(${await location.emit(
        locator
      )})`,
    },
    { level: 0, statement: 'expect(elements.length).to eq(0)' },
  ]
  return Promise.resolve({ commands })
}

async function emitVerifyNotChecked(locator) {
  return Promise.resolve(
    `expect(@driver.find_element(${await location.emit(
      locator
    )}).selected?).to be_falsey`
  )
}

async function emitVerifyNotEditable(locator) {
  const commands = [
    {
      level: 0,
      statement: `element = @driver.find_element(${await location.emit(
        locator
      )})`,
    },
    { level: 0, statement: 'expect(element.enabled?).to be_falsey' },
  ]
  return Promise.resolve({ commands })
}

async function emitVerifyNotSelectedValue(locator, expectedValue) {
  const commands = [
    {
      level: 0,
      statement: `value = @driver.find_element(${await location.emit(
        locator
      )}).attribute('value')`,
    },
    {
      level: 0,
      statement: `expect(value).not_to eq('${exporter.emit.text(
        expectedValue
      )}')`,
    },
  ]
  return Promise.resolve({ commands })
}

async function emitVerifyNotText(locator, text) {
  const commands = [
    {
      level: 0,
      statement: `text = @driver.find_element(${await location.emit(
        locator
      )}).text`,
    },
    {
      level: 0,
      statement: `expect(text).not_to eq('${exporter.emit.text(text)}')`,
    },
  ]
  return Promise.resolve({ commands })
}

async function emitVerifySelectedLabel(locator, labelValue) {
  const commands = [
    {
      level: 0,
      statement: `element = @driver.find_element(${await location.emit(
        locator
      )})`,
    },
    {
      level: 0,
      statement: `locator = "option[@value='" + element.attribute('value') + "']"`,
    },
    {
      level: 0,
      statement: 'selected_text = element.find_element(:xpath, locator).text',
    },
    { level: 0, statement: `expect(selected_text).to eq('${labelValue}')` },
  ]
  return Promise.resolve({
    commands,
  })
}

async function emitVerifyText(locator, text) {
  const commands = [
    {
      level: 0,
      statement: `expect(@driver.find_element(${await location.emit(
        locator
      )}).text).to eq('${exporter.emit.text(text)}')`,
    },
  ]
  return Promise.resolve({ commands })
}

async function emitVerifyValue(locator, value) {
  const commands = [
    {
      level: 0,
      statement: `value = @driver.find_element(${await location.emit(
        locator
      )}).attribute('value')`,
    },
    { level: 0, statement: `expect(value).to eq('${value}')` },
  ]
  return Promise.resolve({ commands })
}

async function emitVerifyTitle(title) {
  return Promise.resolve(`expect(@driver.title).to eq('${title}')`)
}

async function emitWaitForElementEditable(locator, timeout) {
  const commands = [
    {
      level: 0,
      statement: `Selenium::WebDriver::Wait.new(timeout: ${timeout /
        1000}).until { @driver.find_element(${await location.emit(
        locator
      )}).enabled? }`,
    },
  ]
  return Promise.resolve({ commands })
}

async function emitWaitForText(locator, text) {
  const timeout = 30000
  const commands = [
    {
      level: 0,
      statement: `Selenium::WebDriver::Wait.new(timeout: ${timeout /
        1000}).until { @driver.find_element(${await location.emit(
        locator
      )}).text == "${text}" }`,
    },
  ]
  return Promise.resolve({ commands })
}

function skip() {
  return Promise.resolve(undefined)
}

async function emitWaitForElementPresent(locator, timeout) {
  const commands = [
    {
      level: 0,
      statement: `Selenium::WebDriver::Wait.new(timeout: ${timeout /
        1000}).until { @driver.find_element(${await location.emit(locator)}) }`,
    },
  ]
  return Promise.resolve({ commands })
}

async function emitWaitForElementVisible(locator, timeout) {
  const commands = [
    {
      level: 0,
      statement: `Selenium::WebDriver::Wait.new(timeout: ${timeout /
        1000}).until { @driver.find_element(${await location.emit(
        locator
      )}).displayed? }`,
    },
  ]
  return Promise.resolve({
    commands,
  })
}

async function emitWaitForElementNotEditable(locator, timeout) {
  const commands = [
    {
      level: 0,
      statement: `Selenium::WebDriver::Wait.new(timeout: ${timeout /
        1000}).until { !@driver.find_element(${await location.emit(
        locator
      )}).enabled? }`,
    },
  ]
  return Promise.resolve({
    commands,
  })
}

async function emitWaitForElementNotPresent(locator, timeout) {
  const commands = [
    {
      level: 0,
      statement: `Selenium::WebDriver::Wait.new(timeout: ${timeout /
        1000}).until do`,
    },
    {
      level: 1,
      statement: 'begin',
    },
    {
      level: 2,
      statement: `!@driver.find_element(${await location.emit(locator)})`,
    },
    {
      level: 1,
      statement: 'rescue Selenium::WebDriver::Error::NoSuchElementError',
    },
    { level: 2, statement: 'true' },
    { level: 1, statement: 'end' },
    { level: 0, statement: 'end' },
  ]
  return Promise.resolve({
    commands,
  })
}

async function emitWaitForElementNotVisible(locator, timeout) {
  const commands = [
    {
      level: 0,
      statement: `Selenium::WebDriver::Wait.new(timeout: ${timeout /
        1000}).until { !@driver.find_element(${await location.emit(
        locator
      )}).displayed? }`,
    },
  ]
  return Promise.resolve({
    commands,
  })
}

export default {
  canEmit,
  emit,
  register,
  extras: { emitWaitForWindow },
}
