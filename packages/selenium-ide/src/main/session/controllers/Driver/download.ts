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
import * as path from 'path'
import * as os from 'os'
import { downloadDriver as doDownloadDriver } from '@seleniumhq/get-driver'

const downloadDriver = async (browserVersion: string) => {
  const downloadDirectory = path.join(__dirname, '../files')
  const chromedrivers = (
    await fs.readdir(path.join(__dirname, '../files'))
  ).filter((file) => file.startsWith('chromedriver'))

  let shouldDownload = true
  for await (let chromedriver of chromedrivers) {
    const [, version] = chromedriver.split('-v')
    if (version === browserVersion) {
      shouldDownload = false
    } else {
      await fs.remove(path.join(downloadDirectory, chromedriver))
    }
  }

  if (shouldDownload) {
    console.log(`downloading chromedriver for chrome version ${browserVersion}...`)
    await doDownloadDriver({
      downloadDirectory,
      browser: 'chrome',
      platform: os.platform(),
      arch: os.arch(),
      version: browserVersion,
    })
  }
}

export default downloadDriver
