import { reaction } from "mobx";
import UiState from "../../stores/view/UiState";

reaction(
  () => UiState.isRecording,
  isRecording => { window.isRecording = isRecording; }
);

function isEmpty(commands, command) {
  return (commands.length === 0 && command === "open");
}

window.getRecordsArray = function() {
  return [];
};

window.addCommandAuto = function(command, targets, value) {
  const { test } = UiState.selectedTest;
  const newCommand = test.createCommand();
  newCommand.setTarget(targets[0][0]);
  newCommand.setValue(value);
  if (isEmpty(test.commands, command) && command === "open") {
    const url = new URL(command);
    UiState.setUrl(url.origin, true);
    newCommand.setCommand(url.pathname);
  } else if (command !== "open") {
    newCommand.setCommand(command);
  }
};
