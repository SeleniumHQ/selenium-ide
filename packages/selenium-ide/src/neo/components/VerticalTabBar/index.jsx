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
import { parse } from 'modifier-keys'
import ListMenu, { ListMenuItem } from '../ListMenu'
import { MenuDirections } from '../Menu'
import './style.css'

export default class VerticalTabBar extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      activeTab: props.defaultTab
        ? {
            tab: props.defaultTab,
          }
        : {
            tab: props.tabs[0],
          },
    }
  }
  static propTypes = {
    children: PropTypes.node,
    tabs: PropTypes.array.isRequired,
    tab: PropTypes.string,
    defaultTab: PropTypes.string,
    buttonsMargin: PropTypes.number,
    tabChanged: PropTypes.func,
  }
  static defaultProps = {
    buttonsMargin: 5,
  }
  handleClick(tab) {
    if (tab !== (this.props.tab || this.state.activeTab.tab)) {
      this.setState({
        activeTab: { tab },
      })
      if (this.props.tabChanged) this.props.tabChanged(tab)
    }
  }
  render() {
    return (
      <div className="tabbar vertical">
        <div>
          <ListMenu
            direction={MenuDirections.Bottom}
            width={165}
            padding={5}
            opener={
              <VerticalTabBarItem focusable={true}>
                <span>{this.props.tab || this.state.activeTab.tab}</span>
              </VerticalTabBarItem>
            }
          >
            {this.props.tabs.map((tab, i) => (
              <ListMenuItem
                key={tab}
                label={parse(`${i + 1}`, { primaryKey: true })}
                onClick={this.handleClick.bind(this, tab)}
              >
                {tab}
              </ListMenuItem>
            ))}
          </ListMenu>
          {this.props.children ? (
            <span
              className="buttons"
              style={{
                marginRight: `${this.props.buttonsMargin}px`,
              }}
            >
              {this.props.children}
            </span>
          ) : null}
        </div>
      </div>
    )
  }
}

export class VerticalTabBarItem extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    focusable: PropTypes.bool,
    onClick: PropTypes.func,
    onKeyDown: PropTypes.func,
  }
  render() {
    return (
      <a
        href="#"
        tabIndex={this.props.focusable ? '0' : '-1'}
        onClick={this.props.onClick}
      >
        {this.props.children}
      </a>
    )
  }
}
