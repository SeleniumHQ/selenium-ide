import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

export default class ActionButton extends React.Component {
  render() {
    return (
      <button {...this.props} className={classNames("btn-action", this.props.className)} />
    );
  }

  static propTypes = {
    className: PropTypes.string.isRequired
  };
}
