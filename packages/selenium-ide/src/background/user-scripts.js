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

import browser from 'webextension-polyfill'

export const USER_SCRIPTS_OFF =
  'Selenium IDE needs permission to run JavaScript from your tests. ' +
  'In Chrome or Edge, open the extension details and turn on "Allow User Scripts". ' +
  'In Firefox, open about:addons, choose Selenium IDE, open Permissions and turn on the user scripts permission.'

// Browsers don't run user scripts in extension pages, like the page a
// playback window shows before the test opens a URL.
const NO_PAGE =
  'JavaScript runs in the page under test. Open a page first, for example with an open command.'

async function userScriptsAvailable() {
  try {
    // Throws when the permission or the browser toggle is off
    await browser.userScripts.getScripts()
    return true
  } catch (e) {
    return false
  }
}

// Runs code from a test in the frame that asked for it, and returns the
// result the code builds (see content/user-script.js).
export async function executeUserScript(code, sender) {
  if (sender.url && sender.url.startsWith(browser.runtime.getURL(''))) {
    return { error: NO_PAGE }
  }
  if (!browser.userScripts || !(await userScriptsAvailable())) {
    return { error: USER_SCRIPTS_OFF }
  }
  try {
    const [injection] = await browser.userScripts.execute({
      target: { tabId: sender.tab.id, frameIds: [sender.frameId] },
      js: [{ code }],
      injectImmediately: true,
    })
    if (!injection) {
      return { error: 'The script did not run' }
    }
    if (injection.error !== undefined) {
      return {
        error:
          typeof injection.error === 'string'
            ? injection.error
            : 'The script failed',
      }
    }
    return injection.result
  } catch (e) {
    return { error: e.message }
  }
}
