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

import React from 'react'
import { observer } from 'mobx-react'
import PlayAll from '../../components/ActionButtons/PlayAll'
import PlayCurrent from '../../components/ActionButtons/PlayCurrent'
import Pause from '../../components/ActionButtons/Pause'
import Stop from '../../components/ActionButtons/Stop'
import StepInto from '../../components/ActionButtons/StepInto'
import SpeedGauge from '../../components/ActionButtons/SpeedGauge'
import DisableBreakpoints from '../../components/ActionButtons/DisableBreakpoints'
import PauseExceptions from '../../components/ActionButtons/PauseExceptions'
import Record from '../../components/ActionButtons/Record'
import GaugeMenu from '../GaugeMenu'
import UiState from '../../stores/view/UiState'
import { parse } from 'modifier-keys'
import PlaybackState from '../../stores/view/PlaybackState'
import ModalState from '../../stores/view/ModalState'
import './style.css'

@observer
export default class ToolBar extends React.Component {
  toggleRecord() {
    UiState.toggleRecord()
  }
  playAll() {
    const isInSuiteView = UiState.selectedView === 'Test suites'

    if (PlaybackState.canPlaySuite) {
      PlaybackState.playSuiteOrResume()
    } else if (isInSuiteView) {
      ModalState.showAlert({
        title: 'Select a test case',
        description:
          'To play a suite you must select a test case from within that suite.',
      })
    } else {
      PlaybackState.playFilteredTestsOrResume()
    }
  }
  render() {
    const isTestEmpty =
      UiState.selectedTest.test && !UiState.selectedTest.test.commands.length
    const isCommandValid =
      UiState.selectedCommand && UiState.selectedCommand.isValid
    return (
      <div className="toolbar">
        <PlayAll
          isActive={!PlaybackState.paused && PlaybackState.isPlayingSuite}
          disabled={UiState.isRecording}
          onClick={this.playAll}
          data-tip={
            PlaybackState.canPlaySuite
              ? `<p>Run all tests in suite <span style="color: #929292;padding-left: 5px;">${
                  !UiState.keyboardShortcutsEnabled
                    ? ''
                    : parse('r', { primaryKey: true, shiftKey: true })
                }</span></p>`
              : `<p>Run all tests <span style="color: #929292;padding-left: 5px;">${
                  !UiState.keyboardShortcutsEnabled
                    ? ''
                    : parse('r', { primaryKey: true, shiftKey: true })
                }</span></p>`
          }
          data-event="focus mouseenter"
          data-event-off="blur mouseleave"
          aria-label={
            PlaybackState.canPlaySuite
              ? 'Run all tests in suite'
              : 'Run all tests'
          }
        />
        <PlayCurrent
          isActive={!PlaybackState.paused && PlaybackState.isPlayingTest}
          disabled={
            isTestEmpty || PlaybackState.isPlayingSuite || UiState.isRecording
          }
          onClick={PlaybackState.playTestOrResume}
        />
        {PlaybackState.isPlaying ? (
          <Stop
            onClick={() => {
              PlaybackState.abortPlaying()
            }}
          />
        ) : null}
        {PlaybackState.isPlaying ? (
          <Pause
            isActive={PlaybackState.paused}
            data-tip={
              !PlaybackState.paused
                ? `<p>Pause test execution <span style="color: #929292;padding-left: 5px;">${
                    !UiState.keyboardShortcutsEnabled
                      ? ''
                      : parse('p', { primaryKey: true })
                  }</span></p>`
                : `<p>Resume test execution <span style="color: #929292;padding-left: 5px;">${
                    !UiState.keyboardShortcutsEnabled
                      ? ''
                      : parse('p', { primaryKey: true })
                  }</span></p>`
            }
            data-event="focus mouseenter"
            data-event-off="blur mouseleave"
            onClick={PlaybackState.pauseOrResume}
          />
        ) : null}
        <StepInto
          disabled={!isCommandValid || UiState.isRecording}
          onClick={PlaybackState.stepOver}
        />
        <GaugeMenu
          opener={<SpeedGauge speed={UiState.gaugeSpeed} />}
          value={PlaybackState.delay}
          maxDelay={PlaybackState.maxDelay}
          onChange={PlaybackState.setDelay}
        />
        <div className="flexer" />
        <DisableBreakpoints
          isActive={PlaybackState.breakpointsDisabled}
          onClick={PlaybackState.toggleDisableBreakpoints}
        />
        <PauseExceptions
          isActive={PlaybackState.pauseOnExceptions}
          onClick={PlaybackState.togglePauseOnExceptions}
        />
        <div className="sep" />
        <Record
          disabled={PlaybackState.isPlaying || !UiState.selectedTest.test}
          isRecording={UiState.isRecording}
          onClick={this.toggleRecord}
        />
      </div>
    )
  }
}
