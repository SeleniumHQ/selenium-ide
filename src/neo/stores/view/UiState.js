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

import { action, computed, observable, observe } from "mobx";
import storage from "../../IO/storage";
import SuiteState from "./SuiteState";
import TestState from "./TestState";
import PlaybackState from "./PlaybackState";
import Command from "../../models/Command";

class UiState {
  @observable selectedTest = {};
  @observable selectedCommand = null;
  @observable filterTerm = "";
  @observable dragInProgress = false;
  @observable clipboard = null;
  @observable isRecording = false;
  @observable isSelectingTarget = false;
  @observable windowHeight = window.innerHeight;
  @observable consoleHeight = 200;
  @observable minConsoleHeight = 30;
  @observable minContentHeight = 460;
  @observable minNavigationWidth = 180;
  @observable maxNavigationWidth = 250;
  @observable _navigationWidth = 180;
  @observable navigationHover = false;
  @observable navigationDragging = false;
  @observable pristineCommand = new Command();
  @observable lastFocus = {};

  constructor() {
    this.suiteStates = {};
    this.testStates = {};
    this.filterFunction = this.filterFunction.bind(this);
    this.observePristine();
    storage.get().then(data => {
      if (data.consoleSize !== undefined && data.consoleSize >= this.minConsoleHeight) {
        this.resizeConsole(data.consoleSize);
      }
      if (data.navigationSize !== undefined && data.navigationSize >= this.minNavigationWidth) {
        this.resizeNavigation(data.navigationSize);
      }
    });
  }

  @action.bound setProject(project) {
    this._project = project;
    observe(this._project, "id", this.projectChanged);
  }

  @computed get filteredTests() {
    return this._project.tests.filter(this.filterFunction);
  }

  @computed get baseUrl() {
    return this._project.url;
  }

  @computed get maxContentHeight() {
    return this.windowHeight - this.minConsoleHeight;
  }

  @computed get gaugeSpeed() {
    const value = PlaybackState.maxDelay - PlaybackState.delay;
    const speed = Math.ceil(value / PlaybackState.maxDelay * 6);
    return speed ? speed : 1;
  }

  @computed get navigationWidth() {
    return this.navigationHover ? this._navigationWidth : this.minNavigationWidth;
  }

  @action.bound copyToClipboard(item) {
    this.clipboard = item;
  }

  @action.bound selectTest(test, suite) {
    if (test !== this.selectedTest.test) {
      if (test && test.commands.length) {
        this.selectCommand(test.commands[0]);
      } else if (test && !test.commands.length) {
        this.selectCommand(this.pristineCommand);
      } else {
        this.selectCommand(undefined);
      }
    }
    this.selectedTest = { test, suite };
  }
  
  @action.bound selectTestByIndex(index, suite) {
    const selectTestInArray = (index, tests) => (
      (index >= 0 && index < tests.length) ? tests[index] : undefined
    );
    if (!suite) {
      const test = selectTestInArray(index, this.filteredTests);
      if (test) this.selectTest(test);
    } else {
      const suiteState = this.getSuiteState(suite);
      const tests = suiteState.filteredTests.get();
      const test = selectTestInArray(index, tests);
      const suiteIndex = this._project.suites.indexOf(suite);
      if (test) {
        suiteState.setOpen(true);
        this.selectTest(test, suite);
      } else if (suiteIndex > 0 && index < 0) {
        const previousSuite = this._project.suites[suiteIndex - 1];
        this.selectTestByIndex(this.getSuiteState(previousSuite).filteredTests.get().length - 1, previousSuite);
      } else if (suiteIndex + 1 < this._project.suites.length && index >= tests.length) {
        const nextSuite = this._project.suites[suiteIndex + 1];
        this.selectTestByIndex(0, nextSuite);
      }
    }
  }

  @action.bound selectCommand(command) {
    this.selectedCommand = command;
  }

  @action.bound selectCommandByIndex(index) {
    const { test } = this.selectedTest; 
    if (index >= 0 && index < test.commands.length) {
      this.selectCommand(test.commands[index]);
    } else if (index === test.commands.length) {
      this.selectCommand(this.pristineCommand);
    }
  }

  @action.bound selectNextCommand() {
    this.selectCommandByIndex(this.selectedTest.test.commands.indexOf(this.selectedCommand) + 1);
  }

  @action.bound changeFilter(term) {
    this.filterTerm = term;
  }

  @action.bound setDrag(dragProgress) {
    this.dragInProgress = dragProgress;
  }

  @action.bound toggleRecord() {
    this.isRecording = !this.isRecording;
  }

  @action.bound setSelectingTarget(isSelecting) {
    this.isSelectingTarget = isSelecting;
  }

  @action.bound resizeConsole(height) {
    this.consoleHeight = height > 0 ? height : 0;
    storage.set({
      consoleSize: this.consoleHeight 
    });
  }

  @action.bound setWindowHeight(height) {
    this.windowHeight = height;
    if (this.windowHeight - this.consoleHeight < this.minContentHeight) {
      this.resizeConsole(this.windowHeight - this.minContentHeight);
    }
  }

  @action.bound resizeNavigation(width) {
    this._navigationWidth = width;
    storage.set({
      navigationSize: this._navigationWidth
    });
  }

  @action.bound setNavigationHover(hover) {
    clearTimeout(this._hoverTimeout);
    if (!hover) {
      this._hoverTimeout = setTimeout(() => {
        action(() => {this.navigationHover = false;})();
      }, 600);
    } else {
      this.navigationHover = true;
    }
  }

  @action.bound setNavigationDragging(isDragging) {
    this.navigationDragging = isDragging;
  }

  @action.bound observePristine() {
    this.pristineDisposer = observe(this.pristineCommand, () => {
      this.pristineDisposer();
      this.selectedTest.test.addCommand(this.pristineCommand);
      this.pristineCommand = new Command();
      this.observePristine();
    });
  }

  @action.bound focusNavigation() {
    if (this.lastFocus.navigation) {
      this.lastFocus.navigation();
    }
  }

  @action.bound focusEditor() {
    if (this.lastFocus.editor) {
      this.lastFocus.editor();
    }
  }

  @action.bound setSectionFocus(section, cb) {
    this.lastFocus[section] = cb;
  }

  getSuiteState(suite) {
    if (!this.suiteStates[suite.id]) {
      this.suiteStates[suite.id] = new SuiteState(this, suite);
    }

    return this.suiteStates[suite.id];
  }

  getTestState(test) {
    if (!this.testStates[test.id]) {
      this.testStates[test.id] = new TestState(test);
    }

    return this.testStates[test.id];
  }

  filterFunction({name}) {
    return (name.indexOf(this.filterTerm) !== -1);
  }

  setUrl(url, addToCache) {
    this._project.setUrl(url);
    if (addToCache) this._project.addUrl(url);
  }

  @action.bound projectChanged() {
    this.selectedTest = {};
    this.selectedCommand = null;
    this.filterTerm = "";
    this.dragInProgress = false;
    this.clipboard = null;
    this.isRecording = false;
    this.suiteStates = {};
    this.clearTestStates();
  }

  @action.bound clearTestStates() {
    Object.values(this.testStates).forEach(state => state.dispose());
    this.testStates = {};
  }

  @action.bound saved() {
    Object.values(this.testStates).forEach(state => {
      state.modified = false;
    });
    this._project.modified = false;
  }
}

if (!window._state) window._state = new UiState();

export default window._state;
