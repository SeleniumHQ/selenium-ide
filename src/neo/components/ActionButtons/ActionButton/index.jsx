import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import "./style.css";

export default class ActionButton extends React.Component {
  render() {
    return (
      <button type="button" {...this.props} className={classNames("btn-action", {"active": this.props.isActive}, this.props.className)} />
    );
  }

  static propTypes = {
    className: PropTypes.string.isRequired,
    isActive: PropTypes.bool
  };
}
