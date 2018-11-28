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
import SuiteEmitter from '../src/suite'

describe('suite emitter', () => {
  it('should emit an empty suite', () => {
    const suite = {
      id: '1',
      name: 'example suite',
      timeout: '30',
      tests: [],
    }
    return expect(SuiteEmitter.emit(suite, {})).resolves.toEqual({
      code: `jest.setTimeout(30000);describe("${suite.name}", () => {});`,
    })
  })
  it('should emit a suite with a single empty test', async () => {
    const tests = {
      '1': {
        id: '1',
        name: 'example test case',
        commands: [],
      },
    }
    const suite = {
      id: '1',
      name: 'example suite',
      timeout: '30',
      tests: ['1'],
    }
    return expect(
      SuiteEmitter.emit(suite, {
        1: {
          emitted: await TestCaseEmitter.emit(tests['1']),
        },
      })
    ).resolves.toEqual({
      code: `jest.setTimeout(30000);describe("${suite.name}", () => {it("${
        tests['1'].name
      }", async () => {await tests["example test case"](driver, vars);expect(true).toBeTruthy();});});`,
    })
  })
  it('should emit a suite with multiple empty tests', async () => {
    const tests = {
      '1': {
        id: '1',
        name: 'example test case',
        commands: [],
      },
      '2': {
        id: '2',
        name: 'second test case',
        commands: [],
      },
      '3': {
        id: '3',
        name: 'third test case',
        commands: [],
      },
    }
    const suite = {
      id: '1',
      name: 'example suite',
      timeout: '30',
      tests: ['1', '2', '3'],
    }
    return expect(
      SuiteEmitter.emit(suite, {
        1: {
          emitted: await TestCaseEmitter.emit(tests['1']),
        },
        2: {
          emitted: await TestCaseEmitter.emit(tests['2']),
        },
        3: {
          emitted: await TestCaseEmitter.emit(tests['3']),
        },
      })
    ).resolves.toEqual({
      code: `jest.setTimeout(30000);describe("${suite.name}", () => {it("${
        tests['1'].name
      }", async () => {await tests["example test case"](driver, vars);expect(true).toBeTruthy();});it("${
        tests['2'].name
      }", async () => {await tests["second test case"](driver, vars);expect(true).toBeTruthy();});it("${
        tests['3'].name
      }", async () => {await tests["third test case"](driver, vars);expect(true).toBeTruthy();});});`,
    })
  })
  it('should emit a parallel suite', async () => {
    const tests = {
      '1': {
        id: '1',
        name: 'example test case',
        commands: [],
      },
      '2': {
        id: '2',
        name: 'second test case',
        commands: [],
      },
      '3': {
        id: '3',
        name: 'third test case',
        commands: [],
      },
    }
    const suite = {
      id: '1',
      name: 'example suite',
      timeout: '30',
      parallel: true,
      tests: ['1', '2', '3'],
    }
    return expect(
      SuiteEmitter.emit(suite, {
        1: {
          emitted: await TestCaseEmitter.emit(tests['1']),
        },
        2: {
          emitted: await TestCaseEmitter.emit(tests['2']),
        },
        3: {
          emitted: await TestCaseEmitter.emit(tests['3']),
        },
      })
    ).resolves.toEqual([
      {
        name: tests['1'].name,
        code: `jest.setTimeout(30000);test("${
          tests['1'].name
        }", async () => {await tests["example test case"](driver, vars);expect(true).toBeTruthy();});`,
      },
      {
        name: tests['2'].name,
        code: `jest.setTimeout(30000);test("${
          tests['2'].name
        }", async () => {await tests["second test case"](driver, vars);expect(true).toBeTruthy();});`,
      },
      {
        name: tests['3'].name,
        code: `jest.setTimeout(30000);test("${
          tests['3'].name
        }", async () => {await tests["third test case"](driver, vars);expect(true).toBeTruthy();});`,
      },
    ])
  })
  it('should skip emitting when skipStdLibEmitting is set and no hooks are registered', () => {
    const suite = {
      id: '1',
      name: 'example suite',
      timeout: '30',
      tests: [],
    }
    return expect(
      SuiteEmitter.emit(suite, {}, { skipStdLibEmitting: true })
    ).resolves.toEqual({ skipped: true })
  })
  it('should emit a snapshot of the hooks when skipStdLibEmitting is set and hooks are registered', () => {
    const suite = {
      id: '1',
      name: 'example suite',
      timeout: '30',
      tests: [],
    }
    SuiteEmitter.registerHook(() => ({
      beforeAll: 'beforeAll code',
      before: 'before code',
      after: 'after code',
      afterAll: 'afterAll code',
    }))
    return expect(
      SuiteEmitter.emit(suite, {}, { skipStdLibEmitting: true })
    ).resolves.toEqual({
      snapshot: {
        hook:
          'beforeAll(async () => {beforeAll code});beforeEach(async () => {before code});afterEach(async () => {after code});afterAll(async () => {afterAll code});',
      },
    })
  })
  it('should append the snapshot to the normal hooks', () => {
    const suite = {
      id: '1',
      name: 'example suite',
      timeout: '30',
      tests: [],
    }
    const snapshot = {
      hook: 'hook results',
    }
    return expect(
      SuiteEmitter.emit(suite, {}, undefined, snapshot)
    ).resolves.toEqual({
      code:
        'jest.setTimeout(30000);describe("example suite", () => {beforeAll(async () => {beforeAll code});beforeEach(async () => {before code});afterEach(async () => {after code});afterAll(async () => {afterAll code});hook results});',
    })
  })
})
