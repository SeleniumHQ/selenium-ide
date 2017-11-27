import React from "react";
import ActionButton from "../ActionButton";
import classNames from "classnames";
import "./style.css";

export default class ClearButton extends React.Component {
  render() {
    return (
      <ActionButton data-tooltip="Clear logs" {...this.props} className={classNames("si-clear", this.props.className)} />// eslint-disable-line react/prop-types
    );
  }
}
