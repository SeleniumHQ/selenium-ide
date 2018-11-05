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
import './style.css'

export default class SearchBar extends React.Component {
  constructor(props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
  }
  static propTypes = {
    value: PropTypes.string,
    filter: PropTypes.func,
    inputRef: PropTypes.func,
  }
  handleChange(e) {
    if (this.props.filter) this.props.filter(e.target.value)
  }
  render() {
    return (
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexShrink: '0',
        }}
      >
        <input
          ref={this.props.inputRef}
          className="search"
          type="search"
          placeholder="Search tests..."
          value={this.props.value}
          onChange={this.handleChange}
        />
        <label
          htmlFor={this.id}
          className="si-search"
          style={{
            display: !this.props.value ? 'block' : 'none',
          }}
        />
      </div>
    )
  }
}
