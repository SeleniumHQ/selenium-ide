import { action, observable, computed } from "mobx";
import SortBy from "sort-array";
import TestCase from "../../models/TestCase";
import Suite from "../../models/Suite";

export default class ProjectStore {
  @observable modified = false;
  @observable name = "";
  @observable url = "";
  @observable _tests = [];
  @observable _suites = [];

  constructor(name = "Untitled Project") {
    this.name = name;
    this.setUrl = this.setUrl.bind(this);
    this.changeName = this.changeName.bind(this);
    this.setModified = this.setModified.bind(this);
    this.createSuite = this.createSuite.bind(this);
    this.deleteSuite = this.deleteSuite.bind(this);
    this.createTestCase = this.createTestCase.bind(this);
    this.addTestCase = this.addTestCase.bind(this);
    this.deleteTestCase = this.deleteTestCase.bind(this);
  }

  @computed get suites() {
    return SortBy(this._suites, "name");
  }

  @computed get tests() {
    return SortBy(this._tests, "name");
  }

  @action setUrl(url) {
    this.url = url;
  }

  @action changeName(name) {
    this.name = name;
  }

  @action setModified() {
    this.modified = true;
  }

  @action createSuite(...argv) {
    const suite = new Suite(undefined, ...argv);
    this._suites.push(suite);

    return suite;
  }

  @action deleteSuite(suite) {
    this._suites.remove(suite);
  }

  @action createTestCase(...argv) {
    const test = new TestCase(undefined, ...argv);
    this.addTestCase(test);

    return test;
  }

  @action addTestCase(test) {
    if (!test || test.constructor.name !== "TestCase") {
      throw new Error(`Expected to receive TestCase instead received ${test ? test.constructor.name : test}`);
    } else {
      this._tests.push(test);
    }
  }

  @action deleteTestCase(test) {
    if (!test || test.constructor.name !== "TestCase") {
      throw new Error(`Expected to receive TestCase instead received ${test ? test.constructor.name : test}`);
    } else {
      this.suites.forEach(suite => {
        suite.removeTestCase(test);
      });
      this._tests.remove(test);
    }
  }
}
