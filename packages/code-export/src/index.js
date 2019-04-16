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

export function registerCommand(language, command, emitter) {
  exporter[language].register.command(command, emitter)
}

export function registerVariable(language, declaration) {
  exporter[language].register.variable(declaration)
}

export function registerDependency(language, statement) {
  exporter[language].register.dependency(statement)
}

export function registerBeforeAll(language, statement) {
  exporter[language].register.beforeAll(statement)
}

export function registerBeforeEach(language, statement) {
  exporter[language].register.beforeEach(statement)
}

export function registerInEachBegin(language, statement) {
  exporter[language].register.inEachBegin(statement)
}

export function registerInEachEnd(language, statement) {
  exporter[language].register.inEachEnd(statement)
}

export function registerAfterEach(language, statement) {
  exporter[language].register.afterEach(statement)
}

export function registerAfterAll(language, statement) {
  exporter[language].register.afterAll(statement)
}

export function emitTest(language, { url, test, tests, enableOriginTracing }) {
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
