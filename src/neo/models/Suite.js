import { observable } from "mobx";
import uuidv4 from "uuid/v4";

export default class Suite {
  id = null;
  @observable name = "Untitled Suite";
  @observable tests = [];

  store = null;

  constructor(store, id = uuidv4()) {
    this.store = store;
    this.id = id;
    this.addTest = this.addTest.bind(this);
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
