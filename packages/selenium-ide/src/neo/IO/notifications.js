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

import UiState from "../stores/view/UiState";

export function sendRecordNotification(command, target, value) {
  if (UiState.options.recordNotifications) {
    // In Chrome, notification.create must have "iconUrl" key in notificationOptions
    browser.notifications.create({
      "type": "basic",
      "iconUrl": "/icons/icon128.png",
      "title": "Command was recorded",
      "message": `command: ${command} \ntarget: ${target[0][0]} \nvalue: ${value}`
    }).then(id => {
      setTimeout(function() {
        browser.notifications.clear(id);
      }, 1500);
    });
  }
}

window.notification = sendRecordNotification;
