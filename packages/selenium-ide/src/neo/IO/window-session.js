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

export class WindowSession {
  // tabs opened during IDE session
  openedTabIds = {};
  // number of tabs opened during IDE session (for select window #)
  openedTabCount = {};
  // windows opened during IDE session
  openedWindowIds = {};

  currentRecordingTabId = {};
  currentRecordingWindowId = {};
  currentRecordingFrameLocation = {};

  // window to use for general playback (not dedicated to a specific test)
  generalUsePlayingWindowId = undefined;

  // IDE panel id
  ideWindowId = undefined;

  // set window as opened in the session
  setOpenedWindow(windowId) {
    this.openedWindowIds[windowId] = true;
  }
}

if (!window._windowSession) window._windowSession = new WindowSession();

export default window._windowSession;
