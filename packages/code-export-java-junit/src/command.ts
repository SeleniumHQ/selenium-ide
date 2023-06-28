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

// eslint-disable-next-line node/no-unpublished-import
import { CommandShape } from '@seleniumhq/side-model'
import {
  EmitterContext,
  codeExport as exporter,
  ExportFlexCommandShape,
  PrebuildEmitter,
  ProcessedCommandEmitter,
  ScriptShape
} from 'side-code-export'
import location from './location'

export const emitters: Record<string, ProcessedCommandEmitter> = {
  answerOnNextPrompt: skip,
  chooseCancelOnNextConfirmation: skip,
  chooseCancelOnNextPrompt: skip,
  chooseOkOnNextConfirmation: skip,
  debugger: skip,
  executeAsyncScript: emitExecuteAsyncScript,
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
  run: emitRun,
  runScript: emitRunScript,
  selectFrame: emitSelectFrame,
  selectWindow: emitSelectWindow,
}

exporter.register.preprocessors(emitters)

function register(command: string, emitter: PrebuildEmitter) {
  exporter.register.emitter({ command, emitter, emitters })
}

function emit(command: CommandShape, context: EmitterContext) {
  return exporter.emit.command(command, emitters[command.command], {
    context,
    variableLookup,
    emitNewWindowHandling,
  })
}

function variableLookup(varName: string) {
  return `vars.get("${varName}").toString()`
}

function variableSetter(varName: string, value: string) {
  return varName ? `vars.put("${varName}", ${value});` : ''
}

function emitWaitForWindow() {
  const generateMethodDeclaration = (name: string) => {
    return `public String ${name}(int timeout) {`
  }
  const commands = [
    { level: 0, statement: 'try {' },
    { level: 1, statement: 'Thread.sleep(timeout);' },
    { level: 0, statement: '} catch (InterruptedException e) {' },
    { level: 1, statement: 'e.printStackTrace();' },
    { level: 0, statement: '}' },
    { level: 0, statement: 'Set<String> whNow = driver.getWindowHandles();' },
    {
      level: 0,
      statement:
        'Set<String> whThen = (Set<String>) vars.get("window_handles");',
    },
    { level: 0, statement: 'if (whNow.size() > whThen.size()) {' },
    { level: 1, statement: 'whNow.removeAll(whThen);' },
    { level: 0, statement: '}' },
    { level: 0, statement: 'return whNow.iterator().next();' },
  ]
  return Promise.resolve({
    name: 'waitForWindow',
    commands,
    generateMethodDeclaration,
  })
}

async function emitNewWindowHandling(
  command: CommandShape,
  emittedCommand: ExportFlexCommandShape
) {
  return Promise.resolve(
    `vars.put("window_handles", driver.getWindowHandles());\n${await emittedCommand}\nvars.put("${
      command.windowHandleName
    }", waitForWindow(${command.windowTimeout}));`
  )
}

async function emitExecuteAsyncScript(script: ScriptShape, varName: string) {
  const result = `js.executeAsyncScript("var callback = arguments[arguments.length - 1];${
    script.script
  }.then(callback).catch(callback);${generateScriptArguments(script)}")`
  return Promise.resolve(variableSetter(varName, result))
}

function generateScriptArguments(script: ScriptShape) {
  return `${script.argv.length ? ', ' : ''}${script.argv
    .map((varName) => `vars.get("${varName}")`)
    .join(',')}`
}

async function emitMouseDown(locator: string) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `WebElement element = driver.findElement(${await location.emit(
        locator
      )});`,
    },
    { level: 1, statement: 'Actions builder = new Actions(driver);' },
    {
      level: 1,
      statement: 'builder.moveToElement(element).clickAndHold().perform();',
    },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitMouseMove(locator: string) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `WebElement element = driver.findElement(${await location.emit(
        locator
      )});`,
    },
    { level: 1, statement: 'Actions builder = new Actions(driver);' },
    { level: 1, statement: 'builder.moveToElement(element).perform();' },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitMouseOut() {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `WebElement element = driver.findElement(By.tagName("body"));`,
    },
    { level: 1, statement: 'Actions builder = new Actions(driver);' },
    { level: 1, statement: 'builder.moveToElement(element, 0, 0).perform();' },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitMouseUp(locator: string) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `WebElement element = driver.findElement(${await location.emit(
        locator
      )});`,
    },
    { level: 1, statement: 'Actions builder = new Actions(driver);' },
    {
      level: 1,
      statement: 'builder.moveToElement(element).release().perform();',
    },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

function emitOpen(target: string, _value: null, context: EmitterContext) {
  const url = /^(file|http|https):\/\//.test(target)
    ? `"${target}"`
    : `"${context.project.url}${target}"`
  return Promise.resolve(`driver.get(${url});`)
}

async function emitPause(time: string) {
  const commands = [
    { level: 0, statement: 'try {' },
    { level: 1, statement: `Thread.sleep(${time});` },
    { level: 0, statement: '} catch (InterruptedException e) {' },
    { level: 1, statement: 'e.printStackTrace();' },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitRun(testName: string) {
  return Promise.resolve(`${exporter.parsers.sanitizeName(testName)}();`)
}

async function emitRunScript(script: ScriptShape) {
  return Promise.resolve(
    `js.executeScript("${script.script}${generateScriptArguments(script)}");`
  )
}

async function emitSelectFrame(frameLocation: string) {
  if (frameLocation === 'relative=top' || frameLocation === 'relative=parent') {
    return Promise.resolve('driver.switchTo().defaultContent();')
  } else if (/^index=/.test(frameLocation)) {
    return Promise.resolve(
      `driver.switchTo().frame(${Math.floor(
        Number(frameLocation.split('index=')[1] as string)
      )});`
    )
  } else {
    return Promise.resolve({
      commands: [
        { level: 0, statement: '{' },
        {
          level: 1,
          statement: `WebElement element = driver.findElement(${await location.emit(
            frameLocation
          )});`,
        },
        { level: 1, statement: 'driver.switchTo().frame(element);' },
        { level: 0, statement: '}' },
      ],
    })
  }
}

async function emitSelectWindow(windowLocation: string) {
  if (/^handle=/.test(windowLocation)) {
    return Promise.resolve(
      `driver.switchTo().window(${windowLocation.split('handle=')[1]});`
    )
  } else if (/^name=/.test(windowLocation)) {
    return Promise.resolve(
      `driver.switchTo().window("${windowLocation.split('name=')[1]}");`
    )
  } else if (/^win_ser_/.test(windowLocation)) {
    if (windowLocation === 'win_ser_local') {
      return Promise.resolve({
        commands: [
          { level: 0, statement: '{' },
          {
            level: 1,
            statement:
              'ArrayList<String> handles = new ArrayList<String>(driver.getWindowHandles());',
          },
          { level: 1, statement: 'driver.switchTo().window(handles.get(0));' },
          { level: 0, statement: '}' },
        ],
      })
    } else {
      const index = parseInt(windowLocation.substr('win_ser_'.length))
      return Promise.resolve({
        commands: [
          { level: 0, statement: '{' },
          {
            level: 1,
            statement:
              'ArrayList<String> handles = new ArrayList<String>(driver.getWindowHandles());',
          },
          {
            level: 1,
            statement: `driver.switchTo().window(handles.get(${index}));`,
          },
          { level: 0, statement: '}' },
        ],
      })
    }
  } else {
    return Promise.reject(
      new Error('Can only emit `select window` using handles')
    )
  }
}

function generateSendKeysInput(value: string | string[]) {
  if (typeof value === 'object') {
    return value
      .map((s) => {
        if (s.startsWith('vars.get')) {
          return s
        } else if (s.startsWith('Key[')) {
          const key = s.match(/\['(.*)'\]/)?.[1] as string
          return `Keys.${key}`
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

function skip() {
  return Promise.resolve('')
}

export default {
  emit,
  emitters,
  register,
  extras: { emitNewWindowHandling, emitWaitForWindow },
}
