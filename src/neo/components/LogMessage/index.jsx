import React from "react";
import "./style.css";

export default class LogMessage extends React.Component {
  render() {
    return (
      <li className={this.props.status}>{this.props.children}</li>
    );
  }
}
