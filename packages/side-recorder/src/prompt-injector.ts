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

import './prompt'
import Recorder from './recorder'

export function attach(record: Recorder['record']) {
  window.postMessage(
    {
      direction: 'from-content-script',
      attach: true,
    },
    '*'
  )
  attachPromptRecorder(record)
}

export function detach() {
  window.postMessage(
    {
      direction: 'from-content-script',
      detach: true,
    },
    '*'
  )
}

function attachPromptRecorder(record: Recorder['record']) {
  if (window === window.top) {
    window.addEventListener('message', function (event) {
      if (event.data?.direction == 'from-page-script') {
        if (event.data.recordedType) {
          switch (event.data.recordedType) {
            case 'prompt':
              record(
                event,
                'assertPrompt',
                event.data.recordedMessage,
                '',
                false,
                event.data.frameLocation
              )
              if (event.data.recordedResult != null) {
                record(
                  event,
                  'answerPrompt',
                  event.data.recordedResult,
                  '',
                  false,
                  event.data.frameLocation
                )
              } else {
                record(
                  event,
                  'dismissPrompt',
                  '',
                  '',
                  false,
                  event.data.frameLocation
                )
              }
              break
            case 'confirm':
              record(
                event,
                'assertConfirmation',
                event.data.recordedMessage,
                '',
                false,
                event.data.frameLocation
              )
              if (event.data.recordedResult == true) {
                record(
                  event,
                  'acceptConfirmation',
                  '',
                  '',
                  false,
                  event.data.frameLocation
                )
              } else {
                record(
                  event,
                  'dismissConfirmation',
                  '',
                  '',
                  false,
                  event.data.frameLocation
                )
              }
              break
            case 'alert':
              record(
                event,
                'assertAlert',
                event.data.recordedMessage,
                '',
                false,
                event.data.frameLocation
              )
              record(
                event,
                'acceptAlert',
                '',
                '',
                false,
                event.data.frameLocation
              )
              break
          }
        }
      }
    })
  }
}
