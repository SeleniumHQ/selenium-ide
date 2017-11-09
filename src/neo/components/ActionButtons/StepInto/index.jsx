import React from "react";
import ActionButton from "../ActionButton";
import classNames from "classnames";

export default function StepIntoButton(props) {
  return <ActionButton {...props} className={classNames("si-step-into", props.className)} />;// eslint-disable-line react/prop-types
}
