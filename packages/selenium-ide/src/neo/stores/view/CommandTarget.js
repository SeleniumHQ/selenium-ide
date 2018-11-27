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

import UiState from './UiState'
import PlaybackState from './PlaybackState'
import Logger from './Logs'

/**
 *  Controls state and behavior for individual commands with alternative playback
 *  behavior like `Record from here` and `Play to this point`
 */
export default class CommandTarget {
  /**
   * `is` stores metadata to determine alternative playback behavior for the target command
   * For example:
   * is: {
   *   playToThisPoint: true,
   *   recordFromHere: false
   * }
   */
  is = {}

  /**
   * `_command` is the reference to the target command used for alternative playback
   */
  _command = undefined

  load(command, controls) {
    this._reset()
    this._command = command
    this.is = controls
    if (this.is.playToThisPoint || this.is.recordFromHere)
      this._toggleBreakpoint()
    PlaybackState.toggleIsSilent()
    if (this.is.playToThisPoint)
      PlaybackState.toggleIsSingleCommandExecutionEnabled()
  }

  doCleanup(opts) {
    this._alert(opts)
    this._reset()
  }

  doPlayToThisPoint() {
    if (this.is.playToThisPoint || this.is.recordFromHere) {
      this._toggleBreakpoint()
      this.is.visited = true
    }
  }

  async doRecordFromHere(callback) {
    if (!this.is.recordFromHere) return
    this.doPlayToThisPoint()
    this._prepareTestForRecording()
    if (callback) await callback()
    else await UiState.startRecording()
  }

  _alert(opts = { isTestAborted: false }) {
    if (this._command && !this.is.visited && !opts.isTestAborted) {
      this._logMessage =
        'Unable to play to target command. Likely because it is in a control flow branch that was not executed during playback.'
      Logger.warn(this._logMessage)
    }
  }

  async _prepareTestForRecording() {
    await PlaybackState.playCommand(this._command)
    PlaybackState.stopPlayingGracefully()
    UiState.changeView(PlaybackState.lastSelectedView)
    UiState.selectNextCommand({
      from: this._command,
      isCommandTarget: true,
    })
  }

  _reset() {
    if (this._command && this._command.isBreakpoint) this._toggleBreakpoint()
    this._command = undefined
    this.is = {}
    this._logMessage = undefined
    PlaybackState.toggleIsSingleCommandExecutionEnabled()
  }

  _toggleBreakpoint() {
    if (this._command) this._command.toggleBreakpoint()
  }
}
