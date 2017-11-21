import { action, computed, observable, observe } from "mobx";
import SuiteState from "./SuiteState";
import PlaybackState from "./PlaybackState";
import Command from "../../models/Command";

class UiState {
  @observable selectedTest = {};
  @observable selectedCommand = null;
  @observable filterTerm = "";
  @observable dragInProgress = false;
  @observable clipboard = null;
  @observable isRecording = false;
  @observable isSelectingTarget = false;
  @observable pristineCommand = new Command();

  constructor() {
    this.suiteStates = {};
    this.filterFunction = this.filterFunction.bind(this);
    this.observePristine();
  }

  @action.bound setProject(project) {
    this._project = project;
    observe(this._project, "id", this.projectChanged);
  }

  @computed get filteredTests() {
    return this._project.tests.filter(this.filterFunction);
  }

  @computed get baseUrl() {
    return this._project.url;
  }

  @computed get gaugeSpeed() {
    const value = PlaybackState.maxDelay - PlaybackState.delay;
    const speed = Math.ceil(value / PlaybackState.maxDelay * 6);
    return speed ? speed : 1;
  }

  @action.bound copyToClipboard(item) {
    this.clipboard = item;
  }

  @action.bound selectTest(test, suite) {
    this.selectedTest = { test, suite };
    if (test && test.commands.length) {
      this.selectCommand(test.commands[0]);
    } else {
      this.selectCommand(undefined);
    }
  }
  
  @action.bound selectTestByIndex(index, suite) {
    if (!suite && index >= 0 && index < this.filteredTests.length) {
      this.selectTest(this.filteredTests[index]);
    }
  }

  @action.bound selectCommand(command) {
    this.selectedCommand = command;
  }

  @action.bound selectCommandByIndex(index) {
    const { test } = this.selectedTest; 
    if (index >= 0 && index < test.commands.length) {
      this.selectCommand(test.commands[index]);
    } else if (index === test.commands.length) {
      this.selectCommand(this.pristineCommand);
    }
  }

  @action.bound changeFilter(term) {
    this.filterTerm = term;
  }

  @action.bound setDrag(dragProgress) {
    this.dragInProgress = dragProgress;
  }

  @action.bound toggleRecord() {
    this.isRecording = !this.isRecording;
  }

  @action.bound setSelectingTarget(isSelecting) {
    this.isSelectingTarget = isSelecting;
  }

  @action.bound observePristine() {
    this.pristineDisposer = observe(this.pristineCommand, (change) => {
      this.pristineDisposer();
      this.selectedTest.test.addCommand(this.pristineCommand);
      this.pristineCommand = new Command();
      this.observePristine();
    });
  }

  addStateForSuite(suite) {
    this.suiteStates[suite.id] = new SuiteState(this, suite);
  }

  filterFunction({name}) {
    return (name.indexOf(this.filterTerm) !== -1);
  }

  setUrl(url, addToCache) {
    this._project.setUrl(url);
    if (addToCache) this._project.addUrl(url);
  }

  @action.bound projectChanged() {
    this.selectedTest = {};
    this.selectedCommand = null;
    this.filterTerm = "";
    this.dragInProgress = false;
    this.clipboard = null;
    this.isRecording = false;
    this.suiteStates = {};
  }
}

if (!window._state) window._state = new UiState();

export default window._state;
