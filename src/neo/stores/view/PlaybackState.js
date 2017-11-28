import { action, computed, observable } from "mobx";
import UiState from "./UiState";

class PlaybackState {
  @observable isPlaying = false;
  @observable currentPlayingIndex = 0;
  @observable currentRunningTest = null;
  @observable currentRunningSuite = null;
  @observable commandsCount = 0;
  @observable commandState = new Map();
  @observable testState = new Map();
  @observable suiteState = new Map();
  @observable runs = 0;
  @observable failures = 0;
  @observable hasFailed = false;
  @observable aborted = false;
  @observable paused = false;
  @observable delay = 0;

  constructor() {
    this.maxDelay = 3000;
    this._testsToRun = [];
    this.runningQueue = [];
  }

  @computed get finishedCommandsCount() {
    let counter = 0;

    this.commandState.forEach(({ state }) => {
      if (state !== PlaybackStates.Pending) {
        counter++;
      }
    });

    return counter;
  }

  @computed get hasFinishedSuccessfully() {
    return this.runningQueue.filter(({id}) => (
      this.commandState.get(id) ? this.commandState.get(id).state === PlaybackStates.Passed : false
    )).length === this.runningQueue.length;
  }

  @action.bound startPlayingSuite() {
    const { suite } = UiState.selectedTest;
    if (this.currentRunningSuite !== (suite ? suite.id : undefined)) {
      this.resetState();
      this.currentRunningSuite = suite.id;
    }
    this.clearCommandStates();
    this.hasFailed = false;
    this.runs++;
    this._testsToRun = [...suite.tests];
    this.commandsCount = this._testsToRun.reduce((counter, test) => (counter + test.commands.length), 0);
    this.playNext();
  }

  @action.bound startPlaying(command) {
    const { test } = UiState.selectedTest;
    if (this.currentRunningSuite || !this.currentRunningTest || this.currentRunningTest.id !== test.id) {
      this.resetState();
      this.currentRunningSuite = undefined;
      this.currentRunningTest = test;
    }
    this.clearCommandStates();
    if (command) this.currentPlayingIndex = test.commands.indexOf(command);
    this.runs++;
    this.hasFailed = false;
    this.runningQueue = test.commands.peek();
    this.commandsCount = test.commands.length - this.currentPlayingIndex;
    this.isPlaying = true;
  }

  @action.bound playCommand(command) {
    this.resetState();
    this.currentRunningTest = UiState.selectedTest.test;
    this.runningQueue = [command];
    this.commandsCount = 1;
    this.isPlaying = true;
  }

  @action.bound playNext() {
    this.currentRunningTest = this._testsToRun.shift();
    UiState.selectTest(this.currentRunningTest, UiState.selectedTest.suite);
    this.runningQueue = this.currentRunningTest.commands.peek();
    this.currentPlayingIndex = 0;
    this.isPlaying = true;
  }

  @action.bound stopPlaying() {
    this.isPlaying = false;
  }

  @action.bound abortPlaying() {
    this.aborted = true;
    this.hasFailed = true;
    this._testsToRun = [];
    this.commandState.set(this.runningQueue[this.currentPlayingIndex].id, { state: PlaybackStates.Failed, message: "Playback aborted" });
    this.isPlaying = false;
  }

  @action.bound pause() {
    this.paused = true;
  }

  @action.bound resume() {
    this.paused = false;
  }

  @action.bound finishPlaying() {
    this.isPlaying = false;
    this.testState.set(this.currentRunningTest.id, this.hasFinishedSuccessfully ? PlaybackStates.Passed : PlaybackStates.Failed);
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
    if (this.isPlaying) {
      if (state === PlaybackStates.Failed) {
        this.hasFailed = true;
        this.failures++;
      }
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
    this.runs = 0;
    this.failures = 0;
    this.hasFailed = false;
    this.aborted = false;
    this.paused = false;
  }
}

export const PlaybackStates = {
  Passed: "passed",
  Failed: "failed",
  Pending: "pending"
};

if (!window._playbackState) window._playbackState = new PlaybackState();

export default window._playbackState;
