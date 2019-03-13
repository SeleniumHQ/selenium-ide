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
import { mergeEventEmitter } from '../../common/events'
import { createPlaybackTree } from './playback-tree'
import { AssertionError, VerificationError } from './errors'
import Callstack from './callstack'

const EE = Symbol('event-emitter')
const state = Symbol('state')
const DELAY_INTERVAL = 10

export default class Playback {
  constructor({ executor, baseUrl, variables, getTestByName, options }) {
    this.executor = executor
    this.baseUrl = baseUrl
    this.variables = variables
    this.getTestByName = getTestByName
    this.options = Object.assign(
      {
        pauseOnExceptions: false,
        delay: 0,
      },
      options
    )
    this[state] = {}
    this[EE] = new EventEmitter()
    this[EE].emitCommandStateChange = payload => {
      this[state].lastSentCommandState = payload
      this[EE].emit(PlaybackEvents.COMMAND_STATE_CHANGED, payload)
    }
    mergeEventEmitter(this, this[EE])
    this._run = this._run.bind(this)
  }

  async init() {
    await this._prepareToPlay()
    this[state].initialized = true
  }

  async play(test, { pauseImmediately, startingCommandIndex } = {}) {
    this._beforePlay()
    this.playbackTree = createPlaybackTree(test.commands)
    if (startingCommandIndex) {
      this.currentExecutingNode = this.playbackTree.nodes[startingCommandIndex]
    } else {
      this.currentExecutingNode = this.playbackTree.startingCommandNode
    }
    if (!this[state].initialized) await this.init()
    const callstack = new Callstack()
    callstack.call({
      callee: test,
    })
    this[state].callstack = callstack
    if (pauseImmediately) this[state].steps = 0
    return this._play()
  }

  async playTo(test, commandToStop) {
    if (!test.commands.includes(commandToStop)) {
      throw new Error('Command not found in test')
    } else {
      const playToPromise = new Promise((res, rej) => {
        this[state].playTo = {
          command: commandToStop,
          res,
          rej,
        }
      }).finally(() => {
        this[state].playTo = undefined
      })
      const finish = await this.play(test)
      await playToPromise

      return finish
    }
  }

  async playFrom(test, commandToStart) {
    const index = test.commands.indexOf(commandToStart)
    if (index === -1) {
      throw new Error('Command not found in test')
    } else {
      const finish = await this.play(test, { startingCommandIndex: index })

      return finish
    }
  }

  async playSingleCommand(command) {
    this._beforePlay()
    this.playbackTree = createPlaybackTree([command])
    this.currentExecutingNode = this.playbackTree.startingCommandNode
    if (!this[state].initialized) await this.init()
    if (this[state].callstack) {
    } else {
      const callstack = new Callstack()
      callstack.call({
        callee: {
          commands: [command],
        },
      })
      this[state].callstack = callstack
    }
    await this._play()
  }

  async step(steps = 1) {
    if (this[state].resumeResolve) {
      this[state].steps = steps
      const p = new Promise((res, rej) => {
        this[state].stepPromise = { res, rej }
      }).finally(() => {
        this[state].stepPromise = undefined
        this[state].steps = undefined
      })
      this._resume()
      await p
    } else {
      throw new Error("Can't step through a test that isn't paused")
    }
  }

  async pause({ graceful } = { graceful: false }) {
    this[state].pausing = true
    if (!graceful) {
      await this.executor.cancel()
    }
    await new Promise(res => {
      this[state].pausingResolve = res
    })
  }

  resume() {
    this[state].steps = undefined
    this._resume()
  }

  async stop() {
    this._setExitCondition(PlaybackStates.STOPPED)
    this[state].stopping = true

    if (this[state].resumeResolve) {
      const r = this[state].resumeResolve
      this[state].resumeResolve = undefined
      r()
    } else {
      await this.executor.cancel()
    }

    // play will throw but the user will catch it with this.play()
    // this.stop() should resolve once play finishes
    await this[state].playPromise.catch(() => {})
  }

  async abort() {
    this._setExitCondition(PlaybackStates.ABORTED)
    this[state].aborting = true

    if (this[state].resumeResolve) {
      const r = this[state].resumeResolve
      this[state].resumeResolve = undefined
      r()
    }
    // we kill regardless of wether the test is paused to keep the
    // behavior consistent

    await this.executor.kill()

    // play will throw but the user will catch it with this.play()
    // this.abort() should resolve once play finishes
    await this[state].playPromise.catch(() => {})
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

  _beforePlay() {
    if (this[state].isPlaying) {
      throw new Error(
        "Can't start playback while a different playback is running"
      )
    } else {
      this[state].isPlaying = true
    }
  }

  async _play() {
    this[EE].emit(PlaybackEvents.PLAYBACK_STATE_CHANGED, {
      state: PlaybackStates.PLAYING,
    })

    let finishWasCalled = false
    this[state].playPromise = (async () => {
      try {
        await this._executionLoop()
      } catch (err) {
        if (finishWasCalled) {
          throw err
        }
      } finally {
        await this._finishPlaying()
      }
    })()

    return () => {
      finishWasCalled = true
      return this[state].playPromise
    }
  }

  _resume() {
    if (this[state].resumeResolve) {
      const r = this[state].resumeResolve
      this[state].resumeResolve = undefined
      r()
      this[EE].emit(PlaybackEvents.PLAYBACK_STATE_CHANGED, {
        state: PlaybackStates.PLAYING,
      })
    }
  }

  async _executionLoop({ ignoreBreakpoint } = {}) {
    if (!this.currentExecutingNode && this[state].callstack.length > 1) {
      this._unwind()
    }

    if (this.currentExecutingNode) {
      const command = this.currentExecutingNode.command
      const callstackIndex = this[state].callstack.length - 1
      this[EE].emitCommandStateChange({
        id: command.id,
        callstackIndex,
        state: CommandStates.EXECUTING,
        message: undefined,
      })

      if (this[state].stopping) {
        return
      } else if (this[state].pausing) {
        await this._pause()
        return await this._executionLoop({ ignoreBreakpoint: true })
      } else if (this[state].steps !== undefined) {
        if (this[state].steps === 0) {
          this[state].steps = undefined
          if (this[state].stepPromise) {
            this[state].stepPromise.res()
          }
          await this._pause()
          return await this._executionLoop({ ignoreBreakpoint: true })
        }
        this[state].steps--
      }

      if (
        (this.currentExecutingNode.command.isBreakpoint && !ignoreBreakpoint) ||
        (this[state].playTo &&
          this[state].playTo.command === this.currentExecutingNode.command)
      ) {
        await this._break()
        return await this._executionLoop({ ignoreBreakpoint: true })
      }

      try {
        await this._delay()
      } catch (err) {
        if (this[state].stopping) {
          return
        } else if (this[state].pausing) {
          await this._pause()
          return await this._executionLoop({ ignoreBreakpoint: true })
        }
      }

      let result
      try {
        result = await this._executeCommand(this.currentExecutingNode)
      } catch (err) {
        if (err instanceof AssertionError) {
          this[EE].emitCommandStateChange({
            id: command.id,
            callstackIndex,
            state: CommandStates.FAILED,
            message: err.message,
          })
          return await this._handleException(() => {
            this._setExitCondition(PlaybackStates.FAILED)
            throw err
          })
        } else if (err instanceof VerificationError) {
          this[EE].emitCommandStateChange({
            id: command.id,
            callstackIndex,
            state: CommandStates.FAILED,
            message: err.message,
          })
          return await this._handleException(async () => {
            this._setExitCondition(PlaybackStates.FAILED)
            // focibly continuing verify commands
            this.currentExecutingNode = this.currentExecutingNode.next
            return await this._executionLoop()
          })
        } else {
          this[EE].emitCommandStateChange({
            id: command.id,
            callstackIndex,
            state: CommandStates.ERRORED,
            message: err.message,
          })
          return await this._handleException(() => {
            this._setExitCondition(PlaybackStates.ERRORED)
            throw err
          })
        }
      }
      this[EE].emitCommandStateChange({
        id: command.id,
        callstackIndex,
        state: CommandStates.PASSED,
        message: undefined,
      })
      this.currentExecutingNode = result.next

      return await this._executionLoop()
    }
  }

  async _executeCommand(commandNode) {
    const { command } = commandNode
    if (command.command === 'run') {
      await commandNode.execute(this.executor, {
        executorOverride: this._run,
      })

      return {
        next: this.playbackTree.startingCommandNode,
      }
    } else {
      const result = await commandNode.execute(this.executor)

      return result
    }
  }

  async _run(testName) {
    if (!this.getTestByName) {
      throw new Error("'run' command is not supported")
    }
    const test = await this.getTestByName(testName)
    if (!test) {
      throw new Error(`Can't run unknown test: ${testName}`)
    }

    const tree = createPlaybackTree(test.commands)
    this[state].callstack.call({
      callee: test,
      caller: {
        position: this.currentExecutingNode.next,
        tree,
      },
    })
    this[EE].emit(PlaybackEvents.CALL_STACK_CHANGED, {
      change: CallstackChange.CALLED,
      callee: test,
    })
    this.playbackTree = tree
  }

  async _finishPlaying() {
    this[state].playPromise = undefined
    this[state].isPlaying = undefined
    if (
      this[state].lastSentCommandState &&
      this[state].lastSentCommandState.state === CommandStates.EXECUTING
    ) {
      const { id, callstackIndex } = this[state].lastSentCommandState
      this[EE].emitCommandStateChange({
        id,
        callstackIndex,
        state: CommandStates.ERRORED,
        message: 'Playback stopped',
      })
    }
    this[state].lastSentCommandState = undefined
    if (this[state].stepPromise) {
      if (this[state].steps === 0) {
        // the last step is the end of the test
        this[state].stepPromise.res()
      } else {
        this[state].stepPromise.rej(new Error('Playback stopped prematurely'))
      }
      this[state].steps = undefined
    }
    if (this[state].playTo) {
      this[state].playTo.rej(
        new Error(
          "Playback finished before reaching the requested command, check to make sure control flow isn't preventing this"
        )
      )
    }
    this[EE].emit(PlaybackEvents.PLAYBACK_STATE_CHANGED, {
      state: this[state].exitCondition || PlaybackStates.FINISHED,
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
    this[state].pausing = false
    if (this[state].pausingResolve) {
      const r = this[state].pausingResolve
      this[state].pausingResolve = undefined
      r()
    }
    if (
      this.currentExecutingNode &&
      this[state].playTo &&
      this.currentExecutingNode.command === this[state].playTo.command
    ) {
      this[state].playTo.res()
    }

    await new Promise(res => {
      this[state].resumeResolve = res
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

  async _delay() {
    if (this.options.delay)
      return new Promise((res, rej) => {
        const start = new Date()
        const interval = setInterval(() => {
          if (
            this[state].pausing ||
            this[state].stopping ||
            this[state].aborting
          ) {
            rej(
              new Error('delay cancelled due to playback being stopped/paused')
            )
            clearInterval(interval)
          } else if (new Date() - start > this.options.delay) {
            res()
            clearInterval(interval)
          }
        }, DELAY_INTERVAL)
      })
  }

  _unwind() {
    const { callee, caller } = this[state].callstack.unwind()
    this[EE].emit(PlaybackEvents.CALL_STACK_CHANGED, {
      change: CallstackChange.UNWINDED,
      callee,
      caller: this[state].callstack.top().callee,
    })
    this.playbackTree = caller.tree
    this.currentExecutingNode = caller.position
  }

  _setExitCondition(condition) {
    if (!this[state].exitCondition) {
      this[state].exitCondition = condition
    } else if (
      PlaybackStatesPriorities[condition] >
      PlaybackStatesPriorities[this[state].exitCondition]
    ) {
      this[state].exitCondition = condition
    }
  }
}

export const PlaybackEvents = {
  COMMAND_STATE_CHANGED: 'command-state-changed',
  PLAYBACK_STATE_CHANGED: 'playback-state-changed',
  CALL_STACK_CHANGED: 'call-stack-changed',
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
  EXECUTING: 'executing',
  PENDING: 'pending',
  PASSED: 'passed',
  UNDETERMINED: 'undetermined',
  FAILED: 'failed',
  ERRORED: 'errored',
}

export const CallstackChange = {
  CALLED: 'called',
  UNWINDED: 'unwinded',
}
