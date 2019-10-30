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

import * as fs from 'fs-extra'
import os from 'os'
import { Chrome } from '@seleniumhq/browser-info'
import { downloadDriver } from '@seleniumhq/get-driver'
import { CACHE_PATH } from './cache'

export async function updateDrivers() {
  const downloadDirectory = CACHE_PATH
  await fs.mkdirp(downloadDirectory)

  console.log('updating chromedriver...')
  const chromeInfo = (await Chrome.getBrowserInfo(
    Chrome.ChromeChannel.stable
  )) as Chrome.BrowserInfo
  await downloadDriver({
    downloadDirectory,
    browser: 'chrome',
    platform: os.platform(),
    arch: os.arch(),
    version: chromeInfo.version,
    artifactName: 'chromedriver',
  })

  console.log('updating geckodriver...')
  await downloadDriver({
    downloadDirectory,
    browser: 'firefox',
    platform: os.platform(),
    arch: os.arch(),
    version: '70.0', // hard coded until browser-info will support firefox
    artifactName: 'geckodriver',
  })
}
