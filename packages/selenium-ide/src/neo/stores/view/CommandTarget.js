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
import ModalState from './ModalState'

export default class CommandTarget {
  load(command, controls) {
    this._reset()
    this._command = command
    this.is = controls
    if (this.is.playToThisPoint || this.is.recordFromHere)
      this._toggleBreakpoint()
    if (this.is.playToThisPoint)
      PlaybackState.isSingleCommandExecutionEnabled = true
  }

  doPlayToThisPoint() {
    if (this.is.playToThisPoint) {
      this._toggleBreakpoint()
      this.is.visited = true
    }
  }

  async doRecordFromHere(opts = { showModal: true }) {
    if (this.is.recordFromHere) {
      await PlaybackState.playCommand(this._command)
      PlaybackState.stopPlayingGracefully()
      UiState.changeView(PlaybackState.lastSelectedView)
      PlaybackState.clearCommandStates()
      UiState.selectNextCommand({
        from: this._command,
        isCommandTarget: true,
      })
      this._toggleBreakpoint()
      this.is.visited = true
      if (opts.showModal) {
        ModalState.showDialog(
          {
            type: 'info',
            title: 'Ready to record',
            description:
              'Your test is ready to record from the command you selected.\n\nTo proceed, click one of the buttons below',
            confirmLabel: 'Start recording',
            cancelLabel: 'Cancel',
          },
          async choseProceed => {
            if (choseProceed) {
              await UiState.startRecording()
            }
          }
        )
      } else {
        await UiState.startRecording()
      }
    }
  }

  doCleanup(opts) {
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

  _reset() {
    if (this._command && this._command.isBreakpoint) this._toggleBreakpoint()
    this._command = undefined
    this.is = {}
    this._logMessage = undefined
    PlaybackState.isSingleCommandExecutionEnabled = false
  }

  async _startRecording() {
    await UiState.startRecording()
  }

  _toggleBreakpoint() {
    if (this._command) this._command.toggleBreakpoint()
  }
}
