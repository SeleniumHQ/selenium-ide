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

import { action, observe, observable } from "mobx";
import Log, { LogTypes } from "../../ui-models/Log";
import PlaybackState, { PlaybackStates } from "./PlaybackState";

export default class LogStore {
  @observable logs = [];

  constructor() {
    this.playbackDisposer = observe(PlaybackState, "isPlaying", (isPlaying) => {
      this.logPlayingState(isPlaying.newValue);
    });
    this.commandStateDisposer = observe(PlaybackState.commandState, (change) => {
      this.parseCommandStateChange(change.name, change.newValue, this.logCommandState);
    });
    this.logPlayingState = this.logPlayingState.bind(this);
    this.parseCommandStateChange = this.parseCommandStateChange.bind(this);
    this.logCommandState = this.logCommandState.bind(this);
    this.dispose = this.dispose.bind(this);
  }

  @action.bound addLog(log) {
    if (!this.logs.length || this.logs[this.logs.length - 1].message !== log.message) {
      this.logs.push(log);
    }
  }

  parseCommandStateChange(commandId, status, cb) {
    const command = PlaybackState.currentRunningTest.commands.find(({id}) => (id === commandId));
    cb(command, status);
  }

  @action.bound clearLogs() {
    this.logs.clear();
  }

  logPlayingState(isPlaying) {
    let log;
    if (isPlaying) {
      log = new Log(`Running '${PlaybackState.currentRunningTest.name}'`);
      log.setNotice();
    } else if (PlaybackState.aborted) {
      log = new Log(`'${PlaybackState.currentRunningTest.name}' was aborted`, LogTypes.Error);
      log.setNotice();
    } else {
      log = new Log(`'${PlaybackState.currentRunningTest.name}' completed ${PlaybackState.hasFailed ? `with ${PlaybackState.failures} error(s)` : "successfully"}`, PlaybackState.hasFailed ? LogTypes.Error : LogTypes.Success);
      log.setNotice();
    }
    this.addLog(log);
  }

  logCommandState(command, status) {
    if (status) {
      const index = PlaybackState.currentRunningTest.commands.indexOf(command) + 1;
      let log;
      if (this.logs.length && this.logs[this.logs.length - 1].commandId === command.id) {
        log = this.logs[this.logs.length - 1];
      } else {
        log = new Log();
        log.setIndex(index);
        log.setCommandId(command.id);
      }
      switch(status.state) {
        case PlaybackStates.Pending:
          log.setMessage(status.message ? status.message : `Trying to execute ${command.command} on ${command.target}${command.value ? " with value " + command.value : ""}...`);
          break;
        case PlaybackStates.Failed:
          log.setError(status.message);
          log.setStatus(LogTypes.Error);
          break;
        case PlaybackStates.Passed:
          log.setStatus(LogTypes.Success);
          break;
      }
      this.addLog(log);
    }
  }

  dispose() {
    this.playbackDisposer();
    this.commandStateDisposer();
  }
}
