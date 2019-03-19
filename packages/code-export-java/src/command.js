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

import exporter from 'code-export-utils'
import location from './location'
import selection from './selection'
import { sanitizeName } from './parsers'

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
  webdriverAnswerOnVisiblePrompt: emitAnswerOnNextPrompt,
  webdriverChooseCancelOnVisibleConfirmation: emitChooseCancelOnNextConfirmation,
  webdriverChooseCancelOnVisiblePrompt: emitChooseCancelOnNextConfirmation,
  webdriverChooseOkOnVisibleConfirmation: emitChooseOkOnNextConfirmation,
  while: emitControlFlowWhile,
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

function variableSetter(varName, value) {
  return varName ? `vars.put("${varName}", ${value});` : ''
}

function emitAssert(varName, value) {
  return Promise.resolve(
    `assertEquals(vars.get("${varName}").toString(), "${value}");`
  )
}

function emitAssertAlert(alertText) {
  return Promise.resolve(`{
      Alert alert = driver.switchTo().alert();
      assertThat(alert.getText(), is("${alertText}"));
      alert.accept();
  }`)
}

function emitAnswerOnNextPrompt(textToSend) {
  return Promise.resolve(`
    {
        Alert alert = driver.switchTo().alert();
        alert.sendKeys("${textToSend}")
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

function emitChooseCancelOnNextConfirmation() {
  return Promise.resolve(`driver.switchTo().alert().dismiss();`)
}

function emitChooseOkOnNextConfirmation() {
  return Promise.resolve(`driver.switchTo().alert().accept();`)
}

async function emitClick(target) {
  return Promise.resolve(
    `driver.findElement(${await location.emit(target)}).click();`
  )
}

async function emitClose() {
  return Promise.resolve(`driver.close();`)
}

function generateExpressionScript(script) {
  const scriptString = script.script.replace(/"/g, "'")
  return `(Boolean) js.executeScript("return (${scriptString})"${generateScriptArguments(
    script
  )})`
}

function emitControlFlowDo() {
  return Promise.resolve('do {')
}

function emitControlFlowElse() {
  return Promise.resolve(`} else {`)
}

function emitControlFlowElseIf(script) {
  return Promise.resolve(`} else if (${generateExpressionScript(script)}) {`)
}

function emitControlFlowEnd() {
  return Promise.resolve(`}`)
}

function emitControlFlowIf(script) {
  return Promise.resolve(`if (${generateExpressionScript(script)}) {`)
}

function emitControlFlowRepeatIf(script) {
  return Promise.resolve(`} while (${generateExpressionScript(script)});`)
}

function emitControlFlowTimes(target) {
  return Promise.resolve(`
      Integer times = ${target};
      for(int i = 0; i < times; i++) {
  `)
}

function emitControlFlowWhile(script) {
  return Promise.resolve(`while (${generateExpressionScript(script)}) {`)
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
  const _message = message.startsWith('vars.get') ? message : `"${message}"`
  return Promise.resolve(`System.out.println(${_message});`)
}

async function emitEditContent(locator, content) {
  return Promise.resolve(`
  {
      WebElement element = driver.findElement(${await location.emit(locator)});
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
  const scriptString = script.script.replace(/"/g, "'")
  return Promise.resolve(`
    {
        Object result = js.executeScript("${scriptString}"${generateScriptArguments(
    script
  )});
        ${variableSetter(varName, 'result')}
    }`)
}

async function emitExecuteAsyncScript(script, varName) {
  return Promise.resolve(`
    {
        Object result = js.executeAsyncScript("var callback = arguments[arguments.length - 1];${
          script.script
        }.then(callback).catch(callback);${generateScriptArguments(script)}");
        ${variableSetter(varName, 'result')}
    }`)
}

function generateScriptArguments(script) {
  return `${script.argv.length ? ', ' : ''}${script.argv
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

async function emitPause(time) {
  return Promise.resolve(`Thread.sleep(${time});`)
}

async function emitRun(testName) {
  return Promise.resolve(`${sanitizeName(testName)}();`)
}

async function emitRunScript(script) {
  return Promise.resolve(
    `js.executeScript("${script.script}${generateScriptArguments(script)}");`
  )
}

async function emitSetWindowSize(size) {
  const [width, height] = size.split('x')
  return Promise.resolve(
    `driver.manage().window().setSize(new Dimension(${width}, ${height}));`
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

async function emitSelectFrame(frameLocation) {
  if (frameLocation === 'relative=top' || frameLocation === 'relative=parent') {
    return Promise.resolve('driver.switchTo().defaultContent();')
  } else if (/^index=/.test(frameLocation)) {
    return Promise.resolve(
      `driver.switchTo().frame(${Math.floor(
        frameLocation.split('index=')[1]
      )});`
    )
  } else {
    return Promise.resolve(`
      {
          WebElement element = driver.findElement(${await location.emit(
            frameLocation
          )});
          driver.switchTo().frame(element);
      }`)
  }
}

async function emitSelectWindow(windowLocation) {
  if (/^handle=/.test(windowLocation)) {
    return Promise.resolve(
      `driver.switchTo().window("${windowLocation.split('handle=')[1]}");`
    )
  } else if (/^name=/.test(windowLocation)) {
    return Promise.resolve(
      `driver.switchTo().window("${windowLocation.split('name=')[1]}");`
    )
  } else if (/^win_ser_/.test(windowLocation)) {
    if (windowLocation === 'win_ser_local') {
      return Promise.resolve(`
      {
          ArrayList<String> handles = new ArrayList<String>(driver.getWindowHandles());
          driver.switchTo().window(handles.get(0));
      }`)
    } else {
      const index = parseInt(windowLocation.substr('win_ser_'.length))
      return Promise.resolve(`
      {
          ArrayList<String> handles = new ArrayList<String>(driver.getWindowHandles());
          driver.switchTo().window(handles.get(${index}));
      }`)
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

async function emitSendKeys(target, value) {
  return Promise.resolve(
    `driver.findElement(${await location.emit(
      target
    )}).sendKeys(${generateSendKeysInput(value)});`
  )
}

function emitSetSpeed() {
  return Promise.resolve(
    `System.out.println("\`set speed\` is a no-op in the runner, use \`pause instead\`");`
  )
}

async function emitStore(value, varName) {
  return Promise.resolve(variableSetter(varName, `"${value}"`))
}

async function emitStoreAttribute(locator, varName) {
  const attributePos = locator.lastIndexOf('@')
  const elementLocator = locator.slice(0, attributePos)
  const attributeName = locator.slice(attributePos + 1)

  return Promise.resolve(`
    {
        WebElement element = driver.findElement(${await location.emit(
          elementLocator
        )});
        String attribute = element.getAttribute("${attributeName}");
        ${variableSetter(varName, 'attribute')}
    }`)
}

async function emitStoreText(locator, varName) {
  return Promise.resolve(`
    {
        String elementText = driver.findElement(${await location.emit(
          locator
        )}).getText();
        ${variableSetter(varName, 'elementText')}
    }`)
}

async function emitStoreTitle(_, varName) {
  return Promise.resolve(variableSetter(varName, 'driver.getTitle()'))
}

async function emitStoreValue(locator, varName) {
  return Promise.resolve(`
    {
        String value = driver.findElement(${await location.emit(
          locator
        )}).getAttribute("value");
        ${variableSetter(varName, 'value')}
    }`)
}

async function emitStoreWindowHandle(varName) {
  return Promise.resolve(variableSetter(varName, 'driver.getWindowHandle()'))
}

async function emitStoreXpathCount(locator, varName) {
  return Promise.resolve(`
    {
        List<WebElement> elements = driver.findElements(${await location.emit(
          locator
        )});
        ${variableSetter(varName, 'elements.size()')}
    }`)
}

async function emitSubmit(_locator) {
  return Promise.resolve(
    `throw new Error("\`submit\` is not a supported command in Selenium WebDriver. Please re-record the step in the IDE.");`
  )
}

async function emitType(target, value) {
  return Promise.resolve(
    `driver.findElement(${await location.emit(
      target
    )}).sendKeys(${generateSendKeysInput(value)});`
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

async function emitWaitForElementEditable(locator, timeout) {
  return Promise.resolve(`
    {
        WebDriverWait wait = new WebDriverWait(driver, ${Math.floor(
          timeout / 1000
        )});
        wait.until(ExpectedConditions.elementToBeClickable(${await location.emit(
          locator
        )});
    }`)
}

function skip() {
  return Promise.resolve('')
}

async function emitWaitForElementPresent(locator, timeout) {
  return Promise.resolve(`
    {
        WebDriverWait wait = new WebDriverWait(driver, ${Math.floor(
          timeout / 1000
        )});
        wait.until(ExpectedConditions.presenceOfElementLocated(${await location.emit(
          locator
        )});
    }`)
}

async function emitWaitForElementVisible(locator, timeout) {
  return Promise.resolve(`
    {
        WebDriverWait wait = new WebDriverWait(driver, ${Math.floor(
          timeout / 1000
        )});
        wait.until(ExpectedConditions.visibilityOfElementLocated(${await location.emit(
          locator
        )});
    }`)
}

async function emitWaitForElementNotEditable(locator, timeout) {
  return Promise.resolve(`
    {
        WebDriverWait wait = new WebDriverWait(driver, ${Math.floor(
          timeout / 1000
        )});
        wait.until(ExpectedConditions.not(ExpectedConditions.visibilityOfElementLocated(${await location.emit(
          locator
        )})));
    }`)
}

async function emitWaitForElementNotPresent(locator, timeout) {
  return Promise.resolve(`
    {
        WebDriverWait wait = new WebDriverWait(driver, ${Math.floor(
          timeout / 1000
        )});
        WebElement element = driver.findElement(${await location.emit(
          locator
        )});
        wait.until(ExpectedConditions.stalenessOf(element));
    }`)
}

async function emitWaitForElementNotVisible(locator, timeout) {
  return Promise.resolve(`
    {
        WebDriverWait wait = new WebDriverWait(driver, ${Math.floor(
          timeout / 1000
        )});
        wait.until(ExpectedConditions.invisibilityOfElementLocated(${await location.emit(
          locator
        )});
    }`)
}

export default {
  emit,
}
