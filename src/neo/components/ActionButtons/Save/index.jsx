import React from "react";
import PropTypes from "prop-types";
import ActionButton from "../ActionButton";
import classNames from "classnames";
import "./style.css";

export default class SaveButton extends React.Component {
  render() {
    const props = {...this.props};
    delete props.unsaved;
    return (
      <ActionButton data-tip="<p>Save project</p>" {...props} className={classNames("si-save", {pulse: this.props.unsaved}, this.props.className)} />// eslint-disable-line react/prop-types
    );
  }

  static propTypes = {
    unsaved: PropTypes.bool
  };
}
