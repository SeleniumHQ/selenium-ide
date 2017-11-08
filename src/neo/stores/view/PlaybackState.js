import { action, computed, observable } from "mobx";
import UiState from "./UiState";

class PlaybackState {
  @observable isPlaying = false;
  @observable currentPlayingIndex = 0;
  @observable commandsCount = 0;
  @observable commandState = new Map();
  @observable runs = 0;
  @observable failures = 0;
  @observable hasFailed = false;

  constructor() {
    this._currentRunningTest = null;
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

  @action.bound stopPlaying() {
    this.isPlaying = false;
  }
  @action.bound startPlaying() {
    this.isPlaying = true;
    const { test } = UiState.selectedTest;
    if (this._currentRunningTest !== test.id) {
      this.resetState();
      this._currentRunningTest = test.id;
    }
    this.runs++;
    this.hasFailed = false;
    this.commandsCount = test.commands.length;
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
