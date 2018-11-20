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

export default class CommandTarget {
  load(command, controls) {
    this._reset()
    this._command = command
    this.is = controls
    if (this.is.playToThisPoint || this.is.recordFromHere)
      this._toggleBreakpoint()
  }

  _reset() {
    if (this._command && this._command.isBreakpoint) this._toggleBreakpoint()
    this._command = undefined
    this.is = {}
    this._logMessage = undefined
  }

  doPlayToThisPoint() {
    if (this.is.playToThisPoint) {
      this._toggleBreakpoint()
      this.is.visited = true
    }
  }

  async doRecordFromHere() {
    if (this.is.recordFromHere) {
      PlaybackState.stopPlayingGracefully()
      UiState.changeView(PlaybackState.lastSelectedView)
      PlaybackState.playCommand(this._command)
      PlaybackState.clearCommandStates()
      UiState.selectNextCommand({
        from: this._command,
        isCommandTarget: true,
      })
      this._toggleBreakpoint()
      this.is.visited = true
      await UiState.startRecording()
    }
  }

  async doCleanup(opts) {
    this._alert(opts)
    this._reset()
  }

  _alert(opts = { isTestAborted: false }) {
    if (this._command && !this.is.visited && !opts.isTestAborted) {
      this._logMessage =
        'Unable to play to target command. Likely because it is in a control flow branch that was not executed during playback.'
      Logger.warn(this._logMessage)
    }
  }

  _toggleBreakpoint() {
    if (this._command) this._command.toggleBreakpoint()
  }
}
