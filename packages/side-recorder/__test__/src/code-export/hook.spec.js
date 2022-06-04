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

import Hook from '../../../src/code-export/hook'

describe('Hooks', () => {
  it('should clear registered commands', () => {
    const hook = new Hook()
    hook.register(() => {
      return 'blah'
    })
    hook.clearRegister()
    expect(hook.emitters).toEqual([])
  })
  it('should not error when no emitters registered', async () => {
    const hook = new Hook()
    const result = await hook.emit()
    expect(result.commands).toEqual([])
  })
  it('should emit command object', () => {
    const hook = new Hook({
      startingSyntax: 'blah1',
      endingSyntax: 'blah99',
      registrationLevel: 1,
    })
    hook.register(() => {
      return Promise.resolve('blah2')
    })
    hook.register(() => {
      return 'blah3'
    })
    expect(hook.emit()).resolves.toEqual({
      commands: [
        { level: 0, statement: 'blah1' },
        { level: 1, statement: 'blah2' },
        { level: 1, statement: 'blah3' },
        { level: 0, statement: 'blah99' },
      ],
    })
  })
  it('should optionally emit commands', () => {
    const hook = new Hook({ startingSyntax: 'blah1', endingSyntax: 'blah99' })
    expect(hook.emit({ isOptional: true })).resolves.toBeUndefined()
    expect(hook.emit({ isOptional: false })).resolves.toEqual({
      commands: [
        { level: 0, statement: 'blah1' },
        { level: 0, statement: 'blah99' },
      ],
    })
  })
  it('should emit a command with empty string', () => {
    const hook = new Hook({ startingSyntax: 'a', endingSyntax: 'b' })
    hook.register(() => {
      return Promise.resolve('')
    })
    expect(hook.emit({ isOptional: false })).resolves.toEqual({
      commands: [
        { level: 0, statement: 'a' },
        { level: 0, statement: '' },
        { level: 0, statement: 'b' },
      ],
    })
  })
  it('should check if a command is already registered', () => {
    const hook = new Hook()
    hook.register(() => {
      return 'blah'
    })
    hook.register(() => {
      return 1234
    })
    expect(hook.isRegistered('blah')).resolves.toBeTruthy()
    expect(hook.isRegistered(1234)).resolves.toBeTruthy()
    expect(hook.isRegistered('halb')).resolves.toBeFalsy()
  })
})
