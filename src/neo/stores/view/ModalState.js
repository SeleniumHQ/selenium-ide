import { action, observable } from "mobx";
import UiState from "./UiState";

class ModalState {
  @observable editedSuite = null;
  @observable renameState = {};

  constructor() {
    this.renameTest = this.rename.bind(this, Types.test);
    this.renameSuite = this.rename.bind(this, Types.suite);
    this.rename = this.rename.bind(this);
  }

  @action rename(type, value, cb) {
    this.renameState = {
      value,
      type,
      done: (name) => {
        let names;
        if (type === Types.test) names = UiState._project.tests;
        else if (type === Types.suite) names = UiState._project.suites;
        if (name === value || this.nameIsUnique(name, names)) {
          cb(name);
          this.cancelRenaming();
        }
      }
    };
  }

  @action.bound editSuite(suite) {
    this.editedSuite = suite;
  }

  @action.bound cancelRenaming() {
    this.renameState = {};
  }

  @action.bound createSuite() {
    this.rename("suite", null, (name) => {
      if (name) this._project.createSuite(name);
    });
  }

  @action.bound createTest() {
    this.rename("test case", null, (name) => {
      if (name) {
        const test = this._project.createTestCase(name);
        UiState.selectTest(test);
      }
    });
  }

  @action.bound deleteSuite(suite) {
    this.showAlert({
      title: "Delete suite",
      description: `This will permanently delete '${suite.name}'`,
      cancelLabel: "cancel",
      confirmLabel: "delete"
    }, (choseDelete) => {
      if (choseDelete) {
        this._project.deleteSuite(suite);
      }
    });
  }

  @action.bound deleteTest(testCase) {
    this.showAlert({
      title: "Delete test case",
      description: `This will permanently delete '${testCase.name}', and remove it from all it's suites`,
      cancelLabel: "cancel",
      confirmLabel: "delete"
    }, (choseDelete) => {
      if (choseDelete) {
        this._project.deleteTestCase(testCase);
      }
    });
  }

  nameIsUnique(value, list) {
    return !list.find(({ name }) => name === value);
  }
}

const Types = {
  test: "test case",
  suite: "suite"
};

if (!window._modalState) window._modalState = new ModalState();

export default window._modalState;
