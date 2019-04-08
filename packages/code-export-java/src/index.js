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

const fileExtension = '.java'
export const commandPrefixPadding = '  '
const hooks = Hook.generateAll()

export async function emitTest({ baseUrl, test, tests }) {
  global.baseUrl = baseUrl
  const result = await _emitTest(test, tests)
  return {
    filename: generateFilename(test.name),
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
    filename: generateFilename(suite.name),
    body: _emitClass(suite.name, result),
  }
}

function generateFilename(name) {
  return `${capitalize(sanitizeName(name))}${fileExtension}`
}

async function registerReusedTestMethods(test, tests) {
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

function prettifyString(input, level) {
  return commandPrefixPadding.repeat(level) + input
}

async function _emitTest(test, tests) {
  let result = ''
  result += prettifyString('@Test\n', 1)
  result += prettifyString(`public void ${sanitizeName(test.name)}() {\n`, 1)
  let startingLevel = 2
  result += _renderHook(hooks.inEachBegin.emit({ isOptional: true }), {
    startingLevel,
  })
  await registerReusedTestMethods(test, tests)
  const commands = test.commands.map(command => {
    return Command.emit(command)
  })
  const emittedCommands = await Promise.all(commands)
  emittedCommands.forEach(emittedCommand => {
    const commandBlock = exporter.prettify(emittedCommand, {
      commandPrefixPadding,
      startingLevel,
    })
    startingLevel = commandBlock.endingLevel
    result += commandBlock.body
    result += '\n'
  })
  result += _renderHook(hooks.inEachEnd.emit({ isOptional: true }), {
    startingLevel,
  })
  result += prettifyString(`}\n\n`, 1)
  return result
}

function _renderHook(hook, { startingLevel } = { startingLevel: 1 }) {
  const result = exporter.prettify(hook, {
    commandPrefixPadding,
    startingLevel,
  }).body
  return result.trim().length ? result + '\n\n' : ''
}

function _emitClass(name, body) {
  let result = ''
  result += _renderHook(hooks.declareDependencies.emit(), { startingLevel: 0 })
  result += `public class ${capitalize(sanitizeName(name))} {\n`
  result += _renderHook(hooks.declareVariables.emit())
  result += _renderHook(hooks.beforeAll.emit({ isOptional: true }))
  result += _renderHook(hooks.beforeEach.emit())
  result += _renderHook(hooks.afterEach.emit())
  result += _renderHook(hooks.afterAll.emit({ isOptional: true }))
  result += _renderHook(hooks.declareMethods.emit({ isOptional: true }), {
    startingLevel: 0,
  })
  result += body
  result += `}`
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
