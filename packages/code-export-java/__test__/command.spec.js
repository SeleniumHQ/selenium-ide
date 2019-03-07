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

import CommandEmitter from '../src/command'

describe('command code emitter', () => {
  it('should emit `assert` command', () => {
    const command = {
      command: 'assert',
      target: 'varrrName',
      value: 'true',
    }
    expect(CommandEmitter.emit(command)).resolves.toBe(
      `assertEquals(vars.get("${command.target}").toString(), ${
        command.value
      });`
    )
  })
  it('should emit `assert text` command', () => {
    const command = {
      command: 'assertText',
      target: 'id=test',
      value: 'some text that should be here',
    }
    expect(CommandEmitter.emit(command)).resolves.toBe(
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
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      'driver.findElement(By.linkText("button")).click();'
    )
  })
  it('should emit `click at` command', () => {
    const command = {
      command: 'clickAt',
      target: 'link=button',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      'driver.findElement(By.linkText("button")).click();'
    )
  })
  it('should emit `check` command', () => {
    const command = {
      command: 'check',
      target: 'id=f',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
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
    return expect(CommandEmitter.emit(command)).resolves.toBe(
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
    return expect(CommandEmitter.emit(command)).resolves.toBe(
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
    return expect(CommandEmitter.emit(command)).resolves.toBe(
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
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      `vars.push("${command.value}") = driver.executeScript("${
        command.target
      }");`
    )
  })
  it('should emit `open` with absolute url', () => {
    const command = {
      command: 'open',
      target: 'https://www.seleniumhq.org/',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      `driver.get("${command.target}");`
    )
  })
  it('should emit `send keys` command', () => {
    const command = {
      command: 'sendKeys',
      target: 'id=input',
      value: 'example input',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      `driver.findElement(By.id("input")).sendKeys("${command.value}"));`
    )
  })
  it('should emit `setWindowSize`', () => {
    const command = {
      command: 'setWindowSize',
      target: '1440x1177',
      value: '',
    }
    expect(CommandEmitter.emit(command)).resolves.toBe(
      `driver.manage().window().setSize(new Dimension(1440, 1177));`
    )
  })
  it('should emit `type` command', () => {
    const command = {
      command: 'type',
      target: 'id=input',
      value: 'example input',
    }
    expect(CommandEmitter.emit(command)).resolves.toBe(
      `driver.findElement(By.id("input")).sendKeys("${command.value}");`
    )
  })
  it('should emit `uncheck` command', () => {
    const command = {
      command: 'uncheck',
      target: 'id=f',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      `{
        WebElement element = driver.findElement(By.id("f"));
        if (element.isSelected()) {
          element.click();
        }
      }`
    )
  })
})
