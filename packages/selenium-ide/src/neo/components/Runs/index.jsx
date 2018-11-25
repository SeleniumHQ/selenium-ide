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
import Progress from '../Progress'
import PlaybackState from '../../stores/view/PlaybackState'
import './style.css'

export default class Runs extends React.Component {
  static propTypes = {
    runs: PropTypes.number,
    failures: PropTypes.number,
    hasError: PropTypes.bool,
    progress: PropTypes.number,
    totalProgress: PropTypes.number,
  }
  static defaultProps = {
    runs: 0,
    failures: 0,
  }
  Progress() {
    if (PlaybackState.isSilent) {
      ;<Progress hasError={this.props.hasError} />
    } else {
      return (
        <Progress
          hasError={this.props.hasError}
          progress={this.props.progress}
          totalProgress={this.props.totalProgress}
        />
      )
    }
  }
  render() {
    return (
      <div className="runs">
        <Progress />
        <div className="status">
          <span>Runs: {PlaybackState.isSilent ? 0 : this.props.runs}</span>
          <span>
            Failures:{' '}
            <span className={classNames({ failed: this.props.failures })}>
              {this.props.failures}
            </span>
          </span>
        </div>
      </div>
    )
  }
}
