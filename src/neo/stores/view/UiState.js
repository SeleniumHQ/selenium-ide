import { action, observable } from "mobx";

class UiState {
  @observable selectedTest = null;
  @observable selectedCommand = null;
  @observable filterTerm = "";
  @observable dragInProgress = false;
  @observable clipboard = null;

  constructor() {
    this.copyToClipboard = this.copyToClipboard.bind(this);
    this.selectTest = this.selectTest.bind(this);
    this.selectCommand = this.selectCommand.bind(this);
    this.changeFilter = this.changeFilter.bind(this);
    this.setDrag = this.setDrag.bind(this);
  }

  @action copyToClipboard(item) {
    this.clipboard = item;
  }

  @action selectTest(testId) {
    this.selectedTest = testId;
  }

  @action selectCommand(command) {
    this.selectedCommand = command;
  }

  @action changeFilter(term) {
    this.filterTerm = term;
  }

  @action setDrag(dragProgress) {
    this.dragInProgress = dragProgress;
  }
}

if (!window._state) window._state = new UiState();

export default window._state;
