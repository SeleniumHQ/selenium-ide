import React from "react";
import PropTypes from "prop-types";

export default class Checkbox extends React.Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    label: PropTypes.string,
    checked: PropTypes.bool,
    onChange: PropTypes.func.isRequired
  };
  render() {
    return (
      <div>
        <input
          key="checkbox"
          type="checkbox"
          id={this.props.id}
          name={this.props.name}
          checked={(this.props.checked || (this.props.hasOwnProperty("checked") && this.props.checked !== false))}
          onChange={this.props.onChange}
        />
        <label key="label" htmlFor={this.props.id}>{this.props.label}</label>
      </div>
    );
  }
}
