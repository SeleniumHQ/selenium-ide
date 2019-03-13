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
  //do: emitControlFlowDo,
  doubleClick: emitDoubleClick,
  doubleClickAt: emitDoubleClick,
  dragAndDropToObject: emitDragAndDrop,
  echo: emitEcho,
  editContent: emitEditContent,
  //else: emitControlFlowElse,
  //elseIf: emitControlFlowElseIf,
  //end: emitControlFlowEnd,
  executeScript: emitExecuteScript,
  executeAsyncScript: emitExecuteAsyncScript,
  //if: emitControlFlowIf,
  mouseDown: emitMouseDown,
  mouseDownAt: emitMouseDown,
  mouseMove: emitMouseMove,
  mouseMoveAt: emitMouseMove,
  mouseOver: emitMouseMove,
  mouseOut: emitMouseOut,
  mouseUp: emitMouseUp,
  mouseUpAt: emitMouseUp,
  open: emitOpen,
  //pause: emitPause,
  removeSelection: emitSelect,
  //repeatIf: emitControlFlowRepeatIf,
  //run: emitRun,
  //runScript: emitRunScript,
  select: emitSelect,
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

function emitAssert(varName, value) {
  return Promise.resolve(
    `assertEquals(vars.get("${varName}").toString(), ${value});`
  )
}

function emitAssertAlert(alertText) {
  return Promise.resolve(`{
      Alert alert = driver.switchTo().alert();
      assertThat(alert.getText(), is("${alertText}"));
      alert.accept();
  }`)
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

async function emitClose() {
  return Promise.resolve(`driver.close();`)
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

async function emitEcho(message) {
  return Promise.resolve(`System.out.println("${message}");`)
}

async function emitEditContent(locator, content) {
  return Promise.resolve(`
  {
      WebElement element = driver.findElement(${await location.emit(locator)});
      JavascriptExecutor js = (JavascriptExecutor) driver;
      js.executeScript("if(arguments[0].contentEditable === 'true') {arguments[0].innerHTML = '${content}'}", element);
  }`)
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
    `{
      JavascriptExecutor js = (JavascriptExecutor) driver;
      ${varName ? `vars.push("${varName}") = ` : ''}js.executeScript("${
      script.script
    }${generateScriptArguments(script)}");
  }`
  )
}

async function emitExecuteAsyncScript(script, varName) {
  return Promise.resolve(
    `{
      JavascriptExecutor js = (JavascriptExecutor) driver;
      ${
        varName ? `vars.push("${varName}") =` : ''
      } js.executeAsyncScript("var callback = arguments[arguments.length - 1];${
      script.script
    }.then(callback).catch(callback);${generateScriptArguments(script)}");
    }`
  )
}

function generateScriptArguments(script) {
  return `${script.argv.length ? ',' : ''}${script.argv
    .map(varName => `vars.get("${varName}")`)
    .join(',')}`
}

async function emitMouseDown(locator) {
  return Promise.resolve(`
    {
        WebElement element = driver.findElement(${await location.emit(
          locator
        )});
        Action builder = new Actions(driver);
        builder.moveToElement(element).clickAndHold().perform();
    }`)
}

async function emitMouseMove(locator) {
  return Promise.resolve(`
    {
        WebElement element = driver.findElement(${await location.emit(
          locator
        )});
        Action builder = new Actions(driver);
        builder.moveToElement(element).perform();
    }`)
}

async function emitMouseOut() {
  return Promise.resolve(`
    {
        WebElement element = driver.findElement(By.tagName("body"));
        Action builder = new Actions(driver);
        builder.moveToElement(element, 0, 0).perform();
    }`)
}

async function emitMouseUp(locator) {
  return Promise.resolve(`
    {
        WebElement element = driver.findElement(${await location.emit(
          locator
        )});
        Action builder = new Actions(driver);
        builder.moveToElement(element).release().perform();
    }`)
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

async function emitSelect(selectElement, option) {
  return Promise.resolve(`{
    WebElement dropdown = driver.findElement(${await location.emit(
      selectElement
    )});
    dropdown.findElement(${await selection.emit(option)}).click();
  }`)
}

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

async function emitVerifyChecked(locator) {
  return Promise.resolve(
    `assertTrue(driver.findElement(${await location.emit(
      locator
    )}).isSelected());`
  )
}

async function emitVerifyEditable(locator) {
  return Promise.resolve(
    `{
        WebElement element = driver.findElement(${await location.emit(
          locator
        )});
        Boolean isEditable = element.isEnabled() && element.getAttribute("readonly") == null;
        assertTrue(isEditable)
    }`
  )
}

async function emitVerifyElementPresent(locator) {
  return Promise.resolve(`
  {
      List<WebElement> elements = driver.findElements(${await location.emit(
        locator
      )});
      assert(elements.size() > 0);
  }`)
}

async function emitVerifyElementNotPresent(locator) {
  return Promise.resolve(`
  {
      List<WebElement> elements = driver.findElements(${await location.emit(
        locator
      )});
      assert(elements.size() == 0);
  }`)
}

async function emitVerifyNotChecked(locator) {
  return Promise.resolve(
    `assertFalse(driver.findElement(${await location.emit(
      locator
    )}).isSelected());`
  )
}

async function emitVerifyNotEditable(locator) {
  return Promise.resolve(`
  {
      WebElement element = driver.findElement(${await location.emit(locator)});
      Boolean isEditable = element.isEnabled() && element.getAttribute("readonly") == null;
      assertFalse(isEditable)
  }`)
}

async function emitVerifyNotSelectedValue(locator, expectedValue) {
  return Promise.resolve(`
    {
        String value = driver.findElement(${await location.emit(
          locator
        )}).getAttribute("value");
        assertThat(value, is(not("${exporter.text.emit(expectedValue)}")));
    }`)
}

async function emitVerifyNotText(locator, text) {
  return Promise.resolve(`
  {
      String text = driver.findElement(${await location.emit(
        locator
      )}).getText();
      assertThat(text, is(not("${exporter.text.emit(text)}")));
  }`)
}

async function emitVerifySelectedLabel(locator, labelValue) {
  return Promise.resolve(`
    {
        WebElement element = driver.findElement(${await location.emit(
          locator
        )});
        String value = element.getAttribute("value");
        String locator = String.format("option[@value='%s']", value);
        String selectedText = element.findElement(By.xpath(locator)).getText();
        assertThat(selectedText, is("${labelValue}"));
    }`)
}

async function emitVerifySelectedValue(locator, value) {
  return emitVerifyValue(locator, value)
}

async function emitVerifyText(locator, text) {
  return Promise.resolve(
    `assertThat(driver.findElement(${await location.emit(
      locator
    )}).getText(), is("${exporter.text.emit(text)}"));`
  )
}

async function emitVerifyValue(locator, value) {
  return Promise.resolve(`
    {
        String value = driver.findElement(${await location.emit(
          locator
        )}).getAttribute("value");
        assertThat(value, is("${value}"));
    }`)
}

async function emitVerifyTitle(title) {
  return Promise.resolve(`assertThat(driver.getTitle(), is("${title}"));`)
}

function skip() {
  return Promise.resolve()
}

export default {
  emit,
}
