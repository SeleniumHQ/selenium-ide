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
import PlaybackState from "../../stores/view/PlaybackState";
import ModalState from "../../stores/view/ModalState";
import { TargetTypes } from "../../models/Command";
import Region from "../../models/Region";

export function find(target) {
  try{
    browser.tabs.query({
      active: true,
      windowId: window.contentWindowId
    }).then((tabs) => {
      if (!tabs.length) {
        console.log("No match tabs");
      } else {
        const region = new Region(target);
        browser.tabs.sendMessage(tabs[0].id, {
          showElement: true,
          targetValue: region.isValid() ? region.toJS() : target
        }).then((response) => {
          if (response && response.result === "element not found") {
            ModalState.showAlert({
              title: "Element not found",
              description: `Could not find ${target} on the page`,
              confirmLabel: "Close"
            });
          }
        });
      }
    });
  } catch (e) {
    console.error(e);
  }
}

export function select(type, rect) {
  const tabConnectionFailure = () => {
    ModalState.showAlert({
      title: "Can't connect to tab",
      description: "Make sure the tab begins with `http://`, or try to refresh the tab.",
      confirmLabel: "Close"
    });
    UiState.setSelectingTarget(false);
  };
  UiState.setSelectingTarget(!UiState.isSelectingTarget);
  if (!UiState.isSelectingTarget) {
    browser.tabs.query({
      active: true,
      windowId: window.contentWindowId
    }).then(function(tabs) {
      browser.tabs.sendMessage(tabs[0].id, {selectMode: true, selecting: false}).catch(tabConnectionFailure);
    }).catch(function(reason) {
      console.log(reason);
    });
  } else {
    PlaybackState.stopPlaying();
    browser.tabs.query({
      active: true,
      windowId: window.contentWindowId
    }).then(function(tabs) {
      if (tabs.length === 0) {
        console.log("No match tabs");
        UiState.setSelectingTarget(false);
      } else {
        if (type === TargetTypes.LOCATOR) {
          browser.tabs.sendMessage(tabs[0].id, {selectMode: true, selecting: true, element: true}).catch(tabConnectionFailure);
        } else if (type === TargetTypes.REGION) {
          browser.tabs.sendMessage(tabs[0].id, {selectMode: true, selecting: true, region: true, rect: new Region(rect).toJS()}).catch(tabConnectionFailure);
        }
      }
    });
  }
}

export function selectTarget(target) {
  UiState.setSelectingTarget(false);
  if (UiState.selectedCommand) {
    UiState.selectedCommand.setTarget(target[0][0]);
  } else if (UiState.selectedTest.test) {
    const command = UiState.selectedTest.test.createCommand();
    command.setTarget(target[0][0]);
  }
}

export function endSelection(tabId) {
  UiState.setSelectingTarget(false);
  browser.tabs.sendMessage(tabId, {selectMode: true, selecting: false});
}
