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

import { action, observable, computed } from "mobx";
import uuidv4 from "uuid/v4";
import SortBy from "sort-array";

export default class Suite {
  id = null;
  @observable name = null;
  @observable _tests = [];

  constructor(id = uuidv4(), name = "Untitled Suite") {
    this.id = id;
    this.name = name;
    this.exportSuite = this.exportSuite.bind(this);
  }

  @computed get tests() {
    return SortBy(this._tests, "name");
  }

  isTest(test) {
    return (test && test.constructor.name === "TestCase");
  }

  @action.bound setName(name) {
    this.name = name;
  }

  @action.bound addTestCase(test) {
    if (!this.isTest(test)) {
      throw new Error(`Expected to receive TestCase instead received ${test ? test.constructor.name : test}`);
    } else {
      this._tests.push(test);
    }
  }

  @action.bound removeTestCase(test) {
    if (!this.isTest(test)) {
      throw new Error(`Expected to receive TestCase instead received ${test ? test.constructor.name : test}`);
    } else {
      this._tests.remove(test);
    }
  }

  @action.bound replaceTestCases(tests) {
    if (tests.filter(test => !this.isTest(test)).length) {
      throw new Error("Expected to receive array of TestCase");
    } else {
      this._tests.replace(tests);
    }
  }

  exportSuite() {
    return {
      id: this.id,
      name: this.name,
      tests: this._tests.map(t => t.id)
    };
  }

  @action
  static fromJS = function(jsRep, projectTests) {
    const suite = new Suite(jsRep.id);
    suite.setName(jsRep.name);
    suite._tests.replace(jsRep.tests.map((testId) => projectTests.find(({id}) => id === testId)));

    return suite;
  }
}
