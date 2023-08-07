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
  findReusedTestMethods,
  findCommandThatOpensWindow,
} from '../../../src/code-export/find'
import TestCase from '../../../../selenium-ide/src/neo/models/TestCase'
import Command from '../../../../selenium-ide/src/neo/models/Command'

describe('find', () => {
  describe('findCommandThatOpensWindow', () => {
    it('should find a command that opens a window if present in a test', () => {
      const test = new TestCase(undefined, 'blah')
      test.createCommand(undefined, 'open', '/')
      const command = new Command(undefined, 'click', 'id=blah')
      command.opensWindow = true
      test.addCommand(command)
      const result = findCommandThatOpensWindow(test)
      expect(result.command).toEqual('click')
    })
    it('should not find a command that opens a window if one is not present in a test', () => {
      const test = new TestCase(undefined, 'blah')
      test.createCommand(undefined, 'open', '/')
      const command = new Command(undefined, 'click', 'id=blah')
      test.addCommand(command)
      const result = findCommandThatOpensWindow(test)
      expect(result).toBeUndefined()
    })
    it('should find a command within a reused test method', () => {
      const test = new TestCase()
      test.createCommand(undefined, 'run', 'blah')
      const anotherTest = new TestCase(undefined, 'blah')
      const command = new Command(undefined, 'click', 'id=blah')
      command.opensWindow = true
      anotherTest.addCommand(command)
      const tests = [test, anotherTest]
      const result = findCommandThatOpensWindow(test, tests)
      expect(result).toBeTruthy()
    })
  })
  describe('findReusedTestMethods', () => {
    it('should find a reused test method', () => {
      const test = new TestCase()
      test.createCommand(undefined, 'run', 'blah')
      const anotherTest = new TestCase(undefined, 'blah')
      anotherTest.createCommand(undefined, 'open', '/')
      const tests = [anotherTest]
      const result = findReusedTestMethods(test, tests)
      expect(result.length).toEqual(1)
      expect(result[0].name).toEqual('blah')
      expect(result[0].commands[0].command).toEqual('open')
      expect(result[0].commands[0].target).toEqual('/')
    })
    it('should find reused test methods recursively', () => {
      const test = new TestCase()
      test.createCommand(undefined, 'run', 'blah')
      const anotherTest = new TestCase(undefined, 'blah')
      anotherTest.createCommand(undefined, 'run', 'blahblah')
      const yetAnotherTest = new TestCase(undefined, 'blahblah')
      const tests = [anotherTest, yetAnotherTest]
      const result = findReusedTestMethods(test, tests)
      expect(result.length).toEqual(2)
    })
  })
})
