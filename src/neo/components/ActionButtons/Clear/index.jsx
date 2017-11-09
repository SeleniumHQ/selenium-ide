import React from "react";
import ActionButton from "../ActionButton";
import classNames from "classnames";

export default class ClearButton extends React.Component {
  render() {
    return (
      <ActionButton {...this.props} className={classNames("si-clear", this.props.className)} />// eslint-disable-line react/prop-types
    );
  }
}
