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
import browser from 'webextension-polyfill'
import { action, reaction, computed, observable } from 'mobx'
import UiState from './UiState'
import ModalState from './ModalState'
import Command from '../../models/Command'
import variables from './Variables'
import PluginManager from '../../../plugin/manager'
import NoResponseError from '../../../errors/no-response'
import { Logger, Channels } from './Logs'
import { LogTypes } from '../../ui-models/Log'
import { createPlaybackTree } from '../../playback/playback-tree'
import {
  play,
  playSingleCommand,
  resumePlayback,
} from '../../IO/SideeX/playback'
import WindowSession from '../../IO/window-session'
import ExtCommand from '../../IO/SideeX/ext-command'
import WebDriverExecutor from '../../IO/playback/webdriver'

class PlaybackState {
  @observable
  runId = ''
  @observable
  isPlaying = false
  @observable
  isStopping = false
  @observable
  breakpointsDisabled = false
  @observable
  breakOnNextCommand = false
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
  paused = false
  @observable
  delay = 0
  @observable
  callstack = []
  @observable
  currentExecutingCommandNode = null

  constructor() {
    this.maxDelay = 3000
    this._testsToRun = []
    this.runningQueue = []
    this.logger = new Logger(Channels.PLAYBACK)
    this.lastSelectedView = undefined
    this.filteredTests = []

    this.extCommand = new ExtCommand(WindowSession)
    this.browserDriver = new WebDriverExecutor()

    reaction(
      () => this.paused,
      paused => {
        if (!paused) {
          resumePlayback()
        }
      }
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

  @computed
  get testsToRun() {
    return this.currentRunningSuite
      ? this.currentRunningSuite.name === '__filteredTests__' + this.runId
        ? this.filteredTests
        : this.currentRunningSuite.tests
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
  toggleDisableBreakpoints() {
    this.breakpointsDisabled = !this.breakpointsDisabled
  }

  @action.bound
  togglePauseOnExceptions() {
    this.pauseOnExceptions = !this.pauseOnExceptions
  }

  beforePlaying(play) {
    try {
      UiState._project.addCurrentUrl()
    } catch (e) {} // eslint-disable-line no-empty
    this.lastSelectedView = UiState.selectedView
    UiState.changeView('Executing', true)
    UiState.selectCommand(undefined)
    if (UiState.isRecording) {
      ModalState.showAlert(
        {
          title: 'Stop recording',
          description:
            'Are you sure you would like to stop recording, and start playing?',
          confirmLabel: 'Playback',
          cancelLabel: 'cancel',
        },
        chosePlay => {
          if (chosePlay) {
            UiState.stopRecording()
            play()
          }
        }
      )
    } else {
      play()
    }
  }

  @action.bound
  play() {
    this.isPlaying = true
    return play(
      UiState.baseUrl,
      process.env.USE_WEBDRIVER ? this.browserDriver : this.extCommand
    )
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
      return this.startPlayingFilteredTests()
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
    if (this.paused) {
      this.resume(true)
    } else if (!this.isPlaying) {
      this.startPlaying(UiState.selectedCommand, true)
    }
  }

  @action.bound
  _startPlayingCollection(suite, tests, eventMessage, runId = uuidv4()) {
    const playSuite = action(() => {
      this.runId = runId
      this.resetState()
      this.currentRunningSuite = suite
      this._testsToRun = [...tests]
      this.testsCount = this._testsToRun.length
      PluginManager.emitMessage({
        action: 'event',
        event: eventMessage,
        options: {
          runId: runId,
          suiteName: this.currentRunningSuite.name,
          projectName: UiState._project.name,
        },
      }).then(() => {
        this.playNext()
      })
    })
    this.beforePlaying(playSuite)
  }

  startPlayingFilteredTests() {
    this.filteredTests = UiState.filteredTests
    const runId = uuidv4()
    const suite = { id: runId, name: '__filteredTests__' + runId }
    this._startPlayingCollection(
      suite,
      this.filteredTests,
      'filteredTestsPlaybackStarted',
      runId
    )
  }

  startPlayingSuite() {
    const { suite } = UiState.selectedTest
    this._startPlayingCollection(suite, suite.tests, 'suitePlayackStarted')
  }

  runningQueueFromIndex(commands, index) {
    return commands.slice(index)
  }

  @action.bound
  startPlaying(command, breakOnNextCommand = false) {
    const playTest = action(() => {
      this.breakOnNextCommand = breakOnNextCommand
      const { test } = UiState.selectedTest
      this.resetState()
      this.runId = uuidv4()
      this.currentRunningSuite = undefined
      this.currentRunningTest = test
      this.testsCount = 1
      let currentPlayingIndex = 0
      if (command && command instanceof Command) {
        currentPlayingIndex = test.commands.indexOf(command)
      }
      this.runningQueue = this.runningQueueFromIndex(
        test.commands.peek(),
        currentPlayingIndex
      )
      const pluginsLogs = {}
      if (PluginManager.plugins.length)
        this.logger.log('Preparing plugins for test run...')
      PluginManager.emitMessage(
        {
          action: 'event',
          event: 'playbackStarted',
          options: {
            runId: this.runId,
            testId: this.currentRunningTest.id,
            testName: this.currentRunningTest.name,
            projectName: UiState._project.name,
          },
        },
        (plugin, resolved) => {
          let log = pluginsLogs[plugin.id]

          if (!log) {
            log = this.logger.log(`Waiting for ${plugin.name} to start...`)
            pluginsLogs[plugin.id] = log
          }

          if (resolved) {
            log.setStatus(LogTypes.Success)
          }
        }
      ).then(this.play)
    })
    this.beforePlaying(playTest)
  }

  @action.bound
  playCommand(command, jumpToNext) {
    if (!this.isPlaying) {
      const playCommand = action(() => {
        this.runId = ''
        this.noStatisticsEffects = true
        this.jumpToNextCommand = jumpToNext
        this.paused = false
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

  @action.bound
  playNext() {
    if (UiState.selectedTest.suite && UiState.selectedTest.suite.isParallel) {
      variables.clear()
    }
    this.currentRunningTest = this._testsToRun.shift()
    this.runningQueue = this.currentRunningTest.commands.peek()
    this.clearStack()
    this.errors = 0
    this.forceTestCaseFailure = false
    PluginManager.emitMessage({
      action: 'event',
      event: 'playbackStarted',
      options: {
        runId: this.runId,
        testId: this.currentRunningTest.id,
        testName: this.currentRunningTest.name,
        suiteName: this.currentRunningSuite.name,
        projectName: UiState._project.name,
      },
    }).then(
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
  stopPlayingGracefully() {
    if (this.isPlaying) {
      this.isStopping = true
      this.paused = false
    }
  }

  @action.bound
  stopPlaying() {
    if (this.isPlaying) {
      this.isStopping = true
      this.paused = false
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
            log = this.logger.log(`Waiting for ${plugin.name} to finish...`)
            pluginsLogs[plugin.id] = log
          }

          if (resolved) {
            log.setStatus(LogTypes.Success)
          }
        }
      ).then(
        action(results => {
          return new Promise(res => {
            results.forEach(result => {
              if (result.message) {
                if (result instanceof Error) {
                  if (!(result instanceof NoResponseError)) {
                    this.logger.error(result.message)
                    this.forceFailure()
                    if (!this.hasFinishedSuccessfully) {
                      this.failures++
                    }
                  }
                } else {
                  this.logger.log(result.message)
                }
              }
            })
            this.testState.set(
              this.stackCaller.id,
              this.hasFinishedSuccessfully
                ? PlaybackStates.Passed
                : PlaybackStates.Failed
            )
            this.isPlaying = false
            this.isStopping = false
            return res()
          })
        })
      )
    }
    return Promise.reject('Playback is not running')
  }

  @action.bound
  abortPlaying() {
    if (this.isPlaying) {
      this.aborted = true
      this._testsToRun = []
      if (this.paused) {
        this.setCommandStateAtomically(
          this.currentExecutingCommandNode.command.id,
          this.callstack.length ? this.callstack.length - 1 : undefined,
          PlaybackStates.Fatal,
          'Playback aborted'
        )
      } else {
        this.setCommandStateAtomically(
          this.currentExecutingCommandNode.command.id,
          this.callstack.length ? this.callstack.length - 1 : undefined,
          PlaybackStates.Undetermined,
          'Aborting...'
        )
      }
      this.stopPlayingGracefully()
    }
  }

  @action.bound
  forceFailure() {
    this.forceTestCaseFailure = true
  }

  @action.bound
  pause() {
    this.paused = true
  }

  @action.bound
  resume(breakOnNextCommand = false) {
    UiState.changeView('Executing')
    UiState.selectTest(
      this.stackCaller,
      this.currentRunningSuite,
      this.callstack.length - 1,
      true
    )
    UiState.selectCommand(undefined)
    this.breakOnNextCommand = breakOnNextCommand
    this.paused = false
  }

  @action.bound
  break(command) {
    this.breakOnNextCommand = false
    this.paused = true
    UiState.selectCommand(command)
    browser.windows.getCurrent().then(windowInfo => {
      browser.windows.update(windowInfo.id, {
        focused: true,
      })
    })
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
            this.hasFailed ? PlaybackStates.Failed : PlaybackStates.Passed
          )
        }
      }
    })
  }

  @action.bound
  setCurrentExecutingCommandNode(node) {
    this.currentExecutingCommandNode = node
  }

  @action.bound
  setCommandStateAtomically(commandId, callstackIndex, state, message) {
    this.commandState.set(
      `${callstackIndex !== undefined ? callstackIndex + ':' : ''}${commandId}`,
      { state, message }
    )
  }

  @action.bound
  setCommandState(commandId, state, message) {
    if (
      !this.pauseOnExceptions &&
      (state === PlaybackStates.Failed || state === PlaybackStates.Fatal)
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
      if (state === PlaybackStates.Fatal && !this.isSingleCommandRunning) {
        if (!this.pauseOnExceptions) {
          this.stopPlayingGracefully()
        } else if (this.pauseOnExceptions) {
          this.break(this.currentExecutingCommandNode.command)
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
    this.runningQueue = testCase.commands.peek()
    let playbackTree = createPlaybackTree(this.runningQueue)
    this.setCurrentExecutingCommandNode(playbackTree.startingCommandNode)
    return playbackTree.startingCommandNode
  }

  @action.bound
  unwindTestCase() {
    const top = this.callstack.pop()
    this.currentRunningTest = top.caller
    this.setCurrentExecutingCommandNode(top.position.next)
    this.runningQueue = top.caller.commands.peek()
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
    variables.clear()
    this.finishedTestsCount = 0
    this.noStatisticsEffects = false
    this.failures = 0
    this.errors = 0
    this.forceTestCaseFailure = false
    this.aborted = false
    this.paused = false
  }
}

export const PlaybackStates = {
  Failed: 'failed',
  Fatal: 'fatal',
  Passed: 'passed',
  Pending: 'pending',
  Undetermined: 'undetermined',
}

if (!window._playbackState) window._playbackState = new PlaybackState()

export default window._playbackState
