import { action, observable } from "mobx";

class UiState {
  @observable selectedTest = {};
  @observable selectedCommand = null;
  @observable filterTerm = "";
  @observable dragInProgress = false;
  @observable clipboard = null;

  @action.bound copyToClipboard(item) {
    this.clipboard = item;
  }

  @action.bound selectTest(testId, suiteId) {
    this.selectedTest = { testId, suiteId };
  }

  @action.bound selectCommand(command) {
    this.selectedCommand = command;
  }

  @action.bound changeFilter(term) {
    this.filterTerm = term;
  }

  @action.bound setDrag(dragProgress) {
    this.dragInProgress = dragProgress;
  }
}

if (!window._state) window._state = new UiState();

export default window._state;
