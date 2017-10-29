import { action, reaction, observable } from "mobx";
import SortBy from "sort-array";
import TestCase from "../../models/TestCase";
import Suite from "../../models/Suite";

export default class ProjectStore {
  @observable modified = false;
  @observable name = "";
  @observable tests = [];
  @observable suites = [];

  constructor(name = "Untitled Project") {
    this.name = name;
    this.changeName = this.changeName.bind(this);
    this.setModified = this.setModified.bind(this);
    this.createSuite = this.createSuite.bind(this);
    this.deleteSuite = this.deleteSuite.bind(this);
    this.createTestCase = this.createTestCase.bind(this);
    this.addTestCase = this.addTestCase.bind(this);
    this.deleteTestCase = this.deleteTestCase.bind(this);
    this.sortSuites = this.sortSuites.bind(this);
    this.sortTests = this.sortTests.bind(this);
    this.sortSuitesReaction = reaction(() => this.suites.map(suite => suite.name), this.sortSuites);
    this.sortTestsReaction = reaction(() => this.tests.map(test => test.name), this.sortTests);
  }

  @action changeName(name) {
    this.name = name;
  }

  @action setModified() {
    this.modified = true;
  }

  @action createSuite(...argv) {
    const suite = new Suite(undefined, ...argv);
    this.suites.push(suite);

    return suite;
  }

  @action deleteSuite(suite) {
    this.suites.remove(suite);
  }

  @action sortSuites() {
    const sorted = SortBy(this.suites, "name");
    if(JSON.stringify(sorted) !== JSON.stringify(this.suites.peek())) this.suites.replace(sorted);
  }

  @action sortTests() {
    const sorted = SortBy(this.tests, "name");
    if(JSON.stringify(sorted) !== JSON.stringify(this.tests.peek())) this.tests.replace(sorted);
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
