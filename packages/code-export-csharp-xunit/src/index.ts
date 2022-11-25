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

import {
  codeExport as exporter,
  generateHooks,
  LanguageEmitter,
  LanguageEmitterOpts,
} from '@seleniumhq/side-code-export'
import emitter from './command'
import hooks from './hook'
import { location } from '@seleniumhq/code-export-csharp-commons'

// Define language options
export const displayName = 'C# xUnit'

export const opts: LanguageEmitterOpts = {
  emitter: emitter,
  displayName,
  name: 'csharp-xunit',
  hooks: generateHooks(hooks),
  fileExtension: '.cs',
  commandPrefixPadding: '  ',
  terminatingKeyword: '}',
  commentPrefix: '//',
  generateFilename: (name) => {
    return `${exporter.parsers.capitalize(
      exporter.parsers.sanitizeName(name)
    )}Test${opts.fileExtension}`
  },

  generateMethodDeclaration: (name) => {
    return `public void ${exporter.parsers.sanitizeName(name)}() \n{`
  },
  generateTestDeclaration: (name) => {
    return `[Fact]\npublic void ${exporter.parsers.capitalize(
      exporter.parsers.sanitizeName(name)
    )}() {`
  },
  generateSuiteDeclaration: () => {
    return `public class SuiteTests : IDisposable {`
  },
}

const language: LanguageEmitter = {
  emit: {
    test: async function emitTest({
      test,
      tests,
      project,
      enableOriginTracing,
      beforeEachOptions,
      enableDescriptionAsComment,
    }) {
      const testDeclaration = opts.generateTestDeclaration(test.name)
      const result = await exporter.emit.test(test, tests, {
        ...opts,
        testDeclaration,
        enableOriginTracing,
        enableDescriptionAsComment,
        project,
      })
      const suiteName = test.name
      const suiteDeclaration = opts.generateSuiteDeclaration(suiteName)
      var _suite = await exporter.emit.suite(result, tests, {
        ...opts,
        suiteDeclaration,
        suiteName,
        project,
        beforeEachOptions,
      })
      return {
        filename: opts.generateFilename(test.name),
        body: exporter.emit.orderedSuite(_suite),
      }
    },
    suite: async function emitSuite({
      suite,
      tests,
      project,
      enableOriginTracing,
      beforeEachOptions,
      enableDescriptionAsComment,
    }) {
      const result = await exporter.emit.testsFromSuite(tests, suite, opts, {
        enableOriginTracing,
        enableDescriptionAsComment,
        generateTestDeclaration: opts.generateTestDeclaration,
        project,
      })
      const suiteDeclaration = opts.generateSuiteDeclaration(suite.name)
      var _suite = await exporter.emit.suite(result, tests, {
        ...opts,
        suiteDeclaration,
        suite,
        suiteName: suite.name,
        project,
        beforeEachOptions,
      })
      return {
        filename: opts.generateFilename(suite.name),
        body: emitOrderedSuite(_suite, suite.name),
      }
    },
    locator: location.emit,
    command: emitter.emit,
  },
  opts,
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

function generateNamespace(name: string) {
  return `namespace ${exporter.parsers.capitalize(
    exporter.parsers.sanitizeName(name)
  )}\n{\n`
}

function emitOrderedSuite(emittedSuite: any, name: string) {
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

export default language
