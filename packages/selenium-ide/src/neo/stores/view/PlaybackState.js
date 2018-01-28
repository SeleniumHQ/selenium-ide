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

import uuidv4 from "uuid/v4";
import { action, computed, observable } from "mobx";
import UiState from "./UiState";

class PlaybackState {
  @observable runId = "";
  @observable isPlaying = false;
  @observable currentPlayingIndex = 0;
  @observable currentRunningTest = null;
  @observable currentRunningSuite = null;
  @observable commandState = new Map();
  @observable testState = new Map();
  @observable suiteState = new Map();
  @observable finishedTestsCount = 0;
  @observable testsCount = 0;
  @observable failures = 0;
  @observable errors = 0;
  @observable hasFailed = false;
  @observable aborted = false;
  @observable paused = false;
  @observable delay = 0;

  constructor() {
    this.maxDelay = 3000;
    this._testsToRun = [];
    this.runningQueue = [];
  }

  @computed get hasFinishedSuccessfully() {
    return !this.runningQueue.find(({id}) => (
      this.commandState.get(id) ? this.commandState.get(id).state === PlaybackStates.Failed : false
    ));
  }

  @action.bound startPlayingSuite() {
    const { suite } = UiState.selectedTest;
    this.resetState();
    this.runId = uuidv4();
    this.currentRunningSuite = suite.id;
    this._testsToRun = [...suite.tests];
    this.testsCount = this._testsToRun.length;
    this.playNext();
  }

  @action.bound startPlaying(command) {
    const { test } = UiState.selectedTest;
    this.resetState();
    this.runId = uuidv4();
    this.currentRunningSuite = undefined;
    this.currentRunningTest = test;
    this.testsCount = 1;
    this.currentPlayingIndex = 0;
    if (command && command.constructor.name === "Command") {
      this.currentPlayingIndex = test.commands.indexOf(command);
    }
    this.runningQueue = test.commands.peek();
    this.isPlaying = true;
  }

  @action.bound playCommand(command, jumpToNext) {
    this.noStatisticsEffects = true;
    this.jumpToNextCommand = jumpToNext;
    this.paused = false;
    this.currentPlayingIndex = 0;
    this.errors = 0;
    this.hasFailed = false;
    this.aborted = false;
    this.currentRunningTest = UiState.selectedTest.test;
    this.runningQueue = [command];
    this.isPlaying = true;
  }

  @action.bound playNext() {
    this.currentRunningTest = this._testsToRun.shift();
    UiState.selectTest(this.currentRunningTest, UiState.selectedTest.suite);
    this.runningQueue = this.currentRunningTest.commands.peek();
    this.currentPlayingIndex = 0;
    this.errors = 0;
    setTimeout(action(() => {
      this.isPlaying = true;
    }), 0);
  }

  @action.bound stopPlaying() {
    this.isPlaying = false;
    this.paused = false;
  }

  @action.bound abortPlaying() {
    this.aborted = true;
    this.hasFailed = true;
    this._testsToRun = [];
    this.commandState.set(this.runningQueue[this.currentPlayingIndex].id, { state: PlaybackStates.Failed, message: "Playback aborted" });
    this.stopPlaying();
  }

  @action.bound pause() {
    this.paused = true;
  }

  @action.bound resume() {
    this.paused = false;
  }

  @action.bound finishPlaying() {
    this.testState.set(this.currentRunningTest.id, this.hasFinishedSuccessfully ? PlaybackStates.Passed : PlaybackStates.Failed);
    if (!this.hasFinishedSuccessfully) {
      this.hasFailed = true;
    }
    if (!this.noStatisticsEffects) {
      this.finishedTestsCount++;
      if (!this.hasFinishedSuccessfully) {
        this.hasFailed = true;
        this.failures++;
      }
    }
    this.stopPlaying();
    if (this.jumpToNextCommand) {
      UiState.selectNextCommand();
    }
    if (this._testsToRun.length) {
      this.playNext();
    } else if (this.currentRunningSuite) {
      this.suiteState.set(this.currentRunningSuite, !this.hasFailed ? PlaybackStates.Passed : PlaybackStates.Failed);
    }
  }

  @action.bound setPlayingIndex(index) {
    this.currentPlayingIndex = index;
  }

  @action.bound setCommandState(commandId, state, message) {
    if (state === PlaybackStates.Failed) {
      this.errors++;
    }
    if (this.isPlaying) {
      this.commandState.set(commandId, { state, message });
    }
  }

  @action.bound clearCommandStates() {
    this.commandState.clear();
  }

  @action.bound setDelay(delay) {
    this.delay = delay;
  }

  @action.bound resetState() {
    this.clearCommandStates();
    this.currentPlayingIndex = 0;
    this.finishedTestsCount = 0;
    this.noStatisticsEffects = false;
    this.failures = 0;
    this.errors = 0;
    this.hasFailed = false;
    this.aborted = false;
    this.paused = false;
  }
}

export const PlaybackStates = {
  Failed: "failed",
  Fatal: "fatal",
  Passed: "passed",
  Pending: "pending",
  Undetermined: "undetermined"
};

if (!window._playbackState) window._playbackState = new PlaybackState();

export default window._playbackState;
