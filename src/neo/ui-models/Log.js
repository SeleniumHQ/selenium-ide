import { action, observable } from "mobx";
import uuidv4 from "uuid/v4";

export default class Log {
  id = uuidv4();
  @observable index = null;
  @observable commandId = null;
  @observable message = null;
  @observable status = null;

  constructor(message, status) {
    this.message = message;
    this.status = status;
  }

  @action.bound setIndex(index) {
    this.index = index;
  }

  @action.bound setCommandId(commandId) {
    this.commandId = commandId;
  }
}

export const LogTypes = {
  Notice: "notice",
  Success: "success",
  Error: "error"
};
