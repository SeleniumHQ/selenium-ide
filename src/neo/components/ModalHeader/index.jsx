import React from "react";
import PropTypes from "prop-types";
import RemoveButton from "../ActionButtons/Remove";
import "./style.css";

export default class ModalHeader extends React.Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    close: PropTypes.func.isRequired
  };
  render() {
    return (
      <span className="header modal-header">
        <h2>{this.props.title}</h2>
        <RemoveButton onClick={this.props.close} />
      </span>
    );
  }
}
