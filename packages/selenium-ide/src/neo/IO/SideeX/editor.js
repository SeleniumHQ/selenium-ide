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

import browser from "webextension-polyfill";
import BackgroundRecorder from "./recorder";
import { selectTarget, endSelection } from "./find-select";
import { extCommand } from "./playback";

/* recording */
let selfWindowId = -1;
let contentWindowId;

const recorder = new BackgroundRecorder();

export function toggleRecord(isRecording) {
  isRecording ? recorder.attach() : recorder.detach();
}

function handleMessage(message, sender, sendResponse) {
  if (message.selectTarget) {
    selectTarget(message.target, message.selectNext);
    sendResponse(true);
  }
  if (message.cancelSelectTarget) {
    endSelection(sender.tab.id);
    sendResponse(true);
  }
}

if (browser && browser.runtime && browser.runtime.onMessage) {
  browser.runtime.onMessage.addListener(handleMessage);
  browser.runtime.onMessage.addListener(function contentWindowIdListener(message, sender, sendResponse) {
    if (message.selfWindowId != undefined && message.commWindowId != undefined) {
      selfWindowId = message.selfWindowId;
      contentWindowId = message.commWindowId;
      extCommand.setContentWindowId(contentWindowId);
      recorder.setOpenedWindow(contentWindowId);
      recorder.setSelfWindowId(selfWindowId);
      browser.runtime.onMessage.removeListener(contentWindowIdListener);
      sendResponse(true);
    }
  });
}
