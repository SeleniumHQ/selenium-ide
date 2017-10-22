import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import CommandName from "../CommandName";
import MoreButton from "../ActionButtons/More";
import "./style.css";

export const RowState = {
  Pending: "pending",
  Passed: "passed",
  Failed: "failed",
  Selected: "selected"
};

export default class TestRow extends React.Component {
  static propTypes = {
    command: PropTypes.string.isRequired,
    target: PropTypes.string,
    value: PropTypes.string,
    state: PropTypes.oneOf(Object.keys(RowState)),
    onClick: PropTypes.func
  };
  render() {
    return (
      <tr className={classNames({[RowState[this.props.state]]: this.props.state})} onClick={this.props.onClick}>
        <td><CommandName>{this.props.command}</CommandName></td>
        <td>{this.props.target}</td>
        <td>{this.props.value}</td>
        <td className="buttons">
          <div>
            <MoreButton />
          </div>
        </td>
      </tr>
    );
  }
}
