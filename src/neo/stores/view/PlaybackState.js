import { action, observable } from "mobx";

class PlaybackState {
  @observable isPlaying = false;
  @observable currentPlayingIndex = 0;
  @observable commandState = new Map();

  @action.bound togglePlaying() {
    this.isPlaying = !this.isPlaying;
  }

  @action.bound setPlayingIndex(index) {
    this.currentPlayingIndex = index;
  }

  @action.bound setCommandState(commandId, state) {
    this.commandState.set(commandId, state);
  }
}

if (!window._playbackState) window._playbackState = new PlaybackState();

export default window._playbackState;
