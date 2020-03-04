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

import React from 'react'
import PropTypes from 'prop-types'
import { observe } from 'mobx'
import { observer } from 'mobx-react'
import { PropTypes as MobxPropTypes } from 'mobx-react'
import classNames from 'classnames'
import UiState from '../../stores/view/UiState'
import PlaybackState from '../../stores/view/PlaybackState'
import TestRow from '../TestRow'
import { deriveCommandLevels } from '../../playback/playback-tree/command-leveler'
import './style.css'

@observer
export default class TestTable extends React.Component {
  constructor(props) {
    super(props)
    this.newCommand = {}
    this.detectNewCommand = this.detectNewCommand.bind(this)
    this.disposeNewCommand = this.disposeNewCommand.bind(this)
    this.handleScroll = this.handleScroll.bind(this)
    this.scrollToLastPos = this.scrollToLastPos.bind(this)
    this.newObserverDisposer = observe(
      this.props.commands,
      this.detectNewCommand
    )
    this.selectCommandByRange = this.selectCommandByRange.bind(this)
    this.commandLevels = []
    this.node = null
  }
  static propTypes = {
    commands: MobxPropTypes.arrayOrObservableArray,
    callstackIndex: PropTypes.number,
    selectedCommand: PropTypes.string,
    selectCommand: PropTypes.func,
    addCommand: PropTypes.func,
    removeCommand: PropTypes.func,
    swapCommands: PropTypes.func,
    clearAllCommands: PropTypes.func,
    clearSelectedCommands: PropTypes.func,
    addToSelectedCommands: PropTypes.func,
    selectedCommands: PropTypes.array,
  }
  detectNewCommand(change) {
    this.newCommand = change.added[0]
  }
  disposeNewCommand() {
    this.newCommand = undefined
  }
  scrollToLastPos() {
    if (UiState.selectedTest.test.scrollY) {
      this.node.scrollTop = UiState.selectedTest.test.scrollY
    } else {
      this.node.scrollTop = 0
    }
  }
  componentDidUpdate(prevProps) {
    if (prevProps.commands !== this.props.commands) {
      this.newObserverDisposer()
      if (this.props.commands) {
        this.newObserverDisposer = observe(
          this.props.commands,
          this.detectNewCommand
        )
      }
    }
  }
  handleScroll() {
    UiState.selectedTest.test.scrollY = this.node.scrollTop
  }
  selectCommandByRange(lastCommandSelected) {
    if (this.props.selectedCommands.length > 1) {
      const fromIndex = this.props.selectedCommands[
        this.props.selectedCommands.length - 2
      ].index
      const toIndex = lastCommandSelected.index
      if (fromIndex < toIndex) {
        for (let i = fromIndex; i <= toIndex; i++) {
          UiState.selectCommand(this.props.commands[i], i, {
            isCommandTarget: false,
          })
        }
      } else {
        for (let i = fromIndex; i >= toIndex; i--) {
          UiState.selectCommand(this.props.commands[i], i, {
            isCommandTarget: false,
          })
        }
      }
    }
  }
  render() {
    if (this.props.commands)
      this.commandLevels = deriveCommandLevels(this.props.commands)
    const commandStatePrefix =
      this.props.callstackIndex !== undefined
        ? `${this.props.callstackIndex}:`
        : ''
    return [
      <div key="header" className="test-table test-table-header">
        <table>
          <thead>
            <tr>
              <th>
                <span>Command</span>
              </th>
              <th>Target</th>
              <th>Value</th>
            </tr>
          </thead>
        </table>
      </div>,
      <div
        onScroll={this.handleScroll}
        ref={node => {
          return (this.node = node || this.node)
        }}
        key="body"
        className={classNames(
          'test-table',
          'test-table-body',
          { paused: PlaybackState.paused },
          { 'breakpoints-disabled': PlaybackState.breakpointsDisabled }
        )}
      >
        <table>
          <tbody>
            {this.props.commands
              ? this.props.commands
                  .map((command, index) => (
                    <TestRow
                      key={command.id}
                      status={classNames(
                        PlaybackState.commandState.get(
                          commandStatePrefix + command.id
                        )
                          ? PlaybackState.commandState.get(
                              commandStatePrefix + command.id
                            ).state
                          : ''
                      )}
                      selected={
                        this.props.selectedCommand === command.id ||
                        !!this.props.selectedCommands.find(
                          cmd => cmd.id === command.id
                        )
                      }
                      focus={this.props.selectedCommand === command.id}
                      readOnly={PlaybackState.isPlaying}
                      addToSelectedCommands={this.props.addToSelectedCommands}
                      clearSelectedCommands={this.props.clearSelectedCommands}
                      singleCommandExecutionEnabled={
                        PlaybackState.isSingleCommandExecutionEnabled
                      }
                      index={index}
                      command={command}
                      new={
                        command === this.newCommand
                          ? this.disposeNewCommand
                          : undefined
                      }
                      scrollToLastPos={this.scrollToLastPos}
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
                      selectByRange={this.selectCommandByRange}
                      level={this.commandLevels[index]}
                    />
                  ))
                  .concat(
                    <TestRow
                      key={UiState.displayedTest.id}
                      selected={
                        this.props.selectedCommand ===
                        UiState.pristineCommand.id
                      }
                      focus={
                        this.props.selectedCommand ===
                        UiState.pristineCommand.id
                      }
                      index={this.props.commands.length}
                      command={UiState.pristineCommand}
                      scrollToLastPos={this.scrollToLastPos}
                      isPristine={true}
                      select={this.props.selectCommand}
                      addCommand={this.props.addCommand}
                      moveSelection={UiState.selectCommandByIndex}
                      pasteFromClipboard={UiState.pasteFromClipboard}
                      setSectionFocus={UiState.setSectionFocus}
                      addToSelectedCommands={this.props.addToSelectedCommands}
                      clearSelectedCommands={this.props.clearSelectedCommands}
                      selectByRange={this.selectCommandByRange}
                    />
                  )
              : null}
          </tbody>
        </table>
        <div className="filler" />
      </div>,
    ]
  }
}
