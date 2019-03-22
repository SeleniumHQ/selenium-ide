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
import classNames from 'classnames'
import './style.css'

export default class Callstack extends React.Component {
  static propTypes = {
    stack: PropTypes.object.isRequired,
    selectedIndex: PropTypes.number,
    isExecuting: PropTypes.bool,
    onClick: PropTypes.func,
  }
  handleClick(index, e, ...args) {
    if (this.props.onClick) {
      this.props.onClick(index, e, ...args)
    }
  }
  render() {
    return this.props.stack.map(({ callee }, index) => (
      <StackItem
        key={callee.id}
        index={index}
        selected={index === this.props.selectedIndex}
        isExecuting={
          this.props.isExecuting && index === this.props.stack.length - 1
        }
        onClick={this.handleClick.bind(this, index)}
      >
        {callee.name}
      </StackItem>
    ))
  }
}

class StackItem extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    index: PropTypes.number.isRequired,
    selected: PropTypes.bool,
    isExecuting: PropTypes.bool,
    onClick: PropTypes.func.isRequired,
  }
  render() {
    return (
      <a
        className={classNames(
          'stack-item',
          { selected: this.props.selected },
          { executing: this.props.isExecuting }
        )}
        onClick={this.props.onClick}
        style={{
          paddingLeft: `${this.props.index * 5 + 13}px`,
        }}
      >
        <span className={'si-step-into'} />
        {this.props.children}
      </a>
    )
  }
}
