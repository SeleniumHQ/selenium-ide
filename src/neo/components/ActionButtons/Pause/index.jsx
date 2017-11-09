import React from "react";
import ActionButton from "../ActionButton";
import classNames from "classnames";

export default function PauseButton(props) {
  return <ActionButton {...props} className={classNames("si-pause", props.className)} />;// eslint-disable-line react/prop-types
}
