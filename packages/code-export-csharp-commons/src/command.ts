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

import { codeExport as exporter } from '@seleniumhq/side-code-export'
import { ExportFlexCommandShape, ProcessedCommandEmitter } from '@seleniumhq/side-code-export/dist/code-export/emit'
import { ScriptShape } from '@seleniumhq/side-code-export/src/code-export/preprocessor'
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
  webDriverAnswerOnVisiblePrompt: emitAnswerOnNextPrompt,
  webDriverChooseCancelOnVisibleConfirmation:
    emitChooseCancelOnNextConfirmation,
  webDriverChooseCancelOnVisiblePrompt: emitChooseCancelOnNextConfirmation,
  webDriverChooseOkOnVisibleConfirmation: emitChooseOkOnNextConfirmation,
  while: emitControlFlowWhile,
}

exporter.register.preprocessors(emitters)

function register(command: any, emitter: any) {
  exporter.register.emitter({ command, emitter, emitters })
}

function emit(command: CommandShape) {
  return exporter.emit.command(command, emitters[command.command], {
    variableLookup,
    emitNewWindowHandling,
  })
}

function variableLookup(varName: string) {
  return `vars["${varName}"].ToString()`
}

function variableSetter(varName: string, value: string) {
  return varName ? `vars["${varName}"] = ${value};` : ''
}

function emitWaitForWindow() {
  const generateMethodDeclaration = (name: string) => {
    return `public string ${name}(int timeout) {`
  }
  const commands = [
    { level: 0, statement: 'try {' },
    { level: 1, statement: 'Thread.Sleep(timeout);' },
    { level: 0, statement: '} catch(Exception e) {' },
    { level: 1, statement: 'Console.WriteLine("{0} Exception caught.", e);' },
    { level: 0, statement: '}' },
    {
      level: 0,
      statement:
        'var whNow = ((IReadOnlyCollection<object>)driver.WindowHandles).ToList();',
    },
    {
      level: 0,
      statement:
        'var whThen = ((IReadOnlyCollection<object>)vars["WindowHandles"]).ToList();',
    },
    { level: 0, statement: 'if (whNow.Count > whThen.Count) {' },
    { level: 1, statement: 'return whNow.Except(whThen).First().ToString();' },
    { level: 0, statement: '} else {' },
    { level: 1, statement: 'return whNow.First().ToString();' },
    { level: 0, statement: '}' },
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
    `vars["WindowHandles"] = driver.WindowHandles;\n${await emittedCommand}\nvars["${
      command.windowHandleName
    }"] = waitForWindow(${command.windowTimeout});`
  )
}

function emitAssert(varName: string, value: string) {
  const _value =
    value === 'true' || value === 'false'
      ? exporter.parsers.capitalize(value)
      : value
  return Promise.resolve(
    `Assert.That(vars["${varName}"].ToString(), Is.EqualTo("${_value}"));`
  )
}

function emitAssertAlert(alertText: any) {
  return Promise.resolve(
    `Assert.That(driver.SwitchTo().Alert().Text, Is.EqualTo("${alertText}"));`
  )
}

function emitAnswerOnNextPrompt(textToSend: any) {
  const commands = [
    { level: 0, statement: '{' },
    { level: 1, statement: 'var Alert = driver.SwitchTo().Alert();' },
    { level: 1, statement: `Alert.SendKeys("${textToSend}")` },
    { level: 1, statement: 'Alert.Accept();' },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitCheck(locator: any) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `var element = driver.FindElement(${await location.emit(
        locator
      )});`,
    },
    { level: 1, statement: 'if (!element.Selected) {' },
    { level: 2, statement: 'element.Click();' },
    { level: 1, statement: '}' },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

function emitChooseCancelOnNextConfirmation() {
  return Promise.resolve(`driver.SwitchTo().Alert().Dismiss();`)
}

function emitChooseOkOnNextConfirmation() {
  return Promise.resolve(`driver.SwitchTo().Alert().Accept();`)
}

async function emitClick(target: any) {
  return Promise.resolve(
    `driver.FindElement(${await location.emit(target)}).Click();`
  )
}

async function emitClose() {
  return Promise.resolve(`driver.Close();`)
}

function generateExpressionScript(script: ScriptShape) {
  const scriptString = script.script.replace(/"/g, "'")
  return `(Boolean) js.ExecuteScript("return (${scriptString})"${generateScriptArguments(
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

function emitControlFlowIf(script: any) {
  return Promise.resolve({
    commands: [
      { level: 0, statement: `if (${generateExpressionScript(script)}) {` },
    ],
    endingLevelAdjustment: 1,
  })
}

function emitControlFlowForEach(collectionVarName: string, iteratorVarName: string) {
  return Promise.resolve({
    commands: [
      {
        level: 0,
        statement: `var ${collectionVarName}Enum = ((IReadOnlyCollection<object>)vars["${collectionVarName}"]).ToList().GetEnumerator();`,
      },
      {
        level: 0,
        statement: `while (${collectionVarName}Enum.MoveNext())`,
      },
      {
        level: 0,
        statement: `{`,
      },
      {
        level: 1,
        statement: `vars["${iteratorVarName}"] = ${collectionVarName}Enum.Current;`,
      },
    ],
  })
}

function emitControlFlowRepeatIf(script: any) {
  return Promise.resolve({
    commands: [
      { level: 0, statement: `} while (${generateExpressionScript(script)});` },
    ],
    startingLevelAdjustment: -1,
  })
}

function emitControlFlowTimes(target: any) {
  const commands = [
    { level: 0, statement: `var times = ${target};` },
    { level: 0, statement: 'for(int i = 0; i < times; i++) {' },
  ]
  return Promise.resolve({ commands, endingLevelAdjustment: 1 })
}

function emitControlFlowWhile(script: any) {
  return Promise.resolve({
    commands: [
      { level: 0, statement: `while (${generateExpressionScript(script)}) {` },
    ],
    endingLevelAdjustment: 1,
  })
}

async function emitDoubleClick(target: any) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `var element = driver.FindElement(${await location.emit(
        target
      )});`,
    },
    { level: 1, statement: 'Actions builder = new Actions(driver);' },
    { level: 1, statement: 'builder.DoubleClick(element).Perform();' },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitDragAndDrop(dragged: any, dropped: any) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `var dragged = driver.FindElement(${await location.emit(
        dragged
      )});`,
    },
    {
      level: 1,
      statement: `var dropped = driver.FindElement(${await location.emit(
        dropped
      )});`,
    },
    { level: 1, statement: 'Actions builder = new Actions(driver);' },
    { level: 1, statement: 'builder.DragAndDrop(dragged, dropped).Perform();' },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitEcho(message: string) {
  const _message = message.startsWith('vars[') ? message : `"${message}"`
  return Promise.resolve(`Console.WriteLine(${_message});`)
}

async function emitEditContent(locator: any, content: any) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `var element = driver.FindElement(${await location.emit(
        locator
      )});`,
    },
    {
      level: 1,
      statement: `js.ExecuteScript("if(arguments[0].contentEditable === 'true') {arguments[0].innerText = '${content}'}", element);`,
    },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitExecuteScript(script: ScriptShape, varName: string) {
  const result = `js.ExecuteScript("${script.script}"${generateScriptArguments(
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
    .map((varName: string) => `vars["${varName}"]`)
    .join(',')}`
}

async function emitMouseDown(locator: any) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `var element = driver.FindElement(${await location.emit(
        locator
      )});`,
    },
    { level: 1, statement: 'Actions builder = new Actions(driver);' },
    {
      level: 1,
      statement: 'builder.MoveToElement(element).ClickAndHold().Perform();',
    },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitMouseMove(locator: any) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `var element = driver.FindElement(${await location.emit(
        locator
      )});`,
    },
    { level: 1, statement: 'Actions builder = new Actions(driver);' },
    { level: 1, statement: 'builder.MoveToElement(element).Perform();' },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitMouseOut() {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `var element = driver.FindElement(By.tagName("body"));`,
    },
    { level: 1, statement: 'Actions builder = new Actions(driver);' },
    { level: 1, statement: 'builder.MoveToElement(element, 0, 0).Perform();' },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitMouseUp(locator: any) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `var element = driver.FindElement(${await location.emit(
        locator
      )});`,
    },
    { level: 1, statement: 'Actions builder = new Actions(driver);' },
    {
      level: 1,
      statement: 'builder.MoveToElement(element).Release().Perform();',
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
  return Promise.resolve(`driver.Navigate().GoToUrl(${url});`)
}

async function emitPause(time: any) {
  const commands = [
    { level: 0, statement: 'try {' },
    { level: 1, statement: `Thread.Sleep(${time});` },
    { level: 0, statement: '} catch (Exception e) {' },
    { level: 1, statement: 'Console.WriteLine("{0} Exception caught.", e);' },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitRun(testName: string) {
  return Promise.resolve(`${exporter.parsers.sanitizeName(testName)}();`)
}

async function emitRunScript(script: ScriptShape) {
  return Promise.resolve(
    `js.ExecuteScript("${script.script}${generateScriptArguments(script)}");`
  )
}

async function emitSetWindowSize(size: {
  split: (arg0: string) => [any, any]
}) {
  const [width, height] = size.split('x')
  return Promise.resolve(
    `driver.Manage().Window.Size = new System.Drawing.Size(${width}, ${height});`
  )
}

async function emitSelect(selectElement: any, option: any) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `var dropdown = driver.FindElement(${await location.emit(
        selectElement
      )});`,
    },
    {
      level: 1,
      statement: `dropdown.FindElement(${await selection.emit(
        option
      )}).Click();`,
    },
    { level: 0, statement: '}' },
  ]
  return { commands }
}

async function emitSelectFrame(frameLocation: string) {
  if (frameLocation === 'relative=top' || frameLocation === 'relative=parent') {
    return Promise.resolve('driver.SwitchTo().DefaultContent();')
  } else if (/^index=/.test(frameLocation)) {
    return Promise.resolve(
      `driver.SwitchTo().Frame(${Math.floor(
        Number(frameLocation.split('index=')[1])
      )});`
    )
  } else {
    return Promise.resolve({
      commands: [
        { level: 0, statement: '{' },
        {
          level: 1,
          statement: `var element = driver.FindElement(${await location.emit(
            frameLocation
          )});`,
        },
        { level: 1, statement: 'driver.SwitchTo().Frame(element);' },
        { level: 0, statement: '}' },
      ],
    })
  }
}

async function emitSelectWindow(windowLocation: string) {
  if (/^handle=/.test(windowLocation)) {
    return Promise.resolve(
      `driver.SwitchTo().Window(${windowLocation.split('handle=')[1]});`
    )
  } else if (/^name=/.test(windowLocation)) {
    return Promise.resolve(
      `driver.SwitchTo().Window("${windowLocation.split('name=')[1]}");`
    )
  } else if (/^win_ser_/.test(windowLocation)) {
    if (windowLocation === 'win_ser_local') {
      return Promise.resolve({
        commands: [
          { level: 0, statement: '{' },
          {
            level: 1,
            statement:
              'ArrayList<string> handles = new ArrayList<string>(driver.WindowHandles());',
          },
          { level: 1, statement: 'driver.SwitchTo().Window(handles[0]);' },
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
              'ArrayList<string> handles = new ArrayList<string>(driver.WindowHandles);',
          },
          {
            level: 1,
            statement: `driver.SwitchTo().Window(handles[${index}]);`,
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
  if (Array.isArray(value)) {
    return value
      .map((s) => {
        if (s.startsWith('vars[')) {
          return s
        } else if (s.startsWith('Key[')) {
          const key = (s.match(/\['(.*)'\]/) as RegExpMatchArray)[1]
          return `Keys.${exporter.parsers.capitalize(key.toLowerCase())}`
        } else {
          return `"${s}"`
        }
      })
      .join(' + ')
  } else {
    if (value.startsWith('vars[')) {
      return value
    } else {
      return `"${value}"`
    }
  }
}

async function emitSendKeys(target: any, value: any) {
  return Promise.resolve(
    `driver.FindElement(${await location.emit(
      target
    )}).SendKeys(${generateSendKeysInput(value)});`
  )
}

function emitSetSpeed() {
  return Promise.resolve(
    `Console.WriteLine("\`set speed\` is a no-op in code export, use \`pause\` instead");`
  )
}

async function emitStore(value: any, varName: string) {
  return Promise.resolve(variableSetter(varName, `"${value}"`))
}

async function emitStoreAttribute(locator: string | string[], varName: string) {
  const attributePos = locator.lastIndexOf('@')
  const elementLocator = locator.slice(0, attributePos) as string
  const attributeName = locator.slice(attributePos + 1)
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `var element = driver.FindElement(${await location.emit(
        elementLocator
      )});`,
    },
    {
      level: 1,
      statement: `string attribute = element.GetAttribute("${attributeName}");`,
    },
    { level: 1, statement: `${variableSetter(varName, 'attribute')}` },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitStoreJson(_json: any, _varName: string) {
  return Promise.resolve(
    'throw new System.Exception("The `storeJson` command is not yet implemented for this language.");'
  )
}

async function emitStoreText(locator: any, varName: string) {
  const result = `driver.FindElement(${await location.emit(locator)}).Text`
  return Promise.resolve(variableSetter(varName, result))
}

async function emitStoreTitle(_: any, varName: string) {
  return Promise.resolve(variableSetter(varName, 'driver.Title'))
}

async function emitStoreValue(locator: any, varName: string) {
  const result = `driver.FindElement(${await location.emit(
    locator
  )}).GetAttribute("value")`
  return Promise.resolve(variableSetter(varName, result))
}

async function emitStoreWindowHandle(varName: string) {
  return Promise.resolve(variableSetter(varName, 'driver.CurrentWindowHandle'))
}

async function emitStoreXpathCount(locator: any, varName: string) {
  const result = `driver.FindElements(${await location.emit(locator)}).Count`
  return Promise.resolve(variableSetter(varName, result))
}

async function emitSubmit(_locator: any) {
  return Promise.resolve(
    `throw new System.Exception("\`submit\` is not a supported command in Selenium WebDriver. Please re-record the step in the IDE.");`
  )
}

async function emitType(target: any, value: any) {
  return Promise.resolve(
    `driver.FindElement(${await location.emit(
      target
    )}).SendKeys(${generateSendKeysInput(value)});`
  )
}

async function emitUncheck(locator: any) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `var element = driver.FindElement(${await location.emit(
        locator
      )});`,
    },
    { level: 1, statement: 'if (element.Selected) {' },
    { level: 2, statement: 'element.Click();' },
    { level: 1, statement: '}' },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitVerifyChecked(locator: any) {
  return Promise.resolve(
    `Assert.True(driver.FindElement(${await location.emit(locator)}).Selected);`
  )
}

async function emitVerifyEditable(locator: any) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `var element = driver.FindElement(${await location.emit(
        locator
      )});`,
    },
    {
      level: 1,
      statement:
        'Boolean isEditable = element.Enabled && element.GetAttribute("readonly") == null;',
    },
    { level: 1, statement: 'Assert.True(isEditable);' },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitVerifyElementPresent(locator: any) {
  const commands = [
    {
      level: 0,
      statement: `var elements = driver.FindElements(${await location.emit(
        locator
      )});`,
    },
    { level: 0, statement: 'Assert.True(elements.Count > 0);' },
  ]
  return Promise.resolve({ commands })
}

async function emitVerifyElementNotPresent(locator: any) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `var elements = driver.FindElements(${await location.emit(
        locator
      )});`,
    },
    { level: 1, statement: 'Assert.True(elements.Count == 0);' },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitVerifyNotChecked(locator: any) {
  return Promise.resolve(
    `Assert.False(driver.FindElement(${await location.emit(
      locator
    )}).Selected);`
  )
}

async function emitVerifyNotEditable(locator: any) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `var element = driver.FindElement(${await location.emit(
        locator
      )});`,
    },
    {
      level: 1,
      statement:
        'Boolean isEditable = element.Enabled && element.GetAttribute("readonly") == null;',
    },
    { level: 1, statement: 'Assert.False(isEditable);' },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitVerifyNotSelectedValue(locator: any, expectedValue: string) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `string value = driver.FindElement(${await location.emit(
        locator
      )}).GetAttribute("value");`,
    },
    {
      level: 1,
      statement: `Assert.That(value, Is.Not.EqualTo("${exporter.emit.text(
        expectedValue
      )}"));`,
    },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitVerifyNotText(locator: any, text: string) {
  const result = `driver.FindElement(${await location.emit(locator)}).Text`
  return Promise.resolve(
    `Assert.That(${result}, Is.Not.EqualTo("${exporter.emit.text(text)}"));`
  )
}

async function emitVerifySelectedLabel(locator: any, labelValue: any) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `var element = driver.FindElement(${await location.emit(
        locator
      )});`,
    },
    { level: 1, statement: 'string value = element.GetAttribute("value");' },
    {
      level: 1,
      statement: `string locator = string.Format("option[@value='%s']", value);`,
    },
    {
      level: 1,
      statement:
        'string selectedText = element.FindElement(By.XPath(locator)).Text;',
    },
    {
      level: 1,
      statement: `Assert.That(selectedText, Is.EqualTo("${labelValue}"));`,
    },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({
    commands,
  })
}

async function emitVerifySelectedValue(locator: any, value: any) {
  return emitVerifyValue(locator, value)
}

async function emitVerifyText(locator: any, text: string) {
  return Promise.resolve(
    `Assert.That(driver.FindElement(${await location.emit(
      locator
    )}).Text, Is.EqualTo("${exporter.emit.text(text)}"));`
  )
}

async function emitVerifyValue(locator: any, value: any) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `string value = driver.FindElement(${await location.emit(
        locator
      )}).GetAttribute("value");`,
    },
    { level: 1, statement: `Assert.That(value, Is.EqualTo("${value}"));` },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitVerifyTitle(title: any) {
  return Promise.resolve(`Assert.That(driver.Title, Is.EqualTo("${title}"));`)
}

async function emitWaitForElementEditable(locator: any, timeout: number) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `WebDriverWait wait = new WebDriverWait(driver, System.TimeSpan.FromSeconds(${Math.floor(
        timeout / 1000
      )}));`,
    },
    {
      level: 1,
      statement: `wait.Until(driver => driver.FindElement(${await location.emit(
        locator
      )}).Enabled);`,
    },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitWaitForText(locator: any, text: any) {
  const timeout = 30000
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `WebDriverWait wait = new WebDriverWait(driver, System.TimeSpan.FromSeconds(${Math.floor(
        timeout / 1000
      )}));`,
    },
    {
      level: 1,
      statement: `wait.Until(driver => driver.FindElement(${await location.emit(
        locator
      )}).Text == "${text}");`,
    },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

function skip() {
  return Promise.resolve('')
}

async function emitWaitForElementPresent(locator: any, timeout: number) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `WebDriverWait wait = new WebDriverWait(driver, System.TimeSpan.FromSeconds(${Math.floor(
        timeout / 1000
      )}));`,
    },
    {
      level: 1,
      statement: `wait.Until(driver => driver.FindElements(${await location.emit(
        locator
      )}).Count > 0);`,
    },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitWaitForElementVisible(locator: any, timeout: number) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `WebDriverWait wait = new WebDriverWait(driver, System.TimeSpan.FromSeconds(${Math.floor(
        timeout / 1000
      )}));`,
    },
    {
      level: 1,
      statement: `wait.Until(driver => driver.FindElement(${await location.emit(
        locator
      )}).Displayed);`,
    },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({
    commands,
  })
}

async function emitWaitForElementNotEditable(locator: any, timeout: number) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `WebDriverWait wait = new WebDriverWait(driver, System.TimeSpan.FromSeconds(${Math.floor(
        timeout / 1000
      )}));`,
    },
    {
      level: 1,
      statement: `wait.Until(driver => !driver.FindElement(${await location.emit(
        locator
      )}).Enabled);`,
    },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({
    commands,
  })
}

async function emitWaitForElementNotPresent(locator: any, timeout: number) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `WebDriverWait wait = new WebDriverWait(driver, System.TimeSpan.FromSeconds(${Math.floor(
        timeout / 1000
      )}));`,
    },
    {
      level: 1,
      statement: `wait.Until(driver => driver.FindElements(${await location.emit(
        locator
      )}).Count == 0);`,
    },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({
    commands,
  })
}

async function emitWaitForElementNotVisible(locator: any, timeout: number) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `WebDriverWait wait = new WebDriverWait(driver, System.TimeSpan.FromSeconds(${Math.floor(
        timeout / 1000
      )}));`,
    },
    {
      level: 1,
      statement: `wait.Until(driver => !driver.FindElement(${await location.emit(
        locator
      )}).Displayed);`,
    },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({
    commands,
  })
}

export default {
  emitters,
  variableLookup,
  variableSetter,
  emit,
  register,
  extras: { emitWaitForWindow, emitNewWindowHandling },
}
