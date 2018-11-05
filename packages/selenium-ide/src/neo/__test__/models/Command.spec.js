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

import Command, { Commands } from '../../models/Command'

describe('Command', () => {
  it('should generate and id', () => {
    expect(new Command().id).toBeDefined()
  })
  it('should set basic values in constructor', () => {
    const c = 'click at'
    const t = 'button'
    const v = '32, 21'
    const command = new Command(undefined, c, t, v)
    expect(command.command).toBe(c)
    expect(command.target).toBe(t)
    expect(command.value).toBe(v)
    expect(command.id).toBeDefined()
  })
  it('should set a comment', () => {
    const command = new Command()
    command.setComment('test')
    expect(command.comment).toBe('test')
  })
  it('should set a command', () => {
    const command = new Command()
    command.setCommand(Commands.values.open)
    expect(command.command).toBe(Commands.values.open)
  })
  it('should be a valid command', () => {
    const command = new Command()
    command.setCommand('open')
    expect(command.isValid).toBeTruthy()
  })
  it('should be an invalid command', () => {
    const command = new Command()
    command.setCommand('test invalid')
    expect(command.isValid).toBeFalsy()
  })
  it('should replace undefined input with empty strings', () => {
    const command = new Command()
    command.setCommand()
    command.setTarget()
    command.setTargets()
    command.setValue()
    command.setComment()
    expect(command.command).toEqual('')
    expect(command.target).toEqual('')
    expect(command.targets.length).toBe(0)
    expect(command.value).toEqual('')
    expect(command.comment).toEqual('')
  })
  it('should set the target', () => {
    const command = new Command()
    command.setTarget('a')
    expect(command.target).toBe('a')
  })
  it('should set the targets', () => {
    const command = new Command()
    command.setTargets([['button', 'xpath']])
    expect(command.targets[0][0]).toBe('button')
    expect(command.targets[0][1]).toBe('xpath')
  })
  it('should set the value', () => {
    const command = new Command()
    command.setValue('123456')
    expect(command.value).toBe('123456')
  })
  it('should escape new lines when value is set', () => {
    const command = new Command()
    command.setValue('Hello\nWorld!')
    expect(command.value).toBe('Hello\\nWorld!')
  })
  it('should initialize the primitives with empty strings', () => {
    const command = new Command()
    expect(command.comment).toBe('')
    expect(command.command).toBe('')
    expect(command.target).toBe('')
    expect(command.value).toBe('')
  })
  it('should have a breakpoint', () => {
    const command = new Command()
    expect(command.isBreakpoint).toBeFalsy()
    command.toggleBreakpoint()
    expect(command.isBreakpoint).toBeTruthy()
  })
  it('should be enabled by default', () => {
    const command = new Command(undefined, 'open')
    expect(command.enabled).toBeTruthy()
  })
  it('should toggle command between enabled and disabled', () => {
    const command = new Command(undefined, 'open')
    expect(command.enabled).toBeTruthy()
    command.toggleEnabled()
    expect(command.enabled).toBeFalsy()
  })
  it("should prefix command with '//' when disabled", () => {
    const command = new Command(undefined, 'open')
    command.toggleEnabled()
    expect(command.command).toBe('//open')
  })
  it('should have a displayable command name', () => {
    const command = new Command(undefined, 'open')
    expect(command.displayedName).toBe('open')
  })
  it("displayable command name should ignore command '//'", () => {
    const command = new Command(undefined, '//open')
    expect(command.displayedName).toBe('open')
  })
  it('shouls clone itself, creating a new id', () => {
    const command = new Command()
    command.setComment('test')
    command.setCommand('open')
    command.setTarget('a')
    command.setTargets([['button', 'xpath']])
    command.setValue('submit')
    command.toggleBreakpoint()
    const clone = command.clone()
    expect(clone).not.toBe(command)
    expect(clone.id).not.toBe(command.id)
    expect(clone.comment).toBe(command.comment)
    expect(clone.command).toBe(command.command)
    expect(clone.target).toBe(command.target)
    expect(clone.targets).toEqual(command.targets)
    expect(clone.value).toBe(command.value)
    expect(clone.isBreakpoint).toBeFalsy()
  })

  it('should load from JS', () => {
    const jsRepresentation = {
      id: '1',
      comment: 'test',
      command: 'open',
      target: '/',
      targets: [['button', 'xpath']],
      value: 'test',
    }
    const command = Command.fromJS(jsRepresentation)
    expect(command.id).toBe(jsRepresentation.id)
    expect(command.comment).toBe(jsRepresentation.comment)
    expect(command.command).toBe(jsRepresentation.command)
    expect(command.target).toBe(jsRepresentation.target)
    expect(command.targets[0][0]).toBe('button')
    expect(command.targets[0][1]).toBe('xpath')
    expect(command.value).toBe(jsRepresentation.value)
    expect(command.isBreakpoint).toBeFalsy()
    expect(command instanceof Command).toBeTruthy()
  })
})

describe('Commands enum', () => {
  it('should contains only strings as values', () => {
    Commands.list.forEach(commandInfo => {
      expect(commandInfo.name.constructor.name).toBe('String')
    })
  })
  it('should traverse through the reverse dictionary', () => {
    Commands.list.forEach(commandInfo => {
      expect(commandInfo.name).toBe(
        Commands.list.get(Commands.values[commandInfo.name]).name
      )
    })
    expect(Commands.list[0]).toBe(Commands[Commands.values[Commands[0]]])
  })
  it('should add a command to the list', () => {
    let key = 'test',
      value = { name: 'a friendly test' },
      length = Commands.array.length
    Commands.addCommand(key, value)
    expect(Commands.list.get(key)).toEqual(value)
    expect(Commands.array.length).toBe(length + 1)
  })
  it('should throw if trying to add a command that already exists', () => {
    let key = 'dontDoThisTwice',
      value = 'this shouldnt happen'
    Commands.addCommand(key, value)
    expect(() => {
      Commands.addCommand(key, value)
    }).toThrowError(`Command with the id ${key} already exists`)
  })
})
