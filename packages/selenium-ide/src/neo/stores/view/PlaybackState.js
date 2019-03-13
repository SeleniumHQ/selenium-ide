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

import uuidv4 from 'uuid/v4'
import { action, reaction, computed, observable } from 'mobx'
import UiState from './UiState'
import ModalState from './ModalState'
import Command from '../../models/Command'
import Variables from './Variables'
import PluginManager from '../../../plugin/manager'
import NoResponseError from '../../../errors/no-response'
import { Logger, Channels } from './Logs'
import { LogTypes } from '../../ui-models/Log'
import { createPlaybackTree } from '../../playback/playback-tree'
import WindowSession from '../../IO/window-session'
import ExtCommand from '../../IO/SideeX/ext-command'
import WebDriverExecutor from '../../IO/playback/webdriver'
import CommandTarget from './CommandTarget'
import Suite from '../../models/Suite'
import Playback, {
  PlaybackEvents,
  PlaybackStates,
  CommandStates,
} from '../../playback/playback'

class PlaybackState {
  @observable
  runId = ''
  @observable
  playbackState = undefined
  @observable
  isPlaying = false
  @observable
  isStopping = false
  @observable
  breakpointsDisabled = false
  @observable
  pauseOnExceptions = false
  @observable
  currentRunningTest = null
  @observable
  currentRunningSuite = null
  @observable
  isSingleCommandRunning = false
  @observable
  commandState = new Map()
  @observable
  testState = new Map()
  @observable
  suiteState = new Map()
  @observable
  finishedTestsCount = 0
  @observable
  testsCount = 0
  // number of test cases that failed (max 1 for non-suite runs)
  @observable
  failures = 0
  // number of commands that failed
  @observable
  errors = 0
  @observable
  aborted = false
  // for a test case to fail even if errors are 0
  @observable
  forceTestCaseFailure = false
  @observable
  delay = 0
  @observable
  callstack = []
  @observable
  isSilent = false
  @observable
  isSingleCommandExecutionEnabled = false
  @observable
  isPlayFromHere = false

  constructor() {
    this.maxDelay = 3000
    this._testsToRun = []
    this.logger = new Logger(Channels.PLAYBACK)
    this.lastSelectedView = undefined
    this.filteredTests = []
    this.commandTarget = new CommandTarget()
    this.variables = new Variables()
    this.extCommand = new ExtCommand(WindowSession)
    this.browserDriver = new WebDriverExecutor()
    this.playback = undefined
  }

  @computed
  get paused() {
    return (
      this.playbackState === PlaybackStates.PAUSED ||
      this.playbackState === PlaybackStates.BREAKPOINT
    )
  }

  @computed
  get hasFailed() {
    return this.failures > 0
  }

  @computed
  get hasFinishedSuccessfully() {
    return this.errors === 0 && !this.forceTestCaseFailure
  }

  hasFinishedSilently() {
    return this.isSilent
  }

  @computed
  get testsToRun() {
    return this.currentRunningSuite
      ? this.currentRunningSuite._tests
      : this.currentRunningTest
        ? [this.stackCaller] // eslint-disable-line indent
        : undefined // eslint-disable-line indent
  }

  @computed
  get testMap() {
    return UiState._project.tests.reduce((testMap, test) => {
      testMap[test.name] = test
      return testMap
    }, {})
  }

  @computed
  get isPlayingSuite() {
    return this.isPlaying && !!this.currentRunningSuite
  }

  @computed
  get isPlayingTest() {
    return (
      this.isPlaying && this.currentRunningTest && !this.currentRunningSuite
    )
  }

  @computed
  get canPlaySuite() {
    return UiState.selectedTest.suite && !this.isPlayingTest
  }

  @action.bound
  toggleIsSilent() {
    this.isSilent = !this.isSilent
  }

  @action.bound
  toggleIsSingleCommandExecutionEnabled() {
    this.isSingleCommandExecutionEnabled = !this.isSingleCommandExecutionEnabled
  }

  @action.bound
  toggleDisableBreakpoints() {
    this.breakpointsDisabled = !this.breakpointsDisabled
  }

  @action.bound
  togglePauseOnExceptions() {
    this.pauseOnExceptions = !this.pauseOnExceptions
  }

  async beforePlaying(play) {
    try {
      UiState._project.addCurrentUrl()
    } catch (e) {} // eslint-disable-line no-empty
    this.lastSelectedView = UiState.selectedView
    UiState.changeView('Executing', true)
    UiState.selectCommand(undefined)
    if (UiState.isRecording) {
      const chosePlay = await ModalState.showAlert({
        title: 'Stop recording',
        description:
          'Playing this test will stop the recording process. Would you like to continue?',
        confirmLabel: 'playback',
        cancelLabel: 'cancel',
      })
      if (chosePlay) {
        UiState.stopRecording()
        play()
      }
    } else {
      play()
    }
  }

  @action.bound
  commandStateChanged({ id, callstackIndex, state, message }) {
    if (state === CommandStates.FAILED || state === CommandStates.ERRORED) {
      this.errors++
    }
    this.setCommandStateAtomically(id, callstackIndex, state, message)
  }

  @action.bound
  playbackStateChanged({ state }) {
    this.playbackState = state
  }

  @action.bound
  async play() {
    this.isPlaying = true
    this.playback = new Playback({
      baseUrl: UiState.baseUrl,
      executor: this.browserDriver,
      variables: this.variables,
    })
    this.playback.addListener(
      PlaybackEvents.PLAYBACK_STATE_CHANGED,
      this.playbackStateChanged
    )
    this.playback.addListener(
      PlaybackEvents.COMMAND_STATE_CHANGED,
      this.commandStateChanged
    )
    const finish = await this.playback.play({
      id: this.currentRunningTest.id,
      commands: this.currentRunningTest.commands.slice(),
    })

    await finish()
    this.playback.removeListener(
      PlaybackEvents.COMMAND_STATE_CHANGED,
      this.commandStateChanged
    )
    this.playback.removeListener(
      PlaybackEvents.PLAYBACK_STATE_CHANGED,
      this.playbackStateChanged
    )

    await this.playback.cleanup()
    this.finishPlaying()
    action(() => {
      this.isPlaying = false
    })()
  }

  @action.bound
  clearPlayingCache() {
    this.clearStack()
    this.clearCommandStates()
    this.testState.clear()
    this.suiteState.clear()
    this.currentRunningTest = undefined
    this.currentRunningSuite = undefined
  }

  @action.bound
  playSuiteOrResume() {
    if (this.paused) {
      return this.resume()
    } else if (!this.isPlaying) {
      this.startPlayingSuite()
    }
  }

  @action.bound
  playTestOrResume() {
    if (this.paused) {
      return this.resume()
    } else if (!this.isPlaying) {
      return this.startPlaying()
    }
  }

  @action.bound
  playFilteredTestsOrResume() {
    if (this.paused) {
      return this.resume()
    } else if (!this.isPlaying) {
      return this.startPlayingSuite({ isFiltered: true })
    }
  }

  @action.bound
  pauseOrResume() {
    if (this.paused) {
      return this.resume()
    } else if (this.isPlaying) {
      return this.pause()
    }
  }

  @action.bound
  stepOver() {
    if (this.isPlaying && this.paused) {
      this.playback.step()
    }
  }

  @action.bound
  startPlayingSuite(opts = { isFiltered: false }) {
    this.cleanupCurrentRunningVariables()
    this.runId = uuidv4()
    let suite
    if (!opts.isFiltered) {
      suite = UiState.selectedTest.suite
    } else {
      suite = new Suite(undefined, 'All Tests')
      UiState.filteredTests.forEach(function(test) {
        suite.addTestCase(test)
      })
    }
    this.resetState()
    this.currentRunningSuite = suite
    this._testsToRun = [...suite._tests]
    this.testsCount = this._testsToRun.length
    PluginManager.emitMessage({
      action: 'event',
      event: 'suitePlaybackStarted',
      options: {
        runId: this.runId,
        tests: suite._tests.map(test => test.export()),
      },
    }).then(responses => {
      if (!this.pluginDidFail(responses)) {
        UiState.selectTest(suite._tests[0])
        this.startPlaying(suite._tests[0].commands[0])
      }
    })
  }

  @action.bound
  startPlaying() {
    const playTest = action(async () => {
      const { test } = UiState.selectedTest
      this.resetState()
      if (!this.currentRunningSuite) this.runId = uuidv4()
      this.currentRunningTest = test
      this.testsCount = 1
      const startingUrl = UiState.baseUrl
      if (!startingUrl) {
        UiState.setUrl(
          await ModalState.selectBaseUrl({
            isInvalid: true,
            confirmLabel: 'Start playback',
          }),
          true
        )
      }
      const pluginsLogs = {}
      if (PluginManager.plugins.length)
        this.logger.log('Preparing plugins for test run...')
      this.emitPlaybackStarted((plugin, resolved) => {
        let log = pluginsLogs[plugin.id]

        if (!log) {
          log = this.logger.log(`Waiting for ${plugin.name} to start`)
          log.setStatus(LogTypes.Awaiting)
          pluginsLogs[plugin.id] = log
        }

        if (resolved) {
          log.setStatus(LogTypes.Success)
        }
      }).then(responses => {
        if (!this.pluginDidFail(responses)) {
          this.play()
        }
      })
    })
    this.beforePlaying(playTest)
  }

  pluginDidFail(responses) {
    let didFail = false
    responses.forEach(res => {
      if (res.response && res.response.status === 'fatal') {
        didFail = true
        this.logger.error(
          `[${responses[0].plugin.name}]: ${responses[0].response.message}`
        )
      }
    })
    return didFail
  }

  @action.bound
  playCommand(command, jumpToNext) {
    if (!this.isPlaying) {
      const playCommand = action(() => {
        this.runId = ''
        this.noStatisticsEffects = true
        this.jumpToNextCommand = jumpToNext
        this.errors = 0
        this.forceTestCaseFailure = false
        this.aborted = false
        this.currentRunningTest = UiState.selectedTest.test
        this.runningQueue = [command]
        this.isSingleCommandRunning = true
        this.play().then(() => {
          this.isSingleCommandRunning = false
        })
      })
      this.beforePlaying(playCommand)
    } else {
      const queue = this.runningQueue
      const currentExecutingCommandNode = this.currentExecutingCommandNode
      this.isSingleCommandRunning = true
      playSingleCommand(command).then(
        action(() => {
          this.isSingleCommandRunning = false
          this.runningQueue = queue
          this.currentExecutingCommandNode = currentExecutingCommandNode
        })
      )
    }
  }

  emitPlaybackStarted(cb) {
    return PluginManager.emitMessage(
      {
        action: 'event',
        event: 'playbackStarted',
        options: {
          runId: this.runId,
          testId: this.currentRunningTest.id,
          testName: this.currentRunningTest.name,
          suiteName: this.currentRunningSuite && this.currentRunningSuite.name,
          projectName: UiState._project.name,
          test: this.currentRunningTest.export(),
        },
      },
      cb
    )
  }

  @action.bound
  playNext() {
    if (UiState.selectedTest.suite && UiState.selectedTest.suite.isParallel) {
      this.variables.clear()
    }
    // remove the first test from the test queue so it doesn't get replayed
    if (this.currentRunningSuite._tests[0].name === this._testsToRun[0].name)
      this._testsToRun.shift()
    // pull the next test off the test queue for execution
    this.currentRunningTest = this._testsToRun.shift()
    this.clearStack()
    this.errors = 0
    this.forceTestCaseFailure = false
    this.emitPlaybackStarted().then(
      action(() => {
        UiState.selectTest(
          this.currentRunningTest,
          this.currentRunningSuite,
          undefined,
          true
        )
        UiState.selectCommand(undefined)
        this.play()
      })
    )
  }

  @action.bound
  stopPlaying() {
    if (this.isPlaying) {
      this.isStopping = true
      const pluginsLogs = {}
      return PluginManager.emitMessage(
        {
          action: 'event',
          event: 'playbackStopped',
          options: {
            runId: this.runId,
            testId: this.currentRunningTest.id,
            testName: this.currentRunningTest.name,
            suiteName: this.currentRunningSuite
              ? this.currentRunningSuite.name
              : undefined,
            projectName: UiState._project.name,
          },
        },
        (plugin, resolved) => {
          let log = pluginsLogs[plugin.id]

          if (!log) {
            log = this.logger.log(`Waiting for ${plugin.name} to finish`)
            log.setStatus(LogTypes.Awaiting)
            pluginsLogs[plugin.id] = log
          }

          if (resolved) {
            log.setStatus(LogTypes.Success)
          }
        }
      ).then(
        action(results => {
          return new Promise(res => {
            results.forEach(({ response }) => {
              if (response.message) {
                if (response instanceof Error) {
                  if (!(response instanceof NoResponseError)) {
                    this.logger.error(response.message)
                    this.forceFailure()
                    if (!this.hasFinishedSuccessfully) {
                      this.failures++
                    }
                  }
                } else {
                  this.logger.log(response.message)
                }
              }
            })
            this.testState.set(
              this.stackCaller.id,
              this.hasFinishedSuccessfully
                ? PlaybackStates.FINISHED
                : PlaybackStates.FAILED
            )
            this.isStopping = false
            return res()
          })
        })
      )
    }
    return Promise.reject('Playback is not running')
  }

  async stop() {
    if (this.playback) {
      this.isStopping = true
      await this.playback.stop()
      this.isStopping = false
    } else {
      throw new Error('Playback is not running')
    }
  }

  async abort() {
    if (this.playback) {
      await this.playback.abort()
    } else {
      throw new Error('Playback is not running')
    }
  }

  async stopOrAbort() {
    this._testsToRun = []
    if (this.isStopping) {
      await this.abort()
    } else {
      await this.stop()
    }
  }

  @action.bound
  forceFailure() {
    this.forceTestCaseFailure = true
  }

  @action.bound
  pause() {
    if (this.playback) {
      this.playback.pause()
    } else {
      throw new Error('Playback is not running')
    }
  }

  @action.bound
  resume() {
    if (this.playback) {
      UiState.changeView('Executing')
      UiState.selectTest(
        this.stackCaller,
        this.currentRunningSuite,
        this.callstack.length - 1,
        true
      )
      UiState.selectCommand(undefined)
      this.playback.resume()
    } else {
      throw new Error('Playback is not running')
    }
  }

  @action.bound
  finishPlaying() {
    if (!this.noStatisticsEffects) {
      this.finishedTestsCount++
      if (!this.hasFinishedSuccessfully) {
        this.failures++
      }
    }
    if (!this._testsToRun.length) {
      WindowSession.focusIDEWindow()
    }
    this.stopPlaying().then(() => {
      if (this.jumpToNextCommand) {
        UiState.selectNextCommand()
      }
      if (this._testsToRun.length) {
        this.playNext()
      } else {
        if (!this.hasFailed && this.lastSelectedView) {
          UiState.changeView(this.lastSelectedView)
          this.commandTarget.doCleanup({
            isTestAborted: this.aborted,
            callback: () => {
              ModalState.showAlert({
                type: 'info',
                title: 'Unable to reach target command',
                description:
                  "The target command was unreachable because it was part of a control flow branch that wasn't executed.  \n\nPlease try again.",
              })
            },
          })
        }
        this.lastSelectedView = undefined
        if (this.currentRunningSuite) {
          PluginManager.emitMessage({
            action: 'event',
            event: 'suitePlaybackStopped',
            options: {
              runId: this.runId,
              suiteName: this.currentRunningSuite.name,
              projectName: UiState._project.name,
            },
          })
          this.suiteState.set(
            this.currentRunningSuite.id,
            this.hasFailed ? PlaybackStates.FAILED : PlaybackStates.FINISHED
          )
          this.cleanupCurrentRunningVariables()
        }
      }
    })
  }

  @action.bound
  cleanupCurrentRunningVariables() {
    this.currentRunningTest = undefined
    this.currentRunningSuite = undefined
  }

  @action.bound
  setCommandStateAtomically(commandId, callstackIndex, state, message) {
    this.commandState.set(
      `${callstackIndex !== undefined ? callstackIndex + ':' : ''}${commandId}`,
      { state, message }
    )
  }

  @action.bound
  async setCommandState(commandId, state, message) {
    if (
      !this.pauseOnExceptions &&
      (state === CommandStates.FAILED || state === CommandStates.ERRORED)
    ) {
      this.errors++
    }
    if (this.isPlaying) {
      this.setCommandStateAtomically(
        commandId,
        this.callstack.length ? this.callstack.length - 1 : undefined,
        state,
        message
      )
      if (state === CommandStates.ERRORED && !this.isSingleCommandRunning) {
        if (!this.pauseOnExceptions) {
          await this.stopOrAbort()
        } else if (this.pauseOnExceptions) {
          await this.break()
        }
      }
    }
  }

  @action.bound
  clearCommandStates() {
    this.commandState.clear()
  }

  @action.bound
  setDelay(delay) {
    this.delay = delay
  }

  @action.bound
  callTestCase(_testCase) {
    let testCase = _testCase
    if (typeof testCase === 'string') {
      testCase = this.testMap[testCase]
    }
    if (!testCase) {
      throw new Error(`No test case named ${_testCase}`)
    }
    this.callstack.push({
      caller: this.currentRunningTest,
      callee: testCase,
      position: this.currentExecutingCommandNode,
    })
    UiState.selectTest(
      this.stackCaller,
      this.currentRunningSuite,
      this.callstack.length - 1,
      true
    )
    this.currentRunningTest = testCase
    this.runningQueue = testCase.commands.slice()
    let playbackTree = createPlaybackTree(this.runningQueue)
    this.setCurrentExecutingCommandNode(playbackTree.startingCommandNode)
    return playbackTree.startingCommandNode
  }

  @action.bound
  unwindTestCase() {
    const top = this.callstack.pop()
    this.currentRunningTest = top.caller
    this.setCurrentExecutingCommandNode(top.position.next)
    this.runningQueue = top.caller.commands.slice()
    UiState.selectTest(
      this.stackCaller,
      this.currentRunningSuite,
      this.callstack.length - 1,
      true
    )
    return top
  }

  @action.bound
  clearStack() {
    this.callstack.clear()
  }

  @computed
  get stackCaller() {
    return this.callstack.length
      ? this.callstack[0].caller
      : this.currentRunningTest
  }

  @action.bound
  resetState() {
    this.clearCommandStates()
    this.clearStack()
    this.variables.clear()
    this.finishedTestsCount = 0
    this.noStatisticsEffects = false
    this.failures = 0
    this.errors = 0
    this.forceTestCaseFailure = false
    this.aborted = false
    this.isPlayFromHere = false
    this.isPlayingControlFlowCommands = false
    this.playFromHereCommandId = undefined
    this.isSilent = false
  }
}

if (!window._playbackState) window._playbackState = new PlaybackState()
export default window._playbackState
