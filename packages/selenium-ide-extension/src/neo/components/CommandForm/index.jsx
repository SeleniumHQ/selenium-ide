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
import { observer } from 'mobx-react'
import classNames from 'classnames'
import { Commands } from '../../models/Command'
import Input from '../FormInput'
import TextArea from '../FormTextArea'
import CommandInput from '../CommandInput'
import TargetInput from '../TargetInput'
import FlatButton from '../FlatButton'
import InfoBadge from '../InfoBadge'
import { find, select } from '../../IO/SideeX/find-select'
import ModalState from '../../stores/view/ModalState'
import UiState from '../../stores/view/UiState'
import PlaybackState from '../../stores/view/PlaybackState'
import './style.css'

@observer
export default class CommandForm extends React.Component {
  constructor(props) {
    super(props)
    this.handleSelect = this.handleSelect.bind(this)
  }
  static propTypes = {
    command: PropTypes.object,
    isSelecting: PropTypes.bool,
    onSubmit: PropTypes.func,
  }
  getCommandName(command) {
    const commandName = Commands.list.get(command).name
    if (commandName === 'pause' && !UiState.pauseNotificationSent) {
      ModalState.showAlert({
        title: 'Hard coded sleeps are old hat.',
        description:
          'There are implicit waits built into the IDE commands.\n\n' +
          "If that doesn't get the job done for you then check out the explicit wait commands. " +
          'They start with the words `wait for element` (e.g., `wait for element visible`).',
      })
      UiState.pauseNotificationSent = true
    }
    return commandName
  }
  parseCommandName(command) {
    return Commands.list.has(command) ? this.getCommandName(command) : command
  }
  parseCommandTargetType(command) {
    return Commands.list.has(command)
      ? Commands.list.get(command).type
      : undefined
  }
  handleSelect() {
    const type = this.parseCommandTargetType(this.props.command.command)
    if (type) {
      select(type, this.props.command.target)
    }
  }
  render() {
    return (
      <div className="command-form">
        <form
          onSubmit={e => {
            e.preventDefault()
          }}
        >
          <div className="target">
            <CommandInput
              id="command"
              name="command"
              label="Command"
              value={
                this.props.command
                  ? this.parseCommandName(this.props.command.command)
                  : ''
              }
              disabled={!this.props.command || PlaybackState.isPlaying}
              onChange={
                this.props.command ? this.props.command.setCommand : null
              }
            />
            <FlatButton
              data-tip="<p>Enable/Disable command</p>"
              className={classNames(
                'icon',
                this.props.command &&
                this.props.command.command &&
                !this.props.command.enabled
                  ? 'si-remove-comment'
                  : 'si-comment'
              )}
              disabled={
                !this.props.command ||
                (this.props.command && !this.props.command.command) ||
                PlaybackState.isPlaying
              }
              onClick={
                this.props.command ? this.props.command.toggleEnabled : null
              }
            />
            <FlatButton
              data-tip={
                this.props.command && this.props.command.opensWindow
                  ? '<p>Modify new window configuration</p>'
                  : '<p>Add new window configuration</p>'
              }
              className={classNames(
                'new-window-button',
                'icon',
                'si-open-tab',
                {
                  active: this.props.command && this.props.command.opensWindow,
                }
              )}
              disabled={
                !this.props.command ||
                (this.props.command && !this.props.command.command) ||
                PlaybackState.isPlaying
              }
              onClick={() => {
                ModalState.toggleNewWindowConfiguration()
                this.props.command
                  ? this.props.command.toggleOpensWindowRead()
                  : undefined
              }}
            >
              {this.props.command &&
              (this.props.command.opensWindow &&
                !this.props.command.opensWindowRead) ? (
                <InfoBadge />
              ) : (
                undefined
              )}
            </FlatButton>
          </div>
          <div className="target">
            <TargetInput
              id="target"
              name="target"
              label="Target"
              value={this.props.command ? this.props.command.target : ''}
              targets={this.props.command ? this.props.command.targets : []}
              disabled={!this.props.command}
              onChange={
                this.props.command ? this.props.command.setTarget : null
              }
            />
            <FlatButton
              data-tip="<p>Select target in page</p>"
              className={classNames('icon', 'si-select', {
                active: this.props.isSelecting,
              })}
              disabled={
                this.props.command
                  ? !this.parseCommandTargetType(this.props.command.command)
                  : true
              }
              onClick={this.handleSelect}
            />
            <FlatButton
              data-tip="<p>Find target in page</p>"
              className="icon si-search"
              disabled={
                this.props.command
                  ? !this.parseCommandTargetType(this.props.command.command)
                  : true
              }
              onClick={() => {
                find(this.props.command.target)
              }}
            />
          </div>
          <TextArea
            id="value"
            name="value"
            label="Value"
            value={this.props.command ? this.props.command.value : ''}
            disabled={!this.props.command}
            onChange={this.props.command ? this.props.command.setValue : null}
          />
          <Input
            id="comment"
            name="comment"
            label="Description"
            value={this.props.command ? this.props.command.comment : ''}
            disabled={!this.props.command}
            onChange={this.props.command ? this.props.command.setComment : null}
          />
          <input tabIndex="-1" type="submit" onClick={this.props.onSubmit} />
        </form>
      </div>
    )
  }
}
