import { action, observable } from "mobx";

class UiState {
  @observable selectedTest = null;
  @observable filterTerm = "";

  constructor() {
    this.selectTest = this.selectTest.bind(this);
    this.changeFilter = this.changeFilter.bind(this);
  }

  @action selectTest(testId) {
    this.selectedTest = testId;
  }

  @action changeFilter(term) {
    this.filterTerm = term;
  }
}

if (!window._state) window._state = new UiState();

export default window._state;
