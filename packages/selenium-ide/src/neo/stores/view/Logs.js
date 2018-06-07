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
import Log, { LogTypes } from "../../ui-models/Log";

export class LogStore {
  @observable logs = [];

  constructor() {
    // TODO: think of an API for logging
    window.addLog = (message) => {
      this.log(new Log(message));
    };
  }

  @action.bound log(log) {
    if (typeof log === "string") {
      log = new Log(log);
    }
    this.logs.push(log);

    return log;
  }

  @action.bound error(log) {
    const errorLog = this.log(log);
    errorLog.setStatus(LogTypes.Error);
  }

  @action.bound clearLogs() {
    this.logs.clear();
  }
}

export default new LogStore;
