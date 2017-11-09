import React from "react";
import ActionButton from "../ActionButton";
import classNames from "classnames";

export default function PlayAllButton(props) {
  return <ActionButton {...props} className={classNames("si-play-all", props.className)} />;// eslint-disable-line react/prop-types
}
