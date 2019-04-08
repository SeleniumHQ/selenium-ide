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

import Hook from '../../src/hook'

describe('Hooks', () => {
  it('should accept starting and ending syntax as strings', () => {
    const hook = new Hook({ startingSyntax: 'blah', endingSyntax: 'blah' })
    expect(hook.startingSyntax).toBeDefined()
    expect(hook.endingSyntax).toBeDefined()
  })
  it('should accept starting and ending syntax as objects', () => {
    const hook = new Hook({
      startingSyntax: { commands: [{ level: 0, statement: 'blah' }] },
      endingSyntax: { commands: [{ level: 0, statement: 'blah' }] },
    })
    expect(hook.startingSyntax).toBeDefined()
    expect(hook.endingSyntax).toBeDefined()
  })
  it('should accept a registration level', () => {
    const hook = new Hook({ registrationLevel: 1 })
    expect(hook.registrationLevel).toBeDefined()
  })
  it('should register a command string', () => {
    const hook = new Hook()
    hook.register('blah')
    expect(hook.registeredCommands).toEqual(['blah'])
  })
  it('should register a command string with line breaks', () => {
    const hook = new Hook()
    hook.register('blah\nblah')
    expect(hook.registeredCommands).toEqual(['blah', 'blah'])
  })
  it('should clear registered commands', () => {
    const hook = new Hook()
    hook.register('blah')
    hook.clearRegister()
    expect(hook.registeredCommands).toEqual([])
  })
  it('should emit command object', () => {
    const hook = new Hook({
      startingSyntax: 'blah1',
      endingSyntax: 'blah99',
      registrationLevel: 1,
    })
    hook.register('blah2')
    hook.register('blah3')
    expect(hook.emit()).toEqual({
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
    expect(hook.emit({ isOptional: true })).toEqual('')
  })
  it('should allow for checking if a command is already registered', () => {
    const hook = new Hook()
    hook.register('blah')
    expect(hook.isRegistered('blah')).toBeTruthy()
    expect(hook.isRegistered('halb')).toBeFalsy()
  })
})
