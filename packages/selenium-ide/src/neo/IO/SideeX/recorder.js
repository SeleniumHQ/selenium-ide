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
  constructor(windowSession) {
    // The only way to know if a tab is recordable is to assume it is, and verify it sends a record
    // In order to do that we need to optimistically attach the recorder to all tabs, and try to
    // remove it, even if it's in a priviledged tab
    this.windowSession = windowSession;
    this.lastAttachedTabId = undefined;
    this.isAttaching = false;
    this.attached = false;
    this.rebind();
    if (browser && browser.runtime && browser.runtime.onMessage) {
      browser.runtime.onMessage.addListener(this.attachRecorderRequestHandler);
    }
  }

  async attachToTab(tabId) {
    await browser.tabs.sendMessage(tabId, { attachRecorder: true });
  }

  async detachFromTab(tabId) {
    await browser.tabs.sendMessage(tabId, { detachRecorder: true }).catch(() => {
      // the tab was deleted during the test, ignoring
    });
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
    if (!this.windowSession.openedTabIds[testCaseId]) {
      return;
    }

    if (this.windowSession.openedTabIds[testCaseId] && this.doesTabBelongToRecording(activeInfo.tabId)) {
      this.reattachToTab(activeInfo.tabId);
    }

    // Because event listener is so fast that selectWindow command is added
    // before other commands like clicking a link to browse in new tab.
    // Delay a little time to add command in order.
    setTimeout(function() {
      if (this.windowSession.currentRecordingTabId[testCaseId] === activeInfo.tabId && this.windowSession.currentRecordingWindowId[testCaseId] === activeInfo.windowId)
        return;
      // If no command has been recorded, ignore selectWindow command
      // until the user has select a starting page to record the commands
      if (!hasRecorded())
        return;
      // Ignore all unknown tabs, the activated tab may not derived from
      // other opened tabs, or it may managed by other SideeX panels
      if (this.windowSession.openedTabIds[testCaseId][activeInfo.tabId] == undefined)
        return;
      // Tab information has existed, add selectWindow command
      this.windowSession.currentRecordingTabId[testCaseId] = activeInfo.tabId;
      this.windowSession.currentRecordingWindowId[testCaseId] = activeInfo.windowId;
      this.windowSession.currentRecordingFrameLocation[testCaseId] = "root";
      record("selectWindow", [[this.windowSession.openedTabIds[testCaseId][activeInfo.tabId]]], "");
    }, 150);
  }

  windowsOnFocusChangedHandler(windowId) {
    console.log("windows.onFocusChanged");
    let testCase = getSelectedCase();
    if (!testCase) {
      return;
    }
    let testCaseId = testCase.id;
    if (!this.windowSession.openedTabIds[testCaseId]) {
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
      if (this.windowSession.openedTabIds[testCaseId] && this.doesTabBelongToRecording(tab.id)) {
        this.reattachToTab(tab.id);
      }
    });

    // If the activated window is the same as the last, just do nothing
    // selectWindow command will be handled by tabs.onActivated listener
    // if there also has a event of switching a activated tab
    if (this.windowSession.currentRecordingWindowId[testCaseId] === windowId)
      return;

    browser.tabs.query({
      windowId: windowId,
      active: true
    }).then((tabs) => {
      if(tabs.length === 0 || this.isPrivilegedPage(tabs[0].url)) {
        return;
      }

      // The activated tab is not the same as the last
      if (tabs[0].id !== this.windowSession.currentRecordingTabId[testCaseId]) {
        // If no command has been recorded, ignore selectWindow command
        // until the user has select a starting page to record commands
        if (!hasRecorded())
          return;

        // Ignore all unknown tabs, the activated tab may not derived from
        // other opened tabs, or it may managed by other SideeX panels
        if (this.windowSession.openedTabIds[testCaseId][tabs[0].id] == undefined)
          return;

        // Tab information has existed, add selectWindow command
        this.windowSession.currentRecordingWindowId[testCaseId] = windowId;
        this.windowSession.currentRecordingTabId[testCaseId] = tabs[0].id;
        this.windowSession.currentRecordingFrameLocation[testCaseId] = "root";
        record("selectWindow", [[this.windowSession.openedTabIds[testCaseId][tabs[0].id]]], "");
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
    if (!this.windowSession.openedTabIds[testCaseId]) {
      return;
    }

    if (this.windowSession.openedTabIds[testCaseId][tabId] != undefined) {
      if (this.windowSession.currentRecordingTabId[testCaseId] !== tabId) {
        record("selectWindow", [
          [this.windowSession.openedTabIds[testCaseId][tabId]]
        ], "");
        record("close", [
          [this.windowSession.openedTabIds[testCaseId][tabId]]
        ], "");
        record("selectWindow", [
          [this.windowSession.openedTabIds[testCaseId][this.windowSession.currentRecordingTabId[testCaseId]]]
        ], "");
      } else {
        record("close", [
          [this.windowSession.openedTabIds[testCaseId][tabId]]
        ], "");
      }
      delete this.windowSession.openedTabIds[testCaseId][tabId];
      this.windowSession.currentRecordingFrameLocation[testCaseId] = "root";
    }
  }

  webNavigationOnCreatedNavigationTargetHandler(details) {
    console.log("webNavigation.OnCreatedNavigationTarget");
    let testCase = getSelectedCase();
    if (!testCase)
      return;
    let testCaseId = testCase.id;
    if (this.windowSession.openedTabIds[testCaseId][details.sourceTabId] != undefined) {
      this.windowSession.openedTabIds[testCaseId][details.tabId] = "win_ser_" + this.windowSession.openedTabCount[testCaseId];
      if (details.windowId != undefined) {
        this.windowSession.setOpenedWindow(details.windowId);
      } else {
        // Google Chrome does not support windowId.
        // Retrieve windowId from tab information.
        browser.tabs.get(details.tabId)
          .then((tabInfo) => {
            this.windowSession.setOpenedWindow(tabInfo.windowId);
          });
      }
      this.windowSession.openedTabCount[testCaseId]++;
    }
  }

  attachRecorderRequestHandler(message, sender, sendResponse) {
    if (message.attachRecorderRequest && this.doesTabBelongToRecording(sender.tab.id)) {
      return sendResponse(this.attached);
    }
  }

  addCommandMessageHandler(message, sender, sendResponse) {
    if (!message.command || this.windowSession.openedWindowIds[sender.tab.windowId] == undefined) {
      return;
    }
    sendResponse(true);

    let testCaseId = getSelectedCase().id;

    if (!hasRecorded()) {
      record("open", [
        [sender.tab.url]
      ], "");
    }

    if (this.windowSession.openedTabIds[testCaseId][sender.tab.id] == undefined)
      return;

    if (message.frameLocation !== this.windowSession.currentRecordingFrameLocation[testCaseId]) {
      let newFrameLevels = message.frameLocation.split(":");
      let oldFrameLevels = this.windowSession.currentRecordingFrameLocation[testCaseId].split(":");
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
      this.windowSession.currentRecordingFrameLocation[testCaseId] = message.frameLocation;
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
      browser.windows.update(this.windowSession.selfWindowId, { focused: true })
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
    if (this.attached || this.isAttaching) {
      return;
    }
    try {
      this.isAttaching = true;
      browser.tabs.onActivated.addListener(this.tabsOnActivatedHandler);
      browser.windows.onFocusChanged.addListener(this.windowsOnFocusChangedHandler);
      browser.tabs.onRemoved.addListener(this.tabsOnRemovedHandler);
      browser.webNavigation.onCreatedNavigationTarget.addListener(this.webNavigationOnCreatedNavigationTargetHandler);
      browser.runtime.onMessage.addListener(this.addCommandMessageHandler);

      await this.attachToExistingRecording(startUrl);

      this.attached = true;
      this.isAttaching = false;
    } catch(err) {
      this.isAttaching = false;
      throw err;
    }
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

  // this will attempt to connect to a previous recording
  // else it will create a new window for recording
  async attachToExistingRecording(url) {
    let testCaseId = getSelectedCase().id;
    try {
      await browser.windows.update(this.windowSession.currentRecordingWindowId[testCaseId], {
        focused: true
      });
    } catch(e) {
      const win = await browser.windows.create({
        url
      });
      const tab = win.tabs[0];
      this.lastAttachedTabId = tab.id;
      this.windowSession.setOpenedWindow(tab.windowId);
      this.windowSession.openedTabIds[testCaseId] = {};

      this.windowSession.currentRecordingFrameLocation[testCaseId] = "root";
      this.windowSession.currentRecordingTabId[testCaseId] = tab.id;
      this.windowSession.currentRecordingWindowId[testCaseId] = tab.windowId;
      this.windowSession.openedTabIds[testCaseId][tab.id] = "win_ser_local";
      this.windowSession.openedTabCount[testCaseId] = 1;
    }
  }

  doesTabBelongToRecording(tabId) {
    let testCaseId = getSelectedCase().id;
    return Object.keys(this.windowSession.openedTabIds[testCaseId]).includes(`${tabId}`);
  }
}
