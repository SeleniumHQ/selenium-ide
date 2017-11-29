import { action, observe, observable } from "mobx";
import uuidv4 from "uuid/v4";
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

  @action.bound addLog(log, type) {
    if (!this.logs.length || this.logs[this.logs.length - 1].message !== log) {
      this.logs.push({
        id: uuidv4(),
        status: type,
        message: log
      });
    }
  }

  @action.bound clearLogs() {
    this.logs.clear();
  }

  logPlayingState(isPlaying) {
    if (isPlaying) {
      this.addLog(`Started playback of '${PlaybackState.currentRunningTest.name}'`, LogTypes.Notice);
    } else if (PlaybackState.aborted) {
      this.addLog(`Playback of '${PlaybackState.currentRunningTest.name}' was aborted`, LogTypes.Notice);
    } else {
      this.addLog(`Finished playback of '${PlaybackState.currentRunningTest.name}'${PlaybackState.hasFailed ? " with errors" : " successfully"}`, LogTypes.Notice);
    }
  }

  parseCommandStateChange(commandId, status, cb) {
    const command = PlaybackState.currentRunningTest.commands.find(({id}) => (id === commandId));
    cb(command, status);
  }

  logCommandState(command, status) {
    if (status) {
      switch(status.state) {
        case PlaybackStates.Pending:
          this.addLog(status.message ? status.message : `Trying to execute ${command.command} on ${command.target}${command.value ? " with value " + command.value : ""}...`);
          break;
        case PlaybackStates.Failed:
          this.addLog(`Execution failed: ${status.message}`, LogTypes.Error);
          break;
        case PlaybackStates.Passed:
          this.addLog(`Executed: ${command.command} on ${command.target}${command.value ? " with value " + command.value : ""} successfully`, LogTypes.Success);
          break;
      }
    }
  }

  dispose() {
    this.playbackDisposer();
    this.commandStateDisposer();
  }
}

export const LogTypes = {
  Notice: "notice",
  Success: "success",
  Error: "error"
};
