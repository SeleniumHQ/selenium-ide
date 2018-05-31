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
import { observer } from "mobx-react";
import { getStoredVars, setStoredVar } from "../../IO/SideeX/formatCommand";
import StoredVar from "../StoredVar";
import "./style.css";

@observer
export default class StoredVarList extends React.Component {
  constructor(props){
    super(props);
    this.editStoredVar = this.editStoredVar.bind(this);
  }
  editStoredVar(key, value){
    setStoredVar(key, value);
  }
  render() {
    const storedVars = getStoredVars();
    return (
      <div className="storeContainer">
        <div className="storedVars" >
          <div className="valHeader">
            <div className="head index">No.</div>
            <div className="head value">values</div>
            <div className="head valEdit"></div>
          </div>

          <div className="valList">
            {Object.keys(storedVars).map((storedKey, index) => (
              <StoredVar
                key={storedKey}
                index={index+1}
                keyVar={storedKey}
                value={storedVars[storedKey]}
                edit={this.editStoredVar}/>
            ))}
          </div>
        </div>
      </div>
    );
  }
  static propTypes = {
  };
}
