import { observable } from "mobx";
import uuidv4 from "uuid/v4";

export default class Suite {
  id = null;
  @observable name = null;
  @observable tests = [];

  constructor(id = uuidv4(), name = "Untitled Suite") {
    this.id = id;
    this.name = name;
    this.addTest = this.addTest.bind(this);
    this.removeTest = this.removeTest.bind(this);
  }

  addTest(test) {
    if (!test || test.constructor.name !== "Test") {
      throw new Error(`Expected to receive Test instead received ${test ? test.constructor.name : test}`);
    } else {
      this.tests.push(test);
    }
  }

  removeTest(test) {
    if (!test || test.constructor.name !== "Test") {
      throw new Error(`Expected to receive Test instead received ${test ? test.constructor.name : test}`);
    } else {
      this.tests.remove(test);
    }
  }
}
