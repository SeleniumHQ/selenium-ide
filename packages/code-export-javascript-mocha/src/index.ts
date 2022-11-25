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
import location from './location'
import hooks from './hook'

// Define language options
export const displayName = 'JavaScript Mocha'

export const opts: LanguageEmitterOpts = {
  emitter: emitter,
  displayName,
  name: 'javascript-mocha',
  hooks: generateHooks(hooks),
  fileExtension: '.spec.js',
  commandPrefixPadding: '  ',
  terminatingKeyword: '})',
  commentPrefix: '//',
  generateMethodDeclaration: function generateMethodDeclaration(name: string) {
    return {
      body: `async function ${exporter.parsers.uncapitalize(
        exporter.parsers.sanitizeName(name)
      )}() {`,
      terminatingKeyword: '}',
    }
  },
  // Create generators for dynamic string creation of primary entities (e.g., filename, methods, test, and suite)
  generateTestDeclaration: function generateTestDeclaration(name: string) {
    return `it('${name}', async function() {`
  },
  generateSuiteDeclaration: function generateSuiteDeclaration(name) {
    return `describe('${name}', function() {`
  },
  generateFilename: function generateFilename(name) {
    return `${exporter.parsers.uncapitalize(
      exporter.parsers.sanitizeName(name)
    )}${opts.fileExtension}`
  },
}

const language: LanguageEmitter = {
  emit: {
    locator: location.emit,
    command: emitter.emit,
    suite: async function emitSuite({
      baseUrl,
      suite,
      tests,
      project,
      enableOriginTracing,
      beforeEachOptions,
      enableDescriptionAsComment,
    }) {
      // @ts-expect-error globals yuck
      global.baseUrl = baseUrl
      const result = await exporter.emit.testsFromSuite(tests, suite, opts, {
        enableOriginTracing,
        generateTestDeclaration: opts.generateTestDeclaration,
        enableDescriptionAsComment,
        project,
      })
      const suiteDeclaration = opts.generateSuiteDeclaration(suite.name)
      const _suite = await exporter.emit.suite(result, tests, {
        ...opts,
        suiteDeclaration,
        suite,
        suiteName: suite.name,
        project,
        beforeEachOptions,
      })
      return {
        filename: opts.generateFilename(suite.name),
        body: exporter.emit.orderedSuite(_suite),
      }
    },
    // Emit an individual test, wrapped in a suite (using the test name as the suite name)
    test: async function emitTest({
      baseUrl,
      test,
      tests,
      project,
      enableOriginTracing,
      beforeEachOptions,
      enableDescriptionAsComment,
    }) {
      // @ts-expect-error globals yuck
      global.baseUrl = baseUrl
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
      const _suite = await exporter.emit.suite(result, tests, {
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

export default language
