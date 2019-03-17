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

import Command from './command'
import hooks from './hooks'
import { clearHooks } from './hooks'
import { sanitizeName, capitalize } from './parsers'

export async function emitTest({ baseUrl, test, tests }) {
  global.baseUrl = baseUrl
  const name = sanitizeName(test.name)
  const result = await _emitTest(name, test, tests)
  return _emitClass(name, result)
}

export async function emitSuite({ baseUrl, suite, tests }) {
  global.baseUrl = baseUrl
  let result = ''
  for (const testName of suite.tests) {
    const test = tests.find(test => test.name === testName)
    result += await _emitTest(testName, test, tests)
  }
  return _emitClass(sanitizeName(suite.name), result)
}

async function registerReusedTestMethods(test, tests) {
  for (const command of test.commands) {
    if (command.command === 'run') {
      const reusedTest = tests.find(test => test.name === command.target)
      const commands = reusedTest.commands.map(command => {
        return Command.emit(command)
      })
      const emittedCommands = await Promise.all(commands)
      hooks.methods.register(sanitizeName(reusedTest.name), emittedCommands)
    }
  }
}

async function _emitTest(name, test, tests) {
  let result = ''
  result += `
    @Test
    public void ${name}() {`
  result += '\n\t'
  await registerReusedTestMethods(test, tests)
  const commands = test.commands.map(command => {
    return Command.emit(command)
  })
  const emittedCommands = await Promise.all(commands)
  emittedCommands.forEach(emittedCommand => {
    result += `\t${emittedCommand}
    `
  })
  result += hooks.inEach.emit()
  result += `}`
  result += `\n`
  return result
}

function _emitClass(name, body) {
  let result = ''
  result += hooks.dependencies.emit()
  result += `public class ${capitalize(name)} {`
  result += hooks.variables.emit()
  result += hooks.beforeAll.emit()
  result += hooks.beforeEach.emit()
  result += hooks.afterEach.emit()
  result += hooks.afterAll.emit()
  result += hooks.methods.emit()
  result += body
  result += `}\n`
  clearHooks()
  return result
}

export default {
  emit: {
    test: emitTest,
    suite: emitSuite,
  },
  register: {
    command: Command.register,
    variable: hooks.variables.register,
    dependency: hooks.dependencies.register,
    beforeAll: hooks.beforeAll.register,
    beforeEach: hooks.beforeEach.register,
    afterEach: hooks.afterEach.register,
    afterAll: hooks.afterAll.register,
    inEach: hooks.inEach.register,
    methods: hooks.methods.register,
  },
}
