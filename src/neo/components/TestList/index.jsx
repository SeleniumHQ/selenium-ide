import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import Test from "../Test";
import "./style.css";

export default class TestList extends React.Component {
  static propTypes = {
    tests: PropTypes.array.isRequired,
    collapsed: PropTypes.bool.isRequired
  };
  render() {
    return (
      <ul className={classNames("tests", {"active": !this.props.collapsed})}>
        {this.props.tests.map(test => (
          <li key={test}>
            <Test name={test} />
          </li>
        ))}
      </ul>
    );
  }
}
