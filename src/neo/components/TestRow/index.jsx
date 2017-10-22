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
  constructor(props) {
    super(props);
    this.state = {
      isMenuOpen: false
    };
    this.toggleMenu = this.toggleMenu.bind(this);
  }
  static propTypes = {
    command: PropTypes.string.isRequired,
    target: PropTypes.string,
    value: PropTypes.string,
    state: PropTypes.oneOf(Object.keys(RowState)),
    onClick: PropTypes.func,
    remove: PropTypes.remove
  };
  toggleMenu(e) {
    e.stopPropagation();
  }
  render() {
    return (
      <tr className={classNames({[RowState[this.props.state]]: this.props.state})} onClick={this.props.onClick}>
        <td><CommandName>{this.props.command}</CommandName></td>
        <td>{this.props.target}</td>
        <td>{this.props.value}</td>
        <td className="buttons">
          <div>
            <MoreButton onClick={(e) => { e.stopPropagation(); this.props.remove(); }} />
          </div>
        </td>
      </tr>
    );
  }
}
