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

import { By, until } from "selenium-webdriver";
import CreateChromeSession from "./chrome";

export const Browsers = {
  CHROME: "chrome"
};

export default class Extension {
  constructor(browserName = Browsers.CHROME) {
    if (browserName !== Browsers.CHROME) {
      // TODO: improve once we introduce firefox
      throw new Error(`${browserName} is unsupported for testing!`);
    }
    this.browserName = browserName;
  }

  async init() {
    if (this.browserName === Browsers.CHROME) {
      this.driver = await CreateChromeSession();
    }
    const d = this.driver;
    async function waitForIDEToOpen() {
      const handles = await d.getAllWindowHandles();
      if (handles.length < 2) {
        await new Promise(res => {
          setTimeout(res, 100);
        }).then(waitForIDEToOpen);
      }
    }
    await waitForIDEToOpen();
    // close the initial window the browser opens
    await this.driver.close();
    const handles = await this.driver.getAllWindowHandles();
    this._ideHandle = handles[0];
    await this.switchToIDE();
    await this.driver.wait(until.elementLocated(By.css(".si-record")));

    return this;
  }

  async clean() {
    this.driver.quit();
  }

  async switchToIDE() {
    await this.driver.switchTo().window(this._ideHandle);
  }
}
