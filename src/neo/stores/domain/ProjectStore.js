import { observable } from "mobx";

export default class ProjectStore {
  @observable name = "";
  @observable tests = [];
  @observable suite = [];

  constructor(name) {
    this.name = name;
    this.addTest = this.addTest.bind(this);
  }

  addTest(test) {
    if (!test || test.constructor.name !== "Test") {
      throw new Error(`Expected to receive Test instead received ${test ? test.constructor.name : test}`);
    } else {
      this.tests.push(test);
    }
  }
}
