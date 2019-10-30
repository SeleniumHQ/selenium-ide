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
import { sh } from './sh'

// Extrapolated from https://chromium.googlesource.com/chromium/src/+/master/chrome/test/chromedriver/chrome/chrome_finder_mac.mm
const CHROME_STABLE_MACOS_INSTALL_LOCATIONS = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '~/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
]

const CHROME_BETA_MACOS_INSTALL_LOCATIONS = [
  '/Applications/Google Chrome Beta.app/Contents/MacOS/Google Chrome',
  '~/Applications/Google Chrome Beta.app/Contents/MacOS/Google Chrome',
]

const CHROME_CANARY_MACOS_INSTALL_LOCATIONS = [
  '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
  '~/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
]

// Taken from https://chromium.googlesource.com/chromium/src/+/master/chrome/test/chromedriver/chrome/chrome_finder.cc
const CHROME_STABLE_LINUX_INSTALL_LOCATIONS = [
  '/usr/local/sbin/google-chrome',
  '/usr/local/bin/google-chrome',
  '/usr/sbin/google-chrome',
  '/usr/bin/google-chrome',
  '/sbin/google-chrome',
  '/bin/google-chrome',
  '/opt/google/chrome/google-chrome',
]

const CHROME_BETA_LINUX_INSTALL_LOCATIONS = [
  '/usr/local/sbin/google-chrome-beta',
  '/usr/local/bin/google-chrome-beta',
  '/usr/sbin/google-chrome-beta',
  '/usr/bin/google-chrome-beta',
  '/sbin/google-chrome-beta',
  '/bin/google-chrome-beta',
  '/opt/google/chrome-beta/google-chrome-beta',
]

export namespace Chrome {
  export async function getBrowserInfo(channel?: ChromeChannel) {
    const platform = os.platform()
    if (platform === 'darwin') {
      if (channel) {
        switch (channel) {
          case ChromeChannel.stable: {
            return await getChromeInfo(CHROME_STABLE_MACOS_INSTALL_LOCATIONS)
          }
          case ChromeChannel.beta: {
            return await getChromeInfo(CHROME_BETA_MACOS_INSTALL_LOCATIONS)
          }
          case ChromeChannel.canary: {
            return await getChromeInfo(CHROME_CANARY_MACOS_INSTALL_LOCATIONS)
          }
        }
      }
      return (await Promise.all(
        [
          getChromeInfo(CHROME_STABLE_MACOS_INSTALL_LOCATIONS),
          getChromeInfo(CHROME_BETA_MACOS_INSTALL_LOCATIONS),
          getChromeInfo(CHROME_CANARY_MACOS_INSTALL_LOCATIONS),
        ].map(p => p.catch(() => {}))
      )).filter(Boolean) as BrowserInfo[]
    } else if (platform === 'linux') {
      if (channel) {
        switch (channel) {
          case ChromeChannel.stable: {
            return await getChromeInfo(CHROME_STABLE_LINUX_INSTALL_LOCATIONS)
          }
          case ChromeChannel.beta: {
            return await getChromeInfo(CHROME_BETA_LINUX_INSTALL_LOCATIONS)
          }
          default: {
            throw new Error(`Unsupported channel ${channel}`)
          }
        }
      }
      return (await Promise.all(
        [
          getChromeInfo(CHROME_STABLE_LINUX_INSTALL_LOCATIONS),
          getChromeInfo(CHROME_BETA_LINUX_INSTALL_LOCATIONS),
        ].map(p => p.catch(() => {}))
      )).filter(Boolean) as BrowserInfo[]
    } else {
      throw new Error('Unsupported platform')
    }
  }

  async function getChromeInfo(
    installLocations: string[]
  ): Promise<BrowserInfo> {
    for await (let binary of installLocations) {
      try {
        const { stdout } = await sh(binary, ['--version'])
        return {
          binary,
          ...parseChromeEdition(stdout),
        }
        // eslint-disable-next-line
      } catch {}
    }
    throw new Error('Unable to find Chrome installation')
  }

  function parseChromeEdition(output: string) {
    const [version, channel] = output
      .split('\n')[0]
      .replace('Google Chrome ', '')
      .split(' ')
    return {
      version,
      channel: channel ? (channel as ChromeChannel) : ChromeChannel.stable,
    }
  }

  export interface BrowserInfo {
    channel: ChromeChannel
    binary: string
    version: string
  }

  export enum ChromeChannel {
    stable = 'stable',
    beta = 'beta',
    canary = 'canary',
  }
}
