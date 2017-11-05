import { action, observable } from "mobx";

class PlaybackState {
  @observable isPlaying = false;
  @observable currentPlayingIndex = 0;

  @action.bound togglePlaying() {
    this.isPlaying = !this.isPlaying;
  }
}

if (!window._playbackState) window._playbackState = new PlaybackState();

export default window._playbackState;
