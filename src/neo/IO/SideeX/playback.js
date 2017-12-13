// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

import { reaction } from "mobx";
import PlaybackState, { PlaybackStates } from "../../stores/view/PlaybackState";
import UiState from "../../stores/view/UiState";
const { ExtCommand, isExtCommand } = window;

const extCommand = new ExtCommand();
window.extCommand = extCommand;
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
  (PlaybackState.currentPlayingIndex < 0) ? PlaybackState.setPlayingIndex(0) : PlaybackState.setPlayingIndex(PlaybackState.currentPlayingIndex + 1);
  if ((PlaybackState.currentPlayingIndex >= PlaybackState.runningQueue.length && PlaybackState.isPlaying) || (!PlaybackState.isPlaying || PlaybackState.paused)) return false;
  const { id, command, target, value } = PlaybackState.runningQueue[PlaybackState.currentPlayingIndex];
  PlaybackState.setCommandState(id, PlaybackStates.Pending);
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
      .then(doDelay)
      .then(executionLoop);
  }
}

function prepareToPlay() {
  PlaybackState.setPlayingIndex(PlaybackState.currentPlayingIndex - 1);
  return extCommand.init();
}

function prepareToPlayAfterConnectionFailed() {
  return Promise.resolve(true);
}

function finishPlaying() {
  if (!PlaybackState.paused) PlaybackState.finishPlaying();
}

function catchPlayingError(message) {
  if (isReceivingEndError(message)) {
    setTimeout(function() {
      PlaybackState.setPlayingIndex(PlaybackState.currentPlayingIndex - 1);
      playAfterConnectionFailed();
    }, 100);
  } else {
    reportError(message);
    finishPlaying();
  }
}

function reportError(error) {
  const { id } = PlaybackState.runningQueue[PlaybackState.currentPlayingIndex];
  let message = error;
  if (error.message === "this.playingFrameLocations[this.currentPlayingTabId] is undefined") {
    message = "The current tab is invalid for testing (e.g. about:home), surf to a webpage before using the extension";
  }
  PlaybackState.setCommandState(id, PlaybackStates.Failed, message);
}

reaction(
  () => PlaybackState.isPlaying,
  isPlaying => { isPlaying ? play(UiState.baseUrl) : null; }
);

reaction(
  () => PlaybackState.paused,
  paused => {
    if (!paused) {
      PlaybackState.setPlayingIndex(PlaybackState.currentPlayingIndex - 1);
      playAfterConnectionFailed();
    }
  }
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

function doPageWait(res, pageTime, pageCount = 0) {
  return extCommand.sendMessage("pageWait", "", "")
    .then(function(response) {
      if (pageTime && (Date.now() - pageTime) > 30000) {
        reportError("Page Wait timed out after 30000ms");
        return true;
      } else if (response && response.page_done) {
        return true;
      } else {
        pageCount++;
        if (pageCount == 1) {
          pageTime = Date.now();
        }
        return doPageWait(false, pageTime, pageCount);
      }
    });
}

function doAjaxWait(res, ajaxTime, ajaxCount = 0) {
  return extCommand.sendMessage("ajaxWait", "", "")
    .then(function(response) {
      if (ajaxTime && (Date.now() - ajaxTime) > 30000) {
        reportError("Ajax Wait timed out after 30000ms");
        return true;
      } else if (response && response.ajax_done) {
        return true;
      } else {
        ajaxCount++;
        if (ajaxCount == 1) {
          ajaxTime = Date.now();
        }
        return doAjaxWait(false, ajaxTime, ajaxCount);
      }
    });
}

function doDomWait(res, domTime, domCount = 0) {
  return extCommand.sendMessage("domWait", "", "")
    .then(function(response) {
      if (domTime && (Date.now() - domTime) > 30000) {
        reportError("DOM Wait timed out after 30000ms");
        return true;
      } else if (response && (Date.now() - response.dom_time) < 400) {
        domCount++;
        if (domCount == 1) {
          domTime = Date.now();
        }
        return doDomWait(false, domTime, domCount);
      } else {
        return true;
      }
    });
}

function doCommand(res, implicitTime = Date.now(), implicitCount = 0) {
  const { id, command, target, value } = PlaybackState.runningQueue[PlaybackState.currentPlayingIndex];

  let p = new Promise(function(resolve, reject) {
    let count = 0;
    let interval = setInterval(function() {
      if (count > 60) {
        reportError("Timed out after 30000ms");
        reject("Window not Found");
        clearInterval(interval);
      }
      if (!extCommand.getPageStatus()) {
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
              implicitTime = Date.now();
            }
            PlaybackState.setCommandState(id, PlaybackStates.Pending, `Trying to find ${parsedTarget}...`);
            return doCommand(false, implicitTime, implicitCount);
          }
        }

        PlaybackState.setCommandState(id, PlaybackStates.Failed, result.result);
      } else {
        PlaybackState.setCommandState(id, PlaybackStates.Passed);
      }
    });
}

function doDelay() {
  return new Promise((res) => {
    if (PlaybackState.currentPlayingIndex + 1 === PlaybackState.runningQueue.length) {
      return res(true);
    } else {
      setTimeout(() => {
        return res(true);
      }, PlaybackState.delay);
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
