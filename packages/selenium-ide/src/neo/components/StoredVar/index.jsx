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
import "./style.css";

export default class StoredVar extends React.Component {
  constructor(props){
    super(props);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.keyChanged = this.keyChanged.bind(this);
    this.valueChanged = this.valueChanged.bind(this);
    this.saveValue = { key:"", value:"" };
  }
  handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      if(this.saveValue.key && this.saveValue.value){
        this.props.add(this.saveValue.key, this.saveValue.value);
      }
    }
  }
  handleChange(e) {
    this.props.edit(this.props.keyVar, e.target.value);
  }
  delete(){
    this.props.delete(this.props.keyVar);
  }
  keyChanged(e) {
    this.saveValue.key = e.target.value;
  }
  valueChanged(e) {
    this.saveValue.value = e.target.value;
  }
  render() {
    return (
      <div className="row">
        <div className="cell index">{this.props.index} {this.props.add ? "" : "."}</div>
        <div className="cell storedKey">{this.props.add ? <input type="text" onKeyDown={this.handleKeyDown} onChange={this.keyChanged} className="adding"/> : this.props.keyVar}</div>
        <div className="cell col">:</div>
        <div className="cell storedVar">
          {this.props.add ? <input type="text" className="adding" onKeyDown={this.handleKeyDown} onChange={this.valueChanged}/> :
          <ContentEditable className="value" onChange={this.handleChange} html={this.props.value} />}
        </div>
        <div className="cell valDel">
          <DeleteButton className="deleteBtn" data-place="left" onClick={this.delete.bind(this)} />
        </div>
      </div>
    );
  }
  static propTypes = {
    isEditing: PropTypes.bool,
    index: PropTypes.number,
    keyVar: PropTypes.string,
    value: PropTypes.string,
    edit: PropTypes.func
  };
}

export class StoredVarAddBtn extends React.Component {
  render() {
    return (
      <div className="row">
        <div className="cell index"></div>
        <div className="cell add"><AddButton onClick={this.props.add}/></div>
        <div className="cell storedVar"></div>
      </div>
    );
  }
}
