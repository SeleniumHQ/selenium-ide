import { action, computed, observable } from "mobx";

class PlaybackState {
  @observable isPlaying = false;
  @observable currentPlayingIndex = 0;
  @observable commandState = new Map();
  @observable runs = 0;
  @observable failures = 0;
  @observable hasFailed = false;

  @computed get finishedCommandsCount() {
    let counter = 0;

    this.commandState.forEach(state => {
      if (state !== CommandStates.Pending) {
        counter++;
      }
    });

    return counter;
  }

  @action.bound togglePlaying() {
    this.runs++;
    this.isPlaying = !this.isPlaying;
  }

  @action.bound setPlayingIndex(index) {
    this.currentPlayingIndex = index;
  }

  @action.bound setCommandState(commandId, state) {
    this.commandState.set(commandId, state);
  }

  @action.bound clearCommandStates() {
    this.commandState.clear();
  }
}

export const CommandStates = {
  Passed: "passed",
  Failed: "failed",
  Pending: "pending"
};

if (!window._playbackState) window._playbackState = new PlaybackState();

export default window._playbackState;
