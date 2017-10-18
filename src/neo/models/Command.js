import { observable } from "mobx";
import uuidv4 from "uuid/v4";

export default class Command {
  id = null;
  @observable command = null;
  @observable target = null;
  @observable value = null;

  constructor(id = uuidv4()) {
    this.id = id;
  }
}

export const Commands = Object.freeze({
  open: "open"
});
