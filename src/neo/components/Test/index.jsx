import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import test from "../../images/ic_test.svg";
import "./style.css";

export default class Test extends React.Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    selected: PropTypes.bool,
    selectTest: PropTypes.func.isRequired
  };
  handleClick(testId) {
    this.props.selectTest(testId);
  }
  render() {
    return (
      <a href="#" className={classNames("test", {"selected": this.props.selected})} onClick={this.handleClick.bind(this, this.props.id)}>
        <img src={test} alt="test" />
        <span>{this.props.name}</span>
      </a>
    );
  }
}
