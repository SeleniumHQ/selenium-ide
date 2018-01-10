// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

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
