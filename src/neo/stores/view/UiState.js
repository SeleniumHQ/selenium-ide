import { action, observable } from "mobx";

class UiState {
  @observable selectedTest = null;

  constructor() {
    this.selectTest = this.selectTest.bind(this);
  }

  @action selectTest(testId) {
    this.selectedTest = testId;
  }
}

if (!window._state) window._state = new UiState();

export default window._state;
