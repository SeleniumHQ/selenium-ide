import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import Test from "../Test";
import "./style.css";

export default class TestList extends React.Component {
  static propTypes = {
    tests: PropTypes.array.isRequired,
    collapsed: PropTypes.bool.isRequired,
    selectedTest: PropTypes.string,
    selectTest: PropTypes.func.isRequired,
    project: PropTypes.string.isRequired
  };
  render() {
    return (
      <ul className={classNames("tests", {"active": !this.props.collapsed})}>
        {this.props.tests.map(({id, name}) => (
          <li key={id}>
            <Test id={id} name={name} project={this.props.project} selected={id === this.props.selectedTest} selectTest={this.props.selectTest} />
          </li>
        ))}
      </ul>
    );
  }
}
