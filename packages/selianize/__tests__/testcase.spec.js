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

import TestCaseEmitter from '../src/testcase'
import CommandEmitter from '../src/command'

describe('test case code emitter', () => {
  it('should emit an empty test case', () => {
    const test = {
      id: '1',
      name: 'example test case',
      commands: [],
    }
    return expect(TestCaseEmitter.emit(test)).resolves.toEqual({
      id: '1',
      name: 'example test case',
      test: `it("${
        test.name
      }", async () => {await tests["example test case"](driver, vars);await driver.getTitle().then(title => {expect(title).toBeDefined();});});`,
      function: 'tests["example test case"] = async (driver, vars, opts) => {}',
    })
  })
  it('should emit a test with a single command', () => {
    const test = {
      id: '1',
      name: 'example test case',
      commands: [
        {
          command: 'open',
          target: '/',
          value: '',
        },
      ],
    }
    return expect(TestCaseEmitter.emit(test)).resolves.toEqual({
      id: '1',
      name: 'example test case',
      test: `it("${
        test.name
      }", async () => {await tests["example test case"](driver, vars);await driver.getTitle().then(title => {expect(title).toBeDefined();});});`,
      function: `tests["example test case"] = async (driver, vars, opts) => {await driver.get((new URL("${
        test.commands[0].target
      }", BASE_URL)).href);}`,
    })
  })
  it('should emit a test with multiple commands', () => {
    const test = {
      id: '1',
      name: 'example test case',
      commands: [
        {
          command: 'open',
          target: '/',
          value: '',
        },
        {
          command: 'open',
          target: '/test',
          value: '',
        },
        {
          command: 'open',
          target: '/example',
          value: '',
        },
      ],
    }
    return expect(TestCaseEmitter.emit(test)).resolves.toEqual({
      id: '1',
      name: 'example test case',
      test: `it("${
        test.name
      }", async () => {await tests["example test case"](driver, vars);await driver.getTitle().then(title => {expect(title).toBeDefined();});});`,
      function: `tests["example test case"] = async (driver, vars, opts) => {await driver.get((new URL("${
        test.commands[0].target
      }", BASE_URL)).href);await driver.get((new URL("${
        test.commands[1].target
      }", BASE_URL)).href);await driver.get((new URL("${
        test.commands[2].target
      }", BASE_URL)).href);}`,
    })
  })
  it('should reject a test with failed commands', () => {
    const test = {
      id: '1',
      name: 'failed test',
      commands: [
        {
          command: 'doesntExist',
          target: '',
          value: '',
        },
        {
          command: 'open',
          target: '/test',
          value: '',
        },
        {
          command: 'notThisOne',
          target: '',
          value: '',
        },
      ],
    }
    const testErrors = {
      commands: [
        {
          command: 'doesntExist',
          index: 1,
          message: new Error('Unknown command doesntExist'),
          target: '',
          value: '',
        },
        {
          command: 'notThisOne',
          index: 3,
          message: new Error('Unknown command notThisOne'),
          target: '',
          value: '',
        },
      ],
      id: '1',
      name: 'failed test',
    }
    return expect(TestCaseEmitter.emit(test)).rejects.toMatchObject(testErrors)
  })
  it('should hardcode errors on silenceErrors option', () => {
    const test = {
      id: '1',
      name: 'silence',
      commands: [
        {
          command: 'doesntExist',
          target: '',
          value: '',
        },
      ],
    }
    return expect(
      TestCaseEmitter.emit(test, { silenceErrors: true })
    ).resolves.toEqual({
      id: '1',
      name: 'silence',
      test:
        'it("silence", async () => {await tests["silence"](driver, vars);await driver.getTitle().then(title => {expect(title).toBeDefined();});});',
      function:
        'tests["silence"] = async (driver, vars, opts) => {throw new Error("Unknown command doesntExist");}',
    })
  })
  it('should emit an empty snapshot for an empty test case when skipStdLibEmitting is set', () => {
    const test = {
      id: '1',
      name: 'example test case',
      commands: [],
    }
    expect(
      TestCaseEmitter.emit(test, { skipStdLibEmitting: true })
    ).resolves.toEqual({})
  })
  it('should emit an empty snapshot for a test case when skipStdLibEmitting is set', () => {
    const test = {
      id: '1',
      name: 'example test case',
      commands: [
        {
          command: 'open',
          target: '',
          value: '',
        },
      ],
    }
    expect(
      TestCaseEmitter.emit(test, { skipStdLibEmitting: true })
    ).resolves.toEqual({})
  })
  it('should emit a snapshot for a test case with an additional command emitter when skipStdLibEmitting is set', () => {
    const test = {
      id: '1',
      name: 'example test case',
      commands: [
        {
          id: '2',
          command: 'aNewCommand',
          target: '',
          value: '',
        },
      ],
    }
    CommandEmitter.registerEmitter('aNewCommand', () => 'command code')
    expect(
      TestCaseEmitter.emit(test, { skipStdLibEmitting: true })
    ).resolves.toEqual({
      id: '1',
      snapshot: {
        commands: {
          '2': 'command code',
        },
        setupHooks: [],
        teardownHooks: [],
      },
    })
  })
  it('should send the snapshot to the command', () => {
    const test = {
      id: '1',
      name: 'example test case',
      commands: [
        {
          id: '2',
          command: 'anUnknownCommand',
          target: '',
          value: '',
        },
      ],
    }
    const snapshot = {
      commands: {
        '2': 'command code',
      },
      setupHooks: [],
      teardownHooks: [],
    }
    expect(TestCaseEmitter.emit(test, undefined, snapshot)).resolves.toEqual({
      id: '1',
      name: 'example test case',
      test:
        'it("example test case", async () => {await tests["example test case"](driver, vars);await driver.getTitle().then(title => {expect(title).toBeDefined();});});',
      function:
        'tests["example test case"] = async (driver, vars, opts) => {command code}',
    })
  })
  it('should emit a snapshot for a test case with setup and teardown hooks when skipStdLibEmitting is set', () => {
    const test = {
      id: '1',
      name: 'example test case',
      commands: [],
    }
    TestCaseEmitter.registerHook(() => ({
      setup: 'setup code',
      teardown: 'teardown code',
    }))
    expect(
      TestCaseEmitter.emit(test, { skipStdLibEmitting: true })
    ).resolves.toEqual({
      id: '1',
      snapshot: {
        commands: {},
        setupHooks: ['setup code'],
        teardownHooks: ['teardown code'],
      },
    })
  })
  it('should filter out empty hooks', () => {
    const test = {
      id: '1',
      name: 'example test case',
      commands: [],
    }
    TestCaseEmitter.registerHook(() => ({
      setup: '',
      teardown: '',
    }))
    expect(
      TestCaseEmitter.emit(test, { skipStdLibEmitting: true })
    ).resolves.toEqual({
      id: '1',
      snapshot: {
        commands: {},
        setupHooks: ['setup code'],
        teardownHooks: ['teardown code'],
      },
    })
  })
  it('should append the snapshot of the setup and teardown hooks to the test case', () => {
    const test = {
      id: '1',
      name: 'example test case',
      commands: [],
    }
    const snapshot = {
      commands: {},
      setupHooks: ['more setup'],
      teardownHooks: ['more teardown'],
    }
    expect(TestCaseEmitter.emit(test, undefined, snapshot)).resolves.toEqual({
      id: '1',
      name: 'example test case',
      test:
        'it("example test case", async () => {setup codemore setupawait tests["example test case"](driver, vars);await driver.getTitle().then(title => {expect(title).toBeDefined();});teardown codemore teardown});',
      function: 'tests["example test case"] = async (driver, vars, opts) => {}',
    })
  })
})
