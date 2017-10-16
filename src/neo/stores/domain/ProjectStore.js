import { observable } from "mobx";

export default class ProjectStore {
  name = observable("");
  tests = observable([]);
  suite = observable([]);
}
