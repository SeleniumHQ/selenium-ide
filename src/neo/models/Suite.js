import { action, reaction, observable } from "mobx";
import uuidv4 from "uuid/v4";
import SortBy from "sort-array";

export default class Suite {
  id = null;
  @observable name = null;
  @observable tests = [];

  constructor(id = uuidv4(), name = "Untitled Suite") {
    this.id = id;
    this.name = name;
    this.setName = this.setName.bind(this);
    this.addTestCase = this.addTestCase.bind(this);
    this.removeTestCase = this.removeTestCase.bind(this);
    this.sortTests = this.sortTests.bind(this);
    this.sortTestsReaction = reaction(() => this.tests.map(test => test.name), this.sortTests);
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
      this.tests.push(test);
    }
  }

  @action removeTestCase(test) {
    if (!this.isTest(test)) {
      throw new Error(`Expected to receive TestCase instead received ${test ? test.constructor.name : test}`);
    } else {
      this.tests.remove(test);
    }
  }

  @action replaceTestCases(tests) {
    if (tests.filter(test => !this.isTest(test)).length) {
      throw new Error("Expected to receive array of TestCase");
    } else {
      this.tests.replace(tests);
    }
  }

  @action sortTests() {
    const sorted = SortBy(this.tests, "name");
    if(JSON.stringify(sorted) !== JSON.stringify(this.tests.peek())) this.tests.replace(sorted);
  }
}
