import React from "react";
import PropTypes from "prop-types";
import uuidv4 from "uuid/v4";
import { supportedFileFormats } from "../../../IO/filesystem";
import "./style.css";

export default class OpenButton extends React.Component {
  constructor(props) {
    super(props);
    this.id = uuidv4();
    this.handleChange = this.handleChange.bind(this);
  }
  handleChange(e) {
    this.props.onFileSelected(e.target.files[0]);
  }
  render() {
    return (
      <span className="file-input">
        <input id={this.id} ref={(input) => { this.input = input; }} type="file" accept={supportedFileFormats} onChange={this.handleChange} />
        <label data-tip="<p>Open project</p>" htmlFor={this.id} onFocus={() => {this.input.focus();}}><i className="btn-action si-open" /></label>
      </span>
    );
  }
  static propTypes = {
    onFileSelected: PropTypes.func.isRequired
  };
}
