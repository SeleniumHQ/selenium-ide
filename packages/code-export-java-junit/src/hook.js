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
      commands: [
        { level: 0, statement: '@AfterAll' },
        { level: 0, statement: 'public void finalTearDown() {' },
      ],
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
        { level: 0, statement: '@After' },
        { level: 0, statement: 'public void tearDown() {' },
        { level: 1, statement: 'driver.quit();' },
      ],
    },
    endingSyntax: {
      commands: [{ level: 0, statement: '}' }],
    },
  }
  return params
}

function beforeAll() {
  const params = {
    startingSyntax: {
      commands: [
        { level: 0, statement: '@BeforeAll' },
        { level: 0, statement: 'public void initialSetUp() {' },
      ],
    },
    endingSyntax: {
      commands: [{ level: 0, statement: '}' }],
    },
    registrationLevel: 1,
  }
  return params
}

function beforeEach() {
  const params = {
    startingSyntax: ({ browserName, gridUrl } = {}) => ({
      commands: [
        { level: 0, statement: '@Before' },
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
        { level: 1, statement: 'vars = new HashMap<String, Object>();' },
      ],
    }),
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
        { level: 0, statement: 'import org.junit.Test;' },
        { level: 0, statement: 'import org.junit.Before;' },
        { level: 0, statement: 'import org.junit.After;' },
        { level: 0, statement: 'import static org.junit.Assert.*;' },
        { level: 0, statement: 'import static org.hamcrest.CoreMatchers.is;' },
        { level: 0, statement: 'import static org.hamcrest.core.IsNot.not;' },
        { level: 0, statement: 'import org.openqa.selenium.By;' },
        { level: 0, statement: 'import org.openqa.selenium.WebDriver;' },
        {
          level: 0,
          statement: 'import org.openqa.selenium.firefox.FirefoxDriver;',
        },
        {
          level: 0,
          statement: 'import org.openqa.selenium.chrome.ChromeDriver;',
        },
        {
          level: 0,
          statement: 'import org.openqa.selenium.remote.RemoteWebDriver;',
        },
        {
          level: 0,
          statement: 'import org.openqa.selenium.remote.DesiredCapabilities;',
        },
        { level: 0, statement: 'import org.openqa.selenium.Dimension;' },
        { level: 0, statement: 'import org.openqa.selenium.WebElement;' },
        {
          level: 0,
          statement: 'import org.openqa.selenium.interactions.Actions;',
        },
        {
          level: 0,
          statement:
            'import org.openqa.selenium.support.ui.ExpectedConditions;',
        },
        {
          level: 0,
          statement: 'import org.openqa.selenium.support.ui.WebDriverWait;',
        },
        {
          level: 0,
          statement: 'import org.openqa.selenium.JavascriptExecutor;',
        },
        { level: 0, statement: 'import org.openqa.selenium.Alert;' },
        { level: 0, statement: 'import org.openqa.selenium.Keys;' },
        { level: 0, statement: 'import java.util.*;' },
        { level: 0, statement: 'import java.net.MalformedURLException;' },
        { level: 0, statement: 'import java.net.URL;' },
      ],
    },
  }
  return params
}

function declareVariables() {
  const params = {
    startingSyntax: {
      commands: [
        { level: 0, statement: 'private WebDriver driver;' },
        {
          level: 0,
          statement: 'private Map<String, Object> vars;',
        },
        { level: 0, statement: 'JavascriptExecutor js;' },
      ],
    },
  }
  return params
}

function empty() {
  return {}
}
