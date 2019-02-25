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
import FatalError from '../errors/fatal'
import NoResponseError from '../errors/no-response'
import Manager from './manager'

export function sendMessage(id, payload) {
  return browser.runtime
    .sendMessage(id, JSON.parse(JSON.stringify(payload)))
    .then(response => {
      if (response === undefined || response === null) {
        return Promise.reject(
          new NoResponseError(
            `${Manager.getPlugin(id).name} plugin did not respond`
          )
        )
      } else if (response.error) {
        const error =
          response.status === 'fatal'
            ? new FatalError(response.error)
            : new Error(response.error)
        error.sender = id
        return Promise.reject(error)
      } else {
        const r = {}
        if (typeof response === 'string') {
          r.message = response
        } else if (response instanceof Object) {
          Object.assign(r, response)
        }
        r.sender = id
        return Promise.resolve(r)
      }
    })
    .catch(response => {
      if (isReceivingEndError(response)) {
        return Promise.reject(
          new NoResponseError(
            `${Manager.getPlugin(id).name} plugin did not respond`
          )
        )
      } else {
        return Promise.reject(response)
      }
    })
}

function isReceivingEndError(reason) {
  return (
    reason ==
      'Error: Could not establish connection. Receiving end does not exist.' ||
    // Below message is for Google Chrome
    reason.message ==
      'Could not establish connection. Receiving end does not exist.' ||
    // Google Chrome misspells "response"
    reason.message ==
      'The message port closed before a reponse was received.' ||
    reason.message == 'The message port closed before a response was received.'
  )
}
