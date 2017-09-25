import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import test from "../../images/ic_test.svg";
import "./style.css";

export default class Test extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    selected: PropTypes.bool
  };
  render() {
    return (
      <a href="#" className={classNames("test", {"selected": this.props.selected})}>
        <img src={test} alt="test" />
        <span>{this.props.name}</span>
      </a>
    );
  }
}
