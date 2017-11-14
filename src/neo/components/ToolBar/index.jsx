import React from "react";
import { observer } from "mobx-react";
import PlayAll from "../../components/ActionButtons/PlayAll";
import PlayCurrent from "../../components/ActionButtons/PlayCurrent";
import Pause from "../../components/ActionButtons/Pause";
import Stop from "../../components/ActionButtons/Stop";
import StepInto from "../../components/ActionButtons/StepInto";
import SpeedGauge from "../../components/ActionButtons/SpeedGauge";
import Record from "../../components/ActionButtons/Record";
import UiState from "../../stores/view/UiState";
import PlaybackState from "../../stores/view/PlaybackState";

@observer
export default class ToolBar extends React.Component {
  render() {
    return (
      <span>
        { UiState.selectedTest.suite ? <PlayAll
          isActive={PlaybackState.isPlaying && PlaybackState.currentRunningSuite}
          onClick={PlaybackState.startPlayingSuite}
        /> : null }
        { UiState.selectedTest.test ? <PlayCurrent
          isActive={PlaybackState.isPlaying && PlaybackState.currentRunningTest && !PlaybackState.currentRunningSuite}
          onClick={PlaybackState.startPlaying}
        /> : null }
        { PlaybackState.isPlaying ? <Stop onClick={PlaybackState.abortPlaying} /> : null }
        { PlaybackState.isPlaying ? <Pause /> : null }
        { !PlaybackState.isPlaying && UiState.selectedCommand ? <StepInto /> : null }
        <SpeedGauge />
        <span style={{
          float: "right"
        }}>
          { !PlaybackState.isPlaying && UiState.selectedTest.test ? <Record isRecording={UiState.isRecording} onClick={UiState.toggleRecord} /> : null }
        </span>
        <div style={{
          clear: "right",
          borderBottom: "1px #CECECE solid"
        }}></div>
      </span>
    );
  }
}
