import { observable } from "mobx";
import uuidv4 from "uuid/v4";

export default class TestCase {
  id = null;
  @observable name = null;

  constructor(id = uuidv4(), name = "Untitled Test") {
    this.id = id;
    this.name = name;
  }
}
