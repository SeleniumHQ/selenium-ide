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

import Command from '../../src/command'
import {
  Commands,
  ControlFlowCommandNames,
} from '../../../selenium-ide/src/neo/models/Command'
import { opts } from '../../src/index'
import exporter from 'code-export-utils'

const commandPrefixPadding = opts.commandPrefixPadding

async function prettify(command, { fullPayload } = {}) {
  const commandBlock = await Command.emit(command)
  const result = exporter.prettify(commandBlock, {
    commandPrefixPadding,
  })
  return fullPayload ? result : result.body
}

describe('command code emitter', () => {
  it('should emit all known commands', () => {
    let result = []
    Commands.array.forEach(command => {
      if (!Command.canEmit(command)) {
        result.push(command)
      }
    })
    expect(() => {
      if (result.length) {
        if (result.length === 1) {
          throw new Error(`${result[0]} has no emitter, write one!`)
        } else {
          throw new Error(`No emitters for ${result.join(', ')}. Write them!`)
        }
      }
    }).not.toThrow()
  })
  it('should emit `add selection` command', () => {
    const command = {
      command: 'addSelection',
      target: 'css=select',
      value: 'label=A label',
    }
    return expect(prettify(command)).resolves.toBe(
      `dropdown = self.driver.find_element(By.CSS_SELECTOR, "select")\ndropdown.find_element(By.XPATH, "//option[. = 'A label']").click()`
    )
  })
  it('should emit `assert` command', () => {
    const command = {
      command: 'assert',
      target: 'varrrName',
      value: 'blah',
    }
    expect(prettify(command)).resolves.toBe(
      `assert(self.vars["varrrName"] == "blah")`
    )
  })
  it('should emit `assert alert` command', () => {
    const command = {
      command: 'assertAlert',
      target: 'an alert',
      value: '',
    }
    return expect(prettify(command)).resolves.toBe(
      `assert self.driver.switch_to.alert.text == "an alert"`
    )
  })
  it('should emit `assert checked` command', () => {
    const command = {
      command: 'assertChecked',
      target: 'id=check',
      value: '',
    }
    return expect(prettify(command)).resolves.toBe(
      `assert self.driver.find_element(By.ID, "check").is_selected() is True`
    )
  })
  it('should emit `assert confirmation` command', () => {
    const command = {
      command: 'assertConfirmation',
      target: 'a confirmation',
      value: '',
    }
    return expect(prettify(command)).resolves.toBe(
      `assert self.driver.switch_to.alert.text == "a confirmation"`
    )
  })
  it('should emit `assert editable` command', () => {
    const command = {
      command: 'assertEditable',
      target: 'id=text',
      value: '',
    }
    return expect(prettify(command)).resolves.toBe(
      `element = self.driver.find_element(By.ID, "text")\nis_editable = element.is_enabled() and element.get_attribute("readonly") == None\nassert is_editable is True`
    )
  })
  it('should emit `assert element present` command', () => {
    const command = {
      command: 'assertElementPresent',
      target: 'id=element',
      value: '',
    }
    return expect(prettify(command)).resolves.toBe(
      `elements = self.driver.find_elements(By.ID, "element")\nassert len(elements) > 0`
    )
  })
  it('should emit `assert element not present` command', () => {
    const command = {
      command: 'assertElementNotPresent',
      target: 'id=element',
      value: '',
    }
    return expect(prettify(command)).resolves.toBe(
      `elements = self.driver.find_elements(By.ID, "element")\nassert len(elements) == 0`
    )
  })
  it('should emit `assert not checked` command', () => {
    const command = {
      command: 'assertNotChecked',
      target: 'id=check',
      value: '',
    }
    return expect(prettify(command)).resolves.toBe(
      `assert self.driver.find_element(By.ID, "check").is_selected() is False`
    )
  })
  it('should emit `assert not editable` command', () => {
    const command = {
      command: 'assertNotEditable',
      target: 'id=text',
      value: '',
    }
    return expect(prettify(command)).resolves.toBe(
      `element = self.driver.find_element(By.ID, "text")\nis_editable = element.is_enabled() and element.get_attribute("readonly") == None\nassert is_editable is False`
    )
  })
  it('should emit `assert not selected value` command', () => {
    const command = {
      command: 'assertNotSelectedValue',
      target: 'id=select',
      value: 'test',
    }
    return expect(prettify(command)).resolves.toBe(
      `value = self.driver.find_element(By.ID, "select").get_attribute("value")\nassert value != "test"`
    )
  })
  it('should emit `assert not text` command', () => {
    const command = {
      command: 'assertNotText',
      target: 'id=test',
      value: 'text',
    }
    return expect(prettify(command)).resolves.toBe(
      `text = self.driver.find_element(By.ID, "test").text\nassert text != "text"`
    )
  })
  it('should emit `assert prompt` command', () => {
    const command = {
      command: 'assertPrompt',
      target: 'a prompt',
      value: '',
    }
    return expect(prettify(command)).resolves.toBe(
      `assert self.driver.switch_to.alert.text == "a prompt"`
    )
  })
  it("should emit 'assert selected label' command", () => {
    const command = {
      command: 'assertSelectedLabel',
      target: 'id=test',
      value: 'test',
    }
    return expect(prettify(command)).resolves.toBe(
      `element = self.driver.find_element(By.ID, "test")\nlocator = "option[@value='{}']".format(element.get_attribute("value"))\nselected_text = element.find_element(By.XPATH, locator).text\nassert selected_text == "test"`
    )
  })
  it('should emit `assert selected value` command', () => {
    const command = {
      command: 'assertSelectedValue',
      target: 'id=select',
      value: 'test',
    }
    return expect(prettify(command)).resolves.toBe(
      `value = self.driver.find_element(By.ID, "select").get_attribute("value")\nassert value == "test"`
    )
  })
  it('should emit `assert text` command', () => {
    const command = {
      command: 'assertText',
      target: 'id=test',
      value: 'some text that should be here',
    }
    expect(prettify(command)).resolves.toBe(
      `assert self.driver.find_element(By.ID, "test").text == "some text that should be here"`
    )
  })
  it('should emit `assert title` command', () => {
    const command = {
      command: 'assertTitle',
      target: 'example title',
      value: '',
    }
    return expect(prettify(command)).resolves.toBe(
      `assert self.driver.title == "example title"`
    )
  })
  it('should emit `assert value` command', () => {
    const command = {
      command: 'assertValue',
      target: 'id=select',
      value: 'test',
    }
    return expect(prettify(command)).resolves.toBe(
      `value = self.driver.find_element(By.ID, "select").get_attribute("value")\nassert value == "test"`
    )
  })
  it('should emit `click` command', () => {
    const command = {
      command: 'click',
      target: 'link=button',
      value: '',
    }
    return expect(prettify(command)).resolves.toBe(
      `self.driver.find_element(By.LINK_TEXT, "button").click()`
    )
  })
  it('should emit `click at` command', () => {
    const command = {
      command: 'clickAt',
      target: 'link=button',
      value: '',
    }
    return expect(prettify(command)).resolves.toBe(
      `self.driver.find_element(By.LINK_TEXT, "button").click()`
    )
  })
  it('should emit `check` command', () => {
    const command = {
      command: 'check',
      target: 'id=f',
      value: '',
    }
    return expect(prettify(command)).resolves.toBe(
      `element = self.driver.find_element(By.ID, "f")\nif element.is_selected() != True: element.click()`
    )
  })
  it('should emit `close` command', () => {
    const command = {
      command: 'close',
      target: '',
      value: '',
    }
    return expect(prettify(command)).resolves.toBe(`self.driver.close()`)
  })
  it('should emit `do` command', () => {
    const command = {
      command: ControlFlowCommandNames.do,
      target: '',
      value: '',
    }
    return expect(prettify(command, { fullPayload: true })).resolves.toEqual({
      body: 'condition = True\nwhile condition:',
      endingLevel: 1,
    })
  })
  it('should emit `double click` command', () => {
    const command = {
      command: 'doubleClick',
      target: 'link=button',
      value: '',
    }
    return expect(prettify(command)).resolves.toBe(
      `element = self.driver.find_element(By.LINK_TEXT, "button")\nactions = ActionChains(driver)\nactions.double_click(element).perform()`
    )
  })
  it('should emit `double click at` command', () => {
    const command = {
      command: 'doubleClickAt',
      target: 'link=button',
      value: '',
    }
    return expect(prettify(command)).resolves.toBe(
      `element = self.driver.find_element(By.LINK_TEXT, "button")\nactions = ActionChains(driver)\nactions.double_click(element).perform()`
    )
  })
  it('should emit `drag and drop to object` command', () => {
    const command = {
      command: 'dragAndDropToObject',
      target: 'link=dragged',
      value: 'link=dropped',
    }
    return expect(prettify(command)).resolves.toBe(
      `dragged = self.driver.find_element(By.LINK_TEXT, "dragged")\ndropped = self.driver.find_element(By.LINK_TEXT, "dropped")\nactions = ActionChains(driver)\nactions.drag_and_drop(dragged, dropped).perform()`
    )
  })
  it('should emit `echo` command', () => {
    const command = {
      command: 'echo',
      target: 'blah',
      value: '',
    }
    return expect(prettify(command)).resolves.toBe(`print(str("blah"))`)
  })
  it('should emit `echo` command with variables', () => {
    const command = {
      command: 'echo',
      target: '${blah}',
      value: '',
    }
    return expect(prettify(command)).resolves.toBe(
      `print(str(self.vars["blah"]))`
    )
  })
  it('should emit `edit content` command', () => {
    const command = {
      command: 'editContent',
      target: 'id=contentEditable',
      value: '<button>test</button>',
    }
    return expect(prettify(command)).resolves.toBe(
      `element = self.driver.find_element(By.ID, "contentEditable")\nself.driver.execute_script("if(arguments[0].contentEditable === 'true') {arguments[0].innerText = '<button>test</button>'}", element)`
    )
  })
  it('should emit `else` command', () => {
    const command = {
      command: ControlFlowCommandNames.else,
      target: 'true',
      value: '',
    }
    return expect(prettify(command, { fullPayload: true })).resolves.toEqual({
      body: `else:`,
      endingLevel: 1,
    })
  })
  it('should emit `else if` command', () => {
    const command = {
      command: ControlFlowCommandNames.elseIf,
      target: 'true',
      value: '',
    }
    return expect(prettify(command, { fullPayload: true })).resolves.toEqual({
      body: `elif self.driver.execute_script("return (true)"):`,
      endingLevel: 1,
    })
  })
  it('should emit `end` command', async () => {
    const command = {
      command: ControlFlowCommandNames.end,
      target: '',
      value: '',
    }
    return expect(prettify(command, { fullPayload: true })).resolves.toEqual({
      endingLevel: 0,
      skipEmitting: true,
    })
  })
  it('should emit `execute script` command', () => {
    const command = {
      command: 'executeScript',
      target: 'javascript',
      value: 'myVar',
    }
    return expect(prettify(command)).resolves.toBe(
      `self.vars["myVar"] = self.driver.execute_script("javascript")`
    )
  })
  it('should emit `execute script` command with return string value', () => {
    const command = {
      command: 'executeScript',
      target: 'return "a"',
      value: 'myVar',
    }
    return expect(prettify(command)).resolves.toBe(
      `self.vars["myVar"] = self.driver.execute_script("return 'a'")`
    )
  })
  it('should emit `execute async script` command', () => {
    const command = {
      command: 'executeAsyncScript',
      target: 'javascript',
      value: 'myVar',
    }
    return expect(prettify(command)).resolves.toBe(
      `self.vars["myVar"] = self.driver.execute_async_script("var callback = arguments[arguments.length - 1];javascript.then(callback).catch(callback);")`
    )
  })
  it('should emit `forEach` command', () => {
    const command = {
      command: ControlFlowCommandNames.forEach,
      target: 'collection',
      value: 'iteratorVar',
    }
    return expect(prettify(command, { fullPayload: true })).resolves.toEqual({
      body: `collection = self.vars["collection"]\nfor entry in collection:\n${commandPrefixPadding}self.vars["iteratorVar"] = entry`,
      endingLevel: 1,
    })
  })
  it('should emit `if` command', () => {
    const command = {
      command: ControlFlowCommandNames.if,
      target: 'true',
      value: '',
    }
    return expect(prettify(command, { fullPayload: true })).resolves.toEqual({
      body: `if self.driver.execute_script("return (true)"):`,
      endingLevel: 1,
    })
  })
  it('should emit `mouse down` command', () => {
    const command = {
      command: 'mouseDown',
      target: 'id=button',
      value: '',
    }
    return expect(prettify(command)).resolves.toBe(
      `element = self.driver.find_element(By.ID, "button")\nactions = ActionChains(driver)\nactions.move_to_element(element).click_and_hold().perform()`
    )
  })
  it('should emit `mouse down at` event', () => {
    const command = {
      command: 'mouseDownAt',
      target: 'id=button',
      value: '',
    }
    return expect(prettify(command)).resolves.toBe(
      `element = self.driver.find_element(By.ID, "button")\nactions = ActionChains(driver)\nactions.move_to_element(element).click_and_hold().perform()`
    )
  })
  it('should emit `mouse move` event', () => {
    const command = {
      command: 'mouseMove',
      target: 'id=button',
      value: '',
    }
    return expect(prettify(command)).resolves.toBe(
      `element = self.driver.find_element(By.ID, "button")\nactions = ActionChains(driver)\nactions.move_to_element(element).perform()`
    )
  })
  it('should emit `mouse move at` event', () => {
    const command = {
      command: 'mouseMoveAt',
      target: 'id=button',
      value: '',
    }
    return expect(prettify(command)).resolves.toBe(
      `element = self.driver.find_element(By.ID, "button")\nactions = ActionChains(driver)\nactions.move_to_element(element).perform()`
    )
  })
  it('should emit `mouse out` event', () => {
    const command = {
      command: 'mouseOut',
      target: 'id=button',
      value: '',
    }
    return expect(prettify(command)).resolves.toBe(
      `element = self.driver.find_element(By.CSS_SELECTOR, "body")\nactions = ActionChains(driver)\nactions.move_to_element(element, 0, 0).perform()`
    )
  })
  it('should emit `mouse over` event', () => {
    const command = {
      command: 'mouseOver',
      target: 'id=button',
      value: '',
    }
    return expect(prettify(command)).resolves.toBe(
      `element = self.driver.find_element(By.ID, "button")\nactions = ActionChains(driver)\nactions.move_to_element(element).perform()`
    )
  })
  it('should emit `mouse up` event', () => {
    const command = {
      command: 'mouseUp',
      target: 'id=button',
      value: '',
    }
    return expect(prettify(command)).resolves.toBe(
      `element = self.driver.find_element(By.ID, "button")\nactions = ActionChains(driver)\nactions.move_to_element(element).release().perform()`
    )
  })
  it('should emit `mouse up at` event', () => {
    const command = {
      command: 'mouseUpAt',
      target: 'id=button',
      value: '',
    }
    return expect(prettify(command)).resolves.toBe(
      `element = self.driver.find_element(By.ID, "button")\nactions = ActionChains(driver)\nactions.move_to_element(element).release().perform()`
    )
  })
  it('should emit `open` with absolute url', () => {
    const command = {
      command: 'open',
      target: 'https://www.seleniumhq.org/',
      value: '',
    }
    return expect(prettify(command)).resolves.toBe(
      `self.driver.get("${command.target}")`
    )
  })
  it('should emit `pause` command', () => {
    const command = {
      command: 'pause',
      target: '300',
      value: '',
    }
    return expect(prettify(command)).resolves.toBe(`time.sleep(300)`)
  })
  it('should emit `remove selection` command', () => {
    const command = {
      command: 'removeSelection',
      target: 'css=select',
      value: 'label=A label',
    }
    return expect(prettify(command)).resolves.toBe(
      `dropdown = self.driver.find_element(By.CSS_SELECTOR, "select")\ndropdown.find_element(By.XPATH, "//option[. = 'A label']").click()`
    )
  })
  it('should emit `repeatIf` command', () => {
    const command = {
      command: ControlFlowCommandNames.repeatIf,
      target: 'true',
      value: '',
    }
    return expect(prettify(command)).resolves.toBe(
      `condition = self.driver.execute_script("return (true)")`
    )
  })
  it('should emit `run` command', () => {
    const command = {
      command: 'run',
      target: 'some test case',
      value: '',
    }
    return expect(prettify(command)).resolves.toBe(`self.sometestcase()`)
  })
  it('should emit `run script` command', () => {
    const command = {
      command: 'runScript',
      target: "alert('test');alert('Im annoying');",
      value: '',
    }
    return expect(prettify(command)).resolves.toBe(
      `self.driver.execute_script("alert('test');alert('Im annoying');")`
    )
  })
  it('should emit `select` command', () => {
    const command = {
      command: 'select',
      target: 'css=select',
      value: 'label=A label',
    }
    return expect(prettify(command)).resolves.toBe(
      `dropdown = self.driver.find_element(By.CSS_SELECTOR, "select")\ndropdown.find_element(By.XPATH, "//option[. = 'A label']").click()`
    )
  })
  it('should emit `select frame` to select the top frame', () => {
    const command = {
      command: 'selectFrame',
      target: 'relative=top',
      value: '',
    }
    return expect(prettify(command)).resolves.toBe(
      `self.driver.switch_to.default_content()`
    )
  })
  it('should fail to emit `select window` by using unknown locator', () => {
    const command = {
      command: 'selectWindow',
      target: 'notExisting=something',
      value: '',
    }
    return expect(prettify(command)).rejects.toThrow(
      'Can only emit `select window` using handles'
    )
  })
  it('should emit `select window` to select a window by handle', () => {
    const command = {
      command: 'selectWindow',
      target: 'handle=${window}',
      value: '',
    }
    return expect(prettify(command)).resolves.toBe(
      `self.driver.switch_to.window(self.vars["window"])`
    )
  })
  it('should emit `select window` to select a window by name', () => {
    const command = {
      command: 'selectWindow',
      target: 'name=window',
      value: '',
    }
    return expect(prettify(command)).resolves.toBe(
      `self.driver.switch_to.window("window")`
    )
  })
  it('should emit `select window` to select a window by the local keyword', () => {
    const command = {
      command: 'selectWindow',
      target: 'win_ser_local',
      value: '',
    }
    return expect(prettify(command)).resolves.toBe(
      `self.driver.switch_to.window(self.driver.window_handles[0])`
    )
  })
  it('should emit `select window` to select a window by implicit index', () => {
    const command = {
      command: 'selectWindow',
      target: 'win_ser_12',
      value: '',
    }
    return expect(prettify(command)).resolves.toBe(
      `self.driver.switch_to.window(self.driver.window_handles[12])`
    )
  })
  it('should emit `send keys` command', () => {
    const command = {
      command: 'sendKeys',
      target: 'id=input',
      value: 'example input',
    }
    return expect(prettify(command)).resolves.toBe(
      `self.driver.find_element(By.ID, "input").send_keys("example input")`
    )
  })
  it('should emit `send keys` command with a variable input', () => {
    const command = {
      command: 'sendKeys',
      target: 'id=input',
      value: '${blah}',
    }
    return expect(prettify(command)).resolves.toBe(
      `self.driver.find_element(By.ID, "input").send_keys(self.vars["blah"])`
    )
  })
  it('should emit `send keys` command with a key press', () => {
    const command = {
      command: 'sendKeys',
      target: 'id=input',
      value: 'SuperSecretPassword!${KEY_ENTER}',
    }
    return expect(prettify(command)).resolves.toBe(
      `self.driver.find_element(By.ID, "input").send_keys("SuperSecretPassword!", Keys.ENTER)`
    )
  })
  it('should emit `set speed`', () => {
    expect(prettify({ command: 'setSpeed' })).resolves.toBe(
      'print("`set speed` is a no-op in code export, use `pause` instead")'
    )
  })
  it('should emit `setWindowSize`', () => {
    const command = {
      command: 'setWindowSize',
      target: '1440x1177',
      value: '',
    }
    expect(prettify(command)).resolves.toBe(
      `self.driver.set_window_size(1440, 1177)`
    )
  })
  it('should skip playback supported commands, that are not supported in webdriver', () => {
    return Promise.all([
      expect(prettify({ command: 'answerOnNextPrompt' })).resolves.toBe(
        undefined
      ),
      expect(
        prettify({ command: 'chooseCancelOnNextConfirmation' })
      ).resolves.toBe(undefined),
      expect(prettify({ command: 'chooseCancelOnNextPrompt' })).resolves.toBe(
        undefined
      ),
      expect(prettify({ command: 'chooseOkOnNextConfirmation' })).resolves.toBe(
        undefined
      ),
    ])
  })
  it('should emit `store` command', () => {
    const command = {
      command: 'store',
      target: 'some value',
      value: 'myVar',
    }
    return expect(prettify(command)).resolves.toBe(
      `self.vars["myVar"] = "some value"`
    )
  })
  it('should emit `store attribute` command', () => {
    const command = {
      command: 'storeAttribute',
      target: 'xpath=button[3]@id',
      value: 'myVar',
    }
    return expect(prettify(command)).resolves.toBe(
      `attribute = self.driver.find_element(By.XPATH, "button[3]").get_attribute("id")\nself.vars["myVar"] = attribute`
    )
  })
  it('should emit `store text` command', () => {
    const command = {
      command: 'storeText',
      target: 'id=someElement',
      value: 'myVar',
    }
    return expect(prettify(command)).resolves.toBe(
      `self.vars["myVar"] = self.driver.find_element(By.ID, "someElement").text`
    )
  })
  it('should emit `store json` command', () => {
    const command = {
      command: 'storeJson',
      target: '[{"a":0}]',
      value: 'myVar',
    }
    return expect(prettify(command)).resolves.toBe(
      `self.vars["myVar"] = json.loads([{"a":0}])`
    )
  })
  it('should emit `store title` command', () => {
    const command = {
      command: 'storeTitle',
      target: '',
      value: 'myVar',
    }
    return expect(prettify(command)).resolves.toBe(
      `self.vars["myVar"] = self.driver.title`
    )
  })
  it('should emit `store value` command', () => {
    const command = {
      command: 'storeValue',
      target: 'id=someElement',
      value: 'myVar',
    }
    return expect(prettify(command)).resolves.toBe(
      `self.vars["myVar"] = self.driver.find_element(By.ID, "someElement").get_attribute("value")`
    )
  })
  it('should emit `store window handle` command', () => {
    const command = {
      command: 'storeWindowHandle',
      target: 'windowName',
      value: '',
    }
    return expect(prettify(command)).resolves.toBe(
      `self.vars["windowName"] = self.driver.current_window_handle`
    )
  })
  it('should emit `store xpath count` command', () => {
    const command = {
      command: 'storeXpathCount',
      target: 'xpath=button',
      value: 'myVar',
    }
    return expect(prettify(command)).resolves.toBe(
      `self.vars["myVar"] = len(self.driver.find_elements(By.XPATH, "button"))`
    )
  })
  it('should emit `submit` command', () => {
    const command = {
      command: 'submit',
      target: 'id=form',
      value: '',
    }
    return expect(prettify(command)).resolves.toBe(
      `raise Exception("\`submit\` is not a supported command in Selenium Webself.driver. Please re-record the step in the IDE.")`
    )
  })
  it('should emit `times` command', () => {
    const command = {
      command: ControlFlowCommandNames.times,
      target: '5',
      value: '',
    }
    return expect(prettify(command, { fullPayload: true })).resolves.toEqual({
      body: `for i in range(0, 5):`,
      endingLevel: 1,
    })
  })
  it('should emit `type` command', () => {
    const command = {
      command: 'type',
      target: 'id=input',
      value: 'example input',
    }
    expect(prettify(command)).resolves.toBe(
      `self.driver.find_element(By.ID, "input").send_keys("example input")`
    )
  })
  it('should emit `uncheck` command', () => {
    const command = {
      command: 'uncheck',
      target: 'id=f',
      value: '',
    }
    return expect(prettify(command)).resolves.toBe(
      `element = self.driver.find_element(By.ID, "f")\nif element.is_selected: element.click()`
    )
  })
  it('should emit `verify` command', () => {
    const command = {
      command: 'verify',
      target: 'varrrName',
      value: 'blah',
    }
    expect(prettify(command)).resolves.toBe(
      `assert(self.vars["varrrName"] == "blah")`
    )
  })
  it('should emit `verify checked` command', () => {
    const command = {
      command: 'verifyChecked',
      target: 'id=check',
      value: '',
    }
    return expect(prettify(command)).resolves.toBe(
      `assert self.driver.find_element(By.ID, "check").is_selected() is True`
    )
  })
  it('should emit `verify editable` command', () => {
    const command = {
      command: 'verifyEditable',
      target: 'id=text',
      value: '',
    }
    return expect(prettify(command)).resolves.toBe(
      `element = self.driver.find_element(By.ID, "text")\nis_editable = element.is_enabled() and element.get_attribute("readonly") == None\nassert is_editable is True`
    )
  })
  it('should emit `verify element present` command', () => {
    const command = {
      command: 'verifyElementPresent',
      target: 'id=element',
      value: '',
    }
    return expect(prettify(command)).resolves.toBe(
      `elements = self.driver.find_elements(By.ID, "element")\nassert len(elements) > 0`
    )
  })
  it('should emit `verify element not present` command', () => {
    const command = {
      command: 'verifyElementNotPresent',
      target: 'id=element',
      value: '',
    }
    return expect(prettify(command)).resolves.toBe(
      `elements = self.driver.find_elements(By.ID, "element")\nassert len(elements) == 0`
    )
  })
  it('should emit `verify not checked` command', () => {
    const command = {
      command: 'verifyNotChecked',
      target: 'id=check',
      value: '',
    }
    return expect(prettify(command)).resolves.toBe(
      `assert self.driver.find_element(By.ID, "check").is_selected() is False`
    )
  })
  it('should emit `verify not editable` command', () => {
    const command = {
      command: 'verifyNotEditable',
      target: 'id=text',
      value: '',
    }
    return expect(prettify(command)).resolves.toBe(
      `element = self.driver.find_element(By.ID, "text")\nis_editable = element.is_enabled() and element.get_attribute("readonly") == None\nassert is_editable is False`
    )
  })
  it('should emit `verify not selected value` command', () => {
    const command = {
      command: 'verifyNotSelectedValue',
      target: 'id=select',
      value: 'test',
    }
    return expect(prettify(command)).resolves.toBe(
      `value = self.driver.find_element(By.ID, "select").get_attribute("value")\nassert value != "test"`
    )
  })
  it('should emit `verify not text` command', () => {
    const command = {
      command: 'verifyNotText',
      target: 'id=test',
      value: 'text',
    }
    return expect(prettify(command)).resolves.toBe(
      `text = self.driver.find_element(By.ID, "test").text\nassert text != "text"`
    )
  })
  it("should emit 'verify selected label' command", () => {
    const command = {
      command: 'verifySelectedLabel',
      target: 'id=test',
      value: 'test',
    }
    return expect(prettify(command)).resolves.toBe(
      `element = self.driver.find_element(By.ID, "test")\nlocator = "option[@value='{}']".format(element.get_attribute("value"))\nselected_text = element.find_element(By.XPATH, locator).text\nassert selected_text == "test"`
    )
  })
  it('should emit `verify value` command', () => {
    const command = {
      command: 'verifyValue',
      target: 'id=select',
      value: 'test',
    }
    return expect(prettify(command)).resolves.toBe(
      `value = self.driver.find_element(By.ID, "select").get_attribute("value")\nassert value == "test"`
    )
  })
  it('should emit `verify selected value` command', () => {
    const command = {
      command: 'verifySelectedValue',
      target: 'id=select',
      value: 'test',
    }
    return expect(prettify(command)).resolves.toBe(
      `value = self.driver.find_element(By.ID, "select").get_attribute("value")\nassert value == "test"`
    )
  })
  it('should emit `verify text` command', () => {
    const command = {
      command: 'verifyText',
      target: 'id=test',
      value: 'some text that should be here',
    }
    expect(prettify(command)).resolves.toBe(
      `assert self.driver.find_element(By.ID, "test").text == "some text that should be here"`
    )
  })
  it('should emit `verify title` command', () => {
    const command = {
      command: 'verifyTitle',
      target: 'example title',
      value: '',
    }
    return expect(prettify(command)).resolves.toBe(
      `assert self.driver.title == "example title"`
    )
  })
  it('should emit `waitForElementEditable` command', () => {
    const command = {
      command: 'waitForElementEditable',
      target: 'css=#blah',
      value: '5000',
    }
    return expect(prettify(command)).resolves.toBe(
      `WebDriverWait(self.driver, 5000).until(expected_conditions.element_to_be_clickable(By.CSS_SELECTOR, "#blah"))`
    )
  })
  it('should emit `waitForElementPresent` command', () => {
    const command = {
      command: 'waitForElementPresent',
      target: 'css=#blah',
      value: '5000',
    }
    return expect(prettify(command)).resolves.toBe(
      `WebDriverWait(self.driver, 5000).until(expected_conditions.presence_of_element_located(By.CSS_SELECTOR, "#blah"))`
    )
  })
  it('should emit `waitForElementVisible` command', () => {
    const command = {
      command: 'waitForElementVisible',
      target: 'css=#blah',
      value: '5000',
    }
    return expect(prettify(command)).resolves.toBe(
      `WebDriverWait(self.driver, 5000).until(expected_conditions.visibility_of_element_located(By.CSS_SELECTOR, "#blah"))`
    )
  })
  it('should emit `waitForElementNotEditable` command', () => {
    const command = {
      command: 'waitForElementNotEditable',
      target: 'css=#blah',
      value: '5000',
    }
    return expect(prettify(command)).resolves.toBe(
      `WebDriverWait(self.driver, 5000).until(!expected_conditions.element_to_be_clickable(By.CSS_SELECTOR, "#blah"))`
    )
  })
  it('should emit `waitForElementNotPresent` command', () => {
    const command = {
      command: 'waitForElementNotPresent',
      target: 'css=#blah',
      value: '5000',
    }
    return expect(prettify(command)).resolves.toBe(
      `WebDriverWait(self.driver, 5000).until(!expected_conditions.presence_of_element_located(By.CSS_SELECTOR, "#blah"))`
    )
  })
  it('should emit `waitForElementNotVisible` command', () => {
    const command = {
      command: 'waitForElementNotVisible',
      target: 'css=#blah',
      value: '5000',
    }
    return expect(prettify(command)).resolves.toBe(
      `WebDriverWait(self.driver, 5000).until(!expected_conditions.visibility_of_element_located(By.CSS_SELECTOR, "#blah"))`
    )
  })
  it('should emit `answer on visible prompt` command', () => {
    const command = {
      command: 'webdriverAnswerOnVisiblePrompt',
      target: 'an answer',
      value: '',
    }
    return expect(prettify(command)).resolves.toBe(
      `alert = self.driver.switch_to.alert\nalert.send_keys("an answer")\nalert.accept()`
    )
  })
  it('should emit `choose cancel on visible prompt` command', () => {
    const command = {
      command: 'webdriverChooseCancelOnVisiblePrompt',
      target: '',
      value: '',
    }
    return expect(prettify(command)).resolves.toBe(
      `self.driver.switch_to.alert.dismiss()`
    )
  })
  it('should emit `choose ok on visible confirmation` command', () => {
    const command = {
      command: 'webdriverChooseOkOnVisibleConfirmation',
      target: '',
      value: '',
    }
    return expect(prettify(command)).resolves.toBe(
      `self.driver.switch_to.alert.accept()`
    )
  })
  it('should emit `while` command', () => {
    const command = {
      command: ControlFlowCommandNames.while,
      target: 'true',
      value: '',
    }
    return expect(prettify(command, { fullPayload: true })).resolves.toEqual({
      body: `while self.driver.execute_script("return (true)"):`,
      endingLevel: 1,
    })
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
    return expect(prettify(command)).resolves.toBe(
      `self.vars["window_handles"] = self.driver.window_handles\nself.driver.find_element(By.CSS_SELECTOR, "button").click()\nself.vars["newWin"] = self.wait_for_window(2000)`
    )
  })
})
