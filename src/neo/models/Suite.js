import { action, observable, computed } from "mobx";
import uuidv4 from "uuid/v4";
import SortBy from "sort-array";

export default class Suite {
  id = null;
  @observable name = null;
  @observable _tests = [];

  constructor(id = uuidv4(), name = "Untitled Suite") {
    this.id = id;
    this.name = name;
    this.setName = this.setName.bind(this);
    this.addTestCase = this.addTestCase.bind(this);
    this.removeTestCase = this.removeTestCase.bind(this);
  }

  @computed get tests() {
    return SortBy(this._tests, "name");
  }

  isTest(test) {
    return (test && test.constructor.name === "TestCase");
  }

  @action setName(name) {
    this.name = name;
  }

  @action addTestCase(test) {
    if (!this.isTest(test)) {
      throw new Error(`Expected to receive TestCase instead received ${test ? test.constructor.name : test}`);
    } else {
      this._tests.push(test);
    }
  }

  @action removeTestCase(test) {
    if (!this.isTest(test)) {
      throw new Error(`Expected to receive TestCase instead received ${test ? test.constructor.name : test}`);
    } else {
      this._tests.remove(test);
    }
  }

  @action replaceTestCases(tests) {
    if (tests.filter(test => !this.isTest(test)).length) {
      throw new Error("Expected to receive array of TestCase");
    } else {
      this._tests.replace(tests);
    }
  }
}
