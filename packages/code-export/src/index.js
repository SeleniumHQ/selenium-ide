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

export const availableLanguages = {
  'csharp-nunit': require('@seleniumhq/code-export-csharp-nunit'),
  'csharp-xunit': require('@seleniumhq/code-export-csharp-xunit'),
  'java-junit': require('@seleniumhq/code-export-java-junit'),
  'javascript-mocha': require('@seleniumhq/code-export-javascript-mocha'),
  'python-pytest': require('@seleniumhq/code-export-python-pytest'),
  'ruby-rspec': require('@seleniumhq/code-export-ruby-rspec'),
}

function registerCommand(language, command, emitter) {
  availableLanguages[language].default.register.command(command, emitter)
}

function registerVariable(language, emitter) {
  availableLanguages[language].default.register.variable(emitter)
}

function registerDependency(language, emitter) {
  availableLanguages[language].default.register.dependency(emitter)
}

function registerBeforeAll(language, emitter) {
  availableLanguages[language].default.register.beforeAll(emitter)
}

function registerBeforeEach(language, emitter) {
  availableLanguages[language].default.register.beforeEach(emitter)
}

function registerInEachBegin(language, emitter) {
  availableLanguages[language].default.register.inEachBegin(emitter)
}

function registerInEachEnd(language, emitter) {
  availableLanguages[language].default.register.inEachEnd(emitter)
}

function registerAfterEach(language, emitter) {
  availableLanguages[language].default.register.afterEach(emitter)
}

function registerAfterAll(language, emitter) {
  availableLanguages[language].default.register.afterAll(emitter)
}

function emitTest(
  language,
  {
    url,
    test,
    tests,
    project,
    enableOriginTracing,
    beforeEachOptions,
    enableDescriptionAsComment,
  }
) {
  return availableLanguages[language].default.emit.test({
    baseUrl: url,
    test,
    tests,
    project,
    enableOriginTracing,
    beforeEachOptions,
    enableDescriptionAsComment,
  })
}

export function emitSuite(
  language,
  {
    url,
    suite,
    tests,
    project,
    enableOriginTracing,
    beforeEachOptions,
    enableDescriptionAsComment,
  }
) {
  return availableLanguages[language].default.emit.suite({
    baseUrl: url,
    suite,
    tests,
    project,
    enableOriginTracing,
    beforeEachOptions,
    enableDescriptionAsComment,
  })
}

export function emitLocator(language, input) {
  return availableLanguages[language].default.emit.locator(input)
}

export default {
  register: {
    command: registerCommand,
    variable: registerVariable,
    dependency: registerDependency,
    beforeAll: registerBeforeAll,
    beforeEach: registerBeforeEach,
    inEachBegin: registerInEachBegin,
    inEachEnd: registerInEachEnd,
    afterEach: registerAfterEach,
    afterAll: registerAfterAll,
  },
  emit: {
    test: emitTest,
    suite: emitSuite,
    locator: emitLocator,
  },
}
