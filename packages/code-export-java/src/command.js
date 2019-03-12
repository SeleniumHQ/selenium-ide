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

import exporter from '../../code-export-utils/src'
import location from './location'

export const emitters = {
  //addSelection: emitSelect,
  //answerOnNextPrompt: skip,
  assert: emitAssert,
  //assertAlert: emitAssertAlertAndAccept,
  //assertChecked: emitVerifyChecked,
  //assertConfirmation: emitAssertAlert,
  //assertEditable: emitVerifyEditable,
  //assertElementPresent: emitVerifyElementPresent,
  //assertElementNotPresent: emitVerifyElementNotPresent,
  //assertNotChecked: emitVerifyNotChecked,
  //assertNotEditable: emitVerifyNotEditable,
  //assertNotSelectedValue: emitVerifyNotSelectedValue,
  //assertNotText: emitVerifyNotText,
  //assertPrompt: emitAssertAlert,
  //assertSelectedLabel: emitVerifySelectedLabel,
  //assertSelectedValue: emitVerifySelectedValue,
  //assertValue: emitVerifyValue,
  assertText: emitVerifyText,
  //assertTitle: emitVerifyTitle,
  check: emitCheck,
  //chooseCancelOnNextConfirmation: skip,
  //chooseCancelOnNextPrompt: skip,
  //chooseOkOnNextConfirmation: skip,
  click: emitClick,
  clickAt: emitClick,
  //close: emitClose,
  //debugger: emitDebugger,
  //do: emitControlFlowDo,
  doubleClick: emitDoubleClick,
  doubleClickAt: emitDoubleClick,
  dragAndDropToObject: emitDragAndDrop,
  //echo: emitEcho,
  //editContent: emitEditContent,
  //else: emitControlFlowElse,
  //elseIf: emitControlFlowElseIf,
  //end: emitControlFlowEnd,
  executeScript: emitExecuteScript,
  //executeAsyncScript: emitExecuteAsyncScript,
  //if: emitControlFlowIf,
  //mouseDown: emitMouseDown,
  //mouseDownAt: emitMouseDown,
  //mouseMove: emitMouseMove,
  //mouseMoveAt: emitMouseMove,
  //mouseOver: emitMouseMove,
  //mouseOut: emitMouseOut,
  //mouseUp: emitMouseUp,
  //mouseUpAt: emitMouseUp,
  open: emitOpen,
  //pause: emitPause,
  //removeSelection: emitSelect,
  //repeatIf: emitControlFlowRepeatIf,
  //run: emitRun,
  //runScript: emitRunScript,
  //select: emitSelect,
  //selectFrame: emitSelectFrame,
  //selectWindow: emitSelectWindow,
  sendKeys: emitSendKeys,
  //setSpeed: emitSetSpeed,
  setWindowSize: emitSetWindowSize,
  //store: emitStore,
  //storeAttribute: emitStoreAttribute,
  //storeText: emitStoreText,
  //storeTitle: emitStoreTitle,
  //storeValue: emitStoreValue,
  //storeWindowHandle: emitStoreWindowHandle,
  //storeXpathCount: emitStoreXpathCount,
  //submit: emitSubmit,
  //times: emitControlFlowTimes,
  type: emitType,
  uncheck: emitUncheck,
  //verify: emitAssert,
  //verifyChecked: emitVerifyChecked,
  //verifyEditable: emitVerifyEditable,
  //verifyElementPresent: emitVerifyElementPresent,
  //verifyElementNotPresent: emitVerifyElementNotPresent,
  //verifyNotChecked: emitVerifyNotChecked,
  //verifyNotEditable: emitVerifyNotEditable,
  //verifyNotSelectedValue: emitVerifyNotSelectedValue,
  //verifyNotText: emitVerifyNotText,
  //verifySelectedLabel: emitVerifySelectedLabel,
  //verifySelectedValue: emitVerifySelectedValue,
  //verifyText: emitVerifyText,
  //verifyTitle: emitVerifyTitle,
  //verifyValue: emitVerifyValue,
  //waitForElementEditable: emitWaitForElementEditable,
  //waitForElementPresent: emitWaitForElementPresent,
  //waitForElementVisible: emitWaitForElementVisible,
  //waitForElementNotEditable: emitWaitForElementNotEditable,
  //waitForElementNotPresent: emitWaitForElementNotPresent,
  //waitForElementNotVisible: emitWaitForElementNotVisible,
  //webdriverAnswerOnVisiblePrompt: emitAnswerOnNextPrompt,
  //webdriverChooseCancelOnVisibleConfirmation: emitChooseCancelOnNextConfirmation,
  //webdriverChooseCancelOnVisiblePrompt: emitChooseCancelOnNextConfirmation,
  //webdriverChooseOkOnVisibleConfirmation: emitChooseOkOnNextConfirmation,
  //while: emitControlFlowWhile,
}

exporter.preprocessors.register(emitters)

export function register(command, emitter) {
  emitters[command] = emitter
}

export function emit(command) {
  return exporter.command.emit(
    command,
    emitters[command.command],
    variableLookup
  )
}

function variableLookup(varName) {
  return `vars.get("${varName}").toString()`
}

// TODO: add support for executeScript opt. args
function generateScript(script, isExpression = false) {
  return `driver.executeScript("${
    isExpression ? `return (${script})` : script
  }");`
}

function emitAssert(varName, value) {
  return Promise.resolve(
    `assertEquals(vars.get("${varName}").toString(), ${value});`
  )
}

async function emitCheck(locator) {
  return Promise.resolve(
    `{
        WebElement element = driver.findElement(${await location.emit(
          locator
        )});
        if (!element.isSelected()) {
          element.click();
        }
      }`
  )
}

async function emitClick(target) {
  return Promise.resolve(
    `driver.findElement(${await location.emit(target)}).click();`
  )
}

async function emitDoubleClick(target) {
  return Promise.resolve(
    `{
        WebElement element = driver.findElement(${await location.emit(target)});
        Actions builder = new Actions(driver);
        builder.doubleClick(element).perform();
      }`
  )
}

async function emitDragAndDrop(dragged, dropped) {
  return Promise.resolve(
    `{
        WebElement dragged = driver.findElement(${await location.emit(
          dragged
        )});
        WebElement dropped = driver.findElement(${await location.emit(
          dropped
        )});
        Actions builder = new Actions(driver);
        builder.dragAndDrop(dragged, dropped).perform();
      }`
  )
}

async function emitExecuteScript(script, varName) {
  return Promise.resolve(
    (varName ? `vars.push("${varName}") = ` : '') + generateScript(script)
  )
}

function emitOpen(target) {
  const url = /^(file|http|https):\/\//.test(target)
    ? `"${target}"`
    : `"${global.baseUrl}${target}"`
  return Promise.resolve(`driver.get(${url});`)
}

async function emitSetWindowSize(size) {
  const [width, height] = size.split('x')
  return Promise.resolve(
    `driver.manage().window().setSize(new Dimension(${width}, ${height}));`
  )
}

async function emitType(target, value) {
  return Promise.resolve(
    `driver.findElement(${await location.emit(target)}).sendKeys("${value}");`
  )
}

//async function emitSelect(selectElement, option) {
//  return Promise.resolve(`{
//    WebElement dropdown = driver.findElement(${selectElement});
//    dropdown.findElement(${}).click();
//  }`)
//  //return Promise.resolve(
//  //  `await driver.wait(until.elementLocated(${await LocationEmitter.emit(
//  //    selectElement
//  //  )}), configuration.timeout);await driver.findElement(${await LocationEmitter.emit(
//  //    selectElement
//  //  )}).then(element => {return element.findElement(${await SelectionEmitter.emit(
//  //    option
//  //  )}).then(option => {return option.click();});});`
//  //)
//}

async function emitSendKeys(target, value) {
  return Promise.resolve(
    `driver.findElement(${await location.emit(target)}).sendKeys(${value
      .map(s => (s.startsWith('Key[') ? s : `"${s}"`))
      .join(',')}));`
  )
}

async function emitUncheck(locator) {
  return Promise.resolve(
    `{
        WebElement element = driver.findElement(${await location.emit(
          locator
        )});
        if (element.isSelected()) {
          element.click();
        }
      }`
  )
}

async function emitVerifyText(locator, text) {
  return Promise.resolve(
    `assertThat(driver.findElement(${await location.emit(
      locator
    )}).getText(), is("${exporter.text.emit(text)}"));`
  )
}

export default {
  emit,
}
