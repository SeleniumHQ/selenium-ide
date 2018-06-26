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

import browser from "webextension-polyfill";

let master = {};
let clickEnabled = true;

window.master = master;

function openPanel(tab) {

  let contentWindowId = tab.windowId;
  if (master[contentWindowId] != undefined) {
    browser.windows.update(master[contentWindowId], {
      focused: true
    }).catch(function() {
      master[contentWindowId] == undefined;
      openPanel(tab);
    });
    return;
  } else if (!clickEnabled) {
    return;
  }

  clickEnabled = false;
  setTimeout(function() {
    clickEnabled = true;
  }, 1000);

  openWindowFromStorageResolution().then(function waitForPanelLoaded(panelWindowInfo) {
    return new Promise(function(resolve, reject) {
      let count = 0;
      let interval = setInterval(function() {
        if (count > 100) {
          reject("SideeX editor has no response");
          clearInterval(interval);
        }

        browser.tabs.query({
          active: true,
          windowId: panelWindowInfo.id,
          status: "complete"
        }).then(function(tabs) {
          if (tabs.length != 1) {
            count++;
            return;
          } else {
            master[contentWindowId] = panelWindowInfo.id;
            resolve(panelWindowInfo);
            clearInterval(interval);
          }
        });
      }, 200);
    });
  }).then(function bridge(panelWindowInfo){
    return browser.tabs.sendMessage(panelWindowInfo.tabs[0].id, {
      selfWindowId: panelWindowInfo.id,
      commWindowId: contentWindowId
    });
  }).catch(function(e) {
    console.log(e);
  });

}

function openWindowFromStorageResolution() {
  let size = {
    height: 690,
    width: 550
  };
  return browser.storage.local.get().then(storage => {
    if (sizeIsValid(storage.size)) {
      size.height = storage.size.height;
      size.width = storage.size.width;
    }
    return browser.windows.create(Object.assign({
      url: browser.extension.getURL("assets/index.html"),
      type: "popup"
    }, size));
  }).catch(e => {
    console.error(e);
    return browser.windows.create(Object.assign({
      url: browser.extension.getURL("assets/index.html"),
      type: "popup"
    }, size));
  });
}

function sizeIsValid(size) {
  return (size && sideIsValid(size.height) && sideIsValid(size.width));
}

function sideIsValid(number) {
  return number && number.constructor.name === "Number" && number > 50;
}

browser.browserAction.onClicked.addListener(openPanel);

browser.windows.onRemoved.addListener(function(windowId) {
  let keys = Object.keys(master);
  for (let key of keys) {
    if (master[key] === windowId) {
      delete master[key];
      if (keys.length === 1) {
        browser.contextMenus.removeAll();
      }
    }
  }
});

let port;

browser.contextMenus.onClicked.addListener(function(info) {
  port.postMessage({ cmd: info.menuItemId });
});

browser.runtime.onConnect.addListener(function(m) {
  port = m;
});

browser.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  if (!message.payload) {
    message.payload = {};
  }
  message.payload.sender = sender.id;
  browser.runtime.sendMessage(message).then(sendResponse).catch(() => {
    return sendResponse({ error: "Selenium IDE is not active" });
  });
  return true;
});

browser.runtime.onInstalled.addListener(() => {
  // Notify updates only in production
  if (process.env.NODE_ENV === "production") {
    browser.storage.local.set({
      updated: true
    });
  }
});
