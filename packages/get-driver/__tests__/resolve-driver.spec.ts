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
import { resolveDriverUrl, resolveDriverName } from '../src/resolve-driver'

describe('resolve-driver', () => {
  describe('resolveDriverUrl', () => {
    it('should resolve a download link of an electron driver', async () => {
      expect(
        await resolveDriverUrl({
          browser: 'electron',
          platform: os.platform(),
          arch: os.arch(),
          version: '6.0.9',
        })
      ).toBe(
        `https://github.com/electron/electron/releases/download/v6.0.9/chromedriver-v6.0.9-${
          os.platform
        }-${os.arch()}.zip`
      )
    })
    it('should resolve a download link of a chrome driver', async () => {
      expect(
        await resolveDriverUrl({
          browser: 'chrome',
          platform: 'darwin',
          arch: os.arch(),
          version: '78.0.3904.11',
        })
      ).toBe(
        'https://chromedriver.storage.googleapis.com/78.0.3904.11/chromedriver_mac64.zip'
      )
    })
    it('should resolve a download link of a firefox driver', async () => {
      expect(
        await resolveDriverUrl({
          browser: 'firefox',
          platform: 'darwin',
          arch: os.arch(),
          version: '69.0.1',
        })
      ).toBe(
        'https://github.com/mozilla/geckodriver/releases/download/v0.25.0/geckodriver-v0.25.0-macos.tar.gz'
      )
    })
  })
  describe('resolveDriverName', () => {
    it('should resolve a driver name for mac (POSIX based)', () => {
      expect(
        resolveDriverName({
          browser: 'electron',
          platform: 'darwin',
          version: '6.0.9',
        })
      ).toBe('chromedriver-v6.0.9')
    })
    it('should resolve a driver name for Windows', () => {
      expect(
        resolveDriverName({
          browser: 'electron',
          platform: 'win32',
          version: '6.0.9',
        })
      ).toBe('chromedriver-v6.0.9.exe')
    })
  })
})
