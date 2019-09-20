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

jest.mock('../src/sh')
import { getBrowserInfo, ChromeChannel } from '../src/chrome'
import { sh, makeError } from '../src/sh'

const mockSh = (sh as unknown) as jest.Mock<any, any>

describe('chrome browser info', () => {
  it('should get stable chrome browser info', async () => {
    mockSh.mockReturnValueOnce(
      Promise.resolve({ stdout: 'Google Chrome 76.0.3809.132\n', stderr: '' })
    )
    expect(await getBrowserInfo(ChromeChannel.stable)).toEqual({
      binary: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      version: '76.0.3809.132',
      channel: 'stable',
    })
  })
  it('should fail to get chrome info when its not installed', async () => {
    mockSh.mockReturnValueOnce(Promise.reject(makeError('error', 1, '', '')))
    expect.assertions(1)
    try {
      await getBrowserInfo(ChromeChannel.stable)
    } catch (err) {
      expect(err.code).toBe(1)
    }
  })
  it('should get all chrome info', async () => {
    mockSh.mockImplementation(binary => {
      if (binary.includes('Canary')) {
        return Promise.resolve({
          stdout: 'Google Chrome 79.0.3915.0 canary\n',
          stderr: '',
        })
      } else if (binary.includes('Beta')) {
        return Promise.resolve({
          stdout: 'Google Chrome 75.0.3770.75 beta\n',
          stderr: '',
        })
      } else {
        return Promise.resolve({
          stdout: 'Google Chrome 76.0.3809.132\n',
          stderr: '',
        })
      }
    })
    expect(await getBrowserInfo()).toEqual([
      {
        binary: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        version: '76.0.3809.132',
        channel: 'stable',
      },
      {
        binary:
          '/Applications/Google Chrome Beta.app/Contents/MacOS/Google Chrome',
        version: '75.0.3770.75',
        channel: 'beta',
      },
      {
        binary:
          '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
        version: '79.0.3915.0',
        channel: 'canary',
      },
    ])
    mockSh.mockReset()
  })
  it('should get partial chrome info if some installations do not exist', async () => {
    mockSh.mockImplementation(binary => {
      if (binary.includes('Canary')) {
        return Promise.resolve({
          stdout: 'Google Chrome 79.0.3915.0 canary\n',
          stderr: '',
        })
      } else if (binary.includes('Beta')) {
        return Promise.reject(makeError('error', 1, '', ''))
      } else {
        return Promise.resolve({
          stdout: 'Google Chrome 76.0.3809.132\n',
          stderr: '',
        })
      }
    })
    expect(await getBrowserInfo()).toEqual([
      {
        binary: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        version: '76.0.3809.132',
        channel: 'stable',
      },
      {
        binary:
          '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
        version: '79.0.3915.0',
        channel: 'canary',
      },
    ])
    mockSh.mockReset()
  })
})
