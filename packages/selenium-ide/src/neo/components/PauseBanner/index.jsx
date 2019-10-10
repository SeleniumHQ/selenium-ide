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
import { observer } from 'mobx-react'
import PlaybackState from '../../stores/view/PlaybackState'
import './style.css'
import UiState from '../../stores/view/UiState'
import Manager from '../../../plugin/manager'

@observer
export default class PauseBanner extends React.Component {
  render() {
    if (PlaybackState.isPlaying && PlaybackState.paused) {
      return (
        <div className="state-banner background-pause">
          <div className="state-toolbar">
            <span>Paused in debugger</span>
          </div>
        </div>
      )
    } else if (UiState.isControlled) {
      return (
        <div className="state-banner background-controlled">
          <div className="state-toolbar">
            <span>Controlled by {Manager.controller.name} </span>
          </div>
        </div>
      )
    } else return <div />
  }
}
