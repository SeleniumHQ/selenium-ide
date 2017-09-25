import React from "react";
import PropTypes from "prop-types";

export default class TestList extends React.Component {
  static propTypes = {
    tests: PropTypes.array.isRequired
  };
  render() {
    return (
      <ul>
        {this.props.tests.map(test => (
          <li>{test}</li>
        ))}
      </ul>
    );
  }
}
