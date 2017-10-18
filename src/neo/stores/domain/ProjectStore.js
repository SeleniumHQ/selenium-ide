import { action, observable } from "mobx";
import SortBy from "sort-array";
import TestCase from "../../models/TestCase";
import Suite from "../../models/Suite";

export default class ProjectStore {
  @observable name = "";
  @observable tests = [];
  @observable suites = [];

  constructor(name) {
    this.name = name;
    this.addTestCase = this.addTestCase.bind(this);
  }

  @action createSuite(...argv) {
    const suite = new Suite(undefined, ...argv);
    this.suites.push(suite);
    this.suites.replace(SortBy(this.suites, "name"));

    return suite;
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
      this.tests.push(test);
      this.tests.replace(SortBy(this.tests, "name"));
    }
  }

  @action deleteTestCase(test) {
    if (!test || test.constructor.name !== "TestCase") {
      throw new Error(`Expected to receive TestCase instead received ${test ? test.constructor.name : test}`);
    } else {
      this.suites.forEach(suite => {
        suite.removeTestCase(test);
      });
      this.tests.remove(test);
    }
  }
}
