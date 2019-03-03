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

import EventEmitter from 'events'
import { createPlaybackTree } from './playback-tree'
import { mergeEventEmitter } from '../../common/events'
import { AssertionError, VerificationError } from './errors'

const EE = Symbol('event-emitter')

export default class Playback {
  constructor({ executor, testId, baseUrl, variables }) {
    this.executor = executor
    this.testId = testId
    this.baseUrl = baseUrl
    this.variables = variables
    this[EE] = new EventEmitter()
    mergeEventEmitter(this, this[EE])
  }

  async init() {
    await this._prepareToPlay()
    this._initialized = true
  }

  async play(commands) {
    this.playbackTree = createPlaybackTree(commands)
    this.currentExecutingNode = this.playbackTree.startingCommandNode
    if (!this._initialized) await this.init()
    await this._play()
  }

  async playSingleCommand() {}

  async pause() {}

  async resume() {}

  async stop() {
    this._setExitCondition(PlaybackStates.STOPPED)
    this._stopping = true
    await this.executor.cancel()

    // play will throw but the user will catch it with this.play()
    // this.stop() should resolve once play finishes
    await this._playPromise.catch(() => {})
  }

  async abort() {
    this._setExitCondition(PlaybackStates.ABORTED)
    await this.executor.kill()

    // play will throw but the user will catch it with this.play()
    // this.abort() should resolve once play finishes
    await this._playPromise.catch(() => {})
  }

  async cleanup() {
    await this.executor.cleanup()
  }

  async _prepareToPlay() {
    this[EE].emit(PlaybackEvents.PLAYBACK_STATE_CHANGED, {
      state: PlaybackStates.PREPARATION,
    })
    await this.executor.init({
      baseUrl: this.baseUrl,
      variables: this.variables,
    })
  }

  async _play() {
    this[EE].emit(PlaybackEvents.PLAYBACK_STATE_CHANGED, {
      state: PlaybackStates.PLAYING,
    })
    this._playPromise = (async () => {
      try {
        await this._executionLoop()
      } catch (err) {
        throw err
      } finally {
        await this._finishPlaying()
      }
    })()

    await this._playPromise
  }

  async _executionLoop() {
    if (this._stopping) {
      return
    } else if (this.currentExecutingNode) {
      const command = this.currentExecutingNode.command
      this[EE].emit(PlaybackEvents.COMMAND_STATE_CHANGED, {
        id: command.id,
        callstackIndex: undefined,
        state: CommandStates.Pending,
        message: undefined,
      })
      let result
      try {
        result = await this._executeCommand(this.currentExecutingNode)
      } catch (err) {
        if (err instanceof AssertionError) {
          this[EE].emit(PlaybackEvents.COMMAND_STATE_CHANGED, {
            id: command.id,
            callstackIndex: undefined,
            state: CommandStates.Failed,
            message: err.message,
          })
          this._setExitCondition(PlaybackStates.FAILED)
          throw err
        } else if (err instanceof VerificationError) {
          this[EE].emit(PlaybackEvents.COMMAND_STATE_CHANGED, {
            id: command.id,
            callstackIndex: undefined,
            state: CommandStates.Failed,
            message: err.message,
          })
          this._setExitCondition(PlaybackStates.FAILED)
          // focibly continuing verify commands
          this.currentExecutingNode = this.currentExecutingNode.next
          return await this._executionLoop()
        } else {
          this[EE].emit(PlaybackEvents.COMMAND_STATE_CHANGED, {
            id: command.id,
            callstackIndex: undefined,
            state: CommandStates.Fatal,
            message: err.message,
          })
          this._setExitCondition(PlaybackStates.ERRORED)
          throw err
        }
      }
      this[EE].emit(PlaybackEvents.COMMAND_STATE_CHANGED, {
        id: command.id,
        callstackIndex: undefined,
        state: CommandStates.Passed,
        message: undefined,
      })
      this.currentExecutingNode = result.next

      return await this._executionLoop()
    }
  }

  async _executeCommand(commandNode) {
    const result = await commandNode.execute(this.executor)

    return result
  }

  async _finishPlaying() {
    this[EE].emit(PlaybackEvents.PLAYBACK_STATE_CHANGED, {
      state: this._exitCondition || PlaybackStates.FINISHED,
    })
  }

  _setExitCondition(condition) {
    if (!this._exitCondition) {
      this._exitCondition = condition
    } else if (
      PlaybackStatesPriorities[condition] >
      PlaybackStatesPriorities[this._exitCondition]
    ) {
      this._exitCondition = condition
    }
  }
}

export const PlaybackEvents = {
  COMMAND_STATE_CHANGED: 'command-state-changed',
  PLAYBACK_STATE_CHANGED: 'playback-state-changed',
}

export const PlaybackStates = {
  PREPARATION: 'prep',
  PLAYING: 'playing',
  FINISHED: 'finished',
  FAILED: 'failed',
  ERRORED: 'errored',
  PAUSED: 'paused',
  BREAKPOINT: 'breakpoint',
  STOPPED: 'stopped',
  ABORTED: 'aborted',
}

const PlaybackStatesPriorities = {
  [PlaybackStates.FINISHED]: 0,
  [PlaybackStates.FAILED]: 1,
  [PlaybackStates.ERRORED]: 2,
  [PlaybackStates.STOPPED]: 3,
  [PlaybackStates.ABORTED]: 4,
}

export const CommandStates = {
  Failed: 'failed',
  Fatal: 'fatal',
  Passed: 'passed',
  Pending: 'pending',
  Undetermined: 'undetermined',
  Awaiting: 'awaiting',
}
