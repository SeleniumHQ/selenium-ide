import React from "react";
import PropTypes from "prop-types";
import { observer } from "mobx-react";
import "./style.css";

@observer
export default class LogMessage extends React.Component {
  render() {
    return (
      <li className={this.props.log.status}>{this.props.log.message}</li>
    );
  }
  static propTypes = {
    log: PropTypes.object
  };
}
