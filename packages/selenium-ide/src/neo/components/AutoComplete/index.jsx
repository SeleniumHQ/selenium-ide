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
import Autocomplete from 'react-autocomplete'
import uuidv4 from 'uuid/v4'

export default class AutoComplete extends React.Component {
  constructor(props) {
    super(props)
    this.id = uuidv4()
  }
  static propTypes = {
    getItemKey: PropTypes.func,
    renderDefaultStyledItem: PropTypes.func,
  }
  render() {
    return (
      <Autocomplete
        getItemValue={item => item}
        renderInput={props => (
          <span
            style={{
              display: 'block',
              position: 'relative',
            }}
          >
            <input
              id={this.id}
              {...props}
              style={{
                width: '100%',
                paddingRight: '22px',
                boxSizing: 'border-box',
              }}
            />
            <label
              htmlFor={this.id}
              className="si-caret-wide"
              style={{
                position: 'absolute',
                top: '0',
                bottom: '0',
                right: '5px',
                margin: 'auto 0',
                fontSize: '16px',
                height: '16px',
                color: '#a3a3a3',
                cursor: 'pointer',
              }}
            />
          </span>
        )}
        renderItem={(item, isHighlighted) => (
          <div
            key={this.props.getItemKey ? this.props.getItemKey(item) : item}
            style={{
              background: isHighlighted ? '#f3f3f3' : 'white',
              padding: '8px',
            }}
          >
            {this.props.renderDefaultStyledItem
              ? this.props.renderDefaultStyledItem(item, isHighlighted)
              : item}
          </div>
        )}
        menuStyle={{
          zIndex: 5,
          borderRadius: '3px',
          border: '1px solid #DEDEDE',
          boxShadow: '0 0 3px 0 rgba(0,0,0,0.3)',
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '2px 0',
          fontSize: '90%',
          position: 'fixed',
          overflow: 'auto',
          maxHeight: '30%',
          boxSizing: 'border-box',
        }}
        {...this.props}
      />
    )
  }
}
