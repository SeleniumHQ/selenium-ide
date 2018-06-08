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

import browser from "webextension-polyfill";
import { action, observable } from "mobx";
import { setStoredVar, deleteStoredVar  } from "../../IO/SideeX/formatCommand";

export class Variables {
  @observable storedVars = new Map();

  constructor() {
    browser.runtime.onMessage.addListener((this.handleFormatCommand));
  }

  @action.bound handleFormatCommand(message) {
    if (message.storeStr) {
      this.addVariable(message.storeVar, message.storeStr)
    }
  }

  @action.bound addVariable(key, value) {
    this.storedVars.set(key, value);
    setStoredVar(key, value);
  }

  @action.bound deleteVariable(key) {
    this.storedVars.delete(key);
    deleteStoredVar(key);
  }

  @action.bound clearVariables() {
    this.storedVars.clear();
  }
}

export default new Variables;
