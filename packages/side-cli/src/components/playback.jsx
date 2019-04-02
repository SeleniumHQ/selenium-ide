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

import util from 'util'
import React from 'react'
import TestSelector from './test-selector'
import TestTitle from './test-title'
import TestResults from './test-results'
import Logs from './log'
import { PlaybackEvents } from '@seleniumhq/side-runtime'

export default class Playback extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      results: {},
      logs: [],
    }
    const _cons = console
    global.console = {
      log: i => {
        this.setState({
          logs: [...this.state.logs, util.format(i)],
        })
      },
      error: _cons.error,
    }
    this.props.playback.on(
      PlaybackEvents.COMMAND_STATE_CHANGED,
      ({ id, _callstackIndex, state, message }) => {
        this.setState({
          results: { ...this.state.results, [id]: { state, message } },
        })
      }
    )
    this.props.playback.on(
      PlaybackEvents.PLAYBACK_STATE_CHANGED,
      ({ state }) => {
        this.setState({
          testState: state,
        })
      }
    )
    this.handleTestSelected = this.handleTestSelected.bind(this)
  }
  async handleTestSelected(test) {
    this.setState({ test })
    try {
      await (await this.props.playback.play(test))()
    } catch (err) {
      // eslint-disable-next-line
      console.error(err)
      process.exitCode = 1
    } finally {
      await this.props.playback.cleanup()
    }
  }
  render() {
    return this.state.test ? (
      <>
        <TestTitle name={this.state.test.name} state={this.state.testState} />
        <TestResults
          commands={this.state.test.commands}
          results={this.state.results}
        />
        <Logs>{this.state.logs}</Logs>
      </>
    ) : (
      <TestSelector
        tests={this.props.project.tests}
        onTestSelected={this.handleTestSelected}
      />
    )
  }
}
