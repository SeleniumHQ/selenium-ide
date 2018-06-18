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
import VariableList from "../../components/VariableList";
import ClearButton from "../../components/ActionButtons/Clear";
import AddButton from "../../components/ActionButtons/Add";
import { output } from "../../stores/view/Logs";
import PlaybackLogger from "../../side-effects/playback-logging";
import "./style.css";
import CommandReference from "../../components/CommandReference";
import variables from "../../stores/view/Variables";

export default class Console extends React.Component {
  constructor(props) {
    super(props);
    this.state = { tab: "Log" };
    this.tabClicked = this.tabClicked.bind(this);

    this.playbackLogger = new PlaybackLogger();
    //this.loggerObserver = observe(logger.logs, () => { setState { //set log state to unread } })
    this.tabChangedHandler = this.tabChangedHandler.bind(this);
  }
  componentWillUnmount() {
    //this.loggerObserver.dispose();
    this.playbackLogger.dispose();
  }
  tabChangedHandler(tab) {
    this.setState({
      tab
    });
  }
  //create different object which stores name and read status (e.g., unread boolean)
  tabClicked(tab) {
    this.setState({
      tab
    });
    this.props.restoreSize();
  }
  render() {
    return (
      <footer className="console" style={{
        height: this.props.height ? `${this.props.height}px` : "initial"
      }}>
        <TabBar tabs={["Log", "Variables", "Reference"]} tabWidth={90} buttonsMargin={0} tabChanged={this.tabChangedHandler} tabClicked={this.tabClicked}>
          {this.state.tab === "Log" && <ClearButton data-tip="<p>Clear log</p>" onClick={output.clearLogs} /> }
          {this.state.tab === "Variables" &&
            <div>
              <AddButton data-tip="<p>Add Variable</p>" onClick={() => variables.setAddingVariable(true)} />
              <ClearButton data-tip="<p>Clear Variable</p>" onClick={variables.clearVariables} />
            </div> }
          {this.state.tab === "Reference" && <ClearButton onClick={output.clearLogs} /> }
        </TabBar>
        {this.state.tab === "Log" && <LogList output={output} /> }
        {this.state.tab === "Variables" && <VariableList variables={variables}/> }
        {this.state.tab === "Reference" && <CommandReference /> }
      </footer>
    );
  }
  static propTypes = {
    height: PropTypes.number,
    restoreSize: PropTypes.func
  };
}
