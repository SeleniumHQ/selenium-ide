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
      assertTrue(elements.get(0) != null);
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
      assertTrue(elements.get(0) != null);
  }`)
  })
})
