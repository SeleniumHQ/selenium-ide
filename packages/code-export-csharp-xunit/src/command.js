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
import { Command, location } from 'code-export-csharp-commons'

exporter.register.preprocessors(Command.emitters)

function register(command, emitter) {
  exporter.register.emitter({ command, emitter, emitters: Command.emitters })
}

function emit(command) {
  return exporter.emit.command(command, Command.emitters[command.command], {
    variableLookup: Command.variableLookup,
    emitNewWindowHandling: Command.extras.emitNewWindowHandling,
  })
}

function canEmit(commandName) {
  return !!Command.emitters[commandName]
}

Command.emitters.assert = emitAssert
Command.emitters.verify = emitAssert

function emitAssert(varName, value) {
  return Promise.resolve(
    `Assert.Equal(this.vars["${varName}"].ToString(), "${value}");`
  )
}

Command.emitters.assertAlert = emitAssertAlert
Command.emitters.assertConfirmation = emitAssertAlert
Command.emitters.assertPrompt = emitAssertAlert

function emitAssertAlert(AlertText) {
  return Promise.resolve(
    `Assert.Equal(driver.SwitchTo().Alert().Text, "${AlertText}");`
  )
}

Command.emitters.assertChecked = emitVerifyChecked
Command.emitters.verifyChecked = emitVerifyChecked

async function emitVerifyChecked(locator) {
  return Promise.resolve(
    `Assert.True(driver.FindElement(${await location.emit(locator)}).Selected);`
  )
}

Command.emitters.assertEditable = emitVerifyEditable
Command.emitters.verifyEditable = emitVerifyEditable

async function emitVerifyEditable(locator) {
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

Command.emitters.assertElementPresent = emitVerifyElementPresent
Command.emitters.verifyElementPresent = emitVerifyElementPresent

async function emitVerifyElementPresent(locator) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `IReadOnlyCollection<IWebElement> elements = driver.FindElements(${await location.emit(
        locator
      )});`,
    },
    { level: 1, statement: 'Assert.True(elements.Count > 0);' },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

Command.emitters.assertElementNotPresent = emitVerifyElementNotPresent
Command.emitters.verifyElementNotPresent = emitVerifyElementNotPresent

async function emitVerifyElementNotPresent(locator) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `IReadOnlyCollection<IWebElement> elements = driver.FindElements(${await location.emit(
        locator
      )});`,
    },
    { level: 1, statement: 'Assert.True(elements.Count == 0);' },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

Command.emitters.assertNotChecked = emitVerifyNotChecked
Command.emitters.verifyNotChecked = emitVerifyNotChecked

async function emitVerifyNotChecked(locator) {
  return Promise.resolve(
    `Assert.False(driver.FindElement(${await location.emit(
      locator
    )}).Selected);`
  )
}

Command.emitters.assertNotEditable = emitVerifyNotEditable
Command.emitters.verifyNotEdtiable = emitVerifyNotEditable

async function emitVerifyNotEditable(locator) {
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

Command.emitters.assertNotSelectedValue = emitVerifyNotSelectedValue
Command.emitters.verifyNotSelectedValue = emitVerifyNotSelectedValue

async function emitVerifyNotSelectedValue(locator, expectedValue) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `String value = driver.FindElement(${await location.emit(
        locator
      )}).GetAttribute("value");`,
    },
    {
      level: 1,
      statement: `Assert.NotEqual(value, ${exporter.emit.text(
        expectedValue
      )});`,
    },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

Command.emitters.assertNotText = emitVerifyNotText
Command.emitters.verifyNotText = emitVerifyNotText

async function emitVerifyNotText(locator, text) {
  const result = `driver.FindElement(${await location.emit(locator)}).Text`
  return Promise.resolve(
    `Assert.NotEqual(${result}, "${exporter.emit.text(text)}");`
  )
}

Command.emitters.assertSelectedLabel = emitVerifySelectedLabel
Command.emitters.verifySelectedLabel = emitVerifySelectedLabel

async function emitVerifySelectedLabel(locator, labelValue) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `var element = driver.FindElement(${await location.emit(
        locator
      )});`,
    },
    { level: 1, statement: 'String value = element.GetAttribute("value");' },
    {
      level: 1,
      statement: `String locator = String.Format("option[@value='%s']", "value");`,
    },
    {
      level: 1,
      statement:
        'String selectedText = element.FindElement(By.XPath(locator)).Text;',
    },
    {
      level: 1,
      statement: `Assert.Equal(selectedText, "${labelValue}");`,
    },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({
    commands,
  })
}

Command.emitters.assertSelectedValue = emitVerifyValue
Command.emitters.verifySelectedValue = emitVerifyValue
Command.emitters.assertValue = emitVerifyValue

async function emitVerifyValue(locator, value) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `String value = driver.FindElement(${await location.emit(
        locator
      )}).GetAttribute("value");`,
    },
    { level: 1, statement: `Assert.Equal(value, "${value}");` },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

Command.emitters.assertText = emitVerifyText
Command.emitters.verifyText = emitVerifyText

async function emitVerifyText(locator, text) {
  return Promise.resolve(
    `Assert.Equal(driver.FindElement(${await location.emit(
      locator
    )}).Text, "${exporter.emit.text(text)}");`
  )
}

Command.emitters.assertTitle = emitVerifyTitle
Command.emitters.verifyTitle = emitVerifyTitle

async function emitVerifyTitle(title) {
  return Promise.resolve(`Assert.Equal(driver.Title, "${title}");`)
}

export default {
  canEmit,
  emit,
  register,
  extras: { emitWaitForWindow: Command.extras.emitWaitForWindow },
}
