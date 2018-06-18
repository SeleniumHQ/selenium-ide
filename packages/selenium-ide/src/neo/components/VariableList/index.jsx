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
    this.editVariable = this.editVariable.bind(this);
  }
  editVariable(key, value){
    this.props.variables.addVariable(key, value);
  }

  render() {
    const variables = this.props.variables;
    return (
      <div className="storeContainer">
        <div className="variables" >
          <div className="value-header">
            <div className="value">values</div>
            <div className="remarks"></div>
          </div>

          <div className="value-list">
            {variables.storedVars.keys().sort().map((storedKey) => (
              <Variable
                key={storedKey}
                keyVar={storedKey}
                value={variables.storedVars.get(storedKey)}
                edit={this.editVariable}
                delete={variables.deleteVariable}
              />
            )).concat(
              <Variable
                key="adding"
                delete={variables.deleteVariable}
                add={variables.addVariable}
                isAdding={variables.addingVariable}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
  static propTypes = {
    variables: PropTypes.object
  };
}
