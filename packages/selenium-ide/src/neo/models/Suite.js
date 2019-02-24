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

import { action, observable, computed, reaction } from 'mobx'
import uuidv4 from 'uuid/v4'
import naturalCompare from 'string-natural-compare'
import TestCase from './TestCase'

export const DEFAULT_TIMEOUT = 300

export default class Suite {
  id = null
  @observable
  name = null
  @observable
  timeout = DEFAULT_TIMEOUT
  @observable
  isParallel = false
  @observable
  persistSession = false
  @observable
  _tests = []
  @observable
  modified = false
  @observable
  isOpen = false

  constructor(id = uuidv4(), name = 'Untitled Suite') {
    this.id = id
    this.name = name
    this.changeTestsDisposer = reaction(
      () => this._tests.length,
      () => {
        this.modified = true
      }
    )
    this.containsTest = this.containsTest.bind(this)
    this.export = this.export.bind(this)
  }

  @computed
  get tests() {
    return this.isParallel
      ? this._tests.slice().sort((t1, t2) => naturalCompare(t1.name, t2.name))
      : this._tests
  }

  isTest(test) {
    return test && test instanceof TestCase
  }

  @action.bound
  setName(name) {
    this.name = name
    this.modified = true
  }

  @action.bound
  setTimeout(timeout = DEFAULT_TIMEOUT) {
    if (timeout !== undefined && timeout.constructor.name !== 'Number') {
      throw new Error(
        `Expected to receive Number instead received ${
          timeout !== undefined ? timeout.constructor.name : timeout
        }`
      )
    } else {
      this.timeout = timeout
    }
  }

  @action.bound
  setParallel(parallel) {
    this.isParallel = !!parallel
    if (this.isParallel) {
      // setting directly because setPersistSession is locked
      this.persistSession = false
    }
  }

  @action.bound
  setPersistSession(persistSession) {
    if (!this.isParallel) {
      this.persistSession = persistSession
    }
  }

  @action.bound
  setOpen(isOpen) {
    this.isOpen = isOpen
  }

  containsTest(test) {
    // WARNING: do not turn this into a bound action, the observables it will set will cause react-dnd to fail!
    return this._tests.includes(test)
  }

  @action.bound
  addTestCase(test) {
    if (!this.isTest(test)) {
      throw new Error(
        `Expected to receive TestCase instead received ${
          test ? test.constructor.name : test
        }`
      )
    } else {
      this._tests.push(test)
    }
  }

  @action.bound
  insertTestCaseAt(test, index) {
    if (!this.isTest(test)) {
      throw new Error(
        `Expected to receive TestCase instead received ${
          test ? test.constructor.name : test
        }`
      )
    } else {
      this._tests.splice(index, 0, test)
    }
  }

  @action.bound
  removeTestCase(test) {
    if (!this.isTest(test)) {
      throw new Error(
        `Expected to receive TestCase instead received ${
          test ? test.constructor.name : test
        }`
      )
    } else {
      this._tests.remove(test)
    }
  }

  @action.bound
  swapTestCases(from, to) {
    const test = this._tests.splice(from, 1)[0]
    this.insertTestCaseAt(test, to)
  }

  @action.bound
  replaceTestCases(tests) {
    if (tests.filter(test => !this.isTest(test)).length) {
      throw new Error('Expected to receive array of TestCase')
    } else {
      this._tests.replace(tests)
    }
  }

  export() {
    return {
      id: this.id,
      name: this.name,
      persistSession: this.persistSession,
      parallel: this.isParallel,
      timeout: this.timeout,
      tests: this._tests.map(t => t.id),
    }
  }

  @action
  static fromJS = function(jsRep, projectTests) {
    const suite = new Suite(jsRep.id)
    suite.setName(jsRep.name)
    suite.setTimeout(jsRep.timeout)
    suite.setParallel(jsRep.parallel)
    suite.setPersistSession(jsRep.persistSession)
    suite._tests.replace(
      jsRep.tests.map(testId => projectTests.find(({ id }) => id === testId))
    )

    return suite
  }
}
