import React from "react";
import PropTypes from "prop-types";
import uuidv4 from "uuid/v4";
import "./style.css";

export default class Checkbox extends React.Component {
  constructor(props) {
    super(props);
    this.id = uuidv4();
  }
  static propTypes = {
    name: PropTypes.string,
    label: PropTypes.string,
    checked: PropTypes.bool,
    onChange: PropTypes.func.isRequired
  };
  render() {
    const checked = (this.props.checked || (this.props.hasOwnProperty("checked") && this.props.checked !== false));
    return (
      <div className="control">
        <input
          key="checkbox"
          type="checkbox"
          className="checkbox"
          id={this.id}
          name={this.props.name}
          checked={checked}
          onChange={this.props.onChange}
        />
        <label key="label" htmlFor={this.id}><span>{checked ? "✓" : ""}</span>{this.props.label}</label>
      </div>
    );
  }
}
