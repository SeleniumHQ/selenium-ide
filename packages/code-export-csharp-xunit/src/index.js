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
import emitter from './command'
import { location } from '@seleniumhq/code-export-csharp-commons'
import { generateHooks } from './hook'
import _default from 'diff-sequences'

// Define language options
export const displayName = 'C# xUnit'

export let opts = {}
opts.emitter = emitter
opts.hooks = generateHooks()
opts.fileExtension = '.cs'
opts.commandPrefixPadding = '  '
opts.terminatingKeyword = '}'
opts.commentPrefix = '//'
opts.generateMethodDeclaration = generateMethodDeclaration

// Create generators for dynamic string creation of primary entities (e.g., filename, methods, test, and suite)
function generateTestDeclaration(name) {
  return `[Fact]\npublic void ${exporter.parsers.capitalize(
    exporter.parsers.sanitizeName(name)
  )}() {`
}

function generateSuiteDeclaration() {
  return `public class SuiteTests : IDisposable {`
}

function generateMethodDeclaration(name) {
  return `public void ${exporter.parsers.sanitizeName(name)}() \n{`
}

function generateNamespace(name) {
  return `namespace ${exporter.parsers.capitalize(
    exporter.parsers.sanitizeName(name)
  )}\n{\n`
}

function generateFilename(name) {
  return `${exporter.parsers.capitalize(
    exporter.parsers.sanitizeName(name)
  )}Test${opts.fileExtension}`
}

// Emit an individual test, wrapped in a suite (using the test name as the suite name)
export async function emitTest({
  baseUrl,
  test,
  tests,
  project,
  enableOriginTracing,
  beforeEachOptions,
  enableDescriptionAsComment,
}) {
  global.baseUrl = baseUrl
  const testDeclaration = generateTestDeclaration(test.name)
  const result = await exporter.emit.test(test, tests, {
    ...opts,
    testDeclaration,
    enableOriginTracing,
    enableDescriptionAsComment,
    project,
  })
  const suiteName = test.name
  const suiteDeclaration = generateSuiteDeclaration()
  var _suite = await exporter.emit.suite(result, tests, {
    ...opts,
    suiteDeclaration,
    suiteName,
    project,
    beforeEachOptions,
  })
  return {
    filename: generateFilename(test.name),
    body: exporter.emit.orderedSuite(_suite),
  }
}

// Emit a suite with all of its tests
export async function emitSuite({
  baseUrl,
  suite,
  tests,
  project,
  enableOriginTracing,
  beforeEachOptions,
  enableDescriptionAsComment,
}) {
  global.baseUrl = baseUrl
  const result = await exporter.emit.testsFromSuite(tests, suite, opts, {
    enableOriginTracing,
    enableDescriptionAsComment,
    generateTestDeclaration,
    project,
  })
  const suiteDeclaration = generateSuiteDeclaration()
  var _suite = await exporter.emit.suite(result, tests, {
    ...opts,
    suiteDeclaration,
    suite,
    project,
    beforeEachOptions,
  })
  return {
    filename: generateFilename(suite.name),
    body: emitOrderedSuite(_suite, suite.name),
  }
}

function emitOrderedSuite(emittedSuite, name) {
  let result = ''
  result += emittedSuite.headerComment
  result += emittedSuite.dependencies
  result += `${generateNamespace(name)}`
  result += emittedSuite.suiteDeclaration
  result += emittedSuite.variables
  //result += emittedSuite.beforeAll
  result += emittedSuite.beforeEach
  result += emittedSuite.afterEach
  //result += emittedSuite.afterAll
  result += emittedSuite.methods
  if (emittedSuite.tests.testDeclaration) {
    const test = emittedSuite.tests
    result += test.testDeclaration
    result += test.inEachBegin
    result += test.commands
    result += test.inEachEnd
    result += test.testEnd
  } else {
    for (const testName in emittedSuite.tests) {
      const test = emittedSuite.tests[testName]
      result += test.testDeclaration
      result += test.inEachBegin
      result += test.commands
      result += test.inEachEnd
      result += test.testEnd
    }
  }
  result += emittedSuite.suiteEnd
  result += '}' // terminate namespace
  return result
}

export default {
  emit: {
    test: emitTest,
    suite: emitSuite,
    locator: location.emit,
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
  },
}
