import { observable } from "mobx";

class UiState {
  @observable selectedTest = null;
}

export default new UiState();
