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
      log = new Log(`'${PlaybackState.currentRunningTest.name}' was aborted`, LogTypes.Failure);
      log.setNotice();
    } else {
      log = new Log(`'${PlaybackState.currentRunningTest.name}' completed ${PlaybackState.hasFailed ? `with ${PlaybackState.errors} error(s)` : "successfully"}`,
        PlaybackState.hasFailed ? LogTypes.Failure : LogTypes.Success);
      log.setNotice();
    }
    logger.log(log);
  }

  logCommandState(command, status) {
    if (status && this.shouldLogCommand(command.command)) {
      const index = PlaybackState.currentRunningTest.commands.indexOf(command) + 1;
      let log = this.findCorrespondingLog(command.id);
      let shouldAddLog = false;
      if (!log) {
        log = new Log();
        log.setIndex(index);
        log.setCommandId(command.id);
        shouldAddLog = true;
      }
      switch(status.state) {
        case PlaybackStates.Pending:
          log.setMessage(status.message ? status.message : `${command.command} on ${command.target}${command.value ? " with value " + command.value : ""}...`);
          break;
        case PlaybackStates.Undetermined:
          log.setStatus(LogTypes.Undetermined);
          break;
        case PlaybackStates.Failed:
        case PlaybackStates.Fatal: // eslint-disable-line no-fallthrough
          log.setStatus(LogTypes.Failure);
          break;
        case PlaybackStates.Passed:
          log.setStatus(LogTypes.Success);
          break;
      }
      if (status.state !== PlaybackStates.Pending) {
        // In pending the description is used as the message
        log.setDescription(status.message);
      }
      if (shouldAddLog) {
        logger.log(log);
      }
    }
  }

  shouldLogCommand(command) {
    return command !== "echo";
  }

  findCorrespondingLog(commandId) {
    if (!logger.logs.length) {
      return;
    }
    for (let i = logger.logs.length - 1; i >= 0; i--) {
      let log = logger.logs[i];
      if (!log.commandId && log.isNotice) { // make sure we are in the current run, maybe log runId
        return;
      } else if (log.commandId === commandId) {
        return log;
      }
    }
  }

  dispose() {
    this.playbackDisposer();
    this.commandStateDisposer();
  }
}
