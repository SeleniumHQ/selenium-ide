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
  declareVariables,
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
      commands: [{ level: 0, statement: 'afterAll(async function() {' }],
    },
    endingSyntax: {
      commands: [{ level: 0, statement: '})' }],
    },
    registrationLevel: 1,
  }
  return params
}

function afterEach() {
  const params = {
    startingSyntax: {
      commands: [
        { level: 0, statement: 'afterEach(async function() {' },
        { level: 1, statement: 'await driver.quit();' },
      ],
    },
    endingSyntax: {
      commands: [{ level: 0, statement: '})' }],
    },
  }
  return params
}

function beforeAll() {
  const params = {
    startingSyntax: {
      commands: [{ level: 0, statement: 'beforeAll(async function() {' }],
    },
    endingSyntax: {
      commands: [{ level: 0, statement: '})' }],
    },
    registrationLevel: 1,
  }
  return params
}

function beforeEach() {
  const params = {
    startingSyntax: ({ browserName, gridUrl } = {}) => ({
      commands: [
        { level: 0, statement: 'beforeEach(async function() {' },
        {
          level: 1,
          statement: `driver = await new Builder().forBrowser('${
            browserName ? browserName.toLowerCase() : 'chrome'
          }')${gridUrl ? `.usingServer('${gridUrl}')` : ''}.build()`,
        },
        { level: 1, statement: 'vars = {}' },
      ],
    }),
    endingSyntax: {
      commands: [{ level: 0, statement: '})' }],
    },
  }
  return params
}

function declareDependencies() {
  const params = {
    startingSyntax: {
      commands: [
        {
          level: 0,
          statement: `const { Builder, By, Key, until } = require('selenium-webdriver')`,
        },
        {
          level: 0,
          statement: `const assert = require('assert')`,
        },
        {
          level: 0,
          statement: '',
        },
      ],
    },
  }
  return params
}

function declareVariables() {
  const params = {
    startingSyntax: {
      commands: [
        {
          level: 0,
          statement: `this.timeout(30000)`,
        },
        {
          level: 0,
          statement: `let driver`,
        },
        {
          level: 0,
          statement: 'let vars',
        },
      ],
    },
  }
  return params
}

function empty() {
  return {}
}
