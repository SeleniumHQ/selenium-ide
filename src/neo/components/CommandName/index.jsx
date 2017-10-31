import React from "react";
import PropTypes from "prop-types";
import { Commands } from "../../models/Command";

export default class CommandName extends React.Component {
  static propTypes = {
    children: PropTypes.string
  };
  render() {
    return Commands[this.props.children] ? Commands[this.props.children] : this.props.children;
  }
}
