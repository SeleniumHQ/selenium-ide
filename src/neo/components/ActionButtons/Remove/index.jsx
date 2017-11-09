import React from "react";
import ActionButton from "../ActionButton";
import classNames from "classnames";

export default function RemoveButton(props) {
  return <ActionButton {...props} className={classNames("si-remove", props.className)} />;// eslint-disable-line react/prop-types
}
