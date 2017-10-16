import { observable } from "mobx";
import uuidv4 from "uuid/v4";

export default class Test {
  id = null;
  @observable name = "";

  store = null;

  constructor(store, id = uuidv4()) {
    this.store = store;
    this.id = id;
  }
}
