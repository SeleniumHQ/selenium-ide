import React from "react";
import ActionButton from "../ActionButton";
import classNames from "classnames";

export default function PlayCurrentButton(props) {
  return <ActionButton {...props} className={classNames("si-play", props.className)} />;// eslint-disable-line react/prop-types
}
