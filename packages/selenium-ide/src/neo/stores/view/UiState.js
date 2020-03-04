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

import { action, computed, observable, observe, extendObservable } from 'mobx'
import storage from '../../IO/storage'
import SuiteState from './SuiteState'
import PlaybackState from './PlaybackState'
import ModalState from './ModalState'
import Command from '../../models/Command'
import Manager from '../../../plugin/manager'
import WindowSession from '../../IO/window-session'
import BackgroundRecorder from '../../IO/SideeX/recorder'

class UiState {
  views = ['Tests', 'Test suites', 'Executing']
  @observable
  lastViewSelection = new Map()
  @observable
  selectedView = 'Tests'
  @observable
  selectedTest = {}
  @observable
  selectedCommand = null
  @observable
  selectedCommands = []
  @observable
  filterTerm = ''
  @observable
  clipboard = []
  @observable
  isRecording = false
  @observable
  lastRecordedCommand = null
  @observable
  isSelectingTarget = false
  @observable
  windowHeight = window.innerHeight
  @observable
  consoleHeight = 200
  @observable
  minConsoleHeight = 30
  @observable
  minContentHeight = 460
  @observable
  minNavigationWidth = 180
  @observable
  maxNavigationWidth = 350
  @observable
  navigationWidth = 180
  @observable
  pristineCommand = new Command()
  @observable
  lastFocus = {}
  @observable
  options = {}
  @observable
  pauseNotificationSent = false
  @observable
  isControlled = null
  @observable
  selectedExportLanguage = null
  @observable
  specifiedRemoteUrl = null
  @observable
  gridConfigEnabled = null

  constructor() {
    this.suiteStates = {}
    this.filterFunction = this.filterFunction.bind(this)
    this.observePristine()
    storage.get().then(data => {
      if (data.selectedExportLanguage !== undefined) {
        this.selectExportLanguage(data.selectedExportLanguage)
      } else {
        this.selectExportLanguage('java-junit')
      }
      this.specifyRemoteUrl(
        data.specifiedRemoteUrl
          ? data.specifiedRemoteUrl
          : 'http://localhost:4444/wd/hub'
      )
      data.gridConfigEnabled
        ? (this.gridConfigEnabled = data.gridConfigEnabled)
        : (this.gridConfigEnabled = false)
      if (
        data.consoleSize !== undefined &&
        data.consoleSize >= this.minConsoleHeight
      ) {
        this.storedConsoleHeight =
          data.consoleSize > this.minConsoleHeight
            ? data.consoleSize
            : this.windowHeight - this.minContentHeight
        this.resizeConsole(data.consoleSize)
      }
      if (
        data.navigationSize !== undefined &&
        data.navigationSize >= this.minNavigationWidth
      ) {
        this.resizeNavigation(data.navigationSize)
      }
      if (data.options) {
        this.setOptions(data.options)
      }
    })
    this.recorder = new BackgroundRecorder(WindowSession)
    this.windowSession = WindowSession
  }

  @action.bound
  setProject(project) {
    this._project = project
  }

  @computed
  get project() {
    return this._project
  }

  @computed
  get filteredTests() {
    return this._project.tests.filter(this.filterFunction)
  }

  @computed
  get baseUrl() {
    return this._project.url
  }

  @computed
  get maxContentHeight() {
    return this.windowHeight - this.minConsoleHeight
  }

  @computed
  get gaugeSpeed() {
    const value = PlaybackState.maxDelay - PlaybackState.delay
    const speed = Math.ceil((value / PlaybackState.maxDelay) * 5)
    return speed ? speed : 1
  }

  @action.bound
  _changeView(view, ignoreCache) {
    this.lastViewSelection.set(this.selectedView, this.selectedTest)
    const lastSelection = this.lastViewSelection.get(view)
    if (!ignoreCache && lastSelection) {
      this.selectTest(
        lastSelection.test,
        lastSelection.suite,
        lastSelection.stack
      )
    }
    this.selectedView = view
  }

  @action.bound
  async changeView(view, ignoreCache) {
    if (this.isRecording && view !== this.selectedView) {
      const choseChange = await ModalState.showAlert({
        title: 'Stop recording',
        description:
          'Changing the current view will stop the recording process. Would you like to continue?',
        confirmLabel: 'stop recording',
        cancelLabel: 'cancel',
      })
      if (choseChange) {
        await this.stopRecording()
        this._changeView(view, ignoreCache)
      }
    } else {
      this._changeView(view, ignoreCache)
    }
  }

  @action.bound
  clearViewCache() {
    this.lastViewSelection.clear()
  }

  @action.bound
  copyToClipboard() {
    // sorting by index
    this.clipboard.replace(
      this.selectedCommands.sort((c1, c2) => c1.index - c2.index)
    )
  }

  @action.bound
  pasteFromClipboard(index) {
    if (this.clipboard.length && this.displayedTest) {
      this.clipboard.forEach((command, idx) => {
        const newCommand = command.clone()
        this.displayedTest.insertCommandAt(newCommand, index + idx)
      })
    }
  }

  @computed
  get displayedTest() {
    return this.selectedTest.stack !== undefined &&
      this.selectedTest.stack >= 0 &&
      this.selectedTest.stack < PlaybackState.callstack.length
      ? PlaybackState.callstack[this.selectedTest.stack].callee
      : this.selectedTest.test
  }

  @action.bound
  _selectTest(test, suite, stack, override) {
    if (!PlaybackState.isPlaying || PlaybackState.paused || override) {
      const _test =
        stack !== undefined && stack >= 0
          ? PlaybackState.callstack[stack].callee
          : test
      if (
        _test &&
        (_test !== this.displayedTest || suite !== this.selectedTest.suite)
      ) {
        this.selectedTest = {
          test,
          suite,
          stack: stack >= 0 ? stack : undefined,
        }
        if (PlaybackState.isPlaying && !PlaybackState.paused) {
          this.selectCommand(undefined)
        } else if (_test && _test.commands.length) {
          let command = this.selectedTest.test.selectedCommand
          command = command ? command : _test.commands[0]
          this.selectCommand(command)
        } else if (_test && !_test.commands.length) {
          this.selectCommand(this.pristineCommand, 0)
        } else {
          this.selectCommand(undefined)
        }
      } else if (!_test) {
        this.selectedTest = {}
        this.selectCommand(undefined)
      }
    }
  }

  @action.bound
  async selectTest(test, suite, stack, override) {
    if (this.isRecording && test !== this.selectedTest.test) {
      const choseSelect = await ModalState.showAlert({
        title: 'Stop recording',
        description:
          'Leaving this test and moving to another one will stop the recording process. Would you like to continue?',
        confirmLabel: 'stop recording',
        cancelLabel: 'cancel',
      })
      if (choseSelect) {
        await this.stopRecording()
        this._selectTest(test, suite, stack, override)
      }
    } else {
      this._selectTest(test, suite, stack, override)
    }
  }

  @action.bound
  selectTestByIndex(index, suite) {
    const selectTestInArray = (index, tests) =>
      index >= 0 && index < tests.length ? tests[index] : undefined
    if (this.selectedView === 'Tests') {
      const test = selectTestInArray(index, this.filteredTests)
      if (test) this.selectTest(test)
    } else if (this.selectedView === 'Test suites') {
      const suiteState = this.getSuiteState(suite)
      const tests = suiteState.filteredTests.get()
      const test = selectTestInArray(index, tests)
      const suiteIndex = this._project.suites.indexOf(suite)
      if (test) {
        suite.setOpen(true)
        this.selectTest(test, suite)
      } else if (suiteIndex > 0 && index < 0) {
        const previousSuite = this._project.suites[suiteIndex - 1]
        this.selectTestByIndex(
          this.getSuiteState(previousSuite).filteredTests.get().length - 1,
          previousSuite
        )
      } else if (
        suiteIndex + 1 < this._project.suites.length &&
        index >= tests.length
      ) {
        const nextSuite = this._project.suites[suiteIndex + 1]
        this.selectTestByIndex(0, nextSuite)
      }
    } else if (this.selectedView === 'Executing') {
      const test = selectTestInArray(index, PlaybackState.testsToRun)
      if (test) {
        let stack = undefined
        if (
          PlaybackState.callstack.length &&
          PlaybackState.stackCaller === test
        ) {
          stack = PlaybackState.callstack.length - 1
        }
        this.selectTest(test, suite, stack)
      }
    }
  }

  @action.bound
  selectCommand(command, index, opts = { isCommandTarget: false }) {
    if (
      !PlaybackState.isPlaying ||
      PlaybackState.paused ||
      opts.isCommandTarget
    ) {
      if (this.selectedTest.test) {
        this.selectedTest.test.selectedCommand = command
        this.selectedCommand = command
        this.addToSelectedCommands(command, index)
      } else {
        this.selectedCommand = undefined
      }
    }
  }

  @action.bound
  selectCommandByIndex(index, opts) {
    const test = this.displayedTest
    if (index >= 0 && index < test.commands.length) {
      this.selectCommand(test.commands[index], index, opts)
    } else if (index === test.commands.length) {
      this.selectCommand(this.pristineCommand, test.commands.length, opts)
    }
  }

  @action.bound
  selectNextCommand(opts = { from: undefined, isCommandTarget: false }) {
    this.selectCommandByIndex(this.nextCommandIndex(opts.from), opts)
  }

  nextCommandIndex(targetCommand) {
    const commands = this.displayedTest.commands
    if (targetCommand) return commands.indexOf(targetCommand) + 1
    else return commands.indexOf(this.selectedCommand) + 1
  }

  @action.bound
  changeFilter(term) {
    this.filterTerm = term
  }

  @action.bound
  async toggleRecord(isInvalid) {
    await (this.isRecording
      ? this.stopRecording()
      : this.startRecording(isInvalid))
  }

  @action.bound
  beforeRecording() {}

  @action.bound
  async startRecording(isInvalid) {
    let startingUrl = this.baseUrl
    if (!startingUrl) {
      startingUrl = await ModalState.selectBaseUrl({
        isInvalid,
        confirmLabel: 'Start recording',
      })
    }
    try {
      await this.recorder.attach(startingUrl)
      this._setRecordingState(true)
      this.lastRecordedCommand = null
      await this.emitRecordingState()
    } catch (err) {
      ModalState.showAlert({
        title: 'Could not start recording',
        description: err ? err.message : undefined,
      })
    }
  }

  nameNewTest(isEnabled = true) {
    const test = this.selectedTest.test
    if (isEnabled && test.name === 'Untitled' && !test.nameDialogShown) {
      ModalState.renameTest(test.name, { isNewTest: true }).then(name => {
        test.setName(name)
      })
      test.nameDialogShown = true
    }
  }

  @action.bound
  async stopRecording(opts = { nameNewTest: true }) {
    await this.recorder.detach()
    this._setRecordingState(false)
    await this.emitRecordingState()
    await this.nameNewTest(opts.nameNewTest)
  }

  // Do not call this method directly, use start and stop
  @action.bound
  _setRecordingState(isRecording) {
    this.isRecording = isRecording
  }

  @action.bound
  emitRecordingState() {
    Manager.emitMessage({
      action: 'event',
      event: this.isRecording ? 'recordingStarted' : 'recordingStopped',
      options: {
        testName: this.selectedTest.test
          ? this.selectedTest.test.name
          : undefined,
      },
    })
  }

  @action.bound
  setSelectingTarget(isSelecting) {
    this.isSelectingTarget = isSelecting
  }

  @action.bound
  selectExportLanguage(language) {
    this.selectedExportLanguage = language
    storage.set({
      selectedExportLanguage: language,
    })
  }

  @action.bound
  specifyRemoteUrl(url) {
    this.specifiedRemoteUrl = url
    storage.set({
      specifiedRemoteUrl: url,
    })
  }

  @action.bound
  toggleGridConfig() {
    this.gridConfigEnabled = !this.gridConfigEnabled
    storage.set({
      gridConfigEnabled: this.gridConfigEnabled,
    })
  }

  @action.bound
  resizeConsole(height) {
    const maxConsoleHeight = this.windowHeight - this.minContentHeight
    const tmpHeight = height > maxConsoleHeight ? maxConsoleHeight : height

    this.storedConsoleHeight =
      height > this.minConsoleHeight + 20 ? height : this.storedConsoleHeight
    this.consoleHeight =
      height > this.minConsoleHeight ? tmpHeight : this.minConsoleHeight

    storage.set({
      consoleSize: this.consoleHeight,
    })
  }

  @action.bound
  maximizeConsole() {
    this.resizeConsole(this.windowHeight - this.minContentHeight)
  }

  @action.bound
  minimizeConsole() {
    this.resizeConsole(this.minConsoleHeight)
  }

  @action.bound
  restoreConsoleSize() {
    this.resizeConsole(this.storedConsoleHeight)
  }

  @action.bound
  toggleConsole() {
    if (this.consoleHeight === this.minConsoleHeight) {
      this.restoreConsoleSize()
    } else {
      this.minimizeConsole()
    }
  }

  @action.bound
  setWindowHeight(height) {
    this.windowHeight = height
    if (this.windowHeight - this.consoleHeight < this.minContentHeight) {
      this.resizeConsole(this.windowHeight - this.minContentHeight)
    }
  }

  @action.bound
  resizeNavigation(width) {
    this.navigationWidth = width
    storage.set({
      navigationSize: this.navigationWidth,
    })
  }

  @action.bound
  setOptions(options) {
    extendObservable(this.options, options)
    storage.set({
      options: this.options,
    })
  }

  @action.bound
  observePristine() {
    this.pristineDisposer = observe(this.pristineCommand, () => {
      this.pristineDisposer()
      this.displayedTest.addCommand(this.pristineCommand)
      this.pristineCommand = new Command()
      this.observePristine()
    })
  }

  @action.bound
  focusNavigation() {
    if (this.lastFocus.navigation) {
      this.lastFocus.navigation()
    }
  }

  @action.bound
  focusEditor() {
    if (this.lastFocus.editor) {
      this.lastFocus.editor()
    }
  }

  @action.bound
  setSectionFocus(section, cb) {
    this.lastFocus[section] = cb
  }

  getSuiteState(suite) {
    if (!this.suiteStates[suite.id]) {
      this.suiteStates[suite.id] = new SuiteState(this, suite)
    }

    return this.suiteStates[suite.id]
  }

  filterFunction({ name }) {
    return name.toLowerCase().indexOf(this.filterTerm.toLowerCase()) !== -1
  }

  setUrl(url, addToCache) {
    this._project.setUrl(url)
    if (addToCache) this._project.addUrl(url)
  }

  @action.bound
  projectChanged() {
    this.selectedTest = {}
    this.selectedCommand = null
    this.selectedCommands = []
    this.filterTerm = ''
    this.isRecording = false
    this.suiteStates = {}
    this.selectTest(this._project.tests[0])
    WindowSession.closeAllOpenedWindows()
    this.saved()
  }

  isSaved() {
    return this._project.modified === false
  }

  @action.bound
  saved() {
    this._project.saved()
  }

  @action.bound
  startConnection() {
    this.isControlled = true
  }

  @action.bound
  addToSelectedCommands(command, index) {
    if (!PlaybackState.isPlaying || PlaybackState.paused) {
      if (command) {
        command.index = index ? index : 0
        if (!this.selectedCommands.find(c => c === command))
          this.selectedCommands.push(command)
      }
    }
  }

  @action.bound
  clearSelectedCommands() {
    this.selectedCommands.clear()
  }

  @action.bound
  selectAllCommands() {
    this.selectedTest.test.commands.forEach((command, index) => {
      this.selectCommand(command, index)
    })
  }
}

if (!window._state) window._state = new UiState()

export default window._state
