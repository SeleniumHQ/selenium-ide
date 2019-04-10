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

import exporter from 'code-export-utils'
import Command from './command'
import { sanitizeName, capitalize } from './parsers'
import Hook from './hook'

const hooks = Hook.generateAll()

const fileExtension = '.java'
export const commandPrefixPadding = '  '
const classLevel = 0
const methodLevel = 1
const commandLevel = 2

export async function emitTest({ baseUrl, test, tests }) {
  global.baseUrl = baseUrl
  const result = await _emitTest(test, tests)
  return {
    filename: _generateFilename(test.name),
    body: _emitClass(test.name, result),
  }
}

export async function emitSuite({ baseUrl, suite, tests }) {
  global.baseUrl = baseUrl
  let result = ''
  for (const testName of suite.tests) {
    const test = tests.find(test => test.name === testName)
    result += await _emitTest(test, tests)
  }
  return {
    filename: _generateFilename(suite.name),
    body: _emitClass(suite.name, result),
  }
}

function _generateFilename(name) {
  return `${capitalize(sanitizeName(name))}${fileExtension}`
}

function _render(input, { startingLevel, newLineCount, fullPayload } = {}) {
  if (!newLineCount) newLineCount = methodLevel
  if (!startingLevel) startingLevel = classLevel
  if (!fullPayload) fullPayload = false
  const result = exporter.prettify(input, {
    commandPrefixPadding,
    startingLevel,
  })
  if (fullPayload) return result
  return result.body.trim().length
    ? result.body + '\n'.repeat(newLineCount)
    : ''
}

async function _registerReusedTestMethods(test, tests) {
  for (const command of test.commands) {
    if (command.command === 'run') {
      const reusedTest = tests.find(test => test.name === command.target)
      const commands = reusedTest.commands.map(command => {
        return Command.emit(command)
      })
      const emittedCommands = await Promise.all(commands)
      const methodDeclaration = `public void ${reusedTest.name}() {`
      if (!hooks.declareMethods.isRegistered(methodDeclaration)) {
        hooks.declareMethods.register(methodDeclaration)
        hooks.declareMethods.register(
          emittedCommands
            .join(`\n${commandPrefixPadding}`)
            .replace(/^/, commandPrefixPadding)
        )
        hooks.declareMethods.register(`}`)
      }
    }
  }
}

async function _emitTest(test, tests) {
  let result = ''
  result += _render('@Test', { startingLevel: methodLevel })
  result += _render(`public void ${sanitizeName(test.name)}() {`, {
    startingLevel: methodLevel,
  })
  result += _render(hooks.inEachBegin.emit({ isOptional: true }), {
    startingLevel: commandLevel,
  })
  await _registerReusedTestMethods(test, tests)
  const commands = test.commands.map(command => {
    return Command.emit(command)
  })
  const emittedCommands = await Promise.all(commands)
  let endingLevel = commandLevel
  emittedCommands.forEach(emittedCommand => {
    const commandBlock = _render(emittedCommand, {
      startingLevel: endingLevel,
      fullPayload: true,
    })
    endingLevel = commandBlock.endingLevel
    result += commandBlock.body
    result += '\n'
  })
  result += _render(hooks.inEachEnd.emit({ isOptional: true }), {
    startingLevel: commandLevel,
  })
  result += _render(`}`, { startingLevel: methodLevel })
  return result
}

function _emitClass(name, body) {
  let result = ''
  result += _render(hooks.declareDependencies.emit())
  result += _render(`public class ${capitalize(sanitizeName(name))} {`)
  result += _render(hooks.declareVariables.emit(), {
    startingLevel: methodLevel,
  })
  result += _render(hooks.beforeAll.emit({ isOptional: true }), {
    startingLevel: methodLevel,
  })
  result += _render(hooks.beforeEach.emit(), {
    startingLevel: methodLevel,
  })
  result += _render(hooks.afterEach.emit(), {
    startingLevel: methodLevel,
  })
  result += _render(hooks.afterAll.emit({ isOptional: true }), {
    startingLevel: methodLevel,
  })
  result += _render(hooks.declareMethods.emit({ isOptional: true }), {
    startingLevel: methodLevel,
  })
  result += body
  result += _render(`}`, {
    startingLevel: classLevel,
  })
  Hook.clear(hooks)
  return result
}

export default {
  emit: {
    test: emitTest,
    suite: emitSuite,
  },
  register: {
    command: Command.register,
    variable: hooks.declareVariables.register,
    dependency: hooks.declareDependencies.register,
    beforeAll: hooks.beforeAll.register,
    beforeEach: hooks.beforeEach.register,
    afterEach: hooks.afterEach.register,
    afterAll: hooks.afterAll.register,
    inEachBegin: hooks.inEachBegin.register,
    inEachEnd: hooks.inEachEnd.register,
    methods: hooks.declareMethods.register,
  },
}
