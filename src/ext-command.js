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

function ExtCommand(contentWindowId) {
  this.playingTabNames = {};
  this.playingTabIds = {};
  this.playingFrameLocations = {};
  this.playingTabCount = 1;
  this.currentPlayingTabId = -1;
  this.contentWindowId = contentWindowId ? contentWindowId : -1;
  this.currentPlayingFrameLocation = "root";
  this.waitInterval = 500;
  this.waitTimes = 60;
}

ExtCommand.prototype.doOpen = function(url) {
  return browser.tabs.update(this.currentPlayingTabId, {
    url: url
  });
};

ExtCommand.prototype.setContentWindowId = function(contentWindowId) {
  this.contentWindowId = contentWindowId;
};

ExtCommand.prototype.getContentWindowId = function(){
  return this.contentWindowId;
};

ExtCommand.prototype.init = function() {
  this.playingTabNames = {};
  this.playingTabIds = {};
  this.playingFrameLocations = {};
  this.playingTabCount = 1;
  this.currentPlayingWindowId = this.contentWindowId;
  let self = this;
  this.currentPlayingFrameLocation = "root";
  return this.queryActiveTab(this.currentPlayingWindowId)
    .then(function setFirstTab(tab) {
      self.currentPlayingTabId = tab.id;
      self.playingTabNames["win_ser_local"] = self.currentPlayingTabId;
      self.playingTabIds[self.currentPlayingTabId] = "win_ser_local";
      self.playingFrameLocations[self.currentPlayingTabId] = {};
      self.playingFrameLocations[self.currentPlayingTabId]["root"] = 0;
      // we assume that there has an "open" command
      // select Frame directly will cause failed
      self.playingFrameLocations[self.currentPlayingTabId]["status"] = true;
    }).catch(function createNewWindow(e){
      console.log(e);
      // : TODO: create a new window if not exist
    });
};

ExtCommand.prototype.getCurrentPlayingTabId = function() {
  return this.currentPlayingTabId;
};

ExtCommand.prototype.getCurrentPlayingFrameLocation = function() {
  return this.currentPlayingFrameLocation;
};

ExtCommand.prototype.getFrame = function (tabId) {
  if (tabId)
    return this.playingFrameLocations[tabId][this.currentPlayingFrameLocation];
  return this.playingFrameLocations[this.currentPlayingTabId][this.currentPlayingFrameLocation];
};

ExtCommand.prototype.doPause = function(ignored, milliseconds) {
  return new Promise(function(resolve) {
    setTimeout(resolve, milliseconds);
  });
};

ExtCommand.prototype.doSelectFrame = function(frameLocation) {
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
};

ExtCommand.prototype.doSelectWindow = function(serialNumber) {
  let self = this;
  return this.wait("playingTabNames", serialNumber)
    .then(function() {
      self.currentPlayingTabId = self.playingTabNames[serialNumber];
      browser.tabs.update(self.currentPlayingTabId, {active: true});
    });
};

ExtCommand.prototype.doSetWindowSize = function(_, size) {
  const [width, height] = size.split(",").map((s) => parseInt(s));
  let tabId = this.getCurrentPlayingTabId();
  let frameId = this.getFrame();
  const compensatedSize = {};
  return browser.tabs.sendMessage(tabId, {
    compensateSize: true
  }, { frameId: top ? 0 : frameId }).then(compensation => {
    compensatedSize.width = width + compensation.width;
    compensatedSize.height = height + compensation.height;
    return browser.windows.update(this.currentPlayingWindowId, compensatedSize);
  }).then(() => this.fixInaccuracies({
    wantedSize: {
      width,
      height
    },
    compensatedSize
  }));
};

ExtCommand.prototype.fixInaccuracies = function(sizes, retries = 3) {
  return new Promise((resolve, reject) => {
    if (!retries) return reject("Can not accurately set viewport size");
    let tabId = this.getCurrentPlayingTabId();
    let frameId = this.getFrame();
    return browser.tabs.sendMessage(tabId, {
      getSize: true
    }, { frameId: top ? 0 : frameId }).then(actualSize => {
      if (actualSize.width === sizes.wantedSize.width && actualSize.height === sizes.wantedSize.height) {
        return resolve(true);
      } else {
        let resizedWidth = sizes.compensatedSize.width + (sizes.wantedSize.width - actualSize.width);
        let resizedHeight = sizes.compensatedSize.height + (sizes.wantedSize.height - actualSize.height);
        return browser.windows.update(this.currentPlayingWindowId, {
          width: resizedWidth,
          height: resizedHeight
        }).then(() => this.fixInaccuracies({
          compensatedSize: {
            height: resizedHeight,
            width: resizedWidth
          },
          wantedSize: sizes.wantedSize
        }, --retries));
      }
    });
  });
};

ExtCommand.prototype.doClose = function() {
  let removingTabId = this.currentPlayingTabId;
  this.currentPlayingTabId = -1;
  delete this.playingFrameLocations[removingTabId];
  return browser.tabs.remove(removingTabId);
};

ExtCommand.prototype.wait = function(...properties) {
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
      if (ref[inspecting] == undefined) {
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
};

ExtCommand.prototype.getPageStatus = function() {
  return this.playingFrameLocations[this.getCurrentPlayingTabId()]["status"];
};

ExtCommand.prototype.queryActiveTab = function (windowId) {
  return browser.tabs.query({windowId: windowId, active: true, url: "<all_urls>"})
    .then(function(tabs) {
      if (!tabs.length)
        return Promise.reject("No matched Tab");
      return tabs[0];
    });
};

ExtCommand.prototype.sendMessage = function(command, target, value, top) {
  let tabId = this.getCurrentPlayingTabId();
  let frameId = this.getFrame();
  return browser.tabs.sendMessage(tabId, {
    commands: command,
    target: target,
    value: value
  }, { frameId: top ? 0 : frameId });
};

function isExtCommand(command) {
  switch(command) {
    case "pause":
      //case "open":
    case "selectFrame":
    case "selectWindow":
    case "setWindowSize":
    case "close":
      return true;
    default:
      return false;
  }
}

ExtCommand.prototype.setLoading = function(tabId) {
  // Does clearing the object will cause some problem(e.g. missing the frameId)?
  // Ans: Yes, but I don't know why
  this.initTabInfo(tabId);
  // this.initTabInfo(tabId, true); (failed)
  this.playingFrameLocations[tabId]["status"] = false;
};

ExtCommand.prototype.setComplete = function(tabId) {
  this.initTabInfo(tabId);
  this.playingFrameLocations[tabId]["status"] = true;
};

ExtCommand.prototype.initTabInfo = function(tabId, forced) {
  if (!this.playingFrameLocations[tabId] | forced) {
    this.playingFrameLocations[tabId] = {};
    this.playingFrameLocations[tabId]["root"] = 0;
  }
};

ExtCommand.prototype.setFrame = function(tabId, frameLocation, frameId) {
  this.playingFrameLocations[tabId][frameLocation] = frameId;
};

ExtCommand.prototype.hasTab = function(tabId) {
  return this.playingTabIds[tabId];
};

ExtCommand.prototype.setNewTab = function(tabId) {
  this.playingTabNames["win_ser_" + this.playingTabCount] = tabId;
  this.playingTabIds[tabId] = "win_ser_" + this.playingTabCount;
  this.playingTabCount++;
};
