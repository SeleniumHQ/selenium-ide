import React from "react";
import PropTypes from "prop-types";
import { observer } from "mobx-react";
import classNames from "classnames";
import "./style.css";

@observer
export default class LogMessage extends React.Component {
  render() {
    return (
      <li className={classNames("log", this.props.log.status)}>
        {this.props.log.index && <span>{this.props.log.index}.</span>}
        {this.props.log.message}
      </li>
    );
  }
  static propTypes = {
    log: PropTypes.object
  };
}
