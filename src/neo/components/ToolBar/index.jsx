import React from "react";
import PlayAll from "../../components/ActionButtons/PlayAll";
import PlayCurrent from "../../components/ActionButtons/PlayCurrent";

export default class ToolBar extends React.Component {
  render() {
    return (
      <span>
        <PlayAll />
        <PlayCurrent />
      </span>
    );
  }
}
