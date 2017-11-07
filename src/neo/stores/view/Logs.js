import { observable } from "mobx";

export default class LogStore {
  @observable logs = [];
}
