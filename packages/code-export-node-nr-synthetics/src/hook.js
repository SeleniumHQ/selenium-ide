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

//
// New Relic Synthetics
//

import exporter from 'code-export-utils'
import logging from './logging.js'

const emitters = {
  afterAll,
  afterEach: empty,
  beforeAll: empty,
  beforeEach: empty,
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
      commands: [],
    },
    endingSyntax: {
      commands: [{ level: 0, statement: '}' }],
    },
    registrationLevel: 1,
  }
  return params
}

function afterEach() {
  const params = {
    startingSyntax: {
      commands: [

          {level: 0, statement: '// after all'}
          ],
    },
    endingSyntax: {
      commands: [{ level: 0, statement: '' }],
    },
  }
  return params
}

function beforeAll() {
  const params = {
    startingSyntax: {
      commands: [],
    },
    endingSyntax: {
      commands: [{ level: 0, statement: '' }],
    },
    registrationLevel: 1,
  }
  return params
}

function beforeEach() {
  const params = {
    startingSyntax: {
      commands: [],
    },
    endingSyntax: {
      commands: [{ level: 0, statement: '// logging declartion ends here' }],
    },
    registrationLevel: 0,
  }
  return params
}

function inEachBegin() {
  const params = {
    startingSyntax: {
      commands: [],
    },
    endingSyntax: {
      commands: [{ level: 0, statement: '// inEachBegin()  ends here' }],
    },
    registrationLevel: 0,
  }
  return params
}

function declareDependencies() {
  const params = {
    startingSyntax: {
      commands: [
        {
          level: 0,
          statement: '// New Relic Synthetics Formatter for Selenium IDE',
        },
        {
          level: 0,
          statement:
            '// Feel free to explore, or check out the full documentation',
        },
        {
          level: 0,
          statement:
            '// https://docs.newrelic.com/docs/synthetics/new-relic-synthetics/scripting-monitors/writing-scripted-browsers',
        },
        { level: 0, statement: '// for details' },
      ],
    },
  }
  return params
}

function declareVariables() {
  const params = {
    startingSyntax: {
      commands: [
        { level: 0, statement: 'const assert = require("assert");' },
        { level: 0, statement: 'const urlRequest = require("urllib").request;' },

        {
          level: 0,
          statement: '// Theshold for duration of entire script - fails test if script lasts longer than X (in ms)',
        },

        {
          level: 0,
          statement:'// Script-wide timeout for all wait and waitAndFind functions (in ms)',
        },
        { level: 0, statement: 'var DefaultTimeout = 30000;' },

        { level: 0, statement: '// Change to any User Agent you want to use.' },
        {
          level: 0,
          statement:
            '// Leave as "default" or empty to use the Synthetics default.',
        },
        { level: 0, statement: 'var UserAgent = "default";' },

        { level: 0, statement: 'const By = $driver.By;' },
        { level: 0, statement: 'const browser = $browser.manage();' },

        { level: 0, statement: 'var vars = new Map();' },

        {
          level: 0,
          statement: `const logger = ${logging.toString()}({timeout:180000, stepLogging:false, })`,
        },

        {
          level: 0,
          statement: '$browser.getCapabilities().then(function () { })',
        },
      ],
    },
  }
  return params
}

function empty() {
  return {}
}
