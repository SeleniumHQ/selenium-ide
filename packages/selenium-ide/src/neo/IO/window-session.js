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

export class WindowSession {
  // tabs opened during IDE session
  openedTabIds = {};
  // number of tabs opened during IDE session (for select window #)
  openedTabCount = {};
  // windows opened during IDE session
  openedWindowIds = {};

  // tab count for the recording indicator
  frameCountForTab = {};

  currentUsedTabId = {};
  currentUsedWindowId = {};
  currentUsedFrameLocation = {};

  // window to use for general playback (not dedicated to a specific test)
  generalUsePlayingWindowId = undefined;
  generalUseIdentifier = "GENERAL_USE_IDENTIFIER";

  // the last test case id that was played back using the general use window
  generalUseLastPlayedTestCaseId = undefined;

  // IDE panel id
  ideWindowId = undefined;

  // set window as opened in the session
  setOpenedWindow(windowId) {
    this.openedWindowIds[windowId] = true;
    browser.runtime.getBackgroundPage().then(backgroundWindow => {
      backgroundWindow.openedWindowIds.push(windowId);
    });
  }

  getTabIdsByIdentifier(identifier) {
    return Object.keys(this.openedTabIds[identifier]).map(i => parseInt(i));
  }

  // dedicates all the general used tabs to a specific identifier
  dedicateGeneralUseSession(identifier) {
    this.openedTabIds[identifier] = this.openedTabIds[this.generalUseIdentifier];
    delete this.openedTabIds[this.generalUseIdentifier];
    this.openedTabCount[identifier] = this.openedTabCount[this.generalUseIdentifier];
    delete this.openedTabCount[this.generalUseIdentifier];
    this.currentUsedTabId[identifier] = this.currentUsedTabId[this.generalUseIdentifier];
    delete this.currentUsedTabId[this.generalUseIdentifier];
    this.currentUsedWindowId[identifier] = this.currentUsedWindowId[this.generalUseIdentifier];
    delete this.currentUsedWindowId[this.generalUseIdentifier];
    this.currentUsedFrameLocation[identifier] = this.currentUsedFrameLocation[this.generalUseIdentifier];
    delete this.currentUsedFrameLocation[this.generalUseIdentifier];
    this.generalUseLastPlayedTestCaseId = undefined;
  }

  // removes all tabs from test case except the first one available
  async removeSecondaryTabs(identifier) {
    const tabsIds = this.getTabIdsByIdentifier(identifier);
    const tabs = [];
    for (let tabId of tabsIds) {
      try {
        tabs.push(await browser.tabs.get(tabId));
      } catch(e) { // eslint-disable-line no-empty
      }
    }
    if (tabs.length) {
      // remove all tabs except the first in the window
      await browser.tabs.remove(tabs.map(tab => tab.id).slice(1));
      this.currentUsedTabId[identifier] = tabs[0].id;
      this.currentUsedFrameLocation[identifier] = "root";
      this.openedTabCount[identifier] = 1;
      this.openedTabIds[identifier] = {
        [tabs[0].id]: "win_ser_local"
      };
    }
  }

  async closeAllOpenedWindows() {
    const windowIds = Object.keys(this.openedWindowIds).map(id => parseInt(id));
    for (let windowId of windowIds) {
      await browser.windows.remove(windowId);
    }
    this.openedWindowIds = {};
    browser.runtime.getBackgroundPage().then(backgroundWindow => {
      backgroundWindow.openedWindowIds = [];
    });
  }

  async focusIDEWindow() {
    await browser.windows.update(this.ideWindowId, {
      focused: true
    });
  }
}

if (!window._windowSession) window._windowSession = new WindowSession();

export default window._windowSession;
