import { action, computed, observable } from "mobx";
import SuiteState from "./SuiteState";

class UiState {
  @observable selectedTest = null;
  @observable selectedCommand = null;
  @observable filterTerm = "";
  @observable dragInProgress = false;
  @observable editedSuite = null;
  @observable clipboard = null;

  constructor() {
    this.suiteStates = {};
    this.filterFunction = this.filterFunction.bind(this);
    this.addStateForSuite = this.addStateForSuite.bind(this);
    this.copyToClipboard = this.copyToClipboard.bind(this);
    this.selectTest = this.selectTest.bind(this);
    this.selectCommand = this.selectCommand.bind(this);
    this.changeFilter = this.changeFilter.bind(this);
    this.setDrag = this.setDrag.bind(this);
    this.editSuite = this.editSuite.bind(this);
  }

  @computed get filteredTests() {
    return this._project.tests.filter(this.filterFunction);
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

  @action editSuite(suite) {
    this.editedSuite = suite;
  }

  addStateForSuite(suite) {
    this.suiteStates[suite.id] = new SuiteState(this, suite);
  }

  filterFunction({name}) {
    return (name.indexOf(this.filterTerm) !== -1);
  }
}

if (!window._state) window._state = new UiState();

export default window._state;
