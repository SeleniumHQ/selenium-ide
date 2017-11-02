import { action, observable } from "mobx";

class ModalState {
  @observable editedSuite = null;

  @action.bound editSuite(suite) {
    this.editedSuite = suite;
  }
}

if (!window._modalState) window._modalState = new ModalState();

export default window._modalState;
