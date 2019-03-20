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

import { configure } from 'mobx'
import ProjectStore from '../../stores/domain/ProjectStore'
import Suite from '../../models/Suite'
import TestCase from '../../models/TestCase'

configure({
  enforceActions: 'observed',
})

describe('Suite model', () => {
  it("new suite should be named 'Utitled Suite'", () => {
    expect(new Suite().name).toBe('Untitled Suite')
  })
  it('Suites should have randomly generated identifiers', () => {
    expect(new Suite().id).not.toBe(new Suite().id)
  })
  it('should rename the suite', () => {
    const suite = new Suite()
    suite.setName('test')
    expect(suite.name).toBe('test')
  })
  it('should have a timeout', () => {
    const suite = new Suite()
    expect(suite.timeout).toBe(300)
  })
  it('should fail to set the timeout to something other than number', () => {
    const suite = new Suite()
    expect(() => {
      suite.setTimeout('not a number')
    }).toThrowError('Expected to receive Number instead received String')
  })
  it('should set the timeout to the default given undefined', () => {
    const suite = new Suite()
    suite.setTimeout()
    expect(suite.timeout).toBe(300)
  })
  it('should set the timeout', () => {
    const suite = new Suite()
    suite.setTimeout(400)
    expect(suite.timeout).toBe(400)
  })
  it('should initiate as a sequential suite', () => {
    const suite = new Suite()
    expect(suite.isParallel).toBeFalsy()
    expect(suite.persistSession).toBeFalsy()
  })
  it('should set the suite to parallel', () => {
    const suite = new Suite()
    suite.setParallel(true)
    expect(suite.isParallel).toBeTruthy()
  })
  it('should set the suite to unsafe', () => {
    const suite = new Suite()
    suite.setPersistSession(true)
    expect(suite.persistSession).toBeTruthy()
  })
  it('should not be able to set a parallel suite unsafe', () => {
    const suite = new Suite()
    suite.setParallel(true)
    suite.setPersistSession(true)
    expect(suite.persistSession).toBeFalsy()
  })
  it('should make a suite safe if it was made parallel', () => {
    const suite = new Suite()
    suite.setPersistSession(true)
    expect(suite.persistSession).toBeTruthy()
    suite.setParallel(true)
    expect(suite.isParallel).toBeTruthy()
    expect(suite.persistSession).toBeFalsy()
  })
  it('should add a new Test Case', () => {
    const store = new ProjectStore()
    const suite = new Suite()
    const test = new TestCase()
    store.addTestCase(test)
    expect(suite.tests.length).toBe(0)
    suite.addTestCase(test)
    expect(suite.tests.length).toBe(1)
  })
  it('should throw if no Test Case was given', () => {
    const suite = new Suite()
    expect(() => suite.addTestCase()).toThrowError(
      'Expected to receive TestCase instead received undefined'
    )
  })
  it('should throw if a different type was given', () => {
    const suite = new Suite()
    expect(() => suite.addTestCase(1)).toThrowError(
      'Expected to receive TestCase instead received Number'
    )
  })
  it('should remove a Test Case from the suite', () => {
    const store = new ProjectStore()
    const suite = new Suite()
    const test = new TestCase()
    store.addTestCase(test)
    suite.addTestCase(test)
    expect(suite.tests.length).toBe(1)
    suite.removeTestCase(test)
    expect(suite.tests.length).toBe(0)
  })
  it('should do nothing if removed a non-existent test', () => {
    const store = new ProjectStore()
    const suite = new Suite()
    const test = new TestCase()
    store.addTestCase(test)
    suite.addTestCase(test)
    expect(suite.tests.length).toBe(1)
    suite.removeTestCase(new TestCase())
    expect(suite.tests.length).toBe(1)
  })
  it('shoul tell if a test exist in the suite', () => {
    const suite = new Suite()
    const exists = new TestCase()
    const nonExistent = new TestCase()
    suite.addTestCase(exists)
    expect(suite.containsTest(exists)).toBeTruthy()
    expect(suite.containsTest(nonExistent)).toBeFalsy()
  })
  it('should swap the test cases', () => {
    const suite = new Suite()
    const test1 = new TestCase()
    const test2 = new TestCase()
    suite.addTestCase(test1)
    suite.addTestCase(test2)
    expect(suite.tests[0]).toBe(test1)
    expect(suite.tests[1]).toBe(test2)
    suite.swapTestCases(0, 1)
    expect(suite.tests[1]).toBe(test1)
    expect(suite.tests[0]).toBe(test2)
  })
  it('should replace the tests in the suite', () => {
    const store = new ProjectStore()
    const suite = new Suite()
    store.createTestCase()
    store.createTestCase()
    store.createTestCase()
    expect(suite.tests.length).toBe(0)
    suite.replaceTestCases(store.tests)
    expect(suite.tests.length).toBe(3)
  })
  it('should load from JS', () => {
    const jsRep = {
      id: '1',
      name: 'test suite',
      tests: [],
    }
    const suite = Suite.fromJS(jsRep)
    expect(suite.id).toBe(jsRep.id)
    expect(suite.name).toBe(jsRep.name)
    expect(suite instanceof Suite).toBeTruthy()
  })
  it('should load tests from JS', () => {
    const store = new ProjectStore()
    store.addTestCase(new TestCase('1'))
    store.addTestCase(new TestCase('2'))
    store.addTestCase(new TestCase('3'))
    const jsRep = {
      id: '1',
      name: 'test suite',
      tests: ['2', '3'],
    }
    const suite = Suite.fromJS(jsRep, store.tests)
    expect(suite.tests.length).toBe(2)
    expect(suite.tests[0]).toBeInstanceOf(TestCase)
  })
})
