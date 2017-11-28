import React from "react";
import ActionButton from "../ActionButton";
import classNames from "classnames";

export default class PauseCurrentButton extends React.Component {
  render() {
    return (
      <ActionButton data-tip="<p>Pause play</p>" {...this.props} className={classNames("si-pause", this.props.className)} />// eslint-disable-line react/prop-types
    );
  }
}
