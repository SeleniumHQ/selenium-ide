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

import { Command, location } from '@seleniumhq/code-export-csharp-commons'
import { codeExport as exporter } from '@seleniumhq/side-code-export'
import { CommandShape } from '@seleniumhq/side-model'

const emitters = { ...Command.emitters }

exporter.register.preprocessors(emitters)

function emit(command: CommandShape) {
  return exporter.emit.command(command, emitters[command.command], {
    variableLookup: Command.variableLookup,
    emitNewWindowHandling: Command.extras.emitNewWindowHandling,
  })
}

emitters.assert = emitAssert
emitters.verify = emitAssert

function emitAssert(varName: string, value: string) {
  return Promise.resolve(
    `Assert.Equal(vars["${varName}"].ToString(), "${value}");`
  )
}

emitters.assertAlert = emitAssertAlert
emitters.assertConfirmation = emitAssertAlert
emitters.assertPrompt = emitAssertAlert

function emitAssertAlert(AlertText: string) {
  return Promise.resolve(
    `Assert.Equal(driver.SwitchTo().Alert().Text, "${AlertText}");`
  )
}

emitters.assertChecked = emitVerifyChecked
emitters.verifyChecked = emitVerifyChecked

async function emitVerifyChecked(locator: string) {
  return Promise.resolve(
    `Assert.True(driver.FindElement(${await location.emit(locator)}).Selected);`
  )
}

emitters.assertEditable = emitVerifyEditable
emitters.verifyEditable = emitVerifyEditable

async function emitVerifyEditable(locator: string) {
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

emitters.assertElementPresent = emitVerifyElementPresent
emitters.verifyElementPresent = emitVerifyElementPresent

async function emitVerifyElementPresent(locator: string) {
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

emitters.assertElementNotPresent = emitVerifyElementNotPresent
emitters.verifyElementNotPresent = emitVerifyElementNotPresent

async function emitVerifyElementNotPresent(locator: string) {
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

emitters.assertNotChecked = emitVerifyNotChecked
emitters.verifyNotChecked = emitVerifyNotChecked

async function emitVerifyNotChecked(locator: string) {
  return Promise.resolve(
    `Assert.False(driver.FindElement(${await location.emit(
      locator
    )}).Selected);`
  )
}

emitters.assertNotEditable = emitVerifyNotEditable
emitters.verifyNotEdtiable = emitVerifyNotEditable

async function emitVerifyNotEditable(locator: string) {
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

emitters.assertNotSelectedValue = emitVerifyNotSelectedValue
emitters.verifyNotSelectedValue = emitVerifyNotSelectedValue

async function emitVerifyNotSelectedValue(locator: string, expectedValue: string) {
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

emitters.assertNotText = emitVerifyNotText
emitters.verifyNotText = emitVerifyNotText

async function emitVerifyNotText(locator: string, text: string) {
  const result = `driver.FindElement(${await location.emit(locator)}).Text`
  return Promise.resolve(
    `Assert.NotEqual(${result}, "${exporter.emit.text(text)}");`
  )
}

emitters.assertSelectedLabel = emitVerifySelectedLabel
emitters.verifySelectedLabel = emitVerifySelectedLabel

async function emitVerifySelectedLabel(locator: string, labelValue: string) {
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

emitters.assertSelectedValue = emitVerifyValue
emitters.verifySelectedValue = emitVerifyValue
emitters.assertValue = emitVerifyValue

async function emitVerifyValue(locator: string, value: string) {
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

emitters.assertText = emitVerifyText
emitters.verifyText = emitVerifyText

async function emitVerifyText(locator: string, text: string) {
  return Promise.resolve(
    `Assert.Equal(driver.FindElement(${await location.emit(
      locator
    )}).Text, "${exporter.emit.text(text)}");`
  )
}

emitters.assertTitle = emitVerifyTitle
emitters.verifyTitle = emitVerifyTitle

async function emitVerifyTitle(title: string) {
  return Promise.resolve(`Assert.Equal(driver.Title, "${title}");`)
}

export default {
  ...Command,
  emit,
  emitters,
}
