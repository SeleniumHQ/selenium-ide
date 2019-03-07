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

import CommandEmitter from './command'

export function emitTest(baseUrl, test) {
  global.baseUrl = baseUrl
  const name = sanitizeName(test.name)
  let result = ''
  result += `
    @Test
    public void ${name}() {
    `
  const emittedCommands = test.commands.map(command => {
    return CommandEmitter.emit(command)
  })
  return Promise.all(emittedCommands)
    .then(results => {
      results.forEach(emittedCommand => {
        result += `    ${emittedCommand}
    `
      })
    })
    .then(() => {
      result += `}`
      result += `\n`
      return emitClass(name, result)
    })
}

export function sanitizeName(input) {
  return input.replace(/([^a-z0-9]+)/gi, '')
}

export function capitalize(input) {
  return input.charAt(0).toUpperCase() + input.substr(1)
}

function emitDependencies() {
  return `
import org.junit.Test;
import org.junit.Before;
import org.junit.After;
import static org.junit.Assert.*;
import static org.hamcrest.CoreMatchers.is;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.WebElement;
import java.util.HashMap;

`
}

function emitSetup() {
  return `
    private WebDriver driver;
    private HashMap<String, Object> vars = new HashMap<>();

    @Before
    public void setUp() {
        driver = new FirefoxDriver();
    }
`
}

function emitTearDown() {
  return `
    @After
    public void tearDown() {
        driver.quit();
    }
`
}

function emitClass(name, body) {
  let result = ''
  result += emitDependencies()
  result += `public class ${capitalize(name)} {`
  result += emitSetup()
  result += emitTearDown()
  result += body
  result += `}\n`
  return result
}
