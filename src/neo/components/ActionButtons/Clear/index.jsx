import React from "react";
import ActionButton from "../ActionButton";
import classNames from "classnames";

export default function ClearButton(props) {
  return <ActionButton {...props} className={classNames("si-clear", props.className)} />;// eslint-disable-line react/prop-types
}
