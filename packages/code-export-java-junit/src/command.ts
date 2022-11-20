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

import { CommandShape } from '@seleniumhq/side-model'
import {
  codeExport as exporter,
  ExportFlexCommandShape,
  PrebuildEmitter,
  ProcessedCommandEmitter,
  ScriptShape,
} from '@seleniumhq/side-code-export'
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
  assertSelectedValue: emitVerifySelectedValue,
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
  //storeJson: emitStoreJson,
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
  verifySelectedValue: emitVerifySelectedValue,
  verifyText: emitVerifyText,
  verifyTitle: emitVerifyTitle,
  verifyValue: emitVerifyValue,
  waitForElementEditable: emitWaitForElementEditable,
  waitForElementPresent: emitWaitForElementPresent,
  waitForElementVisible: emitWaitForElementVisible,
  waitForElementNotEditable: emitWaitForElementNotEditable,
  waitForElementNotPresent: emitWaitForElementNotPresent,
  waitForElementNotVisible: emitWaitForElementNotVisible,
  waitForText: emitWaitForText,
  webdriverAnswerOnVisiblePrompt: emitAnswerOnNextPrompt,
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
  return `vars.get("${varName}").toString()`
}

function variableSetter(varName: string, value: string) {
  return varName ? `vars.put("${varName}", ${value});` : ''
}

function emitWaitForWindow() {
  const generateMethodDeclaration = (name: string) => {
    return `public String ${name}(int timeout) {`
  }
  const commands = [
    { level: 0, statement: 'try {' },
    { level: 1, statement: 'Thread.sleep(timeout);' },
    { level: 0, statement: '} catch (InterruptedException e) {' },
    { level: 1, statement: 'e.printStackTrace();' },
    { level: 0, statement: '}' },
    { level: 0, statement: 'Set<String> whNow = driver.getWindowHandles();' },
    {
      level: 0,
      statement:
        'Set<String> whThen = (Set<String>) vars.get("window_handles");',
    },
    { level: 0, statement: 'if (whNow.size() > whThen.size()) {' },
    { level: 1, statement: 'whNow.removeAll(whThen);' },
    { level: 0, statement: '}' },
    { level: 0, statement: 'return whNow.iterator().next();' },
  ]
  return Promise.resolve({
    name: 'waitForWindow',
    commands,
    generateMethodDeclaration,
  })
}

async function emitNewWindowHandling(
  command: CommandShape,
  emittedCommand: ExportFlexCommandShape
) {
  return Promise.resolve(
    `vars.put("window_handles", driver.getWindowHandles());\n${await emittedCommand}\nvars.put("${
      command.windowHandleName
    }", waitForWindow(${command.windowTimeout}));`
  )
}

function emitAssert(varName: string, value: string) {
  return Promise.resolve(
    `assertEquals(vars.get("${varName}").toString(), "${value}");`
  )
}

function emitAssertAlert(alertText: string) {
  return Promise.resolve(
    `assertThat(driver.switchTo().alert().getText(), is("${alertText}"));`
  )
}

function emitAnswerOnNextPrompt(textToSend: string) {
  const commands = [
    { level: 0, statement: '{' },
    { level: 1, statement: 'Alert alert = driver.switchTo().alert();' },
    { level: 1, statement: `alert.sendKeys("${textToSend}")` },
    { level: 1, statement: 'alert.accept();' },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitCheck(locator: string) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `WebElement element = driver.findElement(${await location.emit(
        locator
      )});`,
    },
    { level: 1, statement: 'if (!element.isSelected()) {' },
    { level: 2, statement: 'element.click();' },
    { level: 1, statement: '}' },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

function emitChooseCancelOnNextConfirmation() {
  return Promise.resolve(`driver.switchTo().alert().dismiss();`)
}

function emitChooseOkOnNextConfirmation() {
  return Promise.resolve(`driver.switchTo().alert().accept();`)
}

async function emitClick(target: string) {
  return Promise.resolve(
    `driver.findElement(${await location.emit(target)}).click();`
  )
}

async function emitClose() {
  return Promise.resolve(`driver.close();`)
}

function generateExpressionScript(script: ScriptShape) {
  const scriptString = script.script.replace(/"/g, "'")
  return `(Boolean) js.executeScript("return (${scriptString})"${generateScriptArguments(
    script
  )})`
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
        statement: `} else if (${generateExpressionScript(script)}) {`,
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
      { level: 0, statement: `if (${generateExpressionScript(script)}) {` },
    ],
    endingLevelAdjustment: 1,
  })
}

function emitControlFlowForEach(
  collectionVarName: string,
  iteratorVarName: string
) {
  const collectionName = exporter.parsers.capitalize(collectionVarName)
  const iteratorName = exporter.parsers.capitalize(iteratorVarName)
  return Promise.resolve({
    commands: [
      {
        level: 0,
        statement: `ArrayList collection${collectionName} = (ArrayList) vars.get("${collectionVarName}");`,
      },
      {
        level: 0,
        statement: `for (int i${iteratorName} = 0; i < collection${collectionName}.size() - 1; i${iteratorName}++) {`,
      },
      {
        level: 1,
        statement: `vars.put("${iteratorVarName}", collection${collectionName}.get(i));`,
      },
    ],
  })
}

function emitControlFlowRepeatIf(script: ScriptShape) {
  return Promise.resolve({
    commands: [
      { level: 0, statement: `} while (${generateExpressionScript(script)});` },
    ],
    startingLevelAdjustment: -1,
  })
}

function emitControlFlowTimes(target: string) {
  const commands = [
    { level: 0, statement: `Integer times = ${target};` },
    { level: 0, statement: 'for(int i = 0; i < times; i++) {' },
  ]
  return Promise.resolve({ commands, endingLevelAdjustment: 1 })
}

function emitControlFlowWhile(script: ScriptShape) {
  return Promise.resolve({
    commands: [
      { level: 0, statement: `while (${generateExpressionScript(script)}) {` },
    ],
    endingLevelAdjustment: 1,
  })
}

async function emitDoubleClick(target: string) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `WebElement element = driver.findElement(${await location.emit(
        target
      )});`,
    },
    { level: 1, statement: 'Actions builder = new Actions(driver);' },
    { level: 1, statement: 'builder.doubleClick(element).perform();' },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitDragAndDrop(dragged: string, dropped: string) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `WebElement dragged = driver.findElement(${await location.emit(
        dragged
      )});`,
    },
    {
      level: 1,
      statement: `WebElement dropped = driver.findElement(${await location.emit(
        dropped
      )});`,
    },
    { level: 1, statement: 'Actions builder = new Actions(driver);' },
    { level: 1, statement: 'builder.dragAndDrop(dragged, dropped).perform();' },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitEcho(message: string) {
  const _message = message.startsWith('vars.get') ? message : `"${message}"`
  return Promise.resolve(`System.out.println(${_message});`)
}

async function emitEditContent(locator: string, content: string) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `WebElement element = driver.findElement(${await location.emit(
        locator
      )});`,
    },
    {
      level: 1,
      statement: `js.executeScript("if(arguments[0].contentEditable === 'true') {arguments[0].innerText = '${content}'}", element);`,
    },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitExecuteScript(script: ScriptShape, varName: string) {
  const result = `js.executeScript("${script.script}"${generateScriptArguments(
    script
  )})`
  return Promise.resolve(variableSetter(varName, result))
}

async function emitExecuteAsyncScript(script: ScriptShape, varName: string) {
  const result = `js.executeAsyncScript("var callback = arguments[arguments.length - 1];${
    script.script
  }.then(callback).catch(callback);${generateScriptArguments(script)}")`
  return Promise.resolve(variableSetter(varName, result))
}

function generateScriptArguments(script: ScriptShape) {
  return `${script.argv.length ? ', ' : ''}${script.argv
    .map((varName) => `vars.get("${varName}")`)
    .join(',')}`
}

async function emitMouseDown(locator: string) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `WebElement element = driver.findElement(${await location.emit(
        locator
      )});`,
    },
    { level: 1, statement: 'Actions builder = new Actions(driver);' },
    {
      level: 1,
      statement: 'builder.moveToElement(element).clickAndHold().perform();',
    },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitMouseMove(locator: string) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `WebElement element = driver.findElement(${await location.emit(
        locator
      )});`,
    },
    { level: 1, statement: 'Actions builder = new Actions(driver);' },
    { level: 1, statement: 'builder.moveToElement(element).perform();' },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitMouseOut() {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `WebElement element = driver.findElement(By.tagName("body"));`,
    },
    { level: 1, statement: 'Actions builder = new Actions(driver);' },
    { level: 1, statement: 'builder.moveToElement(element, 0, 0).perform();' },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitMouseUp(locator: string) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `WebElement element = driver.findElement(${await location.emit(
        locator
      )});`,
    },
    { level: 1, statement: 'Actions builder = new Actions(driver);' },
    {
      level: 1,
      statement: 'builder.moveToElement(element).release().perform();',
    },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

function emitOpen(target: string) {
  const url = /^(file|http|https):\/\//.test(target)
    ? `"${target}"`
    : // @ts-expect-error globals yuck
    `"${global.baseUrl}${target}"`
  return Promise.resolve(`driver.get(${url});`)
}

async function emitPause(time: string) {
  const commands = [
    { level: 0, statement: 'try {' },
    { level: 1, statement: `Thread.sleep(${time});` },
    { level: 0, statement: '} catch (InterruptedException e) {' },
    { level: 1, statement: 'e.printStackTrace();' },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitRun(testName: string) {
  return Promise.resolve(`${exporter.parsers.sanitizeName(testName)}();`)
}

async function emitRunScript(script: ScriptShape) {
  return Promise.resolve(
    `js.executeScript("${script.script}${generateScriptArguments(script)}");`
  )
}

async function emitSetWindowSize(size: string) {
  const [width, height] = size.split('x')
  return Promise.resolve(
    `driver.manage().window().setSize(new Dimension(${width}, ${height}));`
  )
}

async function emitSelect(selectElement: string, option: string) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `WebElement dropdown = driver.findElement(${await location.emit(
        selectElement
      )});`,
    },
    {
      level: 1,
      statement: `dropdown.findElement(${await selection.emit(
        option
      )}).click();`,
    },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitSelectFrame(frameLocation: string) {
  if (frameLocation === 'relative=top' || frameLocation === 'relative=parent') {
    return Promise.resolve('driver.switchTo().defaultContent();')
  } else if (/^index=/.test(frameLocation)) {
    return Promise.resolve(
      `driver.switchTo().frame(${Math.floor(
        Number(frameLocation.split('index=')[1] as string)
      )});`
    )
  } else {
    return Promise.resolve({
      commands: [
        { level: 0, statement: '{' },
        {
          level: 1,
          statement: `WebElement element = driver.findElement(${await location.emit(
            frameLocation
          )});`,
        },
        { level: 1, statement: 'driver.switchTo().frame(element);' },
        { level: 0, statement: '}' },
      ],
    })
  }
}

async function emitSelectWindow(windowLocation: string) {
  if (/^handle=/.test(windowLocation)) {
    return Promise.resolve(
      `driver.switchTo().window(${windowLocation.split('handle=')[1]});`
    )
  } else if (/^name=/.test(windowLocation)) {
    return Promise.resolve(
      `driver.switchTo().window("${windowLocation.split('name=')[1]}");`
    )
  } else if (/^win_ser_/.test(windowLocation)) {
    if (windowLocation === 'win_ser_local') {
      return Promise.resolve({
        commands: [
          { level: 0, statement: '{' },
          {
            level: 1,
            statement:
              'ArrayList<String> handles = new ArrayList<String>(driver.getWindowHandles());',
          },
          { level: 1, statement: 'driver.switchTo().window(handles.get(0));' },
          { level: 0, statement: '}' },
        ],
      })
    } else {
      const index = parseInt(windowLocation.substr('win_ser_'.length))
      return Promise.resolve({
        commands: [
          { level: 0, statement: '{' },
          {
            level: 1,
            statement:
              'ArrayList<String> handles = new ArrayList<String>(driver.getWindowHandles());',
          },
          {
            level: 1,
            statement: `driver.switchTo().window(handles.get(${index}));`,
          },
          { level: 0, statement: '}' },
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
        if (s.startsWith('vars.get')) {
          return s
        } else if (s.startsWith('Key[')) {
          const key = s.match(/\['(.*)'\]/)?.[1] as string
          return `Keys.${key}`
        } else {
          return `"${s}"`
        }
      })
      .join(', ')
  } else {
    if (value.startsWith('vars.get')) {
      return value
    } else {
      return `"${value}"`
    }
  }
}

async function emitSendKeys(target: string, value: string) {
  return Promise.resolve(
    `driver.findElement(${await location.emit(
      target
    )}).sendKeys(${generateSendKeysInput(value)});`
  )
}

function emitSetSpeed() {
  return Promise.resolve(
    `System.out.println("\`set speed\` is a no-op in code export, use \`pause\` instead");`
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
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `WebElement element = driver.findElement(${await location.emit(
        elementLocator
      )});`,
    },
    {
      level: 1,
      statement: `String attribute = element.getAttribute("${attributeName}");`,
    },
    { level: 1, statement: `${variableSetter(varName, 'attribute')}` },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

//async function emitStoreJson(_json, _varName) {
//  // TODO
//  return Promise.resolve('')
//}

async function emitStoreText(locator: string, varName: string) {
  const result = `driver.findElement(${await location.emit(locator)}).getText()`
  return Promise.resolve(variableSetter(varName, result))
}

async function emitStoreTitle(_: string, varName: string) {
  return Promise.resolve(variableSetter(varName, 'driver.getTitle()'))
}

async function emitStoreValue(locator: string, varName: string) {
  const result = `driver.findElement(${await location.emit(
    locator
  )}).getAttribute("value")`
  return Promise.resolve(variableSetter(varName, result))
}

async function emitStoreWindowHandle(varName: string) {
  return Promise.resolve(variableSetter(varName, 'driver.getWindowHandle()'))
}

async function emitStoreXpathCount(locator: string, varName: string) {
  const result = `driver.findElements(${await location.emit(locator)}).size()`
  return Promise.resolve(variableSetter(varName, result))
}

async function emitSubmit(_locator: string) {
  return Promise.resolve(
    `throw new Error("\`submit\` is not a supported command in Selenium WebDriver. Please re-record the step in the IDE.");`
  )
}

async function emitType(target: string, value: string) {
  return Promise.resolve(
    `driver.findElement(${await location.emit(
      target
    )}).sendKeys(${generateSendKeysInput(value)});`
  )
}

async function emitUncheck(locator: string) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `WebElement element = driver.findElement(${await location.emit(
        locator
      )});`,
    },
    { level: 1, statement: 'if (element.isSelected()) {' },
    { level: 2, statement: 'element.click();' },
    { level: 1, statement: '}' },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitVerifyChecked(locator: string) {
  return Promise.resolve(
    `assertTrue(driver.findElement(${await location.emit(
      locator
    )}).isSelected());`
  )
}

async function emitVerifyEditable(locator: string) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `WebElement element = driver.findElement(${await location.emit(
        locator
      )});`,
    },
    {
      level: 1,
      statement:
        'Boolean isEditable = element.isEnabled() && element.getAttribute("readonly") == null;',
    },
    { level: 1, statement: 'assertTrue(isEditable);' },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitVerifyElementPresent(locator: string) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `List<WebElement> elements = driver.findElements(${await location.emit(
        locator
      )});`,
    },
    { level: 1, statement: 'assert(elements.size() > 0);' },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitVerifyElementNotPresent(locator: string) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `List<WebElement> elements = driver.findElements(${await location.emit(
        locator
      )});`,
    },
    { level: 1, statement: 'assert(elements.size() == 0);' },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitVerifyNotChecked(locator: string) {
  return Promise.resolve(
    `assertFalse(driver.findElement(${await location.emit(
      locator
    )}).isSelected());`
  )
}

async function emitVerifyNotEditable(locator: string) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `WebElement element = driver.findElement(${await location.emit(
        locator
      )});`,
    },
    {
      level: 1,
      statement:
        'Boolean isEditable = element.isEnabled() && element.getAttribute("readonly") == null;',
    },
    { level: 1, statement: 'assertFalse(isEditable);' },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitVerifyNotSelectedValue(
  locator: string,
  expectedValue: string
) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `String value = driver.findElement(${await location.emit(
        locator
      )}).getAttribute("value");`,
    },
    {
      level: 1,
      statement: `assertThat(value, is(not("${exporter.emit.text(
        expectedValue
      )}")));`,
    },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitVerifyNotText(locator: string, text: string) {
  const result = `driver.findElement(${await location.emit(locator)}).getText()`
  return Promise.resolve(
    `assertThat(${result}, is(not("${exporter.emit.text(text)}")));`
  )
}

async function emitVerifySelectedLabel(locator: string, labelValue: string) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `WebElement element = driver.findElement(${await location.emit(
        locator
      )});`,
    },
    { level: 1, statement: 'String value = element.getAttribute("value");' },
    {
      level: 1,
      statement: `String locator = String.format("option[@value='%s']", value);`,
    },
    {
      level: 1,
      statement:
        'String selectedText = element.findElement(By.xpath(locator)).getText();',
    },
    { level: 1, statement: `assertThat(selectedText, is("${labelValue}"));` },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({
    commands,
  })
}

async function emitVerifySelectedValue(locator: string, value: string) {
  return emitVerifyValue(locator, value)
}

async function emitVerifyText(locator: string, text: string) {
  return Promise.resolve(
    `assertThat(driver.findElement(${await location.emit(
      locator
    )}).getText(), is("${exporter.emit.text(text)}"));`
  )
}

async function emitVerifyValue(locator: string, value: string) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `String value = driver.findElement(${await location.emit(
        locator
      )}).getAttribute("value");`,
    },
    { level: 1, statement: `assertThat(value, is("${value}"));` },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitVerifyTitle(title: string) {
  return Promise.resolve(`assertThat(driver.getTitle(), is("${title}"));`)
}

async function emitWaitForElementEditable(locator: string, timeout: number) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `WebDriverWait wait = new WebDriverWait(driver, ${Math.floor(
        timeout / 1000
      )});`,
    },
    {
      level: 1,
      statement: `wait.until(ExpectedConditions.elementToBeClickable(${await location.emit(
        locator
      )}));`,
    },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitWaitForText(locator: string, text: string) {
  const timeout = 30000
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `WebDriverWait wait = new WebDriverWait(driver, ${Math.floor(
        timeout / 1000
      )});`,
    },
    {
      level: 1,
      statement: `wait.until(ExpectedConditions.textToBe(${await location.emit(
        locator
      )}, "${text}"));`,
    },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

function skip() {
  return Promise.resolve('')
}

async function emitWaitForElementPresent(locator: string, timeout: number) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `WebDriverWait wait = new WebDriverWait(driver, ${Math.floor(
        timeout / 1000
      )});`,
    },
    {
      level: 1,
      statement: `wait.until(ExpectedConditions.presenceOfElementLocated(${await location.emit(
        locator
      )}));`,
    },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitWaitForElementVisible(locator: string, timeout: number) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `WebDriverWait wait = new WebDriverWait(driver, ${Math.floor(
        timeout / 1000
      )});`,
    },
    {
      level: 1,
      statement: `wait.until(ExpectedConditions.visibilityOfElementLocated(${await location.emit(
        locator
      )}));`,
    },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({
    commands,
  })
}

async function emitWaitForElementNotEditable(locator: string, timeout: number) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `WebDriverWait wait = new WebDriverWait(driver, ${Math.floor(
        timeout / 1000
      )});`,
    },
    {
      level: 1,
      statement: `wait.until(ExpectedConditions.not(ExpectedConditions.elementToBeClickable(${await location.emit(
        locator
      )})));`,
    },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({
    commands,
  })
}

async function emitWaitForElementNotPresent(locator: string, timeout: number) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `WebDriverWait wait = new WebDriverWait(driver, ${Math.floor(
        timeout / 1000
      )});`,
    },
    {
      level: 1,
      statement: `WebElement element = driver.findElement(${await location.emit(
        locator
      )});`,
    },
    {
      level: 1,
      statement: 'wait.until(ExpectedConditions.stalenessOf(element));',
    },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({
    commands,
  })
}

async function emitWaitForElementNotVisible(locator: string, timeout: number) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `WebDriverWait wait = new WebDriverWait(driver, ${Math.floor(
        timeout / 1000
      )});`,
    },
    {
      level: 1,
      statement: `wait.until(ExpectedConditions.invisibilityOfElementLocated(${await location.emit(
        locator
      )}));`,
    },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({
    commands,
  })
}

export default {
  emit,
  emitters,
  register,
  extras: { emitNewWindowHandling, emitWaitForWindow },
}
