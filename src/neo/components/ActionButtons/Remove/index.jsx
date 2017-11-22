import React from "react";
import ActionButton from "../ActionButton";
import classNames from "classnames";

export default class RemoveButton extends React.Component {
  render() {
    return (
      <ActionButton tabIndex="-1" {...this.props} className={classNames("no-focus", "si-remove", this.props.className)} />// eslint-disable-line react/prop-types
    );
  }
}
