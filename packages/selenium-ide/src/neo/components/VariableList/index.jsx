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
import PlaybackState from "../../stores/view/PlaybackState";
import "./style.css";

@observer
export default class VariableList extends React.Component {
  constructor(props){
    super(props);
    this.deleteVariable = this.deleteVariable.bind(this);
    this.addVariable = this.addVariable.bind(this);
  }
  deleteVariable(key){
    this.props.variables.deleteVariable(key);
  }
  addVariable(key, value){
    this.props.variables.addVariable(key, value);
  }

  render() {
    const variables = this.props.variables;
    const readOnly = (PlaybackState.isPlaying && !PlaybackState.paused);
    return (
      <form onSubmit={(e) => { e.preventDefault(); }}>
        <ul className="value-list">
          <li className="value-header variable">
            <strong className="name">Name</strong>
            <strong className="value">Value</strong>
            <div className="deleteBtn"/>
          </li>
          {variables.getEntries.map((storedMap) => (
            <Variable
              key={Math.random()}
              keyVar={storedMap[0]}
              value={storedMap[1]}
              add={this.addVariable}
              delete={this.deleteVariable}
              readOnly={readOnly}
              isPristine={false}
            />
          ))
          .concat(
            <Variable
              key={Math.random()}
              add={this.addVariable}
              delete={this.deleteVariable}
              isPristine={true}
              readOnly={readOnly}
          />)}
        </ul>
      </form>
    );
  }
  static propTypes = {
    variables: PropTypes.object
  };
}
