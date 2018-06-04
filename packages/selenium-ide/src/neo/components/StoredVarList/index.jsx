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
import StoredVar, { StoredVarAddBtn } from "../StoredVar";
import { getStoredVars, setStoredVar, deleteStoredVar } from "../../IO/SideeX/formatCommand";
import "./style.css";

export default class StoredVarList extends React.Component {
  constructor(props){
    super(props);
    this.state = { add:false };
    this.editStoredVar = this.editStoredVar.bind(this);
    this.deleteStoredVar = this.deleteStoredVar.bind(this);
    this.addStoredVar = this.addStoredVar.bind(this);
    this.refresh = this.refresh.bind(this);
  }
  editStoredVar(key, value){
    setStoredVar(key, value);
    this.setState({ add : false });
  }
  deleteStoredVar(key){
    deleteStoredVar(key);
    this.setState({ add : false });
  }
  addStoredVar(key, value){
    setStoredVar(key, value);
    this.setState({ add : false });
  }
  refresh(){
    this.setState({ add : false });
    this.props.refresh();
  }
  add(){
    this.setState({ add : true });
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
                edit={this.editStoredVar}
                delete={this.deleteStoredVar}
                refresh={this.refresh}
                />
            ))}
            {this.state.add ?
              <StoredVar
                delete={this.deleteStoredVar}
                add={this.addStoredVar}
                refresh={this.refresh}
                />
                : <StoredVarAddBtn add={this.add.bind(this)}/>}
          </div>
        </div>

      </div>
    );
  }
  static propTypes = {
  };
}
