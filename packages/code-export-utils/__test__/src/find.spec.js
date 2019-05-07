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

import { findReusedTestMethods } from '../../src/find'
import TestCase from '../../../selenium-ide/src/neo/models/TestCase'

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
