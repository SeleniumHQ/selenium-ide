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

import * as os from 'os'
import * as path from 'path'
import { Builder, Capabilities } from 'selenium-webdriver'
import * as chrome from 'selenium-webdriver/chrome'
import * as firefox from 'selenium-webdriver/firefox'
import { CACHE_PATH } from './cache'

export async function createDriver({
  capabilities,
}: {
  capabilities: {} | Capabilities
}) {
  const { chromeService, firefoxService } = createServices()
  return await new Builder()
    .setChromeService(chromeService)
    .setFirefoxService(firefoxService)
    .withCapabilities(capabilities)
    .build()
}

export async function createHeadlessChrome() {
  return await createDriver({
    capabilities: {
      browserName: 'chrome',
      'goog:chromeOptions': { args: ['headless', 'disable-gpu'] },
    },
  })
}

export async function createHeadlessFirefox() {
  return await createDriver({
    capabilities: {
      browserName: 'firefox',
      'moz:firefoxOptions': { args: ['-headless'] },
    },
  })
}

function createServices() {
  return {
    chromeService: new chrome.ServiceBuilder(
      path.join(
        CACHE_PATH,
        `chromedriver${os.platform() === 'win32' ? '.exe' : ''}`
      )
    ),
    firefoxService: new firefox.ServiceBuilder(
      path.join(
        CACHE_PATH,
        `geckodriver${os.platform() === 'win32' ? '.exe' : ''}`
      )
    ),
  }
}
