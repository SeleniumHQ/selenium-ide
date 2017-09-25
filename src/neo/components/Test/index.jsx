import React from "react";
import PropTypes from "prop-types";
import test from "../../images/ic_test.svg";
import "./style.css";

export default class Test extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired
  };
  render() {
    return (
      <a href="#" className="test">
        <img src={test} alt="test" />
        <span>{this.props.name}</span>
      </a>
    );
  }
}
