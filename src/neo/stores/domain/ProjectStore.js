import { observable } from "mobx";

export default class ProjectStore {
  @observable name = "";
  @observable tests = [];
  @observable suite = [];
}
