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

//
// New Relic Synthetics
//


import exporter from 'code-export-utils'
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
  forEach: emitControlFlowForEach,
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
  storeJson: emitStoreJson,
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
  waitForElementNotVisible: emitWaitForElementNotPresent,
  webdriverAnswerOnVisiblePrompt: emitAnswerOnNextPrompt,
  webdriverChooseCancelOnVisibleConfirmation: emitChooseCancelOnNextConfirmation,
  webdriverChooseCancelOnVisiblePrompt: emitChooseCancelOnNextConfirmation,
  webdriverChooseOkOnVisibleConfirmation: emitChooseOkOnNextConfirmation,
  while: emitControlFlowWhile,
}

exporter.register.preprocessors(emitters)

function register(command, emitter) {
  exporter.register.emitter({ command, emitter, emitters })
}

function emit(command) {
  return exporter.emit.command(command, emitters[command.command], {
    variableLookup,
    emitNewWindowHandling,
  })
}


function canEmit(commandName) {
  return !!emitters[commandName]
}

function variableLookup(varName) {
  return `vars.get(\"${varName}\")`
}

function variableSetter(varName, value) {
  return varName ? `vars.set("${varName}", ${value});` : ''
}

function emitWaitForWindow() {
}

async function emitNewWindowHandling(command, emittedCommand) {

  let func= await emittedCommand
  let preOp=
    `.then(_=>{\n`+
    `   return $browser.getAllWindowHandles()\n`+
    `   .then(wHandles=>{\n`+
    `       vars.set("window_handles", wHandles);\n`+
    `       return Promise.resolve(true)\n`+
    `    }) \n`+
    `})\n`

    let postOp=
      `.then(_=>{\n`+
      `   return $browser.getAllWindowHandles()\n`+
      `   .then( wHandles=>{\n`+
      `       let prevHandles = new Set(vars.get("window_handles"))\n`+
      `       let currHandles = wHandles\n`+
      `       let diff = new Set ([...currHandles].filter(x => !prevHandles.has(x)))  \n`+
      `       vars.set("${command.windowHandleName.trim()}", diff.values().next().value);\n`+
      `       return Promise.resolve(true)\n`+
      `    })\n`+
      `})\n`

  return Promise.resolve( preOp+ func.commands[0].statement+"\n"+ postOp )
}

function emitAssert(varName, value) {
  let nrcommand=global.nrsynthetics.assert.toString()
    .replace(/__LOG_MSG__/g, `Assert on ${varName} is ${value}`)
    .replace(/__VAR_NAME__/g, varName)
    .replace(/__VALUE__/g, value)

  const commands = [
    { level: 0, statement: `.then( ${nrcommand})` },
  ]
  return Promise.resolve({ commands })


}

function emitAssertAlert(alertText) {

  let nrcommand=global.nrsynthetics.assertAlert.toString()
    .replace(/__LOG_MSG__/g, `Assert on ${alertText}`)
    .replace(/__TEXT__/g, alertText.trim())

  const commands = [
    { level: 0, statement: `.then( ${nrcommand})` },
  ]
  return Promise.resolve({ commands })

}

function emitAnswerOnNextPrompt(textToSend) {

  let nrcommand=global.nrsynthetics.answerOnNextPrompt.toString()
    .replace(/__LOG_MSG__/g, `Send Text ${textToSend} then accept`)
    .replace(/__TEXT__/g, `${textToSend}`)
  const commands = [
    { level: 0, statement: `.then( ${nrcommand})` },
  ]
  return Promise.resolve({ commands })


}

async function emitCheck(locator) {

  const locator1= await location.emit(locator)
  const locator1Msg= locator1.replace(/\'/g, "\\\'").replace(/\"/g, '\\\"')

  let nrcommand=global.nrsynthetics.check.toString()
    .replace(/__LOG_MSG__/g, `Check  ${locator1Msg}`)
    .replace(/__LOCATOR__/g, locator1)

  const commands = [
    { level: 0, statement: `.then( ${nrcommand})` },
  ]
  return Promise.resolve({ commands })

}

function emitChooseCancelOnNextConfirmation() {

  let msg= 'choose cancel on visible prompt'
  let nrcommand=global.nrsynthetics.chooseCancelOnNextConfirmation.toString()
    .replace(/__LOG_MSG__/g, `Check  ${msg}`)

  const commands = [
    { level: 0, statement: `.then( ${nrcommand})` },
  ]
  return Promise.resolve({ commands })


}

function emitChooseOkOnNextConfirmation() {

  let nrcommand=global.nrsynthetics.chooseOkOnNextConfirmation.toString()
    .replace(/__LOG_MSG__/g, `Check OK on next confirmation`)
    

  const commands = [
    { level: 0, statement: `.then( ${nrcommand})` },
  ]
  return Promise.resolve({ commands })


}

async function emitClick(target) {

  const locator1= await location.emit(target)
  const locator1Msg= locator1.replace(/\'/g, "\\\'").replace(/\"/g, '\\\"')

  let nrcommand=global.nrsynthetics.click.toString()
    .replace(/__LOG_MSG__/g, `Click ${locator1Msg}`)
    .replace(/__LOCATOR__/g, locator1)
    

  const commands = [
    { level: 0, statement: `.then( ${nrcommand})` },
  ]
  return Promise.resolve({ commands })
}

async function emitClose() {

  let nrcommand=global.nrsynthetics.close.toString()
    .replace(/__LOG_MSG__/g, `Close Browser`)
    

  const commands = [
    { level: 0, statement: `.then( ${nrcommand})` },
  ]
  return Promise.resolve({ commands })

}

function generateExpressionScript(script) {
  const scriptString = script.script.replace(/"/g, "'")

  const oommands = `$browser.executeScript("return (${scriptString})"${generateScriptArguments(
    script
  )})`

  return oommands
}

function emitControlFlowDo() {

  const commands = [
    { level: 0, statement: '.then(function ControlFlowDo(){' },
    { level: 1, statement: 'var keepGoing=false' },
    { level: 1, statement: 'do {' },
  ]

  return Promise.resolve({ commands })
}

function emitControlFlowElse() {
  return Promise.resolve({
    commands: [{ level: 1, statement: '} else {' }],
    startingLevelAdjustment: -1,
    endingLevelAdjustment: +1,
  })
}

function emitControlFlowElseIf(script) {
  return Promise.resolve({
    commands: [
      {
        level: 1,
        statement: `} else if (${generateExpressionScript(script)}) {`,
      },
    ],
    startingLevelAdjustment: -1,
    endingLevelAdjustment: +1,
  })
}

function emitControlFlowEnd() {
  return Promise.resolve({
    commands: [{ level: 1, statement: `}` }, { level: 0, statement: `})` }],
    startingLevelAdjustment: -1,
  })
}

function emitControlFlowIf(script) {
  return Promise.resolve({
    commands: [
      { level: 1, statement: `if (${generateExpressionScript(script)}) {` },
    ],
    endingLevelAdjustment: 1,
  })
}


function emitControlFlowForEach(collectionVarName, iteratorVarName) {
  return Promise.resolve({
    commands: [
      {
        level: 0,
        statement: `.then(_=>{`,
      },
      {
        level: 1,
        statement: `const collection = vars["${collectionVarName}"]`,
      },
      {
        level: 1,
        statement: `for (let i = 0; i < collection.length - 1; i++) {`,
      },
      {
        level: 2,
        statement: `vars["${iteratorVarName}"] = vars["${collectionVarName}"][i]`,
      },
    ],
  })
}

function emitControlFlowRepeatIf(script) {
  const result = `${generateExpressionScript(script)}`

  return Promise.resolve({
    commands: [
      { level: 2, statement: `.then(function (){` },
      { level: 3, statement: `return ${result}` },
      { level: 2, statement: `})` },
      { level: 2, statement: `.then(function (ret){` },
      { level: 3, statement: `keepGoing = (Boolean)ret` },
      { level: 2, statement: `})` },
      { level: 1, statement: `} while (keepGoing) ` },
      { level: 0, statement: `})` },
    ],
    startingLevelAdjustment: -1,
  })
}

function emitControlFlowTimes(target) {

  const commands = [
    { level: 0, statement: `.then(function ControlFlowTimes(){` },
    { level: 1, statement: `var times = ${target};` },
    { level: 1, statement: 'for(int i = 0; i < times; i++) {' },
  ]
  return Promise.resolve({ commands, endingLevelAdjustment: 1 })
}

function emitControlFlowWhile(script) {
  return Promise.resolve({
    commands: [
      { level: 0, statement: `while (${generateExpressionScript(script)}) {` },
    ],
    endingLevelAdjustment: 1,
  })
}

async function emitDoubleClick(target) {

  const locator1= await location.emit(target)
  const locator1Msg= locator1.replace(/\'/g, "\\\'").replace(/\"/g, '\\\"')

  let nrcommand=global.nrsynthetics.doubleClickElement.toString()
    .replace(/__LOG_MSG__/g, `Select ${locator1Msg}`)
    .replace(/__LOCATOR__/g, locator1)
    

  const commands = [
    { level: 0, statement: `.then( ${nrcommand})` },
  ]
  return Promise.resolve({ commands })


}

async function emitDragAndDrop(dragged, dropped) {
  const locator1= await location.emit(dragged)
  const locator2= await location.emit(dropped)

  const locator1Msg= locator1.replace(/\'/g, "\\\'").replace(/\"/g, '\\\"')
  const locator2Msg= locator2.replace(/\'/g, "\\\'").replace(/\"/g, '\\\"')

  let nrcommand=global.nrsynthetics.dragAndDrop.toString()
    .replace(/__LOG_MSG__/g, `Dragged element`)
    .replace(/__LOG_MSG2__/g, `Dropped element`)
    .replace(/__LOCATOR__/g, locator1)
    .replace(/__LOCATOR2__/g, locator2)
    

  const commands = [
    { level: 0, statement: `.then( ${nrcommand})` },
  ]
  return Promise.resolve({ commands })
}

async function emitEcho(message) {
  const _message = message.startsWith('vars.get') ? message : `"${message}"`
  const commands = [
    { level: 0, statement: '.then(function Echo(){' },
    { level: 1, statement: `console.log(${_message})` },
    { level: 0, statement: '})' },
  ]
  return Promise.resolve({ commands })
}

async function emitEditContent(locator, content) {

  const locator1= await location.emit(locator)
  const contentMsg= content.replace(/\'/g, "\\\'").replace(/\"/g, '\\\"')

  let nrcommand=global.nrsynthetics.editContent.toString()
    .replace(/__LOG_MSG__/g, `Edit Content  \"${contentMsg}\"`)
    .replace(/__LOCATOR__/g, locator1)
    

  const commands = [
    { level: 0, statement: `.then( ${nrcommand})` },
  ]
  return Promise.resolve({ commands })


}

async function emitExecuteScript(script, varName) {

  var commands = []
  if (!varName) {
    return Promise.resolve({ commands })
  }
  const scriptString = script.script.replace(/"/g, "'")
  commands = [

    {
      level: 0,
      statement: `.then(_=>{`,
    },

    {
      level: 1,
      statement: `return $browser.executeScript("${scriptString}"${generateScriptArguments(
        script
      )})`,
    },
    { level: 1, statement: `.then(function(result){` },
    { level: 2, statement: `vars.set("${varName}", result)` },
    { level: 2, statement: `return Promise.resolve(true)` },
    { level: 1, statement: `})` },
    { level: 0, statement: `})` },
  ]
  return Promise.resolve({ commands })
}

async function emitExecuteAsyncScript(script, varName) {

  var commands = []
  if (!varName) {
    return Promise.resolve({ commands })
  }
  const scriptString = script.script.replace(/"/g, "'")
  commands = [
    {
      level: 1,
      statement: `return $browser.executeAsyncScript("${scriptString}"${generateScriptArguments(
        script
      )})`,
    },
    { level: 1, statement: `.then(function(result){` },
    { level: 2, statement: `vars.set("${varName}", result)` },
    { level: 1, statement: `})` },
  ]
  return Promise.resolve({ commands })
}

function generateScriptArguments(script) {
  return `${script.argv.length ? ', ' : ''}${script.argv
    .map(varName => `vars.get("${varName}")`)
    .join(',')}`
}

async function emitMouseDown(locator) {

  const locator1= await location.emit(locator)
  const locator1Msg= locator1.replace(/\'/g, "\\\'").replace(/\"/g, '\\\"')

  let nrcommand=global.nrsynthetics.mouseDown.toString()
    .replace(/__LOG_MSG__/g, `Mouse Down`)
    .replace(/__LOCATOR__/g, locator1)
    
  const commands = [
    { level: 0, statement: `.then( ${nrcommand})` },
  ]
  return Promise.resolve({ commands })


}

async function emitMouseMove(locator) {
  const locator1= await location.emit(locator)
  const locator1Msg= locator1.replace(/\'/g, "\\\'").replace(/\"/g, '\\\"')

  let nrcommand=global.nrsynthetics.mouseDown.toString()
    .replace(/__LOG_MSG__/g, `Mouse movde`)
    .replace(/__LOCATOR__/g, locator1)
    

  const commands = [
    { level: 0, statement: `.then( ${nrcommand})` },
  ]
  return Promise.resolve({ commands })
}

async function emitMouseOut() {

  const locator1= 'By.tagName("body")'
  const locator1Msg= locator1.replace(/\'/g, "\\\'").replace(/\"/g, '\\\"')

  let nrcommand=global.nrsynthetics.mouseOut.toString()
    .replace(/__LOG_MSG__/g, `Mouse out ${locator1Msg}`)
    .replace(/__LOCATOR__/g, locator1)
    

  const commands = [
    { level: 0, statement: `.then( ${nrcommand})` },
  ]
  return Promise.resolve({ commands })
}

async function emitMouseUp(locator) {
  const locator1 = await location.emit(locator)
  const locator1Msg = locator1.replace(/\'/g, "\\\'").replace(/\"/g, '\\\"')

  let nrcommand = global.nrsynthetics.mouseOut.toString()
    .replace(/__LOG_MSG__/g, `Mouse up ${locator1Msg}`)
    .replace(/__LOCATOR__/g, locator1)
    

  const commands = [
    {level: 0, statement: `.then( ${nrcommand})`},
  ]
  return Promise.resolve({commands})
}

function emitOpen(target) {
  const url = /^(file|http|https):\/\//.test(target)
    ? `${target}`
    : `${global.baseUrl}${target}`

  let nrcommand=global.nrsynthetics.open.toString()
    .replace(/__LOG_MSG__/g, `Open URL ${url}`)
    .replace(/__LOCATOR__/g, url)
    

  const commands = [
    { level: 0, statement: `.then( ${nrcommand})` },
  ]
  return Promise.resolve({ commands })
}

async function emitPause(time) {

  const commands = [
    { level: 0, statement: `.then(function Sleep(){` },
    { level: 1, statement: `return $browser.sleep(${time})` },
    { level: 0, statement: `})` },
  ]
  return Promise.resolve({ commands })
}

// find.js > findReusedTestMethods
// emit.js > const methods = findReusedTestMethods(test, tests)
async function emitRun(testName) {
  // return Promise.resolve(`${exporter.parsers.sanitizeName(testName)}();`)
  //
  //   const commands=[
  //       {level:0, statement:`.then(function Run(){`},
  //       {level:1, statement:`return ${exporter.parsers.sanitizeName(testName)}();`},
  //       {level:0, statement:`})`},
  //
  //   ]
  //   return Promise.resolve({ commands })

  return Promise.resolve(`// reusable RUN() scripts not supported`)
}

async function emitRunScript(script) {
  // return Promise.resolve(
  //   `js.executeScript("${script.script}${generateScriptArguments(script)}");`
  // )

  // return Promise.resolve(
  //     `$browser.executeScript("${script.script}${generateScriptArguments(script)}");`
  // )

  return Promise.resolve(`// reusable RUN() scripts not supported`)
}

async function emitSetWindowSize(size) {

  const [width, height] = size.split('x')
  let nrcommand=global.nrsynthetics.setWindow.toString()
    .replace(/__LOG_MSG__/g, `Set Window Size Width=${width} Height=${height}`)
    .replace(/__WIDTH__/g, width)
    .replace(/__HEIGHT__/g, height)
    
  const commands = [
    { level: 0, statement: `.then( ${nrcommand})` },
  ]
  return Promise.resolve({ commands })
}

async function emitSelect(selectElement, option) {

  const locator1= await location.emit(selectElement)
  const locator2= await selection.emit(option)

  const locator1Msg= locator1.replace(/\'/g, "\\\'").replace(/\"/g, '\\\"')
  const locator2Msg= locator2.replace(/\'/g, "\\\'").replace(/\"/g, '\\\"')

  let nrcommand=global.nrsynthetics.select.toString()
    .replace(/__LOG_MSG__/g, `Select ${locator1Msg}`)
    .replace(/__LOG_MSG2__/g, `Select ${locator2Msg}`)
    .replace(/__LOCATOR__/g, locator1)
    .replace(/__LOCATOR2__/g, locator2)
    

  const commands = [
                      { level: 0, statement: `.then( ${nrcommand})` },
                  ]
  return Promise.resolve({ commands })


}

async function emitSelectFrame(frameLocation) {
  let nrcommand=''

  if (frameLocation === 'relative=top' || frameLocation === 'relative=parent') {

    nrcommand=global.nrsynthetics.switchToDefaultContent.toString()
            .replace(/__LOG_MSG__/g, `Switch to default content`)
  } else if (/^index=/.test(frameLocation)) {

    let locator1 = Math.floor(frameLocation.split('index=')[1])

    nrcommand=global.nrsynthetics.switchToFrameByIndex.toString()
      .replace(/__LOG_MSG__/g, `Switch to Frame Index ${locator1}`)
      .replace(/__LOCATOR__/g, locator1)
      

  } else {
    let locator1= await location.emit(frameLocation)
    let locator1Msg= locator1.replace(/\'/g, "\\\'").replace(/\"/g, '\\\"')

    nrcommand=global.nrsynthetics.switchToFrame.toString()
      .replace(/__LOG_MSG__/g, `Switch to Frame Index ${locator1Msg}`)
      .replace(/__LOCATOR__/g, locator1)
      

  }


  const commands = [
    { level: 0, statement: `.then( ${nrcommand})` },
  ]
  return Promise.resolve({ commands })


}

async function emitSelectWindow(windowLocation) {
  let nrcommand=''

  if (/^handle=/.test(windowLocation)) {
    let locator1= windowLocation.split('handle=')[1]
    let locator1Msg= locator1.replace(/\'/g, "\\\'").replace(/\"/g, '\\\"')

    nrcommand=global.nrsynthetics.switchToWindowUseHandle.toString()
      .replace(/__LOG_MSG__/g, `Switch to Window using Handle ${locator1Msg}`)
      
      .replace(/__LOCATOR__/g, locator1)


  } else if (/^name=/.test(windowLocation)) {

      let locator1= windowLocation.split('name=')[1]
      let locator1Msg= locator1.replace(/\\'/g, "\\\\'").replace(/\\"/g, '\\\\"')

      nrcommand=global.nrsynthetics.switchToWindowUseHandle.toString()
        .replace(/__LOG_MSG__/g, `Switch to Window using Name ${locator1Msg}`)
        


  } else if (/^win_ser_/.test(windowLocation)) {
    if (windowLocation === 'win_ser_local') {

        let locator1= 0

        nrcommand=global.nrsynthetics.switchToWindowUseIndex.toString()
          .replace(/__LOG_MSG__/g, `Get Window Handle 0`)
          .replace(/__LOG_MSG2__/g, `Switch to Window 0`)
          .replace(/__LOCATOR__/g, locator1)



    } else {
      let locator1= parseInt(windowLocation.substr('win_ser_'.length))

      nrcommand=global.nrsynthetics.switchToWindowUseIndex.toString()
        .replace(/__LOG_MSG__/g, `Get Window Handle ${locator1}`)
        .replace(/__LOG_MSG2__/g, `Switch to Window ${locator1}`)
        .replace(/__LOCATOR__/g, locator1)


    }
  } else {
    return Promise.reject(
      new Error('Can only emit `select window` using handles')
    )
  }


  const commands = [
    { level: 0, statement: `.then( ${nrcommand})` },
  ]
  return Promise.resolve({ commands })

}

function generateSendKeysInput(value) {
  if (typeof value === 'object') {
    return value
      .map(s => {
        if (s.startsWith('vars.get')) {
          return s
        } else if (s.startsWith('Key[')) {
          const key = s.match(/\['(.*)'\]/)[1]
          return `$driver.Key.${key}`
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

  const locator1= await location.emit(target)
  const key= generateSendKeysInput(value)

  const locator1Msg= locator1.replace(/\'/g, "\\\'").replace(/\"/g, '\\\"')

  let nrcommand=global.nrsynthetics.sendKeys.toString()
    .replace(/__LOG_MSG__/g, `Send Key`)
    .replace(/__LOCATOR__/g, locator1)
    .replace(/__KEY__/g, key)
    

  const commands = [
    { level: 0, statement: `.then( ${nrcommand})` },
  ]
  return Promise.resolve({ commands })

}

function emitSetSpeed() {
  return Promise.resolve(
    `console.log("\`set speed\` is a no-op in the runner, use \`pause instead\`");`
  )
}

async function emitStore(value, varName) {
  // return Promise.resolve(variableSetter(varName, `"${value}"`))

  const commands = [
    { level: 0, statement: `.then( _=>{ ${variableSetter(varName, value)})`},
  ]
  return Promise.resolve({ commands })

}

async function emitStoreAttribute(locator, varName) {

  const attributePos = locator.lastIndexOf('@')
  const elementLocator = locator.slice(0, attributePos)
  const attributeName = locator.slice(attributePos + 1)
  const setter = variableSetter(varName, 'attribute')

  const locator1= await location.emit(elementLocator)
  const locator1Msg= locator1.replace(/\'/g, "\\\'").replace(/\"/g, '\\\"')

  let nrcommand=global.nrsynthetics.storeAttribute.toString()
    .replace(/__LOG_MSG__/g, `Store attribute to ${attributeName} using ${locator1Msg}`)
    .replace(/__LOCATOR__/g, locator1)
    .replace(/__ATTRIB_A__/g, attributeName)
    .replace(/__CUSTOM_SETTER__/g, setter)
    

  const commands = [
    { level: 0, statement: `.then( ${nrcommand})` },
  ]
  return Promise.resolve({ commands })

}

async function emitStoreJson(json, varName) {

  const commands = [
    { level: 0, statement: `.then( _=>{ ${variableSetter(varName, `JSON.parse('${json}')`)}})` },
  ]
  return Promise.resolve({ commands })
}

async function emitStoreText(locator, varName) {
  const result = `driver.findElement(${await location.emit(locator)}).getText()`

  const commands = [
    { level: 0, statement: `.then( _=>{ ${variableSetter(varName, result)})` },
  ]
  return Promise.resolve({ commands })
}

async function emitStoreTitle(_, varName) {

  const commands = [
    { level: 0, statement: `.then( _=>{ ${variableSetter(varName, 'driver.getTitle()')})` },
  ]
  return Promise.resolve({ commands })
}

async function emitStoreValue(locator, varName) {
  const result = `driver.findElement(${await location.emit(
    locator
  )}).getAttribute("value")`

  const commands = [
    { level: 0, statement: `.then( _=>{ ${variableSetter(varName, result)}})` },
  ]
  return Promise.resolve({ commands })

}

async function emitStoreWindowHandle(varName) {
  // return Promise.resolve(variableSetter(varName, '$browser.getWindowHandle()'))

  let stmnt=
  `.then(_=>{
    return  $browser.getWindowHandle()
      .then(handle=>{
        vars.set("${varName}", handle)
      })
  })`

  const commands = [
    { level: 0, statement: stmnt},
  ]
  return Promise.resolve({ commands })

}

async function emitStoreXpathCount(locator, varName) {
  const result = `driver.findElements(${await location.emit(locator)}).size()`

  const commands = [
    { level: 0, statement: `.then( _=>{ ${variableSetter(varName, result)})`},
  ]
  return Promise.resolve({ commands })

}

async function emitSubmit(_locator) {
  //
  // return Promise.resolve(
  //   `throw new Error("\`submit\` is not a supported command in Selenium WebDriver. Please re-record the step in the IDE.");`
  // )

  const commands = [
    { level: 0, statement: `.then( _=>{
    throw new Error("submit is not a supported command in Selenium WebDriver. Please re-record the step in the IDE.");\n
    })\n`},
  ]
  return Promise.resolve({ commands })

}

async function emitType(target, value) {


  const locator1= await location.emit(target)
  const locator1Msg= locator1.replace(/\'/g, "\\\'").replace(/\"/g, '\\\"')
  const keys = generateSendKeysInput(value)
  const keysMsg= keys.replace(/\'/g, "\\\'").replace(/\"/g, '\\\"')

  let nrcommand=global.nrsynthetics.sendKeys.toString()
    .replace(/__LOG_MSG__/g, `Type ${keysMsg} using locator ${locator1Msg}`)

    .replace(/__LOCATOR__/g, locator1)
    .replace(/__KEY__/g, keys)
    

  const commands = [
    { level: 0, statement: `.then( ${nrcommand})` },
  ]
  return Promise.resolve({ commands })
}

async function emitUncheck(locator) {

  const locator1= await location.emit(locator)
  const locator1Msg= locator1.replace(/\'/g, "\\\'").replace(/\"/g, '\\\"')

  let nrcommand=global.nrsynthetics.uncheck.toString()
    .replace(/__LOG_MSG__/g, `Uncheck ${locator1Msg}`)
    .replace(/__LOCATOR__/g, locator1)
    

  const commands = [
    { level: 0, statement: `.then( ${nrcommand})` },
  ]
  return Promise.resolve({ commands })

}

async function emitVerifyChecked(locator) {

  const locator1= await location.emit(locator)
  const locator1Msg= locator1.replace(/\'/g, "\\\'").replace(/\"/g, '\\\"')

  let nrcommand=global.nrsynthetics.verifyChecked.toString()
    .replace(/__LOG_MSG__/g, `Verify Checked ${locator1Msg}`)
    .replace(/__LOCATOR__/g, locator1)
    

  const commands = [
    { level: 0, statement: `.then( ${nrcommand})` },
  ]
  return Promise.resolve({ commands })

}

async function emitVerifyEditable(locator) {

  const locator1= await location.emit(locator)
  const locator1Msg= locator1.replace(/\'/g, "\\\'").replace(/\"/g, '\\\"')

  let nrcommand=global.nrsynthetics.verifyEditable.toString()
    .replace(/__LOG_MSG__/g, `Verify is Editable ${locator1Msg}`)
    .replace(/__LOCATOR__/g, locator1)
    

  const commands = [
    { level: 0, statement: `.then( ${nrcommand})` },
  ]
  return Promise.resolve({ commands })


}

async function emitVerifyElementPresent(locator) {

  const locator1= await location.emit(locator)
  const locator1Msg= locator1.replace(/\'/g, "\\\'").replace(/\"/g, '\\\"')

  let nrcommand=global.nrsynthetics.verifyElementPresent.toString()
    .replace(/__LOG_MSG__/g, `Verify Element is present ${locator1Msg}`)
    .replace(/__LOCATOR__/g, locator1)
    

  const commands = [
    { level: 0, statement: `.then( ${nrcommand})` },
  ]
  return Promise.resolve({ commands })
}

async function emitVerifyElementNotPresent(locator) {


  const locator1= await location.emit(locator)
  const locator1Msg= locator1.replace(/\'/g, "\\\'").replace(/\"/g, '\\\"')

  let nrcommand=global.nrsynthetics.verifyElementNotPresent.toString()
    .replace(/__LOG_MSG__/g, `Verify Element is present ${locator1Msg}`)
    .replace(/__LOCATOR__/g, locator1)
    

  const commands = [
    { level: 0, statement: `.then( ${nrcommand})` },
  ]
  return Promise.resolve({ commands })
}

async function emitVerifyNotChecked(locator) {

  const locator1= await location.emit(locator)
  const locator1Msg= locator1.replace(/\'/g, "\\\'").replace(/\"/g, '\\\"')

  let nrcommand=global.nrsynthetics.verifyNotChecked.toString()
    .replace(/__LOG_MSG__/g, `Verify Not Checked ${locator1Msg}`)
    .replace(/__LOCATOR__/g, locator1)
    

  const commands = [
    { level: 0, statement: `.then( ${nrcommand})` },
  ]
  return Promise.resolve({ commands })

}

async function emitVerifyNotEditable(locator) {
  const locator1= await location.emit(locator)
  const locator1Msg= locator1.replace(/\'/g, "\\\'").replace(/\"/g, '\\\"')

  let nrcommand=global.nrsynthetics.verifyNotEditable.toString()
    .replace(/__LOG_MSG__/g, `Verify is NOT Editable ${locator1Msg}`)
    .replace(/__LOCATOR__/g, locator1)
    
  const commands = [
    { level: 0, statement: `.then( ${nrcommand})` },
  ]
  return Promise.resolve({ commands })

}

async function emitVerifyNotSelectedValue(locator, expectedValue) {
  const locator1= await location.emit(locator)
  const locator1Msg= locator1.replace(/\'/g, "\\\'").replace(/\"/g, '\\\"')
  const expectVal = exporter.emit.text(expectedValue)

  let nrcommand=global.nrsynthetics.verifyNotSelectedValue.toString()
    .replace(/__LOG_MSG__/g, `Verify not selected value ${expectVal}  using ${locator1Msg}`)
    .replace(/__LOCATOR__/g, locator1)
    .replace(/__EXPECTED_VALUE__/g, expectVal)
    

  const commands = [
    { level: 0, statement: `.then( ${nrcommand})` },
  ]
  return Promise.resolve({ commands })


}

async function emitVerifyNotText(locator, text) {
  const result = `driver.findElement(${await location.emit(locator)}).getText()`

  return Promise.resolve(
    `assert.notEqual(${result}, "${exporter.emit.text(text)}")`
  )
}

async function emitVerifySelectedLabel(locator, labelValue) {
  const locator1= await location.emit(locator)
  const locator1Msg= locator1.replace(/\'/g, "\\\'").replace(/\"/g, '\\\"')

  let nrcommand=global.nrsynthetics.verifySelectedLabel.toString()
    .replace(/__LOG_MSG__/g, `Verify Selected Label ${labelValue} using s ${locator1Msg}`)
    .replace(/__LOCATOR__/g, locator1)
    .replace(/__LABLE_VALUE__/g, labelValue)
    

  const commands = [
    { level: 0, statement: `.then( ${nrcommand})` },
  ]
  return Promise.resolve({ commands })
}

async function emitVerifySelectedValue(locator, value) {
  return emitVerifyValue(locator, value)
}

async function emitVerifyText(locator, text) {

  const locator1= await location.emit(locator)
  const locator1Msg= locator1.replace(/\'/g, "\\\'").replace(/\"/g, '\\\"')
  const txtLookup = exporter.emit.text(text)
  let nrcommand=global.nrsynthetics.verifyText.toString()
    .replace(/__LOG_MSG__/g, `Verify Text ${text} using ${locator1Msg}`)
    .replace(/__LOCATOR__/g, locator1)
    .replace(/__TEXT__/g, txtLookup.trim())
    

  const commands = [
    { level: 0, statement: `.then( ${nrcommand})` },
  ]
  return Promise.resolve({ commands })
}

async function emitVerifyValue(locator, value) {
  const locator1= await location.emit(locator)
  const locator1Msg= locator1.replace(/\'/g, "\\\'").replace(/\"/g, '\\\"')

  let nrcommand=global.nrsynthetics.verifyValue.toString()
    .replace(/__LOG_MSG__/g, `Verify value ${value} using ${locator1Msg}`)
    .replace(/__LOCATOR__/g, locator1)
    .replace(/__TEXT__/g, value.trim())
    

  const commands = [
    { level: 0, statement: `.then( ${nrcommand})` },
  ]
  return Promise.resolve({ commands })

}

async function emitVerifyTitle(title) {

  let nrcommand=global.nrsynthetics.verifyTitle.toString()
    .replace(/__LOG_MSG__/g, `Verify Title ${title}`)
    .replace(/__TEXT__/g, title.trim())
    

  const commands = [
    { level: 0, statement: `.then( ${nrcommand})` },
  ]
  return Promise.resolve({ commands })
}

async function emitWaitForElementEditable(locator, timeout) {

  const locator1= await location.emit(locator)
  const locator1Msg= locator1.replace(/\'/g, "\\\'").replace(/\"/g, '\\\"')

  let nrcommand=global.nrsynthetics.waitForElementEditable.toString()
    .replace(/__LOG_MSG__/g, `Wait For Element Editable ${locator1Msg}`)
    .replace(/__LOCATOR__/g, locator1)
    .replace(/__TIMEOUT__/g, timeout)
    


  const commands = [
    { level: 0, statement: `.then( ${nrcommand})` },
  ]
  return Promise.resolve({ commands })

}

function skip() {
  return Promise.resolve(undefined)
}

async function emitWaitForElementPresent(locator, timeout) {

  const locator1= await location.emit(locator)
  const locator1Msg= locator1.replace(/\'/g, "\\\'").replace(/\"/g, '\\\"')

  let nrcommand=global.nrsynthetics.waitForElementEditable.toString()
    .replace(/__LOG_MSG__/g, `Wait For Element is Present ${locator1Msg}`)
    .replace(/__LOCATOR__/g, locator1)
    .replace(/__TIMEOUT__/g, timeout)
    


  const commands = [
    { level: 0, statement: `.then( ${nrcommand})` },
  ]
  return Promise.resolve({ commands })


}

async function emitWaitForElementVisible(locator, timeout) {


  const locator1= await location.emit(locator)
  const locator1Msg= locator1.replace(/\'/g, "\\\'").replace(/\"/g, '\\\"')

  let nrcommand=global.nrsynthetics.waitForElementVisible.toString()
    .replace(/__LOG_MSG__/g, `Wait For Element is Visible ${locator1Msg}`)
    .replace(/__LOCATOR__/g, locator1)
    .replace(/__TIMEOUT__/g, timeout)
    


  const commands = [
    { level: 0, statement: `.then( ${nrcommand})` },
  ]
  return Promise.resolve({ commands })


}

async function emitWaitForElementNotEditable(locator, timeout) {

  const locator1= await location.emit(locator)
  const locator1Msg= locator1.replace(/\'/g, "\\\'").replace(/\"/g, '\\\"')

  let nrcommand=global.nrsynthetics.waitForElementNotEditable.toString()
    .replace(/__LOG_MSG__/g, `Wait For Element is Not Editable ${locator1Msg}`)
    .replace(/__LOCATOR__/g, locator1)
    .replace(/__TIMEOUT__/g, timeout)
    


  const commands = [
    { level: 0, statement: `.then( ${nrcommand})` },
  ]
  return Promise.resolve({ commands })



}

async function emitWaitForElementNotPresent(locator, timeout) {

  const locator1= await location.emit(locator)
  const locator1Msg= locator1.replace(/\'/g, "\\\'").replace(/\"/g, '\\\"')

  let nrcommand=global.nrsynthetics.waitForElementNotEditable.toString()
    .replace(/__LOG_MSG__/g, `Wait For Element is Not Present ${locator1Msg}`)
    .replace(/__LOCATOR__/g, locator1)
    .replace(/__TIMEOUT__/g, timeout)


  const commands = [
    { level: 0, statement: `.then( ${nrcommand})` },
  ]
  return Promise.resolve({ commands })


}

async function emitWaitForElementNotVisible(locator, timeout) {

  const commands = []
  return Promise.resolve({ commands })
}

export default {
  canEmit,
  emit,
  register,
}
