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

// eslint-disable-next-line node/no-unpublished-require
const fs = require('fs-extra')
const path = require('path')
const os = require('os')
const { chrome } = require('../packages/browser-info')
const { downloadDriver } = require('../packages/get-driver')

;(async () => {
  const downloadDirectory = path.join(__dirname, '../drivers')
  await fs.mkdirp(downloadDirectory)

  console.log('downloading chromedriver...')
  const chromeInfo = await chrome.getBrowserInfo(chrome.ChromeChannel.stable)
  await downloadDriver({
    downloadDirectory,
    browser: 'chrome',
    platform: os.platform(),
    arch: os.arch(),
    version: chromeInfo.version,
    artifactName: 'chromedriver',
  })

  console.log('downloading geckodriver...')
  await downloadDriver({
    downloadDirectory,
    browser: 'firefox',
    platform: os.platform(),
    arch: os.arch(),
    version: '70.0', // hard coded until browser-info will support firefox
    artifactName: 'geckodriver',
  })
})()
