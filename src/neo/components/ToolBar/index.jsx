import React from "react";
import PlayAll from "../../components/ActionButtons/PlayAll";
import PlayCurrent from "../../components/ActionButtons/PlayCurrent";
import Pause from "../../components/ActionButtons/Pause";

export default class ToolBar extends React.Component {
  render() {
    return (
      <span>
        <PlayAll />
        <PlayCurrent />
        <Pause />
      </span>
    );
  }
}
