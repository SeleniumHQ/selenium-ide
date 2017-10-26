import React from "react";

export default class Checkbox extends React.Component {
  render() {
    return (
      <div>
        <input key="checkbox" type="checkbox" id={this.props.id} name={this.props.name} />
        <label key="label" htmlFor={this.props.id}>{this.props.label}</label>
      </div>
    );
  }
}
