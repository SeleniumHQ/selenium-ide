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

import javaJunit from 'code-export-java-junit'

export const availableLanguages = [
  { name: 'java-junit', displayName: 'Java JUnit' },
]

const exporter = { 'java-junit': javaJunit }

function registerCommand(language, command, emitter) {
  exporter[language].register.command(command, emitter)
}

function registerVariable(language, emitter) {
  exporter[language].register.variable(emitter)
}

function registerDependency(language, emitter) {
  exporter[language].register.dependency(emitter)
}

function registerBeforeAll(language, emitter) {
  exporter[language].register.beforeAll(emitter)
}

function registerBeforeEach(language, emitter) {
  exporter[language].register.beforeEach(emitter)
}

function registerInEachBegin(language, emitter) {
  exporter[language].register.inEachBegin(emitter)
}

function registerInEachEnd(language, emitter) {
  exporter[language].register.inEachEnd(emitter)
}

function registerAfterEach(language, emitter) {
  exporter[language].register.afterEach(emitter)
}

function registerAfterAll(language, emitter) {
  exporter[language].register.afterAll(emitter)
}

function emitTest(language, { url, test, tests, enableOriginTracing }) {
  return exporter[language].emit.test({
    baseUrl: url,
    test,
    tests,
    enableOriginTracing,
  })
}

export function emitSuite(
  language,
  { url, suite, tests, enableOriginTracing }
) {
  return exporter[language].emit.suite({
    baseUrl: url,
    suite,
    tests,
    enableOriginTracing,
  })
}

export function emitLocator(language, input) {
  return exporter[language].emit.locator(input)
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
