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
import ActionButton from '../ActionButton'
import { parse } from 'modifier-keys'
import './style.css'

export default class Record extends React.Component {
  static propTypes = {
    isRecording: PropTypes.bool,
    disabled: PropTypes.bool,
    onClick: PropTypes.func,
  }
  render() {
    return (
      <div
        className="record"
        data-tip={
          this.props.isRecording
            ? `<p>Stop recording <span style="color: #929292;padding-left: 5px;">${parse(
                'u',
                { primaryKey: true }
              )}</span></p>`
            : `<p>Start recording <span style="color: #929292;padding-left: 5px;">${parse(
                'u',
                { primaryKey: true }
              )}</span></p>`
        }
      >
        <ActionButton
          disabled={this.props.disabled}
          isActive={this.props.isRecording}
          onClick={this.props.onClick}
          className="si-record"
        />
      </div>
    )
  }
}
