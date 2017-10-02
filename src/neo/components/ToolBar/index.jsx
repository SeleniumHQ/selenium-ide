import React from "react";
import PlayAll from "../../components/ActionButtons/PlayAll";
import PlayCurrent from "../../components/ActionButtons/PlayCurrent";
import Pause from "../../components/ActionButtons/Pause";
import StepInto from "../../components/ActionButtons/StepInto";
import SpeedGauge from "../../components/ActionButtons/SpeedGauge";
import Record from "../../components/ActionButtons/Record";

export default class ToolBar extends React.Component {
  render() {
    return (
      <span>
        <PlayAll />
        <PlayCurrent />
        <Pause />
        <StepInto />
        <SpeedGauge />
        <span style={{
          float: "right"
        }}>
          <Record />
        </span>
      </span>
    );
  }
}
