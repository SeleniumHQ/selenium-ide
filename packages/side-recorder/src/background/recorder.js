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

import browser from 'webextension-polyfill'

export default class BackgroundRecorder {
  constructor(windowSession, record, recordOpensWindow, hasRecorded) {
    // The only way to know if a tab is recordable is to assume it is, and verify it sends a record
    // In order to do that we need to optimistically attach the recorder to all tabs, and try to
    // remove it, even if it's in a priviledged tab
    this.windowSession = windowSession
    this.lastAttachedTabId = undefined
    this.lastActivatedTabId = undefined
    this.isAttaching = false
    this.attached = false
    this.record = record
    this.recordOpensWindow = recordOpensWindow
    this.hasRecorded = hasRecorded
    this.rebind()
    if (browser && browser.runtime && browser.runtime.onMessage) {
      browser.runtime.onMessage.addListener(this.attachRecorderRequestHandler)
      browser.runtime.onMessage.addListener(this.setWindowHandleHandler)
      browser.runtime.onMessage.addListener(this.setActiveContext)
    }
  }

  async attachToTab(tabId) {
    await browser.tabs.sendMessage(tabId, { attachRecorder: true })
  }

  async detachFromTab(tabId) {
    await browser.tabs
      .sendMessage(tabId, { detachRecorder: true })
      .catch(() => {
        // the tab was deleted during the test, ignoring
      })
  }

  async reattachToTab(tabId) {
    if (tabId !== this.lastAttachedTabId) {
      if (this.lastAttachedTabId && this.lastAttachedTabId !== tabId) {
        await this.detachFromTab(this.lastAttachedTabId)
      }
      try {
        await this.attachToTab(tabId)
      } catch (e) {
        // tab was created by onCreatedNavigationTarget
        // its not in ready state, but we know it will
        // bootstrap once it is ready
        // so we set the last attached tabId anyway
      }
      this.lastAttachedTabId = tabId
    }
  }

  // TODO: rename method
  tabsOnActivatedHandler(activeInfo) {
    this.lastActivatedTabId = activeInfo.tabId
    if (!this.sessionId) {
      return
    }
    if (!this.windowSession.openedTabIds[this.sessionId]) {
      return
    }

    if (
      this.windowSession.openedTabIds[this.sessionId] &&
      this.doesTabBelongToRecording(activeInfo.tabId)
    ) {
      this.reattachToTab(activeInfo.tabId)
    }

    // Because event listener is so fast that selectWindow command is added
    // before other commands like clicking a link to browse in new tab.
    // Delay a little time to add command in order.
    setTimeout(() => {
      if (
        this.windowSession.currentUsedTabId[this.sessionId] ===
          activeInfo.tabId &&
        this.windowSession.currentUsedWindowId[this.sessionId] ===
          activeInfo.windowId
      )
        return
      // If no command has been recorded, ignore selectWindow command
      // until the user has select a starting page to record the commands
      if (!this.hasRecorded()) return
      // Ignore all unknown tabs, the activated tab may not derived from
      // other opened tabs, or it may managed by other SideeX panels
      if (
        this.windowSession.openedTabIds[this.sessionId][activeInfo.tabId] ==
        undefined
      )
        return
      // Tab information has existed, add selectWindow command
      this.windowSession.currentUsedTabId[this.sessionId] = activeInfo.tabId
      this.windowSession.currentUsedWindowId[this.sessionId] =
        activeInfo.windowId
      this.windowSession.currentUsedFrameLocation[this.sessionId] = 'root'
      this.record(
        'selectWindow',
        [
          [
            `handle=\${${
              this.windowSession.openedTabIds[this.sessionId][activeInfo.tabId]
            }}`,
          ],
        ],
        ''
      )
    }, 150)
  }

  windowsOnFocusChangedHandler(windowId) {
    if (!this.sessionId) {
      return
    }
    if (!this.windowSession.openedTabIds[this.sessionId]) {
      return
    }

    if (windowId === browser.windows.WINDOW_ID_NONE) {
      // In some Linux window managers, WINDOW_ID_NONE will be listened before switching
      // See MDN reference :
      // https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/windows/onFocusChanged
      return
    }

    browser.tabs
      .query({
        windowId: windowId,
        active: true,
      })
      .then(tabs => {
        const tab = tabs[0]
        this.lastActivatedTabId = tab.id
        if (
          this.windowSession.openedTabIds[this.sessionId] &&
          this.doesTabBelongToRecording(tab.id)
        ) {
          this.reattachToTab(tab.id)
        }
      })

    // If the activated window is the same as the last, just do nothing
    // selectWindow command will be handled by tabs.onActivated listener
    // if there also has a event of switching a activated tab
    if (this.windowSession.currentUsedWindowId[this.sessionId] === windowId)
      return

    browser.tabs
      .query({
        windowId: windowId,
        active: true,
      })
      .then(tabs => {
        if (tabs.length === 0 || this.isPrivilegedPage(tabs[0].url)) {
          return
        }

        // The activated tab is not the same as the last
        if (
          tabs[0].id !== this.windowSession.currentUsedTabId[this.sessionId]
        ) {
          // If no command has been recorded, ignore selectWindow command
          // until the user has select a starting page to record commands
          if (!this.hasRecorded()) return

          // Ignore all unknown tabs, the activated tab may not derived from
          // other opened tabs, or it may managed by other SideeX panels
          if (
            this.windowSession.openedTabIds[this.sessionId][tabs[0].id] ==
            undefined
          )
            return

          // Tab information has existed, add selectWindow command
          this.windowSession.currentUsedWindowId[this.sessionId] = windowId
          this.windowSession.currentUsedTabId[this.sessionId] = tabs[0].id
          this.windowSession.currentUsedFrameLocation[this.sessionId] = 'root'
          this.record(
            'selectWindow',
            [
              [
                `handle=\${${
                  this.windowSession.openedTabIds[this.sessionId][tabs[0].id]
                }}`,
              ],
            ],
            ''
          )
        }
      })
  }

  tabsOnRemovedHandler(tabId, _removeInfo) {
    if (!this.sessionId) {
      return
    }
    if (!this.windowSession.openedTabIds[this.sessionId]) {
      return
    }

    if (this.windowSession.openedTabIds[this.sessionId][tabId] != undefined) {
      if (this.windowSession.currentUsedTabId[this.sessionId] !== tabId) {
        this.record(
          'selectWindow',
          [
            [
              `handle=\${${this.windowSession.openedTabIds[this.sessionId][tabId]}}`,
            ],
          ],
          ''
        )
        this.record('close', '', '')
        this.record(
          'selectWindow',
          [
            [
              `handle=\${${
                this.windowSession.openedTabIds[this.sessionId][
                  this.windowSession.currentUsedTabId[this.sessionId]
                ]
              }}`,
            ],
          ],
          ''
        )
      } else {
        this.record('close', '', '')
      }
      delete this.windowSession.openedTabIds[this.sessionId][tabId]
      this.windowSession.currentUsedFrameLocation[this.sessionId] = 'root'
    }
  }

  webNavigationOnCreatedNavigationTargetHandler(details) {
    // we can't necessarily know that this will indicate a tab being
    // activated, and we hope tabs.onActivated will get called for us
    if (!this.sessionId) return
    if (
      this.windowSession.openedTabIds[this.sessionId][details.sourceTabId] !=
      undefined
    ) {
      this.windowSession.openedTabIds[this.sessionId][
        details.tabId
      ] = `win${Math.floor(Math.random() * 10000)}`
      this.recordOpensWindow(
        this.windowSession.openedTabIds[this.sessionId][details.tabId]
      )
      if (details.windowId != undefined) {
        this.windowSession.setOpenedWindow(details.windowId)
      } else {
        // Google Chrome does not support windowId.
        // Retrieve windowId from tab information.
        browser.tabs.get(details.tabId).then(tabInfo => {
          this.windowSession.setOpenedWindow(tabInfo.windowId)
        })
      }
      this.windowSession.openedTabCount[this.sessionId]++
      if (
        this.lastAttachedTabId !== this.lastActivatedTabId &&
        this.lastActivatedTabId === details.tabId
      ) {
        this.reattachToTab(details.tabId)
      }
    }
  }

  attachRecorderRequestHandler(message, sender, sendResponse) {
    if (message.attachRecorderRequest) {
      if (this.doesTabBelongToRecording(sender.tab.id)) {
        return sendResponse(this.attached)
      }
      return sendResponse(false)
    }
  }

  setWindowHandleHandler(message, sender, sendResponse) {
    if (message.setWindowHandle) {
      if (!this.windowSession.openedTabIds[message.sessionId]) {
        this.initSession(sender.tab, message.sessionId)
      }
      this.windowSession.openedTabIds[message.sessionId][sender.tab.id] =
        message.handle
      if (sender.tab.windowId != undefined) {
        this.windowSession.setOpenedWindow(sender.tab.windowId)
      } else {
        // Google Chrome does not support windowId.
        // Retrieve windowId from tab information.
        browser.tabs.get(sender.tab.id).then(tabInfo => {
          this.windowSession.setOpenedWindow(tabInfo.windowId)
        })
      }
      this.windowSession.openedTabCount[message.sessionId]++
      return sendResponse(true)
    }
  }

  setActiveContext(message, sender, sendResponse) {
    if (message.setActiveContext) {
      const { sessionId, frameLocation } = message
      this.windowSession.currentUsedFrameLocation[sessionId] = frameLocation
      this.windowSession.currentUsedTabId[sessionId] = sender.tab.id

      if (sender.tab.windowId != undefined) {
        this.windowSession.currentUsedWindowId[sessionId] = sender.tab.windowId
      } else {
        // Google Chrome does not support windowId.
        // Retrieve windowId from tab information.
        browser.tabs.get(sender.tab.id).then(tabInfo => {
          this.windowSession.currentUsedWindowId[sessionId] = tabInfo.windowId
        })
      }
      return sendResponse(true)
    }
  }

  addCommandMessageHandler(message, sender, sendResponse) {
    if (message.frameRemoved) {
      browser.tabs.sendMessage(sender.tab.id, {
        recalculateFrameLocation: true,
      })
      return sendResponse(true)
    }
    if (
      !message.command ||
      this.windowSession.openedWindowIds[sender.tab.windowId] == undefined
    ) {
      return
    }
    sendResponse(true)

    if (!this.hasRecorded()) {
      this.record('open', sender.tab.url, '')
    }

    if (
      this.windowSession.openedTabIds[this.sessionId][sender.tab.id] ==
      undefined
    )
      return

    if (this.windowSession.currentUsedTabId[this.sessionId] != sender.tab.id) {
      this.windowSession.currentUsedTabId[this.sessionId] = sender.tab.id
      this.windowSession.currentUsedWindowId[this.sessionId] =
        sender.tab.windowId
      this.windowSession.currentUsedFrameLocation[this.sessionId] = 'root'
      this.record(
        'selectWindow',
        [
          [
            `handle=\${${
              this.windowSession.openedTabIds[this.sessionId][sender.tab.id]
            }}`,
          ],
        ],
        ''
      )
    }

    if (
      message.frameLocation !==
      this.windowSession.currentUsedFrameLocation[this.sessionId]
    ) {
      let newFrameLevels = message.frameLocation.split(':')
      let oldFrameLevels = this.windowSession.currentUsedFrameLocation[
        this.sessionId
      ].split(':')
      while (oldFrameLevels.length > newFrameLevels.length) {
        this.record('selectFrame', 'relative=parent', '')
        oldFrameLevels.pop()
      }
      while (
        oldFrameLevels.length != 0 &&
        oldFrameLevels[oldFrameLevels.length - 1] !=
          newFrameLevels[oldFrameLevels.length - 1]
      ) {
        this.record('selectFrame', 'relative=parent', '')
        oldFrameLevels.pop()
      }
      while (oldFrameLevels.length < newFrameLevels.length) {
        this.record(
          'selectFrame',
          'index=' + newFrameLevels[oldFrameLevels.length],
          ''
        )
        oldFrameLevels.push(newFrameLevels[oldFrameLevels.length])
      }
      this.windowSession.currentUsedFrameLocation[this.sessionId] =
        message.frameLocation
    }

    this.sendRecordNotification(
      sender.tab.id,
      message.command,
      message.target,
      message.value
    )
    this.record(message.command, message.target, message.value)
  }

  sendRecordNotification(tabId, command, target, value) {
    browser.tabs
      .sendMessage(
        tabId,
        {
          recordNotification: true,
          command,
          target,
          value,
        },
        {
          frameId: 0,
        }
      )
      .catch(() => {})
  }

  isPrivilegedPage(url) {
    if (
      url.substr(0, 13) == 'moz-extension' ||
      url.substr(0, 16) == 'chrome-extension'
    ) {
      return true
    }
    return false
  }

  rebind() {
    this.tabsOnActivatedHandler = this.tabsOnActivatedHandler.bind(this)
    this.windowsOnFocusChangedHandler = this.windowsOnFocusChangedHandler.bind(
      this
    )
    this.tabsOnRemovedHandler = this.tabsOnRemovedHandler.bind(this)
    this.webNavigationOnCreatedNavigationTargetHandler = this.webNavigationOnCreatedNavigationTargetHandler.bind(
      this
    )
    this.setWindowHandleHandler = this.setWindowHandleHandler.bind(this)
    this.setActiveContext = this.setActiveContext.bind(this)
    this.addCommandMessageHandler = this.addCommandMessageHandler.bind(this)
    this.attachRecorderRequestHandler = this.attachRecorderRequestHandler.bind(
      this
    )
  }

  async attach(sessionId) {
    if (this.attached || this.isAttaching) {
      return
    }
    try {
      this.isAttaching = true
      this.sessionId = sessionId
      browser.tabs.onActivated.addListener(this.tabsOnActivatedHandler)
      browser.windows.onFocusChanged.addListener(
        this.windowsOnFocusChangedHandler
      )
      browser.tabs.onRemoved.addListener(this.tabsOnRemovedHandler)
      browser.webNavigation.onCreatedNavigationTarget.addListener(
        this.webNavigationOnCreatedNavigationTargetHandler
      )
      browser.runtime.onMessage.addListener(this.addCommandMessageHandler)

      await this.attachToExistingRecording()

      this.attached = true
      this.isAttaching = false
    } catch (err) {
      this.isAttaching = false
      throw err
    }
  }

  async detach() {
    if (!this.attached) {
      return
    }
    await this.detachFromTab(this.lastAttachedTabId)
    this.lastAttachedTabId = undefined
    this.attached = false
    browser.tabs.onActivated.removeListener(this.tabsOnActivatedHandler)
    browser.windows.onFocusChanged.removeListener(
      this.windowsOnFocusChangedHandler
    )
    browser.tabs.onRemoved.removeListener(this.tabsOnRemovedHandler)
    browser.webNavigation.onCreatedNavigationTarget.removeListener(
      this.webNavigationOnCreatedNavigationTargetHandler
    )
    browser.runtime.onMessage.removeListener(this.addCommandMessageHandler)
  }

  // this will attempt to connect to a previous recording
  // else it will create a new window for recording
  async attachToExistingRecording() {
    if (this.windowSession.currentUsedWindowId[this.sessionId]) {
      // test was recorded before and has a dedicated window
      const win = await browser.windows.update(
        this.windowSession.currentUsedWindowId[this.sessionId],
        {
          focused: true,
        }
      )
      const tab = (await browser.tabs.query({
        windowId: win.id,
        active: true,
      }))[0]
      this.windowSession.currentUsedTabId[this.sessionId] = tab.id
      this.reattachToTab(tab.id)
    } else if (
      this.windowSession.generalUseLastPlayedTestCaseId === this.sessionId
    ) {
      // the last played test was the one the user wishes to record now
      this.windowSession.dedicateGeneralUseSession(this.sessionId)
      await browser.windows.update(
        this.windowSession.currentUsedWindowId[this.sessionId],
        {
          focused: true,
        }
      )
    } else {
      // the test was never recorded before, nor it was the last test ran
      await this.getRecordingWindow()
      await this.attachToTab(this.lastAttachedTabId)
    }
  }

  async getRecordingWindow() {
    const windows = await browser.windows.getAll({
      populate: true,
      windowTypes: ['normal'],
    })
    const win = windows[0]
    const tab = win.tabs.find(tab => tab.active)
    this.lastAttachedTabId = tab.id

    this.initSession(tab, this.sessionId)
    this.windowSession.openedTabCount[this.sessionId] = 1
  }

  initSession(tab, sessionId) {
    this.windowSession.setOpenedWindow(tab.windowId)
    this.windowSession.openedTabIds[sessionId] = {}

    this.windowSession.currentUsedFrameLocation[sessionId] = 'root'
    this.windowSession.currentUsedTabId[sessionId] = tab.id
    this.windowSession.currentUsedWindowId[sessionId] = tab.windowId
    this.windowSession.openedTabIds[sessionId][tab.id] = 'root'
    this.windowSession.openedTabCount[sessionId] = 0
  }

  doesTabBelongToRecording(tabId) {
    return (
      this.windowSession.openedTabIds[this.sessionId] &&
      Object.keys(this.windowSession.openedTabIds[this.sessionId]).includes(
        `${tabId}`
      )
    )
  }
}
