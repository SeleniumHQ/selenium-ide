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
  if (isEmpty(test.commands, command)) {
    const newCommand = test.createCommand();
    newCommand.setCommand(command);
    newCommand.setValue(value);
    const url = new URL(targets);
    UiState.setUrl(url.origin, true);
    newCommand.setTarget(url.pathname);
  } else if (command !== "open") {
    const newCommand = test.createCommand(UiState.selectedTest.test.commands.indexOf(UiState.selectedCommand));
    newCommand.setCommand(command);
    newCommand.setValue(value);
    newCommand.setTarget(targets[0][0]);
  }
};
