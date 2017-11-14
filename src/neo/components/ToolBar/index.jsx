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
    const isPlayingSuite = PlaybackState.isPlaying && PlaybackState.currentRunningSuite;
    const isPlayingTest = PlaybackState.isPlaying && PlaybackState.currentRunningTest && !PlaybackState.currentRunningSuite;
    return (
      <span>
        <PlayAll
          isActive={!PlaybackState.paused && isPlayingSuite}
          disabled={!UiState.selectedTest.suite || isPlayingTest}
          onClick={!PlaybackState.paused ? PlaybackState.startPlayingSuite : PlaybackState.resume}
        />
        <PlayCurrent
          isActive={!PlaybackState.paused && isPlayingTest}
          disabled={!UiState.selectedTest.test || isPlayingSuite}
          onClick={!PlaybackState.paused ? PlaybackState.startPlaying : PlaybackState.resume}
        />
        { PlaybackState.isPlaying ? <Stop onClick={PlaybackState.abortPlaying} /> : null }
        { PlaybackState.isPlaying ? <Pause isActive={PlaybackState.paused} onClick={!PlaybackState.paused ? PlaybackState.pause : PlaybackState.resume} /> : null }
        { !PlaybackState.isPlaying ? <StepInto disabled={!UiState.selectedCommand} onClick={() => PlaybackState.startPlaying(UiState.selectedCommand)} /> : null }
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
