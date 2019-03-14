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

import Command from '../src/command'

describe('command code emitter', () => {
  it('should emit `add selection` command', () => {
    const command = {
      command: 'addSelection',
      target: 'css=select',
      value: 'label=A label',
    }
    return expect(Command.emit(command)).resolves.toBe(
      `{
    WebElement dropdown = driver.findElement(By.cssSelector("select"));
    dropdown.findElement(By.xpath("//option[. = 'A label']")).click();
  }`
    )
  })
  it('should emit `assert` command', () => {
    const command = {
      command: 'assert',
      target: 'varrrName',
      value: 'true',
    }
    expect(Command.emit(command)).resolves.toBe(
      `assertEquals(vars.get("${command.target}").toString(), ${
        command.value
      });`
    )
  })
  it('should emit `assert alert` command', () => {
    const command = {
      command: 'assertAlert',
      target: 'an alert',
      value: '',
    }
    return expect(Command.emit(command)).resolves.toBe(
      `{
      Alert alert = driver.switchTo().alert();
      assertThat(alert.getText(), is("an alert"));
      alert.accept();
  }`
    )
  })
  it('should emit `assert checked` command', () => {
    const command = {
      command: 'assertChecked',
      target: 'id=check',
      value: '',
    }
    return expect(Command.emit(command)).resolves.toBe(
      `assertTrue(driver.findElement(By.id("check")).isSelected());`
    )
  })
  it('should emit `assert confirmation` command', () => {
    const command = {
      command: 'assertConfirmation',
      target: 'a confirmation',
      value: '',
    }
    return expect(Command.emit(command)).resolves.toBe(
      `{
      Alert alert = driver.switchTo().alert();
      assertThat(alert.getText(), is("a confirmation"));
      alert.accept();
  }`
    )
  })
  it('should emit `assert editable` command', () => {
    const command = {
      command: 'assertEditable',
      target: 'id=text',
      value: '',
    }
    return expect(Command.emit(command)).resolves.toBe(
      `{
        WebElement element = driver.findElement(By.id("text"));
        Boolean isEditable = element.isEnabled() && element.getAttribute("readonly") == null;
        assertTrue(isEditable)
    }`
    )
  })
  it('should emit `assert element present` command', () => {
    const command = {
      command: 'assertElementPresent',
      target: 'id=element',
      value: '',
    }
    return expect(Command.emit(command)).resolves.toBe(`
  {
      List<WebElement> elements = driver.findElements(By.id("element"));
      assert(elements.size() > 0);
  }`)
  })
  it('should emit `assert element not present` command', () => {
    const command = {
      command: 'assertElementNotPresent',
      target: 'id=element',
      value: '',
    }
    return expect(Command.emit(command)).resolves.toBe(`
  {
      List<WebElement> elements = driver.findElements(By.id("element"));
      assert(elements.size() == 0);
  }`)
  })
  it('should emit `assert not checked` command', () => {
    const command = {
      command: 'assertNotChecked',
      target: 'id=check',
      value: '',
    }
    return expect(Command.emit(command)).resolves.toBe(
      `assertFalse(driver.findElement(By.id("check")).isSelected());`
    )
  })
  it('should emit `assert not editable` command', () => {
    const command = {
      command: 'assertNotEditable',
      target: 'id=text',
      value: '',
    }
    return expect(Command.emit(command)).resolves.toBe(`
  {
      WebElement element = driver.findElement(By.id("text"));
      Boolean isEditable = element.isEnabled() && element.getAttribute("readonly") == null;
      assertFalse(isEditable)
  }`)
  })
  it('should emit `assert not selected value` command', () => {
    const command = {
      command: 'assertNotSelectedValue',
      target: 'id=select',
      value: 'test',
    }
    return expect(Command.emit(command)).resolves.toBe(`
    {
        String value = driver.findElement(By.id("select")).getAttribute("value");
        assertThat(value, is(not("test")));
    }`)
  })
  it('should emit `assert not text` command', () => {
    const command = {
      command: 'assertNotText',
      target: 'id=test',
      value: 'text',
    }
    return expect(Command.emit(command)).resolves.toBe(`
  {
      String text = driver.findElement(By.id("test")).getText();
      assertThat(text, is(not("text")));
  }`)
  })
  it('should emit `assert prompt` command', () => {
    const command = {
      command: 'assertPrompt',
      target: 'a prompt',
      value: '',
    }
    return expect(Command.emit(command)).resolves.toBe(
      `{
      Alert alert = driver.switchTo().alert();
      assertThat(alert.getText(), is("a prompt"));
      alert.accept();
  }`
    )
  })
  it("should emit 'assert selected label' command", () => {
    const command = {
      command: 'assertSelectedLabel',
      target: 'id=test',
      value: 'test',
    }
    return expect(Command.emit(command)).resolves.toBe(`
    {
        WebElement element = driver.findElement(By.id("test"));
        String value = element.getAttribute("value");
        String locator = String.format("option[@value='%s']", value);
        String selectedText = element.findElement(By.xpath(locator)).getText();
        assertThat(selectedText, is("test"));
    }`)
  })
  it('should emit `assert selected value` command', () => {
    const command = {
      command: 'assertSelectedValue',
      target: 'id=select',
      value: 'test',
    }
    return expect(Command.emit(command)).resolves.toBe(`
    {
        String value = driver.findElement(By.id("select")).getAttribute("value");
        assertThat(value, is("test"));
    }`)
  })
  it('should emit `assert text` command', () => {
    const command = {
      command: 'assertText',
      target: 'id=test',
      value: 'some text that should be here',
    }
    expect(Command.emit(command)).resolves.toBe(
      `assertThat(driver.findElement(By.id("test")).getText(), is("${
        command.value
      }"));`
    )
  })
  it('should emit `assert title` command', () => {
    const command = {
      command: 'assertTitle',
      target: 'example title',
      value: '',
    }
    return expect(Command.emit(command)).resolves.toBe(
      `assertThat(driver.getTitle(), is("example title"));`
    )
  })
  it('should emit `assert value` command', () => {
    const command = {
      command: 'assertValue',
      target: 'id=select',
      value: 'test',
    }
    return expect(Command.emit(command)).resolves.toBe(`
    {
        String value = driver.findElement(By.id("select")).getAttribute("value");
        assertThat(value, is("test"));
    }`)
  })
  it('should emit `click` command', () => {
    const command = {
      command: 'click',
      target: 'link=button',
      value: '',
    }
    return expect(Command.emit(command)).resolves.toBe(
      'driver.findElement(By.linkText("button")).click();'
    )
  })
  it('should emit `click at` command', () => {
    const command = {
      command: 'clickAt',
      target: 'link=button',
      value: '',
    }
    return expect(Command.emit(command)).resolves.toBe(
      'driver.findElement(By.linkText("button")).click();'
    )
  })
  it('should emit `check` command', () => {
    const command = {
      command: 'check',
      target: 'id=f',
      value: '',
    }
    return expect(Command.emit(command)).resolves.toBe(
      `{
        WebElement element = driver.findElement(By.id("f"));
        if (!element.isSelected()) {
          element.click();
        }
      }`
    )
  })
  it('should emit `close` command', () => {
    const command = {
      command: 'close',
      target: '',
      value: '',
    }
    return expect(Command.emit(command)).resolves.toBe(`driver.close();`)
  })
  it('should emit `double click` command', () => {
    const command = {
      command: 'doubleClick',
      target: 'link=button',
      value: '',
    }
    return expect(Command.emit(command)).resolves.toBe(
      `{
        WebElement element = driver.findElement(By.linkText("button"));
        Actions builder = new Actions(driver);
        builder.doubleClick(element).perform();
      }`
    )
  })
  it('should emit `double click at` command', () => {
    const command = {
      command: 'doubleClickAt',
      target: 'link=button',
      value: '',
    }
    return expect(Command.emit(command)).resolves.toBe(
      `{
        WebElement element = driver.findElement(By.linkText("button"));
        Actions builder = new Actions(driver);
        builder.doubleClick(element).perform();
      }`
    )
  })
  it('should emit `drag and drop to object` command', () => {
    const command = {
      command: 'dragAndDropToObject',
      target: 'link=dragged',
      value: 'link=dropped',
    }
    return expect(Command.emit(command)).resolves.toBe(
      `{
        WebElement dragged = driver.findElement(By.linkText("dragged"));
        WebElement dropped = driver.findElement(By.linkText("dropped"));
        Actions builder = new Actions(driver);
        builder.dragAndDrop(dragged, dropped).perform();
      }`
    )
  })
  it('should emit `echo` command', () => {
    const command = {
      command: 'echo',
      target: 'blah',
      value: '',
    }
    return expect(Command.emit(command)).resolves.toBe(
      `System.out.println("blah");`
    )
  })
  it('should emit `edit content` command', () => {
    const command = {
      command: 'editContent',
      target: 'id=contentEditable',
      value: '<button>test</button>',
    }
    return expect(Command.emit(command)).resolves.toBe(`
  {
      WebElement element = driver.findElement(By.id("contentEditable"));
      JavascriptExecutor js = (JavascriptExecutor) driver;
      js.executeScript("if(arguments[0].contentEditable === 'true') {arguments[0].innerHTML = '<button>test</button>'}", element);
  }`)
  })
  it('should emit `execute script` command', () => {
    const command = {
      command: 'executeScript',
      target: 'javascript',
      value: 'myVar',
    }
    return expect(Command.emit(command)).resolves.toBe(
      `{
      JavascriptExecutor js = (JavascriptExecutor) driver;
      vars.push("myVar") = js.executeScript("javascript");
  }`
    )
  })
  it('should emit `execute async script` command', () => {
    const command = {
      command: 'executeAsyncScript',
      target: 'javascript',
      value: 'myVar',
    }
    return expect(Command.emit(command)).resolves.toBe(
      `{
      JavascriptExecutor js = (JavascriptExecutor) driver;
      vars.push("myVar") = js.executeAsyncScript("var callback = arguments[arguments.length - 1];javascript.then(callback).catch(callback);");
    }`
    )
  })
  it('should emit `mouse down` event', () => {
    const command = {
      command: 'mouseDown',
      target: 'id=button',
      value: '',
    }
    return expect(Command.emit(command)).resolves.toBe(`
    {
        WebElement element = driver.findElement(By.id("button"));
        Action builder = new Actions(driver);
        builder.moveToElement(element).clickAndHold().perform();
    }`)
  })
  it('should emit `mouse down at` event', () => {
    const command = {
      command: 'mouseDownAt',
      target: 'id=button',
      value: '',
    }
    return expect(Command.emit(command)).resolves.toBe(`
    {
        WebElement element = driver.findElement(By.id("button"));
        Action builder = new Actions(driver);
        builder.moveToElement(element).clickAndHold().perform();
    }`)
  })
  it('should emit `mouse move` event', () => {
    const command = {
      command: 'mouseMove',
      target: 'id=button',
      value: '',
    }
    return expect(Command.emit(command)).resolves.toBe(`
    {
        WebElement element = driver.findElement(By.id("button"));
        Action builder = new Actions(driver);
        builder.moveToElement(element).perform();
    }`)
  })
  it('should emit `mouse move at` event', () => {
    const command = {
      command: 'mouseMoveAt',
      target: 'id=button',
      value: '',
    }
    return expect(Command.emit(command)).resolves.toBe(`
    {
        WebElement element = driver.findElement(By.id("button"));
        Action builder = new Actions(driver);
        builder.moveToElement(element).perform();
    }`)
  })
  it('should emit `mouse out` event', () => {
    const command = {
      command: 'mouseOut',
      target: 'id=button',
      value: '',
    }
    return expect(Command.emit(command)).resolves.toBe(`
    {
        WebElement element = driver.findElement(By.tagName("body"));
        Action builder = new Actions(driver);
        builder.moveToElement(element, 0, 0).perform();
    }`)
  })
  it('should emit `mouse over` event', () => {
    const command = {
      command: 'mouseOver',
      target: 'id=button',
      value: '',
    }
    return expect(Command.emit(command)).resolves.toBe(`
    {
        WebElement element = driver.findElement(By.id("button"));
        Action builder = new Actions(driver);
        builder.moveToElement(element).perform();
    }`)
  })
  it('should emit `mouse up` event', () => {
    const command = {
      command: 'mouseUp',
      target: 'id=button',
      value: '',
    }
    return expect(Command.emit(command)).resolves.toBe(`
    {
        WebElement element = driver.findElement(By.id("button"));
        Action builder = new Actions(driver);
        builder.moveToElement(element).release().perform();
    }`)
  })
  it('should emit `mouse up at` event', () => {
    const command = {
      command: 'mouseUpAt',
      target: 'id=button',
      value: '',
    }
    return expect(Command.emit(command)).resolves.toBe(`
    {
        WebElement element = driver.findElement(By.id("button"));
        Action builder = new Actions(driver);
        builder.moveToElement(element).release().perform();
    }`)
  })
  it('should emit `open` with absolute url', () => {
    const command = {
      command: 'open',
      target: 'https://www.seleniumhq.org/',
      value: '',
    }
    return expect(Command.emit(command)).resolves.toBe(
      `driver.get("${command.target}");`
    )
  })
  it('should emit `pause` command', () => {
    const command = {
      command: 'pause',
      target: '300',
      value: '',
    }
    return expect(Command.emit(command)).resolves.toBe(
      `Thread.sleep(${command.target});`
    )
  })
  it('should emit `remove selection` command', () => {
    const command = {
      command: 'removeSelection',
      target: 'css=select',
      value: 'label=A label',
    }
    return expect(Command.emit(command)).resolves.toBe(
      `{
    WebElement dropdown = driver.findElement(By.cssSelector("select"));
    dropdown.findElement(By.xpath("//option[. = 'A label']")).click();
  }`
    )
  })
  it('should emit `run script` command', () => {
    const command = {
      command: 'runScript',
      target: "alert('test');alert('Im annoying');",
      value: '',
    }
    return expect(Command.emit(command)).resolves.toBe(`
    {
        JavascriptExecutor js = (JavascriptExecutor) driver;
        js.executeScript("alert('test');alert('Im annoying');");
    }`)
  })
  it('should emit `select` command', () => {
    const command = {
      command: 'select',
      target: 'css=select',
      value: 'label=A label',
    }
    return expect(Command.emit(command)).resolves.toBe(
      `{
    WebElement dropdown = driver.findElement(By.cssSelector("select"));
    dropdown.findElement(By.xpath("//option[. = 'A label']")).click();
  }`
    )
  })
  it('should emit `select frame` to select the top frame', () => {
    const command = {
      command: 'selectFrame',
      target: 'relative=top',
      value: '',
    }
    return expect(Command.emit(command)).resolves.toBe(
      'driver.switchTo().defaultContent();'
    )
  })
  it('should emit `send keys` command', () => {
    const command = {
      command: 'sendKeys',
      target: 'id=input',
      value: 'example input',
    }
    return expect(Command.emit(command)).resolves.toBe(
      `driver.findElement(By.id("input")).sendKeys("${command.value}"));`
    )
  })
  it('should emit `set speed`', () => {
    expect(Command.emit({ command: 'setSpeed' })).resolves.toBe(
      `System.out.println("\`set speed\` is a no-op in the runner, use \`pause instead\`");`
    )
  })
  it('should fail to emit `select window` by using unknown locator', () => {
    const command = {
      command: 'selectWindow',
      target: 'notExisting=something',
      value: '',
    }
    return expect(Command.emit(command)).rejects.toThrow(
      'Can only emit `select window` using handles'
    )
  })
  it('should emit `select window` to select a window by handle', () => {
    const command = {
      command: 'selectWindow',
      target: 'handle=${window}',
      value: '',
    }
    return expect(Command.emit(command)).resolves.toBe(
      `driver.switchTo().window("vars.get("window").toString()");`
    )
  })
  it('should emit `select window` to select a window by name', () => {
    const command = {
      command: 'selectWindow',
      target: 'name=window',
      value: '',
    }
    return expect(Command.emit(command)).resolves.toBe(
      `driver.switchTo().window("window");`
    )
  })
  it('should emit `select window` to select a window by the local keyword', () => {
    const command = {
      command: 'selectWindow',
      target: 'win_ser_local',
      value: '',
    }
    return expect(Command.emit(command)).resolves.toBe(`
      {
          ArrayList<String> handles = new ArrayList<String>(driver.getWindowHandles());
          driver.switchTo().window(handles.get(0));
      }`)
  })
  it('should emit `select window` to select a window by implicit index', () => {
    const command = {
      command: 'selectWindow',
      target: 'win_ser_12',
      value: '',
    }
    return expect(Command.emit(command)).resolves.toBe(`
      {
          ArrayList<String> handles = new ArrayList<String>(driver.getWindowHandles());
          driver.switchTo().window(handles.get(12));
      }`)
  })
  it('should emit `setWindowSize`', () => {
    const command = {
      command: 'setWindowSize',
      target: '1440x1177',
      value: '',
    }
    expect(Command.emit(command)).resolves.toBe(
      `driver.manage().window().setSize(new Dimension(1440, 1177));`
    )
  })
  it('should skip playback supported commands, that are not supported in webdriver', () => {
    return Promise.all([
      expect(
        Command.emit({ command: 'answerOnNextPrompt' })
      ).resolves.toBeUndefined(),
      expect(
        Command.emit({ command: 'chooseCancelOnNextConfirmation' })
      ).resolves.toBeUndefined(),
      expect(
        Command.emit({ command: 'chooseCancelOnNextPrompt' })
      ).resolves.toBeUndefined(),
      expect(
        Command.emit({ command: 'chooseOkOnNextConfirmation' })
      ).resolves.toBeUndefined(),
    ])
  })
  it('should emit `type` command', () => {
    const command = {
      command: 'type',
      target: 'id=input',
      value: 'example input',
    }
    expect(Command.emit(command)).resolves.toBe(
      `driver.findElement(By.id("input")).sendKeys("${command.value}");`
    )
  })
  it('should emit `uncheck` command', () => {
    const command = {
      command: 'uncheck',
      target: 'id=f',
      value: '',
    }
    return expect(Command.emit(command)).resolves.toBe(
      `{
        WebElement element = driver.findElement(By.id("f"));
        if (element.isSelected()) {
          element.click();
        }
      }`
    )
  })
  it('should emit `verify` command', () => {
    const command = {
      command: 'verify',
      target: 'varrrName',
      value: 'true',
    }
    expect(Command.emit(command)).resolves.toBe(
      `assertEquals(vars.get("${command.target}").toString(), ${
        command.value
      });`
    )
  })
  it('should emit `verify checked` command', () => {
    const command = {
      command: 'verifyChecked',
      target: 'id=check',
      value: '',
    }
    return expect(Command.emit(command)).resolves.toBe(
      `assertTrue(driver.findElement(By.id("check")).isSelected());`
    )
  })
  it('should emit `verify editable` command', () => {
    const command = {
      command: 'verifyEditable',
      target: 'id=text',
      value: '',
    }
    return expect(Command.emit(command)).resolves.toBe(
      `{
        WebElement element = driver.findElement(By.id("text"));
        Boolean isEditable = element.isEnabled() && element.getAttribute("readonly") == null;
        assertTrue(isEditable)
    }`
    )
  })
  it('should emit `verify element present` command', () => {
    const command = {
      command: 'verifyElementPresent',
      target: 'id=element',
      value: '',
    }
    return expect(Command.emit(command)).resolves.toBe(`
  {
      List<WebElement> elements = driver.findElements(By.id("element"));
      assert(elements.size() > 0);
  }`)
  })
  it('should emit `verify element not present` command', () => {
    const command = {
      command: 'verifyElementNotPresent',
      target: 'id=element',
      value: '',
    }
    return expect(Command.emit(command)).resolves.toBe(`
  {
      List<WebElement> elements = driver.findElements(By.id("element"));
      assert(elements.size() == 0);
  }`)
  })
  it('should emit `verify not checked` command', () => {
    const command = {
      command: 'verifyNotChecked',
      target: 'id=check',
      value: '',
    }
    return expect(Command.emit(command)).resolves.toBe(
      `assertFalse(driver.findElement(By.id("check")).isSelected());`
    )
  })
  it('should emit `verify not editable` command', () => {
    const command = {
      command: 'verifyNotEditable',
      target: 'id=text',
      value: '',
    }
    return expect(Command.emit(command)).resolves.toBe(`
  {
      WebElement element = driver.findElement(By.id("text"));
      Boolean isEditable = element.isEnabled() && element.getAttribute("readonly") == null;
      assertFalse(isEditable)
  }`)
  })
  it('should emit `verify not selected value` command', () => {
    const command = {
      command: 'verifyNotSelectedValue',
      target: 'id=select',
      value: 'test',
    }
    return expect(Command.emit(command)).resolves.toBe(`
    {
        String value = driver.findElement(By.id("select")).getAttribute("value");
        assertThat(value, is(not("test")));
    }`)
  })
  it('should emit `verify not text` command', () => {
    const command = {
      command: 'verifyNotText',
      target: 'id=test',
      value: 'text',
    }
    return expect(Command.emit(command)).resolves.toBe(`
  {
      String text = driver.findElement(By.id("test")).getText();
      assertThat(text, is(not("text")));
  }`)
  })
  it("should emit 'verify selected label' command", () => {
    const command = {
      command: 'verifySelectedLabel',
      target: 'id=test',
      value: 'test',
    }
    return expect(Command.emit(command)).resolves.toBe(`
    {
        WebElement element = driver.findElement(By.id("test"));
        String value = element.getAttribute("value");
        String locator = String.format("option[@value='%s']", value);
        String selectedText = element.findElement(By.xpath(locator)).getText();
        assertThat(selectedText, is("test"));
    }`)
  })
  it('should emit `verify value` command', () => {
    const command = {
      command: 'verifyValue',
      target: 'id=select',
      value: 'test',
    }
    return expect(Command.emit(command)).resolves.toBe(`
    {
        String value = driver.findElement(By.id("select")).getAttribute("value");
        assertThat(value, is("test"));
    }`)
  })
  it('should emit `verify selected value` command', () => {
    const command = {
      command: 'verifySelectedValue',
      target: 'id=select',
      value: 'test',
    }
    return expect(Command.emit(command)).resolves.toBe(`
    {
        String value = driver.findElement(By.id("select")).getAttribute("value");
        assertThat(value, is("test"));
    }`)
  })
  it('should emit `verify text` command', () => {
    const command = {
      command: 'verifyText',
      target: 'id=test',
      value: 'some text that should be here',
    }
    expect(Command.emit(command)).resolves.toBe(
      `assertThat(driver.findElement(By.id("test")).getText(), is("${
        command.value
      }"));`
    )
  })
  it('should emit `verify title` command', () => {
    const command = {
      command: 'verifyTitle',
      target: 'example title',
      value: '',
    }
    return expect(Command.emit(command)).resolves.toBe(
      `assertThat(driver.getTitle(), is("example title"));`
    )
  })
})
