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
import DeleteButton from "../ActionButtons/Delete";
import { observer } from "mobx-react";
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
    this.state = { key: "", value: "" };
  }
  componentDidMount() {
    if (this.input)
      this.input.focus();
  }
  handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      const isValidKey = this.state.key || this.props.keyVar;
      const isValidValue = this.state.value || this.props.value;
      if (isValidKey && isValidValue) {
        this.edit(isValidKey, isValidValue);
      }
    }
  }
  handleChanged() {
    const isValidKey = this.state.key || this.props.keyVar;
    const isValidValue = this.state.value || this.props.value;
    if (isValidKey && isValidValue) {
      this.edit(isValidKey, isValidValue);
    } else if (!(isValidKey || isValidValue)) {
      this.props.setIsAdding(false);
    }
  }
  delete() {
    this.props.delete(this.props.keyVar);
  }
  edit(key, value){
    this.delete();
    this.props.add(key, value);
  }
  keyChanged(e) {
    this.setState({ key: e.target.value });
  }
  valueChanged(e) {
    this.setState({ value: e.target.value });
  }
  render() {
    return (
      <li className="variable">
        {this.props.isAdding ?
          <input
            ref={(input) => { this.input = input; }}
            className="name isAdding"
            onChange={this.keyChanged}
            onKeyDown={this.handleKeyDown}
            onBlur={this.handleChanged}/>
          :
          <input
            className={classNames("name", { "editable": this.props.isStop })}
            disabled={this.props.isStop ? false : true}
            onChange={this.keyChanged}
            value={this.state.key || this.props.keyVar}
            onKeyDown={this.handleKeyDown}
            onBlur={this.handleChanged}/>}
        {this.props.isAdding ?
          <input
            className="value isAdding"
            onChange={this.valueChanged}
            onKeyDown={this.handleKeyDown}
            onBlur={this.handleChanged} />
          :
          <input
            className={classNames("value", { "editable": this.props.isStop })}
            disabled={this.props.isStop ? false : true}
            onChange={this.valueChanged}
            value={this.state.value || this.props.value}
            onKeyDown={this.handleKeyDown}
            onBlur={this.handleChanged} />}
        <DeleteButton className="deleteBtn" data-place="left" onClick={this.delete} disabled={!this.props.isStop}/>
      </li>
    );
  }
  static propTypes = {
    keyVar: PropTypes.string,
    value: PropTypes.string,
    delete: PropTypes.func,
    add: PropTypes.func,
    isAdding: PropTypes.bool,
    isStop: PropTypes.bool,
    setIsAdding: PropTypes.func
  };
}
