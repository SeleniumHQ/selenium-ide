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
import { events, Fn } from '@seleniumhq/side-commons'
import { createPlaybackTree, PlaybackTree } from './playback-tree'
import { AssertionError, VerificationError } from './errors'
import Callstack, { Caller } from './callstack'
import Variables from './variables'
import { WebDriverExecutor } from '.'
import { CommandShape, TestShape } from '@seleniumhq/side-model'
import { CommandNode, CommandType } from './playback-tree/command-node'
import { interpolateString } from './preprocessors'

const EE = 'event-emitter'
const state = 'state'
const DELAY_INTERVAL = 10

export interface PlaybackConstructorArgs {
  baseUrl: string
  executor: WebDriverExecutor
  getTestByName: (name: string) => TestShape
  logger: Console
  options?: Partial<PlaybackConstructorOptions>
  variables: Variables
}
export interface PlaybackConstructorOptions {
  pauseOnExceptions: boolean
  ignoreBreakpoints: boolean
  delay: number
}

export interface ExtendedEventEmitter extends EventEmitter {
  emitCommandStateChange: (
    state: PlaybackEventShapes['COMMAND_STATE_CHANGED']
  ) => void
  emitControlFlowChange: (
    state: PlaybackEventShapes['CONTROL_FLOW_CHANGED']
  ) => void
}

export type RunningPromise = Promise<any>
export type VaguePromise = (v?: unknown) => void
export type VaguePromiseWrapper = {
  res: VaguePromise
  rej: VaguePromise
}

export interface PlayOptions {
  pauseImmediately?: boolean
  startingCommandIndex?: number
}

export type PlayTo = VaguePromiseWrapper & { command: string }

export default class Playback {
  constructor({
    baseUrl,
    executor,
    getTestByName,
    logger,
    options = {},
    variables,
  }: PlaybackConstructorArgs) {
    this.baseUrl = baseUrl
    this.executor = executor
    this.getTestByName = getTestByName
    this.logger = logger
    this.options = Object.assign(
      {
        pauseOnExceptions: false,
        ignoreBreakpoints: false,
        delay: 0,
      },
      options
    )
    this.variables = variables || new Variables()
    this[state] = {
      aborting: false,
      initialized: false,
      isPlaying: false,
      pausing: false,
      stopping: false,
    }
    // @ts-expect-error
    this[EE] = new EventEmitter()
    this[EE].emitCommandStateChange = (payload) => {
      this[state].lastSentCommandState = payload
      this[EE].emit(PlaybackEvents.COMMAND_STATE_CHANGED, {
        ...payload,
        testID: this[state].testID,
      })
    }
    this[EE].emitControlFlowChange = (payload) => {
      this[EE].emit(PlaybackEvents.CONTROL_FLOW_CHANGED, payload)
    }
    events.mergeEventEmitter(this, this[EE])
    this._run = this._run.bind(this)
  }
  baseUrl: string
  executor: WebDriverExecutor
  getTestByName: PlaybackConstructorArgs['getTestByName']
  logger: Console
  options: PlaybackConstructorOptions
  variables: Variables;
  [state]: {
    aborting: boolean
    callstack?: Callstack
    exitCondition?: keyof typeof PlaybackStatesPriorities
    initialized: boolean
    isPlaying: boolean
    lastSentCommandState?: PlaybackEventShapes['COMMAND_STATE_CHANGED']
    pausing: boolean
    pausingResolve?: (v?: unknown) => void
    playPromise?: RunningPromise
    playTo?: PlayTo
    resumeResolve?: VaguePromise
    steps?: number
    stepPromise?: VaguePromiseWrapper
    stopping: boolean
    testID?: string
  };
  [EE]: ExtendedEventEmitter
  initialized?: boolean
  commands?: CommandShape[]
  playbackTree?: PlaybackTree
  currentExecutingNode?: CommandNode

  async init() {
    await this.executor.init({
      baseUrl: this.baseUrl,
      logger: this.logger,
      variables: this.variables,
    })
    this[state].initialized = true
  }

  async play(
    test: TestShape,
    { pauseImmediately, startingCommandIndex }: PlayOptions = {}
  ) {
    this[state].testID = test.id
    await this._prepareToPlay()
    this.commands = test.commands
    this.playbackTree = createPlaybackTree(test.commands, {
      emitControlFlowChange: this[EE].emitControlFlowChange.bind(this),
    })
    if (startingCommandIndex) {
      this.currentExecutingNode = this.playbackTree.nodes[startingCommandIndex]
    } else {
      this.currentExecutingNode = this.playbackTree.startingCommandNode
    }
    if (!this[state].initialized) await this.init()
    await this._beforePlay()
    const callstack = new Callstack()
    callstack.call({
      callee: test,
    })
    this[state].callstack = callstack
    if (pauseImmediately) this[state].steps = 0
    return this._play()
  }

  async playTo(test: TestShape, stopIndex: number, startIndex: number) {
    if (!test.commands[stopIndex]) {
      throw new Error('Command not found in test')
    } else if (startIndex && !test.commands[startIndex]) {
      throw new Error('Command to start from not found in test')
    } else {
      this[state].testID = test.id
      const playToPromise = new Promise((res, rej) => {
        this[state].playTo = {
          command: test.commands[stopIndex].id,
          res,
          rej,
        }
      }).finally(() => {
        this[state].playTo = undefined
      })
      const finish = await this.play(test, { startingCommandIndex: startIndex })
      await playToPromise

      return finish
    }
  }

  async playFrom(test: TestShape, commandToStart: CommandShape) {
    this[state].testID = test.id
    const index = test.commands.indexOf(commandToStart)
    if (index === -1) {
      throw new Error('Command not found in test')
    } else {
      return await this.play(test, { startingCommandIndex: index })
    }
  }

  async playSingleCommand(command: CommandShape) {
    await this._prepareToPlay()
    if (!this[state].initialized) await this.init()
    if (this[state].callstack) {
      if (!this[state].resumeResolve) {
        throw new Error("Can't play a command while playback is running")
      }

      this[EE].emit(PlaybackEvents.PLAYBACK_STATE_CHANGED, {
        state: PlaybackStates.PLAYING,
      })

      try {
        await this._playSingleCommand(command)
      } finally {
        this[EE].emit(PlaybackEvents.PLAYBACK_STATE_CHANGED, {
          state: PlaybackStates.BREAKPOINT,
        })
      }
    } else {
      await this._beforePlay()
      this.playbackTree = createPlaybackTree([command], {
        emitControlFlowChange: this[EE].emitControlFlowChange.bind(this),
      })
      this.currentExecutingNode = this.playbackTree.startingCommandNode
      const callstack = new Callstack()
      callstack.call({
        callee: {
          id: '1',
          name: `Single command ${command.command} ${command.target} ${command.value}`,
          commands: [command],
        },
      })
      this[state].callstack = callstack
      const running = await this._play()
      await running()
    }
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

  resume() {
    this[state].steps = undefined
    this._resume()
  }

  async stop() {
    this._setExitCondition(PlaybackStates.STOPPED)
    this[state].stopping = true

    if (this[state].resumeResolve) {
      const r = this[state].resumeResolve as VaguePromise
      this[state].resumeResolve = undefined
      r()
    } else {
      await this.executor.cancel()
    }

    // play will throw but the user will catch it with this.play()
    // this.stop() should resolve once play finishes
    await this[state].playPromise
  }

  async abort() {
    this._setExitCondition(PlaybackStates.ABORTED)
    this[state].aborting = true

    if (this[state].resumeResolve) {
      const r = this[state].resumeResolve as VaguePromise
      this[state].resumeResolve = undefined
      r()
    }
    // we kill regardless of wether the test is paused to keep the
    // behavior consistent

    await this.executor.cancel()

    // play will throw but the user will catch it with this.play()
    // this.abort() should resolve once play finishes
    try {
      await this[state].playPromise
    } catch (err) {
      // ignore
    }
  }

  async cleanup(persistSession = false) {
    // await this.abort()
    this[EE].removeAllListeners()
    await this.executor.cleanup(persistSession)
  }

  async _prepareToPlay() {
    this[EE].emit(PlaybackEvents.PLAYBACK_STATE_CHANGED, {
      state: PlaybackStates.PREPARATION,
      testID: this[state].testID,
    })
  }

  async _beforePlay() {
    if (this[state].isPlaying) {
      throw new Error(
        "Can't start playback while a different playback is running"
      )
    } else {
      await this.executor.executeHook('onBeforePlay', {
        driver: this.executor,
      })
      this[state].isPlaying = true
    }
  }

  async _play() {
    this[EE].emit(PlaybackEvents.PLAYBACK_STATE_CHANGED, {
      state: PlaybackStates.PLAYING,
      testID: this[state].testID,
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
      const r = this[state].resumeResolve as VaguePromise
      this[state].resumeResolve = undefined
      r()
      this[EE].emit(PlaybackEvents.PLAYBACK_STATE_CHANGED, {
        state: PlaybackStates.PLAYING,
        testID: this[state].testID,
      })
    }
  }

  async _executionLoop(
    { ignoreBreakpoint }: { ignoreBreakpoint: boolean } = {
      ignoreBreakpoint: false,
    }
  ): Promise<void> {
    if (
      !this.currentExecutingNode &&
      (this[state]?.callstack?.length ?? 0) > 1
    ) {
      this._unwind()
    }
    if (this.currentExecutingNode) {
      const command = this.currentExecutingNode.command
      const callstackIndex = (this[state].callstack as Callstack).length - 1
      this[EE].emitCommandStateChange({
        id: command.id,
        callstackIndex,
        command,
        state: CommandStates.EXECUTING,
      })

      const steps = this[state].steps
      if (this[state].stopping) {
        return
      } else if (this[state].pausing) {
        await this._pause()
        return await this._executionLoop({ ignoreBreakpoint: true })
      } else if (steps !== undefined) {
        if (steps === 0) {
          this[state].steps = undefined
          const stepPromise = this[state].stepPromise
          if (stepPromise) {
            stepPromise.res()
          }
          await this._pause()
          return await this._executionLoop({ ignoreBreakpoint: true })
        }
        this[state].steps = steps - 1
      }

      const playTo = this[state].playTo
      if (
        (this.currentExecutingNode.command.isBreakpoint &&
          !ignoreBreakpoint &&
          !this.options.ignoreBreakpoints) ||
        playTo?.command === this.currentExecutingNode.command.id
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
        // console.error('Execute error', err)
        if (err instanceof AssertionError) {
          this[EE].emitCommandStateChange({
            id: command.id,
            callstackIndex,
            command,
            state: CommandStates.FAILED,
            message: err.message,
            error: err as Error,
          })
          return await this._handleException(() => {
            this._setExitCondition(PlaybackStates.FAILED)
            throw err
          })
        } else if (err instanceof VerificationError) {
          this[EE].emitCommandStateChange({
            id: command.id,
            callstackIndex,
            command,
            state: CommandStates.FAILED,
            message: err.message,
            error: err as Error,
          })
          return await this._handleException(async () => {
            this._setExitCondition(PlaybackStates.FAILED)
            // focibly continuing verify commands
            this.currentExecutingNode = (
              this.currentExecutingNode as CommandNode
            ).next
            return await this._executionLoop()
          })
        } else {
          this[EE].emitCommandStateChange({
            id: command.id,
            callstackIndex,
            command,
            state: CommandStates.ERRORED,
            message: (err as Error).message,
            error: err as Error,
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
        command,
        state: result.skipped ? CommandStates.SKIPPED : CommandStates.PASSED,
        message: undefined,
      })
      this.currentExecutingNode = result.next as CommandNode

      return await this._executionLoop()
    }
  }

  async _playSingleCommand(command: CommandShape) {
    const commandNode = createPlaybackTree([command], {
      emitControlFlowChange: this[EE].emitControlFlowChange.bind(this),
    }).startingCommandNode
    const callstackIndex = undefined
    this[EE].emitCommandStateChange({
      id: command.id,
      callstackIndex,
      command,
      state: CommandStates.EXECUTING,
      message: undefined,
    })

    let result
    try {
      result = await this._executeCommand(commandNode)
    } catch (err) {
      if (err instanceof AssertionError || err instanceof VerificationError) {
        this[EE].emitCommandStateChange({
          id: command.id,
          callstackIndex,
          command,
          state: CommandStates.FAILED,
          message: err.message,
          error: err as Error,
        })
      } else {
        this[EE].emitCommandStateChange({
          id: command.id,
          callstackIndex,
          command,
          state: CommandStates.ERRORED,
          message: (err as Error).message,
          error: err as Error,
        })
      }
      throw err
    }
    this[EE].emitCommandStateChange({
      id: command.id,
      callstackIndex,
      command,
      state: result.skipped ? CommandStates.SKIPPED : CommandStates.PASSED,
      message: undefined,
    })
  }

  async _executeCommand(commandNode: CommandNode) {
    const { command } = commandNode
    if (command.command === 'run') {
      const result = await commandNode.execute(this.executor, {
        executorOverride: this._run,
      })

      return result.skipped
        ? result
        : {
            next: (this.playbackTree as PlaybackTree).startingCommandNode,
            skipped: false,
          }
    } else {
      const result = await commandNode.execute(this.executor)

      return result
    }
  }

  async _run(testName: string) {
    if (!this.getTestByName) {
      throw new Error("'run' command is not supported")
    }
    const test = await this.getTestByName(
      interpolateString(testName, this.variables)
    )
    if (!test) {
      throw new Error(`Can't run unknown test: ${testName}`)
    }

    const tree = createPlaybackTree(test.commands, {
      emitControlFlowChange: this[EE].emitControlFlowChange.bind(this),
    })
    const nextPosition = this.currentExecutingNode?.next as CommandNode
    const caller: Caller = {
      position: nextPosition,
      tree: this.playbackTree as PlaybackTree,
      commands: this.commands as CommandShape[],
    }
    const callstack = this[state].callstack as Callstack
    callstack.call({
      callee: test,
      caller,
    })
    this[EE].emit(PlaybackEvents.CALL_STACK_CHANGED, {
      change: CallstackChange.CALLED,
      callee: test,
      caller,
    })
    this.commands = test.commands
    this.playbackTree = tree
  }

  async _finishPlaying() {
    this[state].playPromise = undefined
    this[state].isPlaying = false
    if (this[state].lastSentCommandState?.state === CommandStates.EXECUTING) {
      const { id, callstackIndex } = this[state]
        .lastSentCommandState as PlaybackEventShapes['COMMAND_STATE_CHANGED']
      this[EE].emitCommandStateChange({
        id,
        callstackIndex,
        command: this[state].lastSentCommandState.command,
        error: new Error('Playback stopped'),
        message: 'Playback stopped',
        state: CommandStates.ERRORED,
      })
    }
    const { playTo, steps, stepPromise } = this[state]
    if (stepPromise) {
      if (steps === 0) {
        // the last step is the end of the test
        stepPromise.res()
      } else {
        stepPromise.rej(new Error('Playback stopped prematurely'))
      }
      this[state].steps = undefined
    }
    if (playTo) {
      playTo.rej(
        new Error(
          "Playback finished before reaching the requested command, check to make sure control flow isn't preventing this"
        )
      )
    }

    this[EE].emit(PlaybackEvents.PLAYBACK_STATE_CHANGED, {
      state: this[state].exitCondition || PlaybackStates.FINISHED,
      testID: this[state].testID,
    })
    this[state].lastSentCommandState = undefined
    this[state].callstack = undefined
    this[state].testID = undefined
  }

  async pause({ graceful } = { graceful: false }) {
    if (!this.currentExecutingNode) {
      return
    }
    this[state].pausing = true
    if (!graceful) {
      await this.executor.cancel()
    }
    this[state].isPlaying = false
    await new Promise((res) => {
      this[state].pausingResolve = res
    })
  }

  async _pause() {
    this[EE].emit(PlaybackEvents.PLAYBACK_STATE_CHANGED, {
      state: PlaybackStates.PAUSED,
      testID: this[state].testID,
    })
    await this.__pause()
  }

  async __pause() {
    // internal method to handle either breaking or pausing
    this[state].pausing = false
    const { pausingResolve, playTo } = this[state]
    if (pausingResolve) {
      const r = pausingResolve
      this[state].pausingResolve = undefined
      r()
    }
    if (
      playTo?.command &&
      this.currentExecutingNode?.command.id === playTo.command
    ) {
      this[state].isPlaying = false
      playTo.res()
    }

    return new Promise((res) => {
      this[state].resumeResolve = res
    })
  }

  async _break() {
    this[EE].emit(PlaybackEvents.PLAYBACK_STATE_CHANGED, {
      state: PlaybackStates.BREAKPOINT,
      testID: this[state].testID,
    })
    await this.__pause()
  }

  async _handleException(unhandledBahaviorFn: Fn) {
    if (!this.options.pauseOnExceptions) {
      return await unhandledBahaviorFn()
    } else {
      await this._break()
      return await this._executionLoop({ ignoreBreakpoint: true })
    }
  }

  async _delay(): Promise<void> {
    if (this.options.delay) {
      return new Promise((res, rej) => {
        const start = Date.now()
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
          } else if (Date.now() - start > this.options.delay) {
            res()
            clearInterval(interval)
          }
        }, DELAY_INTERVAL)
      })
    }
    if (this[state].pausing || this[state].stopping || this[state].aborting) {
      throw new Error('delay cancelled due to playback being stopped/paused')
    }
  }

  _unwind() {
    const callstack = this[state].callstack as Callstack
    const { callee, caller: _caller } = callstack.unwind()
    this[EE].emit(PlaybackEvents.CALL_STACK_CHANGED, {
      change: CallstackChange.UNWINDED,
      callee,
      caller: callstack.top().callee,
    })
    const caller = _caller as Caller
    this.commands = caller.commands
    this.playbackTree = caller.tree
    this.currentExecutingNode = caller.position
  }

  _setExitCondition(condition: keyof typeof PlaybackStatesPriorities) {
    if (!this[state].exitCondition) {
      this[state].exitCondition = condition
    } else if (
      PlaybackStatesPriorities[condition] >
      PlaybackStatesPriorities[
        this[state].exitCondition as keyof typeof PlaybackStatesPriorities
      ]
    ) {
      this[state].exitCondition = condition
    }
  }
}

export interface PlaybackEventShapes {
  COMMAND_STATE_CHANGED: {
    id: string
    testID?: string
    callstackIndex?: number
    command: CommandShape
    state: typeof CommandStates[keyof typeof CommandStates]
    message?: string
    error?: Error
  }
  PLAYBACK_STATE_CHANGED: {
    state: typeof PlaybackStates[keyof typeof PlaybackStates]
    testID?: string
  }
  CALL_STACK_CHANGED: {
    change: typeof CallstackChange[keyof typeof CallstackChange]
    callee: TestShape
    caller: Caller
  }
  CONTROL_FLOW_CHANGED: {
    commandId: string
    type: typeof CommandType[]
    end: boolean
  }
}

export const PlaybackEvents = {
  COMMAND_STATE_CHANGED: 'command-state-changed',
  PLAYBACK_STATE_CHANGED: 'playback-state-changed',
  CALL_STACK_CHANGED: 'call-stack-changed',
  CONTROL_FLOW_CHANGED: 'control-flow-changed',
} as const

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
} as const

export type PlaybackState = typeof PlaybackStates[keyof typeof PlaybackStates]

const PlaybackStatesPriorities = {
  [PlaybackStates.FINISHED]: 0,
  [PlaybackStates.FAILED]: 1,
  [PlaybackStates.ERRORED]: 2,
  [PlaybackStates.STOPPED]: 3,
  [PlaybackStates.ABORTED]: 4,
} as const

export const CommandStates = {
  EXECUTING: 'executing',
  PENDING: 'pending',
  SKIPPED: 'skipped',
  PASSED: 'passed',
  UNDETERMINED: 'undetermined',
  FAILED: 'failed',
  ERRORED: 'errored',
} as const

export type CommandState = typeof CommandStates[keyof typeof CommandStates]

export const CallstackChange = {
  CALLED: 'called',
  UNWINDED: 'unwinded',
} as const
