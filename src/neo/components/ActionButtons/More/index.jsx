import React from "react";
import ActionButton from "../ActionButton";
import classNames from "classnames";

export default function MoreButton(props) {
  return <ActionButton {...props} className={classNames("si-more", props.className)} />;// eslint-disable-line react/prop-types
}
