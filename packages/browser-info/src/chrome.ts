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

import { sh } from './sh'

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

export async function getBrowserInfo(channel?: ChromeChannel) {
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
  )).filter(Boolean)
}

async function getChromeInfo(installLocations: string[]): Promise<BrowserInfo> {
  for await (let binary of installLocations) {
    const { stdout } = await sh(binary, ['--version'])
    return {
      binary,
      ...parseChromeEdition(stdout),
    }
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
