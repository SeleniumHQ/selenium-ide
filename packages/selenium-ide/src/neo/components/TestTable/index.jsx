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
import { observe } from "mobx";
import { observer } from "mobx-react";
import { PropTypes as MobxPropTypes } from "mobx-react";
import classNames from "classnames";
import UiState from "../../stores/view/UiState";
import PlaybackState from "../../stores/view/PlaybackState";
import TestRow from "../TestRow";
import "./style.css";

@observer
export default class TestTable extends React.Component {
  constructor(props){
    super(props);
    this.newCommand = {};
    this.detectNewCommand = this.detectNewCommand.bind(this);
    this.disposeNewCommand = this.disposeNewCommand.bind(this);
    this.newObserverDisposer = observe(this.props.commands, this.detectNewCommand);
  }
  static propTypes = {
    commands: MobxPropTypes.arrayOrObservableArray,
    selectedCommand: PropTypes.string,
    selectCommand: PropTypes.func,
    addCommand: PropTypes.func,
    removeCommand: PropTypes.func,
    swapCommands: PropTypes.func,
    clearAllCommands: PropTypes.func,
    clearSelectedCommands: PropTypes.func,
    addSelectedCommands: PropTypes.func,
    selectAllCommands: PropTypes.func,
    selectedCommands: PropTypes.object
  };
  detectNewCommand(change) {
    this.newCommand = change.added[0];
  }
  disposeNewCommand() {
    this.newCommand = undefined;
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.commands !== this.props.commands) {
      this.newObserverDisposer();
      if (nextProps.commands) {
        this.newObserverDisposer = observe(nextProps.commands, this.detectNewCommand);
      }
    }
  }
  render() {
    return ([
      <div key="header" className="test-table test-table-header">
        <table>
          <thead>
            <tr>
              <th><span>Command</span></th>
              <th>Target</th>
              <th>Value</th>
            </tr>
          </thead>
        </table>
      </div>,
      <div key="body" className="test-table test-table-body">
        <table>
          <tbody>
            { this.props.commands ? this.props.commands.map((command, index) => (
              <TestRow
                key={command.id}
                status={classNames(PlaybackState.commandState.get(command.id) ? PlaybackState.commandState.get(command.id).state : "")}
                selected={this.props.selectedCommand === command.id || !!this.props.selectedCommands.find((Lcommand) => (Lcommand.id === command.id))}
                addSelectedCommands={this.props.addSelectedCommands}
                clearSelectedCommands={this.props.clearSelectedCommands}
                index={index}
                command={command}
                new={command === this.newCommand ? this.disposeNewCommand : undefined}
                isPristine={false}
                select={this.props.selectCommand}
                startPlayingHere={PlaybackState.startPlaying}
                executeCommand={PlaybackState.playCommand}
                moveSelection={UiState.selectCommandByIndex}
                addCommand={this.props.addCommand}
                remove={this.props.removeCommand}
                swapCommands={this.props.swapCommands}
                copyToClipboard={UiState.copyToClipboard}
                pasteFromClipboard={UiState.pasteFromClipboard}
                clearAllCommands={this.props.clearAllCommands}
                setSectionFocus={UiState.setSectionFocus}
                selectAll={this.props.selectAllCommands}
              />
            )).concat(
              <TestRow
                key={UiState.selectedTest.test.id}
                selected={this.props.selectedCommand === UiState.pristineCommand.id}
                index={this.props.commands.length}
                command={UiState.pristineCommand}
                isPristine={true}
                select={this.props.selectCommand}
                addCommand={this.props.addCommand}
                moveSelection={UiState.selectCommandByIndex}
                pasteFromClipboard={UiState.pasteFromClipboard}
                setSectionFocus={UiState.setSectionFocus}
                addSelectedCommands={this.props.addSelectedCommands}
                clearSelectedCommands={this.props.clearSelectedCommands}
                selectAll={this.props.selectAllCommands}
              />) : null }
          </tbody>
        </table>
        <div className="filler"></div>
      </div>
    ]);
  }
}
