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

import { By } from "selenium-webdriver";
import Extension from "./extension";

jest.setTimeout(300000);

describe("Selenium IDE", () => {
  let ext;
  afterEach(async () => {
    await ext.clean();
  });
  it("should load", async () => {
    ext = await new Extension().init();
    expect(await ext.driver.getTitle()).toBe("Selenium IDE - seed project");
  });
  it("should run the smoke suite", async () => {
    ext = await new Extension().init();
    const playAllButton = await ext.driver.findElement(By.css(".si-play-all"));
    await playAllButton.click();
    await ext.driver.wait(() => (
      ext.driver.executeScript(() => (
        !window._playbackState.isPlaying
      ))
    ));
    const failureCount = await ext.driver.executeScript(() => (window._playbackState.failures));
    if (failureCount > 0) {
      console.log(`FAILING TESTS: ${await ext.driver.executeScript(() => (window._playbackState.failedTests))}`);
      console.log(`FAILURE MESSAGES: ${await ext.driver.executeScript(() => (window._playbackState.failureMessages))}`);
    }
    expect(failureCount).toBe(0);
  });
});
