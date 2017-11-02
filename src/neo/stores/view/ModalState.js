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
  @action.bound createSuite() {
    this.rename(null, (name) => {
      if (name) this._project.createSuite(name);
    });
  }
  @action.bound createTest() {
    this.rename(null, (name) => {
      if (name) this._project.createTestCase(name);
    });
  }
}

if (!window._modalState) window._modalState = new ModalState();

export default window._modalState;
