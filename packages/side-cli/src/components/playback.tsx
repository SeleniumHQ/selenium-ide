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
import util from 'util'
import TestSelector from './test-selector'
import TestTitle from './test-title'
import TestResults from './test-results'
import Logs from './log'
import {
  Playback,
  PlaybackEvents,
  PlaybackEventShapes,
} from '@seleniumhq/side-runtime'
import { ProjectShape, TestShape } from '@seleniumhq/side-model'

export interface PlaybackProps {
  playback: Playback
  project: ProjectShape
}

export interface PlaybackState {
  results: Record<string, any>
  logs: string[]
  test?: TestShape
  testState?: PlaybackEventShapes['PLAYBACK_STATE_CHANGED']['state']
}

const PlaybackComponent: React.FC<PlaybackProps> = ({ playback, project }) => {
  const [state, _setState] = React.useState<PlaybackState>({
    results: {},
    logs: [],
  })
  const setState = (newState: Partial<PlaybackState>) =>
    _setState({
      ...state,
      ...newState,
    })

  React.useEffect(() => {
    const _cons = console
    // @ts-expect-error
    global.console = {
      log: (i) => {
        setState({
          logs: state.logs.concat(util.format(i)),
        })
      },
      error: _cons.error,
    }
    playback['event-emitter'].on(
      PlaybackEvents.COMMAND_STATE_CHANGED,
      ({ id, state, message }) => {
        setState({
          results: { ...state.results, [id]: { state, message } },
        })
      }
    )
    playback['event-emitter'].on(
      PlaybackEvents.PLAYBACK_STATE_CHANGED,
      ({ state }: PlaybackEventShapes['PLAYBACK_STATE_CHANGED']) => {
        setState({
          testState: state,
        })
      }
    )
  }, [])

  const handleTestSelected = async (test: TestShape) => {
    setState({ test })
    try {
      await (
        await playback.play(test)
      )()
    } catch (err) {
      // eslint-disable-next-line
      console.error(err)
      process.exitCode = 1
    } finally {
      await playback.cleanup()
    }
  }

  return state.test ? (
    <>
      <TestTitle name={state.test.name} state={state.testState} />
      <TestResults commands={state.test.commands} results={state.results} />
      <Logs logs={state.logs} />
    </>
  ) : (
    <TestSelector tests={project.tests} onTestSelected={handleTestSelected} />
  )
}

export default PlaybackComponent
