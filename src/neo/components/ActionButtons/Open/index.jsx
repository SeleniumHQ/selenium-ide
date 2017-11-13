import React from "react";
import uuidv4 from "uuid/v4";
import "./style.css";

export default class OpenButton extends React.Component {
  constructor(props) {
    super(props);
    this.id = uuidv4();
  }
  render() {
    return (
      <span className="file-input">
        <input id={this.id} type="file" accept="application/json, text/html" />
        <label htmlFor={this.id}><i className="btn-action si-open" /></label>
      </span>
    );
  }
}
