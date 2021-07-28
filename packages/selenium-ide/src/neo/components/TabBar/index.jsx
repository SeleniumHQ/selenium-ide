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
    var defaultIndex = props.defaultTab
      ? props.tabs.indexOf(props.defaultTab)
      : 0
    this.state = {
      activeTab: {
        tab: props.defaultTab || props.tabs[defaultIndex],
        index: defaultIndex,
      },
    }
    this.tabRefs = this.props.tabs.map(() => React.createRef())
    this.focusIndex = defaultIndex
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
      this.focusIndex = index
      if (this.props.tabChanged) this.props.tabChanged(tab)
    }
    if (this.props.tabClicked) this.props.tabClicked(tab)
  }
  handleKeyDown(event) {
    var delta = 0
    if (event.keyCode === 39) {
      delta = 1
    } else if (event.keyCode === 37) {
      delta = -1
    }
    if (delta !== 0) {
      // We need focus index a separate index variable to achieve circular focus order, otherwise next focus will not go beyond +1/-1 index of active Tab position.
      this.focusIndex =
        (this.focusIndex + delta + this.props.tabs.length) %
        this.props.tabs.length
      this.tabRefs[this.focusIndex].current.focus()
    }
  }
  render() {
    return (
      <div className="tabbar" onKeyDown={this.handleKeyDown.bind(this)}>
        <ul role="tablist">
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
                role="tab"
                aria-controls={tab.name}
                aria-selected={this.state.activeTab.index === index}
                tabIndex={this.state.activeTab.index === index ? 0 : -1}
                ref={this.tabRefs[index]}
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
