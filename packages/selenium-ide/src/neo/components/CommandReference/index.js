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
  unknownCommand(props) {
    return (
      <div
        className={classNames('command-reference', 'unknown-command')}
        {...props}
      >
        <strong>Unknown command name provided.</strong>
      </div>
    )
  }
  linkForArgument(param) {
    return `https://www.seleniumhq.org/selenium-ide/docs/en/api/arguments/#${param.name
      .replace(/ /g, '')
      .toLowerCase()}`
  }
  argument(param) {
    if (param.name !== '' || param.description !== '') {
      return (
        <li className="argument">
          {!this.props.currentCommand.plugin ? (
            <a
              href={this.linkForArgument(param)}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#3a709e',
              }}
            >
              {param.name}
            </a>
          ) : (
            param.name
          )}{' '}
          - {param.description}
        </li>
      )
    }
  }
  commandSignature() {
    return (
      <li className="signature">
        {this.props.currentCommand.name &&
          (!this.props.currentCommand.plugin ? (
            <a
              className="link"
              href={`https://www.seleniumhq.org/selenium-ide/docs/en/api/commands/#${this.props.currentCommand.name
                .replace(/ /g, '-')
                .toLowerCase()}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <strong className="name">{this.props.currentCommand.name}</strong>
            </a>
          ) : (
            <strong className="name">{this.props.currentCommand.name}</strong>
          ))}{' '}
        {this.props.currentCommand.target &&
          (!this.props.currentCommand.plugin ? (
            <a
              className="link"
              href={this.linkForArgument(this.props.currentCommand.target)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <em className="target">
                {this.props.currentCommand.target.name}
              </em>
            </a>
          ) : (
            <em className="target">{this.props.currentCommand.target.name}</em>
          ))}
        {this.props.currentCommand.value && (
          <React.Fragment>
            <span>, </span>
            {!this.props.currentCommand.plugin ? (
              <a
                className="link"
                href={this.linkForArgument(this.props.currentCommand.value)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <em className="value">
                  {this.props.currentCommand.value.name}
                </em>
              </a>
            ) : (
              <em className="value">{this.props.currentCommand.value.name}</em>
            )}
          </React.Fragment>
        )}
      </li>
    )
  }
  render() {
    var props = { ...this.props }
    delete props.currentCommand
    if (!(this.props.currentCommand && this.props.currentCommand.name)) {
      return this.unknownCommand(props)
    } else {
      return (
        <div className="command-reference" {...props}>
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
