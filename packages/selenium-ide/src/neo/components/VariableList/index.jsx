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
import Variable from "../Variable";
import { observer } from "mobx-react";
import "./style.css";

@observer
export default class VariableList extends React.Component {
  constructor(props){
    super(props);
    this.deleteVariable = this.deleteVariable.bind(this);
    this.addVariable = this.addVariable.bind(this);
    this._OnSubmit = this._OnSubmit.bind(this);
  }
  deleteVariable(key){
    this.props.variables.deleteVariable(key);
  }
  addVariable(key, value){
    this.props.variables.addVariable(key, value);
  }
  _OnSubmit(e) {
    e.preventDefault();
    // This set focus at deleteBtn for calling onBlur event that is to save value.
    e.target[e.target.length - 1].focus();
  }
  render() {
    const variables = this.props.variables;
    const pristineID = Math.random();
    return (
      <form onSubmit={this._OnSubmit}>
        <ul className="value-list">
          <li className="value-header variable">
            <strong className="name">Name</strong>
            <strong className="value">Value</strong>
            <div className="deleteBtn"/>
          </li>
          {variables.getEntries.map((storedMap) => (
            <Variable
              key={storedMap}
              keyVar={storedMap[0]}
              value={storedMap[1]}
              add={this.addVariable}
              delete={this.deleteVariable}
              readOnly={this.props.readOnly}
              isPristine={false}
            />
          )).concat(
            <Variable
              key={pristineID}
              add={this.addVariable}
              delete={this.deleteVariable}
              isPristine={true}
              readOnly={this.props.readOnly}
            />)}
          <input tabIndex="-1" type="submit"/>
        </ul>
      </form>
    );
  }
  static propTypes = {
    variables: PropTypes.object
  };
}
