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

import { action, observable } from 'mobx'
import UiState from './UiState'

class ModalState {
  @observable
  editedSuite = null
  @observable
  renameState = {}
  @observable
  importSuiteState = {}
  @observable
  suiteSettingsState = {}
  @observable
  baseUrlState = {}
  @observable
  welcomeState = {
    started: false,
    completed: false,
  }
  @observable
  newWindowConfigurationState = false
  @observable
  exportState = {}

  constructor() {
    this.renameTest = this.rename.bind(this, Types.test)
    this.renameSuite = this.rename.bind(this, Types.suite)
    this.rename = this.rename.bind(this)
    this.exportPayload = undefined
  }

  @action.bound
  selectBaseUrl(options = { isInvalid: true }) {
    return new Promise((res, rej) => {
      this.baseUrlState = {
        ...options,
        selecting: true,
        done: action(url => {
          res(url)
          this.baseUrlState = {}
        }),
        cancel: action(() => {
          rej()
          this.baseUrlState = {}
        }),
      }
    })
  }

  @action
  rename(type, value, opts = { isNewTest: false }) {
    const verifyName = name => {
      let names
      if (type === Types.test) names = UiState._project.tests
      else if (type === Types.suite) names = UiState._project.suites

      return name === value || this.nameIsUnique(name, names)
    }
    return new Promise(res => {
      this.renameState = {
        original: value,
        value,
        type,
        verify: verifyName,
        isNewTest: opts.isNewTest,
        done: name => {
          if (verifyName(name)) {
            res(name)
            if (type === Types.test) {
              this.renameRunCommands(this.renameState.original, name)
            }
            this.cancelRenaming()
          }
        },
        cancel: () => {
          this.cancelRenaming()
          if (!this.welcomeState.completed) this.showWelcome()
        },
      }
    })
  }

  @action.bound
  editSuite(suite) {
    this.editedSuite = suite
  }

  @action.bound
  cancelRenaming() {
    this.renameState = {}
  }

  @action.bound
  createSuite() {
    this.renameSuite(undefined).then(name => {
      if (name) this._project.createSuite(name)
    })
  }

  @action.bound
  createTest() {
    this.renameTest(undefined).then(name => {
      if (name) {
        const test = this._project.createTestCase(name)
        UiState.selectTest(test)
      }
    })
  }

  @action.bound
  async deleteSuite(suite) {
    const choseDelete = await this.showAlert({
      title: 'Delete suite',
      description: `This will permanently delete '${suite.name}'`,
      cancelLabel: 'cancel',
      confirmLabel: 'delete',
    })
    if (choseDelete) {
      this._project.deleteSuite(suite)
      UiState.selectTest()
    }
  }

  @action.bound
  async deleteTest(testCase) {
    const choseDelete = await this.showAlert({
      title: 'Delete test case',
      description: `This will permanently delete '${
        testCase.name
      }', and remove it from all its suites`,
      cancelLabel: 'cancel',
      confirmLabel: 'delete',
    })
    if (choseDelete) {
      this._project.deleteTestCase(testCase)
      UiState.selectTest()
    }
  }

  @action.bound
  async codeExport(payload) {
    this.exportState = { isExporting: true }
    this.exportPayload = payload
  }

  @action.bound
  async cancelCodeExport() {
    this.exportState = {}
    this.exportPayload = undefined
  }

  @action.bound
  importSuite(suite, onComplete) {
    this.importSuiteState = {
      suite,
      onComplete: (...argv) => {
        this.cancelImport()
        onComplete(...argv)
      },
    }
  }

  @action.bound
  cancelImport() {
    this.importSuiteState = {}
  }

  @action.bound
  editSuiteSettings(suite) {
    this.suiteSettingsState = {
      editing: true,
      isParallel: suite.isParallel,
      persistSession: suite.persistSession,
      timeout: suite.timeout,
      done: ({ isParallel, persistSession, timeout }) => {
        suite.setTimeout(timeout)
        suite.setParallel(isParallel)
        suite.setPersistSession(persistSession)
        this.cancelSuiteSettings()
      },
    }
  }

  @action.bound
  cancelSuiteSettings() {
    this.suiteSettingsState = {}
  }

  nameIsUnique(value, list) {
    if (list) {
      return !list.find(({ name }) => name === value)
    } else {
      return true
    }
  }

  renameRunCommands(original, newName) {
    UiState._project.tests.forEach(test => {
      test.commands.forEach(command => {
        if (command.command === 'run' && command.target === original) {
          command.setTarget(newName)
        }
      })
    })
  }

  @action.bound
  showWelcome() {
    this.welcomeState = { started: false, completed: false }
  }

  @action.bound
  hideWelcome() {
    this.welcomeState = { started: true, completed: false }
  }

  @action.bound
  completeWelcome() {
    this.welcomeState = { started: true, completed: true }
  }

  @action.bound
  renameProject() {
    return this.rename(Types.project, this._project.name)
  }

  @action.bound
  toggleNewWindowConfiguration() {
    this.newWindowConfigurationState = !this.newWindowConfigurationState
  }

  isUniqueWindowName(windowName, commandId) {
    const commands = UiState.selectedTest.test.commands
      .filter(command => command.id !== commandId)
      .filter(command => command.windowHandleName !== '')
      .map(command => command.windowHandleName)
    return !commands.includes(windowName)
  }
}

const Types = {
  test: 'test case',
  suite: 'suite',
  project: 'project',
}

if (!window._modalState) window._modalState = new ModalState()

export default window._modalState
