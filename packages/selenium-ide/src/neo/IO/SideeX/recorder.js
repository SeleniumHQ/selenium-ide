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
import UiState from "../../stores/view/UiState";
import record from "./record";
import { sendRecordNotification } from "../notifications";
import { Logger, Channels } from "../../stores/view/Logs";

const logger = new Logger(Channels.PLAYBACK);

function getSelectedCase() {
  return {
    id: UiState.selectedTest.test.id
  };
}

function hasRecorded() {
  return !!UiState.selectedTest.test.commands.length;
}

export default class BackgroundRecorder {
  constructor() {
    // The only way to know if a tab is recordable is to assume it is, and verify it sends a record
    // In order to do that we need to optimistically attach the recorder to all tabs, and try to
    // remove it, even if it's in a priviledged tab
    this.lastAttachedTabId = undefined;
    this.currentRecordingTabId = {};
    this.currentRecordingWindowId = {};
    this.currentRecordingFrameLocation = {};
    this.openedTabNames = {};
    this.openedTabIds = {};
    this.openedTabCount = {};

    this.openedWindowIds = {};
    this.contentWindowId = -1;
    this.selfWindowId = -1;
    this.attached = false;
    this.rebind();
    if (browser && browser.runtime && browser.runtime.onMessage) {
      browser.runtime.onMessage.addListener(this.attachRecorderRequestHandler);
    }
  }

  async attachToTab(tabId) {
    await browser.tabs.sendMessage(tabId, { attachRecorder: true }).catch();
  }

  async detachFromTab(tabId) {
    await browser.tabs.sendMessage(tabId, { detachRecorder: true }).catch();
  }

  async reattachToTab(tabId) {
    if (tabId !== this.lastAttachedTabId) {
      if (this.lastAttachedTabId && this.lastAttachedTabId !== tabId) {
        await this.detachFromTab(this.lastAttachedTabId);
      }
      await this.attachToTab(tabId);
      this.lastAttachedTabId = tabId;
    }
  }

  // TODO: rename method
  tabsOnActivatedHandler(activeInfo) {
    console.log("tabs.onActivated");
    let testCase = getSelectedCase();
    if (!testCase) {
      return;
    }
    let testCaseId = testCase.id;
    if (!this.openedTabIds[testCaseId]) {
      return;
    }

    if (this.openedTabIds[testCaseId] && this.doesTabBelongToRecording(activeInfo.tabId)) {
      this.reattachToTab(activeInfo.tabId);
    }

    let self = this;
    // Because event listener is so fast that selectWindow command is added
    // before other commands like clicking a link to browse in new tab.
    // Delay a little time to add command in order.
    setTimeout(function() {
      if (self.currentRecordingTabId[testCaseId] === activeInfo.tabId && self.currentRecordingWindowId[testCaseId] === activeInfo.windowId)
        return;
      // If no command has been recorded, ignore selectWindow command
      // until the user has select a starting page to record the commands
      if (!hasRecorded())
        return;
      // Ignore all unknown tabs, the activated tab may not derived from
      // other opened tabs, or it may managed by other SideeX panels
      if (self.openedTabIds[testCaseId][activeInfo.tabId] == undefined)
        return;
      // Tab information has existed, add selectWindow command
      self.currentRecordingTabId[testCaseId] = activeInfo.tabId;
      self.currentRecordingWindowId[testCaseId] = activeInfo.windowId;
      self.currentRecordingFrameLocation[testCaseId] = "root";
      record("selectWindow", [[self.openedTabIds[testCaseId][activeInfo.tabId]]], "");
    }, 150);
  }

  windowsOnFocusChangedHandler(windowId) {
    console.log("windows.onFocusChanged");
    let testCase = getSelectedCase();
    if (!testCase) {
      return;
    }
    let testCaseId = testCase.id;
    if (!this.openedTabIds[testCaseId]) {
      return;
    }

    if (windowId === browser.windows.WINDOW_ID_NONE) {
      // In some Linux window managers, WINDOW_ID_NONE will be listened before switching
      // See MDN reference :
      // https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/windows/onFocusChanged
      return;
    }

    browser.tabs.query({
      windowId: windowId,
      active: true
    }).then((tabs) => {
      const tab = tabs[0];
      if (this.openedTabIds[testCaseId] && this.doesTabBelongToRecording(tab.id)) {
        this.reattachToTab(tab.id);
      }
    });

    // If the activated window is the same as the last, just do nothing
    // selectWindow command will be handled by tabs.onActivated listener
    // if there also has a event of switching a activated tab
    if (this.currentRecordingWindowId[testCaseId] === windowId)
      return;

    browser.tabs.query({
      windowId: windowId,
      active: true
    }).then((tabs) => {
      if(tabs.length === 0 || this.isPrivilegedPage(tabs[0].url)) {
        return;
      }

      // The activated tab is not the same as the last
      if (tabs[0].id !== this.currentRecordingTabId[testCaseId]) {
        // If no command has been recorded, ignore selectWindow command
        // until the user has select a starting page to record commands
        if (!hasRecorded())
          return;

        // Ignore all unknown tabs, the activated tab may not derived from
        // other opened tabs, or it may managed by other SideeX panels
        if (this.openedTabIds[testCaseId][tabs[0].id] == undefined)
          return;

        // Tab information has existed, add selectWindow command
        this.currentRecordingWindowId[testCaseId] = windowId;
        this.currentRecordingTabId[testCaseId] = tabs[0].id;
        this.currentRecordingFrameLocation[testCaseId] = "root";
        record("selectWindow", [[this.openedTabIds[testCaseId][tabs[0].id]]], "");
      }
    });
  }

  tabsOnRemovedHandler(tabId, removeInfo) { // eslint-disable-line no-unused-vars
    console.log("tabs.onRemoved");
    let testCase = getSelectedCase();
    if (!testCase) {
      return;
    }
    let testCaseId = testCase.id;
    if (!this.openedTabIds[testCaseId]) {
      return;
    }

    if (this.openedTabIds[testCaseId][tabId] != undefined) {
      if (this.currentRecordingTabId[testCaseId] !== tabId) {
        record("selectWindow", [
          [this.openedTabIds[testCaseId][tabId]]
        ], "");
        record("close", [
          [this.openedTabIds[testCaseId][tabId]]
        ], "");
        record("selectWindow", [
          [this.openedTabIds[testCaseId][this.currentRecordingTabId[testCaseId]]]
        ], "");
      } else {
        record("close", [
          [this.openedTabIds[testCaseId][tabId]]
        ], "");
      }
      delete this.openedTabNames[testCaseId][this.openedTabIds[testCaseId][tabId]];
      delete this.openedTabIds[testCaseId][tabId];
      this.currentRecordingFrameLocation[testCaseId] = "root";
    }
  }

  webNavigationOnCreatedNavigationTargetHandler(details) {
    console.log("webNavigation.OnCreatedNavigationTarget");
    let testCase = getSelectedCase();
    if (!testCase)
      return;
    let testCaseId = testCase.id;
    if (this.openedTabIds[testCaseId][details.sourceTabId] != undefined) {
      this.openedTabNames[testCaseId]["win_ser_" + this.openedTabCount[testCaseId]] = details.tabId;
      this.openedTabIds[testCaseId][details.tabId] = "win_ser_" + this.openedTabCount[testCaseId];
      if (details.windowId != undefined) {
        this.setOpenedWindow(details.windowId);
      } else {
        // Google Chrome does not support windowId.
        // Retrieve windowId from tab information.
        let self = this;
        browser.tabs.get(details.tabId)
          .then(function(tabInfo) {
            self.setOpenedWindow(tabInfo.windowId);
          });
      }
      this.openedTabCount[testCaseId]++;
    }
  }

  attachRecorderRequestHandler(message, sender, sendResponse) {
    if (message.attachRecorderRequest && this.doesTabBelongToRecording(sender.tab.id)) {
      return sendResponse(this.attached);
    }
  }

  addCommandMessageHandler(message, sender, sendResponse) {
    if (!message.command || this.openedWindowIds[sender.tab.windowId] == undefined) {
      return;
    }
    sendResponse(true);

    let testCaseId = getSelectedCase().id;

    if (!hasRecorded()) {
      record("open", [
        [sender.tab.url]
      ], "");
    }

    if (this.openedTabIds[testCaseId][sender.tab.id] == undefined)
      return;

    if (message.frameLocation !== this.currentRecordingFrameLocation[testCaseId]) {
      let newFrameLevels = message.frameLocation.split(":");
      let oldFrameLevels = this.currentRecordingFrameLocation[testCaseId].split(":");
      while (oldFrameLevels.length > newFrameLevels.length) {
        record("selectFrame", [
          ["relative=parent"]
        ], "");
        oldFrameLevels.pop();
      }
      while (oldFrameLevels.length != 0 && oldFrameLevels[oldFrameLevels.length - 1] != newFrameLevels[oldFrameLevels.length - 1]) {
        record("selectFrame", [
          ["relative=parent"]
        ], "");
        oldFrameLevels.pop();
      }
      while (oldFrameLevels.length < newFrameLevels.length) {
        record("selectFrame", [
          ["index=" + newFrameLevels[oldFrameLevels.length]]
        ], "");
        oldFrameLevels.push(newFrameLevels[oldFrameLevels.length]);
      }
      this.currentRecordingFrameLocation[testCaseId] = message.frameLocation;
    }
    if (message.command.includes("Value") && typeof message.value === "undefined") {
      logger.error("This element does not have property 'value'. Please change to use storeText command.");
      return;
    } else if(message.command.includes("Text") && message.value === "") {
      logger.error("This element does not have property 'Text'. Please change to use storeValue command.");
      return;
    } else if (message.command.includes("store")) {
      // In Google Chrome, window.prompt() must be triggered in
      // an actived tabs of front window, so we let panel window been focused
      browser.windows.update(this.selfWindowId, { focused: true })
        .then(function() {
          // Even if window has been focused, window.prompt() still failed.
          // Delay a little time to ensure that status has been updated
          setTimeout(function() {
            message.value = prompt("Enter the name of the variable");
            if (message.insertBeforeLastCommand) {
              record(message.command, message.target, message.value, true);
            } else {
              sendRecordNotification(message.command, message.target, message.value);
              record(message.command, message.target, message.value);
            }
          }, 100);
        });
      return;
    }

    //handle choose ok/cancel confirm
    if (message.insertBeforeLastCommand) {
      record(message.command, message.target, message.value, true);
    } else {
      sendRecordNotification(message.command, message.target, message.value);
      record(message.command, message.target, message.value);
    }
  }

  isPrivilegedPage (url) {
    if (url.substr(0, 13) == "moz-extension" ||
      url.substr(0, 16) == "chrome-extension") {
      return true;
    }
    return false;
  }

  rebind() {
    this.tabsOnActivatedHandler = this.tabsOnActivatedHandler.bind(this);
    this.windowsOnFocusChangedHandler = this.windowsOnFocusChangedHandler.bind(this);
    this.tabsOnRemovedHandler = this.tabsOnRemovedHandler.bind(this);
    this.webNavigationOnCreatedNavigationTargetHandler = this.webNavigationOnCreatedNavigationTargetHandler.bind(this);
    this.addCommandMessageHandler = this.addCommandMessageHandler.bind(this);
    this.attachRecorderRequestHandler = this.attachRecorderRequestHandler.bind(this);
  }

  async attach(startUrl) {
    if (this.attached) {
      return;
    }
    this.attached = true;
    browser.tabs.onActivated.addListener(this.tabsOnActivatedHandler);
    browser.windows.onFocusChanged.addListener(this.windowsOnFocusChangedHandler);
    browser.tabs.onRemoved.addListener(this.tabsOnRemovedHandler);
    browser.webNavigation.onCreatedNavigationTarget.addListener(this.webNavigationOnCreatedNavigationTargetHandler);
    browser.runtime.onMessage.addListener(this.addCommandMessageHandler);
    const win = await browser.windows.create({
      url: startUrl
    });
    const tab = win.tabs[0];
    let testCaseId = getSelectedCase().id;
    this.lastAttachedTabId = tab.id;
    this.setOpenedWindow(tab.windowId);
    this.openedTabIds[testCaseId] = {};
    this.openedTabNames[testCaseId] = {};

    this.currentRecordingFrameLocation[testCaseId] = "root";
    this.currentRecordingTabId[testCaseId] = tab.id;
    this.currentRecordingWindowId[testCaseId] = tab.windowId;
    this.openedTabNames[testCaseId]["win_ser_local"] = tab.id;
    this.openedTabIds[testCaseId][tab.id] = "win_ser_local";
    this.openedTabCount[testCaseId] = 1;
  }

  async detach() {
    if (!this.attached) {
      return;
    }
    await this.detachFromTab(this.lastAttachedTabId);
    this.lastAttachedTabId = undefined;
    this.attached = false;
    browser.tabs.onActivated.removeListener(this.tabsOnActivatedHandler);
    browser.windows.onFocusChanged.removeListener(this.windowsOnFocusChangedHandler);
    browser.tabs.onRemoved.removeListener(this.tabsOnRemovedHandler);
    browser.webNavigation.onCreatedNavigationTarget.removeListener(this.webNavigationOnCreatedNavigationTargetHandler);
    browser.runtime.onMessage.removeListener(this.addCommandMessageHandler);
  }

  setOpenedWindow(windowId) {
    this.openedWindowIds[windowId] = true;
  }

  setSelfWindowId(windowId) {
    this.selfWindowId = windowId;
  }

  getSelfWindowId() {
    return this.selfWindowId;
  }

  doesTabBelongToRecording(tabId) {
    let testCaseId = getSelectedCase().id;
    return Object.keys(this.openedTabIds[testCaseId]).includes(`${tabId}`);
  }
}

export const recorder = new BackgroundRecorder();
