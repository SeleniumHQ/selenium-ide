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

import browser from 'webextension-polyfill'
import React from 'react'
import PropTypes from 'prop-types'
import Menu from '../Menu'
import './style.css'

export default class ListMenu extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    opener: PropTypes.element,
    width: PropTypes.number,
    padding: PropTypes.number,
    direction: PropTypes.string,
  }
  render() {
    return (
      <Menu
        opener={this.props.opener}
        width={this.props.width}
        padding={this.props.padding}
        direction={this.props.direction}
      >
        <ul className="buttons">{this.props.children}</ul>
      </Menu>
    )
  }
}

export class ListMenuItem extends React.Component {
  constructor(props) {
    super(props)
    this.openLink = this.openLink.bind(this)
  }
  static propTypes = {
    children: PropTypes.node,
    label: PropTypes.string,
    href: PropTypes.string,
    onClick: PropTypes.func,
  }
  openLink() {
    if (this.props.href) {
      browser.tabs.create({ url: this.props.href })
    }
  }
  render() {
    return (
      <li>
        <a onClick={this.props.href ? this.openLink : this.props.onClick}>
          {this.props.children}
          {this.props.label ? (
            <span className="label">{this.props.label}</span>
          ) : null}
        </a>
      </li>
    )
  }
}

export const ListMenuSeparator = () => (
  <li>
    <hr />
  </li>
)
