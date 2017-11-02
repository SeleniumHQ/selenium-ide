import { action, observable } from "mobx";

class ModalState {
  @observable editedSuite = null;
  @observable renameState = null;

  @action.bound editSuite(suite) {
    this.editedSuite = suite;
  }

  @action.bound cancelRenaming() {
    this.renameState = null;
  }

  @action.bound rename(value, cb) {
    this.renameState = {
      value,
      done: (...argv) => {
        cb(...argv);
        this.cancelRenaming();
      }
    };
  }
}

if (!window._modalState) window._modalState = new ModalState();

export default window._modalState;
