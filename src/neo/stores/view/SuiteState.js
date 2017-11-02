import { action, computed, observable } from "mobx";

export default class SuiteState {
  @observable isOpen = false;

  constructor(UiState, suite) {
    this.filteredTests = computed(() =>
      suite.tests.filter(UiState.filterFunction)
    );
  }

  @action.bound setOpen(isOpen) {
    this.isOpen = isOpen;
  }
}
