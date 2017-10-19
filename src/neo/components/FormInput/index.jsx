import React from "react";
import PropTypes from "prop-types";
import "./style.css";

export default class FormInput extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    children: PropTypes.element
  };
  static defaultProps = {
    type: "text"
  };
  render() {
    return (
      <div className="form-input">
        <label htmlFor={this.props.name}>{this.props.label}</label>
        { this.props.children
          ?  this.props.children
          : <input {...this.props} /> }
      </div>
    );
  }
}
