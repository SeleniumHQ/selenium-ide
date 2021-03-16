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
      commands: [
        { level: 0, statement: 'lastly (fun _ ->' },
      ],
    },
    endingSyntax: {
      commands: [{ level: 0, statement: ')' }],
    },
    registrationLevel: 1,
  }
  return params
}

function afterEach() {
  const params = {
    startingSyntax: {
      commands: [
        { level: 0, statement: 'after (fun _ ->' },
        { level: 1, statement: 'quit()' },
      ],
    },
    endingSyntax: {
      commands: [{ level: 0, statement: ')' }],
    },
  }
  return params
}

function beforeAll() {
  const params = {
    startingSyntax: {
      commands: [
        { level: 0, statement: 'once (fun _ ->' },
      ],
    },
    endingSyntax: {
      commands: [{ level: 0, statement: ')' }],
    },
    registrationLevel: 1,
  }
  return params
}

//TODO Grid url
function beforeEach() {
  const params = {
    startingSyntax: ({ browserName, gridUrl } = {}) => ({
      commands: [
        { level: 0, statement: 'before (fun _ ->' },
        /*
        {
          level: 0,
          statement: `public void setUp() ${
            gridUrl ? 'throws MalformedURLException ' : ''
          }{`,
        },
        
        {
          level: 1,
          statement: gridUrl
            ? `driver = new RemoteWebDriver(new URL("${gridUrl}"), DesiredCapabilities.${
                browserName ? browserName.toLowerCase() : 'chrome'
              }());`
            : `driver = new ${browserName ? browserName : 'Chrome'}Driver();`,
        },
        { level: 1, statement: 'js = (JavascriptExecutor) driver;' },
        */
        { level: 1, statement: `start ${browserName ? browserName.toLowerCase() : 'chrome'}`},
        { level: 1, statement: 'let vars = new Dictionary()' },
        { level: 1, statement: 'let findByHref href f webdriver =' },
        { level: 2, statement: 'try' },
        { level: 3, statement: `let cssSelector = sprintf "a[href*='%s']" href` },
        { level: 3, statement: 'f(By.CssSelector(cssSelector)) |> List.ofSeq' },
        { level: 2, statement: 'with | ex -> []' },
        { level: 1, statement: 'addFinder findByHref'}
      ],
    }),
    endingSyntax: {
      commands: [{ level: 0, statement: ')' }],
    },
  }
  return params
}

function declareDependencies() {
  const params = {
    startingSyntax: {
      commands: [
        { level: 0, statement: 'open canopy.classic' },
        { level: 0, statement: 'open canopy.runner.classic' },
        { level: 0, statement: 'open System.Collections.Generic' },
      ],
    },
  }
  return params
}

function empty() {
  return {}
}
