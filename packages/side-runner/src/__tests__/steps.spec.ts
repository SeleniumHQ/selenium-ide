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

import { CommandShape } from '@seleniumhq/side-model'
import { formatStep } from '../steps'

const command = {
  id: '1',
  command: 'assertText',
  target: 'id=title',
  value: 'Hello',
} as CommandShape

describe('step lines', () => {
  it('marks each finished state', () => {
    expect(formatStep('login', command, 'passed')).toBe(
      '✓ login › assertText | id=title | Hello'
    )
    expect(formatStep('login', command, 'undetermined')).toBe(
      '○ login › assertText | id=title | Hello'
    )
    expect(formatStep('login', command, 'skipped')).toBe(
      '- login › assertText | id=title | Hello'
    )
  })
  it('adds the error of a failed command', () => {
    expect(formatStep('login', command, 'failed', 'Not found')).toBe(
      '✕ login › assertText | id=title | Hello: Not found'
    )
    expect(formatStep('login', command, 'errored', 'Timed out')).toBe(
      '✕ login › assertText | id=title | Hello: Timed out'
    )
  })
  it('puts a multi-line error on one line', () => {
    expect(
      formatStep('login', command, 'failed', 'Not found\n  at line 1\n')
    ).toBe('✕ login › assertText | id=title | Hello: Not found at line 1')
  })
  it('prints nothing while a command runs', () => {
    expect(formatStep('login', command, 'pending')).toBeUndefined()
    expect(formatStep('login', command, 'executing')).toBeUndefined()
  })
  it('leaves out empty target and value', () => {
    expect(
      formatStep(
        'login',
        { id: '2', command: 'close', target: '', value: '' },
        'passed'
      )
    ).toBe('✓ login › close')
  })
})
