import React from "react";
import ActionButton from "../ActionButton";
import classNames from "classnames";

export default function AddButton(props) {
  return <ActionButton {...props} className={classNames("si-add", props.className)} />;// eslint-disable-line react/prop-types
}
