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

import {
  codeExport as exporter,
  ExportFlexCommandShape,
  PrebuildEmitter,
  ProcessedCommandEmitter,
  ScriptShape,
} from '@seleniumhq/side-code-export'
import { CommandShape } from '@seleniumhq/side-model'
import location from './location'
import selection from './selection'

export const emitters: Record<string, ProcessedCommandEmitter> = {
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
  webdriverChooseCancelOnVisibleConfirmation:
    emitChooseCancelOnNextConfirmation,
  webdriverChooseCancelOnVisiblePrompt: emitChooseCancelOnNextConfirmation,
  webdriverChooseOkOnVisibleConfirmation: emitChooseOkOnNextConfirmation,
  while: emitControlFlowWhile,
}

exporter.register.preprocessors(emitters)

function register(command: string, emitter: PrebuildEmitter) {
  exporter.register.emitter({ command, emitter, emitters })
}

function emit(command: CommandShape) {
  return exporter.emit.command(command, emitters[command.command], {
    variableLookup,
    emitNewWindowHandling,
  })
}

function variableLookup(varName: string) {
  return `vars["${varName}"]`
}

function variableSetter(varName: string, value: string) {
  return varName ? `vars["${varName}"] = ${value}` : ''
}

function emitWaitForWindow() {
  const generateMethodDeclaration = (name: string) => {
    return {
      body: `async function ${name}(timeout = 2) {`,
      terminatingKeyword: '}',
    }
  }
  const commands = [
    { level: 0, statement: 'await driver.sleep(timeout)' },
    { level: 0, statement: 'const handlesThen = vars["windowHandles"]' },
    {
      level: 0,
      statement: 'const handlesNow = await driver.getAllWindowHandles()',
    },
    { level: 0, statement: 'if (handlesNow.length > handlesThen.length) {' },
    {
      level: 1,
      statement:
        'return handlesNow.find(handle => (!handlesThen.includes(handle)))',
    },
    { level: 0, statement: '}' },
    {
      level: 0,
      statement: 'throw new Error("New window did not appear before timeout")',
    },
  ]
  return Promise.resolve({
    name: 'waitForWindow',
    commands,
    generateMethodDeclaration,
  })
}

async function emitNewWindowHandling(command: CommandShape, emittedCommand: ExportFlexCommandShape) {
  return Promise.resolve(
    `vars["windowHandles"] = await driver.getAllWindowHandles()\n${await emittedCommand}\nvars["${
      command.windowHandleName
    }"] = await waitForWindow(${command.windowTimeout})`
  )
}

function emitAssert(varName: string, value: string) {
  return Promise.resolve(`assert(vars["${varName}"].toString() == "${value}")`)
}

function emitAssertAlert(alertText: string) {
  return Promise.resolve(
    `assert(await driver.switchTo().alert().getText() == "${alertText}")`
  )
}

function emitAnswerOnNextPrompt(textToSend: string) {
  const commands = [
    { level: 0, statement: `{` },
    { level: 1, statement: 'const alert = await driver.switchTo().alert()' },
    { level: 1, statement: `await alert.sendKeys("${textToSend}")` },
    { level: 1, statement: 'await alert.accept()' },
    { level: 0, statement: `}` },
  ]
  return Promise.resolve({ commands })
}

async function emitCheck(locator: string) {
  const commands = [
    {
      level: 0,
      statement: `{`,
    },
    {
      level: 1,
      statement: `const element = await driver.findElement(${await location.emit(
        locator
      )})`,
    },
    {
      level: 1,
      statement: 'if (!(await element.isSelected())) await element.click()',
    },
    {
      level: 0,
      statement: `}`,
    },
  ]
  return Promise.resolve({ commands })
}

function emitChooseCancelOnNextConfirmation() {
  return Promise.resolve(`await driver.switchTo().alert().dismiss()`)
}

function emitChooseOkOnNextConfirmation() {
  return Promise.resolve(`await driver.switchTo().alert().accept()`)
}

async function emitClick(target: string) {
  return Promise.resolve(
    `await driver.findElement(${await location.emit(target)}).click()`
  )
}

async function emitClose() {
  return Promise.resolve(`await driver.close()`)
}

function generateExpressionScript(script: ScriptShape) {
  return `await driver.executeScript("return (${
    script.script
  })"${generateScriptArguments(script)})`
}

function generateScriptArguments(script: ScriptShape) {
  return `${script.argv.length ? ', ' : ''}${script.argv
    .map((varName) => `vars["${varName}"]`)
    .join(',')}`
}

function emitControlFlowDo() {
  return Promise.resolve({
    commands: [{ level: 0, statement: 'do {' }],
    endingLevelAdjustment: 1,
  })
}

function emitControlFlowElse() {
  return Promise.resolve({
    commands: [{ level: 0, statement: '} else {' }],
    startingLevelAdjustment: -1,
    endingLevelAdjustment: +1,
  })
}

function emitControlFlowElseIf(script: ScriptShape) {
  return Promise.resolve({
    commands: [
      {
        level: 0,
        statement: `} else if (!!${generateExpressionScript(script)}) {`,
      },
    ],
    startingLevelAdjustment: -1,
    endingLevelAdjustment: +1,
  })
}

function emitControlFlowEnd() {
  return Promise.resolve({
    commands: [{ level: 0, statement: `}` }],
    startingLevelAdjustment: -1,
  })
}

function emitControlFlowIf(script: ScriptShape) {
  return Promise.resolve({
    commands: [
      { level: 0, statement: `if (!!${generateExpressionScript(script)}) {` },
    ],
    endingLevelAdjustment: 1,
  })
}

function emitControlFlowForEach(collectionVarName: string, iteratorVarName: string) {
  return Promise.resolve({
    commands: [
      {
        level: 0,
        statement: `const collection = vars["${collectionVarName}"]`,
      },
      {
        level: 0,
        statement: `for (let i = 0; i < collection.length - 1; i++) {`,
      },
      {
        level: 1,
        statement: `vars["${iteratorVarName}"] = vars["${collectionVarName}"][i]`,
      },
    ],
  })
}

function emitControlFlowRepeatIf(script: ScriptShape) {
  return Promise.resolve({
    commands: [
      {
        level: 0,
        statement: `} while(!!${generateExpressionScript(script)})`,
      },
    ],
    startingLevelAdjustment: -1,
  })
}

function emitControlFlowTimes(target: string) {
  const commands = [
    {
      level: 0,
      statement: `const times = ${target}`,
    },
    {
      level: 0,
      statement: `for(let i = 0; i < times; i++) {`,
    },
  ]
  return Promise.resolve({ commands, endingLevelAdjustment: 1 })
}

function emitControlFlowWhile(script: ScriptShape) {
  return Promise.resolve({
    commands: [
      { level: 0, statement: `while(!!${generateExpressionScript(script)}) {` },
    ],
    endingLevelAdjustment: 1,
  })
}

async function emitDoubleClick(target: string) {
  const commands = [
    { level: 0, statement: `{` },
    {
      level: 1,
      statement: `const element = await driver.findElement(${await location.emit(
        target
      )})`,
    },
    {
      level: 1,
      statement:
        'await driver.actions({ bridge: true}).doubleClick(element).perform()',
    },
    { level: 0, statement: `}` },
  ]
  return Promise.resolve({ commands })
}

async function emitDragAndDrop(dragged: string, dropped: string) {
  const commands = [
    { level: 0, statement: `{` },
    {
      level: 1,
      statement: `const dragged = await driver.findElement(${await location.emit(
        dragged
      )})`,
    },
    {
      level: 1,
      statement: `const dropped = await driver.findElement(${await location.emit(
        dropped
      )})`,
    },
    {
      level: 1,
      statement:
        'await driver.actions({ bridge: true }).dragAndDrop(dragged, dropped).perform()',
    },
    { level: 0, statement: `}` },
  ]
  return Promise.resolve({ commands })
}

async function emitEcho(message: string) {
  const _message = message.startsWith('vars[') ? message : `"${message}"`
  return Promise.resolve(`console.log(${_message})`)
}

async function emitEditContent(locator: string, content: string) {
  const commands = [
    { level: 0, statement: `{` },
    {
      level: 1,
      statement: `const element = await driver.findElement(${await location.emit(
        locator
      )})`,
    },
    {
      level: 1,
      statement: `await driver.executeScript("if(arguments[0].contentEditable === 'true') {arguments[0].innerText = '${content}'}", element)`,
    },
    { level: 0, statement: `}` },
  ]
  return Promise.resolve({ commands })
}

async function emitExecuteScript(script: ScriptShape, varName: string) {
  const scriptString = script.script.replace(/`/g, '\\`')
  const result = `await driver.executeScript("${scriptString}"${generateScriptArguments(
    script
  )})`
  return Promise.resolve(variableSetter(varName, result))
}

async function emitExecuteAsyncScript(script: ScriptShape, varName: string) {
  const result = `await driver.executeAsyncScript("var callback = arguments[arguments.length - 1];${
    script.script
  }.then(callback).catch(callback);${generateScriptArguments(script)}")`
  return Promise.resolve(variableSetter(varName, result))
}

async function emitMouseDown(locator: string) {
  const commands = [
    { level: 0, statement: `{` },
    {
      level: 1,
      statement: `const element = await driver.findElement(${await location.emit(
        locator
      )})`,
    },
    {
      level: 1,
      statement:
        'await driver.actions({ bridge: true }).moveToElement(element).clickAndHold().perform()',
    },
    { level: 0, statement: `}` },
  ]
  return Promise.resolve({ commands })
}

async function emitMouseMove(locator: string) {
  const commands = [
    { level: 0, statement: `{` },
    {
      level: 1,
      statement: `const element = await driver.findElement(${await location.emit(
        locator
      )})`,
    },
    {
      level: 1,
      statement:
        'await driver.actions({ bridge: true }).moveToElement(element).perform()',
    },
    { level: 0, statement: `}` },
  ]
  return Promise.resolve({ commands })
}

async function emitMouseOut() {
  const commands = [
    { level: 0, statement: `{` },
    {
      level: 1,
      statement: `const element = await driver.findElement(By.CSS_SELECTOR, "body")`,
    },
    {
      level: 1,
      statement:
        'await driver.actions({ bridge: true }).moveToElement(element, 0, 0).perform()',
    },
    { level: 0, statement: `}` },
  ]
  return Promise.resolve({ commands })
}

async function emitMouseUp(locator: string) {
  const commands = [
    { level: 0, statement: `{` },
    {
      level: 1,
      statement: `const element = await driver.findElement(${await location.emit(
        locator
      )})`,
    },
    {
      level: 1,
      statement:
        'await driver.actions({ bridge: true }).moveToElement(element).release().perform()',
    },
    { level: 0, statement: `}` },
  ]
  return Promise.resolve({ commands })
}

function emitOpen(target: string) {
  const url = /^(file|http|https):\/\//.test(target)
    ? `"${target}"`
    : // @ts-expect-error globals yuck
    `"${global.baseUrl}${target}"`
  return Promise.resolve(`await driver.get(${url})`)
}

async function emitPause(time: string) {
  const commands = [{ level: 0, statement: `await driver.sleep(${time})` }]
  return Promise.resolve({ commands })
}

async function emitRun(testName: string) {
  return Promise.resolve(`${exporter.parsers.sanitizeName(testName)}()`)
}

async function emitRunScript(script: ScriptShape) {
  return Promise.resolve(
    `await driver.executeScript("${script.script}${generateScriptArguments(
      script
    )}")`
  )
}

async function emitSetWindowSize(size: string) {
  const [width, height] = size.split('x')
  return Promise.resolve(
    `await driver.manage().window().setRect({ width: ${width}, height: ${height} })`
  )
}

async function emitSelect(selectElement: string, option: string) {
  const commands = [
    { level: 0, statement: `{` },
    {
      level: 1,
      statement: `const dropdown = await driver.findElement(${await location.emit(
        selectElement
      )})`,
    },
    {
      level: 1,
      statement: `await dropdown.findElement(${await selection.emit(
        option
      )}).click()`,
    },
    { level: 0, statement: `}` },
  ]
  return Promise.resolve({ commands })
}

async function emitSelectFrame(frameLocation: string) {
  if (frameLocation === 'relative=top' || frameLocation === 'relative=parent') {
    return Promise.resolve('await driver.switchTo().defaultContent()')
  } else if (/^index=/.test(frameLocation)) {
    return Promise.resolve(
      `await driver.switchTo().frame(${Math.floor(
        Number(frameLocation.split('index=')?.[1])
      )})`
    )
  } else {
    return Promise.resolve({
      commands: [
        { level: 0, statement: `{` },
        {
          level: 0,
          statement: `const element = await driver.findElement(${await location.emit(
            frameLocation
          )})`,
        },
        { level: 0, statement: 'await driver.switchTo().frame(element)' },
        { level: 0, statement: `}` },
      ],
    })
  }
}

async function emitSelectWindow(windowLocation: string) {
  if (/^handle=/.test(windowLocation)) {
    return Promise.resolve(
      `await driver.switchTo().window(${windowLocation.split('handle=')[1]})`
    )
  } else if (/^name=/.test(windowLocation)) {
    return Promise.resolve(
      `await driver.switchTo().window("${windowLocation.split('name=')[1]}")`
    )
  } else if (/^win_ser_/.test(windowLocation)) {
    if (windowLocation === 'win_ser_local') {
      return Promise.resolve({
        commands: [
          {
            level: 0,
            statement:
              'await driver.switchTo().window(await driver.getAllWindowHandles()[0])',
          },
        ],
      })
    } else {
      const index = parseInt(windowLocation.substr('win_ser_'.length))
      return Promise.resolve({
        commands: [
          {
            level: 0,
            statement: `await driver.switchTo().window(await driver.getAllWindowHandles()[${index}])`,
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

function generateSendKeysInput(value: string | string[]) {
  if (typeof value === 'object') {
    return value
      .map((s) => {
        if (s.startsWith('vars[')) {
          return s
        } else if (s.startsWith('Key[')) {
          const key = s.match(/\['(.*)'\]/)?.[1]
          return `Key.${key}`
        } else {
          return `"${s}"`
        }
      })
      .join(', ')
  } else {
    if (value.startsWith('vars[')) {
      return value
    } else {
      return `"${value}"`
    }
  }
}

async function emitSendKeys(target: string, value: string) {
  return Promise.resolve(
    `await driver.findElement(${await location.emit(
      target
    )}).sendKeys(${generateSendKeysInput(value)})`
  )
}

function emitSetSpeed() {
  return Promise.resolve(
    'console.log("`set speed` is a no-op in code export, use `pause` instead")'
  )
}

async function emitStore(value: string, varName: string) {
  return Promise.resolve(variableSetter(varName, `"${value}"`))
}

async function emitStoreAttribute(locator: string, varName: string) {
  const attributePos = locator.lastIndexOf('@')
  const elementLocator = locator.slice(0, attributePos)
  const attributeName = locator.slice(attributePos + 1)
  const commands = [
    { level: 0, statement: `{` },
    {
      level: 1,
      statement: `const attribute = await driver.findElement(${await location.emit(
        elementLocator
      )}).getAttribute("${attributeName}")`,
    },
    { level: 1, statement: `${variableSetter(varName, 'attribute')}` },
    { level: 0, statement: `}` },
  ]
  return Promise.resolve({ commands })
}

async function emitStoreJson(json: string, varName: string) {
  return Promise.resolve(variableSetter(varName, `JSON.parse('${json}')`))
}

async function emitStoreText(locator: string, varName: string) {
  const result = `await driver.findElement(${await location.emit(
    locator
  )}).getText()`
  return Promise.resolve(variableSetter(varName, result))
}

async function emitStoreTitle(_: string, varName: string) {
  return Promise.resolve(variableSetter(varName, 'await driver.getTitle()'))
}

async function emitStoreValue(locator: string, varName: string) {
  const result = `await driver.findElement(${await location.emit(
    locator
  )}).getAttribute("value")`
  return Promise.resolve(variableSetter(varName, result))
}

async function emitStoreWindowHandle(varName: string) {
  return Promise.resolve(
    variableSetter(varName, 'await driver.getWindowHandle()')
  )
}

async function emitStoreXpathCount(locator: string, varName: string) {
  const result = `await driver.findElements(${await location.emit(
    locator
  )}).length`
  return Promise.resolve(variableSetter(varName, result))
}

async function emitSubmit(_locator: string) {
  return Promise.resolve(
    `raise Exception("\`submit\` is not a supported command in Selenium Webdriver. Please re-record the step in the IDE.")`
  )
}

async function emitType(target: string, value: string) {
  return Promise.resolve(
    `await driver.findElement(${await location.emit(
      target
    )}).sendKeys(${generateSendKeysInput(value)})`
  )
}

async function emitUncheck(locator: string) {
  const commands = [
    { level: 0, statement: `{` },
    {
      level: 1,
      statement: `const element = await driver.findElement(${await location.emit(
        locator
      )})`,
    },
    {
      level: 1,
      statement: 'if (await element.isSelected()) await element.click()',
    },
    { level: 0, statement: `}` },
  ]
  return Promise.resolve({ commands })
}

async function emitVerifyChecked(locator: string) {
  return Promise.resolve(
    `assert(await driver.findElement(${await location.emit(
      locator
    )}).isSelected())`
  )
}

async function emitVerifyEditable(locator: string) {
  const commands = [
    { level: 0, statement: `{` },
    {
      level: 1,
      statement: `const element = await driver.findElement(${await location.emit(
        locator
      )})`,
    },
    { level: 1, statement: 'assert(await element.isEnabled())' },
    { level: 0, statement: `}` },
  ]
  return Promise.resolve({ commands })
}

async function emitVerifyElementPresent(locator: string) {
  const commands = [
    { level: 0, statement: `{` },
    {
      level: 1,
      statement: `const elements = await driver.findElements(${await location.emit(
        locator
      )})`,
    },
    { level: 1, statement: 'assert(elements.length)' },
    { level: 0, statement: `}` },
  ]
  return Promise.resolve({ commands })
}

async function emitVerifyElementNotPresent(locator: string) {
  const commands = [
    { level: 0, statement: `{` },
    {
      level: 1,
      statement: `const elements = await driver.findElements(${await location.emit(
        locator
      )})`,
    },
    { level: 1, statement: 'assert(!elements.length)' },
    { level: 0, statement: `}` },
  ]
  return Promise.resolve({ commands })
}

async function emitVerifyNotChecked(locator: string) {
  return Promise.resolve(
    `assert(!await driver.findElement(${await location.emit(
      locator
    )}).isSelected())`
  )
}

async function emitVerifyNotEditable(locator: string) {
  const commands = [
    { level: 0, statement: `{` },
    {
      level: 1,
      statement: `const element = await driver.findElement(${await location.emit(
        locator
      )})`,
    },
    { level: 1, statement: 'assert(!await element.isEnabled())' },
    { level: 0, statement: `}` },
  ]
  return Promise.resolve({ commands })
}

async function emitVerifyNotSelectedValue(locator: string, expectedValue: string) {
  const commands = [
    { level: 0, statement: `{` },
    {
      level: 1,
      statement: `const value = await driver.findElement(${await location.emit(
        locator
      )}).getAttribute("value")`,
    },
    {
      level: 1,
      statement: `assert(value !== "${exporter.emit.text(expectedValue)}")`,
    },
    { level: 0, statement: `}` },
  ]
  return Promise.resolve({ commands })
}

async function emitVerifyNotText(locator: string, text: string) {
  const commands = [
    { level: 0, statement: `{` },
    {
      level: 1,
      statement: `const text = await driver.findElement(${await location.emit(
        locator
      )}).getText()`,
    },
    { level: 1, statement: `assert(text !== "${exporter.emit.text(text)}")` },
    { level: 0, statement: `}` },
  ]
  return Promise.resolve({ commands })
}

async function emitVerifySelectedLabel(locator: string, labelValue: string) {
  const commands = [
    { level: 0, statement: `{` },
    {
      level: 1,
      statement: `const element = await driver.findElement(${await location.emit(
        locator
      )})`,
    },
    {
      level: 1,
      statement:
        'const locator = `option[@value=\'${await element.getAttribute("value")}\']`',
    },
    {
      level: 1,
      statement:
        'const selectedText = await element.findElement(By.xpath(locator)).getText()',
    },
    { level: 1, statement: `assert(selectedText == "${labelValue}")` },
    { level: 0, statement: `}` },
  ]
  return Promise.resolve({
    commands,
  })
}

async function emitVerifyText(locator: string, text: string) {
  const commands = [
    {
      level: 0,
      statement: `assert(await driver.findElement(${await location.emit(
        locator
      )}).getText() == "${exporter.emit.text(text)}")`,
    },
  ]
  return Promise.resolve({ commands })
}

async function emitVerifyValue(locator: string, value: string) {
  const commands = [
    { level: 0, statement: `{` },
    {
      level: 1,
      statement: `const value = await driver.findElement(${await location.emit(
        locator
      )}).getAttribute("value")`,
    },
    { level: 1, statement: `assert(value == "${value}")` },
    { level: 0, statement: `}` },
  ]
  return Promise.resolve({ commands })
}

async function emitVerifyTitle(title: string) {
  return Promise.resolve(`assert(await driver.getTitle() == "${title}")`)
}

function skip() {
  return Promise.resolve('')
}

async function emitWaitForElementPresent(locator: string, timeout: number) {
  return Promise.resolve(
    `await driver.wait(until.elementLocated(${await location.emit(
      locator
    )}), ${Math.floor(timeout)})`
  )
}

async function emitWaitForElementNotPresent(locator: string, timeout: number) {
  return Promise.resolve(
    `await driver.wait(until.stalenessOf(await driver.findElement(${await location.emit(
      locator
    )})), ${Math.floor(timeout)})`
  )
}

async function emitWaitForElementVisible(locator: string, timeout: number) {
  return Promise.resolve(
    `await driver.wait(until.elementIsVisible(await driver.findElement(${await location.emit(
      locator
    )})), ${Math.floor(timeout)})`
  )
}

async function emitWaitForElementNotVisible(locator: string, timeout: number) {
  return Promise.resolve(
    `await driver.wait(until.elementIsNotVisible(await driver.findElement(${await location.emit(
      locator
    )})), ${Math.floor(timeout)})`
  )
}

async function emitWaitForElementEditable(locator: string, timeout: number) {
  return Promise.resolve(
    `await driver.wait(until.elementIsEnabled(await driver.findElement(${await location.emit(
      locator
    )})), ${Math.floor(timeout)})`
  )
}

async function emitWaitForElementNotEditable(locator: string, timeout: number) {
  return Promise.resolve(
    `await driver.wait(until.elementIsDisabled(await driver.findElement(${await location.emit(
      locator
    )})), ${Math.floor(timeout)})`
  )
}

async function emitWaitForText(locator: string, text: string) {
  const timeout = 30000
  return Promise.resolve(
    `await driver.wait(until.elementTextIs(await driver.findElement(${await location.emit(
      locator
    )}), '${text}'), ${Math.floor(timeout)})`
  )
}

export default {
  emit,
  emitters,
  extras: { emitNewWindowHandling, emitWaitForWindow },
  register,
}
