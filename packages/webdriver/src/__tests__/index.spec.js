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

import webdriver from "selenium-webdriver";

describe("browser webdriver", () => {
  it("should get web page title", async () => {
    const driver = new webdriver.Builder().forBrowser("chrome").usingServer("http://localhost:4444/wd/hub").build();
    driver.get("http://nginx/webdriver.html");

    let result = await driver.executeAsyncScript((...args) => {
      let done = args[args.length - 1];
      let d = new window.browserWebdriver.Builder().forBrowser("chrome").usingServer("http://localhost:4444/wd/hub").build();
      d.get("https://google.com");
      d.getTitle().then(title => {
        done(title);
      });
    });

    expect(result).toBe("Google");
  });
});
