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
import emitter from './command'
import { generateHooks } from './hook'
import { sanitizeName, capitalize } from './parsers'

export let opts = {}
opts.emitter = emitter
opts.hooks = generateHooks()
opts.fileExtension = '.java'
opts.commandPrefixPadding = '  '
opts.terminatingKeyword = '}'
opts.generateMethodDeclaration = generateMethodDeclaration

function generateTestDeclaration(name) {
  return `@Test\npublic void ${sanitizeName(name)}() {`
}
function generateMethodDeclaration(name) {
  return `public void ${sanitizeName(name)}() {`
}
function generateSuiteDeclaration(name) {
  return `public class ${capitalize(sanitizeName(name))} {`
}
function generateFilename(name) {
  return `${capitalize(sanitizeName(name))}${opts.fileExtension}`
}

export async function emitTest({ baseUrl, test, tests }) {
  global.baseUrl = baseUrl
  const testDeclaration = generateTestDeclaration(test.name)
  const result = await exporter.emit.test(test, tests, {
    ...opts,
    testDeclaration,
  })
  const suiteDeclaration = generateSuiteDeclaration(test.name)
  return {
    filename: generateFilename(test.name),
    body: exporter.emit.suite(result, {
      ...opts,
      suiteDeclaration,
    }),
  }
}

export async function emitSuite({ baseUrl, suite, tests }) {
  global.baseUrl = baseUrl
  let result = ''
  for (const testName of suite.tests) {
    const test = tests.find(test => test.name === testName)
    const testDeclaration = generateTestDeclaration(test.name)
    result += await exporter.emit.test(test, tests, {
      ...opts,
      testDeclaration,
    })
  }
  const suiteDeclaration = generateSuiteDeclaration(suite.name)
  return {
    filename: generateFilename(suite.name),
    body: exporter.emit.suite(result, {
      ...opts,
      suiteDeclaration,
    }),
  }
}

async function registerMethod(name, commands) {
  await exporter.emit.registerMethod(name, commands, {
    ...opts,
  })
}

export default {
  emit: {
    test: emitTest,
    suite: emitSuite,
  },
  register: {
    command: emitter.register,
    variable: opts.hooks.declareVariables.register,
    dependency: opts.hooks.declareDependencies.register,
    beforeAll: opts.hooks.beforeAll.register,
    beforeEach: opts.hooks.beforeEach.register,
    afterEach: opts.hooks.afterEach.register,
    afterAll: opts.hooks.afterAll.register,
    inEachBegin: opts.hooks.inEachBegin.register,
    inEachEnd: opts.hooks.inEachEnd.register,
    method: registerMethod,
  },
}
