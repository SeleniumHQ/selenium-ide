import { action, observe, observable } from "mobx";
import Log, { LogTypes } from "../../ui-models/Log";
import PlaybackState, { PlaybackStates } from "./PlaybackState";

export default class LogStore {
  @observable logs = [];

  constructor() {
    this.playbackDisposer = observe(PlaybackState, "isPlaying", (isPlaying) => {
      this.logPlayingState(isPlaying.newValue);
    });
    this.commandStateDisposer = observe(PlaybackState.commandState, (change) => {
      this.parseCommandStateChange(change.name, change.newValue, this.logCommandState);
    });
    this.logPlayingState = this.logPlayingState.bind(this);
    this.parseCommandStateChange = this.parseCommandStateChange.bind(this);
    this.logCommandState = this.logCommandState.bind(this);
    this.dispose = this.dispose.bind(this);
  }

  @action.bound addLog(log) {
    if (!this.logs.length || this.logs[this.logs.length - 1].message !== log.message) {
      this.logs.push(log);
    }
  }

  parseCommandStateChange(commandId, status, cb) {
    const command = PlaybackState.currentRunningTest.commands.find(({id}) => (id === commandId));
    cb(command, status);
  }

  @action.bound clearLogs() {
    this.logs.clear();
  }

  logPlayingState(isPlaying) {
    let log;
    if (isPlaying) {
      log = new Log(`Running '${PlaybackState.currentRunningTest.name}'`);
      log.setNotice();
    } else if (PlaybackState.aborted) {
      log = new Log(`'${PlaybackState.currentRunningTest.name}' was aborted`, LogTypes.Error);
      log.setNotice();
    } else {
      log = new Log(`'${PlaybackState.currentRunningTest.name}' completed ${PlaybackState.hasFailed ? `with ${PlaybackState.failures} error(s)` : "successfully"}`, PlaybackState.hasFailed ? LogTypes.Error : LogTypes.Success);
      log.setNotice();
    }
    this.addLog(log);
  }

  logCommandState(command, status) {
    if (status) {
      const index = PlaybackState.currentRunningTest.commands.indexOf(command) + 1;
      let log;
      if (this.logs.length && this.logs[this.logs.length - 1].commandId === command.id) {
        log = this.logs[this.logs.length - 1];
      } else {
        log = new Log();
        log.setIndex(index);
        log.setCommandId(command.id);
      }
      switch(status.state) {
        case PlaybackStates.Pending:
          log.setMessage(status.message ? status.message : `Trying to execute ${command.command} on ${command.target}${command.value ? " with value " + command.value : ""}...`);
          break;
        case PlaybackStates.Failed:
          log.setError(status.message);
          log.setStatus(LogTypes.Error);
          break;
        case PlaybackStates.Passed:
          log.setStatus(LogTypes.Success);
          break;
      }
      this.addLog(log);
    }
  }

  dispose() {
    this.playbackDisposer();
    this.commandStateDisposer();
  }
}
