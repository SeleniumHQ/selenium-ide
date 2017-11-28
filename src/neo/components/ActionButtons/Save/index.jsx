import React from "react";
import ActionButton from "../ActionButton";
import classNames from "classnames";

export default class SaveButton extends React.Component {
  render() {
    return (
      <ActionButton data-tip="<p>Save</p>" {...this.props} className={classNames("si-save", this.props.className)} />// eslint-disable-line react/prop-types
    );
  }
}
