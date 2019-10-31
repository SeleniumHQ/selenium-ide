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
import UAParser from 'ua-parser-js'

const parser = new UAParser(window.navigator.userAgent)
const browserName = parser.getBrowser().name
const isChrome = browserName === 'Chrome'
const isFirefox = browserName === 'Firefox'

function getId() {
  if (process.env.SIDE_ID) return process.env.SIDE_ID
  return isChrome
    ? 'mooikfkahbdckldjjndioackbalphokd'
    : isFirefox
    ? '{a6fd85ed-e919-4a43-a5af-8da18bda539f}'
    : ''
}

const seideId = getId()

function startPolling(payload) {
  setInterval(() => {
    browser.runtime
      .sendMessage(seideId, {
        uri: '/health',
        verb: 'get',
      })
      .catch(res => ({ error: res.message }))
      .then(res => {
        if (!res) {
          browser.runtime.sendMessage(seideId, {
            uri: '/register',
            verb: 'post',
            payload,
          })
        }
      })
  }, 1000)
}

startPolling({
  name: "Selenium IDE plugin",
  version: "1.0.0",
  commands: [
    {
      id: "successfulCommand",
      name: "successful command"
    },
    {
      id: "failCommand",
      name: "failed command"
    }
  ]
})

browser.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  if (message.action === "execute") {
    switch (message.command.command) {
      case "successfulCommand":
        sendResponse(true);
        break;
      case "failCommand":
        sendResponse({ error: "Some failure has occurred" });
        break;
    }
  }
  sendResponse(undefined);
});