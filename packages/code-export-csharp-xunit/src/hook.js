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
  afterAll: empty,
  afterEach,
  beforeAll: empty,
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

function beforeEach() {
  const params = {
    startingSyntax: ({ browserName, gridUrl } = {}) => ({
      commands: [
        { level: 0, statement: `public SuiteTests()` },
        { level: 0, statement: `{` },
        {
          level: 1,
          statement: gridUrl
            ? `driver = new RemoteWebDriver(new Uri("${gridUrl}"), new ${
                browserName ? browserName : 'Chrome'
              }Options().ToCapabilities());`
            : `driver = new ${browserName ? browserName : 'Chrome'}Driver();`,
        },
        {
          level: 1,
          statement: `js = (IJavaScriptExecutor)driver;`,
        },
        {
          level: 1,
          statement: `vars = new Dictionary<String, Object>();`,
        },
      ],
    }),
    endingSyntax: {
      commands: [{ level: 0, statement: '}' }],
    },
  }
  return params
}

function afterEach() {
  const params = {
    startingSyntax: {
      commands: [
        { level: 0, statement: `public void Dispose()` },
        { level: 0, statement: `{` },
        { level: 1, statement: `driver.Quit();` },
      ],
    },
    endingSyntax: {
      commands: [{ level: 0, statement: '}' }],
    },
  }
  return params
}

function declareDependencies() {
  const params = {
    startingSyntax: {
      commands: [
        { level: 0, statement: `using System;` },
        { level: 0, statement: `using System.Collections.Generic;` },
        { level: 0, statement: `using System.Linq;` },
        { level: 0, statement: 'using System.Threading;' },
        { level: 0, statement: `using OpenQA.Selenium;` },
        { level: 0, statement: `using OpenQA.Selenium.Chrome;` },
        { level: 0, statement: `using OpenQA.Selenium.Firefox;` },
        { level: 0, statement: `using OpenQA.Selenium.Remote;` },
        { level: 0, statement: `using OpenQA.Selenium.Support.UI;` },
        { level: 0, statement: `using OpenQA.Selenium.Interactions;` },
        { level: 0, statement: `using Xunit;` },
      ],
    },
  }
  return params
}

function declareVariables() {
  const params = {
    startingSyntax: {
      commands: [
        { level: 0, statement: `public IWebDriver driver {get; private set;}` },
        {
          level: 0,
          statement: `public IDictionary<String, Object> vars {get; private set;}`,
        },
        {
          level: 0,
          statement: `public IJavaScriptExecutor js {get; private set;}`,
        },
      ],
    },
  }
  return params
}

function empty() {
  return {}
}
