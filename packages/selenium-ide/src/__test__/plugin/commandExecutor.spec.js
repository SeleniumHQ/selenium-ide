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

import {
  registerCommand,
  canExecuteCommand,
  executeCommand,
} from '../../plugin/commandExecutor'

describe('command executor', () => {
  it('should register a command', () => {
    expect(registerCommand('test', new Function())).toBeUndefined()
  })
  it('should fail to register a command with no key', () => {
    expect(() => registerCommand()).toThrowError(
      'Expected to receive string instead received undefined'
    )
  })
  it('should fail to register a command with a key that is not string', () => {
    expect(() => registerCommand(5, new Function())).toThrowError(
      'Expected to receive string instead received number'
    )
  })
  it('should fail to register a command with no callback', () => {
    expect(() => registerCommand('command')).toThrowError(
      'Expected to receive function instead received undefined'
    )
  })
  it('should fail to register a command with a callback that is not a function', () => {
    expect(() => registerCommand('command', 1)).toThrowError(
      'Expected to receive function instead received number'
    )
  })
  it('should fail to register a command with the same key as a previous one', () => {
    const key = 'command'
    registerCommand(key, new Function())
    expect(() => registerCommand(key, new Function())).toThrowError(
      `A command named ${key} already exists`
    )
  })
  it('should check if a command may be executed', () => {
    registerCommand('exists', new Function())
    expect(canExecuteCommand('exists')).toBeTruthy()
    expect(canExecuteCommand('nonExistent')).toBeFalsy()
  })
  it('should throw when executing a command that does not exist', () => {
    const commandName = 'nonExistent'
    expect(() => executeCommand(commandName)).toThrowError(
      `The command ${commandName} is not registered with any plugin`
    )
  })
  it('should successfully execute a sync command', () => {
    const cb = jest.fn()
    registerCommand('syncCommand', cb)
    executeCommand('syncCommand')
    expect(cb).toHaveBeenCalled()
  })
  it('should fail to execute a sync command', () => {
    const command = 'syncFail'
    const cb = () => {
      throw new Error()
    }
    registerCommand(command, cb)
    expect(() => {
      try {
        executeCommand(command)
      } catch (e) {
        if (
          e.message !==
          `The command ${command} is not registered with any plugin`
        ) {
          throw e
        }
      }
    }).toThrow()
  })
  it('should successfully execute an async command', () => {
    registerCommand('asyncCommand', () => Promise.resolve(true))
    expect(executeCommand('asyncCommand')).resolves.toBeTruthy()
  })
  it('should fail to execute an async command', () => {
    registerCommand('asyncFail', () => Promise.reject(false))
    expect(executeCommand('asyncFail')).rejects.toBeFalsy()
  })
  it('should pass options to the command executor', () => {
    registerCommand(
      'optionsCommand',
      (_target, _value, options) => options.first
    )
    const option = 'test'
    expect(
      executeCommand('optionsCommand', undefined, undefined, { first: option })
    ).toEqual(option)
  })
})
