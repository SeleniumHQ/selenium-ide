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
  LanguageEmitterOpts,
  languageFromOpts,
} from 'side-code-export'
import emitter from './command'
import location from './location'
import hooks from './hook'

// Define language options
export const displayName = 'Java JUnit'

export const opts: LanguageEmitterOpts = {
  emitter,
  displayName,
  name: 'java-junit',
  hooks: generateHooks(hooks),
  fileExtension: '.java',
  commandPrefixPadding: '  ',
  terminatingKeyword: '}',
  commentPrefix: '//',
  generateFilename: (name) => {
    return `${exporter.parsers.capitalize(
      exporter.parsers.sanitizeName(name)
    )}Test${opts.fileExtension}`
  },
  generateMethodDeclaration: (name) => {
    return `public void ${exporter.parsers.sanitizeName(name)}() {`
  },
  // Create generators for dynamic string creation of primary entities (e.g., filename, methods, test, and suite)
  generateSuiteDeclaration: (name) => {
    return `public class ${exporter.parsers.capitalize(
      exporter.parsers.sanitizeName(name)
    )}Test {`
  },
  generateTestDeclaration: (name) => {
    return `@Test\npublic void ${exporter.parsers.uncapitalize(
      exporter.parsers.sanitizeName(name)
    )}() {`
  },
}

export default languageFromOpts(opts, location.emit)
