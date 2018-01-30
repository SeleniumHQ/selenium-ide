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

import { observe } from "mobx";
import Log, { LogTypes } from "../ui-models/Log";
import logger from "../stores/view/Logs";
import PlaybackState, { PlaybackStates } from "../stores/view/PlaybackState";

export default class PlaybackLogger {
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

  parseCommandStateChange(commandId, status, cb) {
    const command = PlaybackState.currentRunningTest.commands.find(({id}) => (id === commandId));
    cb(command, status);
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
      log = new Log(`'${PlaybackState.currentRunningTest.name}' completed ${PlaybackState.hasFailed ? `with ${PlaybackState.errors} error(s)` : "successfully"}`,
        PlaybackState.hasFailed ? LogTypes.Error : LogTypes.Success);
      log.setNotice();
    }
    logger.log(log);
  }

  logCommandState(command, status) {
    if (status && this.shouldLogCommand(command.command)) {
      const index = PlaybackState.currentRunningTest.commands.indexOf(command) + 1;
      let log;
      if (logger.logs.length && logger.logs[logger.logs.length - 1].commandId === command.id) {
        log = logger.logs[logger.logs.length - 1];
      } else {
        log = new Log();
        log.setIndex(index);
        log.setCommandId(command.id);
      }
      switch(status.state) {
        case PlaybackStates.Pending:
          log.setMessage(status.message ? status.message : `Trying to execute ${command.command} on ${command.target}${command.value ? " with value " + command.value : ""}...`);
          break;
        case PlaybackStates.Undetermined:
          log.setStatus(LogTypes.Undetermined);
          break;
        case PlaybackStates.Failed:
        case PlaybackStates.Fatal: // eslint-disable-line no-fallthrough
          log.setStatus(LogTypes.Error);
          break;
        case PlaybackStates.Passed:
          log.setStatus(LogTypes.Success);
          break;
      }
      log.setDescription(status.message);
      logger.log(log);
    }
  }

  shouldLogCommand(command) {
    return command !== "echo";
  }

  dispose() {
    this.playbackDisposer();
    this.commandStateDisposer();
  }
}
