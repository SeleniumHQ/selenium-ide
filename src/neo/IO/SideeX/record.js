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
  if (isEmpty(test.commands, command) || command !== "open") {
    const newCommand = test.createCommand();
    newCommand.setCommand(command);
    newCommand.setTarget(targets[0]);
    newCommand.setValue(value);
  }
};
