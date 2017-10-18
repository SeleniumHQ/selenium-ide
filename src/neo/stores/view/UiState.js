import { observable } from "mobx";

class UiState {
  @observable selectedTest = null;
}

if (!window._state) window._state = new UiState();

export default window._state;
