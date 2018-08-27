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

import webdriver from "browser-webdriver";

const By = webdriver.By;
const until = webdriver.until;
const Key = webdriver.Key;

const IMPLICIT_WAIT = 30 * 1000;
const DEFAULT_CAPABILITIES = {
  browserName: "chrome"
};
const DEFAULT_SERVER = "http://localhost:4444/wd/hub";

export default class WebDriverExecutor {
  constructor(capabilities, server) {
    this.capabilities = capabilities || DEFAULT_CAPABILITIES;
    this.server = server || DEFAULT_SERVER;
  }

  async init() {
    this.driver = await new webdriver.Builder().withCapabilities(this.capabilities).usingServer(this.server).build();
  }

  async cleanup() {
    await this.driver.quit();
  }

  // to fool the command nodes
  // TODO: remove
  isExtCommand() {
    return true;
  }

  name(command) {
    let upperCase = command.charAt(0).toUpperCase() + command.slice(1);
    return "do" + upperCase;
  }

  // Commands go after this line

  async doOpen(url) {
    await this.driver.get(url);
  }

  async doClick(locator) {
    const element = await waitForElement(locator, this.driver);
    await element.click();
  }

  async doType(locator, value) {
    const element = await waitForElement(locator, this.driver);
    await element.clear();
    await element.sendKeys(value);
  }

  async doSendKeys(locator, value) {
    const element = await waitForElement(locator, this.driver);
    await element.sendKeys(...preprocessKeys(value));
  }
}

async function waitForElement(locator, driver) {
  const elementLocator = parseLocator(locator);
  await driver.wait(until.elementLocated(elementLocator), IMPLICIT_WAIT);
  const element = await driver.findElement(elementLocator);

  return element;
}

function parseLocator(locator) {
  if (/^\/\//.test(locator)) {
    return By.xpath(locator);
  }
  const fragments = locator.split("=");
  const type = fragments.shift();
  const selector = fragments.join("=");
  if (LOCATORS[type]) {
    return LOCATORS[type](selector);
  } else {
    throw new Error(type ? `Unknown locator ${type}` : "Locator can't be empty");
  }
}

function preprocessKeys(str) {
  let keys = [];
  let match = str.match(/\$\{\w+\}/g);
  if (!match) {
    keys.push(str);
  } else {
    let i = 0;
    while (i < str.length) {
      let currentKey = match.shift(), currentKeyIndex = str.indexOf(currentKey, i);
      if (currentKeyIndex > i) {
        // push the string before the current key
        keys.push(str.substr(i, currentKeyIndex - i));
        i = currentKeyIndex;
      }
      if (currentKey) {
        if (/^\$\{KEY_\w+\}/.test(currentKey)) {
          // is a key
          let keyName = currentKey.match(/\$\{KEY_(\w+)\}/)[1];
          let key = Key[keyName];
          if (key) {
            keys.push(key);
          } else {
            throw new Error(`Unrecognised key ${keyName}`);
          }
        } else {
          // not a key, and not a stored variable, push it as-is
          keys.push(currentKey);
        }
        i += currentKey.length;
      } else if (i < str.length) {
        // push the rest of the string
        keys.push(str.substr(i, str.length));
        i = str.length;
      }
    }
  }
  return keys;
}

const LOCATORS = {
  "id": By.id,
  "name": By.name,
  "link": By.linkText,
  "linkText": By.linkText,
  "partialLinkText": By.partialLinkText,
  "css": By.css,
  "xpath": By.xpath
};
