/*
 * Copyright 2017 SideeX committers
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

/* recording */
let selfWindowId = -1;
let contentWindowId;
let notificationCount = 0;

let recorder = new BackgroundRecorder();

/* flags */
let isRecording = false;
let isPlaying = false;

window.toggleRecord = function(isRecording) {
  isRecording ? recorder.attach() : recorder.detach();
};

function handleMessage(message, sender, sendResponse) {
  if (message.selectTarget) {
    window.selectTarget(message.target);
  }
  if (message.cancelSelectTarget) {
    window.endSelection(sender.tab.id);
  }

  if (message.attachRecorderRequest) {
    if (isRecording && !isPlaying) {
      browser.tabs.sendMessage(sender.tab.id, {attachRecorder: true});
    }
  }
}

browser.runtime.onMessage.addListener(handleMessage);

browser.runtime.onMessage.addListener(function contentWindowIdListener(message) {
  if (message.selfWindowId != undefined && message.commWindowId != undefined) {
    selfWindowId = message.selfWindowId;
    contentWindowId = message.commWindowId;
    extCommand.setContentWindowId(contentWindowId);
    recorder.setOpenedWindow(contentWindowId);
    recorder.setSelfWindowId(selfWindowId);
    browser.runtime.onMessage.removeListener(contentWindowIdListener);
  }
});

function notification(command, target, value) {
  let tempCount = String(notificationCount);
  notificationCount++;
  // In Chrome, notification.create must have "iconUrl" key in notificationOptions
  browser.notifications.create(tempCount, {
    "type": "basic",
    "iconUrl": "/icons/icons-48.png",
    "title": "Command Recorded",
    "message": "command: " + String(command) + "\ntarget: " + tacPreprocess(String(target[0][0])) + "\nvalue: " + String(value)
  });

  setTimeout(function() {
    browser.notifications.clear(tempCount);
  }, 1500);
}

function tacPreprocess(target) {
  if (target.includes("d-XPath")) return "auto-located-by-tac";
  return target;
}
