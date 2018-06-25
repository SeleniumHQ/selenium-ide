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
import FatalError from "../../../errors/fatal";
import NoResponseError from "../../../errors/no-response";
import PlaybackState, { PlaybackStates } from "../../stores/view/PlaybackState";
import UiState from "../../stores/view/UiState";
import { canExecuteCommand, executeCommand } from "../../../plugin/commandExecutor";
import ExtCommand, { isExtCommand } from "./ext-command";
import { xlateArgument } from "./formatCommand";

export const extCommand = new ExtCommand();
// In order to not break the separation of the execution loop from the state of the playback
// I will set doSetSpeed here so that extCommand will not be aware of the state
extCommand.doSetSpeed = (speed) => {
  if (speed < 0) speed = 0;
  if (speed > PlaybackState.maxDelay) speed = PlaybackState.maxDelay;

  PlaybackState.setDelay(speed);
  return Promise.resolve();
};

let baseUrl = "";
let ignoreBreakpoint = false;

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

function didFinishQueue() {
  return (PlaybackState.currentPlayingIndex >= PlaybackState.runningQueue.length && PlaybackState.isPlaying);
}

function isStopping() {
  return (!PlaybackState.isPlaying || PlaybackState.paused || PlaybackState.isStopping);
}

function incrementPlayingIndex() {
  if (PlaybackState.currentPlayingIndex < 0) {
    PlaybackState.setPlayingIndex(0);
  } else {
    PlaybackState.setPlayingIndex(PlaybackState.currentPlayingIndex + 1);
  }
}

function isCallStackEmpty() {
  return !!PlaybackState.callstack.length;
}

function executionLoop() {
  incrementPlayingIndex();
  if (didFinishQueue() || isStopping()) {
    if (isCallStackEmpty()) {
      PlaybackState.unwindTestCase();
    } else {
      return false;
    }
  }
  const { id, command, target, value, isBreakpoint } = PlaybackState.runningQueue[PlaybackState.currentPlayingIndex];
  if (!command) return executionLoop();
  // breakpoint
  PlaybackState.setCommandState(id, PlaybackStates.Pending);
  if (!ignoreBreakpoint && isBreakpoint) PlaybackState.break();
  else if (ignoreBreakpoint && isBreakpoint) ignoreBreakpoint = false;
  // paused
  if (isStopping()) return false;
  if (isExtCommand(command)) {
    return doDelay().then(() => (
      (extCommand.get(command, target, value))
        .then(() => {
          PlaybackState.setCommandState(id, PlaybackStates.Passed);
        }).then(executionLoop)
    ));
  } else if (isImplicitWait(command)) {
    notifyWaitDeprecation(command);
    return executionLoop();
  } else {
    return doPreparation()
      .then(doPrePageWait)
      .then(doPageWait)
      .then(doAjaxWait)
      .then(doDomWait)
      .then(doDelay)
      .then(doCommand)
      .then(executionLoop);
  }
}

function prepareToPlay() {
  PlaybackState.setPlayingIndex(PlaybackState.currentPlayingIndex - 1);
  return extCommand.init(baseUrl);
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
    reportError(message instanceof Error ? message.message : message);
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
  isPlaying => {
    if (isPlaying) {
      play(UiState.baseUrl);
    }
  }
);

reaction(
  () => PlaybackState.paused,
  paused => {
    if (!paused) {
      PlaybackState.setPlayingIndex(PlaybackState.currentPlayingIndex - 1);
      ignoreBreakpoint = true;
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
  if (!PlaybackState.isPlaying || PlaybackState.paused) return;
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

  return p.then(() => (
    canExecuteCommand(command) ?
      doPluginCommand(id, command, target, value, implicitTime, implicitCount) :
      doSeleniumCommand(id, command, target, value, implicitTime, implicitCount)
  ));
}

function doSeleniumCommand(id, command, target, value, implicitTime, implicitCount) {
  return (command !== "type"
    ? extCommand.sendMessage(command, xlateArgument(target), xlateArgument(value), isWindowMethodCommand(command))
    : extCommand.doType(xlateArgument(target), xlateArgument(value), isWindowMethodCommand(command))).then(function(result) {
    if (result.result !== "success") {
      // implicit
      if (isElementNotFound(result.result)) {
        return doImplicitWait(result.result, id, target, implicitTime, implicitCount);
      } else {
        PlaybackState.setCommandState(id, /^verify/.test(command) ? PlaybackStates.Failed : PlaybackStates.Fatal, result.result);
      }
    } else {
      PlaybackState.setCommandState(id, PlaybackStates.Passed);
    }
  });
}

function doPluginCommand(id, command, target, value, implicitTime, implicitCount) {
  return executeCommand(command, target, value, {
    commandId: id,
    runId: PlaybackState.runId,
    testId: PlaybackState.currentRunningTest.id,
    frameId: extCommand.getCurrentPlayingFrameId(),
    tabId: extCommand.currentPlayingTabId,
    windowId: extCommand.currentPlayingWindowId
  }).then(res => {
    PlaybackState.setCommandState(id, res.status ? res.status : PlaybackStates.Passed, res && res.message || undefined);
  }).catch(err => {
    if (isElementNotFound(err.message)) {
      return doImplicitWait(err.message, id, target, implicitTime, implicitCount);
    } else {
      PlaybackState.setCommandState(id, (err instanceof FatalError || err instanceof NoResponseError) ? PlaybackStates.Fatal : PlaybackStates.Failed, err.message);
    }
  });
}

function isElementNotFound(error) {
  return error.match(/Element[\s\S]*?not found/);
}

function doImplicitWait(error, commandId, target, implicitTime, implicitCount) {
  if (isElementNotFound(error)) {
    if (implicitTime && (Date.now() - implicitTime > 30000)) {
      reportError("Implicit Wait timed out after 30000ms");
      implicitCount = 0;
      implicitTime = "";
    } else {
      implicitCount++;
      if (implicitCount == 1) {
        implicitTime = Date.now();
      }
      PlaybackState.setCommandState(commandId, PlaybackStates.Pending, `Trying to find ${target}...`);
      return doCommand(false, implicitTime, implicitCount);
    }
  }
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

function notifyWaitDeprecation(command) {
  reportError(`${command} is deprecated, Selenium IDE waits automatically instead`);
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

function isImplicitWait(command) {
  return (command == "waitForPageToLoad"
    || command == "waitForElementPresent");
}
