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
import parser from "ua-parser-js";
import Debugger, { convertLocator } from "../debugger";
import PlaybackState from "../../stores/view/PlaybackState";
import variables from "../../stores/view/Variables";
import { absolutifyUrl } from "../playback/utils";
import "./bootstrap";

const parsedUA = parser(window.navigator.userAgent);

export default class ExtCommand {
  constructor(windowSession) {
    this.options = {};
    this.windowSession = windowSession;
    this.playingTabNames = {};
    this.playingTabStatus = {};
    this.playingFrameLocations = {};
    // TODO: flexible wait
    this.waitInterval = 500;
    this.waitTimes = 60;

    this.attached = false;

    // Use ES6 arrow function to bind correct this
    this.tabsOnUpdatedHandler = (tabId, changeInfo, tabInfo) => { // eslint-disable-line no-unused-vars
      if (changeInfo.status) {
        if (changeInfo.status == "loading") {
          this.setLoading(tabId);
        } else {
          this.setComplete(tabId);
        }
      }
    };

    this.frameLocationMessageHandler = (message, sender, sendResponse) => {
      if (message.frameLocation) {
        this.setFrame(sender.tab.id, message.frameLocation, sender.frameId);
        sendResponse(true);
      }
    };

    this.newTabHandler = (details) => {
      if (this.tabBelongsToPlayback(details.sourceTabId)) {
        this.setNewTab(details.tabId);
      }
    };
  }

  async init(baseUrl, testCaseId, options = {}) {
    this.baseUrl = baseUrl;
    this.testCaseId = testCaseId;
    this.options = options;
    if (!this.options.softInit) {
      this.windowSession.generalUseLastPlayedTestCaseId = testCaseId;
      this.setCurrentPlayingFrameLocation("root");
    } else if (!this.getCurrentPlayingFrameLocation()) {
      this.setCurrentPlayingFrameLocation("root");
    }
    this.attach();
    try {
      await this.attachToRecordingWindow(testCaseId);
    } catch(e) {
      await this.updateOrCreateTab();
    }
  }

  cleanup() {
    this.detach();
  }

  attach() {
    if(this.attached) {
      return;
    }
    this.attached = true;
    browser.tabs.onUpdated.addListener(this.tabsOnUpdatedHandler);
    browser.runtime.onMessage.addListener(this.frameLocationMessageHandler);
    browser.webNavigation.onCreatedNavigationTarget.addListener(this.newTabHandler);
  }

  detach() {
    if(!this.attached) {
      return;
    }
    this.attached = false;
    browser.tabs.onUpdated.removeListener(this.tabsOnUpdatedHandler);
    browser.runtime.onMessage.removeListener(this.frameLocationMessageHandler);
    browser.webNavigation.onCreatedNavigationTarget.removeListener(this.newTabHandler);
  }

  getCurrentPlayingWindowSessionIdentifier() {
    return this.windowSession.currentUsedWindowId[this.testCaseId] ? this.testCaseId : this.windowSession.generalUseIdentifier;
  }

  getCurrentPlayingWindowId() {
    return this.windowSession.currentUsedWindowId[this.getCurrentPlayingWindowSessionIdentifier()];
  }

  setCurrentPlayingWindowId(windowId) {
    this.windowSession.currentUsedWindowId[this.getCurrentPlayingWindowSessionIdentifier()] = windowId;
  }

  getCurrentPlayingTabId() {
    return this.windowSession.currentUsedTabId[this.getCurrentPlayingWindowSessionIdentifier()];
  }

  setCurrentPlayingTabId(tabId) {
    this.windowSession.currentUsedTabId[this.getCurrentPlayingWindowSessionIdentifier()] = tabId;
  }

  getCurrentPlayingFrameLocation() {
    return this.windowSession.currentUsedFrameLocation[this.getCurrentPlayingWindowSessionIdentifier()];
  }

  setCurrentPlayingFrameLocation(frameLocation) {
    this.windowSession.currentUsedFrameLocation[this.getCurrentPlayingWindowSessionIdentifier()] = frameLocation;
  }

  getFrameId(tabId) {
    if (tabId >= 0) {
      return this.playingFrameLocations[tabId][this.getCurrentPlayingFrameLocation()];
    } else {
      return this.playingFrameLocations[this.getCurrentPlayingTabId()][this.getCurrentPlayingFrameLocation()];
    }
  }

  getCurrentPlayingFrameId() {
    return this.getFrameId(this.getCurrentPlayingTabId());
  }

  getPageStatus() {
    return this.playingTabStatus[this.getCurrentPlayingTabId()];
  }

  sendMessage(command, target, value, top, implicitTime) {
    if (/^webdriver/.test(command)) {
      return Promise.resolve({ result: "success" });
    }
    let tabId = this.getCurrentPlayingTabId();
    let frameId = this.getCurrentPlayingFrameId();
    return browser.tabs.sendMessage(tabId, {
      commands: command,
      target: target,
      value: value
    }, { frameId: top ? 0 : frameId }).then(r => {
      return r;
    }).catch(error => {
      if (this.isReceivingEndError(error) && frameId && command !== "waitPreparation") {
        return this.waitForFrameToRespond(command, target, value, implicitTime);
      }
      throw error;
    });
  }

  waitForFrameToRespond(command, target, value, implicitTime = Date.now()) {
    return new Promise((res, rej) => {
      if (Date.now() - implicitTime >= 5000) {
        rej(new Error("frame no longer exists"));
      } else if (!PlaybackState.isPlaying || PlaybackState.paused || PlaybackState.isStopping) {
        res();
      } else {
        setTimeout(() => {
          res(this.sendMessage(command, target, value, undefined, implicitTime));
        }, 100);
      }
    });
  }

  sendPayload(payload, top) {
    let tabId = this.getCurrentPlayingTabId();
    let frameId = this.getCurrentPlayingFrameId();
    return browser.tabs.sendMessage(tabId, payload, { frameId: top ? 0 : frameId });
  }

  setLoading(tabId) {
    // Does clearing the object will cause some problem(e.g. missing the frameId)?
    // Ans: Yes, but I don't know why
    this.initTabInfo(tabId);
    // this.initTabInfo(tabId, true); (failed)
    this.playingTabStatus[tabId] = false;
  }

  setComplete(tabId) {
    this.initTabInfo(tabId);
    this.playingTabStatus[tabId] = true;
  }

  waitForPageToLoad() {
    return new Promise((res) => {
      const interval = setInterval(() => {
        if (!PlaybackState.isPlaying || PlaybackState.paused || PlaybackState.isStopping || this.playingTabStatus[this.getCurrentPlayingTabId()]) {
          clearInterval(interval);
          res();
        }
      }, 100);
    });
  }

  initTabInfo(tabId, forced) {
    if (!this.playingFrameLocations[tabId] | forced) {
      this.playingFrameLocations[tabId] = {};
      this.playingFrameLocations[tabId]["root"] = 0;
    }
  }

  setFrame(tabId, frameLocation, frameId) {
    this.playingFrameLocations[tabId][frameLocation] = frameId;
  }

  tabBelongsToPlayback(tabId) {
    return this.windowSession.openedTabIds[this.getCurrentPlayingWindowSessionIdentifier()][tabId];
  }

  async setNewTab(tabId) {
    this.playingTabNames["win_ser_" + this.windowSession.openedTabCount[this.getCurrentPlayingWindowSessionIdentifier()]] = tabId;
    this.windowSession.openedTabIds[this.getCurrentPlayingWindowSessionIdentifier()][tabId] = "win_ser_" + this.windowSession.openedTabCount[this.getCurrentPlayingWindowSessionIdentifier()];
    this.windowSession.openedTabCount[this.getCurrentPlayingWindowSessionIdentifier()]++;
    this.initTabInfo(tabId);
    const tab = await browser.tabs.get(tabId);
    this.windowSession.setOpenedWindow(tab.windowId);
  }

  doOpen(targetUrl) {
    const url = absolutifyUrl(targetUrl, this.baseUrl);
    return browser.tabs.update(this.getCurrentPlayingTabId(), {
      url: url
    }).then((tab) => {
      if (tab.status === "loading") {
        this.setLoading(this.getCurrentPlayingTabId());
      }
    });
  }

  doPause(milliseconds) {
    return new Promise(function(resolve) {
      setTimeout(resolve, milliseconds);
    });
  }

  doSelectFrame(frameLocation) {
    let result = frameLocation.match(/(index|relative) *= *([\d]+|parent)/i);
    if (result && result[2]) {
      let position = result[2];
      if (position == "parent") {
        this.setCurrentPlayingFrameLocation(this.getCurrentPlayingFrameLocation().slice(0, this.getCurrentPlayingFrameLocation().lastIndexOf(":")));
      } else {
        this.setCurrentPlayingFrameLocation(this.getCurrentPlayingFrameLocation() + ":" + position);
      }
      return this.wait("playingFrameLocations", this.getCurrentPlayingTabId(), this.getCurrentPlayingFrameLocation());
    } else {
      return Promise.reject("Invalid argument");
    }
  }

  async doSelectWindow(serialNumber) {
    await this.wait("playingTabNames", serialNumber);
    this.setCurrentPlayingTabId(this.playingTabNames[serialNumber]);
    const tab = await browser.tabs.update(this.getCurrentPlayingTabId(), { active: true });
    this.setCurrentPlayingWindowId(tab.windowId);
  }

  doClose() {
    let removingTabId = this.getCurrentPlayingTabId();
    this.setCurrentPlayingTabId(-1);
    delete this.playingFrameLocations[removingTabId];
    delete this.windowSession.openedTabIds[this.getCurrentPlayingWindowSessionIdentifier()][removingTabId];
    return browser.tabs.remove(removingTabId);
  }

  async doRun(target) {
    return PlaybackState.callTestCase(target);
  }

  async doMouseOver(locator, _, top) {
    const browserName = parsedUA.browser.name;
    if (browserName === "Chrome") {
      // handle scrolling through Selenium atoms
      let connection;
      try {
        const { rect } = await this.sendPayload({
          prepareToInteract: true,
          locator
        }, top);
        connection = new Debugger(this.getCurrentPlayingTabId());
        await connection.attach();
        await connection.sendCommand("Input.dispatchMouseEvent", {
          type: "mouseMoved",
          x: rect.x + (rect.width / 2),
          y: rect.y + (rect.height / 2)
        });
        await connection.detach();
        return {
          result: "success"
        };
      } catch (e) {
        if (connection) await connection.detach();
        return Promise.resolve({ result: `Element ${locator} not found` });
      }
    } else {
      return this.sendMessage("mouseOver", locator, _, top);
    }
  }

  doType(locator, value, top) {
    if (/^([\w]:\\|\\\\|\/)/.test(value)) {
      const browserName = parsedUA.browser.name;
      if (browserName !== "Chrome") return Promise.reject(new Error("File uploading is only support in Chrome at this time"));
      const connection = new Debugger(this.getCurrentPlayingTabId());
      return connection.attach().then(() => (
        connection.getDocument().then(docNode => (
          this.convertToQuerySelector(locator).then(selector => (
            connection.querySelector(selector, docNode.nodeId).then(nodeId => (
              connection.sendCommand("DOM.setFileInputFiles", { nodeId, files: value.split(",") }).then(connection.detach).then(() => ({ result: "success" }))
            ))
          ))
        ))
      )).catch(e => {
        return connection.detach().then(() => {
          throw e;
        });
      });
    } else {
      return this.sendMessage("type", locator, value, top);
    }
  }

  async doSendKeys(locator, value, top) {
    const browserName = parsedUA.browser.name;
    if (browserName === "Chrome" && value.indexOf("${KEY_ENTER}") !== -1) {
      const connection = new Debugger(this.getCurrentPlayingTabId());
      const sendEnter = async (nodeId) => {
        await connection.sendCommand("DOM.focus", { nodeId });
        await connection.sendCommand("Input.dispatchKeyEvent", {
          type: "keyDown",
          keyCode: 13,
          key: "Enter",
          code: "Enter",
          text: "\r"
        });
        await connection.sendCommand("Input.dispatchKeyEvent", {
          type: "keyDown",
          keyCode: 13,
          key: "Enter",
          code: "Enter",
          text: "\r"
        });
      };
      try {
        await connection.attach();
        const docNode = await connection.getDocument();
        const selector = await this.convertToQuerySelector(locator);
        const nodeId = await connection.querySelector(selector, docNode.nodeId);
        const parts = value.split("${KEY_ENTER}");
        let n = 0;
        while (n < parts.length) {
          const part = parts[n];
          if (part) {
            await this.sendMessage("sendKeys", locator, value, top);
          }
          if (n < parts.length - 1) {
            await sendEnter(nodeId);
          }
          n++;
        }
        await connection.detach();
        return {
          result: "success"
        };
      } catch (e) {
        await connection.detach();
        throw e;
      }
    } else {
      return this.sendMessage("sendKeys", locator, value, top);
    }
  }

  doStore(string, varName) {
    variables.set(varName, string);
    return Promise.resolve();
  }

  async doSetWindowSize(size) {
    if (/\d+x\d+/.test(size)) {
      const [ width, height ] = size.split("x").map((s) => parseInt(s));
      await browser.windows.update(this.getCurrentPlayingWindowId(), {
        width,
        height
      });
    } else {
      throw new Error(`Invalid resolution given ${size}, resolution is of the form WidthxHeight: 1280x800.`);
    }
  }

  doSetSpeed(speed) {
    if (speed < 0) speed = 0;
    if (speed > PlaybackState.maxDelay) speed = PlaybackState.maxDelay;

    PlaybackState.setDelay(speed);
    return Promise.resolve();
  }

  async convertToQuerySelector(locator) {
    let querySelector;
    try {
      querySelector = convertLocator(locator);
    } catch (e) {
      try {
        const locators = await this.buildLocators(locator);
        for (let loc of locators) {
          try {
            querySelector = convertLocator(loc[0]);
            break;
          } catch (err) {} // eslint-disable-line
        }
      } catch (err) {
        throw e;
      }
    }

    return querySelector;
  }

  async buildLocators(locator) {
    const { locators } = await this.sendPayload({
      buildLocators: true,
      locator
    });
    return locators;
  }

  wait(...properties) {
    if (!properties.length)
      return Promise.reject("No arguments");
    let self = this;
    let ref = this;
    let inspecting = properties[properties.length - 1];
    for (let i = 0; i < properties.length - 1; i++) {
      if (!ref[properties[i]] | !(ref[properties[i]] instanceof Array | ref[properties[i]] instanceof Object))
        return Promise.reject("Invalid Argument");
      ref = ref[properties[i]];
    }
    return new Promise(function(resolve, reject) {
      let counter = 0;
      let interval = setInterval(function() {
        if (ref[inspecting] === undefined || ref[inspecting] === false) {
          counter++;
          if (counter > self.waitTimes) {
            reject("Timeout");
            clearInterval(interval);
          }
        } else {
          resolve();
          clearInterval(interval);
        }
      }, self.waitInterval);
    });
  }

  async attachToRecordingWindow(testCaseId) {
    if (this.windowSession.currentUsedWindowId[testCaseId]) {
      if (!this.options.softInit) {
        await this.windowSession.removeSecondaryTabs(this.testCaseId);
      }
      const tabs = await browser.tabs.query({
        windowId: this.windowSession.currentUsedWindowId[testCaseId]
      });
      await this.attachToTab(tabs[0].id);
    } else {
      throw new Error("No matching window found");
    }
  }

  async updateOrCreateTab() {
    if (!this.windowSession.generalUsePlayingWindowId) {
      await this.createPlaybackWindow();
    } else {
      try {
        if (!this.options.softInit) {
          await this.windowSession.removeSecondaryTabs(this.windowSession.generalUseIdentifier);
        }
        const tabs = await browser.tabs.query({
          windowId: this.windowSession.generalUsePlayingWindowId
        });
        await this.attachToTab(tabs[0].id);
      } catch(e) {
        await this.createPlaybackWindow();
      }
    }
  }

  async attachToTab(tabId) {
    if (!this.options.softInit) {
      const tab = await browser.tabs.update(tabId, {
        url: browser.runtime.getURL("/bootstrap.html"),
        active: true
      });
      await browser.windows.update(tab.windowId, {
        focused: true
      });
      await this.wait("playingTabStatus", tab.id);
      // Firefox did not update url information when tab is updated
      // We assign url manually and go to set first tab
      tab.url = browser.runtime.getURL("/bootstrap.html");
      this.setFirstTab(tab);
    } else {
      const tab = await browser.tabs.update(tabId, {
        active: true
      });
      await browser.windows.update(tab.windowId, {
        focused: true
      });
      if (tab.status === "loading") {
        await this.wait("playingTabStatus", tab.id);
      }
      this.setPlayingTab(tab);
    }
  }

  async createPlaybackWindow() {
    const win = await browser.windows.create({
      url: browser.runtime.getURL("/bootstrap.html")
    });
    this.setFirstTab(win.tabs[0]);
    this.windowSession.generalUsePlayingWindowId = win.id;
    this.windowSession.setOpenedWindow(win.id);
    const backgroundWindow = await browser.runtime.getBackgroundPage();
    backgroundWindow.master[win.id] = this.windowSession.ideWindowId;
  }

  setFirstTab(tab) {
    this.setCurrentPlayingWindowId(tab.windowId);
    this.setCurrentPlayingTabId(tab.id);
    this.playingTabNames["win_ser_local"] = this.getCurrentPlayingTabId();
    if (!this.windowSession.openedTabIds[this.getCurrentPlayingWindowSessionIdentifier()]) {
      this.windowSession.openedTabIds[this.getCurrentPlayingWindowSessionIdentifier()] = {};
    }
    this.windowSession.openedTabIds[this.getCurrentPlayingWindowSessionIdentifier()][this.getCurrentPlayingTabId()] = "win_ser_local";
    this.windowSession.openedTabCount[this.getCurrentPlayingWindowSessionIdentifier()] = 1;
    this.playingFrameLocations[this.getCurrentPlayingTabId()] = {};
    this.playingFrameLocations[this.getCurrentPlayingTabId()]["root"] = 0;
    // we assume that there has an "open" command
    // select Frame directly will cause failed
    this.playingTabStatus[this.getCurrentPlayingTabId()] = true;
  }

  setPlayingTab(tab) {
    this.setCurrentPlayingWindowId(tab.windowId);
    this.setCurrentPlayingTabId(tab.id);
    this.playingTabStatus[this.getCurrentPlayingTabId()] = true;
  }

  isAddOnPage(url) {
    if (url.startsWith("https://addons.mozilla.org") ||
      url.startsWith("https://chrome.google.com/webstore")) {
      return true;
    }
    return false;
  }

  name(command) {
    let upperCase = command.charAt(0).toUpperCase() + command.slice(1);
    return "do" + upperCase;
  }

  isExtCommand(command) {
    switch(command) {
      case "pause":
      case "open":
      case "selectFrame":
      case "selectWindow":
      case "run":
      case "setWindowSize":
      case "setSpeed":
      case "store":
      case "close":
        return true;
      default:
        return false;
    }
  }

  isWindowMethodCommand(command) {
    return (command == "answerOnNextPrompt"
      || command == "chooseCancelOnNextPrompt"
      || command == "assertPrompt"
      || command == "chooseOkOnNextConfirmation"
      || command == "chooseCancelOnNextConfirmation"
      || command == "assertConfirmation"
      || command == "assertAlert");
  }

  isReceivingEndError(reason) {
    return (reason == "TypeError: response is undefined" ||
      reason == "Error: Could not establish connection. Receiving end does not exist." ||
      // Below message is for Google Chrome
      reason.message == "Could not establish connection. Receiving end does not exist." ||
      // Google Chrome misspells "response"
      reason.message == "The message port closed before a reponse was received." ||
      reason.message == "The message port closed before a response was received." ||
      reason.message == "result is undefined"); // from command node eval
  }
}
