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

const DEBUGGER_PROTOCOL_VERSION = '1.3'

export default class Debugger {
  constructor(tabId) {
    this.tabId = tabId
    this.attach = this.attach.bind(this)
    this.detach = this.detach.bind(this)
    this.sendCommand = this.sendCommand.bind(this)
    this.getDocument = this.getDocument.bind(this)
    this.querySelector = this.querySelector.bind(this)
  }
  attach() {
    return new Promise(res => {
      if (!this.connection) {
        const target = { tabId: this.tabId }
        chrome.debugger.attach(target, DEBUGGER_PROTOCOL_VERSION, () => {
          this.connection = target
          res(this.connection)
        })
      } else {
        res(this.connection)
      }
    })
  }

  detach() {
    return new Promise(res => {
      if (this.connection) {
        chrome.debugger.detach(this.connection, () => {
          this.connection = undefined
          res()
        })
      } else {
        res()
      }
    })
  }

  sendCommand(command, params) {
    return new Promise((res, rej) => {
      chrome.debugger.sendCommand(this.connection, command, params, r => {
        if (chrome.runtime.lastError && chrome.runtime.lastError.message) {
          rej(new Error(chrome.runtime.lastError.message))
        } else {
          res(r)
        }
      })
    })
  }

  getDocument() {
    return this.sendCommand('DOM.getDocument', {
      pierce: true,
      depth: -1,
    }).then(doc => doc.root)
  }

  querySelector(selector, nodeId) {
    return this.sendCommand('DOM.querySelector', {
      selector,
      nodeId,
    }).then(res => res && res.nodeId)
  }

  getFrameTree() {
    return this.sendCommand('Page.getFrameTree').then(doc => doc.frameTree)
  }

  static getFrameId(frameTree, frameIndices) {
    if (frameIndices.length === 1) {
      return frameTree[frameIndices.shift()].frame.id
    } else {
      return this.getFrameId(
        frameTree[frameIndices.shift()].childFrames,
        frameIndices
      )
    }
  }
}

export function convertLocator(locator) {
  const [type, selector] = locator.split('=')
  switch (type) {
    case 'id': {
      return `#${selector}`
    }
    case 'name': {
      return `*[name="${selector}"]`
    }
    case 'css': {
      return selector
    }
  }
  throw new Error('This locator type is unavailable with this command')
}
