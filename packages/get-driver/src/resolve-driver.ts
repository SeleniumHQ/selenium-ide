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

import fetch from 'node-fetch'

export async function resolveDriverUrl({
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
    case 'chrome': {
      return `https://chromedriver.storage.googleapis.com/${await getChromedriverVersion(
        version
      )}/chromedriver_${getChromedriverPlatformName(platform)}.zip`
    }
    case 'firefox': {
      return `https://github.com/mozilla/geckodriver/releases/download/v${getGeckodriverVersion(
        version
      )}/geckodriver-v${getGeckodriverVersion(
        version
      )}-${getGeckodriverPlatformName(platform, arch)}.${
        platform === 'win32' ? 'zip' : 'tar.gz'
      }`
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

export type Browser = 'electron' | 'chrome' | 'firefox'

export type Platform = NodeJS.Platform

const DriverNames: BrowserToDriver = {
  electron: 'chromedriver',
  chrome: 'chromedriver',
  firefox: 'geckodriver',
}

function getChromedriverPlatformName(platform: Platform) {
  if (platform === 'darwin') {
    return 'mac64'
  } else if (platform === 'win32') {
    return 'win32'
  } else {
    return 'linux64'
  }
}

async function getChromedriverVersion(version: string) {
  const major = version.split('.')[0]
  const res = await fetch(
    `https://chromedriver.storage.googleapis.com/LATEST_RELEASE_${major}`
  )
  return await res.text()
}

function getGeckodriverPlatformName(platform: Platform, arch: string) {
  if (platform === 'darwin') {
    return 'macos'
  } else if (platform === 'win32') {
    return arch === 'x64' ? 'win64' : 'win32'
  } else {
    return arch.includes('64') ? 'linux64' : 'linux32'
  }
}

function getGeckodriverVersion(version: string) {
  // https://firefox-source-docs.mozilla.org/testing/geckodriver/Support.html#supported-platforms
  const major = parseInt(version.split('.')[0])
  if (major < 60) {
    return '0.25.0'
  }
  return '0.26.0'
}

type MappedBrowserNames = { [key in Browser]: string }
interface BrowserToDriver extends MappedBrowserNames {}
