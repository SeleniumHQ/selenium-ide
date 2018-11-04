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

import { useStrict } from 'mobx'
import TestCase from '../../models/TestCase'
import Command from '../../models/Command'

useStrict(true)

describe('TestCase model', () => {
  it("new test should be named 'Untitled Test'", () => {
    expect(new TestCase().name).toBe('Untitled Test')
  })
  it('should change name', () => {
    const test = new TestCase()
    test.setName('test')
    expect(test.name).toBe('test')
  })
  it('Test Cases should have randomly generated identifiers', () => {
    expect(new TestCase().id).not.toBe(new TestCase().id)
  })
  it('Should have array of commands', () => {
    expect(new TestCase().commands).toBeDefined()
  })
  it('should add a command to the command list', () => {
    const test = new TestCase()
    const command = new Command()
    test.addCommand(command)
    expect(test.commands.length).toBe(1)
  })
  it('should throw if the given command is undefined', () => {
    const test = new TestCase()
    expect(() => test.addCommand()).toThrowError(
      'Expected to receive Command instead received undefined'
    )
  })
  it('should throw if the given command is different type', () => {
    const test = new TestCase()
    expect(() => test.addCommand(5)).toThrowError(
      'Expected to receive Command instead received Number'
    )
  })
  it('should create a command', () => {
    const test = new TestCase()
    expect(test.commands.length).toBe(0)
    test.createCommand()
    expect(test.commands.length).toBe(1)
  })
  it('should create a command with primitives intialized', () => {
    const test = new TestCase()
    const c = 'click at'
    const t = 'button'
    const v = '32, 21'
    const command = test.createCommand(undefined, c, t, v)
    expect(command.command).toBe(c)
    expect(command.target).toBe(t)
    expect(command.value).toBe(v)
    expect(command.id).toBeDefined()
  })
  it('should create a command at the desired index', () => {
    const test = new TestCase()
    test.createCommand()
    const control = test.commands[0]
    test.createCommand(0)
    expect(test.commands[0]).not.toBe(control)
    expect(test.commands[1]).toBe(control)
  })
  it('should throw if the given index is not a number', () => {
    const test = new TestCase()
    expect(() => test.createCommand('2')).toThrowError(
      'Expected to receive Number instead received String'
    )
  })
  it('should throw if the given command is undefined', () => {
    const test = new TestCase()
    expect(() => test.insertCommandAt()).toThrowError(
      'Expected to receive Command instead received undefined'
    )
  })
  it('should throw if the given command is different type', () => {
    const test = new TestCase()
    expect(() => test.insertCommandAt(5)).toThrowError(
      'Expected to receive Command instead received Number'
    )
  })
  it('should throw if the given index is undefined', () => {
    const test = new TestCase()
    const command = new Command()
    expect(() => test.insertCommandAt(command)).toThrowError(
      'Expected to receive Number instead received undefined'
    )
  })
  it('should throw if the given index is different type', () => {
    const test = new TestCase()
    const command = new Command()
    expect(() => test.insertCommandAt(command, '5')).toThrowError(
      'Expected to receive Number instead received String'
    )
  })
  it('should insert the command in the middle', () => {
    const test = new TestCase()
    test.createCommand()
    test.createCommand()
    const command = new Command()
    test.insertCommandAt(command, 1)
    expect(test.commands[1]).toBe(command)
  })
  it('should swap the commands', () => {
    const test = new TestCase()
    test.createCommand()
    test.createCommand()
    const command1 = test.commands[0]
    const command2 = test.commands[1]
    test.swapCommands(0, 1)
    expect(command1).toBe(test.commands[1])
    expect(command2).toBe(test.commands[0])
  })
  it('Should remove a command', () => {
    const test = new TestCase()
    const command = test.createCommand()
    expect(test.commands.length).toBe(1)
    test.removeCommand(command)
    expect(test.commands.length).toBe(0)
  })
  it('should remove all the commands', () => {
    const test = new TestCase()
    test.createCommand()
    test.createCommand()
    test.createCommand()
    expect(test.commands.length).toBe(3)
    test.clearAllCommands()
    expect(test.commands.length).toBe(0)
  })
  it('should load from JS', () => {
    const jsRep = {
      id: '1',
      name: 'test testcase',
      commands: [],
    }
    const test = TestCase.fromJS(jsRep)
    expect(test.id).toBe(jsRep.id)
    expect(test.name).toBe(jsRep.name)
    expect(test instanceof TestCase).toBeTruthy()
  })
  it('should load the array of commands from JS', () => {
    const jsRep = {
      id: '1',
      name: 'test testcase',
      commands: [
        {
          id: '1',
          command: 'open',
          target: '/',
          value: 'test',
        },
        {
          id: '2',
          command: 'open',
          target: '/',
          value: 'test',
        },
      ],
    }
    const test = TestCase.fromJS(jsRep)
    expect(test.commands.length).toBe(2)
    expect(test.commands[0] instanceof Command).toBeTruthy()
  })
})
