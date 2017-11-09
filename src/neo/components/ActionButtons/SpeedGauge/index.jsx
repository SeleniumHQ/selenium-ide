import React from "react";
import ActionButton from "../ActionButton";
import classNames from "classnames";

export default function SpeedGaugeButton(props) {
  return <ActionButton {...props} className={classNames("si-gauge", props.className)} />;// eslint-disable-line react/prop-types
}
