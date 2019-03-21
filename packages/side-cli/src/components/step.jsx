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
import { Box, Color } from 'ink'
import { CommandStates } from '@seleniumhq/side-runtime'

export default class Step extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }
  parseColorForState(state) {
    return {
      [STATE_TO_COLOR[state]]: true,
    }
  }
  render() {
    const style = this.props.result
      ? this.parseColorForState(this.props.result.state)
      : {}
    return (
      <Box>
        <Color {...style}>
          {this.props.command.command} | {this.props.command.target} |{' '}
          {this.props.command.value}
        </Color>
      </Box>
    )
  }
}

const STATE_TO_COLOR = {
  [CommandStates.EXECUTING]: 'yellow',
  [CommandStates.PENDING]: 'yellow',
  [CommandStates.PASSED]: 'green',
  [CommandStates.UNDETERMINED]: 'orange',
  [CommandStates.FAILED]: 'red',
  [CommandStates.ERRORED]: 'red',
}
