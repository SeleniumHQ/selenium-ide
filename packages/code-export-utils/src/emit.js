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

import { preprocessParameter } from './preprocessor'
import StringEscape from 'js-string-escape'
import { clearHooks } from './hook'
import doRender from './render'
import find from './find'

export function emitCommand(command, emitter, variableLookup) {
  if (emitter) {
    return emitter(
      preprocessParameter(
        command.target,
        emitter.targetPreprocessor,
        variableLookup
      ),
      preprocessParameter(
        command.value,
        emitter.valuePreprocessor,
        variableLookup
      )
    )
  }
}

export function emitLocation(location, emitters) {
  if (/^\/\//.test(location)) {
    return emitters.xpath(location)
  }
  const fragments = location.split('=')
  const type = fragments.shift()
  const selector = emitEscapedText(fragments.join('='))
  if (emitters[type]) {
    return emitters[type](selector)
  } else {
    throw new Error(type ? `Unknown locator ${type}` : "Locator can't be empty")
  }
}

export function emitSelection(location, emitters) {
  if (!location) throw new Error(`Location can't be empty`)
  const [type, selector] = location.split('=')
  if (emitters[type] && selector) {
    let result = emitters[type](selector)
    return result
  } else if (!selector) {
    // no selector strategy given, assuming label
    return emitters['label'](type)
  } else {
    throw new Error(`Unknown selection locator ${type}`)
  }
}

export function emitEscapedText(text) {
  return StringEscape(text)
}

async function emitCommands(commands, emitter) {
  const _commands = commands.map(command => {
    return emitter.emit(command)
  })
  const result = await Promise.all(_commands)
  return result
}

async function emitMethod(
  commands,
  { commandPrefixPadding, methodDeclaration, terminatingKeyword, emitter } = {}
) {
  const emittedCommands = await emitCommands(commands, emitter)
  return [
    methodDeclaration,
    emittedCommands
      .join(`\n${commandPrefixPadding}`)
      .replace(/^/, commandPrefixPadding),
    terminatingKeyword,
  ]
}

async function registerMethod(
  name,
  commands,
  {
    generateMethodDeclaration,
    terminatingKeyword,
    hooks,
    emitter,
    commandPrefixPadding,
  }
) {
  const methodDeclaration = generateMethodDeclaration(name)
  if (!hooks.declareMethods.isRegistered(methodDeclaration)) {
    const result = await emitMethod(commands, {
      emitter,
      commandPrefixPadding,
      methodDeclaration,
      terminatingKeyword,
    })
    result.forEach(statement => {
      hooks.declareMethods.register(statement)
    })
  }
}

export function emitOriginTracing(test, { commentPrefix }) {
  let result = []
  result.push(commentPrefix + ` Test name: ${test.name}`)
  result.push(commentPrefix + ' Step # | name | target | value | comment')
  test.commands.forEach((command, index) => {
    result.push(
      commentPrefix +
        ` ${index + 1} | ${command.command} | ${command.target} | ${
          command.value
        } | ${command.comment}`
    )
  })
  return result
}

async function emitTest(
  test,
  tests,
  {
    testLevel,
    commandLevel,
    testDeclaration,
    terminatingKeyword,
    commandPrefixPadding,
    commentPrefix,
    hooks,
    emitter,
    generateMethodDeclaration,
    enableOriginTracing,
  } = {}
) {
  const render = doRender.bind(this, commandPrefixPadding)
  if (!testLevel) testLevel = 1
  if (!commandLevel) commandLevel = 2
  const methods = find.reusedTestMethods(test, tests)
  for (const method of methods) {
    await registerMethod(method.name, method.commands, {
      generateMethodDeclaration,
      terminatingKeyword,
      hooks,
      emitter,
      commandPrefixPadding,
    })
  }
  let result = ''
  result += render(testDeclaration, {
    startingLevel: testLevel,
  })
  result += render(hooks.inEachBegin.emit({ isOptional: true }), {
    startingLevel: commandLevel,
  })
  const emittedCommands = await emitCommands(test.commands, emitter)
  const originTracing = enableOriginTracing
    ? emitOriginTracing(test, { commentPrefix })
    : undefined
  result += render(emittedCommands, {
    startingLevel: commandLevel,
    originTracing,
  })
  result += render(hooks.inEachEnd.emit({ isOptional: true }), {
    startingLevel: commandLevel,
  })
  result += render(terminatingKeyword, { startingLevel: testLevel })
  return result
}

function emitSuite(
  body,
  {
    suiteLevel,
    testLevel,
    commandLevel,
    suiteDeclaration,
    terminatingKeyword,
    commandPrefixPadding,
    commentPrefix,
    hooks,
  } = {}
) {
  const render = doRender.bind(this, commandPrefixPadding)
  if (!suiteLevel) {
    suiteLevel = 0
  }
  if (!testLevel) {
    testLevel = 1
  }
  if (!commandLevel) {
    commandLevel = 2
  }
  let result = ''
  result += commentPrefix + ' Generated by Selenium IDE\n'
  result += render(hooks.declareDependencies.emit())
  result += render(suiteDeclaration, { startingLevel: suiteLevel })
  result += render(hooks.declareVariables.emit(), {
    startingLevel: testLevel,
  })
  result += render(hooks.beforeAll.emit({ isOptional: true }), {
    startingLevel: testLevel,
  })
  result += render(hooks.beforeEach.emit(), {
    startingLevel: testLevel,
  })
  result += render(hooks.afterEach.emit(), {
    startingLevel: testLevel,
  })
  result += render(hooks.afterAll.emit({ isOptional: true }), {
    startingLevel: testLevel,
  })
  result += render(hooks.declareMethods.emit({ isOptional: true }), {
    startingLevel: testLevel,
  })
  result += body
  result += render(terminatingKeyword, {
    startingLevel: suiteLevel,
  })
  clearHooks(hooks)
  return result
}

export default {
  command: emitCommand,
  commands: emitCommands,
  location: emitLocation,
  method: emitMethod,
  registerMethod,
  selection: emitSelection,
  suite: emitSuite,
  test: emitTest,
  text: emitEscapedText,
}
