import { action, observable } from "mobx";

export default class LogStore {
  @observable logs = [];

  @action.bound dispose() {
  }
}
