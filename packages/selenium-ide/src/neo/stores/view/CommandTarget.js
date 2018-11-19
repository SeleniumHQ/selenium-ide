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

export default class CommandTarget {
  constructor(logger) {
    this.logger = logger
    this._reset()
  }

  load(command, controls) {
    this.command = command
    this.is = controls
    if (this.is.playToThisPoint || this.is.recordFromHere)
      this._toggleBreakpoint()
  }

  _reset() {
    if (this.command && this.command.isBreakpoint) this._toggleBreakpoint()
    this.command = undefined
    this.is = {}
  }

  doPlayToThisPoint() {
    if (this.is.playToThisPoint) {
      this._toggleBreakpoint()
      this.is.visited = true
    }
  }

  async doRecordFromHere() {
    if (this.is.recordFromHere) {
      this._toggleBreakpoint()
      this.is.visited = true
      await UiState.startRecording()
    }
  }

  doCleanup(opts) {
    this._alert(opts)
    this._reset()
  }

  _alert(opts = { isTestAborted: false }) {
    if (!this.is.visited && !opts.isTestAborted)
      this.logger.warn(
        'Unable to play to target command. Likely because it is in a control flow branch that was not executed during playback.'
      )
  }

  _toggleBreakpoint() {
    if (this.command) this.command.toggleBreakpoint()
  }
}
