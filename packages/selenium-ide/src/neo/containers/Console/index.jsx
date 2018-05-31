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
import TabBar from "../../components/TabBar";
import LogList from "../../components/LogList";
import StoredVarList from "../../components/StoredVarList";
import ClearButton from "../../components/ActionButtons/Clear";
import LogStore from "../../stores/view/Logs";
import "./style.css";

export default class Console extends React.Component {
  constructor(props) {
    super(props);
    this.state={ activeIndex: 0 };
    this.store = new LogStore();
    this.handleTabChanged = this.handleTabChanged.bind(this);
  }
  componentWillUnmount() {
    this.store.dispose();
  }
  handleTabChanged(tab, index){
    this.setState({activeIndex: index});
  }
  render() {
    const consoleBox =[
      <LogList store={this.store} />
      ,
      <StoredVarList />
    ];
    return (
      <footer className="console" style={{
        height: this.props.height ? `${this.props.height}px` : "initial"
      }}>
        <TabBar tabs={["Log", "Stored-Vars"]} tabWidth={100} buttonsMargin={0} tabChanged={this.handleTabChanged}>
          <ClearButton onClick={this.store.clearLogs} />
        </TabBar>
        {consoleBox[this.state.activeIndex]}
      </footer>
    );
  }
  static propTypes = {
    height: PropTypes.number
  };
}
