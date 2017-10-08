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
    state: PropTypes.oneOf(Object.keys(RowState))
  };
  render() {
    return (
      <tr className={classNames({[this.props.state]: this.props.state})}>
        <td>open</td>
        <td>/</td>
        <td></td>
      </tr>
    );
  }
}
