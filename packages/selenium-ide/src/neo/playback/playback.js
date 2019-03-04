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
  constructor({ executor, testId, baseUrl, variables, options }) {
    this.executor = executor
    this.testId = testId
    this.baseUrl = baseUrl
    this.variables = variables
    this.options = options || {
      pauseOnExceptions: false,
    }
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

  async pause({ graceful } = { graceful: false }) {
    this._pausing = true
    if (!graceful) {
      await this.executor.cancel()
    }
  }

  resume() {
    if (this._resume) {
      const r = this._resume
      this._resume = undefined
      r()
      this[EE].emit(PlaybackEvents.PLAYBACK_STATE_CHANGED, {
        state: PlaybackStates.PLAYING,
      })
    }
  }

  async stop() {
    this._setExitCondition(PlaybackStates.STOPPED)
    this._stopping = true

    if (this._resume) {
      const r = this._resume
      this._resume = undefined
      r()
    } else {
      await this.executor.cancel()
    }

    // play will throw but the user will catch it with this.play()
    // this.stop() should resolve once play finishes
    await this._playPromise.catch(() => {})
  }

  async abort() {
    this._setExitCondition(PlaybackStates.ABORTED)

    if (this._resume) {
      const r = this._resume
      this._resume = undefined
      r()
    }
    // we kill regardless of wether the test is paused to keep the
    // behavior consistent

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

  async _executionLoop({ ignoreBreakpoint } = {}) {
    if (this._stopping) {
      return
    } else if (this._pausing) {
      await this._pause()
      return await this._executionLoop({ ignoreBreakpoint: true })
    } else if (this.currentExecutingNode) {
      if (this.currentExecutingNode.command.isBreakpoint && !ignoreBreakpoint) {
        await this._break()
        return await this._executionLoop({ ignoreBreakpoint: true })
      }
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
          return await this._handleException(() => {
            this._setExitCondition(PlaybackStates.FAILED)
            throw err
          })
        } else if (err instanceof VerificationError) {
          this[EE].emit(PlaybackEvents.COMMAND_STATE_CHANGED, {
            id: command.id,
            callstackIndex: undefined,
            state: CommandStates.Failed,
            message: err.message,
          })
          return await this._handleException(async () => {
            this._setExitCondition(PlaybackStates.FAILED)
            // focibly continuing verify commands
            this.currentExecutingNode = this.currentExecutingNode.next
            return await this._executionLoop()
          })
        } else {
          this[EE].emit(PlaybackEvents.COMMAND_STATE_CHANGED, {
            id: command.id,
            callstackIndex: undefined,
            state: CommandStates.Fatal,
            message: err.message,
          })
          return await this._handleException(() => {
            this._setExitCondition(PlaybackStates.ERRORED)
            throw err
          })
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

  async _pause() {
    this[EE].emit(PlaybackEvents.PLAYBACK_STATE_CHANGED, {
      state: PlaybackStates.PAUSED,
    })
    await this.__pause()
  }

  async _break() {
    this[EE].emit(PlaybackEvents.PLAYBACK_STATE_CHANGED, {
      state: PlaybackStates.BREAKPOINT,
    })
    await this.__pause()
  }

  async __pause() {
    // internal method to handle either breaking or pausing
    this._pausing = false

    await new Promise(res => {
      this._resume = res
    })
  }

  async _handleException(unhandledBahaviorFn) {
    if (!this.options.pauseOnExceptions) {
      return await unhandledBahaviorFn()
    } else {
      await this._break()
      return await this._executionLoop({ ignoreBreakpoint: true })
    }
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
