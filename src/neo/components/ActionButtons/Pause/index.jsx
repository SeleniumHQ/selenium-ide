import React from "react";
import ActionButton from "../ActionButton";
import classNames from "classnames";

export default class PauseCurrentButton extends React.Component {
  render() {
    return (
      <ActionButton data-tooltip="Pause play" {...this.props} className={classNames("si-pause", this.props.className)} />// eslint-disable-line react/prop-types
    );
  }
}
