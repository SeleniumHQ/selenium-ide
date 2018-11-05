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
import './style.css'
import classNames from 'classnames'

@observer
export default class CommandReference extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    currentCommand: PropTypes.object,
  }
  unknownCommand() {
    return (
      <div className={classNames('command-reference', 'unknown-command')}>
        <strong>Unknown command name provided.</strong>
      </div>
    )
  }
  argument(param) {
    if (param.name !== '' || param.description !== '') {
      return (
        <li className="argument">
          {param.name} - {param.description}
        </li>
      )
    }
  }
  commandSignature() {
    return (
      <li className="signature">
        {this.props.currentCommand.name && (
          <strong className="name">{this.props.currentCommand.name}</strong>
        )}{' '}
        {this.props.currentCommand.target && (
          <em className="target">{this.props.currentCommand.target.name}</em>
        )}
        {this.props.currentCommand.value && (
          <em className="value">, {this.props.currentCommand.value.name}</em>
        )}
      </li>
    )
  }
  render() {
    if (!(this.props.currentCommand && this.props.currentCommand.name)) {
      return this.unknownCommand()
    } else {
      return (
        <div className="command-reference">
          <ul>
            {this.props.currentCommand.name && this.commandSignature()}
            {this.props.currentCommand.description && (
              <li className="description">
                {this.props.currentCommand.description}
              </li>
            )}
            {(this.props.currentCommand.target ||
              this.props.currentCommand.value) && (
              <li className="arguments">arguments:</li>
            )}
            {this.props.currentCommand.target &&
              this.argument(this.props.currentCommand.target)}
            {this.props.currentCommand.value &&
              this.argument(this.props.currentCommand.value)}
          </ul>
        </div>
      )
    }
  }
}
