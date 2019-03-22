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

export default class TabBar extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      activeTab: props.defaultTab
        ? {
            tab: props.defaultTab,
            index: props.tabs.indexOf(props.defaultTab),
          }
        : {
            tab: props.tabs[0],
            index: 0,
          },
    }
  }
  static propTypes = {
    children: PropTypes.node,
    tabs: PropTypes.array.isRequired,
    defaultTab: PropTypes.string,
    tabWidth: PropTypes.number,
    buttonsMargin: PropTypes.number,
    tabChanged: PropTypes.func,
    tabClicked: PropTypes.func,
  }
  static defaultProps = {
    tabWidth: 80,
    buttonsMargin: 5,
  }
  handleClick(tab, index) {
    if (tab !== this.state.activeTab.tab) {
      this.setState({
        activeTab: { tab, index },
      })
      if (this.props.tabChanged) this.props.tabChanged(tab)
    }
    if (this.props.tabClicked) this.props.tabClicked(tab)
  }
  render() {
    return (
      <div className="tabbar">
        <ul>
          {this.props.tabs.map((tab, index) => (
            <li
              key={tab.name}
              style={{
                width: `${this.props.tabWidth}px`,
              }}
            >
              <a
                className={classNames(tab.name.toLowerCase(), {
                  unread: tab.unread,
                })}
                href="#"
                onClick={this.handleClick.bind(this, tab.name, index)}
              >
                {tab.name}
              </a>
            </li>
          ))}
          {this.props.children ? (
            <li
              className="buttons"
              style={{
                marginRight: `${this.props.buttonsMargin}px`,
              }}
            >
              {this.props.children}
            </li>
          ) : null}
        </ul>
        <div
          className="underline"
          style={{
            transform: `translateX(${this.state.activeTab.index *
              this.props.tabWidth}px)`,
            width: `${this.props.tabWidth}px`,
          }}
        />
      </div>
    )
  }
}
