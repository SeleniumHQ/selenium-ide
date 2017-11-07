import { reaction } from "mobx";
import PlaybackState, { CommandStates } from "../../stores/view/PlaybackState";
import UiState from "../../stores/view/UiState";
const { ExtCommand, isExtCommand } = window;

const extCommand = new ExtCommand();
let baseUrl = "";

function play(currUrl) {
  baseUrl = currUrl;
  prepareToPlay()
    .then(executionLoop)
    .then(finishPlaying)
    .catch(catchPlayingError);
}

function playAfterConnectionFailed() {
  prepareToPlayAfterConnectionFailed()
    .then(executionLoop)
    .then(finishPlaying)
    .catch(catchPlayingError);
}

function executionLoop() {
  PlaybackState.setPlayingIndex(PlaybackState.currentPlayingIndex + 1);
  if (PlaybackState.currentPlayingIndex >= UiState.selectedTest.test.commands.length && PlaybackState.isPlaying) PlaybackState.togglePlaying();
  if (!PlaybackState.isPlaying) return false;
  const { id, command, target, value } = UiState.selectedTest.test.commands[PlaybackState.currentPlayingIndex];
  PlaybackState.setCommandState(id, CommandStates.Pending);
  if (isExtCommand(command)) {
    let upperCase = command.charAt(0).toUpperCase() + command.slice(1);
    return (extCommand["do" + upperCase](target, value))
      .then(executionLoop); 
  } else {
    return doPreparation()
      .then(doPrePageWait)
      .then(doPageWait)
      .then(doAjaxWait)
      .then(doDomWait)
      .then(doCommand)
      .then(executionLoop);
  }
}

function prepareToPlay() {
  PlaybackState.setPlayingIndex(-1);
  PlaybackState.clearCommandStates();
  return extCommand.init();
}

function prepareToPlayAfterConnectionFailed() {
  return Promise.resolve(true);
}

function finishPlaying() {
  PlaybackState.finishPlaying();
}

function catchPlayingError(message) {
  if (isReceivingEndError(message)) {
    setTimeout(function() {
      PlaybackState.setPlayingIndex(PlaybackState.currentPlayingIndex - 1);
      playAfterConnectionFailed();
    }, 100);
  } else {
    reportError(message);
  }
}

function reportError(message) {
  const { id } = UiState.selectedTest.test.commands[PlaybackState.currentPlayingIndex];
  PlaybackState.setCommandState(id, CommandStates.Failed, message);
}

reaction(
  () => PlaybackState.isPlaying,
  isPlaying => { isPlaying ? play(UiState.baseUrl) : null; }
);

function doPreparation() {
  return extCommand.sendMessage("waitPreparation", "", "")
    .then(function() {
      return true;
    });
}

function doPrePageWait() {
  return extCommand.sendMessage("prePageWait", "", "")
    .then(function(response) {
      if (response && response.new_page) {
        return doPrePageWait();
      } else {
        return true;
      }
    });
}

function doPageWait(pageTime, pageCount = 0) {
  return extCommand.sendMessage("pageWait", "", "")
    .then(function(response) {
      if (pageTime && (Date.now() - pageTime) > 30000) {
        reportError("Page Wait timed out after 30000ms");
        pageCount = 0;
        pageTime = "";
        return true;
      } else if (response && response.page_done) {
        pageCount = 0;
        pageTime = "";
        return true;
      } else {
        pageCount++;
        if (pageCount == 1) {
          pageTime = Date.now();
          console.log("Wait for the new page to be fully loaded");
        }
        return doPageWait(pageTime, pageCount);
      }
    });
}

function doAjaxWait(ajaxTime, ajaxCount = 0) {
  return extCommand.sendMessage("ajaxWait", "", "")
    .then(function(response) {
      if (ajaxTime && (Date.now() - ajaxTime) > 30000) {
        reportError("Ajax Wait timed out after 30000ms");
        ajaxCount = 0;
        ajaxTime = "";
        return true;
      } else if (response && response.ajax_done) {
        ajaxCount = 0;
        ajaxTime = "";
        return true;
      } else {
        ajaxCount++;
        if (ajaxCount == 1) {
          ajaxTime = Date.now();
          console.log("Wait for all ajax requests to be done");
        }
        return doAjaxWait(ajaxTime, ajaxCount);
      }
    });
}

function doDomWait(domTime, domCount = 0) {
  return extCommand.sendMessage("domWait", "", "")
    .then(function(response) {
      if (domTime && (Date.now() - domTime) > 30000) {
        reportError("DOM Wait timed out after 30000ms");
        domCount = 0;
        domTime = "";
        return true;
      } else if (response && (Date.now() - response.dom_time) < 400) {
        domCount++;
        if (domCount == 1) {
          domTime = Date.now();
          console.log("Wait for the DOM tree modification");
        }
        return doDomWait(domTime, domCount);
      } else {
        domCount = 0;
        domTime = "";
        return true;
      }
    });
}

function doCommand(implicitTime = Date.now(), implicitCount = 0) {
  const { id, command, target, value } = UiState.selectedTest.test.commands[PlaybackState.currentPlayingIndex];

  let p = new Promise(function(resolve, reject) {
    let count = 0;
    let interval = setInterval(function() {
      if (count > 60) {
        reportError("Timed out after 30000ms");
        reject("Window not Found");
        clearInterval(interval);
      }
      if (!extCommand.getPageStatus()) {
        if (count == 0) {
          console.log("Wait for the new page to be fully loaded");
        }
        count++;
      } else {
        resolve();
        clearInterval(interval);
      }
    }, 500);
  });

  const parsedTarget = command === "open" ? new URL(target, baseUrl).href : target;
  return p.then(() => (
    extCommand.sendMessage(command, parsedTarget, value, isWindowMethodCommand(command))
  ))
    .then(function(result) {
      if (result.result !== "success") {
        // implicit
        if (result.result.match(/Element[\s\S]*?not found/)) {
          if (implicitTime && (Date.now() - implicitTime > 30000)) {
            reportError("Implicit Wait timed out after 30000ms");
            implicitCount = 0;
            implicitTime = "";
          } else {
            implicitCount++;
            if (implicitCount == 1) {
              console.log("Wait until the element is found");
              implicitTime = Date.now();
            }
            return doCommand(implicitTime, implicitCount);
          }
        }

        implicitCount = 0;
        implicitTime = "";
        PlaybackState.setCommandState(id, CommandStates.Failed, result.result);
      } else {
        PlaybackState.setCommandState(id, CommandStates.Passed);
      }
    });
}

function isReceivingEndError(reason) {
  return (reason == "TypeError: response is undefined" ||
    reason == "Error: Could not establish connection. Receiving end does not exist." ||
    // Below message is for Google Chrome
    reason.message == "Could not establish connection. Receiving end does not exist." ||
    // Google Chrome misspells "response"
    reason.message == "The message port closed before a reponse was received." ||
    reason.message == "The message port closed before a response was received." );
}

function isWindowMethodCommand(command) {
  return (command == "answerOnNextPrompt"
    || command == "chooseCancelOnNextPrompt"
    || command == "assertPrompt"
    || command == "chooseOkOnNextConfirmation"
    || command == "chooseCancelOnNextConfirmation"
    || command == "assertConfirmation"
    || command == "assertAlert");
}
