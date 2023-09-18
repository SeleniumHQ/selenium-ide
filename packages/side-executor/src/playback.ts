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
import { events } from '@seleniumhq/side-commons'
import { createPlaybackTree, PlaybackTree } from './playback-tree'
import Callstack, { Caller } from './callstack'
import BaseExecutor from './executor'
import { CommandShape, TestShape } from '@seleniumhq/side-model'
import { CommandNode, CommandType } from './playback-tree/command-node'

const EE = 'event-emitter'
const state = 'state'

export type GetTestByName = (name: string) => TestShape

export interface PlaybackConstructorArgs<EXECUTOR extends BaseExecutor> {
  baseUrl: string
  executor: EXECUTOR
  getTestByName: GetTestByName
  logger: Console
  options?: Partial<PlaybackConstructorOptions>
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

export type Play = (
  test: TestShape,
  opts: PlayOptions
) => Promise<() => RunningPromise | undefined>

export type PlayTo = VaguePromiseWrapper & { command: string }

export default class BasePlayback<EXECUTOR extends BaseExecutor> {
  constructor({
    baseUrl,
    executor,
    getTestByName,
    logger,
    options = {},
  }: PlaybackConstructorArgs<EXECUTOR>) {
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
      this[EE].emit(PlaybackEvents.COMMAND_STATE_CHANGED, payload)
    }
    this[EE].emitControlFlowChange = (payload) => {
      this[EE].emit(PlaybackEvents.CONTROL_FLOW_CHANGED, payload)
    }
    events.mergeEventEmitter(this, this[EE])
  }
  baseUrl: string
  executor: BaseExecutor
  getTestByName: GetTestByName
  logger: Console
  options: PlaybackConstructorOptions;
  [state]: {
    aborting: boolean
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
    })
    this[state].initialized = true
  }

  play: Play = async (test, { pauseImmediately, startingCommandIndex = 0 }) => {
    if (!this[state].initialized) await this.init()
    if (this[state].playPromise) {
      throw new Error('Playback already in progress')
    }
    this[EE].emit(PlaybackEvents.PLAYBACK_STATE_CHANGED, {
      state: PlaybackStates.PLAYING,
    })
    this[state].isPlaying = true
    this[state].playPromise = this.playTo(
      test,
      test.commands.length - 1,
      startingCommandIndex
    )
    if (pauseImmediately) {
      await this.pause({ graceful: true })
    }
    return () => this[state].playPromise
  }

  async playTo(test: TestShape, stopIndex: number, startIndex: number) {
    if (!test.commands[stopIndex]) {
      throw new Error('Command not found in test')
    } else if (startIndex && !test.commands[startIndex]) {
      throw new Error('Command to start from not found in test')
    }
  }

  async playFrom(test: TestShape, commandToStart: CommandShape) {
    const index = test.commands.indexOf(commandToStart)
    if (index === -1) {
      throw new Error('Command not found in test')
    }
  }

  async playSingleCommand(command: CommandShape) {
    if (!this[state].initialized) await this.init()
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
  }

  async pause({ graceful } = { graceful: false }) {
    this[state].pausing = true
    if (!graceful) {
      await this.executor.cancel()
    }
    this[state].isPlaying = false
    await new Promise((res) => {
      this[state].pausingResolve = res
    })
  }

  async resume() {
    this[state].steps = undefined
  }

  async stop() {
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
    await (this[state].playPromise as RunningPromise).catch(() => {})
  }

  async abort() {
    this[state].aborting = true

    if (this[state].resumeResolve) {
      const r = this[state].resumeResolve as VaguePromise
      this[state].resumeResolve = undefined
      r()
    }
    // we kill regardless of wether the test is paused to keep the
    // behavior consistent

    // @ts-expect-error
    await this.executor.kill()

    // play will throw but the user will catch it with this.play()
    // this.abort() should resolve once play finishes
    await (this[state].playPromise as RunningPromise).catch(() => {})
  }

  async cleanup() {
    this[EE].removeAllListeners()
    await this.executor.cleanup()
  }
}

export interface PlaybackEventShapes {
  COMMAND_STATE_CHANGED: {
    id: string
    callstackIndex?: number
    command: CommandShape
    state: typeof CommandStates[keyof typeof CommandStates]
    message?: string
    error?: Error
  }
  PLAYBACK_STATE_CHANGED: {
    state: typeof PlaybackStates[keyof typeof PlaybackStates]
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
