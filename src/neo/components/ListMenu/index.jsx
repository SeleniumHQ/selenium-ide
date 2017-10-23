import React from "react";
import PropTypes from "prop-types";
import Menu from "../Menu";
import "./style.css";

export default class ListMenu extends React.Component {
  static propTypes = {
    opener: PropTypes.element
  };
  render() {
    return (
      <Menu opener={this.props.opener}>
        <ul className="buttons">
          <li>
            <a>Add new command</a>
          </li>
          <li>
            <a>Remove command</a>
          </li>
        </ul>
      </Menu>
    );
  }
}
