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

const emitters = {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  declareDependencies,
  declareVariables,
  inEachBegin: empty,
  inEachEnd: empty,
}

function generate(hookName, exportObject) {
  return new exporter.hook(emitters[hookName](exportObject))
}

export function generateHooks(exportObject) {
  let result = {}
  Object.keys(emitters).forEach(hookName => {
    result[hookName] = generate(hookName, exportObject)
  })
  return result
}

function afterAll() {
  return {}
}

function afterEach() {
  return {}
}

function beforeAll() {
  return {}
}

function beforeEach() {
  return {}
}

function declareDependencies(exportObject) {
  const params = {
    startingSyntax: {
      commands: [
        {
          level: 0,
          statement:
            `package ${(exportObject &&
              exportObject.additionalOpts &&
              exportObject.additionalOpts.package) ||
              'com.jedox.qa.default'}` + ';',
        }
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
          statement: 'private java.util.Map<String, Object> vars = new java.util.HashMap<>();',
        },
      ],
    },
  }
  return params
}

function empty() {
  return {}
}
