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
import Variable, { VariableAddBtn } from "../Variable";
import { observer } from "mobx-react";
import "./style.css";

@observer
export default class VariableList extends React.Component {
  constructor(props){
    super(props);
    this.state = { addingVariable: false };
    this.editVariable = this.editVariable.bind(this);
    this.deleteVariable = this.deleteVariable.bind(this);
    this.addVariable = this.addVariable.bind(this);
  }
  editVariable(key, value){
    this.setState({ addingVariable: false });
    this.props.variables.addVariable(key, value);
  }
  deleteVariable(key){
    this.setState({ addingVariable: false });
    this.props.variables.deleteVariable(key);
  }
  addVariable(key, value){
    this.setState({ addingVariable: false });
    this.props.variables.addVariable(key, value);
  }
  add(){
    this.setState({ addingVariable: true });
  }
  render() {
    const stored = this.props.variables.storedVars;
    return (
      <div className="storeContainer">
        <div className="variables" >
          <div className="value-header">
            <div className="index">No.</div>
            <div className="value">values</div>
            <div className="remarks"></div>
          </div>

          <div className="value-list">
            {stored.keys().map((storedKey, index) => (
              <Variable
                key={storedKey}
                index={index + 1}
                keyVar={storedKey}
                value={stored.get(storedKey)}
                edit={this.editVariable}
                delete={this.deleteVariable}
              />
            ))}
            {this.state.addingVariable ?
              <Variable
                delete={this.deleteVariable}
                add={this.addVariable}
              />
              : <VariableAddBtn add={this.add.bind(this)}/>}
          </div>
        </div>

      </div>
    );
  }
  static propTypes = {
    variables: PropTypes.object
  };
}
