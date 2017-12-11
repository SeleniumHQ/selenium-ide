import React from "react";
import PropTypes from "prop-types";
import { observer } from "mobx-react";
import classNames from "classnames";
import "./style.css";

@observer
export default class LogMessage extends React.Component {
  render() {
    return (
      <li className={classNames("log", this.props.log.status, {notice: this.props.log.isNotice})}>
        {this.props.log.index && <span className="index">{this.props.log.index}.</span>}
        <span className="message">{this.props.log.message}</span>
        {this.props.log.error && <div className="error-message">{this.props.log.error}</div>}
      </li>
    );
  }
  static propTypes = {
    log: PropTypes.object
  };
}
