import { action, computed, observable } from "mobx";
import UiState from "./UiState";

class PlaybackState {
  @observable isPlaying = false;
  @observable currentPlayingIndex = 0;
  @observable currentRunningTest = null;
  @observable commandsCount = 0;
  @observable commandState = new Map();
  @observable runs = 0;
  @observable failures = 0;
  @observable hasFailed = false;

  constructor() {
    this._currentRunningSuite = null;
    this._testsToRun = [];
  }

  @computed get finishedCommandsCount() {
    let counter = 0;

    this.commandState.forEach(({ state }) => {
      if (state !== CommandStates.Pending) {
        counter++;
      }
    });

    return counter;
  }

  @action.bound startPlayingSuite() {
    const { suite } = UiState.selectedTest;
    if (this._currentRunningSuite !== (suite ? suite.id : undefined)) {
      this.resetState();
      this._currentRunningSuite = suite.id;
    }
    this.clearCommandStates();
    this.hasFailed = false;
    this.runs++;
    this._testsToRun = [...suite.tests];
    this.commandsCount = this._testsToRun.reduce((counter, test) => (counter + test.commands.length), 0);
    this.playNext();
  }

  @action.bound startPlaying() {
    const { test } = UiState.selectedTest;
    if (this._currentRunningSuite || !this.currentRunningTest || this.currentRunningTest.id !== test.id) {
      this.resetState();
      this._currentRunningSuite = undefined;
      this.currentRunningTest = test;
    }
    this.clearCommandStates();
    this.runs++;
    this.hasFailed = false;
    this.commandsCount = test.commands.length;
    this.isPlaying = true;
  }

  @action.bound playNext() {
    this.currentRunningTest = this._testsToRun.shift();
    this.isPlaying = true;
  }

  @action.bound stopPlaying() {
    this.isPlaying = false;
  }

  @action.bound abortPlaying() {
    this.isPlaying = false;
    this._testsToRun = [];
  }

  @action.bound finishPlaying() {
    this.isPlaying = false;
    if (this._testsToRun.length) {
      this.playNext();
    }
  }

  @action.bound setPlayingIndex(index) {
    this.currentPlayingIndex = index;
  }

  @action.bound setCommandState(commandId, state, message) {
    if (state === CommandStates.Failed) {
      this.hasFailed = true;
      this.failures++;
    }
    this.commandState.set(commandId, { state, message });
  }

  @action.bound clearCommandStates() {
    this.commandState.clear();
  }

  @action.bound resetState() {
    this.clearCommandStates();
    this.currentPlayingIndex = 0;
    this.runs = 0;
    this.failures = 0;
    this.hasFailed = false;
  }
}

export const CommandStates = {
  Passed: "passed",
  Failed: "failed",
  Pending: "pending"
};

if (!window._playbackState) window._playbackState = new PlaybackState();

export default window._playbackState;
