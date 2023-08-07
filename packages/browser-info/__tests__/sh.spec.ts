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

import { sh } from '../src/sh'

describe('sh', () => {
  it('should run a process', async () => {
    try {
      await sh('node', ['-e', '""'])
    } catch {
      // should not reach this place
      expect(true).toBeFalsy()
    }
  })
  it('should return stdout and stderr', async () => {
    const { stdout, stderr } = await sh('node', [
      '-e',
      'console.log(`out`);console.error(`err`);',
    ])
    expect(stdout).toBe('out\n')
    expect(stderr).toBe('err\n')
  })
  it('should return stdout and stderr even if the process crashes', async () => {
    expect.assertions(3)
    try {
      await sh('node', [
        '-e',
        'console.log(`out`);console.error(`err`);process.exit(1);',
      ])
    } catch (err) {
      expect(err.stdout).toBe('out\n')
      expect(err.stderr).toBe('err\n')
      expect(err.code).toBe(1)
    }
  })
  it('should fail to start a process that does not exist', async () => {
    expect.assertions(1)
    try {
      await sh('command-that-does-not-exist')
    } catch (err) {
      expect(err.code).toBe(1)
    }
  })
})
