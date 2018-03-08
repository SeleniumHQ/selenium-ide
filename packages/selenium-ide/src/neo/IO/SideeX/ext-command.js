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
import { recorder } from "./editor";

export default class ExtCommand {
  constructor(contentWindowId) {
    this.playingTabNames = {};
    this.playingTabIds = {};
    this.playingTabStatus = {};
    this.playingFrameLocations = {};
    this.playingTabCount = 1;
    this.currentPlayingTabId = -1;
    this.contentWindowId = contentWindowId ? contentWindowId : -1;
    this.currentPlayingFrameLocation = "root";
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

    this.frameLocationMessageHandler = (message, sender) => {
      if (message.frameLocation) {
        this.setFrame(sender.tab.id, message.frameLocation, sender.frameId);
      }
    };

    this.newTabHandler = (details) => {
      if (this.hasTab(details.sourceTabId)) {
        this.setNewTab(details.tabId);
      }
    };
  }

  init() {
    this.attach();
    this.playingTabNames = {};
    this.playingTabIds = {};
    this.playingTabStatus = {};
    this.playingFrameLocations = {};
    this.playingTabCount = 1;
    this.currentPlayingWindowId = this.contentWindowId;
    this.currentPlayingFrameLocation = "root";
    return this.queryActiveTab(this.currentPlayingWindowId)
      .then(this.setFirstTab.bind(this));
  }

  clear() {
    this.detach();
    this.playingTabNames = {};
    this.playingTabIds = {};
    this.playingTabStatus = {};
    this.playingFrameLocations = {};
    this.playingTabCount = 1;
    this.currentPlayingWindowId = undefined;
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

  setContentWindowId(contentWindowId) {
    this.contentWindowId = contentWindowId;
  }

  getContentWindowId() {
    return this.contentWindowId;
  }

  getCurrentPlayingTabId() {
    return this.currentPlayingTabId;
  }

  getCurrentPlayingFrameLocation() {
    return this.currentPlayingFrameLocation;
  }

  getFrameId(tabId) {
    if (tabId >= 0) {
      return this.playingFrameLocations[tabId][this.currentPlayingFrameLocation];
    } else {
      return this.playingFrameLocations[this.currentPlayingTabId][this.currentPlayingFrameLocation];
    }
  }

  getCurrentPlayingFrameId() {
    return this.getFrameId(this.currentPlayingTabId);
  }

  getPageStatus() {
    return this.playingTabStatus[this.getCurrentPlayingTabId()];
  }

  queryActiveTab(windowId) {
    return browser.tabs.query({windowId: windowId, active: true, url: ["http://*/*", "https://*/*"]})
      .then(function(tabs) {
        return tabs[0];
      });
  }

  sendMessage(command, target, value, top) {
    let tabId = this.getCurrentPlayingTabId();
    let frameId = this.getCurrentPlayingFrameId();
    return browser.tabs.sendMessage(tabId, {
      commands: command,
      target: target,
      value: value
    }, { frameId: top ? 0 : frameId });
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

  initTabInfo(tabId, forced) {
    if (!this.playingFrameLocations[tabId] | forced) {
      this.playingFrameLocations[tabId] = {};
      this.playingFrameLocations[tabId]["root"] = 0;
    }
  }

  setFrame(tabId, frameLocation, frameId) {
    this.playingFrameLocations[tabId][frameLocation] = frameId;
  }

  hasTab(tabId) {
    return this.playingTabIds[tabId];
  }

  setNewTab(tabId) {
    this.playingTabNames["win_ser_" + this.playingTabCount] = tabId;
    this.playingTabIds[tabId] = "win_ser_" + this.playingTabCount;
    this.playingTabCount++;
  }

  doOpen(url) {
    return browser.tabs.update(this.currentPlayingTabId, {
      url: url
    });
  }

  doPause(ignored, milliseconds) {
    return new Promise(function(resolve) {
      setTimeout(resolve, milliseconds);
    });
  }

  doSelectFrame(frameLocation) {
    let result = frameLocation.match(/(index|relative) *= *([\d]+|parent)/i);
    if (result && result[2]) {
      let position = result[2];
      if (position == "parent") {
        this.currentPlayingFrameLocation = this.currentPlayingFrameLocation.slice(0, this.currentPlayingFrameLocation.lastIndexOf(":"));
      } else {
        this.currentPlayingFrameLocation += ":" + position;
      }
      return this.wait("playingFrameLocations", this.currentPlayingTabId, this.currentPlayingFrameLocation);
    } else {
      return Promise.reject("Invalid argument");
    }
  }

  doSelectWindow(serialNumber) {
    let self = this;
    return this.wait("playingTabNames", serialNumber)
      .then(function() {
        self.currentPlayingTabId = self.playingTabNames[serialNumber];
        browser.tabs.update(self.currentPlayingTabId, {active: true});
      });
  }

  doClose() {
    let removingTabId = this.currentPlayingTabId;
    this.currentPlayingTabId = -1;
    delete this.playingFrameLocations[removingTabId];
    return browser.tabs.remove(removingTabId);
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

  updateOrCreateTab() {
    let self = this;
    return browser.tabs.query({
      windowId: self.currentPlayingWindowId,
      active: true
    }).then(function(tabs) {
      if (tabs.length === 0) {
        return browser.windows.create({
          url: browser.runtime.getURL("/assets/bootstrap.html")
        }).then(function (window) {
          self.setFirstTab(window.tabs[0]);
          self.contentWindowId = window.id;
          recorder.setOpenedWindow(window.id);
          browser.runtime.getBackgroundPage()
            .then(function(backgroundWindow) {
              backgroundWindow.master[window.id] = recorder.getSelfWindowId();
            });
        });
      } else {
        let tabInfo = null;
        return browser.tabs.update(tabs[0].id, {
          url: browser.runtime.getURL("/assets/bootstrap.html")
        }).then(function(tab) {
          tabInfo = tab;
          return self.wait("playingTabStatus", tab.id);
        }).then(function() {
          // Firefox did not update url information when tab is updated
          // We assign url manually and go to set first tab
          tabInfo.url = browser.runtime.getURL("/assets/bootstrap.html");
          self.setFirstTab(tabInfo);
        });
      }
    });
  }

  setFirstTab(tab) {
    if (!tab || (tab.url && this.isAddOnPage(tab.url))) {
      return this.updateOrCreateTab();
    } else {
      this.currentPlayingTabId = tab.id;
      this.playingTabNames["win_ser_local"] = this.currentPlayingTabId;
      this.playingTabIds[this.currentPlayingTabId] = "win_ser_local";
      this.playingFrameLocations[this.currentPlayingTabId] = {};
      this.playingFrameLocations[this.currentPlayingTabId]["root"] = 0;
      // we assume that there has an "open" command
      // select Frame directly will cause failed
      this.playingTabStatus[this.currentPlayingTabId] = true;
    }
  }

  isAddOnPage(url) {
    if (url.startsWith("https://addons.mozilla.org") ||
      url.startsWith("https://chrome.google.com/webstore")) {
      return true;
    }
    return false;
  }
}

export function isExtCommand(command) {
  switch(command) {
    case "pause":
    case "open":
    case "selectFrame":
    case "selectWindow":
    case "setSpeed":
    case "close":
      return true;
    default:
      return false;
  }
}
