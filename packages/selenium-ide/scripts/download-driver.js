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
const { downloadDriver } = require('@seleniumhq/get-driver')

;(async () => {
  const downloadDirectory = path.join(__dirname, '../files')
  const pkg = require('electron/package.json')
  const chromedrivers = (await fs.readdir(
    path.join(__dirname, '../files')
  )).filter(file => file.startsWith('chromedriver'))

  let shouldDownload = true
  for await (let chromedriver of chromedrivers) {
    const [_, version] = chromedriver.split('-v')
    if (version === pkg.version) {
      shouldDownload = false
    } else {
      await fs.remove(path.join(downloadDirectory, chromedriver))
    }
  }

  if (shouldDownload) {
    console.log('downloading chromedriver for this electron version...')
    await downloadDriver({
      downloadDirectory,
      browser: 'electron',
      platform: os.platform(),
      arch: os.arch(),
      version: pkg.version,
    })
  }
})()
