import React from "react";
import PropTypes from "prop-types";
import "./style.css";

export default class LogMessage extends React.Component {
  render() {
    return (
      <li className={this.props.status}>{this.props.children}</li>
    );
  }
  static propTypes = {
    children: PropTypes.node.isRequired,
    status: PropTypes.string
  };
}
