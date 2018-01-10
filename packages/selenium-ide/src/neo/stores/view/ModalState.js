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

import { action, observable } from "mobx";
import UiState from "./UiState";

class ModalState {
  @observable editedSuite = null;
  @observable renameState = {};

  constructor() {
    this.renameTest = this.rename.bind(this, Types.test);
    this.renameSuite = this.rename.bind(this, Types.suite);
    this.rename = this.rename.bind(this);
  }

  @action rename(type, value, cb) {
    const verifyName = (name) => {
      let names;
      if (type === Types.test) names = UiState._project.tests;
      else if (type === Types.suite) names = UiState._project.suites;

      return name === value || this.nameIsUnique(name, names);
    };
    this.renameState = {
      value,
      type,
      verify: verifyName,
      done: (name) => {
        if (verifyName(name)) {
          cb(name);
          this.cancelRenaming();
        }
      }
    };
  }

  @action.bound editSuite(suite) {
    this.editedSuite = suite;
  }

  @action.bound cancelRenaming() {
    this.renameState = {};
  }

  @action.bound createSuite() {
    this.rename(Types.suite, null, (name) => {
      if (name) this._project.createSuite(name);
    });
  }

  @action.bound createTest() {
    this.rename(Types.test, null, (name) => {
      if (name) {
        const test = this._project.createTestCase(name);
        UiState.selectTest(test);
      }
    });
  }

  @action.bound deleteSuite(suite) {
    this.showAlert({
      title: "Delete suite",
      description: `This will permanently delete '${suite.name}'`,
      cancelLabel: "cancel",
      confirmLabel: "delete"
    }, (choseDelete) => {
      if (choseDelete) {
        this._project.deleteSuite(suite);
      }
    });
  }

  @action.bound deleteTest(testCase) {
    this.showAlert({
      title: "Delete test case",
      description: `This will permanently delete '${testCase.name}', and remove it from all it's suites`,
      cancelLabel: "cancel",
      confirmLabel: "delete"
    }, (choseDelete) => {
      if (choseDelete) {
        this._project.deleteTestCase(testCase);
      }
    });
  }

  nameIsUnique(value, list) {
    return !list.find(({ name }) => name === value);
  }
}

const Types = {
  test: "test case",
  suite: "suite"
};

if (!window._modalState) window._modalState = new ModalState();

export default window._modalState;
