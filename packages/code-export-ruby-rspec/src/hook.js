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
// KIND, either express or implied.  See the License for the specific language governing permissions and limitations
// under the License.

import { codeExport as exporter } from '@seleniumhq/side-utils'

const emitters = {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  declareDependencies,
  declareMethods: empty,
  declareVariables: empty,
  inEachBegin: empty,
  inEachEnd: empty,
}

function generate(hookName) {
  return new exporter.hook(emitters[hookName]())
}

export function generateHooks() {
  let result = {}
  Object.keys(emitters).forEach(hookName => {
    result[hookName] = generate(hookName)
  })
  return result
}

function afterAll() {
  const params = {
    startingSyntax: {
      commands: [{ level: 0, statement: 'after(:all) do' }],
    },
    endingSyntax: {
      commands: [{ level: 0, statement: 'end' }],
    },
    registrationLevel: 1,
  }
  return params
}

function afterEach() {
  const params = {
    startingSyntax: {
      commands: [
        { level: 0, statement: 'after(:each) do' },
        { level: 1, statement: '@driver.quit' },
      ],
    },
    endingSyntax: {
      commands: [{ level: 0, statement: 'end' }],
    },
  }
  return params
}

function beforeAll() {
  const params = {
    startingSyntax: {
      commands: [{ level: 0, statement: 'before(:all) do' }],
    },
    endingSyntax: {
      commands: [{ level: 0, statement: 'end' }],
    },
    registrationLevel: 1,
  }
  return params
}

function beforeEach() {
  const params = {
    startingSyntax: ({ browserName, gridUrl } = {}) => ({
      commands: [
        { level: 0, statement: 'before(:each) do' },
        {
          level: 1,
          statement: gridUrl
            ? `@driver = Selenium::WebDriver.for(:remote, url: '${gridUrl}', desired_capabilities: Selenium::WebDriver::Remote::Capabilities.${
                browserName ? browserName.toLowerCase() : 'chrome'
              })`
            : `@driver = Selenium::WebDriver.for :${
                browserName ? browserName.toLowerCase() : 'chrome'
              }`,
        },
        { level: 1, statement: '@vars = {}' },
      ],
    }),
    endingSyntax: {
      commands: [{ level: 0, statement: 'end' }],
    },
  }
  return params
}

function declareDependencies() {
  const params = {
    startingSyntax: {
      commands: [
        { level: 0, statement: "require 'selenium-webdriver'" },
        { level: 0, statement: "require 'json'" },
      ],
    },
  }
  return params
}

function empty() {
  return {}
}
