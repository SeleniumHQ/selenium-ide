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
import ContentEditable from "react-contenteditable";
import DeleteButton from "../ActionButtons/Delete";
import AddButton from "../../components/ActionButtons/Add";
import { observer } from "mobx-react";
import "./style.css";

@observer
export default class Variable extends React.Component {
  constructor(props){
    super(props);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.keyChanged = this.keyChanged.bind(this);
    this.valueChanged = this.valueChanged.bind(this);
    this.state = { key: "", value: "" };
  }
  handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      if(this.state.key && this.state.value){
        this.props.add(this.state.key, this.state.value);
      }
    }
  }
  handleChange(e) {
    this.delete();
    this.props.edit(this.state.key || this.props.keyVar, this.state.value ||this.props.value);
  }
  delete(){
    this.props.delete(this.props.keyVar);
  }
  keyChanged(e) {
    this.setState({ key: e.target.value });
  }
  valueChanged(e) {
    this.setState({ value: e.target.value });
  }
  render() {
    return (
      <div className="row" style={{display:this.props.keyVar ? "table-row" : "none"}}>
        <div className="cell storedKey">
          <ContentEditable className="editable" onChange={this.keyChanged} html={this.props.keyVar} onKeyDown={this.handleKeyDown} onBlur={this.handleChange}/>
        </div>
        <div className="cell col">{this.props.keyVar ? ":" : null}</div>
        <div className="cell variable">
            <ContentEditable className="editable" onChange={this.valueChanged} html={this.props.value} onKeyDown={this.handleKeyDown} onBlur={this.handleChange} />
        </div>
        <div className="cell del">
          {this.props.isAdding ? null : <DeleteButton className="deleteBtn" data-place="left" onClick={this.delete.bind(this)} />}
        </div>
      </div>
    );
  }
  static propTypes = {
    keyVar: PropTypes.string,
    value: PropTypes.string,
    edit: PropTypes.func,
    delete: PropTypes.func,
    add: PropTypes.func,
    adding: PropTypes.bool
  };
}
