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

import eio from 'engine.io-client'
import BackgroundRecorder from './recorder'
import WindowSession from './window-session'
import { select, cancelSelect } from './select'

const windowSession = new WindowSession()
const socket = eio(window.socketUrl || 'ws://localhost:4445')

const record = (command, target, value, insertBeforeLastCommand) => {
  window.hasRecorded = true
  return socket.send(
    JSON.stringify({
      type: 'record',
      payload: {
        command,
        target,
        value,
        insertBeforeLastCommand,
      },
    })
  )
}

const recordOpensWindow = windowHandleName => {
  return socket.send(
    JSON.stringify({
      type: 'recordOpensWindow',
      payload: {
        windowHandleName,
      },
    })
  )
}

const hasRecorded = () => window.hasRecorded

window.recorder = new BackgroundRecorder(
  windowSession,
  record,
  recordOpensWindow,
  hasRecorded
)

const attach = ({ sessionId, hasRecorded = false }) => {
  window.hasRecorded = hasRecorded
  return window.recorder.attach(sessionId)
}

const detach = () => window.recorder.detach()

const selectElement = async (sessionId, windowName) => {
  let tab
  Object.keys(windowSession.openedTabIds[sessionId]).forEach(tabId => {
    if (windowSession.openedTabIds[sessionId][tabId] === windowName) {
      tab = tabId
    }
  })
  if (!tab) {
    throw new Error(`'${windowName}' does not exists in session '${sessionId}'`)
  }

  return await select(parseInt(tab))
}

socket.on('open', () => {
  socket.on('message', data => {
    const { type, payload } = JSON.parse(data)
    if (type === 'attach') {
      attach(payload)
    } else if (type === 'detach') {
      detach()
    } else if (type === 'select') {
      selectElement(payload.sessionId, payload.windowName)
        .then(result => {
          return socket.send(
            JSON.stringify({
              type: 'select',
              payload: {
                result,
              },
            })
          )
        })
        .catch(error => {
          return socket.send(
            JSON.stringify({
              type: 'select',
              payload: {
                error: true,
                message: error.message,
              },
            })
          )
        })
    } else if (type === 'cancelSelect') {
      cancelSelect()
    }
  })
})
