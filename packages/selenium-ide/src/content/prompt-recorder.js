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

export function attach(record) {
  if (window === window.top) {
    window.addEventListener('message', function(event) {
      if (
        event.source.top == window &&
        event.data &&
        event.data.direction == 'from-page-script'
      ) {
        if (event.data.recordedType) {
          switch (event.data.recordedType) {
            case 'prompt':
              if (event.data.recordedResult != null) {
                record(
                  'answerOnNextPrompt',
                  [[event.data.recordedResult]],
                  '',
                  true,
                  event.data.frameLocation
                )
              } else {
                record(
                  'chooseCancelOnNextPrompt',
                  [['']],
                  '',
                  true,
                  event.data.frameLocation
                )
              }
              record(
                'assertPrompt',
                [[event.data.recordedMessage]],
                '',
                false,
                event.data.frameLocation
              )
              if (event.data.recordedResult != null) {
                record(
                  'webdriverAnswerOnVisiblePrompt',
                  [[event.data.recordedResult]],
                  '',
                  false,
                  event.data.frameLocation
                )
              } else {
                record(
                  'webdriverChooseCancelOnVisiblePrompt',
                  [['']],
                  '',
                  false,
                  event.data.frameLocation
                )
              }
              break
            case 'confirm':
              if (event.data.recordedResult == true) {
                record(
                  'chooseOkOnNextConfirmation',
                  [['']],
                  '',
                  true,
                  event.data.frameLocation
                )
              } else {
                record(
                  'chooseCancelOnNextConfirmation',
                  [['']],
                  '',
                  true,
                  event.data.frameLocation
                )
              }
              record(
                'assertConfirmation',
                [[event.data.recordedMessage]],
                '',
                false,
                event.data.frameLocation
              )
              if (event.data.recordedResult == true) {
                record(
                  'webdriverChooseOkOnVisibleConfirmation',
                  [['']],
                  '',
                  false,
                  event.data.frameLocation
                )
              } else {
                record(
                  'webdriverChooseCancelOnVisibleConfirmation',
                  [['']],
                  '',
                  false,
                  event.data.frameLocation
                )
              }
              break
            case 'alert':
              //record("answerOnNextAlert",[[event.data.recordedResult]],"",true);
              record(
                'assertAlert',
                [[event.data.recordedMessage]],
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
