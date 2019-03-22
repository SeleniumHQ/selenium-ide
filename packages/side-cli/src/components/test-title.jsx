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
import { Box, Text, Color } from 'ink'
import { PlaybackStates } from '@seleniumhq/side-runtime'

export default class Playback extends React.Component {
  renderPrefix(state) {
    if (
      state === PlaybackStates.PREPARATION ||
      state === PlaybackStates.PLAYING
    ) {
      return (
        <Color black bgYellow>
          {' '}
          RUNS{' '}
        </Color>
      )
    } else if (state === PlaybackStates.FINISHED) {
      return (
        <Color black bgGreen>
          {' '}
          PASS{' '}
        </Color>
      )
    } else if (
      state === PlaybackStates.FAILED ||
      state === PlaybackStates.ERRORED ||
      state === PlaybackStates.ABORTED
    ) {
      return (
        <Color black bgRed>
          {' '}
          FAIL{' '}
        </Color>
      )
    }
  }
  render() {
    return (
      <Box>
        {this.renderPrefix(this.props.state)}{' '}
        <Text bold>{this.props.name}</Text>
      </Box>
    )
  }
}
