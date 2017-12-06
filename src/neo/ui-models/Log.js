import { action, observable } from "mobx";
import uuidv4 from "uuid/v4";

export default class Log {
  id = uuidv4();
  @observable index = null;
  @observable commandId = null;
  @observable message = null;
  @observable error = null;
  @observable status = null;
  @observable isNotice = false;

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

  @action.bound setMessage(message) {
    this.message = message;
  }

  @action.bound setError(error) {
    this.error = error;
  }

  @action.bound setStatus(status) {
    this.status = status;
  }

  @action.bound setNotice() {
    this.isNotice = true;
  }
}

export const LogTypes = {
  Success: "success",
  Error: "error"
};
