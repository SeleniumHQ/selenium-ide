import { action, observable } from "mobx";
import uuidv4 from "uuid/v4";

export default class Suite {
  id = null;
  @observable name = null;
  @observable tests = [];

  constructor(id = uuidv4(), name = "Untitled Suite") {
    this.id = id;
    this.name = name;
    this.addTestCase = this.addTestCase.bind(this);
    this.removeTestCase = this.removeTestCase.bind(this);
  }

  @action addTestCase(test) {
    if (!test || test.constructor.name !== "TestCase") {
      throw new Error(`Expected to receive TestCase instead received ${test ? test.constructor.name : test}`);
    } else {
      this.tests.push(test);
    }
  }

  @action removeTestCase(test) {
    if (!test || test.constructor.name !== "TestCase") {
      throw new Error(`Expected to receive TestCase instead received ${test ? test.constructor.name : test}`);
    } else {
      this.tests.remove(test);
    }
  }
}
