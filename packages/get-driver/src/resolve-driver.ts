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

export function resolveDriverUrl({
  browser,
  platform,
  arch,
  version,
}: {
  browser: Browser
  platform: Platform
  arch: string
  version: string
}) {
  switch (browser) {
    case 'electron': {
      return `https://github.com/electron/electron/releases/download/v${version}/chromedriver-v${version}-${platform}-${arch}.zip`
    }
  }
}

export function resolveDriverName({
  browser,
  platform,
  version,
}: {
  browser: Browser
  platform: Platform
  version: string
}) {
  return `${DriverNames[browser]}-v${version}${
    platform === 'win32' ? '.exe' : ''
  }`
}

export type Browser = 'electron'

export type Platform = NodeJS.Platform

const DriverNames: BrowserToDriver = {
  electron: 'chromedriver',
}

type MappedBrowserNames = { [key in Browser]: string }
interface BrowserToDriver extends MappedBrowserNames {}
