import React from "react";
import { observer } from "mobx-react";
import PlayAll from "../../components/ActionButtons/PlayAll";
import Pause from "../../components/ActionButtons/Pause";
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
        <PlayAll onClick={PlaybackState.togglePlaying} />
        <Pause />
        <StepInto />
        <SpeedGauge />
        <span style={{
          float: "right"
        }}>
          <Record isRecording={UiState.isRecording} onClick={UiState.toggleRecord} />
        </span>
        <div style={{
          clear: "right",
          borderBottom: "1px #CECECE solid"
        }}></div>
      </span>
    );
  }
}
