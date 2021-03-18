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
  return `vars.["${varName}"].ToString()`
}

function variableSetter(varName, value) {
  return varName ? `vars.add("${varName}", ${value})` : ''
}

function emitWaitForWindow() {
  const generateMethodDeclaration = name => {
    return `let ${name} timeout = {`
  }
  const commands = [
    { level: 0, statement: 'sleep timeout'},
    { level: 0, statement: '(fun whNow whThen ->'},
    { level: 5, statement: 'if whNow.Count > whThen.Count then whNow.Except(whThen).First().ToString() else whNow.First().ToString()'},
    { level: 0, statement: ') (browser.WindowHandles.ToList()) (vars.["window_handles"].ToList())'},
  ]
  return Promise.resolve({
    name: 'waitForWindow',
    commands,
    generateMethodDeclaration,
  })
}

async function emitNewWindowHandling(command, emittedCommand) {
  return Promise.resolve(
    `vars.add("window_handles", browser.WindowHandles)\n${await emittedCommand}\nvars.add("${
      command.windowHandleName
    }", waitForWindow(${command.windowTimeout}))`
  )
}

function emitAssert(varName, value) {
  return Promise.resolve(
    `vars.["${varName}"].ToString() === "${value}"`
  )
}

function emitAssertAlert(alertText) {
  return Promise.resolve(
    `alert() == "${alertText}"`
  )
}

function emitAnswerOnNextPrompt(textToSend) {
  const commands = [
    { level: 0, statement: `alert() << "${textToSend}"` },
    { level: 0, statement: 'acceptAlert()' },
  ]
  return Promise.resolve({ commands })
}

async function emitCheck(locator) {
  const commands = [
    { level: 0, statement: `check ${await location.emit(locator)}`}
  ]
  return Promise.resolve({ commands })
}

function emitChooseCancelOnNextConfirmation() {
  return Promise.resolve(`dismissAlert()`)
}

function emitChooseOkOnNextConfirmation() {
  return Promise.resolve(`acceptAlert()`)
}

async function emitClick(target) {
  return Promise.resolve(
    `click ${await location.emit(target)}`
  )
}

async function emitClose() {
  return Promise.resolve(`quit()`)
}

function generateExpressionScript(script) {
  const scriptString = script.script.replace(/"/g, "'")
  return `(browser :?> IJavaScriptExecutor).ExecuteScript("return (${scriptString})"${generateScriptArguments(
    script
  )})`
}

function emitControlFlowDo() {
  return Promise.resolve({
    commands: [{ level: 0, statement: 'do' }],
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
        statement: `elif ${generateExpressionScript(script)} then`,
      },
    ],
    startingLevelAdjustment: -1,
    endingLevelAdjustment: +1,
  })
}

function emitControlFlowEnd() {
  return Promise.resolve({
    commands: [{ level: 0, statement: `` }],
    startingLevelAdjustment: -1,
  })
}

function emitControlFlowIf(script) {
  return Promise.resolve({
    commands: [
      { level: 0, statement: `if ${generateExpressionScript(script)} then` },
    ],
    endingLevelAdjustment: 1,
  })
}

function emitControlFlowForEach(collectionVarName, iteratorVarName) {
  return Promise.resolve({
    commands: [
      {
        level: 0,
        statement: `let ${collectionVarName}Enum = vars.["${collectionVarName}"].ToList().GetEnumerator()`,
      },
      {
        level: 0,
        statement: `while (${collectionVarName}Enum.MoveNext()) do`,
      },
      {
        level: 1,
        statement: `vars["${iteratorVarName}"] = ${collectionVarName}Enum.Current`,
      },
    ],
  })
}

function emitControlFlowRepeatIf(script) {
  return Promise.resolve({
    commands: [
      { level: 0, statement: `while (${generateExpressionScript(script)}) do ignore None` },
    ],
    startingLevelAdjustment: -1,
  })
}

function emitControlFlowTimes(target) {
  const commands = [
    { level: 0, statement: `for i = 1 to ${target} do` },
  ]
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
    { level: 0, statement: `doubleClick ${await location.emit(target)}`,},
  ]
  return Promise.resolve({ commands })
}

async function emitDragAndDrop(dragged, dropped) {
  const commands = [
    { level: 0, statement: `${await location.emit(dragged)} ---> ${await location.emit(dropped)}` },
  ]
  return Promise.resolve({ commands })
}

async function emitEcho(message) {
  const _message = message.startsWith('vars.[') ? message : `"${message}"`
  return Promise.resolve(`printfn ${_message}`)
}

async function emitEditContent(locator, content) {
  const commands = [
    {
      level: 0,
      statement: `(browser :?> IJavaScriptExecutor).ExecuteScript("if(arguments[0].contentEditable === 'true') {arguments[0].innerText = '${content}'}", (element ${await location.emit(
        locator
      )}))`,
    },
  ]
  return Promise.resolve({ commands })
}

async function emitExecuteScript(script, varName) {
  const result = `(browser :?> IJavaScriptExecutor).ExecuteScript("${script.script}"${generateScriptArguments(
    script
  )})`
  return Promise.resolve(variableSetter(varName, result))
}

async function emitExecuteAsyncScript(script, varName) {
  const result = `(browser :?> IJavaScriptExecutor).ExecuteAsyncScript("var callback = arguments[arguments.length - 1];${
    script.script
  }.then(callback).catch(callback);${generateScriptArguments(script)}")`
  return Promise.resolve(variableSetter(varName, result))
}

function generateScriptArguments(script) {
  return `${script.argv.length ? ', ' : ''}${script.argv
    .map(varName => `vars.["${varName}"]`)
    .join(',')}`
}

async function emitMouseDown(locator) {
  const commands = [
    { level: 0, statement: `Actions(browser)`},
    { level: 0,
      statement: `|> (fun actions -> actions.MoveToElement(element ${await location.emit(
        locator
        )}).ClickAndHold().Perform())`},
  ]
  return Promise.resolve({ commands })
}

async function emitMouseMove(locator) {
  const commands = [
    { level: 0, statement: `hover ${await location.emit(locator)}` },
  ]
  return Promise.resolve({ commands })
}

async function emitMouseOut() {
  const commands = [
    { level: 0, statement: `Actions(browser)`},
    { level: 0,
      statement: `|> (fun actions -> actions.MoveToElement((element ${await location.emit(
        locator
        )}),0, 0)).ClickAndHold().Perform())`},
  ]
  return Promise.resolve({ commands })
}

async function emitMouseUp(locator) {
  const commands = [
    { level: 0,
      statement: `|> (fun actions -> actions.MoveToElement(element ${await location.emit(
        locator
        )})).Release().Perform())`},
  ]
  return Promise.resolve({ commands })
}

function emitOpen(target) {
  const url = /^(file|http|https):\/\//.test(target)
    ? `"${target}"`
    : `"${global.baseUrl}${target}"`
  return Promise.resolve(`url ${url}`)
}

async function emitPause(time) {
  const commands = [
    { level: 1, statement: `sleep ${time}` },
  ]
  return Promise.resolve({ commands })
}

//TODO 
async function emitRun(testName) {
  return Promise.resolve(`${exporter.parsers.sanitizeName(testName)}()`)
}

async function emitRunScript(script) {
  return Promise.resolve(
    `(browser :?> IJavaScriptExecutor).ExecuteScript("${script.script}${generateScriptArguments(script)}")`
  )
}

async function emitSetWindowSize(size) {
  const [width, height] = size.split('x')
  return Promise.resolve(
    `resize (${width}, ${height})`
  )
}

async function emitSelect(selectElement, option) {
  const commands = [
    { level: 0, statement: `element ${await location.emit(selectElement)}` },
    { level: 0, statement: `|> elementWithin ${await selection.emit(option)}`},
    { level: 0, statement: '|> click'},
  ]
  return Promise.resolve({ commands })
}

async function emitSelectFrame(frameLocation) {
  if (frameLocation === 'relative=top' || frameLocation === 'relative=parent') {
    return Promise.resolve('browser.SwitchTo().DefaultContent() |> ignore')
  } else if (/^index=/.test(frameLocation)) {
    return Promise.resolve(
      `browser.SwitchTo().Frame(${Math.floor(
        frameLocation.split('index=')[1]
      )}) |> ignore`
    )
  } else {
    return Promise.resolve({
      commands: [
        { level: 0, 
          statement: `browser.SwitchTo().Frame(element ${await location.emit(
            frameLocation
          )}) |> ignore`},
      ],
    })
  }
}

async function emitSelectWindow(windowLocation) {
  if (/^handle=/.test(windowLocation)) {
    return Promise.resolve(
      `browser.SwitchTo().Window(${windowLocation.split('handle=')[1]}) |> ignore`
    )
  } else if (/^name=/.test(windowLocation)) {
    return Promise.resolve(
      `browser.SwitchTo().Window("${windowLocation.split('name=')[1]}") |> ignore`
    )
  } else if (/^win_ser_/.test(windowLocation)) {
    if (windowLocation === 'win_ser_local') {
      return Promise.resolve({
        commands: [
          {level: 0, statement: `browser.WindowHandles.Item(0) |> (fun handle -> browser.SwitchTo().Window(handle)) |> ignore`}
        ],
      })
    } else {
      const index = parseInt(windowLocation.substr('win_ser_'.length))
      return Promise.resolve({
        commands: [
          { level: 0, statement: `browser.WindowHandles.Item(${index}) |> (fun handle -> browser.SwitchTo().Window(handle)) |> ignore` },
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
        if (s.startsWith('vars.get')) {
          return s
        } else if (s.startsWith('Key[')) {
          const key = s.match(/\['(.*)'\]/)[1]
          return `Keys.${exporter.parsers.capitalize(key.toLowerCase())}`
        } else {
          return `"${s}"`
        }
      })
      .join(' + ')
  } else {
    if (value.startsWith('vars.get')) {
      return value
    } else {
      return `"${value}"`
    }
  }
}

async function emitSendKeys(target, value) {
  return Promise.resolve(
    `${await location.emit(target)} << ${generateSendKeysInput(value)}`
  )
}

function emitSetSpeed() {
  return Promise.resolve(
    `printfn "\`set speed\` is a no-op in code export, use \`pause\` instead"`
  )
}

async function emitStore(value, varName) {
  return Promise.resolve(variableSetter(varName, `"${value}"`))
}

async function emitStoreAttribute(locator, varName) {
  const attributePos = locator.lastIndexOf('@')
  const elementLocator = locator.slice(0, attributePos)
  const attributeName = locator.slice(attributePos + 1)
  const commands = [
    {
      level: 0,
      statement: `(element ${await location.emit(
        elementLocator)}).GetAttribute("${attributeName}")`
    },
    { level: 0, statement: `|> (fun attribute -> (${variableSetter(varName, 'attribute')})` },
  ]
  return Promise.resolve({ commands })
}

//async function emitStoreJson(_json, _varName) {
//  // TODO
//  return Promise.resolve('')
//}

async function emitStoreText(locator, varName) {
  const result = `read ${await location.emit(locator)}`
  return Promise.resolve(variableSetter(varName, result))
}

async function emitStoreTitle(_, varName) {
  return Promise.resolve(variableSetter(varName, 'title ()'))
}

async function emitStoreValue(locator, varName) {
  const result = `(element ${await location.emit(locator)}).getAttribute("value")`
  return Promise.resolve(variableSetter(varName, result))
}

async function emitStoreWindowHandle(varName) {
  return Promise.resolve(variableSetter(varName, 'browser.WindowHandles'))
}

async function emitStoreXpathCount(locator, varName) {
  const result = `(elements ${await location.emit(locator)}).Length`
  return Promise.resolve(variableSetter(varName, result))
}

async function emitSubmit(_locator) {
  return Promise.resolve(
    `failWith "\`submit\` is not a supported command in Selenium WebDriver. Please re-record the step in the IDE."`
  )
}

async function emitType(target, value) {
  return Promise.resolve(
    `${await location.emit(target)} << ${generateSendKeysInput(value)});`
  )
}

async function emitUncheck(locator) {
  const commands = [
    { level: 0, statement: `uncheck ${await location.emit(locator)}`}
  ]
  return Promise.resolve({ commands })
}

async function emitVerifyChecked(locator) {
  return Promise.resolve(
    `selected ${await location.emit(locator)}`
  )
}

async function emitVerifyEditable(locator) {
  const commands = [
    { level: 0, 
      statement: `element ${await location.emit(
        locator
      )} |> (fun elem -> (elem.Enabled = true && elem.GetAttribute("readonly") = null) === true)`}
  ]
  return Promise.resolve({ commands })
}

async function emitVerifyElementPresent(locator) {
  const commands = [
    { level: 0, statement: `assert((elements ${await location.emit(locator)}).Length > 0)` },
  ]
  return Promise.resolve({ commands })
}

async function emitVerifyElementNotPresent(locator) {
  const commands = [
    { level: 0, statement: `count ${await location.emit(locator)} 0` },
  ]
  return Promise.resolve({ commands })
}

async function emitVerifyNotChecked(locator) {
  return Promise.resolve(
    `deselected ${await location.emit(locator)}`
  )
}

async function emitVerifyNotEditable(locator) {
  const commands = [
    { level: 0, 
      statement: `element ${await location.emit(
        locator
      )} |> (fun elem -> (elem.Enabled = true && elem.GetAttribute("readonly") = null) === false)`}
  ]
  return Promise.resolve({ commands })
}

async function emitVerifyNotSelectedValue(locator, expectedValue) {
  const commands = [
    { level: 0, 
      statement: `notContains (element ${await location.emit(locator)}.GetAttribute("value")) ${exporter.emit.text(
        expectedValue
      )}`},
  ]
  return Promise.resolve({ commands })
}

async function emitVerifyNotText(locator, text) {
  return Promise.resolve(
    `${await location.emit(locator)} != "${exporter.emit.text(text)}"`
  )
}

async function emitVerifySelectedLabel(locator, labelValue) {
  const commands = [
    { level: 0, statement: `(element ${await location.emit(locator)}).GetAttribute("value")` },
    { level: 0, statement: `|> (fun value -> "option[@value='" + value + "']")`},
    { level: 0, statement: `|> (fun locator -> locator == ${labelValue})`},
  ]
  return Promise.resolve({
    commands,
  })
}

async function emitVerifySelectedValue(locator, value) {
  return emitVerifyValue(locator, value)
}

async function emitVerifyText(locator, text) {
  return Promise.resolve(
    `${await location.emit(locator)} == "${exporter.emit.text(text)}"`
  )
}

async function emitVerifyValue(locator, value) {
  const commands = [
    { level: 0, statement: `(element ${await location.emit(locator)}).GetAttribute("value") === ${value}` },
  ]
  return Promise.resolve({ commands })
}

async function emitVerifyTitle(title) {
  return Promise.resolve(`title () === "${title}"`)
}

async function emitWaitForElementEditable(locator, timeout) {
  const commands = [
    { level: 0, statement: `waitFor (fun () -> (element ${await location.emit(locator)}).Enabled)` },
  ]
  return Promise.resolve({ commands })
}

async function emitWaitForText(locator, text) {
  const commands = [
    { level: 0, statement: `waitFor (fun () -> ${await location.emit(locator)} == "${text}")` },
  ]
  return Promise.resolve({ commands })
}

function skip() {
  return Promise.resolve('')
}

async function emitWaitForElementPresent(locator, timeout) {
  const commands = [
    { level: 0, statement: `waitFor (fun () -> (elements ${await location.emit(
      locator)}).Length > 0)`},
  ]
  return Promise.resolve({ commands })
}

async function emitWaitForElementVisible(locator, timeout) {
  const commands = [
    { level: 0, statement: `waitFor (fun () -> (element ${await location.emit(
      locator)}).Displayed)`},
  ]
  return Promise.resolve({
    commands,
  })
}

async function emitWaitForElementNotEditable(locator, timeout) {
  const commands = [
    { level: 0, statement: `waitFor (fun () -> not (element ${await location.emit(locator)}).Enabled)` },
  ]
  return Promise.resolve({
    commands,
  })
}

async function emitWaitForElementNotPresent(locator, timeout) {
  const commands = [
    { level: 0, statement: `waitFor (fun () -> (elements ${await location.emit(
      locator
    )}).Length = 0)`}
  ]
  return Promise.resolve({
    commands,
  })
}

async function emitWaitForElementNotVisible(locator, timeout) {
  const commands = [
    { level: 0, statement: `waitFor (fun () -> not (element ${await location.emit(locator)}).Displayed)` },
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
