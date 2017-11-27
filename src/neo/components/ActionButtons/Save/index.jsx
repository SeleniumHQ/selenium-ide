import React from "react";
import ActionButton from "../ActionButton";
import classNames from "classnames";

export default class SaveButton extends React.Component {
  render() {
    return (
      <ActionButton data-tooltip="Save" {...this.props} className={classNames("si-save", this.props.className)} />// eslint-disable-line react/prop-types
    );
  }
}
