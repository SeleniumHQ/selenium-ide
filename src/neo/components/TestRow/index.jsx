import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import "./style.css";

export const RowState = {
  Passed: "passed",
  Failed: "failed"
};

export default class TestRow extends React.Component {
  static propTypes = {
    command: PropTypes.string.isRequired,
    target: PropTypes.string,
    value: PropTypes.string,
    state: PropTypes.oneOf(Object.keys(RowState))
  };
  render() {
    return (
      <tr className={classNames({[this.props.state]: this.props.state})}>
        <td>{this.props.command}</td>
        <td>{this.props.target}</td>
        <td>{this.props.value}</td>
      </tr>
    );
  }
}
