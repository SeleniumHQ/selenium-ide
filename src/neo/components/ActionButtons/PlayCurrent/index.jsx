import React from "react";
import ActionButton from "../ActionButton";
import classNames from "classnames";

export default class PlayCurrentButton extends React.Component {
  render() {
    return (
      <ActionButton data-tooltip="Play test case" {...this.props} className={classNames("si-play", this.props.className)} />// eslint-disable-line react/prop-types
    );
  }
}
