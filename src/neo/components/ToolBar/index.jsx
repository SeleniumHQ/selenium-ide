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

import React from "react";
import { observer } from "mobx-react";
import PlayAll from "../../components/ActionButtons/PlayAll";
import PlayCurrent from "../../components/ActionButtons/PlayCurrent";
import Pause from "../../components/ActionButtons/Pause";
import Stop from "../../components/ActionButtons/Stop";
import StepInto from "../../components/ActionButtons/StepInto";
import SpeedGauge from "../../components/ActionButtons/SpeedGauge";
import Record from "../../components/ActionButtons/Record";
import GaugeMenu from "../GaugeMenu";
import UiState from "../../stores/view/UiState";
import PlaybackState from "../../stores/view/PlaybackState";
import "./style.css";

@observer
export default class ToolBar extends React.Component {
  render() {
    const isPlayingSuite = PlaybackState.isPlaying && PlaybackState.currentRunningSuite;
    const isPlayingTest = PlaybackState.isPlaying && PlaybackState.currentRunningTest && !PlaybackState.currentRunningSuite;
    const isTestEmpty = UiState.selectedTest.test && !UiState.selectedTest.test.commands.length;
    const isCommandValid = UiState.selectedCommand && UiState.selectedCommand.isValid;
    return (
      <div className="toolbar">
        <PlayAll
          isActive={!PlaybackState.paused && isPlayingSuite}
          disabled={!UiState.selectedTest.suite || isPlayingTest}
          onClick={!PlaybackState.paused ? PlaybackState.startPlayingSuite : PlaybackState.resume}
        />
        <PlayCurrent
          isActive={!PlaybackState.paused && isPlayingTest}
          disabled={isTestEmpty || isPlayingSuite}
          onClick={!PlaybackState.paused ? PlaybackState.startPlaying : PlaybackState.resume}
        />
        { PlaybackState.isPlaying ? <Stop onClick={PlaybackState.abortPlaying} /> : null }
        { PlaybackState.isPlaying ?
          <Pause isActive={PlaybackState.paused}
            data-tip={!PlaybackState.paused ? "<p>Pause test execution</p>" : "<p>Resume test execution</p>"}
            onClick={!PlaybackState.paused ? PlaybackState.pause : PlaybackState.resume} /> : null }
        { !PlaybackState.isPlaying ? <StepInto disabled={!isCommandValid} onClick={() => PlaybackState.playCommand(UiState.selectedCommand, true)} /> : null }
        <GaugeMenu opener={
          <SpeedGauge speed={UiState.gaugeSpeed} />
        } value={PlaybackState.delay} maxDelay={PlaybackState.maxDelay} onChange={PlaybackState.setDelay} />
        <span style={{
          float: "right",
          marginRight: "3px"
        }}>
          { !PlaybackState.isPlaying && UiState.selectedTest.test ? <Record isRecording={UiState.isRecording} onClick={UiState.toggleRecord} /> : null }
        </span>
        <div style={{
          clear: "right"
        }}></div>
      </div>
    );
  }
}
