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

import generate from 'project-name-generator'
import { CommandsArray } from '../models/Command'
import Command from '../models/Command'
import UiState from './view/UiState'

export default function seed(store, numberOfSuites = 0) {
  function generateSuite() {
    return store.createSuite(generate({ words: 2 }).spaced)
  }
  function generateTestCase() {
    return store.createTestCase(generate({ words: 2 }).spaced)
  }
  const targets = ['a', 'button']
  function generateCommand(test) {
    const command = test.createCommand()
    command.setCommand(
      CommandsArray[Math.floor(Math.random() * CommandsArray.length)]
    )
    let targetChance = Math.floor(Math.random() * 10)
    command.setTarget(
      targetChance < targets.length ? targets[targetChance] : ''
    )
    command.setValue(
      Math.floor(Math.random() * 2) ? generate({ words: 1 }).spaced : ''
    )
    return command
  }
  function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min)) + min
  }
  for (let i = 0; i < numberOfSuites; i++) {
    let suite = generateSuite()
    for (let j = 0; j < randomBetween(3, 6); j++) {
      const testCase = generateTestCase()
      for (let k = 0; k < randomBetween(9, 16); k++) {
        generateCommand(testCase)
      }
      suite.addTestCase(testCase)
    }
  }

  const url = 'http://the-internet.herokuapp.com'
  store.setUrl(url)
  store.addUrl(url)

  const yeeOldTest = store.createTestCase('send KEY_ENTER')
  yeeOldTest.createCommand(
    undefined,
    'open',
    'https://en.wikipedia.org/wiki/Main_Page'
  )
  yeeOldTest.createCommand(undefined, 'type', 'id=searchInput', 'selenium')
  yeeOldTest.createCommand(
    undefined,
    'sendKeys',
    'id=searchInput',
    '${KEY_ENTER}'
  )

  const controlFlowIfTest = store.createTestCase('control flow if')
  controlFlowIfTest.createCommand(
    undefined,
    'executeScript',
    'return "a"',
    'myVar'
  )
  controlFlowIfTest.createCommand(undefined, 'if', '${myVar} === "a"')
  controlFlowIfTest.createCommand(
    undefined,
    'executeScript',
    'return "a"',
    'output'
  )
  controlFlowIfTest.createCommand(undefined, 'elseIf', '${myVar} === "b"')
  controlFlowIfTest.createCommand(
    undefined,
    'executeScript',
    'return "b"',
    'output'
  )
  controlFlowIfTest.createCommand(undefined, 'else')
  controlFlowIfTest.createCommand(
    undefined,
    'executeScript',
    'return "c"',
    'output'
  )
  controlFlowIfTest.createCommand(undefined, 'end')
  controlFlowIfTest.createCommand(undefined, 'assert', 'output', 'a')

  const controlFlowElseIfTest = store.createTestCase('control flow else if')
  controlFlowElseIfTest.createCommand(
    undefined,
    'executeScript',
    'return "b"',
    'myVar'
  )
  controlFlowElseIfTest.createCommand(undefined, 'if', '${myVar} === "a"')
  controlFlowElseIfTest.createCommand(
    undefined,
    'executeScript',
    'return "a"',
    'output'
  )
  controlFlowElseIfTest.createCommand(undefined, 'elseIf', '${myVar} === "b"')
  controlFlowElseIfTest.createCommand(
    undefined,
    'executeScript',
    'return "b"',
    'output'
  )
  controlFlowElseIfTest.createCommand(undefined, 'else')
  controlFlowElseIfTest.createCommand(
    undefined,
    'executeScript',
    'return "c"',
    'output'
  )
  controlFlowElseIfTest.createCommand(undefined, 'end')
  controlFlowElseIfTest.createCommand(undefined, 'assert', 'output', 'b')

  const controlFlowElseTest = store.createTestCase('control flow else')
  controlFlowElseTest.createCommand(
    undefined,
    'executeScript',
    'return "c"',
    'myVar'
  )
  controlFlowElseTest.createCommand(undefined, 'if', '${myVar} === "a"')
  controlFlowElseTest.createCommand(
    undefined,
    'executeScript',
    'return "a"',
    'output'
  )
  controlFlowElseTest.createCommand(undefined, 'elseIf', '${myVar} === "b"')
  controlFlowElseTest.createCommand(
    undefined,
    'executeScript',
    'return "b"',
    'output'
  )
  controlFlowElseTest.createCommand(undefined, 'else')
  controlFlowElseTest.createCommand(
    undefined,
    'executeScript',
    'return "c"',
    'output'
  )
  controlFlowElseTest.createCommand(undefined, 'end')
  controlFlowElseTest.createCommand(undefined, 'assert', 'output', 'c')

  const controlFlowDoTest = store.createTestCase('control flow do')
  controlFlowDoTest.createCommand(
    undefined,
    'executeScript',
    'return 1',
    'check'
  )
  controlFlowDoTest.createCommand(undefined, 'do')
  controlFlowDoTest.createCommand(
    undefined,
    'executeScript',
    'return ${check} + 1',
    'check'
  )
  controlFlowDoTest.createCommand(undefined, 'repeatIf', '${check} < 3')
  controlFlowDoTest.createCommand(undefined, 'assert', 'check', '3')

  const controlFlowTimesTest = store.createTestCase('control flow times')
  controlFlowTimesTest.createCommand(
    undefined,
    'executeScript',
    'return 1',
    'check'
  )
  controlFlowTimesTest.createCommand(undefined, 'times', '2')
  controlFlowTimesTest.createCommand(
    undefined,
    'executeScript',
    'return ${check} + 1',
    'check'
  )
  controlFlowTimesTest.createCommand(undefined, 'end')
  controlFlowTimesTest.createCommand(undefined, 'assert', 'check', '3')

  const controlFlowWhileTest = store.createTestCase('control flow while')
  controlFlowWhileTest.createCommand(
    undefined,
    'executeScript',
    'return 1',
    'check'
  )
  controlFlowWhileTest.createCommand(undefined, 'while', '${check} < 3')
  controlFlowWhileTest.createCommand(
    undefined,
    'executeScript',
    'return ${check} + 1',
    'check'
  )
  controlFlowWhileTest.createCommand(undefined, 'end')
  controlFlowWhileTest.createCommand(undefined, 'assert', 'check', '3')

  const controlFlowForEachTest = store.createTestCase('control flow for each')
  controlFlowForEachTest.createCommand(
    undefined,
    'executeScript',
    'return 0',
    'count'
  )
  controlFlowForEachTest.createCommand(
    undefined,
    'executeScript',
    `return [{'a': 0}, {'a': 1}, {'a': 2}, {'a': 3}, {'a': '4'}]`,
    'collection'
  )
  controlFlowForEachTest.createCommand(
    undefined,
    'forEach',
    'collection',
    'iteratorVar'
  )
  controlFlowForEachTest.createCommand(
    undefined,
    'executeScript',
    'return ${count} == ${iteratorVar}.a',
    'result'
  )
  controlFlowForEachTest.createCommand(undefined, 'assert', 'result', 'true')
  controlFlowForEachTest.createCommand(
    undefined,
    'executeScript',
    'return ${count} += 1',
    'count'
  )
  controlFlowForEachTest.createCommand(undefined, 'end')

  const controlFlowForEachNestedTest = store.createTestCase(
    'control flow for each (nested)'
  )
  controlFlowForEachNestedTest.createCommand(
    undefined,
    'executeScript',
    `return 0`,
    'count'
  )
  controlFlowForEachNestedTest.createCommand(
    undefined,
    'executeScript',
    `return [[1,2,3,4,5],[6,7,8,9,10],[11,12,13,14,15]]`,
    'numbersCol'
  )
  controlFlowForEachNestedTest.createCommand(
    undefined,
    'forEach',
    'numbersCol',
    'numbers'
  )
  controlFlowForEachNestedTest.createCommand(
    undefined,
    'forEach',
    'numbers',
    'number'
  )
  controlFlowForEachNestedTest.createCommand(
    undefined,
    'executeScript',
    'return ${count} + 1',
    'count'
  )
  controlFlowForEachNestedTest.createCommand(undefined, 'end')
  controlFlowForEachNestedTest.createCommand(undefined, 'end')
  controlFlowForEachNestedTest.createCommand(undefined, 'assert', 'count', '15')

  const executeScriptTest = store.createTestCase('execute script')
  executeScriptTest.createCommand(
    undefined,
    'executeScript',
    'return true',
    'blah'
  )
  executeScriptTest.createCommand(undefined, 'assert', 'blah', 'true')
  executeScriptTest.createCommand(undefined, 'executeScript', 'true')
  executeScriptTest.createCommand(undefined, 'echo', '${blah}')

  const executeScriptArray = store.createTestCase('execute script array')
  executeScriptArray.createCommand(
    undefined,
    'executeScript',
    'return [1,2,3]',
    'x'
  )
  executeScriptArray.createCommand(
    undefined,
    'executeScript',
    'return ${x}[0] + 1',
    'y'
  )
  executeScriptArray.createCommand(undefined, 'assert', 'y', '2')

  const executeScriptObject = store.createTestCase('execute script object')
  executeScriptObject.createCommand(
    undefined,
    'executeScript',
    'return { x: 3 }',
    'x'
  )
  executeScriptObject.createCommand(
    undefined,
    'executeScript',
    'return ${x}.x + 2',
    'y'
  )
  executeScriptObject.createCommand(undefined, 'assert', 'y', '5')

  const executeScriptPrimitives = store.createTestCase(
    'execute script primitives'
  )
  executeScriptPrimitives.createCommand(
    undefined,
    'executeScript',
    'return true',
    'bool'
  )
  executeScriptPrimitives.createCommand(undefined, 'assert', 'bool', 'true')
  executeScriptPrimitives.createCommand(
    undefined,
    'executeScript',
    'return 3.14',
    'float'
  )
  executeScriptPrimitives.createCommand(undefined, 'assert', 'float', '3.14')
  executeScriptPrimitives.createCommand(
    undefined,
    'executeScript',
    'return "test"',
    'string'
  )
  executeScriptPrimitives.createCommand(undefined, 'assert', 'string', 'test')

  const checkTest = store.createTestCase('check')
  checkTest.createCommand(undefined, 'open', '/checkboxes')
  const command = checkTest.createCommand(undefined, 'check', 'css=input')
  command.setTargets([
    ['id=something', 'id'],
    ['name=something-else', 'name'],
    ['linkText=number density', 'linkText'],
    ["xpath=//a[contains(text(),'number density')]", 'xpath:link'],
    ['css=main .class > p a.link', 'css'],
    ["xpath=(//a[contains(text(),'number line')])[2]", 'xpath:link'],
    ["(//a[contains(text(),'number line')])[2]", 'xpath:link'],
    ["//a[contains(text(),'number density')]", 'xpath:link'],
    ["//div[@id='mw-content-text']/div/p[2]/a[5]", 'xpath:idRelative'],
    ["//a[contains(@href, '/wiki/Number_density')]", 'xpath:href'],
    ['//a[5]', 'xpath:position'],
  ])
  checkTest.createCommand(undefined, 'assertChecked', 'css=input')
  checkTest.createCommand(undefined, 'uncheck', 'css=input')
  checkTest.createCommand(undefined, 'assertNotChecked', 'css=input')

  const clickTest = store.createTestCase('click')
  clickTest.createCommand(undefined, 'open', '/')
  clickTest.createCommand(undefined, 'click', 'linkText=Dropdown')
  clickTest.createCommand(undefined, 'assertText', 'css=h3', 'Dropdown List')
  clickTest.createCommand(undefined, 'open', '/')
  clickTest.createCommand(undefined, 'click', 'link=Dropdown')
  clickTest.createCommand(undefined, 'assertText', 'css=h3', 'Dropdown List')
  clickTest.createCommand(undefined, 'open', '/')
  clickTest.createCommand(undefined, 'click', 'partialLinkText=ropd')
  clickTest.createCommand(undefined, 'assertText', 'css=h3', 'Dropdown List')

  const clickAtTest = store.createTestCase('click at')
  clickAtTest.createCommand(undefined, 'open', '/')
  clickAtTest.createCommand(undefined, 'clickAt', 'css=a')

  const commentTest = store.createTestCase('comment')
  commentTest.createCommand(undefined, '//commented code')
  commentTest.createCommand(undefined, '', '', '', 'blah')
  commentTest.createCommand(undefined, '', '', '')
  commentTest.createCommand(undefined, 'open', '/', '', 'also blah')

  const framesTest = store.createTestCase('frames')
  framesTest.createCommand(undefined, 'open', '/nested_frames')
  framesTest.createCommand(undefined, 'selectFrame', 'index=0')
  framesTest.createCommand(undefined, 'selectFrame', 'index=1')
  framesTest.createCommand(undefined, 'assertText', 'css=#content', 'MIDDLE')
  framesTest.createCommand(undefined, 'selectFrame', 'relative=parent')
  framesTest.createCommand(undefined, 'selectFrame', 'index=1')
  framesTest.createCommand(undefined, 'assertText', 'css=#content', 'MIDDLE')
  framesTest.createCommand(undefined, 'selectFrame', 'relative=top')
  framesTest.createCommand(undefined, 'selectFrame', 'index=0')
  framesTest.createCommand(undefined, 'selectFrame', 'index=1')
  framesTest.createCommand(undefined, 'assertText', 'css=#content', 'MIDDLE')

  const selectTest = store.createTestCase('select')
  selectTest.createCommand(undefined, 'open', '/dropdown')
  selectTest.createCommand(undefined, 'select', 'id=dropdown', 'value=1')
  selectTest.createCommand(undefined, 'assertSelectedValue', 'id=dropdown', '1')
  selectTest.createCommand(
    undefined,
    'assertNotSelectedValue',
    'id=dropdown',
    '2'
  )
  selectTest.createCommand(
    undefined,
    'assertSelectedLabel',
    'id=dropdown',
    'Option 1'
  )
  selectTest.createCommand(undefined, 'select', 'id=dropdown', 'Option 2')
  selectTest.createCommand(undefined, 'assertSelectedValue', 'id=dropdown', '2')
  selectTest.createCommand(
    undefined,
    'assertNotSelectedValue',
    'id=dropdown',
    '1'
  )
  selectTest.createCommand(
    undefined,
    'assertSelectedLabel',
    'id=dropdown',
    'Option 2'
  )

  const sendKeysTest = store.createTestCase('send keys')
  sendKeysTest.createCommand(undefined, 'open', '/login')
  sendKeysTest.createCommand(undefined, 'sendKeys', 'css=#username', 'tomsmith')
  sendKeysTest.createCommand(
    undefined,
    'sendKeys',
    "xpath=//input[@id='password']",
    'SuperSecretPassword!${KEY_ENTER}'
  )
  sendKeysTest.createCommand(
    undefined,
    'assertText',
    'id=flash',
    'You logged into a secure area!\\n×'
  )

  const storeTextTest = store.createTestCase('store text')
  storeTextTest.createCommand(undefined, 'open', '/login')
  storeTextTest.createCommand(undefined, 'sendKeys', 'css=#username', 'blah')
  storeTextTest.createCommand(undefined, 'storeValue', 'css=#username', 'aVar')
  storeTextTest.createCommand(undefined, 'assert', 'aVar', 'blah')

  const submitTest = store.createTestCase('submit')
  submitTest.createCommand(undefined, 'open', '/login')
  submitTest.createCommand(undefined, 'sendKeys', 'css=#username', 'tomsmith')
  submitTest.createCommand(
    undefined,
    'sendKeys',
    'css=#password',
    'SuperSecretPassword!'
  )
  submitTest.createCommand(undefined, 'submit', 'css=#login')
  submitTest.createCommand(
    undefined,
    'assertElementPresent',
    'css=.flash.success'
  )

  const waitTest1 = store.createTestCase('wait for element present')
  waitTest1.createCommand(undefined, 'open', '/dynamic_loading/2')
  waitTest1.createCommand(undefined, 'clickAt', 'css=#start button')
  waitTest1.createCommand(
    undefined,
    'waitForElementPresent',
    'css=#finish',
    '5000'
  )
  waitTest1.createCommand(
    undefined,
    'assertText',
    'css=#finish',
    'Hello World!'
  )

  const waitTest2 = store.createTestCase('wait for element not present')
  waitTest2.createCommand(undefined, 'open', '/dynamic_controls')
  waitTest2.createCommand(undefined, 'clickAt', 'css=#checkbox-example button')
  waitTest2.createCommand(
    undefined,
    'waitForElementNotPresent',
    'css=#checkbox',
    '5000'
  )
  waitTest2.createCommand(undefined, 'assertElementNotPresent', 'css=#checkbox')

  const waitTest3 = store.createTestCase('wait for element visible')
  waitTest3.createCommand(undefined, 'open', '/dynamic_loading/1')
  waitTest3.createCommand(undefined, 'clickAt', 'css=#start button')
  waitTest3.createCommand(
    undefined,
    'waitForElementVisible',
    'css=#finish',
    '5000'
  )
  waitTest3.createCommand(
    undefined,
    'assertText',
    'css=#finish',
    'Hello World!'
  )

  const waitTest4 = store.createTestCase('wait for element not visible')
  waitTest4.createCommand(undefined, 'open', '/dynamic_loading/1')
  waitTest4.createCommand(undefined, 'clickAt', 'css=#start button')
  waitTest4.createCommand(
    undefined,
    'waitForElementNotVisible',
    'css=#loading',
    '5000'
  )
  waitTest4.createCommand(
    undefined,
    'assertText',
    'css=#finish',
    'Hello World!'
  )

  const waitTest5 = store.createTestCase(
    'wait for element editable (and not editable)'
  )
  waitTest5.createCommand(undefined, 'open', '/dynamic_controls')
  waitTest5.createCommand(undefined, 'clickAt', 'css=#input-example button')
  waitTest5.createCommand(
    undefined,
    'waitForElementEditable',
    'css=#input-example input',
    '5000'
  )
  waitTest5.createCommand(
    undefined,
    'assertEditable',
    'css=#input-example input'
  )
  waitTest5.createCommand(undefined, 'clickAt', 'css=#input-example button')
  waitTest5.createCommand(
    undefined,
    'waitForElementNotEditable',
    'css=#input-example input',
    '5000'
  )
  waitTest5.createCommand(
    undefined,
    'assertNotEditable',
    'css=#input-example input'
  )

  const waitTest6 = store.createTestCase('wait for text')
  waitTest6.createCommand(undefined, 'open', '/dynamic_loading/1')
  waitTest6.createCommand(undefined, 'clickAt', 'css=#start button')
  waitTest6.createCommand(
    undefined,
    'waitForText',
    'css=#finish',
    'Hello World!'
  )
  waitTest6.createCommand(
    undefined,
    'assertText',
    'css=#finish',
    'Hello World!'
  )

  const locatorFallbackTest = store.createTestCase('locator fallback')
  locatorFallbackTest.createCommand(undefined, 'open', '/dynamic_loading/2')
  locatorFallbackTest.createCommand(undefined, 'click', 'css=button')
  const locatorFallbackTestCommand = new Command(
    undefined,
    'clickAt',
    'css=#finis > h4'
  )
  locatorFallbackTestCommand.setTargets([
    ['css=#finis > h4', 'css'],
    ['css=#finish > h4', 'css'],
  ])
  locatorFallbackTest.addCommand(locatorFallbackTestCommand)
  locatorFallbackTest.createCommand(
    undefined,
    'assertText',
    'css=#finish > h4',
    'Hello World!'
  )

  const confirmationDialogTest = store.createTestCase('confirmation dialog')
  confirmationDialogTest.createCommand(undefined, 'open', '/javascript_alerts')
  confirmationDialogTest.createCommand(
    undefined,
    'chooseOkOnNextConfirmation',
    ''
  )
  confirmationDialogTest.createCommand(
    undefined,
    'click',
    'css=li:nth-child(2) > button'
  )
  confirmationDialogTest.createCommand(
    undefined,
    'assertConfirmation',
    'I am a JS Confirm'
  )
  confirmationDialogTest.createCommand(
    undefined,
    'webdriverChooseOkOnVisibleConfirmation',
    ''
  )

  const selectWindow = store.createTestCase('select window')
  selectWindow.createCommand(undefined, 'open', '/')
  selectWindow.createCommand(undefined, 'storeWindowHandle', 'handle')
  selectWindow.createCommand(undefined, 'echo', '${handle}')
  const click = selectWindow.createCommand(
    undefined,
    'click',
    'linkText=Elemental Selenium'
  )
  click.setOpensWindow(true)
  click.setWindowHandleName('newWindow')
  selectWindow.createCommand(undefined, 'assertTitle', 'The Internet')
  selectWindow.createCommand(undefined, 'selectWindow', 'handle=${handle}')
  selectWindow.createCommand(undefined, 'assertTitle', 'The Internet')
  selectWindow.createCommand(undefined, 'selectWindow', 'handle=${newWindow}')
  selectWindow.createCommand(
    undefined,
    'assertTitle',
    'Elemental Selenium: Receive a Free, Weekly Tip on Using Selenium like a Pro'
  )
  selectWindow.createCommand(undefined, 'close')
  selectWindow.createCommand(undefined, 'selectWindow', 'handle=${handle}')
  selectWindow.createCommand(undefined, 'assertTitle', 'The Internet')

  const login = store.createTestCase('login')
  login.createCommand(undefined, 'open', '/login')
  login.createCommand(undefined, 'sendKeys', 'id=username', '${username}')
  login.createCommand(undefined, 'sendKeys', 'id=password', '${password}')
  login.createCommand(undefined, 'click', 'css=#login button')

  const reuse = store.createTestCase('reuse')
  reuse.createCommand(undefined, 'store', 'tomsmith', 'username')
  reuse.createCommand(undefined, 'store', 'SuperSecretPassword!', 'password')
  reuse.createCommand(undefined, 'run', 'login')
  reuse.createCommand(
    undefined,
    'assertText',
    'id=flash',
    'You logged into a secure area!\\n×'
  )

  const storeJson = store.createTestCase('store json')
  storeJson.createCommand(undefined, 'storeJson', `[{"a":0}]`, 'blah')
  storeJson.createCommand(
    undefined,
    'executeScript',
    'return ${blah}.length == 1',
    'result'
  )
  storeJson.createCommand(undefined, 'assert', 'result', 'true')

  const accessVariable = store.createTestCase('access variable')
  accessVariable.createCommand(
    undefined,
    'storeJson',
    `{"a": [{"b":0}, {"b":1}]}`,
    'blah'
  )
  accessVariable.createCommand(undefined, 'store', '${blah.a[0].b}', 'result')
  accessVariable.createCommand(undefined, 'assert', 'result', '0')

  const accessVariableAssert = store.createTestCase('access variable assert')
  accessVariableAssert.createCommand(undefined, 'storeJson', `{"a":0}`, 'blah')
  accessVariableAssert.createCommand(undefined, 'assert', 'blah.a', '0')

  const accessVariableArray = store.createTestCase('access variable array')
  accessVariableArray.createCommand(
    undefined,
    'storeJson',
    `[{"a":0}, {"a":1}]`,
    'blah'
  )
  accessVariableArray.createCommand(undefined, 'assert', 'blah[1].a', '1')

  const accessVariableNestedJson = store.createTestCase(
    'access variable nested json'
  )
  accessVariableNestedJson.createCommand(
    undefined,
    'storeJson',
    `[{"a":[{"b":0}, {"b":{"c":1}}]}, {"a":2}]`,
    'blah'
  )
  accessVariableNestedJson.createCommand(
    undefined,
    'assert',
    'blah[0].a[1].b.c',
    '1'
  )

  const accessVariableForEach = store.createTestCase('access variable for each')
  accessVariableForEach.createCommand(
    undefined,
    'executeScript',
    'return 0',
    'result'
  )
  accessVariableForEach.createCommand(
    undefined,
    'storeJson',
    `{"a":[{"b":0}, {"b":1}, {"b":2}]}`,
    'blah'
  )
  accessVariableForEach.createCommand(
    undefined,
    'forEach',
    'blah.a',
    'iterator'
  )
  accessVariableForEach.createCommand(
    undefined,
    'executeScript',
    'return ${result} + ${iterator.b}',
    'result'
  )
  accessVariableForEach.createCommand(undefined, 'end', '', '')
  accessVariableForEach.createCommand(undefined, 'assert', 'result', '3')

  const suiteAll = store.createSuite('all tests')
  store.tests.forEach(function(test) {
    suiteAll.addTestCase(test)
  })

  const suiteControlFlow = store.createSuite('control flow')
  suiteControlFlow.addTestCase(controlFlowIfTest)
  suiteControlFlow.addTestCase(controlFlowElseIfTest)
  suiteControlFlow.addTestCase(controlFlowElseTest)
  suiteControlFlow.addTestCase(controlFlowDoTest)
  suiteControlFlow.addTestCase(controlFlowTimesTest)
  suiteControlFlow.addTestCase(controlFlowWhileTest)
  suiteControlFlow.addTestCase(controlFlowForEachTest)
  suiteControlFlow.addTestCase(controlFlowForEachNestedTest)

  const smokeSuite = store.createSuite('smoke')
  smokeSuite.addTestCase(checkTest)
  smokeSuite.addTestCase(clickTest)
  smokeSuite.addTestCase(clickAtTest)
  smokeSuite.addTestCase(accessVariable)
  smokeSuite.addTestCase(executeScriptTest)
  smokeSuite.addTestCase(executeScriptArray)
  smokeSuite.addTestCase(executeScriptPrimitives)
  smokeSuite.addTestCase(framesTest)
  smokeSuite.addTestCase(selectTest)
  smokeSuite.addTestCase(sendKeysTest)
  smokeSuite.addTestCase(storeTextTest)
  smokeSuite.addTestCase(submitTest)
  smokeSuite.addTestCase(confirmationDialogTest)

  const waitSuite = store.createSuite('waits')
  waitSuite.addTestCase(waitTest1)
  waitSuite.addTestCase(waitTest2)
  waitSuite.addTestCase(waitTest3)
  waitSuite.addTestCase(waitTest4)
  waitSuite.addTestCase(waitTest5)

  UiState.changeView('Test suites')
  suiteAll.setOpen(true)
  UiState.selectTest(checkTest, suiteAll)

  store.changeName('seed project')

  UiState.saved()

  return store
}
