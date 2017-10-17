import { observable } from "mobx";
import Test from "../../models/Test";

export default class ProjectStore {
  @observable name = "";
  @observable tests = [];
  @observable suites = [];

  constructor(name) {
    this.name = name;
    this.addTest = this.addTest.bind(this);
  }

  createTest(...argv) {
    const test = new Test(undefined, ...argv);
    this.addTest(test);

    return test;
  }

  addTest(test) {
    if (!test || test.constructor.name !== "Test") {
      throw new Error(`Expected to receive Test instead received ${test ? test.constructor.name : test}`);
    } else {
      this.tests.push(test);
    }
  }

  deleteTest(test) {
    if (!test || test.constructor.name !== "Test") {
      throw new Error(`Expected to receive Test instead received ${test ? test.constructor.name : test}`);
    } else {
      this.suites.forEach(suite => {
        suite.removeTest(test);
      });
      this.tests.remove(test);
    }
  }
}
