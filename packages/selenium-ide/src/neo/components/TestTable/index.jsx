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
import { PropTypes as MobxPropTypes } from "mobx-react";
import classNames from "classnames";
import UiState from "../../stores/view/UiState";
import PlaybackState from "../../stores/view/PlaybackState";
import TestRow from "../TestRow";
import "./style.css";

@observer
export default class TestTable extends React.Component {
  static propTypes = {
    commands: MobxPropTypes.arrayOrObservableArray,
    selectedCommand: PropTypes.string,
    selectCommand: PropTypes.func,
    addCommand: PropTypes.func,
    removeCommand: PropTypes.func,
    swapCommands: PropTypes.func,
    clearAllCommands: PropTypes.func
  };
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
                id={command.id}
                className={classNames(PlaybackState.commandState.get(command.id) ? PlaybackState.commandState.get(command.id).state : "")}
                selected={this.props.selectedCommand === command.id}
                index={index}
                command={command.command}
                target={command.target}
                value={command.value}
                dragInProgress={UiState.dragInProgress}
                onClick={this.props.selectCommand ? () => { this.props.selectCommand(command); } : null}
                startPlayingHere={() => { PlaybackState.startPlaying(command); }}
                executeCommand={() => { PlaybackState.playCommand(command); }}
                moveSelectionUp={() => { UiState.selectCommandByIndex(index - 1); }}
                moveSelectionDown={() => { UiState.selectCommandByIndex(index + 1); }}
                addCommand={this.props.addCommand ? (command) => { this.props.addCommand(index, command); } : null}
                insertCommand={this.props.addCommand ? (command) => { this.props.selectCommand(this.props.addCommand(index, command)); } : null}
                remove={this.props.removeCommand ? () => { this.props.removeCommand(index, command); } : null}
                swapCommands={this.props.swapCommands}
                setDrag={UiState.setDrag}
                clipboard={UiState.clipboard}
                copyToClipboard={() => { UiState.copyToClipboard(command); }}
                clearAllCommands={this.props.clearAllCommands}
                setSectionFocus={UiState.setSectionFocus}
              />
            )).concat(
              <TestRow
                id={UiState.pristineCommand.id}
                key={UiState.selectedTest.test.id}
                selected={this.props.selectedCommand === UiState.pristineCommand.id}
                command={UiState.pristineCommand.command}
                target={UiState.pristineCommand.target}
                value={UiState.pristineCommand.value}
                onClick={() => (this.props.selectCommand(UiState.pristineCommand))}
                addCommand={this.props.addCommand ? (command) => { this.props.addCommand(this.props.commands.length, command); } : null}
                moveSelectionUp={() => { UiState.selectCommandByIndex(this.props.commands.length - 1); }}
                clipboard={UiState.clipboard}
                setSectionFocus={UiState.setSectionFocus}
              />) : null }
          </tbody>
        </table>
      </div>
    ]);
  }
}
