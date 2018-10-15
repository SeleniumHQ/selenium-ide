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
import classNames from "classnames";
import { observer } from "mobx-react";
import DeleteButton from "../ActionButtons/Delete";
import Input from "../FormInput";
import "./style.css";

@observer
export default class Variable extends React.Component {
  constructor(props){
    super(props);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleChanged = this.handleChanged.bind(this);
    this.keyChanged = this.keyChanged.bind(this);
    this.valueChanged = this.valueChanged.bind(this);
    this.delete = this.delete.bind(this);
    this.edit = this.edit.bind(this);
    this.state = { key: this.props.keyVar || "", value: this.props.value || ""};
  }

  handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      const validKey = this.state.key;
      if (validKey) {
        this.edit(validKey, this.state.value);
      }
    }
  }
  handleChanged() {
    const validKey = this.state.key;
    if (validKey) {
      this.edit(validKey, this.state.value);
    }
  }
  delete() {
    this.props.delete(this.props.keyVar);
  }
  edit(key, value){
    this.delete();
    this.props.add(key, value);
  }
  keyChanged(key) {
    this.setState({ key: key });
  }
  valueChanged(value) {
    this.setState({ value: value });
  }
  render() {
    return (
      <li className="variable">
        <Input
          name={classNames("name", { "editable": !this.props.readOnly }, {"isAdding": this.props.isPristine })}
          label=""
          width={0}
          disabled={this.props.readOnly ? true : false}
          onChange={this.keyChanged}
          value={this.state.key}
          onKeyDown={this.handleKeyDown}
          onBlur={this.handleChanged}/>
        <Input
          name={classNames("value", { "editable": !this.props.readOnly }, {"isAdding": this.props.isPristine })}
          label=""
          width={0}
          disabled={this.props.readOnly ? true : false}
          onChange={this.valueChanged}
          value={this.state.value}
          onKeyDown={this.handleKeyDown}
          onBlur={this.handleChanged} />
        { this.props.isPristine ? null : <DeleteButton className="deleteBtn" data-place="left" onClick={this.delete} disabled={this.props.readOnly}/> }
      </li>
    );
  }
  static propTypes = {
    keyVar: PropTypes.string,
    value: PropTypes.string,
    delete: PropTypes.func,
    add: PropTypes.func,
    isPristine: PropTypes.bool,
    readOnly: PropTypes.bool
  };
}
