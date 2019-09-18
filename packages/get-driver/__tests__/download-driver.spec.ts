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
import * as os from 'os'
import * as path from 'path'
import { spawn } from 'child_process'
import downloadDriver from '../src/download-driver'

jest.setTimeout(60_000)
describe('download-driver', () => {
  let tempDir: string
  beforeEach(async () => {
    tempDir = await createRandomDirectory()
  })
  afterEach(async () => {
    await fs.remove(tempDir)
  })
  it('should download the driver for the current platform', async () => {
    expect.assertions(2)
    const chromedriver = await downloadDriver({
      downloadDirectory: tempDir,
      browser: 'electron',
      platform: os.platform(),
      arch: os.arch(),
      version: '6.0.9',
    })
    const cp = spawn(chromedriver, ['--version'])
    let stdout = ''
    let processExit: () => {}
    const p = new Promise(res => {
      processExit = res as () => {}
    })
    cp.stdout.on('data', data => {
      stdout += data
    })
    cp.on('close', code => {
      expect(code).toBe(0)
      processExit()
    })
    await p
    expect(stdout).toEqual(expect.stringMatching(/chromedriver/i))
  })

  it('should download chromedriver for the current platform', async () => {
    expect.assertions(2)
    const chromedriver = await downloadDriver({
      downloadDirectory: tempDir,
      browser: 'chrome',
      platform: os.platform(),
      arch: os.arch(),
      version: '78.0.3904.11',
    })
    const cp = spawn(chromedriver, ['--version'])
    let stdout = ''
    let processExit: () => {}
    const p = new Promise(res => {
      processExit = res as () => {}
    })
    cp.stdout.on('data', data => {
      stdout += data
    })
    cp.on('close', code => {
      expect(code).toBe(0)
      processExit()
    })
    await p
    expect(stdout).toEqual(expect.stringMatching(/chromedriver/i))
  })

  it('should download geckodriver for the current platform', async () => {
    expect.assertions(2)
    const geckodriver = await downloadDriver({
      downloadDirectory: tempDir,
      browser: 'firefox',
      platform: os.platform(),
      arch: os.arch(),
      version: '69.0.1',
    })
    const cp = spawn(geckodriver, ['--version'])
    let stdout = ''
    let processExit: () => {}
    const p = new Promise(res => {
      processExit = res as () => {}
    })
    cp.stdout.on('data', data => {
      stdout += data
    })
    cp.on('close', code => {
      expect(code).toBe(0)
      processExit()
    })
    await p
    expect(stdout).toEqual(expect.stringMatching(/geckodriver/i))
  })

  it('should fail to download a non-existent driver', async () => {
    expect.assertions(1)
    try {
      await downloadDriver({
        downloadDirectory: tempDir,
        browser: 'electron',
        platform: 'darwin',
        arch: 'ia32',
        version: '6.0.9',
      })
    } catch (err) {
      expect(err.message).toBe('Failed to download driver')
    }
  })
})

async function createRandomDirectory() {
  const randomName = `__side__test__${Math.floor(Math.random() * 100000)}`
  const res = path.join(os.tmpdir(), randomName)
  await fs.mkdir(res)
  return res
}
