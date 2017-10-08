import React from "react";
import PropTypes from "prop-types";
import "./style.css";

export default class FormInput extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired
  };
  static defaultProps = {
    type: "text"
  };
  render() {
    return (
      <div className="form-input">
        <label htmlFor={this.props.name}>{this.props.label}</label>
        <input {...this.props} />
      </div>
    );
  }
}
