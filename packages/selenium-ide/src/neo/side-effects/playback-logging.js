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

import { observe } from 'mobx'
import Log, { LogTypes } from '../ui-models/Log'
import { Logger, Channels, output } from '../stores/view/Logs'
import PlaybackState, { PlaybackStates } from '../stores/view/PlaybackState'

export default class PlaybackLogger {
  constructor() {
    this.logger = new Logger(Channels.PLAYBACK)
    this.playbackDisposer = observe(PlaybackState, 'isPlaying', isPlaying => {
      this.logPlayingState(isPlaying.newValue)
    })
    this.callstackDisposer = observe(PlaybackState.callstack, change => {
      if (change.addedCount) {
        this.logStackPush(change.added[0].caller, change.added[0].callee)
      } else if (change.removedCount) {
        this.logStackUnwind(change.removed[0].caller, change.removed[0].callee)
      }
    })
    this.commandStateDisposer = observe(PlaybackState.commandState, change => {
      if (change.type === 'add' || change.type === 'update') {
        this.parseCommandStateChange(
          change.name,
          change.newValue,
          this.logCommandState
        )
      }
    })
    this.logPlayingState = this.logPlayingState.bind(this)
    this.logStackPush = this.logStackPush.bind(this)
    this.logStackUnwind = this.logStackUnwind.bind(this)
    this.parseCommandStateChange = this.parseCommandStateChange.bind(this)
    this.logCommandState = this.logCommandState.bind(this)
    this.dispose = this.dispose.bind(this)
  }

  parseCommandStateChange(stateId, status, cb) {
    const commandParts = stateId.split(':')
    let commandId, stackIndex
    if (commandParts.length === 2) {
      stackIndex = commandParts[0]
      commandId = commandParts[1]
    } else {
      commandId = commandParts[0]
    }
    const test =
      stackIndex !== undefined
        ? PlaybackState.callstack[stackIndex].callee
        : PlaybackState.currentRunningTest
    const command = test.commands.find(({ id }) => id === commandId)
    cb(command, status)
  }

  logPlayingState(isPlaying) {
    let log
    if (isPlaying) {
      log = new Log(`Running '${PlaybackState.stackCaller.name}'`)
      log.setNotice()
    } else if (PlaybackState.aborted) {
      log = new Log(
        `'${PlaybackState.stackCaller.name}' was aborted`,
        LogTypes.Failure
      )
      log.setNotice()
    } else {
      log = new Log(
        `'${PlaybackState.stackCaller.name}' ${
          !PlaybackState.hasFinishedSuccessfully
            ? `ended with ${PlaybackState.errors} error(s)`
            : 'completed successfully'
        }`,
        !PlaybackState.hasFinishedSuccessfully
          ? LogTypes.Failure
          : LogTypes.Success
      )
      log.setNotice()
    }
    this.logger.log(log)
  }

  logStackPush(caller, callee) {
    const log = new Log(`Running '${callee.name}', called by '${caller.name}'`)
    log.setNotice()
    this.logger.log(log)
  }

  logStackUnwind(caller, callee) {
    const log = new Log(
      `Finished running '${callee.name}', returning to '${caller.name}'`
    )
    log.setNotice()
    this.logger.log(log)
  }

  logCommandState(command, status) {
    if (status && command && this.shouldLogCommand(command, status.state)) {
      const index =
        PlaybackState.currentRunningTest.commands.indexOf(command) + 1
      let log = this.findCorrespondingLog(command.id)
      let shouldAddLog = false
      if (!log) {
        log = new Log()
        log.setIndex(index)
        log.setCommandId(command.id)
        shouldAddLog = true
      }
      switch (status.state) {
        case PlaybackStates.Pending:
          log.setMessage(
            status.message
              ? status.message
              : `${command.command} on ${command.target}${
                  command.value ? ' with value ' + command.value : ''
                }...`
          )
          break
        case PlaybackStates.Undetermined:
          log.setStatus(LogTypes.Undetermined)
          break
        case PlaybackStates.Failed:
        case PlaybackStates.Fatal: // eslint-disable-line no-fallthrough
          log.setStatus(LogTypes.Failure)
          break
        case PlaybackStates.Passed:
          log.setStatus(LogTypes.Success)
          break
      }
      if (status.state !== PlaybackStates.Pending) {
        // In pending the description is used as the message
        log.setDescription(status.message)
        if (command.command === 'run') {
          log.setMessage(`run ${command.target}`)
        }
      }
      if (shouldAddLog) {
        this.logger.log(log)
      }
    }
  }

  shouldLogCommand(command, state) {
    if (!command.enabled) {
      return false
    } else if (command.command === 'echo') {
      return false
    } else if (command.command === 'run' && state !== PlaybackStates.Fatal) {
      return false
    } else {
      return true
    }
  }

  findCorrespondingLog(commandId) {
    if (!output.logs.length) {
      return
    }
    for (let i = output.logs.length - 1; i >= 0; i--) {
      let log = output.logs[i]
      if (!log.commandId && log.isNotice) {
        // make sure we are in the current run, maybe log runId
        return
      } else if (log.commandId === commandId) {
        return log
      }
    }
  }

  dispose() {
    this.playbackDisposer()
    this.callstackDisposer()
    this.commandStateDisposer()
  }
}
