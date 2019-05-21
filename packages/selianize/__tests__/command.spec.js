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

import CommandEmitter, { registerEmitter } from '../src/command'
import {
  Commands,
  ControlFlowCommandNames,
} from '../../selenium-ide/src/neo/models/Command'

describe('keys preprocessor', () => {
  it('should not affect hardcoded strings', () => {
    const command = {
      command: 'sendKeys',
      target: 'id=t',
      value: 'test',
    }
    return expect(CommandEmitter.emit(command)).resolves.toMatch(
      'element.sendKeys(`test`)'
    )
  })
  it('should convert a single key', () => {
    const command = {
      command: 'sendKeys',
      target: 'id=t',
      value: '${KEY_ENTER}',
    }
    return expect(CommandEmitter.emit(command)).resolves.toMatch(
      'element.sendKeys(Key["ENTER"])'
    )
  })
  it('should convert a string and a key', () => {
    const command = {
      command: 'sendKeys',
      target: 'id=t',
      value: 'test${KEY_ENTER}',
    }
    return expect(CommandEmitter.emit(command)).resolves.toMatch(
      'element.sendKeys(`test`,Key["ENTER"])'
    )
  })
  it('should convert multiple strings and keys', () => {
    const command = {
      command: 'sendKeys',
      target: 'id=t',
      value: 'test${KEY_ENTER}foo${KEY_DOWN}bar',
    }
    return expect(CommandEmitter.emit(command)).resolves.toMatch(
      'element.sendKeys(`test`,Key["ENTER"],`foo`,Key["DOWN"],`bar`)'
    )
  })
  it('should interpolate stored variables', () => {
    const command = {
      command: 'sendKeys',
      target: 'id=t',
      value: 'test${var}',
    }
    return expect(CommandEmitter.emit(command)).resolves.toMatch(
      'element.sendKeys(`test`,`${vars.var}`)'
    )
  })
  it('should convert keys and interpolate vars', () => {
    const command = {
      command: 'sendKeys',
      target: 'id=t',
      value: 'test${var}foo${KEY_ENTER}',
    }
    return expect(CommandEmitter.emit(command)).resolves.toMatch(
      'element.sendKeys(`test`,`${vars.var}`,`foo`,Key["ENTER"])'
    )
  })
})

describe('script preprocessor', () => {
  it('should not affect hardcoded strings', () => {
    const command = {
      command: 'executeScript',
      target: 'return {}',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toMatch(
      'executeScript(`return {}`)'
    )
  })
  it('should pass a single argument', () => {
    const command = {
      command: 'executeScript',
      target: 'return ${x}',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toMatch(
      'executeScript(`return arguments[0]`,vars["x"])'
    )
  })
  it('should pass multiple arguments', () => {
    const command = {
      command: 'executeScript',
      target: 'return ${x} + ${y} + ${x}',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toMatch(
      'executeScript(`return arguments[0] + arguments[1] + arguments[0]`,vars["x"],vars["y"])'
    )
  })
})

describe('command code emitter', () => {
  it('should skip empty commands', () => {
    const command = {
      command: '',
      target: '',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBeUndefined()
  })
  it('should skip commented commands', () => {
    const command = {
      command: '//commented code',
      target: '',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBeUndefined()
  })
  it('should fail to emit unknown command', () => {
    const command = {
      command: 'doesntExist',
      target: '',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).rejects.toThrow(
      `Unknown command ${command.command}`
    )
  })
  it('should emit `open` command', () => {
    const command = {
      command: 'open',
      target: '/',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      `await driver.get((new URL(\`${command.target}\`, BASE_URL)).href);`
    )
  })
  it('should emit `open` with absolute url', () => {
    const command = {
      command: 'open',
      target: 'https://www.seleniumhq.org/',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      `await driver.get("${command.target}");`
    )
  })
  it('should emit `click` command', () => {
    const command = {
      command: 'click',
      target: 'link=button',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      'await driver.wait(until.elementLocated(By.linkText(`button`)), configuration.timeout);await driver.findElement(By.linkText(`button`)).then(element => {return element.click();});'
    )
  })
  it('should emit `click at` command', () => {
    const command = {
      command: 'clickAt',
      target: 'link=button',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      'await driver.wait(until.elementLocated(By.linkText(`button`)), configuration.timeout);await driver.findElement(By.linkText(`button`)).then(element => {return element.click();});'
    )
  })
  it('should emit `debugger` command', () => {
    const command = {
      command: 'debugger',
      target: '',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe('debugger;')
  })
  it('should emit `double click` command', () => {
    const command = {
      command: 'doubleClick',
      target: 'link=button',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toMatchSnapshot()
  })
  it('should emit `double click at` command', () => {
    const command = {
      command: 'doubleClickAt',
      target: 'link=button',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toMatchSnapshot()
  })
  it('should emit `drag and drop to object` command', () => {
    const command = {
      command: 'dragAndDropToObject',
      target: 'link=dragged',
      value: 'link=dropzone',
    }
    return expect(CommandEmitter.emit(command)).resolves.toMatchSnapshot()
  })
  it('should emit `type` command', () => {
    const command = {
      command: 'type',
      target: 'id=input',
      value: 'example input',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      `await driver.wait(until.elementLocated(By.id(\`input\`)), configuration.timeout);await driver.findElement(By.id(\`input\`)).then(element => {return element.clear().then(() => {return element.sendKeys(\`${
        command.value
      }\`);});});`
    )
  })
  it('should emit `send keys` command', () => {
    const command = {
      command: 'sendKeys',
      target: 'id=input',
      value: 'example input',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      `await driver.wait(until.elementLocated(By.id(\`input\`)), configuration.timeout);await driver.findElement(By.id(\`input\`)).then(element => {return element.sendKeys(\`${
        command.value
      }\`);});`
    )
  })
  it('should emit `echo` command', () => {
    const command = {
      command: 'echo',
      target: 'test message',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      `console.log(\`${command.target}\`);`
    )
  })
  it('should emit `check` command', () => {
    const command = {
      command: 'check',
      target: 'id=f',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      'await driver.wait(until.elementLocated(By.id(`f`)), configuration.timeout);await driver.findElement(By.id(`f`)).then(element => {return element.isSelected().then(selected => {if(!selected) {return element.click();}}); });'
    )
  })
  it('should emit `uncheck` command', () => {
    const command = {
      command: 'uncheck',
      target: 'id=f',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      'await driver.wait(until.elementLocated(By.id(`f`)), configuration.timeout);await driver.findElement(By.id(`f`)).then(element => {return element.isSelected().then(selected => {if(selected) {return element.click();}}); });'
    )
  })
  it('should emit `run` command', () => {
    const command = {
      command: 'run',
      target: 'some test case',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      'await tests["some test case"](driver, vars, { isNested: true });'
    )
  })
  it('should emit `run script` command', () => {
    const command = {
      command: 'runScript',
      target: "alert('test');\nalert('Im annoying');",
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      `await driver.executeScript(\`${command.target}\`);`
    )
  })
  it('should emit `execute script` command', () => {
    const command = {
      command: 'executeScript',
      target: 'javascript',
      value: 'myVar',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      `vars["${command.value}"] = await driver.executeScript(\`${
        command.target
      }\`);`
    )
  })
  it('should emit `execute async script` command', () => {
    const command = {
      command: 'executeAsyncScript',
      target: 'javascript',
      value: 'myVar',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      `vars["${
        command.value
      }"] = await driver.executeAsyncScript(\`var callback = arguments[arguments.length - 1];${
        command.target
      }.then(callback).catch(callback);\`);`
    )
  })
  it('should emit `pause` command', () => {
    const command = {
      command: 'pause',
      target: '300',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      `await driver.sleep(${command.target});`
    )
  })
  it('should emit `verify checked` command', () => {
    const command = {
      command: 'verifyChecked',
      target: 'id=check',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      'await driver.wait(until.elementLocated(By.id(`check`)), configuration.timeout);await expect(driver.findElement(By.id(`check`))).resolves.toBeChecked();'
    )
  })
  it('should emit `verify not checked` command', () => {
    const command = {
      command: 'verifyNotChecked',
      target: 'id=check',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      'await driver.wait(until.elementLocated(By.id(`check`)), configuration.timeout);await expect(driver.findElement(By.id(`check`))).resolves.not.toBeChecked();'
    )
  })
  it('should emit `verify editable` command', () => {
    const command = {
      command: 'verifyEditable',
      target: 'id=text',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      'await driver.wait(until.elementLocated(By.id(`text`)), configuration.timeout);await expect(driver.findElement(By.id(`text`))).resolves.toBeEditable();'
    )
  })
  it('should emit `verify not editable` command', () => {
    const command = {
      command: 'verifyNotEditable',
      target: 'id=text',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      'await driver.wait(until.elementLocated(By.id(`text`)), configuration.timeout);await expect(driver.findElement(By.id(`text`))).resolves.not.toBeEditable();'
    )
  })
  it('should emit `verify element present` command', () => {
    const command = {
      command: 'verifyElementPresent',
      target: 'id=element',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      'await driver.wait(until.elementLocated(By.id(`element`)), configuration.timeout);await expect(driver.findElements(By.id(`element`))).resolves.toBePresent();'
    )
  })
  it('should emit `verify element not present` command', () => {
    const command = {
      command: 'verifyElementNotPresent',
      target: 'id=element',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      'await expect(driver.findElements(By.id(`element`))).resolves.not.toBePresent();'
    )
  })
  it('should emit `verify selected value` command', () => {
    const command = {
      command: 'verifySelectedValue',
      target: 'id=select',
      value: 'test',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      `await driver.wait(until.elementLocated(By.id(\`select\`)), configuration.timeout);await expect(driver.findElement(By.id(\`select\`))).resolves.toHaveSelectedValue(\`${
        command.value
      }\`);`
    )
  })
  it('should emit `verify not selected value` command', () => {
    const command = {
      command: 'verifyNotSelectedValue',
      target: 'id=select',
      value: 'test',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      `await driver.wait(until.elementLocated(By.id(\`select\`)), configuration.timeout);await expect(driver.findElement(By.id(\`select\`))).resolves.not.toHaveSelectedValue(\`${
        command.value
      }\`);`
    )
  })
  it('should emit `verify value` command', () => {
    const command = {
      command: 'verifyValue',
      target: 'id=test',
      value: 'test',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      `await driver.wait(until.elementLocated(By.id(\`test\`)), configuration.timeout);await expect(driver.findElement(By.id(\`test\`))).resolves.toHaveValue(\`${
        command.value
      }\`);`
    )
  })
  it('should emit `verify not text` command', () => {
    const command = {
      command: 'verifyNotText',
      target: 'id=test',
      value: 'text',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      `await driver.wait(until.elementLocated(By.id(\`test\`)), configuration.timeout);await driver.findElement(By.id(\`test\`)).then(element => {return element.getText().then(text => {return expect(text).not.toBe(\`${
        command.value
      }\`)});});`
    )
  })
  it('should emit `verify title` command', () => {
    const command = {
      command: 'verifyTitle',
      target: 'example title',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      `await driver.getTitle().then(title => {return expect(title).toBe(\`${
        command.target
      }\`);});`
    )
  })
  it("should emit 'verify selected label' command", () => {
    const command = {
      command: 'verifySelectedLabel',
      target: 'id=test',
      value: 'test',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      `await driver.wait(until.elementLocated(By.id(\`test\`)), configuration.timeout);await driver.findElement(By.id(\`test\`)).then(element => {return element.getAttribute("value").then(selectedValue => {return element.findElement(By.xpath('option[@value="'+selectedValue+'"]')).then(selectedOption => {return selectedOption.getText().then(selectedLabel => {return expect(selectedLabel).toBe(\`${
        command.value
      }\`);});});});});`
    )
  })
  it('should emit `verify text` command', () => {
    const command = {
      command: 'verifyText',
      target: 'id=test',
      value: 'some text that should be here',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      `await driver.wait(until.elementLocated(By.id(\`test\`)), configuration.timeout);await expect(driver.findElement(By.id(\`test\`))).resolves.toHaveText(\`${
        command.value
      }\`);`
    )
  })
  it('should emit `assert checked` command', () => {
    const command = {
      command: 'assertChecked',
      target: 'id=check',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      'await driver.wait(until.elementLocated(By.id(`check`)), configuration.timeout);await expect(driver.findElement(By.id(`check`))).resolves.toBeChecked();'
    )
  })
  it('should emit `assert not checked` command', () => {
    const command = {
      command: 'assertNotChecked',
      target: 'id=check',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      'await driver.wait(until.elementLocated(By.id(`check`)), configuration.timeout);await expect(driver.findElement(By.id(`check`))).resolves.not.toBeChecked();'
    )
  })
  it('should emit `assert editable` command', () => {
    const command = {
      command: 'assertEditable',
      target: 'id=text',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      'await driver.wait(until.elementLocated(By.id(`text`)), configuration.timeout);await expect(driver.findElement(By.id(`text`))).resolves.toBeEditable();'
    )
  })
  it('should emit `assert not editable` command', () => {
    const command = {
      command: 'assertNotEditable',
      target: 'id=text',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      'await driver.wait(until.elementLocated(By.id(`text`)), configuration.timeout);await expect(driver.findElement(By.id(`text`))).resolves.not.toBeEditable();'
    )
  })
  it('should emit `assert element present` command', () => {
    const command = {
      command: 'assertElementPresent',
      target: 'id=element',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      'await driver.wait(until.elementLocated(By.id(`element`)), configuration.timeout);await expect(driver.findElements(By.id(`element`))).resolves.toBePresent();'
    )
  })
  it('should emit `assert element not present` command', () => {
    const command = {
      command: 'assertElementNotPresent',
      target: 'id=element',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      'await expect(driver.findElements(By.id(`element`))).resolves.not.toBePresent();'
    )
  })
  it('should emit `assert selected value` command', () => {
    const command = {
      command: 'assertSelectedValue',
      target: 'id=select',
      value: 'test',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      `await driver.wait(until.elementLocated(By.id(\`select\`)), configuration.timeout);await expect(driver.findElement(By.id(\`select\`))).resolves.toHaveSelectedValue(\`${
        command.value
      }\`);`
    )
  })
  it('should emit `assert not selected value` command', () => {
    const command = {
      command: 'assertNotSelectedValue',
      target: 'id=select',
      value: 'test',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      `await driver.wait(until.elementLocated(By.id(\`select\`)), configuration.timeout);await expect(driver.findElement(By.id(\`select\`))).resolves.not.toHaveSelectedValue(\`${
        command.value
      }\`);`
    )
  })
  it('should emit `assert title` command', () => {
    const command = {
      command: 'assertTitle',
      target: 'example title',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      `await driver.getTitle().then(title => {return expect(title).toBe(\`${
        command.target
      }\`);});`
    )
  })
  it("should emit 'assert selected label' command", () => {
    const command = {
      command: 'assertSelectedLabel',
      target: 'id=test',
      value: 'test',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      `await driver.wait(until.elementLocated(By.id(\`test\`)), configuration.timeout);await driver.findElement(By.id(\`test\`)).then(element => {return element.getAttribute("value").then(selectedValue => {return element.findElement(By.xpath('option[@value="'+selectedValue+'"]')).then(selectedOption => {return selectedOption.getText().then(selectedLabel => {return expect(selectedLabel).toBe(\`${
        command.value
      }\`);});});});});`
    )
  })
  it('should emit `assert value` command', () => {
    const command = {
      command: 'assertValue',
      target: 'id=test',
      value: 'test',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      `await driver.wait(until.elementLocated(By.id(\`test\`)), configuration.timeout);await expect(driver.findElement(By.id(\`test\`))).resolves.toHaveValue(\`${
        command.value
      }\`);`
    )
  })
  it('should emit `assert text` command', () => {
    const command = {
      command: 'assertText',
      target: 'id=test',
      value: 'some text that should be here',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      `await driver.wait(until.elementLocated(By.id(\`test\`)), configuration.timeout);await expect(driver.findElement(By.id(\`test\`))).resolves.toHaveText(\`${
        command.value
      }\`);`
    )
  })
  it('should emit `store` command', () => {
    const command = {
      command: 'store',
      target: 'some value',
      value: 'myVar',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      `vars["${command.value}"] = \`${command.target}\`;`
    )
  })
  it('should emit `store text` command', () => {
    const command = {
      command: 'storeText',
      target: 'id=someElement',
      value: 'myVar',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      `await driver.wait(until.elementLocated(By.id(\`someElement\`)), configuration.timeout);await driver.findElement(By.id(\`someElement\`)).then(element => {return element.getText().then(text => {return vars["${
        command.value
      }"] = text;});});`
    )
  })
  it('should emit `store json` command', () => {
    const command = {
      command: 'storeJson',
      target: '[{"a":0}]',
      value: 'myVar',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      `vars["${command.value}"] = JSON.parse('[{"a":0}]');`
    )
  })
  it('should emit `store value` command', () => {
    const command = {
      command: 'storeValue',
      target: 'id=someElement',
      value: 'myVar',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      `await driver.wait(until.elementLocated(By.id(\`someElement\`)), configuration.timeout);await driver.findElement(By.id(\`someElement\`)).then(element => {return element.getAttribute("value").then(value => {return vars["${
        command.value
      }"] = value;});});`
    )
  })
  it('should emit `store title` command', () => {
    const command = {
      command: 'storeTitle',
      target: '',
      value: 'myVar',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      `await driver.getTitle().then(title => {return vars["${
        command.value
      }"] = title;});`
    )
  })
  it('should emit `store window handle` command', () => {
    const command = {
      command: 'storeWindowHandle',
      target: 'windowName',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      `await driver.getWindowHandle().then(handle => {return vars["${
        command.target
      }"] = handle;});`
    )
  })
  it('should emit `store xpath count` command', () => {
    const command = {
      command: 'storeXpathCount',
      target: 'xpath=button',
      value: 'myVar',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      `await driver.findElements(By.xpath(\`button\`)).then(elements => {return vars["${
        command.value
      }"] = elements.length;});`
    )
  })
  it('should emit `store attribute` command', () => {
    const command = {
      command: 'storeAttribute',
      target: 'xpath=button[3]@id',
      value: 'myVar',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      `await driver.wait(until.elementLocated(By.xpath(\`button[3]\`)), configuration.timeout);await driver.findElement(By.xpath(\`button[3]\`)).then(element => element.getAttribute("id").then(attribute => {return vars["${
        command.value
      }"] = attribute;}));`
    )
  })
  it('should emit `select` command', () => {
    const command = {
      command: 'select',
      target: 'css=select',
      value: 'label=A label',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      "await driver.wait(until.elementLocated(By.css(`select`)), configuration.timeout);await driver.findElement(By.css(`select`)).then(element => {return element.findElement(By.xpath(`//option[. = 'A label']`)).then(option => {return option.click();});});"
    )
  })
  it('should emit `add selection` command', () => {
    const command = {
      command: 'addSelection',
      target: 'css=select',
      value: 'label=A label',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      "await driver.wait(until.elementLocated(By.css(`select`)), configuration.timeout);await driver.findElement(By.css(`select`)).then(element => {return element.findElement(By.xpath(`//option[. = 'A label']`)).then(option => {return option.click();});});"
    )
  })
  it('should emit `remove selection` command', () => {
    const command = {
      command: 'removeSelection',
      target: 'css=select',
      value: 'label=A label',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      "await driver.wait(until.elementLocated(By.css(`select`)), configuration.timeout);await driver.findElement(By.css(`select`)).then(element => {return element.findElement(By.xpath(`//option[. = 'A label']`)).then(option => {return option.click();});});"
    )
  })
  it('should emit `select frame` to select the top frame', () => {
    const command = {
      command: 'selectFrame',
      target: 'relative=top',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      'await driver.switchTo().frame();'
    )
  })
  it('should emit `select frame` to select the second frame', () => {
    const command = {
      command: 'selectFrame',
      target: 'index=1',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      'await driver.switchTo().frame(1);'
    )
  })
  it('should emit `select frame` to select a frame by locator', () => {
    const command = {
      command: 'selectFrame',
      target: 'id=frame',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      'await driver.findElement(By.id(`frame`)).then(frame => {return driver.switchTo().frame(frame);});'
    )
  })
  it('should fail to emit `select window` by using unknown locator', () => {
    const command = {
      command: 'selectWindow',
      target: 'notExisting=something',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).rejects.toThrow(
      'Can only emit `select window` using handles'
    )
  })
  it('should emit `select window` to select a window by handle', () => {
    const command = {
      command: 'selectWindow',
      target: 'handle=${window}',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      'await driver.switchTo().window(`${vars.window}`);'
    )
  })
  it('should emit `select window` to select a window by name', () => {
    const command = {
      command: 'selectWindow',
      target: 'name=window',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      'await driver.switchTo().window(`window`);'
    )
  })
  it('should emit `select window` to select a window by the local keyword', () => {
    const command = {
      command: 'selectWindow',
      target: 'win_ser_local',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      'await driver.switchTo().window((await driver.getAllWindowHandles())[0]);'
    )
  })
  it('should emit `select window` to select a window by implicit index', () => {
    const command = {
      command: 'selectWindow',
      target: 'win_ser_12',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      'await driver.switchTo().window((await driver.getAllWindowHandles())[12]);'
    )
  })
  it('should emit `mouse down` event', () => {
    const command = {
      command: 'mouseDown',
      target: 'id=button',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toMatchSnapshot()
  })
  it('should emit `mouse down at` event', () => {
    const command = {
      command: 'mouseDownAt',
      target: 'id=button',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toMatchSnapshot()
  })
  it('should emit `mouse up` event', () => {
    const command = {
      command: 'mouseUp',
      target: 'id=button',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toMatchSnapshot()
  })
  it('should emit `mouse up at` event', () => {
    const command = {
      command: 'mouseUpAt',
      target: 'id=button',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toMatchSnapshot()
  })
  it('should emit `mouse move` event', () => {
    const command = {
      command: 'mouseMove',
      target: 'id=button',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toMatchSnapshot()
  })
  it('should emit `mouse move at` event', () => {
    const command = {
      command: 'mouseMoveAt',
      target: 'id=button',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toMatchSnapshot()
  })
  it('should emit `mouse over` event', () => {
    const command = {
      command: 'mouseOver',
      target: 'id=button',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toMatchSnapshot()
  })
  it('should emit `mouse out` event', () => {
    const command = {
      command: 'mouseOut',
      target: 'id=button',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toMatchSnapshot()
  })
  it('should emit `assert alert` command', () => {
    const command = {
      command: 'assertAlert',
      target: 'an alert',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      `await driver.switchTo().alert().then(alert => {return alert.getText().then(text => {expect(text).toBe(\`${
        command.target
      }\`);return alert.accept();});});`
    )
  })
  it('should emit `assert confirmation` command', () => {
    const command = {
      command: 'assertConfirmation',
      target: 'a confirmation',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      `await driver.switchTo().alert().then(alert => {return alert.getText().then(text => {return expect(text).toBe(\`${
        command.target
      }\`);});});`
    )
  })
  it('should emit `assert not text` command', () => {
    const command = {
      command: 'assertNotText',
      target: 'id=test',
      value: 'text',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      `await driver.wait(until.elementLocated(By.id(\`test\`)), configuration.timeout);await driver.findElement(By.id(\`test\`)).then(element => {return element.getText().then(text => {return expect(text).not.toBe(\`${
        command.value
      }\`)});});`
    )
  })
  it('should emit `assert prompt` command', () => {
    const command = {
      command: 'assertPrompt',
      target: 'a prompt',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      `await driver.switchTo().alert().then(alert => {return alert.getText().then(text => {return expect(text).toBe(\`${
        command.target
      }\`);});});`
    )
  })
  it('should emit `choose ok on visible confirmation` command', () => {
    const command = {
      command: 'webdriverChooseOkOnVisibleConfirmation',
      target: '',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      'await driver.switchTo().alert().then(alert => {return alert.accept();});'
    )
  })
  it('should emit `choose cancel on visible confirmation` command', () => {
    const command = {
      command: 'webdriverChooseCancelOnVisibleConfirmation',
      target: '',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      'await driver.switchTo().alert().then(alert => {return alert.dismiss();});'
    )
  })
  it('should emit `answer on visible prompt` command', () => {
    const command = {
      command: 'webdriverAnswerOnVisiblePrompt',
      target: 'an answer',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      `await driver.switchTo().alert().then(alert => {return alert.sendKeys(\`${
        command.target
      }\`).then(() => {return alert.accept();});});`
    )
  })
  it('should emit `choose cancel on visible prompt` command', () => {
    const command = {
      command: 'webdriverChooseCancelOnVisiblePrompt',
      target: '',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      'await driver.switchTo().alert().then(alert => {return alert.dismiss();});'
    )
  })
  it('should emit `edit content` command', () => {
    const command = {
      command: 'editContent',
      target: 'id=contentEditable',
      value: '<button>test</button>',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      `await driver.wait(until.elementLocated(By.id(\`contentEditable\`)), configuration.timeout);await driver.findElement(By.id(\`contentEditable\`)).then(element => {return driver.executeScript(\`if(arguments[0].contentEditable === 'true') {arguments[0].innerHTML = '${
        command.value
      }'}\`, element);});`
    )
  })
  it('should emit `submit` command', () => {
    const command = {
      command: 'submit',
      target: 'id=form',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      'await driver.wait(until.elementLocated(By.id(`form`)), configuration.timeout);await driver.findElement(By.id(`form`)).then(element => {return element.submit();});'
    )
  })
  it('should skip playback supported commands, that are not supported in webdriver', () => {
    return Promise.all([
      expect(
        CommandEmitter.emit({ command: 'answerOnNextPrompt' })
      ).resolves.toBeUndefined(),
      expect(
        CommandEmitter.emit({ command: 'chooseCancelOnNextConfirmation' })
      ).resolves.toBeUndefined(),
      expect(
        CommandEmitter.emit({ command: 'chooseCancelOnNextPrompt' })
      ).resolves.toBeUndefined(),
      expect(
        CommandEmitter.emit({ command: 'chooseOkOnNextConfirmation' })
      ).resolves.toBeUndefined(),
    ])
  })
  it('should emit `set speed`', () => {
    expect(CommandEmitter.emit({ command: 'setSpeed' })).resolves.toBe(
      "console.warn('`set speed` is a no-op in the runner, use `pause instead`');"
    )
  })
  it('should emit all known commands', () => {
    Commands.array.forEach(command => {
      expect(() => {
        if (!CommandEmitter.canEmit(command)) {
          throw new Error(`${command} has no emitter, write one!`)
        }
      }).not.toThrow()
    })
  })
  it('should skip emitting stdlib command when skipStdLibEmitting is set', () => {
    const command = {
      command: 'open',
      target: '/',
      value: '',
    }
    return expect(
      CommandEmitter.emit(command, { skipStdLibEmitting: true })
    ).resolves.toEqual({ skipped: true })
  })
  it('should emit a snapshot for a non-stdlib command when skipStdLibEmitting is set', () => {
    const command = {
      command: 'aNewCommand',
      target: '',
      value: '',
    }
    registerEmitter(command.command, () => 'new command code')
    return expect(
      CommandEmitter.emit(command, { skipStdLibEmitting: true })
    ).resolves.toBe('new command code')
  })
  it('should throw an error for an invalid non-stdlib command even when skipStdLibEmitting is set', () => {
    const command = {
      command: 'errorCommand',
      target: '',
      value: '',
    }
    registerEmitter(command.command, () => {
      throw new Error('an error occurred')
    })
    return expect(
      CommandEmitter.emit(command, { skipStdLibEmitting: true })
    ).rejects.toThrow('an error occurred')
  })
  it('should not throw an error for an unknown command when skipStdLibEmitting is set', () => {
    const command = {
      command: 'doesntExist',
      target: '',
      value: '',
    }
    return expect(
      CommandEmitter.emit(command, { skipStdLibEmitting: true })
    ).resolves.toEqual({ skipped: true })
  })
  it('should return the snapshot when an unknown command is being emitted with snapshot sent', () => {
    const command = {
      command: 'doesntExist',
      target: '',
      value: '',
    }
    const snapshot = 'this commands snapshot'
    return expect(
      CommandEmitter.emit(command, undefined, snapshot)
    ).resolves.toBe(snapshot)
  })
  it('should emit `if` command', () => {
    const command = {
      command: ControlFlowCommandNames.if,
      target: 'true',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      `if (!!await driver.executeScript(\`return (${command.target})\`)) {`
    )
  })
  it('should emit `else if` command', () => {
    const command = {
      command: ControlFlowCommandNames.elseIf,
      target: 'true',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      `} else if (!!await driver.executeScript(\`return (${
        command.target
      })\`)) {`
    )
  })
  it('should emit `else` command', () => {
    const command = {
      command: ControlFlowCommandNames.else,
      target: 'true',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe('} else {')
  })
  it('should emit `times` command', () => {
    const command = {
      command: ControlFlowCommandNames.times,
      target: '5',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      `const times = ${command.target};for(let i = 0; i < times; i++) {`
    )
  })
  it('should emit `while` command', () => {
    const command = {
      command: ControlFlowCommandNames.while,
      target: 'true',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      `while (!!await driver.executeScript(\`return (${command.target})\`)) {`
    )
  })
  it('should emit `end` command', () => {
    const command = {
      command: ControlFlowCommandNames.end,
      target: '',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe('}')
  })
  it('should emit `do` command', () => {
    const command = {
      command: ControlFlowCommandNames.do,
      target: '',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe('do {')
  })
  it('should emit `repeatIf` command', () => {
    const command = {
      command: ControlFlowCommandNames.repeatIf,
      target: 'true',
      value: '',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      `} while (!!await driver.executeScript(\`return (${command.target})\`));`
    )
  })
  it('should emit `forEach` command', () => {
    const command = {
      command: ControlFlowCommandNames.forEach,
      target: 'collection',
      value: 'iterator',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      `for (let i = 0; i < vars["collection"].length - 1; i++) {vars["iterator"] = vars["collection"][i];`
    )
  })
  it('should emit `assert` command', () => {
    const command = {
      command: 'assert',
      target: 'varrrName',
      value: 'true',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      'expect(`${vars["' +
        command.target +
        '"]}` == "' +
        command.value +
        '").toBeTruthy();'
    )
  })
  it('should emit `verify` command', () => {
    const command = {
      command: 'verify',
      target: 'varrrName',
      value: 'true',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      'expect(`${vars["' +
        command.target +
        '"]}` == "' +
        command.value +
        '").toBeTruthy();'
    )
  })
  it('should preprocess stored variables', () => {
    const command = {
      command: 'type',
      target: 'id=test',
      value: '${test}',
    }
    return expect(CommandEmitter.emit(command)).resolves.toMatch(
      'element.sendKeys(`${vars.test}`);'
    )
  })
  it('should emit `waitForElementPresent` command', () => {
    const command = {
      command: 'waitForElementPresent',
      target: 'css=#blah',
      value: '5000',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      'await driver.wait(until.elementLocated(By.css(`#blah`)), 5000);'
    )
  })
  it('should emit `waitForElementNotPresent` command', () => {
    const command = {
      command: 'waitForElementNotPresent',
      target: 'css=#blah',
      value: '5000',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      'await driver.wait(until.stalenessOf(await driver.findElement(By.css(`#blah`))), 5000);'
    )
  })
  it('should emit `waitForElementVisible` command', () => {
    const command = {
      command: 'waitForElementVisible',
      target: 'css=#blah',
      value: '5000',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      'await driver.wait(until.elementIsVisible(await driver.findElement(By.css(`#blah`))), 5000);'
    )
  })
  it('should emit `waitForElementNotVisible` command', () => {
    const command = {
      command: 'waitForElementNotVisible',
      target: 'css=#blah',
      value: '5000',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      'await driver.wait(until.elementIsNotVisible(await driver.findElement(By.css(`#blah`))), 5000);'
    )
  })
  it('should emit `waitForElementEditable` command', () => {
    const command = {
      command: 'waitForElementEditable',
      target: 'css=#blah',
      value: '5000',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      'await driver.wait(until.elementIsEnabled(await driver.findElement(By.css(`#blah`))), 5000);'
    )
  })
  it('should emit `waitForElementNotEditable` command', () => {
    const command = {
      command: 'waitForElementNotEditable',
      target: 'css=#blah',
      value: '5000',
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      'await driver.wait(until.elementIsDisabled(await driver.findElement(By.css(`#blah`))), 5000);'
    )
  })
  it('should emit new window handling, if command opens a new window', () => {
    const command = {
      command: 'click',
      target: 'css=button',
      value: '',
      opensWindow: true,
      windowHandleName: 'newWin',
      windowTimeout: 2000,
    }
    return expect(CommandEmitter.emit(command)).resolves.toBe(
      'vars.__handles = await driver.getAllWindowHandles();await driver.wait(until.elementLocated(By.css(`button`)), configuration.timeout);await driver.findElement(By.css(`button`)).then(element => {return element.click();});vars.newWin = await utils.waitForWindow(driver, vars.__handles, 2000);'
    )
  })
})
