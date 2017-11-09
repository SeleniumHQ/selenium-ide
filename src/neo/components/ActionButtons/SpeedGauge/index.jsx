import React from "react";
import ActionButton from "../ActionButton";
import classNames from "classnames";

export default class SpeedGaugeButton extends React.Component {
  render() {
    return (
      <ActionButton {...this.props} className={classNames("si-gauge", this.props.className)} />// eslint-disable-line react/prop-types
    );
  }
}
