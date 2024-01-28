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
import { Arch } from './types'

export async function resolveDriverUrl({
  browser,
  platform,
  arch,
  version,
}: {
  browser: Browser
  platform: Platform
  arch: Arch
  version: string
}) {
  switch (browser) {
    case 'electron': {
      throw new Error(
        'Installation of electron browser handled by electron-chromedriver package'
      )
    }
    case 'chrome': {
      return await getChromedriverURL(platform, arch, version)
    }
    case 'MicrosoftEdge': {
      return `https://msedgedriver.azureedge.net/${version}/edgedriver_${getEdgePlatformName(
        platform,
        arch
      )}.zip`
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

export type Browser = 'chrome' | 'electron' | 'firefox' | 'MicrosoftEdge'

export type Platform = NodeJS.Platform

const DriverNames: BrowserToDriver = {
  chrome: 'chromedriver',
  electron: 'chromedriver',
  firefox: 'geckodriver',
  MicrosoftEdge: 'MicrosoftEdge',
}

function getChromedriverPlatformName(
  platform: Platform,
  arch: Arch,
  majorVersion: number
) {
  if (platform === 'darwin') {
    if (majorVersion < 115) {
      return 'mac64'
    }
    if (arch === 'arm64') {
      return 'mac-arm64'
    }
    return 'mac-x64'
  } else if (platform === 'win32') {
    return 'win32'
  } else {
    return 'linux64'
  }
}

export type NewChromeDownloadList = {
  platform: string
  url: string
}[]

export type NewChromedriverListing = {
  timestamp: string
  versions: {
    version: string
    revision: string
    downloads: {
      chrome: NewChromeDownloadList
      chromedriver: NewChromeDownloadList
    }
  }[]
}

async function getChromedriverURL(
  platform: Platform,
  arch: Arch,
  version: string
) {
  const major = Number(version.split('.')[0])
  const platformName = getChromedriverPlatformName(platform, arch, major)
  if (major < 115) {
    const url = `https://chromedriver.storage.googleapis.com/LATEST_RELEASE_${major}`
    const res = await fetch(url)
    const responseText = await res.text()
    if (responseText.includes('Error')) {
      throw new Error(
        `Failed to get chromedriver version for chrome version ${version} from url ${url}`
      )
    }
    const outputVersion = responseText.replace(/\n/g, '').trim()
    return `https://chromedriver.storage.googleapis.com/${outputVersion}/chromedriver_${platformName}.zip`
  } else {
    const url =
      'https://googlechromelabs.github.io/chrome-for-testing/known-good-versions-with-downloads.json'
    const res = await fetch(url)
    const versionLibrary: NewChromedriverListing = await res.json()
    const perfectMatch = versionLibrary.versions.find(
      (v) =>
        v.version === version &&
        v.downloads.chromedriver.find((d) => d.platform === platformName)
    )
    if (perfectMatch) {
      return perfectMatch.downloads.chromedriver.find(
        (d) => d.platform === platformName
      )!.url!
    }
    const closestMatch = versionLibrary.versions.find(
      (v) =>
        Number(v.version.split('.')[0]) === major &&
        v.downloads.chromedriver.find((d) => d.platform === platformName)
    )
    if (closestMatch) {
      return closestMatch.downloads.chromedriver.find(
        (d) => d.platform === platformName
      )!.url!
    }
    throw new Error(
      'Failed to find chromedriver url for inputs ' +
        JSON.stringify({ platform, arch, version })
    )
  }
}

function getEdgePlatformName(platform: Platform, arch: Arch) {
  if (platform === 'darwin') {
    return 'mac64'
  } else if (platform === 'win32') {
    return arch === 'x64' ? 'win64' : 'win32'
  } else {
    return arch === 'arm64' ? 'arm64' : 'linux64'
  }
}

function getGeckodriverPlatformName(platform: Platform, arch: Arch) {
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
  if (major < 78) {
    return '0.29.1'
  }
  if (major < 91) {
    return '0.30.0'
  }
  if (major < 102) {
    return '0.31.0'
  }
  if (major < 116) {
    return '0.33.0'
  }
  return '0.34.0'
}

type MappedBrowserNames = { [key in Browser]: string }
interface BrowserToDriver extends MappedBrowserNames {}
